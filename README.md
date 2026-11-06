# Surrogate Lab

A responsive engineering exploration studio for bracket geometry, stress fields, model benchmarking, CAD inspection, and design-space search. The UI follows the supplied 12-task build plan.

## Current state

- Interactive 3D bracket with load, thickness, width, hole position and radius controls.
- An illustrative analytic stress field, component mass estimate and safety-factor estimate.
- Model Arena and optimizer demo flows with clear demo-data labels.
- CAD viewer canvas with wireframe mode and upload affordance. Full uploaded-file parsing and section clipping are future extensions.
- OpenAI Responses API copilot in a server route. The API key is only read from the server environment.
- Python training/export scaffold. A real FEA dataset is required to produce valid model and benchmark artifacts.

The supplied plan's example metrics and inference timings are not measurements. The current UI marks placeholder comparison data and estimated timing as illustrative. Do not use this prototype to certify a design or for manufacturing decisions.

## Run locally

Requirements: Node.js 20 or newer. Install and start:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). To enable the copilot, put an OpenAI API key in `.env.local`:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Never add `.env.local` or a key to source control or a browser variable such as `NEXT_PUBLIC_OPENAI_API_KEY`. The provided `key_...` tracking identifier is not a usable OpenAI API key.

## Pages

- `/` Workbench and interactive bracket exploration
- `/arena` model comparison and parity plot
- `/cad` reference CAD viewer
- `/optimize` constrained lightweight design search

## Train and connect a real surrogate

Read [ml/README.md](ml/README.md), add pointwise FEA results, then run `python ml/train.py`. That writes ONNX and evaluation artifacts to `public/`. The browser inference adapter should only be enabled when these artifacts exist and have been validated against the Python model. Current stress-field output remains explicitly illustrative.

## Deploy to Vercel

Import this folder as a Next.js project in Vercel, set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` as server environment variables, then deploy. Keep all secret variables server-side. The API route fails closed with a setup message when the key is absent.

## Demo narration

1. Explain why evaluating many bracket variants with full FEA can be slow.
2. Move the controls and observe the illustrative stress visualization and geometry tradeoffs.
3. Open Model Arena to show where trained held-out model metrics will appear.
4. Set a safety-factor target and run the demo optimizer.
5. Ask the design copilot about the current design.
6. State clearly that this prototype's field and sample benchmarks are placeholders; final design decisions require actual FEA/model validation.

