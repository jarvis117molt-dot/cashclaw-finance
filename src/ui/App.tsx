import { useState, useEffect } from "react";
import { Dashboard } from "./pages/Dashboard.js";
import { Tasks } from "./pages/Tasks.js";
import { Settings } from "./pages/Settings.js";
import { Setup } from "./pages/Setup.js";
import { api } from "./lib/api.js";

type Page = "dashboard" | "tasks" | "settings";

const NAV: { page: Page; label: string }[] = [
  { page: "dashboard", label: "Dashboard" },
  { page: "tasks", label: "Tasks" },
  { page: "settings", label: "Settings" },
];

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    api.getSetupStatus()
      .then((s) => setConfigured(s.configured && s.mode === "running"))
      .catch(() => setConfigured(false));
  }, []);

  // Loading state
  if (configured === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  // Setup wizard
  if (!configured) {
    return <Setup onComplete={() => setConfigured(true)} />;
  }

  // Dashboard
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">WorkClaw</h1>
          <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">v0.1</span>
        </div>
        <nav className="flex gap-1">
          {NAV.map((n) => (
            <button
              key={n.page}
              onClick={() => setPage(n.page)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                page === n.page
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {page === "dashboard" && <Dashboard />}
        {page === "tasks" && <Tasks />}
        {page === "settings" && <Settings />}
      </main>
    </div>
  );
}
