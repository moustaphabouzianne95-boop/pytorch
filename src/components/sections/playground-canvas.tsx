"use client";

// ─────────────────────────────────────────────────────────────────────────────
// playground-canvas.tsx — Renderers for the neural-network playground:
//   • DecisionCanvas  : decision-boundary color field + data points (canvas)
//   • LossCanvas      : train/test loss sparkline (canvas)
//   • NetworkGraph    : live topology diagram with weight-coded edges (SVG)
// All drawing is DPR-aware and driven declaratively via props.
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { ALL_FEATURES, type DataPoint, type FeatureKey, type LossPoint } from "./playground-engine";

const ORANGE: [number, number, number] = [249, 115, 22]; // class 1
const EMERALD: [number, number, number] = [16, 185, 129]; // class 0
const RING = "#fb7185"; // misclassified ring (rose)

/** Blend emerald→orange by p∈[0,1], alpha rises with confidence. */
function fieldColor(p: number): [number, number, number, number] {
  const t = Math.min(1, Math.max(0, p));
  const r = Math.round(EMERALD[0] + (ORANGE[0] - EMERALD[0]) * t);
  const g = Math.round(EMERALD[1] + (ORANGE[1] - EMERALD[1]) * t);
  const b = Math.round(EMERALD[2] + (ORANGE[2] - EMERALD[2]) * t);
  const conf = Math.abs(t - 0.5) * 2;
  const a = Math.round((0.16 + 0.5 * conf) * 255);
  return [r, g, b, a];
}

/** Track the CSS width of a canvas element (DPR-aware drawing size). */
function useCanvasSize(ref: RefObject<HTMLCanvasElement | null>): number {
  const [size, setSize] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// ─── Decision boundary + points ───

export function DecisionCanvas({
  grid,
  gridSize,
  points,
  preds,
  ariaLabel,
}: {
  grid: Float64Array | null;
  gridSize: number;
  points: DataPoint[];
  preds: number[];
  /** Localized accessible name (passed from playground.tsx). */
  ariaLabel: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const size = useCanvasSize(ref);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || size < 10) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // dark base
    ctx.fillStyle = "#0c0a09";
    ctx.fillRect(0, 0, size, size);

    // decision field: 60×60 offscreen → smoothed upscale
    if (grid && grid.length === gridSize * gridSize && gridSize > 1) {
      let off = offRef.current;
      if (!off) {
        off = document.createElement("canvas");
        offRef.current = off;
      }
      if (off.width !== gridSize || off.height !== gridSize) {
        off.width = gridSize;
        off.height = gridSize;
      }
      const octx = off.getContext("2d");
      if (octx) {
        const img = octx.createImageData(gridSize, gridSize);
        for (let i = 0; i < gridSize * gridSize; i++) {
          const [r, g, b, a] = fieldColor(grid[i]);
          img.data[i * 4] = r;
          img.data[i * 4 + 1] = g;
          img.data[i * 4 + 2] = b;
          img.data[i * 4 + 3] = a;
        }
        octx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(off, 0, 0, size, size);
      }
    }

    // faint axes cross
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    // data points
    const r = Math.max(3.2, size / 80);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const cx = ((p.x + 1) / 2) * size;
      const cy = ((1 - p.y) / 2) * size;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? "#f97316" : "#10b981";
      ctx.fill();
      const pred = preds[i];
      const ok = pred === undefined ? true : (pred > 0.5 ? 1 : 0) === p.label;
      if (!ok) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.strokeStyle = RING;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    }

    // border
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  }, [grid, gridSize, points, preds, size]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className="block h-full w-full"
    />
  );
}

// ─── Loss sparkline ───

const LOSS_H = 150;

export const LossCanvas = memo(function LossCanvas({
  history,
  ariaLabel,
  trainLabel,
  testLabel,
}: {
  history: LossPoint[];
  /** Localized accessible name (passed from playground.tsx). */
  ariaLabel: string;
  /** Localized in-canvas legend labels (passed from playground.tsx). */
  trainLabel: string;
  testLabel: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useCanvasSize(ref);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || size < 10) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(LOSS_H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, LOSS_H);

    const n = history.length;
    if (n === 0) return;

    const pad = 10;
    const w = size - pad * 2;
    const h = LOSS_H - pad * 2;
    let maxV = 0.1;
    for (const pt of history) maxV = Math.max(maxV, pt.train, pt.test);
    maxV *= 1.08;

    const xAt = (i: number) => pad + (w * i) / Math.max(n - 1, 1);
    const yAt = (v: number) => pad + h - (h * Math.min(v, maxV)) / maxV;

    // baseline
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad + h);
    ctx.lineTo(pad + w, pad + h);
    ctx.stroke();

    // train (solid orange)
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const pt = history[i];
      if (i === 0) ctx.moveTo(xAt(0), yAt(pt.train));
      else ctx.lineTo(xAt(i), yAt(pt.train));
    }
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // test (dashed emerald)
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const pt = history[i];
      if (i === 0) ctx.moveTo(xAt(0), yAt(pt.test));
      else ctx.lineTo(xAt(i), yAt(pt.test));
    }
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // current values — pinned to LTR/left so the localized labels render
    // identically regardless of the document direction
    const last = history[n - 1];
    ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    const padLabel = (s: string) => s.padEnd(Math.max(trainLabel.length, testLabel.length), " ");
    ctx.fillStyle = "#f97316";
    ctx.fillText(`${padLabel(trainLabel)} ${last.train.toFixed(3)}`, pad + 2, pad + 8);
    ctx.fillStyle = "#10b981";
    ctx.fillText(`${padLabel(testLabel)} ${last.test.toFixed(3)}`, pad + 2, pad + 24);
  }, [history, size, trainLabel, testLabel]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className="block h-full w-full"
    />
  );
});

// ─── Topology diagram (SVG) ───

const GW = 520;
const GH = 230;
const GPAD_X = 58;
const GPAD_Y = 26;

export const NetworkGraph = memo(function NetworkGraph({
  features,
  hidden,
  weights,
  inputCaption,
  outputCaption,
  ariaLabel,
}: {
  features: FeatureKey[];
  hidden: number[];
  weights: number[][][] | null;
  /** Localized column captions (passed from playground.tsx). */
  inputCaption: string;
  outputCaption: string;
  /** Localized accessible name (passed from playground.tsx). */
  ariaLabel: string;
}) {
  const cols: number[] = [features.length, ...hidden, 1];
  const colCount = cols.length;
  const xOf = (c: number) => GPAD_X + ((GW - GPAD_X * 2) * c) / (colCount - 1);
  const gapOf = (n: number) => (n <= 1 ? 0 : Math.min(38, (GH - GPAD_Y * 2) / (n - 1)));
  const yOf = (c: number, j: number) => GH / 2 - 4 + (j - (cols[c] - 1) / 2) * gapOf(cols[c]);

  let maxAbs = 0.0001;
  const edges: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
  const validWeights = weights !== null && weights.length === colCount - 1;
  if (validWeights && weights) {
    for (let c = 0; c < weights.length; c++) {
      const layer = weights[c];
      for (let j = 0; j < layer.length; j++) {
        for (let i = 0; i < layer[j].length; i++) {
          const w = layer[j][i];
          maxAbs = Math.max(maxAbs, Math.abs(w));
          edges.push({ x1: xOf(c), y1: yOf(c, i), x2: xOf(c + 1), y2: yOf(c + 1, j), w });
        }
      }
    }
  }

  const labelOf = (key: FeatureKey) => ALL_FEATURES.find((f) => f.key === key)?.label ?? key;

  const nodes: ReactNode[] = [];
  const texts: ReactNode[] = [];
  cols.forEach((n, c) => {
    const isInput = c === 0;
    const isOutput = c === colCount - 1;
    for (let j = 0; j < n; j++) {
      nodes.push(
        <circle
          key={`n-${c}-${j}`}
          cx={xOf(c)}
          cy={yOf(c, j)}
          r={isOutput ? 10 : 8}
          fill="#1c1917"
          stroke={isInput ? "#f97316" : isOutput ? "#fbbf24" : "#57534e"}
          strokeWidth={1.5}
        />
      );
      if (isInput) {
        texts.push(
          <text
            key={`t-${c}-${j}`}
            x={xOf(c) - 16}
            y={yOf(c, j) + 3.5}
            textAnchor="end"
            fontSize="10.5"
            fill="#a8a29e"
            className="font-mono"
          >
            {labelOf(features[j] ?? "x")}
          </text>
        );
      }
      if (isOutput) {
        texts.push(
          <text
            key={`t-${c}-${j}`}
            x={xOf(c) + 17}
            y={yOf(c, j) + 4}
            textAnchor="start"
            fontSize="11"
            fill="#e7e5e4"
            className="font-mono"
          >
            ŷ
          </text>
        );
      }
    }
    texts.push(
      <text
        key={`cap-${c}`}
        x={xOf(c)}
        y={GH - 5}
        textAnchor="middle"
        fontSize="9.5"
        fill="#78716c"
      >
        {isInput ? inputCaption : isOutput ? outputCaption : String(n)}
      </text>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${GW} ${GH}`}
      role="img"
      aria-label={ariaLabel}
      className="h-auto w-full"
    >
      <g>
        {edges.map((e, k) => {
          const t = Math.min(1, Math.abs(e.w) / maxAbs);
          return (
            <line
              key={k}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={e.w >= 0 ? "#f97316" : "#10b981"}
              strokeWidth={0.5 + 2.6 * t}
              strokeOpacity={0.25 + 0.55 * t}
            />
          );
        })}
      </g>
      <g>{nodes}</g>
      <g>{texts}</g>
    </svg>
  );
});
