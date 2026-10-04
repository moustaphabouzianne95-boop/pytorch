"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";
export type Dir = "ltr" | "rtl";

const STORAGE_KEY = "pytorch-hub-lang";

/* ─── Module-level store ───────────────────────────────────────────
   The active language lives outside React so that switching is
   instant, works from anywhere, and never triggers setState-in-effect
   lint violations. The provider keeps <html lang/dir> and the document
   title in sync with it. */

let currentLang: Lang = "ar";
const listeners = new Set<() => void>();
let restored = false;

function emit() {
  listeners.forEach((fn) => fn());
}

export function setLangGlobal(next: Lang) {
  if (next === currentLang) return;
  currentLang = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable — session-only language
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Lang {
  return currentLang;
}

/** SSR / hydration always starts with the Arabic default. */
function getServerSnapshot(): Lang {
  return "ar";
}

/* ─── Context ──────────────────────────────────────────────────── */

interface LanguageContextValue {
  lang: Lang;
  dir: Dir;
  isRtl: boolean;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Inline bilingual string picker: t("English", "العربية") */
  t: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Restore a persisted preference once, right after mount.
  useEffect(() => {
    if (restored) return;
    restored = true;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if ((saved === "en" || saved === "ar") && saved !== currentLang) {
        currentLang = saved;
        emit();
      }
    } catch {
      // storage unavailable — keep the default
    }
  }, []);

  const dir: Dir = lang === "ar" ? "rtl" : "ltr";

  // Keep <html lang/dir> and the tab title in sync with the active language.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title =
      lang === "ar"
        ? "PyTorch — المنصة التفاعلية"
        : "PyTorch — Interactive Platform";
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangGlobal(l), []);
  const toggle = useCallback(
    () => setLangGlobal(lang === "ar" ? "en" : "ar"),
    [lang]
  );
  const t = useCallback(
    (en: string, ar: string) => (lang === "en" ? en : ar),
    [lang]
  );

  const value = useMemo(
    () => ({ lang, dir, isRtl: lang === "ar", setLang, toggle, t }),
    [lang, dir, setLang, toggle, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within <LanguageProvider>");
  }
  return ctx;
}
