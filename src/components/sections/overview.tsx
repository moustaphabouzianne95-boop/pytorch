"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Workflow,
  Zap,
  Package,
  Boxes,
  Eye,
  Cpu,
  ShieldCheck,
  Gauge,
  Network,
  Blocks,
  FlaskConical,
  MessagesSquare,
  Gamepad2,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { pytorchContent } from "@/data/pytorch";
import { SectionHeader } from "@/components/site/section-header";
import { CodeBlock } from "@/components/site/code-block";
import { useLanguage } from "@/lib/i18n";
import Image from "next/image";

const ICONS: Record<string, LucideIcon> = {
  Workflow, Zap, Package, Boxes, Eye, Cpu, ShieldCheck, Gauge, Network,
  Blocks, FlaskConical, MessagesSquare, Gamepad2,
};

export interface OverviewSectionProps {
  onNavigate: (tab: string) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const c = pytorchContent;
  const { t, lang } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b border-border bg-dotgrid">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 start-1/4 h-96 w-96 rounded-full bg-primary/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 end-0 h-80 w-80 rounded-full bg-amber-500/15 blur-[100px]"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          {/* Copy */}
          <motion.div {...fadeUp} className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {t("Meta's open-source machine learning framework", "إطار عمل التعلّم الآلي مفتوح المصدر من Meta")}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              {lang === "en" ? (
                <>
                  Deep learning,
                  <br />
                  simply <span className="text-flame">PyTorch</span>
                </>
              ) : (
                <>
                  التعلّم العميق
                  <br />
                  ببساطة <span className="text-flame">PyTorch</span>
                </>
              )}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t(
                "From the simplest neural nets to the most advanced research models — the simplicity and flexibility that made it researchers' favorite, and the power to go to production. Explore its features, learn it step by step, and run a real neural network right inside your browser.",
                "من أبسط الشبكات العصبية إلى نماذج الأبحاث الأكثر تقدمًا — بساطة ومرونة جعلته إطار العمل المفضل لدى الباحثين، وقويًا بما يكفي للإنتاج. استكشف ميزاته، وتعلّمه خطوة بخطوة، وجرّب شبكة عصبية حقيقية تعمل داخل متصفحك."
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate("learning")}
                className="flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
              >
                <GraduationCap className="h-5 w-5" />
                {t("Start learning", "ابدأ التعلّم الآن")}
                <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("playground")}
                className="flex min-h-[48px] items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                <FlaskConical className="h-5 w-5" />
                {t("Try the playground", "جرّب الملعب العصبي")}
              </button>
            </div>

            {/* Stats */}
            <dl className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {c.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card/60 px-3 py-3 backdrop-blur"
                >
                  <dd className="font-mono text-xl font-bold text-primary">{s.value}</dd>
                  <dt className="mt-0.5 text-xs font-medium">{t(s.labelEn, s.label)}</dt>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Visual */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10">
              <Image
                src="/images/hero-network.png"
                alt={t(
                  "Artistic render of a neural network in PyTorch flame orange",
                  "تمثيل فني لشبكة عصبية بألوان لهب PyTorch البرتقالية"
                )}
                width={1024}
                height={640}
                priority
                className="h-auto w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            </div>
            {/* Floating badges */}
            <div className="absolute -top-3 start-6 rounded-full border border-primary/40 bg-background/90 px-4 py-1.5 text-xs font-semibold shadow-lg backdrop-blur">
              <span className="font-mono text-primary">define-by-run</span>
              {" · "}
              {t("dynamic graph", "مخطط ديناميكي")}
            </div>
            <div className="absolute -bottom-3 end-6 flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-1.5 text-xs font-semibold shadow-lg backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-mono">CUDA</span>
              {" · "}
              {t("native GPU acceleration", "تسريع GPU أصلي")}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Hero code ─── */}
      <section className="border-b border-border bg-card/30 py-14">
        <div className="mx-auto w-full max-w-4xl px-4">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t("The whole idea in 16 lines", "كل الفكرة في 16 سطرًا")}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t(
                "A complete network: build, forward pass, backpropagation, and the weight update — no static graphs, no ceremony. Press",
                "شبكة كاملة: بناء، تمرير أمامي، انتشار عكسي، وتحديث الأوزان — بلا مخططات ثابتة، بلا تعقيد. اضغط"
              )}{" "}
              <span className="font-mono text-primary">run</span>{" "}
              {t("to see the result.", "لرؤية النتيجة.")}
            </p>
          </div>
          <CodeBlock code={c.heroCode.code} output={c.heroCode.output} title="hello_pytorch.py" />
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            badge={t("Features", "الميزات")}
            title={t("Why do researchers reach for it first?", "لماذا يختاره الباحثون أولاً؟")}
            description={t(
              "Five pillars that make PyTorch the fastest path from idea to result — from prototype to production.",
              "خمس ركائز تجعل PyTorch الأسرع من الفكرة إلى النتيجة — من البروتوتايب إلى الإنتاج."
            )}
            icon={Sparkles}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {c.features.map((f, i) => {
              const Icon = ICONS[f.icon] ?? Boxes;
              const points = lang === "en" ? f.pointsEn : f.points;
              return (
                <motion.article
                  key={f.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/35"
                >
                  <div
                    aria-hidden
                    className="absolute -end-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100"
                  />
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-bold">{t(f.titleEn, f.title)}</h3>
                  <p className="mb-4 font-mono text-xs text-primary/80" dir="ltr">
                    {t(f.title, f.titleEn)}
                  </p>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {t(f.descriptionEn, f.description)}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {points.map((pt) => (
                      <li
                        key={pt}
                        className="rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground"
                      >
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
            {/* CTA card fills the 6th slot */}
            <motion.button
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.3 }}
              type="button"
              onClick={() => onNavigate("api")}
              className="group flex min-h-[220px] flex-col items-start justify-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-6 text-start transition-colors hover:from-primary/20"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <BookOpen className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold">
                {t("Wished for an API? 60+ documented entries inside", "توقعت API؟ فيه 60+ دالة موثّقة")}
              </h3>
              <p className="text-sm text-muted-foreground group-hover:text-primary" dir={lang === "en" ? "ltr" : "rtl"}>
                {t(
                  "Explore the full searchable reference — torch.Tensor · nn · optim · autograd",
                  "استكشف مرجع البحث الكامل ← torch.Tensor · nn · optim · autograd"
                )}
              </p>
            </motion.button>
          </div>
        </div>
      </section>

      {/* ─── What you can do ─── */}
      <section className="border-y border-border bg-card/30 py-20">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            badge={t("Contribute", "ساهم في المشروع")}
            title={t("What can you build inside PyTorch itself?", "ماذا يمكنك أن تبني داخل PyTorch نفسه؟")}
            description={t(
              "The areas where new contributors are needed most in the official repo — from C++ kernels to flaky-test triage.",
              "مجالات العمل الأكثر حاجة لمساهمين جدد في المستودع الرسمي — من كيرنلات C++ إلى إصلاح الاختبارات المتقلبة."
            )}
            icon={Network}
            align="start"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {c.canDo.map((item, i) => {
              const Icon = ICONS[item.icon] ?? Cpu;
              return (
                <motion.div
                  key={item.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-background/60 p-5 transition-colors hover:border-primary/30"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="mb-1 font-semibold">{t(item.titleEn, item.title)}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(item.descriptionEn, item.description)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <motion.button
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.25 }}
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="flex items-center justify-between gap-4 rounded-2xl border border-primary/35 bg-primary/10 p-5 text-start transition-colors hover:bg-primary/15"
            >
              <div>
                <h3 className="mb-1 font-semibold text-primary">
                  {t("See the live activity", "شاهد النشاط الحي")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "An interactive dashboard: commits, pull requests, coverage, and flaky tests.",
                    "لوحة بيانات تفاعلية: كوميتات، طلبات الدمج، التغطية، والاختبارات المتقلبة."
                  )}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 shrink-0 text-primary" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ─── Use cases ─── */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            badge={t("Use cases", "حالات الاستخدام")}
            title={t("Where does PyTorch shine?", "أين يتألق PyTorch؟")}
            icon={FlaskConical}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.useCases.map((u, i) => {
              const Icon = ICONS[u.icon] ?? FlaskConical;
              return (
                <motion.article
                  key={u.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-bold">{t(u.titleEn, u.title)}</h3>
                  <p className="mb-3 font-mono text-xs text-primary/80" dir="ltr">
                    {t(u.title, u.titleEn)}
                  </p>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t(u.descriptionEn, u.description)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(lang === "en" && u.tagsEn ? u.tagsEn : u.tags).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Ecosystem ─── */}
      <section className="border-t border-border bg-card/30 py-20">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            badge={t("Ecosystem", "النظام البيئي")}
            title={t("A thousand libraries on one core", "ألف مكتبة مبنية فوق قلب واحد")}
            description={t(
              "Hugging Face, fastai, and thousands more build on PyTorch — whatever you need is ready.",
              "Hugging Face و fastai وآلاف المكتبات الأخرى تختار PyTorch أساسًا لها — إلك ما تحتاجه جاهزًا."
            )}
            icon={Boxes}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {c.ecosystem.map((e, i) => (
              <motion.div
                key={e.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 4) * 0.05 }}
                className="rounded-xl border border-border bg-background/60 p-4 transition-colors hover:border-primary/35"
                dir="ltr"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="truncate font-mono text-sm font-semibold text-foreground">
                    {e.name}
                  </h3>
                  <span
                    className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    dir={lang === "en" ? "ltr" : "rtl"}
                  >
                    {t(e.categoryEn, e.category)}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed text-muted-foreground"
                  dir={lang === "en" ? "ltr" : "rtl"}
                >
                  {t(e.descriptionEn, e.description)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-4xl px-4">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-8 text-center sm:p-12"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 start-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[90px]"
            />
            <h2 className="relative mb-3 text-3xl font-extrabold sm:text-4xl">
              {lang === "en" ? (
                <>
                  Ready to light up your first{" "}
                  <span className="text-flame">computational graph</span>?
                </>
              ) : (
                <>
                  جاهز تُشعل أول <span className="text-flame">مخطط حسابي</span>؟
                </>
              )}
            </h2>
            <p className="relative mx-auto mb-8 max-w-xl text-muted-foreground">
              {t(
                "Start with tensor basics, or jump straight into the playground and watch backpropagation learn before your eyes.",
                "ابدأ من أساسيات التوتّرات، أو اقفز مباشرة إلى الملعب العصبي وشاهد الانتشار العكسي يتعلم أمام عينيك."
              )}
            </p>
            <div className="relative flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate("learning")}
                className="flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                <GraduationCap className="h-5 w-5" />
                {t("Learning Hub", "مركز التعلّم")}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("playground")}
                className="flex min-h-[48px] items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                <FlaskConical className="h-5 w-5" />
                {t("Neural Playground", "الملعب العصبي")}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
