"use client";

// ─────────────────────────────────────────────────────────────────────────────
// playground.tsx — الملعب العصبي: an interactive neural-network playground.
// A tiny MLP is trained ENTIRELY in the browser (pure TS backprop from
// playground-engine.ts), rendered live via playground-canvas.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  FlaskConical,
  Minus,
  Network,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  StepForward,
  TrendingDown,
  X,
} from "lucide-react";
import { SectionHeader } from "@/components/site/section-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DecisionCanvas, LossCanvas, NetworkGraph } from "./playground-canvas";
import {
  ACTIVATIONS,
  ALL_FEATURES,
  DATASETS,
  LEARNING_RATES,
  NeuralNetwork,
  datasetSeed,
  generateDataset,
  type Activation,
  type DataPoint,
  type DatasetId,
  type FeatureKey,
  type LossPoint,
} from "./playground-engine";

const INIT_SEED = 777;
const GRID_N = 60;
const EPOCHS_PER_FRAME = 6;
const MAX_HISTORY = 100;

interface FrameState {
  epoch: number;
  trainLoss: number;
  testLoss: number;
  testAcc: number;
  grid: Float64Array | null;
  gridSize: number;
  points: DataPoint[];
  preds: number[];
  weights: number[][][] | null;
  history: LossPoint[];
}

const INITIAL_FRAME: FrameState = {
  epoch: 0,
  trainLoss: 0,
  testLoss: 0,
  testAcc: 0,
  grid: null,
  gridSize: GRID_N,
  points: [],
  preds: [],
  weights: null,
  history: [],
};

const INITIAL_FLAGS: Record<FeatureKey, boolean> = {
  x: true,
  y: true,
  x2: false,
  y2: false,
  xy: false,
  sinx: false,
  siny: false,
};

export default function PlaygroundSection() {
  const { t } = useLanguage();

  // ─── Config state ───
  const [dataset, setDataset] = useState<DatasetId>("circles");
  const [noise, setNoise] = useState(0);
  const [lr, setLr] = useState(0.03);
  const [activation, setActivation] = useState<Activation>("tanh");
  const [flags, setFlags] = useState<Record<FeatureKey, boolean>>(INITIAL_FLAGS);
  const [hidden, setHidden] = useState<number[]>([5, 4]);
  const [running, setRunning] = useState(false);
  const [frame, setFrame] = useState<FrameState>(INITIAL_FRAME);

  const features = useMemo(
    () => ALL_FEATURES.filter((f) => flags[f.key]).map((f) => f.key),
    [flags]
  );

  // ─── Mutable engine refs (never trigger re-renders) ───
  const netRef = useRef<NeuralNetwork | null>(null);
  const dataRef = useRef<ReturnType<typeof generateDataset> | null>(null);
  const historyRef = useRef<LossPoint[]>([]);

  /** Recompute the decision field, metrics and weights snapshot → paint. */
  const pushFrame = useCallback(() => {
    const net = netRef.current;
    const data = dataRef.current;
    if (!net || !data) return;
    const grid = net.predictGrid(GRID_N);
    const points: DataPoint[] = [...data.train, ...data.test];
    const preds = points.map((p) => net.predict(p.x, p.y));
    const m = net.evaluate(data.train, data.test);
    setFrame({
      epoch: m.epoch,
      trainLoss: m.trainLoss,
      testLoss: m.testLoss,
      testAcc: m.testAcc,
      grid,
      gridSize: GRID_N,
      points,
      preds,
      weights: net.exportWeights(),
      history: historyRef.current.slice(),
    });
  }, []);

  // Structural change → fresh network (data unchanged, training keeps flowing).
  useEffect(() => {
    netRef.current = new NeuralNetwork(features, hidden, activation, INIT_SEED);
    historyRef.current = [];
    pushFrame();
  }, [features, hidden, activation, pushFrame]);

  // Dataset / noise change → regenerate data (deterministic per dataset+noise).
  useEffect(() => {
    dataRef.current = generateDataset(dataset, noise, datasetSeed(dataset, noise));
    historyRef.current = [];
    pushFrame();
  }, [dataset, noise, pushFrame]);

  // Training loop — requestAnimationFrame, ~6 epochs per frame.
  // Cleanup guards against React strict-mode double-mount.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let cancelled = false;
    let tick = 0;
    const loop = () => {
      if (cancelled) return;
      const net = netRef.current;
      const data = dataRef.current;
      if (net && data) {
        let m: LossPoint | null = null;
        for (let i = 0; i < EPOCHS_PER_FRAME; i++) {
          const r = net.stepEpoch(data.train, data.test, lr);
          m = { epoch: r.epoch, train: r.trainLoss, test: r.testLoss, testAcc: r.testAcc };
        }
        if (m) {
          historyRef.current.push(m);
          if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
        }
        tick++;
        if (tick % 3 === 0) pushFrame();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [running, lr, pushFrame]);

  // ─── Run controls ───
  const stepOnce = useCallback(() => {
    const net = netRef.current;
    const data = dataRef.current;
    if (!net || !data) return;
    const r = net.stepEpoch(data.train, data.test, lr);
    historyRef.current.push({
      epoch: r.epoch,
      train: r.trainLoss,
      test: r.testLoss,
      testAcc: r.testAcc,
    });
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    pushFrame();
  }, [lr, pushFrame]);

  const resetAll = useCallback(() => {
    setRunning(false);
    netRef.current = new NeuralNetwork(features, hidden, activation, INIT_SEED);
    historyRef.current = [];
    pushFrame();
  }, [features, hidden, activation, pushFrame]);

  // ─── Hidden-layer editor handlers ───
  const addLayer = useCallback(() => {
    setHidden((h) => (h.length >= 4 ? h : [...h, 4]));
  }, []);
  const removeLayer = useCallback((idx: number) => {
    setHidden((h) => h.filter((_, i) => i !== idx));
  }, []);
  const changeNeurons = useCallback((idx: number, delta: number) => {
    setHidden((h) =>
      h.map((n, i) => (i === idx ? Math.min(8, Math.max(1, n + delta)) : n))
    );
  }, []);

  const stats = [
    { label: t("Epoch", "الحقبة"), value: frame.epoch.toLocaleString("en-US"), cls: "text-foreground" },
    { label: t("Train loss", "خسارة التدريب"), value: frame.trainLoss.toFixed(3), cls: "text-primary" },
    { label: t("Test loss", "خسارة الاختبار"), value: frame.testLoss.toFixed(3), cls: "text-emerald-400" },
    {
      label: t("Test accuracy", "دقة الاختبار"),
      value: `${(frame.testAcc * 100).toFixed(1)}%`,
      cls: "text-amber-400",
    },
  ];

  return (
    <section className="border-y border-border bg-card/30 py-20">
      <div className="mx-auto w-full max-w-7xl px-4">
        <SectionHeader
          badge={t("Neural Playground", "الملعب العصبي")}
          title={t("Watch the network learn before your eyes", "شاهد الشبكة تتعلّم أمامك")}
          description={t(
            "A real miniature neural network trained entirely in your browser with backpropagation — no server, no GPU. Pick the data and hyperparameters, then watch the decision boundary take shape moment by moment.",
            "شبكة عصبية حقيقية بحجم مصغّر تُدرَّب بالكامل داخل متصفحك بالانتشار العكسي — بلا خادم وبلا GPU. اختر البيانات والمعاملات، ثم شاهد حدود القرار تتشكّل لحظة بلحظة."
          )}
          icon={FlaskConical}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,320px)]">
          {/* ─── Controls panel (first in RTL flow → right side) ─── */}
          <Card className="gap-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                {t("Settings", "الإعدادات")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("Data, hyperparameters, and network architecture", "البيانات، المعاملات، وبنية الشبكة")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Dataset */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">{t("Dataset", "البيانات")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DATASETS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDataset(d.id)}
                      aria-pressed={dataset === d.id}
                      className={cn(
                        "flex min-h-[44px] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
                        dataset === d.id
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      {t(d.labelEn, d.label)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Noise */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">{t("Noise", "التشويش")}</Label>
                  <span dir="ltr" className="font-mono text-xs font-semibold text-primary">
                    {Math.round(noise * 100)}%
                  </span>
                </div>
                <div dir="ltr">
                  <Slider
                    aria-label={t("Noise level", "نسبة التشويش")}
                    min={0}
                    max={30}
                    step={1}
                    value={[Math.round(noise * 100)]}
                    onValueChange={(v) => setNoise((v[0] ?? 0) / 100)}
                  />
                </div>
              </div>

              {/* LR + activation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">{t("Learning rate", "معدل التعلم")}</Label>
                  <Select value={String(lr)} onValueChange={(v) => setLr(Number(v))}>
                    <SelectTrigger className="w-full" aria-label={t("Learning rate", "معدل التعلم")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEARNING_RATES.map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          <span dir="ltr" className="font-mono text-xs">
                            {r}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">{t("Activation", "دالة التنشيط")}</Label>
                  <Select
                    value={activation}
                    onValueChange={(v) => setActivation(v as Activation)}
                  >
                    <SelectTrigger className="w-full" aria-label={t("Activation", "دالة التنشيط")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVATIONS.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <span dir="ltr" className="font-mono text-xs">
                            {a.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  {t("Input features", "خصائص المدخل")} <span dir="ltr" className="font-mono">(x, y)</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_FEATURES.map((f) => (
                    <label
                      key={f.key}
                      title={f.locked ? t("Locked — always used", "مثبّتة — تُستخدم دائمًا") : undefined}
                      className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-2 transition-colors hover:border-primary/30"
                    >
                      <Checkbox
                        checked={flags[f.key]}
                        disabled={f.locked}
                        onCheckedChange={(v) =>
                          setFlags((prev) => ({ ...prev, [f.key]: v === true }))
                        }
                        aria-label={t(`Feature ${f.label}`, `الخاصية ${f.label}`)}
                      />
                      <span dir="ltr" className="font-mono text-xs text-foreground">
                        {f.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Hidden layers editor */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">{t("Hidden layers", "الطبقات المخفية")}</Label>
                  <span dir="ltr" className="font-mono text-[11px] text-muted-foreground">
                    {hidden.length}/4
                  </span>
                </div>
                <div className="flex items-start gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {hidden.map((n, i) => (
                    <div
                      key={i}
                      className="flex shrink-0 flex-col items-center gap-2 rounded-lg border border-border bg-background/50 p-2"
                    >
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeLayer(i)}
                          aria-label={t(`Remove layer ${i + 1}`, `حذف الطبقة ${i + 1}`)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {t(`Layer ${i + 1}`, `طبقة ${i + 1}`)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1" aria-hidden>
                        {Array.from({ length: 8 }, (_, j) => (
                          <span
                            key={j}
                            className={cn(
                              "block size-3 rounded-full border transition-colors",
                              j < n
                                ? "border-primary/70 bg-primary"
                                : "border-border bg-transparent"
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => changeNeurons(i, 1)}
                          disabled={n >= 8}
                          aria-label={t(`Add neuron to layer ${i + 1}`, `إضافة عصبون للطبقة ${i + 1}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => changeNeurons(i, -1)}
                          disabled={n <= 1}
                          aria-label={t(`Remove neuron from layer ${i + 1}`, `حذف عصبون من الطبقة ${i + 1}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {hidden.length < 4 && (
                    <button
                      type="button"
                      onClick={addLayer}
                      className="flex min-h-[44px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-primary/40 px-4 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4" />
                      {t("Layer", "طبقة")}
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── Center: live training board ─── */}
          <Card className="gap-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-primary" />
                {t("Live training board", "لوحة التدريب الحيّة")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("An ", "شبكة ")}
                <span dir="ltr" className="font-mono">MLP</span>
                {t(" learning via backpropagation inside your browser — orange vs. emerald", " تتعلّم بالانتشار العكسي داخل المتصفح — البرتقالي ضد الزمردي")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Readouts */}
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-border bg-background/50 px-3 py-2"
                  >
                    <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                    <dd
                      dir="ltr"
                      className={cn("text-right font-mono text-lg font-bold", s.cls)}
                    >
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Run controls */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="lg"
                  onClick={() => setRunning((r) => !r)}
                  className="h-11 min-h-[44px] flex-1 px-5 font-semibold sm:flex-none"
                >
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? t("Pause", "إيقاف مؤقت") : t("Run training", "تشغيل التدريب")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={stepOnce}
                  disabled={running}
                  className="h-11 min-h-[44px]"
                >
                  <StepForward className="h-4 w-4" />
                  {t("Step once", "خطوة واحدة")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetAll}
                  className="h-11 min-h-[44px]"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("Reset", "إعادة تعيين")}
                </Button>
              </div>

              {/* Decision boundary canvas */}
              <div className="mx-auto w-full max-w-[440px]">
                <div className="aspect-square w-full overflow-hidden rounded-xl border border-border">
                  <DecisionCanvas
                    grid={frame.grid}
                    gridSize={frame.gridSize}
                    points={frame.points}
                    preds={frame.preds}
                    ariaLabel={t("Decision boundary and data points", "لوحة حدود القرار ونقاط البيانات")}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#f97316]" />
                    {t("Class 1", "الفئة 1")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-[#10b981]" />
                    {t("Class 0", "الفئة 0")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full border-2 border-[#fb7185]" />
                    {t("Misclassified", "تصنيف خاطئ")}
                  </span>
                </div>
              </div>

              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                {t("The engine is written in ", "المحرك مكتوب بـ ")}
                <span dir="ltr" className="font-mono">
                  TypeScript
                </span>
                {t(" from scratch and emulates the principle of ", " من الصفر ويحاكي مبدأ ")}
                <span dir="ltr" className="font-mono">
                  autograd
                </span>
                {t(" — for education only", " — للتعليم فقط")}
              </p>
            </CardContent>
          </Card>

          {/* ─── Analysis: loss + topology ─── */}
          <Card className="gap-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-4 w-4 text-primary" />
                {t("Loss curve", "منحنى الخسارة")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("Last ", "آخر ")}
                <span dir="ltr" className="font-mono">100</span>
                {t(" epochs — train/test", " حقبة — تدريب/اختبار")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[150px] w-full">
                <LossCanvas
                  history={frame.history}
                  ariaLabel={t("Training and test loss curve", "منحنى خسارة التدريب والاختبار")}
                  trainLabel={t("train", "تدريب")}
                  testLabel={t("test", "اختبار")}
                />
              </div>
            </CardContent>
            <Separator />
            <div className="flex flex-col gap-3 px-6 pb-6">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">{t("Network architecture and weights", "بنية الشبكة والأوزان")}</h3>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {t("Edge thickness is proportional to the weight magnitude; color indicates its sign.", "سماكة الوصلة تتناسب مع حجم الوزن، واللون يدل على إشارته.")}
              </p>
              <NetworkGraph
                features={features}
                hidden={hidden}
                weights={frame.weights}
                inputCaption={t("Inputs", "المدخلات")}
                outputCaption={t("Output", "الناتج")}
                ariaLabel={t("Neural network topology with live weights", "مخطط بنية الشبكة العصبية والأوزان الحية")}
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
