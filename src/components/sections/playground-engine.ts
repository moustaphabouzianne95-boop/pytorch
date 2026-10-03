// ─────────────────────────────────────────────────────────────────────────────
// playground-engine.ts — Pure TypeScript neural-network engine.
// No React, no dependencies, no server. A tiny MLP trained with manual
// forward pass + backpropagation (binary cross-entropy loss), plus seeded
// synthetic datasets for the interactive playground.
// ─────────────────────────────────────────────────────────────────────────────

export type Activation = "tanh" | "relu" | "sigmoid";
export type FeatureKey = "x" | "y" | "x2" | "y2" | "xy" | "sinx" | "siny";
export type DatasetId = "circles" | "xor" | "moons" | "spiral";

export interface DataPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

export interface Dataset {
  train: DataPoint[];
  test: DataPoint[];
}

export interface EpochMetrics {
  epoch: number;
  trainLoss: number;
  testLoss: number;
  trainAcc: number;
  testAcc: number;
}

export interface LossPoint {
  epoch: number;
  train: number;
  test: number;
  testAcc: number;
}

// ─── Static config tables (consumed by the UI) ───

export const DATASETS: { id: DatasetId; label: string }[] = [
  { id: "circles", label: "دائرتان" },
  { id: "xor", label: "XOR" },
  { id: "moons", label: "فصلان" },
  { id: "spiral", label: "لولب" },
];

export const ALL_FEATURES: { key: FeatureKey; label: string; locked: boolean }[] = [
  { key: "x", label: "x", locked: true },
  { key: "y", label: "y", locked: true },
  { key: "x2", label: "x²", locked: false },
  { key: "y2", label: "y²", locked: false },
  { key: "xy", label: "x·y", locked: false },
  { key: "sinx", label: "sin(x)", locked: false },
  { key: "siny", label: "sin(y)", locked: false },
];

export const LEARNING_RATES: number[] = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3];

export const ACTIVATIONS: { id: Activation; label: string }[] = [
  { id: "tanh", label: "tanh" },
  { id: "relu", label: "ReLU" },
  { id: "sigmoid", label: "sigmoid" },
];

// ─── Seeded PRNG (mulberry32) ───

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sample via Box–Muller transform. */
function gauss(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Deterministic seed derived from dataset id + noise level. */
export function datasetSeed(id: DatasetId, noise: number): number {
  const base: Record<DatasetId, number> = { circles: 1000, xor: 2000, moons: 3000, spiral: 4000 };
  return base[id] + Math.round(noise * 100);
}

// ─── Datasets (~300 points on [-1, 1], 50/50 train/test split) ───

export function generateDataset(id: DatasetId, noise: number, seed: number): Dataset {
  const rng = mulberry32(seed);
  const jitter = noise * 0.35; // positional gaussian sigma
  const flipP = noise * 0.5; // label flip probability
  const pts: DataPoint[] = [];
  const push = (x: number, y: number, label: 0 | 1) => pts.push({ x, y, label });

  if (id === "circles") {
    for (let i = 0; i < 150; i++) {
      const aIn = rng() * Math.PI * 2;
      const rIn = Math.sqrt(rng()) * 0.42;
      push(Math.cos(aIn) * rIn, Math.sin(aIn) * rIn, 1);
      const aOut = rng() * Math.PI * 2;
      const rOut = 0.68 + rng() * 0.32;
      push(Math.cos(aOut) * rOut, Math.sin(aOut) * rOut, 0);
    }
  } else if (id === "xor") {
    for (let i = 0; i < 300; i++) {
      let x = rng() * 2 - 1;
      let y = rng() * 2 - 1;
      // keep points a touch clear of the axes
      if (Math.abs(x) < 0.06) x += x >= 0 ? 0.06 : -0.06;
      if (Math.abs(y) < 0.06) y += y >= 0 ? 0.06 : -0.06;
      push(x, y, x * y > 0 ? 1 : 0);
    }
  } else if (id === "moons") {
    for (let i = 0; i < 150; i++) {
      const t = rng() * Math.PI;
      const th = gauss(rng) * 0.045;
      const x1 = Math.cos(t);
      const y1 = Math.sin(t) + th;
      const x2 = 1 - Math.cos(t);
      const y2 = 0.5 - Math.sin(t) - th;
      // normalize raw range x∈[-1,2], y∈[-0.5,1] into [-1,1]
      push((x1 - 0.5) * 0.58, (y1 - 0.25) * 0.9, 1);
      push((x2 - 0.5) * 0.58, (y2 - 0.25) * 0.9, 0);
    }
  } else {
    // two spirals
    const N = 150;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const r = t * 0.92;
      const ang = 1.75 * t * Math.PI * 2;
      const x = r * Math.sin(ang);
      const y = r * Math.cos(ang);
      push(x, y, 1);
      push(-x, -y, 0);
    }
  }

  // noise: positional jitter + optional label flips, clamped to the domain
  for (const p of pts) {
    p.x = Math.max(-1, Math.min(1, p.x + gauss(rng) * jitter));
    p.y = Math.max(-1, Math.min(1, p.y + gauss(rng) * jitter));
    if (rng() < flipP) p.label = p.label === 1 ? 0 : 1;
  }

  // deterministic shuffled 50/50 split
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pts[i];
    pts[i] = pts[j];
    pts[j] = tmp;
  }
  const half = Math.floor(pts.length / 2);
  return { train: pts.slice(0, half), test: pts.slice(half) };
}

// ─── Feature transforms ───

export function featurize(x: number, y: number, features: FeatureKey[]): number[] {
  const out = new Array<number>(features.length);
  for (let i = 0; i < features.length; i++) {
    switch (features[i]) {
      case "x":
        out[i] = x;
        break;
      case "y":
        out[i] = y;
        break;
      case "x2":
        out[i] = x * x;
        break;
      case "y2":
        out[i] = y * y;
        break;
      case "xy":
        out[i] = x * y;
        break;
      case "sinx":
        out[i] = Math.sin(x * Math.PI);
        break;
      case "siny":
        out[i] = Math.sin(y * Math.PI);
        break;
    }
  }
  return out;
}

function sigmoid(z: number): number {
  // exp(-z) → +Infinity for very negative z → 1/Inf = 0 (no NaN)
  return 1 / (1 + Math.exp(-z));
}

// ─── The network ───

interface LayerParams {
  w: number[][]; // w[out][in]
  b: number[];
}

/**
 * Tiny MLP: features → hidden layers (0–4, 1–8 neurons each) → 1 sigmoid output.
 * Trained with mini-batch manual backprop, binary cross-entropy loss.
 * With zero hidden layers it degrades gracefully to plain logistic regression.
 */
export class NeuralNetwork {
  readonly features: FeatureKey[];
  readonly hidden: number[];
  readonly activation: Activation;
  epoch = 0;

  private readonly layers: LayerParams[] = [];
  private readonly rng: () => number;

  constructor(features: FeatureKey[], hidden: number[], activation: Activation, seed = 1234) {
    // never crash on an empty feature list
    this.features = features.length > 0 ? features : ["x", "y"];
    this.hidden = hidden;
    this.activation = activation;
    this.rng = mulberry32(seed);

    const sizes = [this.features.length, ...hidden, 1];
    for (let l = 0; l < sizes.length - 1; l++) {
      const fanIn = sizes[l];
      const fanOut = sizes[l + 1];
      const toHidden = l < sizes.length - 2;
      // He uniform for ReLU hidden layers, Xavier uniform otherwise
      const scale =
        toHidden && activation === "relu" ? Math.sqrt(6 / fanIn) : Math.sqrt(6 / (fanIn + fanOut));
      const w: number[][] = [];
      for (let j = 0; j < fanOut; j++) {
        const row = new Array<number>(fanIn);
        for (let i = 0; i < fanIn; i++) row[i] = (this.rng() * 2 - 1) * scale;
        w.push(row);
      }
      this.layers.push({ w, b: new Array<number>(fanOut).fill(0) });
    }
  }

  private activate(z: number): number {
    switch (this.activation) {
      case "tanh":
        return Math.tanh(z);
      case "relu":
        return z > 0 ? z : 0;
      case "sigmoid":
        return sigmoid(z);
    }
  }

  private activatePrime(z: number, a: number): number {
    switch (this.activation) {
      case "tanh":
        return 1 - a * a;
      case "relu":
        return z > 0 ? 1 : 0;
      case "sigmoid":
        return a * (1 - a);
    }
  }

  /** Forward pass keeping all activations / pre-activations (for backprop). */
  private forward(input: number[]): { acts: number[][]; zs: number[][] } {
    const acts: number[][] = [input];
    const zs: number[][] = [];
    const L = this.layers.length;
    for (let l = 0; l < L; l++) {
      const { w, b } = this.layers[l];
      const prev = acts[l];
      const z = new Array<number>(w.length);
      const a = new Array<number>(w.length);
      const isOutput = l === L - 1;
      for (let j = 0; j < w.length; j++) {
        const row = w[j];
        let s = b[j];
        for (let i = 0; i < row.length; i++) s += row[i] * prev[i];
        z[j] = s;
        a[j] = isOutput ? sigmoid(s) : this.activate(s);
      }
      zs.push(z);
      acts.push(a);
    }
    return { acts, zs };
  }

  /** Network output p ∈ [0, 1] for one sample. */
  predict(x: number, y: number): number {
    const { acts } = this.forward(featurize(x, y, this.features));
    return acts[acts.length - 1][0];
  }

  /**
   * Evaluate the network on an n×n grid over [-1, 1]².
   * Row-major; row 0 corresponds to y = +1 (top of the canvas).
   */
  predictGrid(n: number): Float64Array {
    const out = new Float64Array(n * n);
    for (let row = 0; row < n; row++) {
      const y = 1 - (2 * row) / (n - 1);
      for (let col = 0; col < n; col++) {
        const x = -1 + (2 * col) / (n - 1);
        out[row * n + col] = this.predict(x, y);
      }
    }
    return out;
  }

  /** Deep copy of all weight matrices, layer by layer ([layer][out][in]). */
  exportWeights(): number[][][] {
    return this.layers.map((l) => l.w.map((row) => row.slice()));
  }

  /** Mean BCE loss + accuracy on a point set. */
  private static evaluateSet(net: NeuralNetwork, data: DataPoint[]): { loss: number; acc: number } {
    if (data.length === 0) return { loss: 0, acc: 1 };
    let loss = 0;
    let correct = 0;
    for (const p of data) {
      const out = net.predict(p.x, p.y);
      const pc = Math.min(1 - 1e-7, Math.max(1e-7, out));
      loss += -(p.label * Math.log(pc) + (1 - p.label) * Math.log(1 - pc));
      if ((out > 0.5 ? 1 : 0) === p.label) correct++;
    }
    return { loss: loss / data.length, acc: correct / data.length };
  }

  /** Metrics over train + test without stepping. */
  evaluate(train: DataPoint[], test: DataPoint[]): EpochMetrics {
    const tr = NeuralNetwork.evaluateSet(this, train);
    const te = NeuralNetwork.evaluateSet(this, test);
    return {
      epoch: this.epoch,
      trainLoss: tr.loss,
      testLoss: te.loss,
      trainAcc: tr.acc,
      testAcc: te.acc,
    };
  }

  /** Accumulate gradients of BCE loss for one sample into gW / gB. */
  private accumulate(
    input: number[],
    target: 0 | 1,
    gW: number[][][],
    gB: number[][]
  ): void {
    const { acts, zs } = this.forward(input);
    const L = this.layers.length;
    // BCE + sigmoid output ⇒ dL/dz_out = p − y
    let delta: number[] = [acts[L][0] - target];
    for (let l = L - 1; l >= 0; l--) {
      const prevAct = acts[l];
      for (let j = 0; j < delta.length; j++) {
        const d = delta[j];
        const grow = gW[l][j];
        for (let i = 0; i < grow.length; i++) grow[i] += d * prevAct[i];
        gB[l][j] += d;
      }
      if (l > 0) {
        const { w } = this.layers[l];
        const next = new Array<number>(prevAct.length).fill(0);
        for (let j = 0; j < w.length; j++) {
          const d = delta[j];
          const row = w[j];
          for (let i = 0; i < row.length; i++) next[i] += d * row[i];
        }
        const zPrev = zs[l - 1];
        const aPrev = acts[l]; // output of hidden layer l−1
        for (let i = 0; i < next.length; i++) next[i] *= this.activatePrime(zPrev[i], aPrev[i]);
        delta = next;
      }
    }
  }

  /**
   * One training epoch: shuffled mini-batches (default size 16),
   * gradient accumulation per batch then a single averaged update.
   */
  stepEpoch(train: DataPoint[], test: DataPoint[], lr: number, batchSize = 16): EpochMetrics {
    const order = train.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }

    const L = this.layers.length;
    const gW: number[][][] = this.layers.map((l) => l.w.map((r) => new Array<number>(r.length).fill(0)));
    const gB: number[][] = this.layers.map((l) => new Array<number>(l.b.length).fill(0));

    for (let start = 0; start < order.length; start += batchSize) {
      const end = Math.min(start + batchSize, order.length);
      const count = end - start;
      for (let l = 0; l < L; l++) {
        for (const row of gW[l]) row.fill(0);
        gB[l].fill(0);
      }
      for (let k = start; k < end; k++) {
        const p = train[order[k]];
        this.accumulate(featurize(p.x, p.y, this.features), p.label, gW, gB);
      }
      for (let l = 0; l < L; l++) {
        const { w, b } = this.layers[l];
        for (let j = 0; j < w.length; j++) {
          const row = w[j];
          const grow = gW[l][j];
          for (let i = 0; i < row.length; i++) row[i] -= (lr * grow[i]) / count;
          b[j] -= (lr * gB[l][j]) / count;
        }
      }
    }

    this.epoch++;
    return this.evaluate(train, test);
  }
}
