"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  Braces,
  Check,
  ChevronDown,
  Copy,
  CornerDownLeft,
  MousePointerClick,
  RotateCcw,
  Search,
  SearchX,
  Terminal,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CodeBlock } from "@/components/site/code-block";
import { SectionHeader } from "@/components/site/section-header";
import { useLanguage } from "@/lib/i18n";
import type { DocEntry, DocGroup, DocKind } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ─── Shared animation pattern (same as overview.tsx) ─── */
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

interface FlatEntry {
  entry: DocEntry;
  groupId: string;
  groupName: string;
}

type FetchStatus = "loading" | "ready" | "error";

/* ─── Kind metadata: class=orange / function=emerald / method=amber / property=zinc ─── */
const KIND_META: Record<DocKind, { labelEn: string; label: string; cls: string }> = {
  class: {
    labelEn: "class",
    label: "صنف",
    cls: "border-primary/40 bg-primary/10 text-primary",
  },
  function: {
    labelEn: "function",
    label: "دالة",
    cls: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
  },
  method: {
    labelEn: "method",
    label: "طريقة",
    cls: "border-amber-500/35 bg-amber-500/10 text-amber-300",
  },
  property: {
    labelEn: "property",
    label: "خاصية",
    cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  },
  module: {
    labelEn: "module",
    label: "وحدة",
    cls: "border-rose-500/35 bg-rose-500/10 text-rose-300",
  },
};

const isLatin = (s: string) => /^[A-Za-z0-9_.\-/]+$/.test(s);

function pluralResults(
  n: number,
  t: (en: string, ar: string) => string
): string {
  if (n === 0) return t("No results", "لا نتائج");
  if (n === 1) return t("1 result", "نتيجة واحدة");
  if (n === 2) return t("2 results", "نتيجتان");
  if (n <= 10) return t(`${n} results`, `${n} نتائج`);
  return t(`${n} results`, `${n} نتيجة`);
}

/* ─── Small building blocks ─── */

function KindBadge({ kind }: { kind: DocKind }) {
  const { t } = useLanguage();
  const meta = KIND_META[kind];
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
        meta.cls
      )}
    >
      {t(meta.labelEn, meta.label)}
    </Badge>
  );
}

function CopyButton({ text }: { text: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — ignore
    }
  };
  return (
    <Button
      type="button"
      variant="outline"
      onClick={copy}
      aria-label={t("Copy signature", "نسخ التوقيع")}
      className="min-h-[44px] gap-1.5 rounded-lg border-border bg-secondary/60 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      {copied ? t("Copied", "تم النسخ") : t("Copy", "نسخ")}
    </Button>
  );
}

/* ─── Full detail view (used by desktop panel + mobile accordion) ─── */

function EntryDetail({ entry }: { entry: DocEntry }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-5">
      {/* Name + kind */}
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 dir="ltr" className="font-mono text-xl font-bold text-foreground">
          {entry.name}
        </h3>
        <KindBadge kind={entry.kind} />
      </div>

      {/* Signature (LTR mono box + copy) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t("Signature", "التوقيع الكامل")}
          </h4>
          <CopyButton text={entry.signature} />
        </div>
        <div
          dir="ltr"
          className="overflow-x-auto scrollbar-thin rounded-xl border border-border bg-[oklch(0.13_0.01_50)] px-4 py-3 text-left font-mono text-[13px] leading-relaxed text-zinc-100 shadow-inner"
        >
          <code className="whitespace-pre-wrap break-words">
            {entry.signature}
          </code>
        </div>
      </div>

      {/* Description (active language) */}
      <p className="text-sm leading-relaxed text-foreground/90">
        {t(entry.descriptionEn, entry.description)}
      </p>

      {/* Params table */}
      {entry.params && entry.params.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="flex items-center gap-1.5 text-sm font-bold">
            <Braces className="h-4 w-4 text-primary" aria-hidden />
            {t("Parameters", "المعاملات")}
            <Badge variant="secondary" className="font-mono text-[10px]">
              {entry.params.length}
            </Badge>
          </h4>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                  <TableHead className="w-[110px] px-3 text-start">
                    {t("Name", "الاسم")}
                  </TableHead>
                  <TableHead className="w-[150px] px-3 text-start">
                    {t("Type", "النوع")}
                  </TableHead>
                  <TableHead className="px-3 text-start">
                    {t("Description", "الوصف")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.params.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell
                      dir="ltr"
                      className="whitespace-normal px-3 align-top font-mono text-xs font-semibold text-foreground"
                    >
                      {p.name}
                    </TableCell>
                    <TableCell
                      dir="ltr"
                      className="whitespace-normal break-words px-3 align-top font-mono text-xs text-emerald-300"
                    >
                      {p.type}
                    </TableCell>
                    <TableCell className="whitespace-normal px-3 align-top text-xs leading-relaxed text-muted-foreground">
                      {t(p.descEn, p.desc)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Returns */}
      {entry.returns && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <CornerDownLeft
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-foreground/90">
            <span className="font-bold text-amber-300">
              {t("Returns: ", "القيمة المرجعة: ")}
            </span>
            {t(entry.returnsEn ?? entry.returns, entry.returns)}
          </p>
        </div>
      )}

      {/* Example */}
      {entry.example && (
        <div className="flex flex-col gap-2">
          <h4 className="flex items-center gap-1.5 text-sm font-bold">
            <Terminal className="h-4 w-4 text-emerald-400" aria-hidden />
            {t("Example", "مثال عملي")}
          </h4>
          <CodeBlock code={entry.example} title={entry.name} compact />
        </div>
      )}
    </div>
  );
}

/* ─── Desktop master-list row ─── */

function EntryListItem({
  f,
  selected,
  showGroup,
  onSelect,
}: {
  f: FlatEntry;
  selected: boolean;
  showGroup: boolean;
  onSelect: () => void;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex min-h-[64px] w-full flex-col gap-1.5 border-b border-border/60 border-s-2 px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-accent/40",
        selected
          ? "border-s-primary bg-primary/10"
          : "border-s-transparent"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          dir="ltr"
          className="truncate font-mono text-sm font-semibold text-foreground"
        >
          {f.entry.name}
        </span>
        {showGroup && (
          <span
            dir="ltr"
            className="ms-auto hidden shrink-0 font-mono text-[10px] text-muted-foreground/80 sm:block"
          >
            {f.groupName}
          </span>
        )}
        <span className={cn("shrink-0", !showGroup && "ms-auto")}>
          <KindBadge kind={f.entry.kind} />
        </span>
      </div>
      <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground">
        {t(f.entry.descriptionEn, f.entry.description)}
      </p>
    </button>
  );
}

/* ─── Mobile accordion card ─── */

function MobileEntryCard({
  f,
  open,
  onToggle,
}: {
  f: FlatEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-colors",
        open ? "border-primary/40" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-start"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span
              dir="ltr"
              className="truncate font-mono text-sm font-semibold text-foreground"
            >
              {f.entry.name}
            </span>
            <span className="ms-auto shrink-0">
              <KindBadge kind={f.entry.kind} />
            </span>
          </div>
          <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground">
            {t(f.entry.descriptionEn, f.entry.description)}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/70 px-4 pb-5 pt-4">
              <EntryDetail entry={f.entry} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Empty / error / loading states ─── */

function EmptyResults({ query, onClear }: { query: string; onClear: () => void }) {
  const { t, lang } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <SearchX className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="text-lg font-bold">
        {t("No matching results", "لا توجد نتائج مطابقة")}
      </h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {lang === "en" ? (
          <>
            No matches for “{query}” among names, signatures, or descriptions.
            Try a shorter term, or a Latin name like{" "}
            <span dir="ltr" className="font-mono text-primary">
              Adam
            </span>{" "}
            or{" "}
            <span dir="ltr" className="font-mono text-primary">
              unsqueeze
            </span>
            .
          </>
        ) : (
          <>
            لم نعثر على «{query}» بين الأسماء أو التوقيعات أو الأوصاف العربية.
            جرّب كلمة أقصر، أو اسمًا لاتينيًا مثل{" "}
            <span dir="ltr" className="font-mono text-primary">
              Adam
            </span>{" "}
            أو{" "}
            <span dir="ltr" className="font-mono text-primary">
              unsqueeze
            </span>
            .
          </>
        )}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        className="min-h-[44px] gap-2"
      >
        <X className="h-4 w-4" aria-hidden />
        {t("Clear search", "مسح البحث")}
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
        <AlertCircle className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="text-lg font-bold">
        {t("Something went wrong while loading", "حدث خطأ أثناء التحميل")}
      </h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {t(
          "Failed to load the API reference from the server. Check your connection and try again.",
          message
        )}
      </p>
      <Button type="button" onClick={onRetry} className="min-h-[44px] gap-2">
        <RotateCcw className="h-4 w-4" aria-hidden />
        {t("Retry", "إعادة المحاولة")}
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  const { t } = useLanguage();
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-label={t("Loading the API reference…", "جارٍ تحميل مرجع API…")}
    >
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ─── */

export default function ApiExplorerSection() {
  const { t, lang, isRtl } = useLanguage();
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [groups, setGroups] = useState<DocGroup[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");
  /** undefined = derive (first result) · null = explicitly closed (mobile) · string = explicit pick */
  const [manualId, setManualId] = useState<string | null | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* Fetch docs from the REST API (state updates only inside async callbacks) */
  useEffect(() => {
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/docs`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { groups?: DocGroup[] };
        if (!data || !Array.isArray(data.groups) || data.groups.length === 0) {
          throw new Error("bad payload");
        }
        if (!cancelled) {
          setGroups(data.groups);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMsg(
            "تعذّر تحميل مرجع API من الخادم. تحقق من الاتصال ثم أعد المحاولة."
          );
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /* "/" focuses the search box (unless already typing in a field) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Flatten groups once data arrives */
  const flat = useMemo<FlatEntry[]>(
    () =>
      (groups ?? []).flatMap((g) =>
        g.entries.map((e) => ({
          entry: e,
          groupId: g.id,
          groupName: lang === "en" && g.nameEn ? g.nameEn : g.name,
        }))
      ),
    [groups, lang]
  );

  /* Instant search: name + signature + description in the active language */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const needle = lang === "en" ? q : query.trim();
    return flat.filter((f) => {
      if (activeGroup !== "all" && f.groupId !== activeGroup) return false;
      if (!q) return true;
      const desc =
        lang === "en"
          ? f.entry.descriptionEn.toLowerCase()
          : f.entry.description;
      return (
        f.entry.name.toLowerCase().includes(q) ||
        f.entry.signature.toLowerCase().includes(q) ||
        desc.includes(needle)
      );
    });
  }, [flat, activeGroup, query, lang]);

  /* Displayed entry: explicit pick wins; otherwise fall back to the first result.
     Pure derivation — no selection effect needed. */
  const active = useMemo(
    () => filtered.find((f) => f.entry.name === manualId) ?? filtered[0] ?? null,
    [filtered, manualId]
  );

  /* Scroll the master list back to top when the scope changes */
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [activeGroup, query]);

  const groupTabs = useMemo(
    () => [
      { id: "all", name: t("All", "الكل"), count: flat.length },
      ...(groups ?? []).map((g) => ({
        id: g.id,
        name: t(g.nameEn ?? g.name, g.name),
        count: g.entries.length,
      })),
    ],
    [groups, flat.length, t]
  );

  const activeGroupDesc =
    activeGroup === "all"
      ? null
      : ((groups ?? []).find((g) => g.id === activeGroup) ?? null);

  const clearSearch = () => {
    setQuery("");
    setManualId(undefined);
    inputRef.current?.focus();
  };

  const retry = () => {
    setManualId(undefined);
    setStatus("loading");
    setReloadToken((t) => t + 1);
  };

  const selectGroup = (id: string) => {
    setActiveGroup(id);
    setManualId(undefined);
  };

  return (
    <section
      className="relative overflow-hidden py-20"
      aria-label={t("PyTorch API reference", "مرجع PyTorch API")}
    >
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 start-1/3 h-80 w-80 rounded-full bg-primary/10 blur-[110px]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <motion.div {...fadeUp}>
          <SectionHeader
            badge={t("Searchable reference", "مرجع قابل للبحث")}
            title={t("PyTorch API Explorer", "مستكشف PyTorch API")}
            description={t(
              "Interactive documentation for 60+ functions and classes across torch.Tensor, torch.autograd, torch.nn, torch.optim, and torch.utils.data — instant search by name, signature, or description, with copy-ready examples.",
              "توثيق تفاعلي لأكثر من 60 دالة وصنفًا عبر torch.Tensor و torch.autograd و torch.nn و torch.optim و torch.utils.data — بحث فوري بالاسم والتوقيع والشرح العربي، مع أمثلة جاهزة للنسخ."
            )}
            icon={BookOpen}
          />
        </motion.div>

        {/* Search bar */}
        <motion.div {...fadeUp} className="mb-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setManualId(undefined);
              }}
              placeholder={t(
                "Search for a function or class… by name, signature, or description",
                "ابحث عن دالة أو صنف… بالاسم أو التوقيع أو الشرح العربي"
              )}
              aria-label={t(
                "Search the PyTorch API reference",
                "بحث في مرجع PyTorch API"
              )}
              className="h-14 rounded-2xl border-border bg-card ps-12 pe-24 text-base shadow-sm"
            />
            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={t("Clear search", "مسح البحث")}
                className="absolute end-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <kbd
                className="absolute end-4 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground sm:flex"
                aria-hidden
              >
                /
              </kbd>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <p
              className="text-xs font-medium text-muted-foreground"
              aria-live="polite"
            >
              {pluralResults(filtered.length, t)}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {t("Press", "اضغط")}{" "}
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
                /
              </kbd>{" "}
              {t("to jump to the search box", "للانتقال السريع إلى البحث")}
            </p>
          </div>
        </motion.div>

        {/* Group selector with counts */}
        <motion.div {...fadeUp} className="mb-6 flex flex-wrap items-center gap-2">
          {groupTabs.map((t) => {
            const active = activeGroup === t.id;
            const latin = isLatin(t.name);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectGroup(t.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all",
                  active
                    ? "border-primary/50 bg-primary/15 text-primary shadow-sm shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <span
                  dir={latin ? "ltr" : isRtl ? "rtl" : "ltr"}
                  className={cn("text-[13px]", latin && "font-mono")}
                >
                  {t.name}
                </span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 font-mono text-[11px]",
                    active
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Active scope description */}
        {status === "ready" && groups && (
          <p className="mb-6 -mt-2 text-sm leading-relaxed text-muted-foreground">
            {activeGroup === "all" ? (
              lang === "en" ? (
                <>
                  Browsing every group —{" "}
                  <span className="font-mono text-primary">
                    {flat.length}
                  </span>{" "}
                  documented entries with descriptions and copy-ready examples.
                </>
              ) : (
                <>
                  عرض شامل لكل المجموعات —{" "}
                  <span className="font-mono text-primary">
                    {flat.length}
                  </span>{" "}
                  عنصرًا موثقًا بشرح عربي وأمثلة قابلة للنسخ.
                </>
              )
            ) : (
              activeGroupDesc &&
              t(activeGroupDesc.descriptionEn, activeGroupDesc.description)
            )}
          </p>
        )}

        {/* Content */}
        {status === "loading" && <LoadingSkeleton />}
        {status === "error" && <ErrorState message={errorMsg ?? ""} onRetry={retry} />}
        {status === "ready" && groups && filtered.length === 0 && (
          <motion.div {...fadeUp}>
            <EmptyResults query={query.trim()} onClear={clearSearch} />
          </motion.div>
        )}
        {status === "ready" && groups && filtered.length > 0 && (
          <>
            {/* Desktop: master–detail */}
            <motion.div
              {...fadeUp}
              className="hidden lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-6"
            >
              {/* Master list */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-bold">
                    {t("Entries", "قائمة العناصر")}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="font-mono text-[11px]"
                    dir={isRtl ? "rtl" : "ltr"}
                  >
                    {pluralResults(filtered.length, t)}
                  </Badge>
                </div>
                <div
                  ref={listRef}
                  className="max-h-[560px] overflow-y-auto scrollbar-thin"
                >
                  {filtered.map((f) => (
                    <EntryListItem
                      key={f.entry.name}
                      f={f}
                      selected={f.entry.name === active?.entry.name}
                      showGroup={activeGroup === "all"}
                      onSelect={() => setManualId(f.entry.name)}
                    />
                  ))}
                </div>
              </div>

              {/* Detail panel */}
              <aside className="overflow-y-auto scrollbar-thin rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)]">
                {active ? (
                  <motion.div
                    key={active.entry.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <EntryDetail entry={active.entry} />
                  </motion.div>
                ) : (
                  <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                      <MousePointerClick className="h-7 w-7" aria-hidden />
                    </span>
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {t(
                        "Select an entry from the list to view its full signature, parameters, and a working example.",
                        "اختر عنصرًا من القائمة لعرض توقيعه الكامل ومعاملاته ومثاله العملي."
                      )}
                    </p>
                  </div>
                )}
              </aside>
            </motion.div>

            {/* Mobile: accordion cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {filtered.map((f) => (
                <MobileEntryCard
                  key={f.entry.name}
                  f={f}
                  open={f.entry.name === manualId}
                  onToggle={() =>
                    setManualId(
                      f.entry.name === manualId ? null : f.entry.name
                    )
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
