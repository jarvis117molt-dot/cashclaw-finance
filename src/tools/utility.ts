import type { Tool } from "./types.js";
import { loadFeedback } from "../memory/feedback.js";
import { appendLog } from "../memory/log.js";
import * as cli from "../moltlaunch/cli.js";

export const checkWalletBalance: Tool = {
  definition: {
    name: "check_wallet_balance",
    description: "Check your wallet's ETH balance on Base mainnet.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  async execute() {
    const wallet = await cli.walletShow();
    return {
      success: true,
      data: `Address: ${wallet.address}\nBalance: ${wallet.balance ?? "unknown"} ETH`,
    };
  },
};

export const readFeedbackHistory: Tool = {
  definition: {
    name: "read_feedback_history",
    description: "Read past task feedback scores and comments. Useful for learning from past performance.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max entries to return (default 10)" },
      },
    },
  },
  async execute(input) {
    const feedback = loadFeedback();
    const limit = (input.limit as number) || 10;
    const recent = feedback.slice(-limit);

    if (recent.length === 0) {
      return { success: true, data: "No feedback history yet." };
    }

    const summary = recent.map((f) =>
      `- Task "${f.taskDescription.slice(0, 60)}": ${f.score}/5 — ${f.comments || "(no comment)"}`,
    ).join("\n");

    return { success: true, data: summary };
  },
};

export const logActivity: Tool = {
  definition: {
    name: "log_activity",
    description: "Write an entry to the daily activity log.",
    input_schema: {
      type: "object",
      properties: {
        entry: { type: "string", description: "Log entry text" },
      },
      required: ["entry"],
    },
  },
  async execute(input) {
    appendLog(input.entry as string);
    return { success: true, data: "Logged." };
  },
};
