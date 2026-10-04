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

---
Task ID: 9
Agent: main (Z.ai Code)
Task: i18n infrastructure — bilingual EN/AR support with RTL/LTR switching (user request: "إجعله متعدد الغات (انجليزي، عربي)").

Work Log:
- Created src/lib/i18n.tsx: LanguageProvider + useLanguage() hook returning { lang: "en"|"ar", dir, isRtl, setLang, toggle, t }. Module-level store + useSyncExternalStore (avoids set-state-in-effect lint rule), localStorage persistence key "pytorch-hub-lang", syncs <html lang/dir> + document.title on change. SSR/hydration default stays "ar".
- Updated src/lib/types.ts data contracts with parallel English fields: Lesson.descriptionEn + LessonSection.headingEn/bodyEn/outputEn?/tipEn?; DocGroup.descriptionEn; DocEntry.descriptionEn/returnsEn?; DocParam.descEn; WeeklyActivity.weekEn; Contributor.focusEn; FlakyTest.areaEn; RecentPR.areaEn; issuesByArea[].areaEn; coverage[].monthEn; FeatureItem.descriptionEn/pointsEn; CanDoItem.titleEn/descriptionEn; UseCaseItem.descriptionEn; EcosystemItem.categoryEn/descriptionEn; stats labelEn/hintEn.
- Rewrote layout.tsx: added Inter font (--font-inter), wrapped children in <LanguageProvider>, bilingual metadata (title/description/OG).
- globals.css: html[lang="ar"] body uses Cairo; html[lang="en"] body uses Inter.
- Rewrote navbar.tsx: NAV_TABS gained labelEn; added EN/عربي segmented LangSwitch (min-w 44px targets); all labels/aria-labels bilingual via t().
- Rewrote footer.tsx: fully bilingual strings (brand, links, resources, copyright with {year} placeholder).
- section-header.tsx: underline gradient now bg-gradient-to-r rtl:bg-gradient-to-l.
- code-block.tsx: already language-neutral (run/reset/console) — unchanged.
- Verified: tsc errors confined to the 3 data files awaiting En fields (api-reference 67, contributions 29, lessons 19); eslint clean on all infra files.

Stage Summary:
- i18n convention for all agents: import { useLanguage } from "@/lib/i18n"; destructure { t, lang, isRtl }; replace Arabic literals with t("English copy", "النص العربي بدون تغيير"). Arabic strings must remain EXACTLY as before.
- Data convention: parallel *En fields per the updated types.ts (required unless marked ?).
- Direction: keep dir="ltr" on code/numbers/identifiers; audit physical classes (bg-gradient-to-l/r, translate-x, ArrowLeft/Right) and add ltr:/rtl: variants where needed.

---
Task ID: 12-b
Agent: playground-bilingual-agent
Task: Make the Neural Playground section fully bilingual (EN/AR) via the Task-9 i18n hook, including canvas/SVG labels.

Work Log:
- Read worklog.md (Tasks 1, 6-b, 9) + src/lib/i18n.tsx to confirm the useLanguage/t(en, ar) API; confirmed overview.tsx already uses badge={t("Neural Playground", "الملعب العصبي")} and matched it.
- playground-engine.ts: added a parallel `labelEn` field to the DATASETS config table only (دائرتان→"Two circles", فصلان→"Two moons", لولب→"Spiral", XOR→"XOR"); every numeric/training line untouched. Feature (x, y, x², sin(x)…) and activation (tanh/ReLU/sigmoid) labels are language-neutral and stay as-is.
- playground-canvas.tsx: all three renderers now receive localized strings as props from playground.tsx (no i18n import in the canvas file): DecisionCanvas `ariaLabel`; LossCanvas `ariaLabel` + `trainLabel`/`testLabel`; NetworkGraph `inputCaption`/`outputCaption` + `ariaLabel`. LossCanvas effect deps gained the label props → lang change triggers repaint; memoized NetworkGraph re-renders on caption change. Pinned ctx.textAlign="left" + ctx.direction="ltr" before the fillText legend calls and used padEnd label alignment so in-canvas legend renders deterministically in both languages ("train 0.123"/"test  0.456" bytes preserved in EN). Node labels (x, x², ŷ) and hidden-layer counts kept language-neutral.
- playground.tsx: added `const { t } = useLanguage()`; localized SectionHeader (badge/title/description), all 3 card titles/descriptions, dataset buttons t(d.labelEn, d.label), noise/lr/activation/feature labels + aria-labels, hidden-layer editor (Layer n, add/remove layer + neuron aria-labels), stat readout labels (Epoch/Train loss/Test loss/Test accuracy — values stay dir="ltr" mono), run controls (Run training/Pause, Step once, Reset), legend (Class 1/Class 0/Misclassified), the TypeScript/autograd honesty note (fragment-wise t() so the mono LTR spans survive — Arabic concatenates back to the exact original sentence), and canvas/SVG prop strings.
- RTL/LTR audit: no hardcoded dir="rtl" existed; all numeric/mono readouts keep dir="ltr" (noise %, lr, activation, feature labels, epoch counter, hidden n/4, stat values, LossCanvas values); no physical-direction classes in the three files; touch targets/framer-motion/training logic untouched.
- Verified: `bunx tsc --noEmit` → zero playground errors (remaining errors are other agents' data files: api-reference/contributions/lessons); `bunx eslint` on the 3 files → 0 problems; dev.log shows only ✓ Compiled. Browser check via agent-browser: Arabic default intact (all original strings byte-identical), EN toggle → Two circles/Two moons/Spiral, "Run training" reached epoch 954 @ 100% test accuracy, canvas/SVG aria-labels + المدخلات/الناتج captions flip live with the language switch, dir html attr syncs, zero page errors.

Stage Summary:
- Files changed: src/components/sections/playground.tsx, playground-canvas.tsx, playground-engine.ts (DATASETS table only). No other file touched.
- Decisions: dataset display names stay sourced in the engine (labelEn added alongside the untouched Arabic label) since the engine is the config source of truth and the task allows engine edits for user-facing strings; localized canvas/SVG strings flow down as props from playground.tsx (per task instruction) so canvas components stay i18n-import-free; LossCanvas text anchoring pinned to ltr/left to make bidi rendering deterministic regardless of document direction; English loss-canvas legend bytes preserved exactly via padEnd alignment.

---
Task ID: 12-c
Agent: dashboard-bilingual-agent
Task: Made the Contributions Dashboard section fully bilingual (EN/AR) — dashboard.tsx UI strings + contributions.ts mock data *En fields.

Work Log:
- Read worklog.md (Tasks 1, 9, 6-c), src/lib/i18n.tsx (t/lang/isRtl API), src/lib/types.ts contract, and both owned files.
- src/data/contributions.ts: filled ALL required *En contract fields with Arabic fields byte-identical — added MONTHS_EN (short English months), labelsEn for buildWeekly, weekEn = `W{n} · Feb`-style per WeeklyActivity; areaEn on issuesByArea/flakyTests/recentPRs and focusEn on contributors (values already Latin → mirror of area/focus); monthEn on coverage.
- dashboard.tsx: imported useLanguage; wrapped every Arabic UI literal in t("English", "Arabic unchanged") — SectionHeader (badge/title/description), section + KPI-grid aria-labels, demo-data badge + release chip, error card (title/body/retry), chart titles + subtitles + legends + series names (tooltips) + ReferenceLine "هدف 88%", trend-chip titles, leaderboard heading/hint/count/Crown aria + كوميت/دمج/مراجعة mini-stats, flaky-tests heading/hint/count/"آخر فشل:" + meter aria-label, recent-PRs heading/hint/count, "بيانات تجريبية — ليست حية" → "Sample data — not live", "آخر إصدار" → "Latest release".
- Status/tone maps gained labelEn (FLAKY_STATUS يُحقَّق/مفتوح/أُصلح → Investigating/Open/Fixed; PR_STATUS مدموج/مفتوح → Merged/Open; rateTone مستقر/متقلب نوعًا/متقلب → Stable/Slightly flaky/Flaky) rendered via t(labelEn, label) — Arabic preserved byte-identical at the constant level.
- Relative times are static Arabic strings in the data (not computed), so added a RELATIVE_EN map + relativeEn() fallback helper in dashboard.tsx and an rt() closure branching on lang ("قبل ساعتين" → "2h ago", "أمس" → "yesterday", …) for flaky lastFailed and PR mergedAt — no type/route changes needed.
- Data-driven picks branch by lang: weekly XAxis dataKey weekEn/week, issues YAxis areaEn/area, coverage XAxis monthEn/month, plus t(areaEn, area)/t(focusEn, focus) chips. Charts re-render on switch since DashboardContent re-renders with new t/dataKeys.
- Renamed flaky-tests map variable t → ft to avoid shadowing the i18n t() (would have crashed inside that callback).
- RTL/LTR audit: no hardcoded dir="rtl" existed; all dir="ltr" kept on charts/mono numerals/areas/diff stats; kept dir="ltr" wrappers per chart. No color/data/layout/framer-motion changes.
- Verified: bunx tsc --noEmit filtered to my two files → empty; bunx eslint on both files → 0 problems; dev.log shows ✓ Compiled + GET / 200 + GET /api/contributions 200 (API now serves weekEn etc.).

Stage Summary:
- Files touched (only): src/components/sections/dashboard.tsx (~812 lines), src/data/contributions.ts (~112 lines). /api/contributions route untouched — serializes the enriched data automatically.
- ~69 bilingual string pairs (46 inline t() pairs + 14 labelEn pairs in KPI/status/tone defs + 9 relative-time map entries) + 3 lang-switched axis dataKeys.
- Decisions: labelEn parallel fields on module-level maps (keeps Arabic constants byte-identical, avoids re-creating maps per render); static relative-time lookup table instead of parsing Arabic; coverage subtitle split into two t() segments around the dir=ltr mono "88%" span so the Arabic sentence renders exactly as before; "أمس" → "yesterday" (natural English) while other entries use "2h ago"/"2d ago" compact style.
- English axes stay mono/LTR; areaEn/focusEn equal the Latin originals so chart geometry (YAxis width 112) is unchanged in both languages.

---
Task ID: 12-d
Agent: api-explorer-bilingual-agent
Task: Fully bilingual (EN/AR) API Explorer / Docs section — component UI via t() + all En fields for the 6 groups / 59 entries in api-reference.ts.

Work Log:
- Read worklog.md (Tasks 1, 6-d, 9), src/lib/i18n.tsx (useLanguage/t contract), updated src/lib/types.ts (DocGroup.descriptionEn, DocEntry.descriptionEn/returnsEn?, DocParam.descEn), and both owned files.
- Data (src/data/api-reference.ts): added descriptionEn for all 6 groups and all 59 entries, descEn for all 17 params, returnsEn for the 5 entries that have returns (torch.tensor/zeros/ones/randn/Tensor.view). Applied via string-anchored edits so every Arabic string, name, signature, and example stayed byte-identical (git diff confirms: 152 insertions, 17 "changed" lines are param lines with only `, descEn` appended, Arabic substring untouched).
- Component (src/components/sections/api-explorer.tsx): imported useLanguage; wrapped every Arabic UI literal in t() — search placeholder + aria-label, clear button ("مسح البحث"→"Clear search"), "/" kbd hint ("اضغط … للانتقال السريع"), live result counter via pluralResults(n, t) (EN: No results / 1 result / n results; AR pluralization unchanged), group pill "الكل"→"All", group scope description now picks descriptionEn/description by active language, "all" scope line bilingual (EN mentions descriptions instead of "شرح عربي"), SectionHeader badge/title/description, detail labels (التوقيع الكامل→Signature, المعاملات→Parameters, الاسم/النوع/الوصف→Name/Type/Description, القيمة المرجعة→Returns with returnsEn fallback to returns, مثال عملي→Example), CopyButton (نسخ التوقيع→Copy signature, تم النسخ→Copied, نسخ→Copy), EmptyResults (AR branch kept byte-identical incl. «query» line; EN branch mirrors it), ErrorState (title/retry; the Arabic fetch-error message stays in state and is shown via t(EN-copy, message)), LoadingSkeleton got role="status" + bilingual aria-label, list header قائمة العناصر→Entries, empty-detail hint, section aria-label.
- Kind badges: KIND_META gained labelEn ("class"/"function"/"method"/"property"/"module") next to the unchanged Arabic labels; KindBadge renders t(labelEn, label).
- Search: description matching now uses the ACTIVE language's description (EN: descriptionEn lowercased vs lowercased query; AR: original behavior with query.trim()), deps [flat, activeGroup, query, lang]. Names/signatures still case-insensitive Latin matching.
- RTL/LTR audit: hardcoded dir="rtl" on the results Badge and group-pill span → dir={isRtl ? "rtl" : "ltr"} (pill keeps dir="ltr" for latin names); all code/name/signature/type cells keep dir="ltr" mono; master–detail max-h scroll + scrollbar-thin untouched; selection model (manualId undefined/null/string), "/" shortcut, framer-motion patterns, layout structure unchanged; all touch targets still ≥44px; semantic tokens only.
- Verified: `bunx tsc --noEmit | grep api-explorer|api-reference` → empty (was 67 errors in api-reference.ts, all gone); `bunx eslint` on both files → 0 problems; dev.log clean, GET / and GET /api/docs both 200 with descriptionEn serialized.

Stage Summary:
- Files changed (only these two): src/components/sections/api-explorer.tsx (~870 lines), src/data/api-reference.ts (~650 lines). No route/types/i18n changes.
- Translated: 6 group descriptions + 59 entry descriptions + 17 param descs + 5 returns = 87 data strings; ~30 UI strings/aria-labels in the component.
- Decisions: kind badges are bilingual rather than forced-English (Arabic labels preserved verbatim); the Arabic-only group name "أدوات متفرقة" (misc) stays as-is because DocGroup has no nameEn field and Arabic data strings must stay byte-identical — its pill renders with correct bidi dir in both languages; mobile accordion toggles keep their content-derived accessible name + aria-expanded (an aria-label would override the richer entry name), so nothing needed translating there; Added role="status" + bilingual aria-label to the loading skeleton (previously missing); EN search matches only the active language's description per spec.
- Known cosmetic note: in EN mode the misc group pill still shows the Arabic name "أدوات متفرقة" (single Arabic string in the EN UI) until types.ts grows an optional nameEn.

---
Task ID: 12-a
Agent: learning-hub-bilingual-agent
Task: Make the Learning Hub section fully bilingual (EN/AR) — component UI + all 6 lessons' data.

Work Log:
- Read worklog.md (Tasks 1, 9, 6-a), src/lib/i18n.tsx (confirmed t(en, ar) API), types.ts (required *En fields), section-header.tsx / code-block.tsx / overview.tsx for the established bilingual patterns.
- Rewrote src/data/lessons.ts: added descriptionEn to all 6 lessons; headingEn + bodyEn to all 19 sections; tipEn to all 7 tips; outputEn ("Number of parameters: 131") for the single output containing Arabic prose. Verified every pre-existing Arabic string byte-identical via scripted old-vs-new comparison (72 Arabic strings before → 59 preserved verbatim; the only 13 changed strings are the code blocks whose Arabic COMMENTS were translated to English in-place, 21 comments total — mandated because CodeBlock is always dir="ltr").
- Rewrote src/components/sections/learning-hub.tsx around useLanguage(): LEVEL_LABEL/FILTERS became {en, ar} pairs consumed via t(); LevelBadge + ProgressHint call useLanguage() internally (ProgressHint pluralizes EN: "1 lesson"/"n lessons", interpolated pair keeps the Arabic template byte-identical incl. ٪); wrapped every Arabic UI literal with t() — progress heading + counter aria, filter group aria, empty-level text, completed-check aria, min duration (list + lesson view), mark-complete pair, "Tip:" callout, prev/next + nav aria, "Lesson i of n" (lang-conditional JSX, AR branch byte-identical) + "· Completed ✓", empty-selection text, error card (title/body/retry), section aria + SectionHeader badge/title/description, honest-simulation note, mobile "Lessons list" toggle.
- Lesson view per language: main title t(titleEn, title), mono dir=ltr subtitle shows the OTHER language t(title, titleEn) (mirrors overview.tsx); description/section headings/bodies/tips t()-selected; CodeBlock output = t(outputEn ?? output, output).
- RTL/LTR audit: progress bar was already direction-safe (block-flow child fills from inline-start — verified in-browser: fill.left==track.left in EN, fill.right==track.right in AR); prev/next arrows now ArrowRight/ArrowLeft + ltr:rotate-180 so Previous points left / Next points right in EN and flip in AR; tags/numbers/section chips keep dir="ltr"; no hardcoded dir="rtl" existed to convert.
- Renamed tags map callbacks (t → tag) to stop shadowing the i18n t(); PROGRESS_KEY "pytorch-hub-lesson-progress" untouched (progress survives language switching, verified in browser).
- Verified: bunx tsc --noEmit → zero errors for learning-hub.tsx/lessons.ts; bunx eslint on both → 0 problems; dev.log ✓ Compiled + GET / 200 + GET /api/lessons 200; browser smoke test (agent-browser): AR default intact, EN switch shows Learn PyTorch step by step / All / Beginner / 15 min / Tensor Fundamentals with mono Arabic subtitle / English tip / "Number of parameters: 131" console via outputEn, mark-complete toggles "Completed — tap to undo" and back to تم إنهاء هذا الدرس, "Lesson 1 of 6"/"الدرس 1 من 6", arrows rotate correctly per direction; test mark undone afterwards.

Stage Summary:
- Files touched (only): src/components/sections/learning-hub.tsx (~640 lines) + src/data/lessons.ts (~430 lines). No route/type/infra changes.
- Data coverage: 6/6 lessons, 19/19 sections, 7 tipEn, 1 outputEn, 13 code blocks with Arabic comments translated in-place; ~26 UI string pairs in the component.
- Decisions: (1) Arabic string literals inside code (the print("عدد المعاملات:", …) line) kept as-is — only comments were authorized to change; EN console compensated via outputEn. (2) Mono subtitle keeps dir="ltr" hardcoded like overview.tsx even when it displays the Arabic title in EN mode. (3) Progress bar left as plain block-flow (inherently inline-start) with an explanatory comment instead of adding ltr:/rtl: variants. (4) Lessons list shows the localized title only (no second-language line) to keep rows compact.

---
Task ID: 11
Agent: main (Z.ai Code)
Task: Bilingual integration — polish fixes, lint/tsc, full browser verification of EN/AR across all five tabs (desktop + mobile).

Work Log:
- Ran full tsc: 0 errors in src/ (all 115 data-file errors resolved by agents 12-a..12-d). `bun run lint` clean.
- Browser verification via agent-browser:
  * AR (default): dir=rtl, Cairo font, Arabic title; hero + switcher render; all 5 tabs re-checked via snapshot (Arabic strings byte-identical per agents' scripted diffs).
  * EN: dir/lang flips to ltr/en, document.title switches; verified overview (hero, 16-line code block with EN comments, features/canDo/use-cases/ecosystem cards), Learning Hub (Beginner/Intermediate badges, "Lesson 1 of 6", ←/→ arrows flipped via ltr:rotate-180, footer English), Playground (real training run: epoch 954, train loss 0.003, test accuracy 100.0%; Two circles/XOR/Two moons/Spiral; loss-curve labels train/test), Dashboard (KPIs, weekly chart with "W19 · May" tooltip, EN month axes, leaderboard, flaky statuses Investigating/Open/Fixed, "2h ago" relative times), API Explorer (search "conv" → "4 results", EN descriptions/params/returns, group pills).
  * Persistence: reload keeps chosen language (localStorage "pytorch-hub-lang").
  * Mobile 390px: EN + AR both verified (switcher, scrollable tabs, lesson cards).
  * Footer sticks to bottom on short pages; no console/page errors anywhere.
- Post-agent polish fixes: added optional DocGroup.nameEn (misc group "أدوات متفرقة" → "Misc utilities" in EN, picked in pills + list rows) and UseCaseItem.tagsEn (4 use cases now show English tags in EN mode). tsc/eslint re-verified clean after fixes.

Stage Summary:
- The platform is now fully bilingual EN/AR with instant switching, RTL↔LTR flip, persisted preference, and language-aware fonts (Cairo ↔ Inter). Arabic content untouched; English added in parallel fields/dictionaries.
- Verified end-to-end in the browser on desktop and mobile. Task complete.
