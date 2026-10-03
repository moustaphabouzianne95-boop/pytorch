"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Info,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import type { Lesson, Level } from "@/lib/types";
import { SectionHeader } from "@/components/site/section-header";
import { CodeBlock } from "@/components/site/code-block";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ─── Constants ─────────────────────────────────────────────── */

const PROGRESS_KEY = "pytorch-hub-lesson-progress";

type LevelFilter = Level | "all";
type Status = "loading" | "error" | "ready";

const LEVEL_ORDER: Level[] = ["beginner", "intermediate", "advanced"];

const LEVEL_LABEL: Record<Level, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const LEVEL_BADGE: Record<Level, string> = {
  beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  advanced: "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

const LEVEL_DOT: Record<Level, string> = {
  beginner: "bg-emerald-400",
  intermediate: "bg-amber-400",
  advanced: "bg-rose-400",
};

const FILTERS: { value: LevelFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "beginner", label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced", label: "متقدم" },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

/* ─── Small pieces ──────────────────────────────────────────── */

function LevelBadge({ level }: { level: Level }) {
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 border font-semibold", LEVEL_BADGE[level])}
    >
      {LEVEL_LABEL[level]}
    </Badge>
  );
}

function ProgressHint({ done, total, pct }: { done: number; total: number; pct: number }) {
  return (
    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
      أُنجز {done} من {total} دروس ({pct}٪) · يُحفظ تلقائيًا في متصفحك
    </p>
  );
}

/* ─── Main section ──────────────────────────────────────────── */

export default function LearningHubSection() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [filter, setFilter] = useState<LevelFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [listOpen, setListOpen] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  /* Data loading — plain fetch against /api/lessons */
  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/lessons");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { lessons: Lesson[] };
      setLessons(data.lessons);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* Restore persisted progress (client only, after mount) */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (!raw) return;
      const ids: unknown = JSON.parse(raw);
      if (Array.isArray(ids)) {
        setCompleted(
          new Set(ids.filter((x): x is string => typeof x === "string"))
        );
      }
    } catch {
      // corrupted storage — start fresh
    }
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next]));
      } catch {
        // storage unavailable — keep in-memory only
      }
      return next;
    });
  }, []);

  /* Filtering + visual grouping by level */
  const filtered = useMemo(
    () => (filter === "all" ? lessons : lessons.filter((l) => l.level === filter)),
    [lessons, filter]
  );

  const groups = useMemo(
    () =>
      LEVEL_ORDER.map((level) => ({
        level,
        items: filtered.filter((l) => l.level === level),
      })).filter((g) => g.items.length > 0),
    [filtered]
  );

  /* Keep a valid selection as data / filters change */
  useEffect(() => {
    if (status !== "ready" || filtered.length === 0) return;
    if (!filtered.some((l) => l.id === selectedId)) {
      const first = filtered[0];
      if (first) setSelectedId(first.id);
    }
  }, [status, filtered, selectedId]);

  const active = useMemo(
    () => lessons.find((l) => l.id === selectedId) ?? null,
    [lessons, selectedId]
  );
  const activeIdx = filtered.findIndex((l) => l.id === selectedId);
  const prevLesson = activeIdx > 0 ? filtered[activeIdx - 1] : null;
  const nextLesson =
    activeIdx >= 0 && activeIdx < filtered.length - 1 ? filtered[activeIdx + 1] : null;

  const selectLesson = useCallback(
    (id: string) => {
      setSelectedId(id);
      setListOpen(false);
      requestAnimationFrame(() =>
        viewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    },
    []
  );

  const doneCount = useMemo(
    () => lessons.reduce((acc, l) => (completed.has(l.id) ? acc + 1 : acc), 0),
    [lessons, completed]
  );
  const total = lessons.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  /* ─── Lessons list panel (rendered twice: mobile collapsible + desktop aside) ─── */

  const listSkeleton = (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4"
      aria-hidden
    >
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );

  const listPanel = (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4">
      {/* Overall progress */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
            تقدّمك في المسار
          </span>
          <span className="font-mono text-sm font-bold text-primary" dir="ltr">
            {doneCount} / {total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={doneCount}
          aria-label="نسبة إنجاز الدروس"
          className="h-2 w-full overflow-hidden rounded-full bg-primary/15"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ProgressHint done={doneCount} total={total} pct={pct} />
      </div>

      <Separator />

      {/* Level filter */}
      <div
        role="group"
        aria-label="تصفية الدروس حسب المستوى"
        className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2"
      >
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          const count =
            f.value === "all"
              ? lessons.length
              : lessons.filter((l) => l.level === f.value).length;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={isActive}
              className={cn(
                "flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border px-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "font-mono text-[11px]",
                  isActive ? "text-primary/80" : "text-muted-foreground/70"
                )}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped lessons — scrollable */}
      <div className="-mx-1 max-h-[420px] overflow-y-auto px-1 scrollbar-thin lg:max-h-[calc(100vh-26rem)]">
        {groups.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            لا توجد دروس في هذا المستوى بعد.
          </p>
        ) : (
          groups.map((g) => (
            <div key={g.level} className="mb-5 last:mb-1">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className={cn("h-2 w-2 rounded-full", LEVEL_DOT[g.level])}
                  aria-hidden
                />
                <span className="text-xs font-bold text-muted-foreground">
                  {LEVEL_LABEL[g.level]}
                </span>
                <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {g.items.length}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {g.items.map((l) => {
                  const isSelected = l.id === selectedId;
                  const isDone = completed.has(l.id);
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => selectLesson(l.id)}
                        aria-current={isSelected ? "true" : undefined}
                        className={cn(
                          "flex min-h-[44px] w-full flex-col gap-2 rounded-xl border p-3 text-start transition-all",
                          isSelected
                            ? "border-primary/40 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                            : "border-border bg-background/60 hover:border-primary/30 hover:bg-background"
                        )}
                      >
                        <span className="flex w-full items-center gap-2">
                          <LevelBadge level={l.level} />
                          {isDone && (
                            <CheckCircle2
                              className="h-4 w-4 shrink-0 text-primary"
                              aria-label="درس مكتمل"
                            />
                          )}
                          <span className="ms-auto flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" aria-hidden />
                            {l.durationMin} دقيقة
                          </span>
                        </span>
                        <span
                          className={cn(
                            "line-clamp-1 text-sm font-bold",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {l.title}
                        </span>
                        <span className="flex flex-wrap gap-1">
                          {l.tags.map((t) => (
                            <span
                              key={t}
                              dir="ltr"
                              className="rounded-md bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /* ─── Lesson view ─── */

  const contentSkeleton = (
    <div
      className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:p-8"
      aria-hidden
    >
      <Skeleton className="h-5 w-40 rounded-md" />
      <Skeleton className="h-9 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-5/6 rounded-md" />
    </div>
  );

  const lessonView = active ? (
    <motion.article
      key={active.id}
      {...fadeUp}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Lesson header */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={active.level} />
          <span className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {active.durationMin} دقيقة
          </span>
          {active.tags.map((t) => (
            <span
              key={t}
              dir="ltr"
              className="rounded-md bg-secondary/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {active.title}
          </h3>
          <p dir="ltr" className="font-mono text-sm text-primary/80">
            {active.titleEn}
          </p>
        </div>

        <p className="leading-relaxed text-muted-foreground">{active.description}</p>

        <div>
          <button
            type="button"
            onClick={() => toggleComplete(active.id)}
            aria-pressed={completed.has(active.id)}
            className={cn(
              "flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
              completed.has(active.id)
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
            )}
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            {completed.has(active.id) ? "مكتمل — اضغط للتراجع" : "تم إنهاء هذا الدرس"}
          </button>
        </div>
      </div>

      <Separator />

      {/* Sections */}
      <div className="flex flex-col gap-10 p-4 sm:p-6 lg:p-8">
        {active.sections.map((s, i) => (
          <motion.div
            key={`${active.id}-${i}`}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.06 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                dir="ltr"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-bold sm:text-xl">{s.heading}</h3>
            </div>
            <p className="mb-4 leading-relaxed text-muted-foreground">{s.body}</p>
            {s.code && <CodeBlock code={s.code} output={s.output} />}
            {s.tip && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                <p className="text-sm leading-relaxed text-amber-100/90">
                  <span className="font-bold text-amber-300">نصيحة: </span>
                  {s.tip}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Separator />

      {/* Prev / Next — RTL: "السابق" on the right (start), "التالي" on the left (end) */}
      <nav
        aria-label="التنقل بين الدروس"
        className="flex flex-wrap items-center justify-between gap-3 bg-background/40 p-4 sm:p-6"
      >
        <button
          type="button"
          disabled={!prevLesson}
          onClick={() => {
            if (prevLesson) selectLesson(prevLesson.id);
          }}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
          السابق
        </button>

        <p className="order-last w-full text-center text-xs text-muted-foreground sm:order-none sm:w-auto">
          الدرس <span className="font-mono font-bold text-primary">{activeIdx + 1}</span> من{" "}
          <span className="font-mono font-bold text-primary">{filtered.length}</span>
          {completed.has(active.id) && (
            <span className="ms-2 text-primary">· مكتمل ✓</span>
          )}
        </p>

        <button
          type="button"
          disabled={!nextLesson}
          onClick={() => {
            if (nextLesson) selectLesson(nextLesson.id);
          }}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 disabled:translate-y-0"
        >
          التالي
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </button>
      </nav>
    </motion.article>
  ) : (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
      <GraduationCap className="h-10 w-10 text-muted-foreground/50" aria-hidden />
      <p className="text-sm text-muted-foreground">اختر درسًا من القائمة لتبدأ التعلّم.</p>
    </div>
  );

  const errorPanel = (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center">
      <AlertCircle className="h-10 w-10 text-rose-400" aria-hidden />
      <h3 className="text-lg font-bold">تعذّر تحميل الدروس</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
       حدث خطأ أثناء الاتصال بالخادم. تحقّق من الاتصال ثم أعد المحاولة.
      </p>
      <button
        type="button"
        onClick={() => void load()}
        className="flex min-h-[44px] items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        إعادة المحاولة
      </button>
    </div>
  );

  /* ─── Render ─── */

  return (
    <section id="learning" aria-label="مركز التعلّم" className="py-20">
      <div className="mx-auto w-full max-w-7xl px-4">
        <motion.div {...fadeUp}>
          <SectionHeader
            badge="مركز التعلّم"
            title="تعلّم PyTorch خطوة بخطوة"
            description="ستة دروس تفاعلية مع أمثلة برمجية قابلة للتشغيل — من أساسيات التوتّرات إلى نشر النماذج في الإنتاج. تابع تقدّمك وأكمل المسار درسًا بعد درس."
            icon={GraduationCap}
            className="mb-6"
          />
          <p className="mx-auto mb-10 flex max-w-2xl items-center justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
            بيئة تشغيل محاكاة لأغراض التعلّم: زر التشغيل في كل مثال يعرض النتيجة
            المتوقعة مباشرة داخل المتصفح.
          </p>
        </motion.div>

        {status === "error" ? (
          errorPanel
        ) : (
          <div className="flex flex-col gap-5">
            {/* Mobile: collapsible lessons list trigger */}
            <button
              type="button"
              onClick={() => setListOpen((o) => !o)}
              aria-expanded={listOpen}
              aria-controls="learning-lessons-list"
              className="flex min-h-[44px] w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-start transition-colors hover:border-primary/40 lg:hidden"
            >
              <GraduationCap className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="text-sm font-bold">قائمة الدروس</span>
              <span className="font-mono text-xs text-primary" dir="ltr">
                {status === "ready" ? `${doneCount} / ${total}` : "…"}
              </span>
              <ChevronDown
                className={cn(
                  "ms-auto h-4 w-4 text-muted-foreground transition-transform",
                  listOpen && "rotate-180"
                )}
                aria-hidden
              />
            </button>
            {listOpen && (
              <div id="learning-lessons-list" className="lg:hidden">
                {status === "ready" ? listPanel : listSkeleton}
              </div>
            )}

            {/* Two-pane layout */}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
              <aside className="hidden lg:sticky lg:top-24 lg:block">
                {status === "ready" ? listPanel : listSkeleton}
              </aside>
              <div ref={viewRef} className="scroll-mt-24">
                {status === "ready" ? lessonView : contentSkeleton}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
