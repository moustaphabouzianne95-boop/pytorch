// ─── Shared data contracts for the PyTorch interactive platform ───
// Single source of truth. API routes serialize these shapes; section
// components consume them via fetch.

export type Level = "beginner" | "intermediate" | "advanced";

export interface LessonSection {
  heading: string;
  body: string;
  code?: string;
  output?: string;
  tip?: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  level: Level;
  durationMin: number;
  tags: string[];
  sections: LessonSection[];
}

export interface DocParam {
  name: string;
  type: string;
  desc: string;
}

export type DocKind = "class" | "function" | "method" | "module" | "property";

export interface DocEntry {
  name: string;
  signature: string;
  kind: DocKind;
  description: string;
  params?: DocParam[];
  returns?: string;
  example?: string;
}

export interface DocGroup {
  id: string;
  name: string;
  description: string;
  entries: DocEntry[];
}

export interface WeeklyActivity {
  week: string; // e.g. "W14 · مارس"
  commits: number;
  prs: number;
  reviews: number;
}

export interface Contributor {
  handle: string;
  name: string;
  commits: number;
  prs: number;
  reviews: number;
  focus: string;
}

export interface FlakyTest {
  name: string;
  area: string;
  failureRate: number; // 0..1
  lastFailed: string;
  status: "investigating" | "fixed" | "open";
}

export interface RecentPR {
  id: number;
  title: string;
  author: string;
  area: string;
  added: number;
  removed: number;
  mergedAt: string;
  status: "merged" | "open";
}

export interface ContributionsData {
  stats: {
    stars: number;
    forks: number;
    contributors: number;
    openIssues: number;
    openPRs: number;
    coverage: number; // 0..100
    commits: number;
    release: string;
  };
  weekly: WeeklyActivity[];
  issuesByArea: { area: string; count: number; trend: number }[];
  contributors: Contributor[];
  coverage: { month: string; coverage: number; target: number }[];
  flakyTests: FlakyTest[];
  recentPRs: RecentPR[];
}

export interface FeatureItem {
  id: string;
  icon: string; // mapped to a lucide icon in the UI layer
  title: string;
  titleEn: string;
  description: string;
  points: string[];
}

export interface CanDoItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface UseCaseItem {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  tags: string[];
}

export interface EcosystemItem {
  name: string;
  category: string;
  description: string;
}

export interface PyTorchContent {
  stats: { label: string; value: string; hint: string }[];
  features: FeatureItem[];
  canDo: CanDoItem[];
  useCases: UseCaseItem[];
  ecosystem: EcosystemItem[];
  heroCode: { code: string; output: string };
}
