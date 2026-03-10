import { useState, useEffect } from "react";
import { api, type StatusData, type ActivityEvent, type StatsData } from "../lib/api.js";

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function truncateAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const EVENT_COLORS: Record<string, string> = {
  poll: "text-zinc-500",
  loop_start: "text-blue-400",
  loop_complete: "text-emerald-400",
  tool_call: "text-amber-400",
  feedback: "text-purple-400",
  error: "text-red-500",
};

export function Dashboard() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const [s, t, st] = await Promise.all([
          api.getStatus(),
          api.getTasks(),
          api.getStats(),
        ]);
        if (!active) return;
        setStatus(s);
        setEvents(t.events.reverse());
        setStats(st);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Connection failed");
      }
    }

    void poll();
    const interval = setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  async function toggleAgent() {
    if (!status) return;
    if (status.running) {
      await api.stop();
    } else {
      await api.start();
    }
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">Agent not reachable</p>
        <p className="text-zinc-500 text-sm mt-2">{error}</p>
        <p className="text-zinc-600 text-xs mt-4">
          Make sure WorkClaw is running: <code className="bg-zinc-900 px-2 py-0.5 rounded">workclaw start</code>
        </p>
      </div>
    );
  }

  if (!status) {
    return <p className="text-zinc-500 text-center py-20">Connecting...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                status.running ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
              }`}
            />
            <span className="font-medium">
              {status.running ? "Running" : "Stopped"}
            </span>
          </div>
          {status.running && (
            <span className="text-zinc-500 text-sm">
              Uptime: {formatUptime(status.uptime)}
            </span>
          )}
        </div>
        <button
          onClick={() => void toggleAgent()}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            status.running
              ? "bg-red-900/50 text-red-300 hover:bg-red-900"
              : "bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900"
          }`}
        >
          {status.running ? "Stop" : "Start"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Agent ID" value={status.agentId} />
        <StatCard label="Uptime" value={status.running ? formatUptime(status.uptime) : "stopped"} />
        <StatCard label="Active Tasks" value={String(status.activeTasks)} />
        <StatCard label="Polls" value={String(status.totalPolls)} />
        {stats && (
          <>
            <StatCard label="Total Tasks" value={String(stats.totalTasks)} />
            <StatCard label="Avg Rating" value={stats.avgScore > 0 ? `${stats.avgScore}/5` : "—"} />
            <StatCard label="Completion" value={stats.totalTasks > 0 ? `${stats.completionRate}%` : "—"} />
            <StatCard
              label="Last Poll"
              value={status.lastPoll ? formatTime(status.lastPoll) : "—"}
            />
          </>
        )}
      </div>

      {/* Activity feed */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Activity Feed
        </h2>
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-zinc-600 text-sm p-4 text-center">
              No activity yet
            </p>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {events.map((ev, i) => (
                <div key={i} className="px-4 py-2 flex items-start gap-3 text-sm">
                  <span className="text-zinc-600 tabular-nums shrink-0">
                    {formatTime(ev.timestamp)}
                  </span>
                  <span
                    className={`uppercase text-xs font-bold w-24 shrink-0 ${EVENT_COLORS[ev.type] ?? "text-zinc-400"}`}
                  >
                    {ev.type.replace("_", " ")}
                  </span>
                  {ev.taskId && (
                    <code className="text-zinc-500 text-xs shrink-0">
                      {ev.taskId.slice(0, 8)}
                    </code>
                  )}
                  <span className="text-zinc-300">{ev.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold mt-1 truncate" title={value}>
        {value}
      </p>
    </div>
  );
}
