import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  align?: "center" | "start";
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  icon: Icon,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className
      )}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {badge}
        </span>
      )}
      <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <span className="mt-1 block h-1 w-16 rounded-full bg-gradient-to-r from-primary via-amber-500/80 to-transparent rtl:bg-gradient-to-l" />
    </div>
  );
}
