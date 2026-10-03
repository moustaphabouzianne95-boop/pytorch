# Worklog — PyTorch Interactive Platform (Arabic RTL)

Project: Next.js 16 + Tailwind 4 + shadcn/ui showcase for PyTorch (features, learning hub, NN playground, contributions dashboard, API explorer).
All agents: READ this file before working, APPEND your section (with the template: `---`, Task ID, Agent, Task, Work Log, Stage Summary) when done. Never overwrite previous entries.

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Project scaffold — RTL Arabic layout, PyTorch orange dark theme, fonts, shared conventions.

Work Log:
- Inspected project: Next.js 16.1.3 (Turbopack), Tailwind 4, full shadcn/ui set, recharts + framer-motion + react-syntax-highlighter available. Dev server already running on :3000 (log at /home/z/my-project/dev.log).
- Rewrote src/app/globals.css: warm dark theme (oklch) with PyTorch orange primary (~#ee4c2c), custom chart palette (orange/amber/emerald/rose/sand), thin custom scrollbar utilities (`.scrollbar-thin`), mono font stack for code.
- Rewrote src/app/layout.tsx: `lang="ar" dir="rtl"`, dark class forced, Cairo (Arabic) via next/font + Geist/Geist Mono, Arabic metadata.
- Created src/lib/types.ts as the single source of truth for shared data contracts (Lesson, DocGroup/DocEntry, ContributionsData, etc.).

Stage Summary:
- Theme tokens: use Tailwind semantic classes (bg-background, bg-card, text-primary, border-border...). Accent = orange primary. NO blue/indigo/purple.
- Code blocks and numbers/latin identifiers must be wrapped in `dir="ltr"` (shared CodeBlock component handles this).
- Shared components for sections: `@/components/site/code-block` (props: code, title?, output?, className?), `@/components/site/section-header` (props: badge, title, description, icon?).
- Data served via REST: GET /api/lessons, GET /api/docs, GET /api/contributions (server modules in src/data/*).

---
Task ID: 6-b
Agent: playground-agent
Task: Build the interactive "الملعب العصبي" — an in-browser neural-network playground (TF-Playground-style) trained with pure-TS backprop, no ML libraries, no server.

Work Log:
- Read worklog.md conventions + section-header/overview style refs + shadcn component APIs (Select/Slider/Checkbox/Card/Button/Label/Separator).
- Created src/components/sections/playground-engine.ts — dependency-free pure TS: mulberry32 seeded PRNG, 4 seeded datasets (دائرتان/XOR/فصلان/لولب, ~300 pts on [-1,1], 50/50 split, noise = jitter + label flips), feature transforms (x, y, x², y², x·y, sin(x), sin(y)), NeuralNetwork class (0–4 hidden layers × 1–8 neurons, tanh|relu|sigmoid, He/Xavier init, manual forward + backprop with BCE loss, mini-batch 16, stepEpoch/evaluate/predictGrid/exportWeights). Gracefully handles 0 hidden layers (logistic regression).
- Created src/components/sections/playground-canvas.tsx — DecisionCanvas (DPR-aware, 60×60 grid painted to offscreen ImageData then smoothed-upscaled; orange/emerald confidence field, misclassified points get rose ring), LossCanvas (last-100 sparkline, train solid orange / test dashed emerald + mono value labels), NetworkGraph (memoized SVG topology: edges colored orange=+/emerald=−, thickness ∝ |w|, labeled input/output nodes).
- Rewrote src/components/sections/playground.tsx — SectionHeader (FlaskConical), RTL controls card (dataset 2×2 button group, noise Slider 0–30%, lr/activation Selects, feature checkboxes with x/y locked, TF-style hidden-layer column editor with neuron dots + add/remove), center card (4 mono stat readouts dir=ltr, big تشغيل/إيقاف + خطوة واحدة + إعادة تعيين buttons, decision canvas + legend + honest engine note), analysis card (loss sparkline + live topology). rAF loop at ~6 epochs/frame with strict-mode-safe cleanup, paints throttled to every 3rd frame (~20fps); structural changes rebuild the net, lr changes hot-apply.
- Verified: `bunx tsc --noEmit` → zero errors for playground files (only pre-existing examples/skills errors remain), `bun run lint` clean, dev.log shows ✓ Compiled + GET / 200.

Stage Summary:
- Artifacts: src/components/sections/playground-engine.ts (pure TS engine), playground-canvas.tsx (canvas+SVG renderers), playground.tsx (default export PlaygroundSection, no props).
- Decisions: data+net rebuild effects split (noise/dataset → data only; features/hidden/activation → net only); fixed init seed 777 for reproducible resets; sin features use sin(πx) internally so they're actually useful on the [-1,1] domain; x/y checkboxes locked on guaranteeing input dim ≥ 2; 0-hidden-layer configs render fine.
- All tokens semantic (orange primary + emerald/amber accents, no blue/indigo/purple); engine note "للتعليم فقط" under canvas; touch targets ≥44px on controls; layer editor has overflow-x-auto scrollbar-thin.
---
Task ID: 6-a
Agent: learning-hub-agent
Task: Full "مركز التعلّم" (Learning Hub) section — two-pane lessons browser with progress tracking.

Work Log:
- Read worklog.md, types.ts, code-block.tsx, section-header.tsx, overview.tsx, lessons.ts + /api/lessons route to match conventions.
- Overwrote the stub src/components/sections/learning-hub.tsx (single file, no helper needed) with `export default function LearningHubSection()` (no props, 'use client').
- Data: plain fetch to GET /api/lessons typed as { lessons: Lesson[] }; skeleton loading state (list + content), error panel with retry button; selection auto-syncs to the filtered list.
- Two-pane layout: sticky sidebar (lg:grid-cols-[380px_1fr], lg:sticky lg:top-24) + lesson view; on mobile a collapsible list (aria-expanded/aria-controls toggle button with mini progress) renders the same listPanel JSX above the content.
- Lessons list grouped by level (مبتدئ/متوسط/متقدم with colored dots + counts), items show level Badge, duration (دقيقة, Clock icon), dir=ltr mono tag chips; selected item styled border-primary/40 bg-primary/10 text-primary; list scrolls in max-h + overflow-y-auto scrollbar-thin.
- Level filter segmented control (الكل/مبتدئ/متوسط/متقدم) with counts, aria-pressed, min-h-[44px].
- Lesson view: meta row, title + dir=ltr mono English subtitle, description, mark-complete toggle (localStorage key "pytorch-hub-lesson-progress"), numbered h3 sections with body, shared CodeBlock (code + run-reveal output), amber tip callouts (Lightbulb, border-amber-500/30 bg-amber-500/10).
- Progress: RTL-correct custom bar (block child fills from inline-start/right) with role=progressbar + aria-valuenow, "n / 6 دروس" dir=ltr counter, completed lessons get CheckCircle2 in the list.
- Prev/Next nav RTL-aware: "السابق" (ArrowRight) first/right, "التالي" (ArrowLeft) primary-styled; both smooth-scroll to the lesson view; "الدرس i من n" counter.
- SectionHeader (badge="مركز التعلّم", GraduationCap) + honest simulation note; framer-motion fadeUp entrances (same pattern as overview.tsx).

Stage Summary:
- Artifact: src/components/sections/learning-hub.tsx (~570 lines, self-contained; imports only shared site components + ui/badge, ui/separator, ui/skeleton).
- Decisions: custom RTL progress bar instead of shadcn Progress (Radix indicator uses translateX which fills left-side in RTL); custom colored level badges via Badge variant="outline"; listPanel JSX rendered twice (mobile collapsible + desktop aside) instead of duplicating state.
- Verified: bunx tsc --noEmit → zero errors in my file (only pre-existing errors in examples/ + skills/); ESLint clean on the file; dev.log shows ✓ Compiled and GET / 200.
---
Task ID: 6-c
Agent: dashboard-agent
Task: Implemented src/components/sections/dashboard.tsx — full Contributions Dashboard section (KPIs, recharts charts, leaderboard, flaky tests, recent PRs).

Work Log:
- Read worklog.md, types.ts (ContributionsData), section-header.tsx, overview.tsx, stub dashboard.tsx, data/contributions.ts and globals.css to lock onto conventions (orange dark theme, RTL, mono/LTR for numbers & Latin ids).
- Overwrote the stub with a single-file `'use client'` section: fetch GET /api/contributions with AbortController into a discriminated union state (loading | error | ok) — skeleton grid while loading, Arabic error card with 44px retry button on failure.
- Header via shared SectionHeader (badge="بيانات تجريبية", icon=BarChart3) + explicit "بيانات تجريبية — ليست حية" amber badge + release chip (v2.7.0) near KPIs.
- KPI row: 6 cards (نجوم/فورك/مساهمون/مشاكل مفتوحة/طلبات دمج/تغطية) with lucide icons, mono dir=ltr compact values (88.7K, 24.1K, 87.3%), orange hover border.
- Charts (recharts v2, each chart area wrapped dir="ltr", Arabic titles kept RTL): weekly ComposedChart (commits orange gradient Area #f97316 + PRs emerald Line #10b981 + reviews amber dashed Line #f59e0b, 30 wks, h-280); issues-by-area vertical BarChart with orange #ee4c2c→#f97316 gradient bars + LabelList counts + flex-wrap trend chips (↑ red / ↓ green); coverage LineChart domain [80,92] with dashed amber ReferenceLine y=88. Dark oklch tooltips, palette strictly orange/amber/emerald/rose/zinc.
- Bottom lg 3-col: contributors leaderboard (rank, deterministic warm-gradient initial avatars, mono handle dir=ltr, focus chip, commits/PRs/reviews mini-stats, Crown for #1, max-h scroll + scrollbar-thin); flaky tests (truncated mono names, area chip, color-coded failure bars: <2% emerald, 2–3% amber, >3% rose, status badges يُحقَّق/مفتوح/أُصلح, last-failed time); recent PRs feed (#id mono, title, @author, area chip, +green/−red diffs, merged/open badges, Arabic relative time).
- Fixed new react-hooks/set-state-in-effect lint error by moving synchronous setState out of the effect (retry handler + state-machine pattern). No `any`, no unused imports; framer-motion fadeUp matching overview.tsx.

Stage Summary:
- Only file touched: src/components/sections/dashboard.tsx (default export DashboardSection, no props).
- Verified: `bunx tsc --noEmit` clean for the file (remaining errors are pre-existing in examples/ & skills/, not src/), `bunx eslint` on the file passes, dev.log shows page + /api/contributions both 200 with no compile errors.
- Note: used ComposedChart (plain recharts v2) for weekly because Line children don't render inside AreaChart; grid: weekly lg:col-span-2 / issues lg:row-span-2 / coverage lg:col-span-2, bottom row stacks on mobile.
---
Task ID: 6-d
Agent: api-explorer-agent
Task: Full "Docs / API Explorer" (مرجع API) section — searchable PyTorch API reference with master–detail UI.

Work Log:
- Read worklog.md conventions, types.ts (DocGroup/DocEntry), shared CodeBlock + SectionHeader, overview.tsx style, api-reference.ts data (6 groups, 60 entries), globals.css tokens (scrollbar-thin/text-flame), and the stub api-explorer.tsx.
- Overwrote src/components/sections/api-explorer.tsx (only file touched) with a self-contained 'use client' component: fetch GET /api/docs → { groups: DocGroup[] } with a "loading | ready | error" status machine (setState only inside async callbacks to satisfy the new react-hooks/set-state-in-effect rule) + skeleton loaders + Arabic error card with retry button.
- Instant search Input (Search icon, h-14, 44px clear button, "/" kbd hint) filtering by name + signature + Arabic description (case-insensitive on Latin); live result counter with Arabic pluralization (لا نتائج / نتيجة واحدة / نتيجتان / نتائج / نتيجة) + aria-live; window keydown listener focuses the search on "/".
- Group selector: wrapping pill row for "الكل" + the 6 groups, each with mono count badge, active = primary/15 style; Latin group names dir=ltr font-mono; active group's Arabic description shown underneath; selection resets on scope change via event handlers (selectGroup/onChange), never in effects.
- Desktop (lg): master–detail grid 5fr/7fr — scrollable list card (max-h-[560px] overflow-y-auto scrollbar-thin, rows = mono name dir=ltr + kind badge + line-clamp Arabic desc, selected = border-s-primary + bg-primary/10, group tag shown in "الكل" mode) + sticky detail aside (lg:sticky lg:top-20, max-h calc(100vh-6.5rem) internal scroll) with fade-in on entry change. Mobile (<lg): accordion cards with ChevronDown rotate + AnimatePresence height animation.
- Detail panel: name (mono ltr) + KindBadge (class=orange/function=emerald/method=amber/property=zinc/module=rose via shadcn Badge outline), signature in LTR mono dark code box with CopyButton (44px, copied→"تم النسخ" + emerald check), Arabic description, params shadcn Table (name mono / type mono emerald / Arabic desc, whitespace-normal overrides), amber returns row (CornerDownLeft), example via shared CodeBlock with title=entry.name.
- Empty state (SearchX icon + Arabic hint + "مسح البحث" button) when no results; Selection model: manualId (undefined=derive-first / null=explicitly closed / string=pick) with derived `active` entry — no selection effects, lint-clean.
- Verified: bunx tsc --noEmit → zero errors in my file (only pre-existing unrelated errors in examples/ and skills/); bunx eslint on the file → clean (fixed set-state-in-effect violations and a FlatEntry property typo caught by tsc).

Stage Summary:
- Artifact: src/components/sections/api-explorer.tsx (~800 lines, default export ApiExplorerSection, no props). No other files modified.
- Data contract honored: consumes GET /api/docs returning { groups: DocGroup[] }; the /api/docs route itself is owned by another task — until it exists the section shows its error/retry state by design.
- UX decisions: pills over Radix Tabs (better RTL wrap for 7 scopes), first result auto-highlighted via derivation (not effects), explicit mobile close respected, list scrolls to top on scope change, all interactive targets ≥44px, semantic tokens only (no blue/indigo/purple).

---
Task ID: 7 + 8
Agent: main (Z.ai Code)
Task: Integration, lint, and full browser verification of all five tabs.

Work Log:
- Ran `bun run lint` — clean (zero errors, zero warnings).
- Verified all endpoints: / , /api/lessons , /api/docs , /api/contributions , /images/hero-network.png → all HTTP 200.
- Browser-verified with agent-browser across desktop (1280px) and mobile (390px) viewports:
  * Overview: hero + generated flame/network image render, stats row, code block "run" button reveals console output (loss = 2.3719).
  * Learning Hub: lesson switching, level filters, code run, "تم إنهاء هذا الدرس" → progress bar updates to 1/6 with localStorage persistence.
  * Playground: dataset switching (دائرتان/XOR/فصلان/لولب), real in-browser training (circles → 100% test accuracy, loss 0.001 @ ~2.5k epochs), play/pause/step/reset all functional, decision-boundary canvas + loss sparkline + SVG topology update live.
  * Dashboard: 6 KPI cards, weekly activity ComposedChart, issues-by-area horizontal bars, coverage trend, contributors leaderboard, flaky tests panel, recent PRs feed — all fed from /api/contributions.
  * API Explorer: instant search ("conv" → 2 results incl. nn.Conv2d), group pills with counts, master–detail detail panel with signature/params/example + CodeBlock.
  * Footer sticks to bottom on short pages and pushes down naturally on long ones.
- Fixed one cosmetic RTL issue: footer "Built with..." line now dir="ltr".
- dev.log: no runtime errors (only the pre-generation 404 for the hero image, resolved).

Stage Summary:
- All 5 sections verified interactive end-to-end in the browser; task complete and ready for the user.
