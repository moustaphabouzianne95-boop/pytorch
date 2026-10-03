import type { ContributionsData } from "@/lib/types";

// Deterministic pseudo-random (seeded) so SSR and client agree and
// the dashboard looks the same on every load.
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function buildWeekly() {
  const rnd = lcg(20240517);
  const out: ContributionsData["weekly"] = [];
  const labels = ["فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو"];
  for (let i = 0; i < 30; i++) {
    const base = 210 + Math.sin(i / 3.2) * 60 + i * 2.2;
    const commits = Math.round(base + rnd() * 90);
    const prs = Math.round(commits * (0.16 + rnd() * 0.08));
    const reviews = Math.round(prs * (1.7 + rnd() * 1.1));
    out.push({
      week: `أ${i + 1} · ${labels[Math.floor((i / 30) * labels.length)]}`,
      commits,
      prs,
      reviews,
    });
  }
  return out;
}

function buildCoverage() {
  const rnd = lcg(777001);
  const out: ContributionsData["coverage"] = [];
  const startIdx = new Date().getMonth();
  let cov = 83.4;
  for (let i = 11; i >= 0; i--) {
    cov = Math.min(88.6, cov + 0.28 + rnd() * 0.35);
    const m = (startIdx - i + 12) % 12;
    out.push({
      month: MONTHS_AR[m],
      coverage: Math.round(cov * 10) / 10,
      target: 88,
    });
  }
  return out;
}

export const contributionsData: ContributionsData = {
  stats: {
    stars: 88700,
    forks: 24100,
    contributors: 3962,
    openIssues: 1247,
    openPRs: 412,
    coverage: 87.3,
    commits: 152000,
    release: "v2.7.0",
  },
  weekly: buildWeekly(),
  issuesByArea: [
    { area: "autograd", count: 186, trend: 4 },
    { area: "distributed", count: 231, trend: 12 },
    { area: "inductor / compile", count: 174, trend: 9 },
    { area: "quantization", count: 96, trend: -3 },
    { area: "mobile / ExecuTorch", count: 82, trend: 6 },
    { area: "rocm", count: 61, trend: 2 },
    { area: "vmap / functorch", count: 48, trend: 5 },
    { area: "docs", count: 37, trend: -8 },
  ],
  contributors: [
    { handle: "ezyang", name: "Edward Z. Yang", commits: 2841, prs: 912, reviews: 5230, focus: "core / autograd" },
    { handle: "suo", name: "Scott Wolchok", commits: 1930, prs: 745, reviews: 4877, focus: "distributed" },
    { handle: "albanD", name: "Alban Desmaison", commits: 1755, prs: 604, reviews: 4410, focus: "core / dev-infra" },
    { handle: "jansel", name: "Jason Ansel", commits: 1612, prs: 588, reviews: 3922, focus: "inductor / compile" },
    { handle: "voznesenskym", name: "Michael Voznesensky", commits: 1408, prs: 517, reviews: 3311, focus: "inductor" },
    { handle: "janeyx99", name: "Jane Xu", commits: 1104, prs: 430, reviews: 2980, focus: "quantization" },
    { handle: "malfet", name: "Nikita Shulga", commits: 1022, prs: 391, reviews: 2644, focus: "release / mobile" },
    { handle: "davidberard98", name: "David Berard", commits: 864, prs: 302, reviews: 2150, focus: "core" },
  ],
  coverage: buildCoverage(),
  flakyTests: [
    { name: "test_autograd_gradcheck_cuda_float64", area: "autograd", failureRate: 0.042, lastFailed: "قبل ساعتين", status: "investigating" },
    { name: "test_distributed_nccl_allreduce_slow", area: "distributed", failureRate: 0.031, lastFailed: "قبل 5 ساعات", status: "open" },
    { name: "test_inductor_triton_fusion_variants", area: "inductor / compile", failureRate: 0.027, lastFailed: "أمس", status: "investigating" },
    { name: "test_quantized_conv_per_channel_mobile", area: "mobile / ExecuTorch", failureRate: 0.019, lastFailed: "قبل يومين", status: "fixed" },
    { name: "test_vmap_batch_rule_stack_random", area: "vmap / functorch", failureRate: 0.014, lastFailed: "قبل 3 أيام", status: "fixed" },
  ],
  recentPRs: [
    { id: 128401, title: "[inductor] Fuse split+cat reductions on CUDA graphs", author: "jansel", area: "inductor / compile", added: 482, removed: 117, mergedAt: "قبل 40 دقيقة", status: "merged" },
    { id: 128396, title: "[autograd] Fix double-backward of nested vmap closures", author: "ezyang", area: "autograd", added: 213, removed: 64, mergedAt: "قبل ساعة", status: "merged" },
    { id: 128388, title: "[distributed] Retry logic for NCCL timeout in all_gather", author: "suo", area: "distributed", added: 305, removed: 41, mergedAt: "قبل 3 ساعات", status: "merged" },
    { id: 128377, title: "[quantization] New PT2E backend for x86 int8 GEMM", author: "janeyx99", area: "quantization", added: 940, removed: 128, mergedAt: "قبل 7 ساعات", status: "merged" },
    { id: 128360, title: "[docs] Rewrite CUDA semantics notes with 2.x examples", author: "albanD", area: "docs", added: 611, removed: 233, mergedAt: "أمس", status: "merged" },
    { id: 128355, title: "[metal] ExecuTorch iOS delegate for conv-transpose", author: "malfet", area: "mobile / ExecuTorch", added: 522, removed: 96, mergedAt: "أمس", status: "open" },
  ],
};
