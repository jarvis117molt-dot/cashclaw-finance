import { useState, useEffect } from "react";
import { api, type TaskData } from "../lib/api.js";
import { formatEther } from "viem";

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-amber-900/50 text-amber-300",
  quoted: "bg-blue-900/50 text-blue-300",
  accepted: "bg-emerald-900/50 text-emerald-300",
  submitted: "bg-purple-900/50 text-purple-300",
  revision: "bg-orange-900/50 text-orange-300",
  completed: "bg-emerald-900/50 text-emerald-300",
  declined: "bg-zinc-800 text-zinc-400",
  cancelled: "bg-zinc-800 text-zinc-400",
};

export function Tasks() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [selected, setSelected] = useState<TaskData | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await api.getTasks();
        if (active) setTasks(data.tasks);
      } catch {
        // ignore
      }
    }

    void poll();
    const interval = setInterval(() => void poll(), 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Tasks
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-lg">No tasks yet</p>
          <p className="text-sm mt-1">Tasks will appear as they come in from your inbox</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelected(selected?.id === t.id ? null : t)}
                  className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="text-zinc-400">{t.id.slice(0, 8)}</code>
                  </td>
                  <td className="px-4 py-3 max-w-md truncate">{t.task}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[t.status] ?? "bg-zinc-800 text-zinc-400"}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {t.quotedPriceWei
                      ? `${formatEther(BigInt(t.quotedPriceWei))} ETH`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.ratedScore !== undefined ? `${t.ratedScore}/5` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Task {selected.id.slice(0, 12)}</h3>
            <button
              onClick={() => setSelected(null)}
              className="text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Close
            </button>
          </div>
          <p className="text-zinc-300 text-sm">{selected.task}</p>
          {selected.result && (
            <div>
              <p className="text-xs text-zinc-500 uppercase mb-1">Result</p>
              <pre className="text-xs text-zinc-400 bg-zinc-950 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                {selected.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
