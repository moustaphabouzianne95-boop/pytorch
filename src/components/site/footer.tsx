"use client";

import { Flame, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export interface FooterProps {
  onNavigate: (id: string) => void;
}

const QUICK_LINKS = [
  { id: "learning", label: "مركز التعلّم", labelEn: "Learning Hub" },
  { id: "playground", label: "الملعب العصبي", labelEn: "Neural Playground" },
  { id: "dashboard", label: "لوحة المساهمات", labelEn: "Contributions Dashboard" },
  { id: "api", label: "مرجع API", labelEn: "API Reference" },
];

export function Footer({ onNavigate }: FooterProps) {
  const { t, lang } = useLanguage();

  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-amber-600">
                <Flame className="h-4.5 w-4.5 text-white" />
              </span>
              <span className="text-base font-bold">
                {t("PyTorch — Interactive Platform", "PyTorch — منصة تفاعلية")}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t(
                "An interactive tour of the PyTorch framework and its ecosystem: step-by-step lessons, a neural-network playground running in your browser, a contributions dashboard, and a searchable API reference.",
                "عرض تفاعلي لميزات إطار PyTorch ونظامه البيئي: تعلّم تدريجي، ملعب شبكات عصبية يعمل في متصفحك، لوحة مساهمات، ومرجع API قابل للبحث."
              )}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label={t("Quick links", "روابط سريعة")} className="flex flex-col gap-2">
            <h3 className="mb-1 text-sm font-semibold text-foreground">
              {t("Quick links", "روابط سريعة")}
            </h3>
            {QUICK_LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onNavigate(l.id)}
                className="min-h-[36px] w-fit text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {t(l.labelEn, l.label)}
              </button>
            ))}
          </nav>

          {/* Resources */}
          <div className="flex flex-col gap-2">
            <h3 className="mb-1 text-sm font-semibold text-foreground">
              {t("Official resources", "مصادر رسمية")}
            </h3>
            {[
              { href: "https://pytorch.org", label: "pytorch.org" },
              {
                href: "https://pytorch.org/docs/stable/index.html",
                label: t("Official documentation", "التوثيق الرسمي"),
              },
              {
                href: "https://github.com/pytorch/pytorch",
                label: "GitHub — pytorch/pytorch",
              },
              {
                href: "https://discuss.pytorch.org",
                label: t("Discussion forums", "منتديات النقاش"),
              },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[36px] w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
                <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            {t(
              "© {year} — Unofficial educational demo. PyTorch is a trademark of Meta Platforms.",
              "© {year} — مشروع تعليمي توضيحي غير رسمي. PyTorch علامة مسجّلة لشركة Meta Platforms."
            ).replace("{year}", String(new Date().getFullYear()))}
          </p>
          <p dir="ltr" className="font-mono">
            Built with Next.js 16 · Tailwind 4 · Ms.Dev-Code
          </p>
        </div>
      </div>MS
    </footer>
  );
}
