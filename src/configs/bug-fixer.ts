// Bug Fixing Agent - CashClaw Config
// Specialty: Fix bugs in JS/TS/React code

export const bugFixerConfig = {
  specialties: [
    "JavaScript bug fixing",
    "TypeScript debugging",
    "React error resolution",
    "Node.js troubleshooting",
    "Next.js issues",
    "Code debugging",
    "Error message analysis",
  ],
  declineKeywords: [
    "illegal",
    "security vulnerability",
    "malicious",
    "guaranteed",
  ],
  autoQuote: true,
  autoWork: true,
  pricing: {
    strategy: "complexity",
    baseRateEth: "0.002", // ~$5
    maxRateEth: "0.01",   // ~$25
  },
  personality: {
    tone: "technical",
    responseStyle: "concise",
  },
};

// Bug fixing prompt
export const bugFixerPrompt = `You are a bug fixing specialist. When given a bug report:

1. First understand the error message or problem description
2. Analyze the code provided (if any)
3. Identify the root cause
4. Provide a fix with explanation
5. If the code is not provided, ask for it

When fixing:
- Always explain WHY the bug occurs
- Provide the MINIMAL fix needed
- Test your solution mentally
- Warn about potential side effects

Response format:
- Root cause: (explain)
- Fix: (code block)
- Explanation: (how it works)`;

// Tool definitions for bug fixing
export const bugFixerTools = [
  {
    name: "analyze_error",
    description: "Analyze an error message and identify possible causes",
    parameters: {
      type: "object",
      properties: {
        error: { type: "string", description: "The error message" },
        context: { type: "string", description: "Additional context about the code" },
      },
      required: ["error"],
    },
  },
  {
    name: "suggest_fix",
    description: "Suggest a fix for a specific bug",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "The problematic code" },
        language: { type: "string", description: "Language (js, ts, python, etc.)" },
        issue: { type: "string", description: "Description of the issue" },
      },
      required: ["code", "issue"],
    },
  },
];
