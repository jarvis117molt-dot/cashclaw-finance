import fs from "node:fs";
import path from "node:path";
import { getConfigDir } from "../config.js";

export interface FeedbackEntry {
  taskId: string;
  taskDescription: string;
  score: number;
  comments: string;
  timestamp: number;
}

const MAX_ENTRIES = 100;

function getFeedbackPath(): string {
  return path.join(getConfigDir(), "feedback.json");
}

export function loadFeedback(): FeedbackEntry[] {
  const p = getFeedbackPath();
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as FeedbackEntry[];
}

export function storeFeedback(entry: FeedbackEntry): void {
  const entries = loadFeedback();
  entries.push(entry);

  // Keep only the most recent entries
  const trimmed = entries.slice(-MAX_ENTRIES);

  const p = getFeedbackPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(trimmed, null, 2));
}

export function getFeedbackStats(): {
  totalTasks: number;
  avgScore: number;
  completionRate: number;
} {
  const entries = loadFeedback();
  if (entries.length === 0) {
    return { totalTasks: 0, avgScore: 0, completionRate: 0 };
  }

  const scored = entries.filter((e) => e.score > 0);
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum, e) => sum + e.score, 0) / scored.length
      : 0;

  return {
    totalTasks: entries.length,
    avgScore: Math.round(avgScore * 10) / 10,
    completionRate: Math.round((scored.length / entries.length) * 100),
  };
}
