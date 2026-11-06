# Training data and model

The browser demo currently uses an explicitly illustrative analytic field. No FEA data or trained model was supplied, so it does not claim ML predictions.

To train the browser model, place node level stress data at `ml/data.csv` with one row per mesh point and these columns:

```csv
design_id,P,T,W,H,R,x,y,z,vm
case-001,12000,14,48,0.58,8,2,7,0,43.1
```

Use consistent units (N, mm, MPa), include multiple designs and many points per design, then run:

```bash
python -m pip install -r ml/requirements.txt
python ml/train.py
```

The split groups by `design_id`; the exported ONNX model, scaler, held out metrics, training history and parity points are written to `public/`. Metrics from the plan's hypothetical values are not prefilled as real results. Confirm the held out scores and compare against a baseline before presenting model performance. For a dataset with one maximum stress per design, change the feature set and target to `vm_max` and describe the visual stress field as illustrative.
