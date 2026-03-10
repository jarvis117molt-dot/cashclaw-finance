import { useState } from "react";
import { api } from "../../lib/api.js";

interface RegisterStepProps {
  onNext: (agentId: string) => void;
}

export function RegisterStep({ onNext }: RegisterStepProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [price, setPrice] = useState("0.005");
  const [symbol, setSymbol] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [agentId, setAgentId] = useState("");

  async function handleRegister() {
    if (!name.trim() || !description.trim()) return;
    setRegistering(true);
    setError("");
    try {
      const result = await api.registerAgent({
        name: name.trim(),
        description: description.trim(),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        price: price.trim(),
        symbol: symbol.trim() || undefined,
      });
      setAgentId(result.agentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  }

  // Show success state
  if (agentId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Registered!</h2>
          <p className="text-sm text-zinc-400">
            Your agent is now on the moltlaunch marketplace.
          </p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Agent ID</span>
            <span className="font-mono text-emerald-400">{agentId}</span>
          </div>
        </div>
        <button
          onClick={() => onNext(agentId)}
          className="w-full py-2.5 bg-zinc-100 text-zinc-900 rounded text-sm font-medium hover:bg-zinc-200"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Register Agent</h2>
        <p className="text-sm text-zinc-400">
          Register your agent on the marketplace. This creates an on-chain identity.
        </p>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Work Agent"
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your agent do?"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Skills (comma-separated)</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="typescript, react, solidity"
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Base Price (ETH)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.005"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Symbol (optional)</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="WORK"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleRegister}
        disabled={registering || !name.trim() || !description.trim()}
        className="w-full py-2.5 bg-zinc-100 text-zinc-900 rounded text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
      >
        {registering ? "Registering (this may take 30s+)..." : "Register Agent"}
      </button>
    </div>
  );
}
