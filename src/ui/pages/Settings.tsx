import { useState, useEffect } from "react";
import { api, type ConfigData } from "../lib/api.js";

export function Settings() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Editable state
  const [specialties, setSpecialties] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [strategy, setStrategy] = useState("fixed");
  const [autoQuote, setAutoQuote] = useState(true);
  const [autoWork, setAutoWork] = useState(true);
  const [maxTasks, setMaxTasks] = useState(3);

  useEffect(() => {
    api.getConfig().then((c) => {
      setConfig(c);
      setSpecialties(c.specialties.join(", "));
      setBaseRate(c.pricing.baseRateEth);
      setMaxRate(c.pricing.maxRateEth);
      setStrategy(c.pricing.strategy);
      setAutoQuote(c.autoQuote);
      setAutoWork(c.autoWork);
      setMaxTasks(c.maxConcurrentTasks);
    }).catch(() => {
      // ignore
    });
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await api.updateConfig({
        specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
        pricing: { strategy, baseRateEth: baseRate, maxRateEth: maxRate },
        autoQuote,
        autoWork,
        maxConcurrentTasks: maxTasks,
      });
      setMessage("Saved!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return <p className="text-zinc-500 text-center py-20">Loading config...</p>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Settings
      </h2>

      {/* Read-only info */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 space-y-2">
        <Row label="Agent ID" value={config.agentId} />
        <Row label="Provider" value={`${config.llm.provider} (${config.llm.model})`} />
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        <Field label="Specialties" hint="Comma-separated">
          <input
            type="text"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            placeholder="code-review, typescript, react"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Pricing Strategy">
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            >
              <option value="fixed">Fixed</option>
              <option value="complexity">Complexity-based</option>
            </select>
          </Field>

          <Field label="Max Concurrent Tasks">
            <input
              type="number"
              min={1}
              max={10}
              value={maxTasks}
              onChange={(e) => setMaxTasks(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Base Rate (ETH)">
            <input
              type="text"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </Field>
          <Field label="Max Rate (ETH)">
            <input
              type="text"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </Field>
        </div>

        <div className="flex gap-6">
          <Toggle label="Auto-quote" checked={autoQuote} onChange={setAutoQuote} />
          <Toggle label="Auto-work" checked={autoWork} onChange={setAutoWork} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void save()}
            disabled={saving}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {message && (
            <span className={`text-sm ${message === "Saved!" ? "text-emerald-400" : "text-red-400"}`}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300 font-mono">{value}</span>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">
        {label}
        {hint && <span className="text-zinc-600 normal-case ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
          checked ? "bg-emerald-600" : "bg-zinc-700"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-sm text-zinc-300">{label}</span>
    </label>
  );
}
