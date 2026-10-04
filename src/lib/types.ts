// ─── Shared data contracts for the PyTorch interactive platform ───
// Single source of truth. API routes serialize these shapes; section
// components consume them via fetch.

export type Level = "beginner" | "intermediate" | "advanced";

export interface LessonSection {
  heading: string;
  headingEn: string;
  body: string;
  bodyEn: string;
  code?: string;
  output?: string;
  outputEn?: string;
  tip?: string;
  tipEn?: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  level: Level;
  durationMin: number;
  tags: string[];
  sections: LessonSection[];
}

export interface DocParam {
  name: string;
  type: string;
  desc: string;
  descEn: string;
}

export type DocKind = "class" | "function" | "method" | "module" | "property";

export interface DocEntry {
  name: string;
  signature: string;
  kind: DocKind;
  description: string;
  descriptionEn: string;
  params?: DocParam[];
  returns?: string;
  returnsEn?: string;
  example?: string;
}

export interface DocGroup {
  id: string;
  name: string;
  nameEn?: string; // optional: only needed when name is not Latin
  description: string;
  descriptionEn: string;
  entries: DocEntry[];
}

export interface WeeklyActivity {
  week: string; // e.g. "W14 · مارس"
  weekEn: string; // e.g. "W14 · Mar"
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
  focusEn: string;
}

export interface FlakyTest {
  name: string;
  area: string;
  areaEn: string;
  failureRate: number; // 0..1
  lastFailed: string;
  status: "investigating" | "fixed" | "open";
}

export interface RecentPR {
  id: number;
  title: string;
  author: string;
  area: string;
  areaEn: string;
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
  issuesByArea: { area: string; areaEn: string; count: number; trend: number }[];
  contributors: Contributor[];
  coverage: { month: string; monthEn: string; coverage: number; target: number }[];
  flakyTests: FlakyTest[];
  recentPRs: RecentPR[];
}

export interface FeatureItem {
  id: string;
  icon: string; // mapped to a lucide icon in the UI layer
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  points: string[];
  pointsEn: string[];
}

export interface CanDoItem {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export interface UseCaseItem {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  tags: string[];
  tagsEn?: string[];
}

export interface EcosystemItem {
  name: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
}

export interface PyTorchContent {
  stats: { label: string; labelEn: string; value: string; hint: string; hintEn: string }[];
  features: FeatureItem[];
  canDo: CanDoItem[];
  useCases: UseCaseItem[];
  ecosystem: EcosystemItem[];
  heroCode: { code: string; output: string };
}
