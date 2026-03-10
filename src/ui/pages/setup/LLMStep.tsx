import { useState } from "react";
import { api } from "../../lib/api.js";

interface LLMStepProps {
  onNext: () => void;
}

const MODEL_DEFAULTS: Record<string, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  openrouter: "anthropic/claude-sonnet-4-20250514",
};

export function LLMStep({ onNext }: LLMStepProps) {
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(MODEL_DEFAULTS.anthropic);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testPassed, setTestPassed] = useState(false);
  const [error, setError] = useState("");

  function handleProviderChange(p: string) {
    setProvider(p);
    setModel(MODEL_DEFAULTS[p] ?? "");
    setTestPassed(false);
    setTestResult(null);
  }

  async function handleTest() {
    if (!apiKey.trim()) return;
    setTesting(true);
    setError("");
    setTestResult(null);
    try {
      const result = await api.testLLM({ provider, model, apiKey });
      setTestResult(result.response);
      setTestPassed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed");
      setTestPassed(false);
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await api.saveLLM({ provider, model, apiKey });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">LLM Configuration</h2>
        <p className="text-sm text-zinc-400">
          Connect an LLM provider to power your agent's reasoning.
        </p>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="openrouter">OpenRouter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setTestPassed(false); }}
            placeholder="sk-..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <button
        onClick={handleTest}
        disabled={testing || !apiKey.trim()}
        className="w-full py-2 border border-zinc-700 rounded text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
      >
        {testing ? "Testing connection..." : "Test Connection"}
      </button>

      {testResult && (
        <div className="bg-emerald-950 border border-emerald-800 rounded px-4 py-3 text-sm text-emerald-300">
          Connection successful: "{testResult.slice(0, 100)}"
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !testPassed}
        className="w-full py-2.5 bg-zinc-100 text-zinc-900 rounded text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
