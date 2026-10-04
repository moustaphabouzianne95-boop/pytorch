"use client";

import { useState } from "react";
import { Navbar, NAV_TABS } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { OverviewSection } from "@/components/sections/overview";
import LearningHubSection from "@/components/sections/learning-hub";
import PlaygroundSection from "@/components/sections/playground";
import DashboardSection from "@/components/sections/dashboard";
import ApiExplorerSection from "@/components/sections/api-explorer";

export type TabId = (typeof NAV_TABS)[number]["id"];

export default function AppShell() {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar active={tab} onChange={(id) => setTab(id as TabId)} />
      <main className="flex-1">
        {tab === "overview" && <OverviewSection onNavigate={setTab} />}
        {tab === "learning" && <LearningHubSection />}
        {tab === "playground" && <PlaygroundSection />}
        {tab === "dashboard" && <DashboardSection />}
        {tab === "api" && <ApiExplorerSection />}
      </main>
      <Footer onNavigate={setTab} />
    </div>
  );
}
