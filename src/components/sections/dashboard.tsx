"use client";

// ─── Contributions Dashboard (لوحة بيانات المساهمات) ───
// Demo analytics for pytorch/pytorch. Fetches ContributionsData from
// GET /api/contributions and renders KPIs, charts (recharts), a
// contributors leaderboard, flaky tests and a recent-PRs feed.

import { useEffect, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Star,
  GitFork,
  Users,
  CircleDot,
  GitPullRequest,
  ShieldCheck,
  Crown,
  TriangleAlert,
  RefreshCw,
  FlaskConical,
  Tag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
} from "recharts";
import { SectionHeader } from "@/components/site/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ContributionsData, FlakyTest, RecentPR } from "@/lib/types";

// ─── Shared styling constants ───

const ORANGE = "#f97316";
const AMBER = "#f59e0b";
const EMERALD = "#10b981";

const CHART_TOOLTIP: CSSProperties = {
  backgroundColor: "oklch(0.2 0.01 45)",
  border: "1px solid oklch(1 0 0 / 12%)",
  borderRadius: 8,
  color: "oklch(0.96 0.005 80)",
  fontSize: 12,
  fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
};

const TOOLTIP_LABEL: CSSProperties = {
  color: "oklch(0.96 0.005 80)",
  fontWeight: 600,
  marginBottom: 4,
};

const TOOLTIP_CURSOR = { fill: "oklch(1 0 0 / 6%)" };
const AXIS_TICK = { fill: "oklch(0.71 0.012 70)", fontSize: 10 };
const AXIS_TICK_MONO = {
  fill: "oklch(0.71 0.012 70)",
  fontSize: 10,
  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
};
const AXIS_LINE = { stroke: "oklch(1 0 0 / 12%)" };
const GRID_STROKE = "oklch(1 0 0 / 7%)";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

// ─── Formatting helpers ───

function trim1(v: number): string {
  return v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
}

function fmt(n: number): string {
  if (n >= 100_000) return `${trim1(n / 1000)}K`;
  return n.toLocaleString("en-US");
}

function kfmt(v: number): string {
  return v >= 1000 ? `${trim1(v / 1000)}K` : `${v}`;
}

// ─── KPI definitions ───

type StatKey = "stars" | "forks" | "contributors" | "openIssues" | "openPRs" | "coverage";

interface KpiDef {
  key: StatKey;
  label: string;
  labelEn: string;
  icon: LucideIcon;
  color: string;
  format: (n: number) => string;
}

const KPI_DEFS: KpiDef[] = [
  { key: "stars", label: "نجوم GitHub", labelEn: "GitHub Stars", icon: Star, color: "text-amber-400", format: fmt },
  { key: "forks", label: "فورك", labelEn: "Forks", icon: GitFork, color: "text-primary", format: fmt },
  { key: "contributors", label: "مساهمون", labelEn: "Contributors", icon: Users, color: "text-primary", format: fmt },
  { key: "openIssues", label: "مشاكل مفتوحة", labelEn: "Open issues", icon: CircleDot, color: "text-rose-400", format: fmt },
  { key: "openPRs", label: "طلبات دمج مفتوحة", labelEn: "Open PRs", icon: GitPullRequest, color: "text-emerald-400", format: fmt },
  {
    key: "coverage",
    label: "تغطية الاختبارات",
    labelEn: "Test coverage",
    icon: ShieldCheck,
    color: "text-emerald-400",
    format: (n) => `${n.toFixed(1)}%`,
  },
];

// ─── Status maps ───

const FLAKY_STATUS: Record<FlakyTest["status"], { label: string; labelEn: string; className: string }> = {
  investigating: { label: "يُحقَّق", labelEn: "Investigating", className: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  open: { label: "مفتوح", labelEn: "Open", className: "border-rose-500/40 bg-rose-500/10 text-rose-400" },
  fixed: { label: "أُصلح", labelEn: "Fixed", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
};

const PR_STATUS: Record<RecentPR["status"], { label: string; labelEn: string; className: string; dot: string }> = {
  merged: { label: "مدموج", labelEn: "Merged", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  open: { label: "مفتوح", labelEn: "Open", className: "border-amber-500/40 bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
};

function rateTone(rate: number): { bar: string; text: string; label: string; labelEn: string } {
  const pct = rate * 100;
  if (pct < 2) return { bar: "bg-emerald-500", text: "text-emerald-400", label: "مستقر", labelEn: "Stable" };
  if (pct <= 3) return { bar: "bg-amber-500", text: "text-amber-400", label: "متقلب نوعًا", labelEn: "Slightly flaky" };
  return { bar: "bg-rose-500", text: "text-rose-400", label: "متقلب", labelEn: "Flaky" };
}

// Arabic relative-time strings from src/data/contributions.ts → English
// equivalents ("منذ ساعتين" style → "2h ago" style). Unknown values fall
// back to the raw string.
const RELATIVE_EN: Record<string, string> = {
  "قبل 40 دقيقة": "40m ago",
  "قبل ساعة": "1h ago",
  "قبل ساعتين": "2h ago",
  "قبل 3 ساعات": "3h ago",
  "قبل 5 ساعات": "5h ago",
  "قبل 7 ساعات": "7h ago",
  "أمس": "yesterday",
  "قبل يومين": "2d ago",
  "قبل 3 أيام": "3d ago",
};

function relativeEn(ar: string): string {
  return RELATIVE_EN[ar] ?? ar;
}

// ─── Avatar gradients (deterministic, warm palette) ───

const AVATAR_GRADS = [
  "from-orange-500 to-amber-700",
  "from-amber-500 to-orange-700",
  "from-orange-600 to-rose-700",
  "from-amber-600 to-rose-600",
  "from-rose-500 to-orange-600",
  "from-yellow-600 to-orange-600",
];

function avatarGrad(handle: string): string {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0;
  return AVATAR_GRADS[h % AVATAR_GRADS.length];
}

// ─── Small building blocks ───

function LegendChip({ label, color, dashed }: { label: string; color: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      {dashed ? (
        <span aria-hidden className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
      ) : (
        <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  );
}

function AreaChip({ label }: { label: string }) {
  return (
    <span
      dir="ltr"
      className="inline-block max-w-[9rem] truncate rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground/80"
    >
      {label}
    </span>
  );
}

function CardHeader({
  icon: Icon,
  title,
  hint,
  count,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  count?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <Icon className="h-4 w-4 text-primary" aria-hidden />
          {title}
        </h3>
        {count && (
          <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}

// ─── Skeleton (loading state) ───

function DashboardSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-6 w-44 rounded-full" />
        <Skeleton className="h-6 w-36 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-6 h-[280px] w-full" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 lg:row-span-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-6 h-[340px] w-full" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-6 h-[220px] w-full" />
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-5 w-36" />
            <div className="mt-5 flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-9 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Error state ───

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.div
      {...fadeUp}
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-rose-500/30 bg-card p-10 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
        <TriangleAlert className="h-7 w-7 text-rose-400" aria-hidden />
      </span>
      <h3 className="text-lg font-bold">{t("Failed to load dashboard data", "تعذّر تحميل بيانات اللوحة")}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t(
          "An error occurred while fetching the contributions data from the server",
          "حدث خطأ أثناء جلب بيانات المساهمات من الخادم"
        )}
        <span className="mx-1 font-mono text-rose-400" dir="ltr">
          ({message})
        </span>
        {t("— check your connection and try again.", "— تحقّق من الاتصال ثم أعد المحاولة.")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        {t("Retry", "إعادة المحاولة")}
      </button>
    </motion.div>
  );
}

// ─── Main dashboard content ───

function DashboardContent({ data }: { data: ContributionsData }) {
  const { t, lang } = useLanguage();
  // Relative-time strings come pre-computed (Arabic) from the API; pick the
  // English equivalent map when the UI language is English.
  const rt = (ar: string) => (lang === "en" ? relativeEn(ar) : ar);
  const { stats, weekly, issuesByArea, contributors, coverage, flakyTests, recentPRs } = data;

  return (
    <div>
      {/* Demo-data honesty badge + release chip */}
      <motion.div {...fadeUp} className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          {t("Sample data — not live", "بيانات تجريبية — ليست حية")}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Tag className="h-3.5 w-3.5 text-primary" aria-hidden />
          {t("Latest release", "آخر إصدار")}
          <span className="font-mono font-semibold text-primary" dir="ltr">
            {stats.release}
          </span>
        </span>
      </motion.div>

      {/* ─── KPI row ─── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" role="list" aria-label={t("Key performance indicators", "مؤشرات الأداء الرئيسية")}>
        {KPI_DEFS.map((k, i) => (
          <motion.div
            key={k.key}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.04 }}
            role="listitem"
            className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{t(k.labelEn, k.label)}</span>
              <k.icon className={cn("h-4 w-4 shrink-0", k.color)} aria-hidden />
            </div>
            <p className="mt-2 font-mono text-xl font-bold text-foreground sm:text-2xl" dir="ltr">
              {k.format(stats[k.key])}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ─── Charts grid: weekly + coverage (left) / issues by area (right) ─── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Weekly activity */}
        <motion.article
          {...fadeUp}
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 lg:col-span-2"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold">{t("Weekly activity", "النشاط الأسبوعي")}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("Commits, pull requests and reviews across the last 30 weeks in", "كوميتات وطلبات دمج ومراجعات عبر آخر 30 أسبوعًا في")}{" "}
                <span className="font-mono text-primary/80" dir="ltr">
                  pytorch/pytorch
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <LegendChip label={t("Commits", "كوميتات")} color={ORANGE} />
              <LegendChip label={t("Pull requests", "طلبات الدمج")} color={EMERALD} />
              <LegendChip label={t("Reviews", "مراجعات")} color={AMBER} dashed />
            </div>
          </div>
          <div dir="ltr" className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dash-grad-commits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey={lang === "en" ? "weekEn" : "week"}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={AXIS_LINE}
                  interval={5}
                  tickMargin={8}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  tickFormatter={kfmt}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={TOOLTIP_LABEL} cursor={TOOLTIP_CURSOR} />
                <Area
                  type="monotone"
                  dataKey="commits"
                  name={t("Commits", "كوميتات")}
                  stroke={ORANGE}
                  strokeWidth={2}
                  fill="url(#dash-grad-commits)"
                />
                <Line type="monotone" dataKey="prs" name={t("Pull requests", "طلبات الدمج")} stroke={EMERALD} strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="reviews"
                  name={t("Reviews", "مراجعات")}
                  stroke={AMBER}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        {/* Issues by area (spans both rows) */}
        <motion.article
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 lg:row-span-2"
        >
          <div className="mb-4">
            <h3 className="text-base font-bold">{t("Issues by area", "المشاكل حسب المجال")}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("Open issues per area, with the change trend versus last month.", "عدد المشاكل المفتوحة لكل مجال، مع اتجاه التغيّر مقارنةً بالشهر الماضي.")}
            </p>
          </div>
          <div dir="ltr" className="h-[340px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuesByArea} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="dash-grad-issues" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ee4c2c" />
                    <stop offset="100%" stopColor={ORANGE} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={AXIS_LINE} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey={lang === "en" ? "areaEn" : "area"}
                  tick={AXIS_TICK_MONO}
                  tickLine={false}
                  axisLine={false}
                  width={112}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={TOOLTIP_LABEL} cursor={TOOLTIP_CURSOR} />
                <Bar
                  dataKey="count"
                  name={t("Open issues", "مشاكل مفتوحة")}
                  fill="url(#dash-grad-issues)"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                >
                  <LabelList dataKey="count" position="right" style={{ fill: "oklch(0.71 0.012 70)", fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Trend badges */}
          <div dir="ltr" className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-4">
            {issuesByArea.map((a) => (
              <span
                key={a.area}
                title={a.trend >= 0 ? t("Issue count rising", "زيادة في عدد المشاكل") : t("Issue count falling", "خفض في عدد المشاكل")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2 py-1 font-mono text-[10px] text-muted-foreground"
              >
                {t(a.areaEn, a.area)}
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-semibold",
                    a.trend >= 0 ? "text-rose-400" : "text-emerald-400"
                  )}
                >
                  {a.trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(a.trend)}%
                </span>
              </span>
            ))}
          </div>
        </motion.article>

        {/* Coverage trend */}
        <motion.article
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 lg:col-span-2"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold">{t("Test coverage", "تغطية الاختبارات")}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("Monthly percentage against the", "النسبة الشهرية مقابل الهدف")} <span className="font-mono" dir="ltr">88%</span>{" "}
                {t("target — trending in the right direction.", "— تتّجه للأفضل.")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <LegendChip label={t("Coverage", "التغطية")} color={ORANGE} />
              <LegendChip label={t("Target", "الهدف")} color={AMBER} dashed />
            </div>
          </div>
          <div dir="ltr" className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={coverage} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey={lang === "en" ? "monthEn" : "month"}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={AXIS_LINE}
                  interval={1}
                  tickMargin={8}
                />
                <YAxis
                  domain={[80, 92]}
                  ticks={[80, 84, 88, 92]}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} labelStyle={TOOLTIP_LABEL} cursor={TOOLTIP_CURSOR} />
                <ReferenceLine
                  y={88}
                  stroke={AMBER}
                  strokeDasharray="6 4"
                  label={{ value: t("88% target", "هدف 88%"), fill: AMBER, fontSize: 10, position: "insideTopRight" }}
                />
                <Line
                  type="monotone"
                  dataKey="coverage"
                  name={t("Coverage %", "التغطية %")}
                  stroke={ORANGE}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: ORANGE, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.article>
      </div>

      {/* ─── Bottom row: contributors / flaky tests / recent PRs ─── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Contributors leaderboard */}
        <motion.section
          {...fadeUp}
          aria-label={t("Contributors leaderboard", "لوحة صدارة المساهمين")}
          className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
        >
          <CardHeader
            icon={Users}
            title={t("Contributors leaderboard", "لوحة صدارة المساهمين")}
            hint={t("Most active contributors by commits and reviews.", "الأكثر نشاطًا حسب الكوميتات والمراجعات.")}
            count={t(`Top ${contributors.length}`, `أفضل ${contributors.length}`)}
          />
          <ul className="-mx-2 max-h-[24rem] flex-1 list-none overflow-y-auto px-2 scrollbar-thin">
            {contributors.map((c, i) => (
              <li
                key={c.handle}
                className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"
              >
                <span className="w-6 shrink-0 text-center font-mono text-sm text-muted-foreground" dir="ltr">
                  {i + 1}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-mono text-[11px] font-bold text-white/95",
                    avatarGrad(c.handle)
                  )}
                >
                  {c.handle.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-mono text-sm font-semibold text-foreground" dir="ltr">
                      {c.handle}
                    </span>
                    {i === 0 && <Crown className="h-4 w-4 shrink-0 text-amber-400" aria-label={t("Top contributor", "المساهم الأول")} />}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <span className="truncate">{c.name}</span>
                    <span aria-hidden>·</span>
                    <span dir="ltr" className="shrink-0 font-mono text-[10px] text-primary/70">
                      {t(c.focusEn, c.focus)}
                    </span>
                  </p>
                </div>
                <div className="grid shrink-0 grid-cols-3 gap-2 text-center sm:gap-3">
                  {(
                    [
                      [t("Commits", "كوميت"), c.commits],
                      [t("PRs", "دمج"), c.prs],
                      [t("Reviews", "مراجعة"), c.reviews],
                    ] as const
                  ).map(([label, v]) => (
                    <div key={label}>
                      <p className="font-mono text-xs font-semibold text-foreground sm:text-sm" dir="ltr">
                        {fmt(v)}
                      </p>
                      <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Flaky tests */}
        <motion.section
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
          aria-label={t("Flaky tests", "اختبارات متقلبة")}
          className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
        >
          <CardHeader
            icon={FlaskConical}
            title={t("Flaky tests under watch", "اختبارات متقلبة تحت المراقبة")}
            hint={t("Estimated failure rate per test across CI runs.", "نسبة الفشل التقديرية لكل اختبار في دورة CI.")}
            count={t(`${flakyTests.length} tests`, `${flakyTests.length} اختبارات`)}
          />
          <ul className="-mx-2 flex-1 list-none px-2">
            {flakyTests.map((ft) => {
              const tone = rateTone(ft.failureRate);
              const status = FLAKY_STATUS[ft.status];
              return (
                <li key={ft.name} className="border-b border-border/60 py-3 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="min-w-0 truncate font-mono text-xs text-foreground"
                      dir="ltr"
                      title={ft.name}
                    >
                      {ft.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        status.className
                      )}
                    >
                      {t(status.labelEn, status.label)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <AreaChip label={t(ft.areaEn, ft.area)} />
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
                      role="meter"
                      aria-valuenow={Math.round(ft.failureRate * 1000) / 10}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={t(`Failure rate of ${ft.name}`, `نسبة فشل ${ft.name}`)}
                    >
                      <div
                        className={cn("h-full rounded-full", tone.bar)}
                        style={{ width: `${Math.min(100, ft.failureRate * 2000)}%` }}
                      />
                    </div>
                    <span className={cn("shrink-0 font-mono text-xs font-semibold", tone.text)} dir="ltr">
                      {(ft.failureRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {t("Last failed:", "آخر فشل:")} {rt(ft.lastFailed)} · <span className={tone.text}>{t(tone.labelEn, tone.label)}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* Recent PRs */}
        <motion.section
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.16 }}
          aria-label={t("Recent pull requests", "أحدث طلبات الدمج")}
          className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
        >
          <CardHeader
            icon={GitPullRequest}
            title={t("Recent pull requests", "أحدث طلبات الدمج")}
            hint={t("Latest repository activity with change sizes.", "آخر النشاطات في المستودع مع حجم التغييرات.")}
            count={t(`${recentPRs.length} PRs`, `${recentPRs.length} طلبات`)}
          />
          <ul className="-mx-2 max-h-[24rem] flex-1 list-none overflow-y-auto px-2 scrollbar-thin">
            {recentPRs.map((pr) => {
              const status = PR_STATUS[pr.status];
              return (
                <li key={pr.id} className="flex items-start gap-2.5 border-b border-border/60 py-3 last:border-0">
                  <span className="shrink-0 pt-0.5 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    #{pr.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground" title={pr.title} dir="ltr">
                      {pr.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs text-primary/90" dir="ltr">
                        @{pr.author}
                      </span>
                      <AreaChip label={t(pr.areaEn, pr.area)} />
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          status.className
                        )}
                      >
                        <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                        {t(status.labelEn, status.label)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{rt(pr.mergedAt)}</span>
                    </div>
                  </div>
                  <span className="shrink-0 pt-0.5 font-mono text-[11px]" dir="ltr">
                    <span className="text-emerald-400">+{fmt(pr.added)}</span>{" "}
                    <span className="text-rose-400">-{fmt(pr.removed)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.section>
      </div>
    </div>
  );
}

// ─── Section entry ───

export default function DashboardSection() {
  const { t } = useLanguage();

  type FetchState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ok"; data: ContributionsData };

  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  const retry = () => {
    setState({ status: "loading" });
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    const ctrl = new AbortController();

    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/contributions`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ContributionsData;
      })
      .then((d) => setState({ status: "ok", data: d }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setState({ status: "error", message: e instanceof Error ? e.message : "network error" });
      });

    return () => ctrl.abort();
  }, [reloadKey]);

  return (
    <section aria-label={t("Contributions dashboard", "لوحة بيانات المساهمات")} className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20">
      <SectionHeader
        badge={t("Sample data", "بيانات تجريبية")}
        title={t("Contributions Dashboard", "لوحة بيانات المساهمات")}
        description={t(
          "A realistic model of pytorch/pytorch repository activity: weekly commits, issue distribution, test coverage, a contributors leaderboard, and flaky tests — demo numbers generated with lifelike patterns, not live data from GitHub.",
          "نموذج واقعي لنشاط مستودع pytorch/pytorch: كوميتات أسبوعية، توزيع المشاكل، تغطية الاختبارات، لوحة صدارة المساهمين، واختبارات متقلبة — أرقام تجريبية مولّدة بأنماط قريبة من الواقع، وليست بيانات حية من GitHub."
        )}
        icon={BarChart3}
      />

      {state.status === "loading" && <DashboardSkeleton />}
      {state.status === "error" && <ErrorState message={state.message} onRetry={retry} />}
      {state.status === "ok" && <DashboardContent data={state.data} />}
    </section>
  );
}
