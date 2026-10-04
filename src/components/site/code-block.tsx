"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type TokType =
  | "kw"
  | "str"
  | "com"
  | "num"
  | "dec"
  | "bi"
  | "mod"
  | "plain";

interface Tok {
  t: TokType;
  v: string;
}

const KEYWORDS = new Set([
  "import", "from", "as", "def", "class", "return", "if", "else", "elif",
  "for", "while", "in", "not", "and", "or", "is", "None", "True", "False",
  "with", "lambda", "pass", "break", "continue", "try", "except", "finally",
  "raise", "yield", "async", "await", "global", "assert", "del",
]);

const BUILTINS = new Set([
  "print", "range", "len", "super", "sum", "min", "max", "abs", "round",
  "enumerate", "zip", "list", "dict", "set", "tuple", "int", "float", "str",
  "isinstance", "hasattr", "getattr", "setattr", "open", "type",
]);

const MODULES = new Set([
  "torch", "nn", "F", "np", "optim", "autograd", "Tensor", "jit", "amp",
  "distributed", "utils", "data",
]);

const TOK_CLASS: Record<TokType, string> = {
  kw: "text-orange-400 font-medium",
  str: "text-emerald-300",
  com: "text-zinc-500 italic",
  num: "text-amber-300",
  dec: "text-rose-300",
  bi: "text-teal-300",
  mod: "text-orange-200 font-semibold",
  plain: "text-zinc-200",
};

function tokenize(code: string): Tok[] {
  const re =
    /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*')|(@\w+)|\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\b([A-Za-z_]\w*)\b/g;
  const toks: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) toks.push({ t: "plain", v: code.slice(last, m.index) });
    if (m[1]) toks.push({ t: "com", v: m[1] });
    else if (m[2]) toks.push({ t: "str", v: m[2] });
    else if (m[3]) toks.push({ t: "dec", v: m[3] });
    else if (m[4]) toks.push({ t: "num", v: m[4] });
    else if (m[5]) {
      const w = m[5];
      if (KEYWORDS.has(w)) toks.push({ t: "kw", v: w });
      else if (BUILTINS.has(w)) toks.push({ t: "bi", v: w });
      else if (MODULES.has(w)) toks.push({ t: "mod", v: w });
      else toks.push({ t: "plain", v: w });
    }
    last = m.index + m[0].length;
  }
  if (last < code.length) toks.push({ t: "plain", v: code.slice(last) });
  return toks;
}

export interface CodeBlockProps {
  code: string;
  title?: string;
  /** When provided, a "تشغيل" button reveals the simulated console output */
  output?: string;
  className?: string;
  /** Compact padding variant for dense panels */
  compact?: boolean;
}

export function CodeBlock({ code, title, output, className, compact }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [ran, setRan] = useState(false);
  const toks = useMemo(() => tokenize(code), [code]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div
      dir="ltr"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-[oklch(0.13_0.01_50)] shadow-lg shadow-black/20",
        className
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-border/70 bg-white/[0.03] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
          {title ?? "example.py"}
        </span>
        <span className="flex-1" />
        {output && (
          <button
            type="button"
            onClick={() => setRan((r) => !r)}
            className="flex min-h-[28px] items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
            aria-pressed={ran}
          >
            {ran ? <RotateCcw className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {ran ? "reset" : "run"}
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          className="flex min-h-[28px] items-center gap-1 rounded-md border border-border bg-white/5 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>

      {/* Code */}
      <pre
        className={cn(
          "overflow-x-auto scrollbar-thin font-mono text-[13px] leading-relaxed",
          compact ? "px-3 py-2.5" : "px-4 py-3.5"
        )}
      >
        <code className="whitespace-pre text-left">
          {toks.map((tk, i) => (
            <span key={i} className={TOK_CLASS[tk.t]}>
              {tk.v}
            </span>
          ))}
        </code>
      </pre>

      {/* Simulated output */}
      {output && ran && (
        <div className="border-t border-border/70 bg-black/30 px-4 py-3">
          <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            console
          </p>
          <pre className="overflow-x-auto scrollbar-thin whitespace-pre font-mono text-[12.5px] leading-relaxed text-emerald-200/90">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
