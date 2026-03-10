import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Task, Bounty, WalletInfo, RegisterResult } from "./types.js";

const execFileAsync = promisify(execFile);

const MLTL_BIN = "mltl";
const DEFAULT_TIMEOUT = 30_000;
const REGISTER_TIMEOUT = 120_000;

interface CliError {
  error: string;
  code?: string;
}

async function mltl<T>(
  args: string[],
  timeout = DEFAULT_TIMEOUT,
): Promise<T> {
  try {
    const { stdout } = await execFileAsync(MLTL_BIN, ["--json", ...args], {
      timeout,
      env: { ...process.env },
    });

    const parsed = JSON.parse(stdout.trim()) as T | CliError;

    // mltl may return { error: "..." } in stdout
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "error" in parsed &&
      typeof (parsed as CliError).error === "string"
    ) {
      throw new Error((parsed as CliError).error);
    }

    return parsed as T;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("mltl")) {
      throw err;
    }
    if (err instanceof Error) {
      // Improve common errors
      if ("code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(
          "mltl CLI not found. Install it with: npm install -g @moltlaunch/cli",
        );
      }
      throw new Error(`mltl error: ${err.message}`);
    }
    throw err;
  }
}

// --- Setup ---

export async function walletShow(): Promise<WalletInfo> {
  return mltl<WalletInfo>(["wallet", "show"]);
}

export async function walletImport(key: string): Promise<WalletInfo> {
  return mltl<WalletInfo>(["wallet", "import", "--key", key]);
}

export interface RegisterOpts {
  name: string;
  description: string;
  skills: string[];
  price: string;
  symbol?: string;
}

export async function registerAgent(opts: RegisterOpts): Promise<RegisterResult> {
  const args = [
    "register",
    "--name", opts.name,
    "--description", opts.description,
    "--skills", opts.skills.join(","),
    "--price", opts.price,
  ];
  if (opts.symbol) {
    args.push("--symbol", opts.symbol);
  }
  return mltl<RegisterResult>(args, REGISTER_TIMEOUT);
}

// --- Task operations ---

export async function getInbox(agentId?: string): Promise<Task[]> {
  const args = ["inbox"];
  if (agentId) args.push("--agent", agentId);
  const result = await mltl<{ tasks: Task[] }>(args);
  return result.tasks;
}

export async function getTask(taskId: string): Promise<Task> {
  const result = await mltl<{ task: Task }>(["task", "get", taskId]);
  return result.task;
}

export async function quoteTask(
  taskId: string,
  priceEth: string,
  message?: string,
): Promise<void> {
  const args = ["task", "quote", taskId, "--price", priceEth];
  if (message) args.push("--message", message);
  await mltl<unknown>(args);
}

export async function declineTask(
  taskId: string,
  reason?: string,
): Promise<void> {
  const args = ["task", "decline", taskId];
  if (reason) args.push("--reason", reason);
  await mltl<unknown>(args);
}

export async function submitWork(
  taskId: string,
  result: string,
): Promise<void> {
  await mltl<unknown>(["task", "submit", taskId, "--result", result]);
}

export async function sendMessage(
  taskId: string,
  content: string,
): Promise<void> {
  await mltl<unknown>(["task", "message", taskId, "--content", content]);
}

export async function getBounties(): Promise<Bounty[]> {
  const result = await mltl<{ bounties: Bounty[] }>(["bounties"]);
  return result.bounties;
}

export async function claimBounty(
  taskId: string,
  message?: string,
): Promise<void> {
  const args = ["bounty", "claim", taskId];
  if (message) args.push("--message", message);
  await mltl<unknown>(args);
}
