import type { WorkClawConfig } from "./config.js";
import type { LLMProvider } from "./llm/types.js";
import type { Task } from "./moltlaunch/types.js";
import * as cli from "./moltlaunch/cli.js";
import { runAgentLoop, type LoopResult } from "./loop/index.js";
import { storeFeedback } from "./memory/feedback.js";
import { appendLog } from "./memory/log.js";

export interface HeartbeatState {
  running: boolean;
  activeTasks: Map<string, Task>;
  lastPoll: number;
  totalPolls: number;
  startedAt: number;
  events: ActivityEvent[];
}

export interface ActivityEvent {
  timestamp: number;
  type: "poll" | "loop_start" | "loop_complete" | "tool_call" | "feedback" | "error";
  taskId?: string;
  message: string;
}

type EventListener = (event: ActivityEvent) => void;

const TERMINAL_STATUSES = new Set([
  "completed", "declined", "cancelled", "expired", "resolved",
]);

export function createHeartbeat(
  config: WorkClawConfig,
  llm: LLMProvider,
) {
  const state: HeartbeatState = {
    running: false,
    activeTasks: new Map(),
    lastPoll: 0,
    totalPolls: 0,
    startedAt: 0,
    events: [],
  };

  let timer: ReturnType<typeof setTimeout> | null = null;
  const processing = new Set<string>();
  const listeners: EventListener[] = [];

  function emit(event: Omit<ActivityEvent, "timestamp">) {
    const full: ActivityEvent = { ...event, timestamp: Date.now() };
    state.events.push(full);
    if (state.events.length > 200) {
      state.events = state.events.slice(-200);
    }
    for (const fn of listeners) fn(full);
  }

  function onEvent(fn: EventListener) {
    listeners.push(fn);
  }

  async function tick() {
    try {
      const tasks = await cli.getInbox(config.agentId);
      state.lastPoll = Date.now();
      state.totalPolls++;

      emit({ type: "poll", message: `Polled inbox: ${tasks.length} task(s)` });
      appendLog(`Polled inbox — ${tasks.length} task(s)`);

      for (const task of tasks) {
        if (TERMINAL_STATUSES.has(task.status)) {
          if (task.status === "completed" && task.ratedScore !== undefined) {
            handleCompleted(task);
          }
          state.activeTasks.delete(task.id);
          continue;
        }

        if (processing.has(task.id)) continue;

        if (task.status === "quoted" || task.status === "submitted") {
          state.activeTasks.set(task.id, task);
          continue;
        }

        if (processing.size >= config.maxConcurrentTasks) continue;

        state.activeTasks.set(task.id, task);
        processing.add(task.id);

        emit({ type: "loop_start", taskId: task.id, message: `Agent loop started (${task.status})` });
        appendLog(`Agent loop started for ${task.id} (${task.status})`);

        runAgentLoop(llm, task, config)
          .then((result: LoopResult) => {
            const toolNames = result.toolCalls.map((tc) => tc.name).join(", ");
            emit({
              type: "loop_complete",
              taskId: task.id,
              message: `Loop done in ${result.turns} turn(s): [${toolNames}]`,
            });
            appendLog(`Loop done for ${task.id}: ${result.turns} turns, tools=[${toolNames}]`);

            for (const tc of result.toolCalls) {
              emit({
                type: "tool_call",
                taskId: task.id,
                message: `${tc.name}(${JSON.stringify(tc.input).slice(0, 100)}) → ${tc.success ? "ok" : "err"}`,
              });
            }
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            emit({ type: "error", taskId: task.id, message: `Loop error: ${msg}` });
            appendLog(`Loop error for ${task.id}: ${msg}`);
          })
          .finally(() => {
            processing.delete(task.id);
          });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      emit({ type: "error", message: `Poll error: ${msg}` });
      appendLog(`Poll error: ${msg}`);
    }

    scheduleNext();
  }

  function handleCompleted(task: Task) {
    if (task.ratedScore === undefined) return;

    storeFeedback({
      taskId: task.id,
      taskDescription: task.task,
      score: task.ratedScore,
      comments: task.ratedComment ?? "",
      timestamp: Date.now(),
    });

    emit({
      type: "feedback",
      taskId: task.id,
      message: `Completed — rated ${task.ratedScore}/5`,
    });
    appendLog(`Task ${task.id} completed — score ${task.ratedScore}/5`);
  }

  function scheduleNext() {
    if (!state.running) return;

    const hasUrgent = [...state.activeTasks.values()].some(
      (t) => t.status === "requested" || t.status === "revision" || t.status === "accepted",
    );

    const interval = hasUrgent
      ? config.polling.urgentIntervalMs
      : config.polling.intervalMs;

    timer = setTimeout(() => void tick(), interval);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.startedAt = Date.now();
    appendLog("Heartbeat started");
    void tick();
  }

  function stop() {
    state.running = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    appendLog("Heartbeat stopped");
  }

  return { state, start, stop, onEvent };
}

export type Heartbeat = ReturnType<typeof createHeartbeat>;
