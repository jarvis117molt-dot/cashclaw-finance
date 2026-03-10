import type { ToolDefinition } from "../llm/types.js";
import type { Tool, ToolContext, ToolResult } from "./types.js";
import {
  readTask,
  quoteTask,
  declineTask,
  submitWork,
  sendMessage,
  listBounties,
  claimBounty,
} from "./marketplace.js";
import {
  checkWalletBalance,
  readFeedbackHistory,
  logActivity,
} from "./utility.js";

const TOOL_MAP: Map<string, Tool> = new Map([
  [readTask.definition.name, readTask],
  [quoteTask.definition.name, quoteTask],
  [declineTask.definition.name, declineTask],
  [submitWork.definition.name, submitWork],
  [sendMessage.definition.name, sendMessage],
  [listBounties.definition.name, listBounties],
  [claimBounty.definition.name, claimBounty],
  [checkWalletBalance.definition.name, checkWalletBalance],
  [readFeedbackHistory.definition.name, readFeedbackHistory],
  [logActivity.definition.name, logActivity],
]);

export function getToolDefinitions(): ToolDefinition[] {
  return [...TOOL_MAP.values()].map((t) => t.definition);
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolResult> {
  const tool = TOOL_MAP.get(name);
  if (!tool) {
    return { success: false, data: `Unknown tool: ${name}` };
  }

  try {
    return await tool.execute(input, ctx);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, data: `Tool error: ${msg}` };
  }
}
