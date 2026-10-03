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

export interface NavTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_TABS: NavTab[] = [
  { id: "overview", label: "الرئيسية", icon: Home },
  { id: "learning", label: "مركز التعلّم", icon: GraduationCap },
  { id: "playground", label: "الملعب العصبي", icon: FlaskConical },
  { id: "dashboard", label: "لوحة المساهمات", icon: BarChart3 },
  { id: "api", label: "مرجع API", icon: BookOpen },
];

export interface NavbarProps {
  active: string;
  onChange: (id: string) => void;
}

export function Navbar({ active, onChange }: NavbarProps) {
  const renderTab = (t: NavTab) => {
    const Icon = t.icon;
    const isActive = active === t.id;
    return (
      <button
        key={t.id}
        type="button"
        onClick={() => onChange(t.id)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-[40px] shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
          isActive
            ? "border-primary/40 bg-primary/15 text-primary shadow-[0_0_18px_-4px] shadow-primary/40"
            : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {t.label}
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
            aria-label="PyTorch — العودة للرئيسية"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-lg shadow-primary/30">
              <Flame className="h-5 w-5 text-white" />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-lg font-bold tracking-tight">PyTorch</span>
              <span className="text-[11px] text-muted-foreground">منصة تفاعلية عربية</span>
            </span>
          </button>

          {/* Desktop tabs */}
          <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 md:flex">
            {NAV_TABS.map(renderTab)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground sm:inline-flex">
              v2.7.0
            </span>
            <a
              href="https://github.com/pytorch/pytorch"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[40px] items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="مستودع PyTorch على GitHub"
            >
              <Github className="h-4 w-4" />
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden font-mono text-xs sm:inline">88.7k</span>
            </a>
          </div>
        </div>

        {/* Mobile tabs */}
        <nav
          aria-label="التنقل الرئيسي — الجوال"
          className="flex gap-1 overflow-x-auto pb-3 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_TABS.map(renderTab)}
        </nav>
      </div>
    </header>
  );
}
