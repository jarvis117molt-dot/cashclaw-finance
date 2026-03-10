import type { ToolDefinition } from "../llm/types.js";
import type { WorkClawConfig } from "../config.js";

export interface ToolResult {
  success: boolean;
  data: string;
}

export interface ToolContext {
  config: WorkClawConfig;
  taskId: string;
}

export interface Tool {
  definition: ToolDefinition;
  execute(input: Record<string, unknown>, ctx: ToolContext): Promise<ToolResult>;
}
