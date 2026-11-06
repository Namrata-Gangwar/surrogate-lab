"""Train and export a pointwise von Mises stress model.

Expected input: ml/data.csv with columns design_id,P,T,W,H,R,x,y,z,vm.
Rows from each design stay together during the train/test split to prevent leakage.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import StandardScaler
from torch import nn

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(__file__).with_name("data.csv")
OUT = ROOT / "public"
FEATURES = ["P", "T", "W", "H", "R", "x", "y", "z"]


def main() -> None:
    if not DATA.exists():
        raise SystemExit("Missing ml/data.csv. Add node-level FEA data; see ml/README.md.")
    df = pd.read_csv(DATA)
    required = {"design_id", *FEATURES, "vm"}
    missing = required - set(df.columns)
    if missing:
        raise SystemExit(f"Dataset is missing columns: {', '.join(sorted(missing))}")
    if df[list(required)].isna().any().any():
        raise SystemExit("Dataset contains missing values in required columns.")

    x = df[FEATURES].to_numpy(dtype=np.float32)
    y = df[["vm"]].to_numpy(dtype=np.float32)
    groups = df["design_id"].to_numpy()
    train_idx, test_idx = next(GroupShuffleSplit(n_splits=1, test_size=.2, random_state=42).split(x, y, groups))
    sx, sy = StandardScaler().fit(x[train_idx]), StandardScaler().fit(y[train_idx])
    x_train = torch.tensor(sx.transform(x[train_idx]), dtype=torch.float32)
    y_train = torch.tensor(sy.transform(y[train_idx]), dtype=torch.float32)
    x_test = sx.transform(x[test_idx]).astype(np.float32)
    y_test = y[test_idx]
    torch.manual_seed(42)
    model = nn.Sequential(nn.Linear(8, 128), nn.SiLU(), nn.Linear(128, 128), nn.SiLU(), nn.Linear(128, 64), nn.SiLU(), nn.Linear(64, 1))
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    history = []
    for epoch in range(100):
        model.train()
        order = torch.randperm(len(x_train))
        losses = []
        for start in range(0, len(order), 1024):
            idx = order[start:start + 1024]
            optimizer.zero_grad()
            loss = nn.functional.mse_loss(model(x_train[idx]), y_train[idx])
            loss.backward()
            optimizer.step()
            losses.append(loss.item())
        with torch.no_grad():
            scaled_pred = model(torch.tensor(x_test)).numpy()
        pred = sy.inverse_transform(scaled_pred).ravel()
        rmse = float(mean_squared_error(y_test.ravel(), pred) ** .5)
        history.append({"epoch": epoch + 1, "loss": float(np.mean(losses)), "rmse": rmse})
        if (epoch + 1) % 10 == 0:
            print(f"epoch {epoch + 1:03d} | held-out RMSE {rmse:.3f} MPa")

    OUT.mkdir(exist_ok=True)
    model.eval()
    torch.onnx.export(model, torch.zeros(1, 8), OUT / "model.onnx", input_names=["x"], output_names=["vm"], dynamic_axes={"x": {0: "n"}, "vm": {0: "n"}}, opset_version=17)
    (OUT / "scaler.json").write_text(json.dumps({"x_mean": sx.mean_.tolist(), "x_scale": sx.scale_.tolist(), "y_mean": float(sy.mean_[0]), "y_scale": float(sy.scale_[0])}, indent=2))
    metrics = [{"name": "Neural surrogate", "r2": float(r2_score(y_test.ravel(), pred)), "rmse": float(mean_squared_error(y_test.ravel(), pred) ** .5), "latency": None}]
    (OUT / "metrics.json").write_text(json.dumps(metrics, indent=2))
    (OUT / "history.json").write_text(json.dumps(history, indent=2))
    parity = [{"truth": float(a), "prediction": float(b)} for a, b in zip(y_test.ravel()[:500], pred[:500])]
    (OUT / "parity.json").write_text(json.dumps(parity, indent=2))
    print(f"Held-out R²: {metrics[0]['r2']:.4f} | RMSE: {metrics[0]['rmse']:.3f} MPa")
    print("Exported model.onnx, scaler.json, metrics.json, history.json and parity.json to public/.")


if __name__ == "__main__":
    main()
