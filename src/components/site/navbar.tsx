"use client";

import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Github,
  Star,
  Home,
  GraduationCap,
  FlaskConical,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, type Lang } from "@/lib/i18n";

export interface NavTab {
  id: string;
  label: string;
  labelEn: string;
  icon: LucideIcon;
}

export const NAV_TABS: NavTab[] = [
  { id: "overview", label: "الرئيسية", labelEn: "Home", icon: Home },
  { id: "learning", label: "مركز التعلّم", labelEn: "Learning Hub", icon: GraduationCap },
  { id: "playground", label: "الملعب العصبي", labelEn: "Playground", icon: FlaskConical },
  { id: "dashboard", label: "لوحة المساهمات", labelEn: "Dashboard", icon: BarChart3 },
  { id: "api", label: "مرجع API", labelEn: "API Reference", icon: BookOpen },
];

export interface NavbarProps {
  active: string;
  onChange: (id: string) => void;
}

function LangSwitch() {
  const { lang, setLang, t } = useLanguage();
  const options: { id: Lang; label: string }[] = [
    { id: "en", label: "EN" },
    { id: "ar", label: "عربي" },
  ];
  return (
    <div
      role="group"
      aria-label={t("Language", "اللغة")}
      className="flex items-center rounded-full border border-border bg-card p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={cn(
            "flex min-h-[32px] min-w-[44px] items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors",
            lang === o.id
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Navbar({ active, onChange }: NavbarProps) {
  const { t } = useLanguage();

  const renderTab = (tab: NavTab) => {
    const Icon = tab.icon;
    const isActive = active === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
          isActive
            ? "border-primary/40 bg-primary/15 text-primary shadow-[0_0_18px_-4px] shadow-primary/40"
            : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {t(tab.labelEn, tab.label)}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onChange("overview")}
            className="flex items-center gap-3"
            aria-label={t("PyTorch — back to home", "PyTorch — العودة للرئيسية")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-lg shadow-primary/30">
              <Flame className="h-5 w-5 text-white" />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-lg font-bold tracking-tight">PyTorch</span>
              <span className="text-[11px] text-muted-foreground">
                {t("Interactive Platform", "منصة تفاعلية عربية")}
              </span>
            </span>
          </button>

          {/* Desktop tabs */}
          <nav aria-label={t("Main navigation", "التنقل الرئيسي")} className="hidden items-center gap-1 md:flex">
            {NAV_TABS.map(renderTab)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LangSwitch />
            <span className="hidden rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground sm:inline-flex">
              v2.7.0
            </span>
            <a
              href="https://github.com/pytorch/pytorch"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[40px] items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              aria-label={t("PyTorch repository on GitHub", "مستودع PyTorch على GitHub")}
            >
              <Github className="h-4 w-4" />
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden font-mono text-xs sm:inline">88.7k</span>
            </a>
          </div>
        </div>

        {/* Mobile tabs */}
        <nav
          aria-label={t("Main navigation — mobile", "التنقل الرئيسي — الجوال")}
          className="flex gap-1 overflow-x-auto pb-3 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_TABS.map(renderTab)}
        </nav>
      </div>
    </header>
  );
}
