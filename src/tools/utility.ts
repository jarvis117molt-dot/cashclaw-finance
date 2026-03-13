import type { Tool } from "./types.js";
import { loadFeedback } from "../memory/feedback.js";
import { appendLog } from "../memory/log.js";
import { searchMemory } from "../memory/search.js";
import * as cli from "../moltlaunch/cli.js";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

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

export const memorySearch: Tool = {
  definition: {
    name: "memory_search",
    description:
      "Search your knowledge base and past feedback for relevant context. " +
      "Use when you need to recall past experiences, lessons learned, or " +
      "feedback patterns related to a topic or task type.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query — keywords describing what you're looking for",
        },
        limit: {
          type: "number",
          description: "Max results to return (default 5)",
        },
      },
      required: ["query"],
    },
  },
  async execute(input) {
    const query = input.query;
    if (typeof query !== "string" || !query.trim()) {
      return { success: false, data: "Missing required field: query" };
    }
    const limit = (input.limit as number) || 5;

    const hits = searchMemory(query, limit);

    if (hits.length === 0) {
      return { success: true, data: "No relevant memories found." };
    }

    const summary = hits
      .map((h, i) => `${i + 1}. [${h.type}] ${h.text.slice(0, 300)}`)
      .join("\n\n");

    return { success: true, data: summary };
  },
};

export const createResearchBrief: Tool = {
  definition: {
    name: "create_research_brief",
    description: "Create a structured finance research brief for a stock, ETF, macro theme, or market event.",
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Company, ticker, sector, macro topic, or market theme" },
        angle: { type: "string", description: "Editorial angle such as earnings preview, valuation, dividend, or technical setup" },
        audience: { type: "string", description: "Target audience, e.g. beginner investors, active traders, advisors" },
      },
      required: ["topic"],
    },
  },
  async execute(input) {
    const topic = typeof input.topic === "string" ? input.topic.trim() : "";
    if (!topic) return { success: false, data: "Missing required field: topic" };
    const angle = typeof input.angle === "string" && input.angle.trim()
      ? input.angle.trim()
      : "balanced investment analysis";
    const audience = typeof input.audience === "string" && input.audience.trim()
      ? input.audience.trim()
      : "retail investors";

    const slug = slugify(`${topic}-${angle}`);
    const brief = [
      `# Research Brief — ${topic}`,
      ``,
      `- **Angle:** ${angle}`,
      `- **Audience:** ${audience}`,
      `- **Suggested slug:** /${slug}`,
      ``,
      `## Questions to answer`,
      `1. What is the core thesis and what could invalidate it?`,
      `2. Which recent catalysts, filings, earnings notes, or macro events matter most?`,
      `3. How does valuation compare with peers, history, or sector averages?`,
      `4. What are the main bull, base, and bear cases?`,
      `5. What data, charts, or source documents should be cited?`,
      ``,
      `## Source checklist`,
      `- Investor relations / SEC filings / earnings transcript`,
      `- Reputable market data source for price, volume, and key ratios`,
      `- At least 2 non-promotional third-party sources`,
      `- Internal notes or prior memory search results`,
      ``,
      `## Deliverable outline`,
      `- Thesis summary`,
      `- Business overview`,
      `- Catalyst analysis`,
      `- Valuation context`,
      `- Risks and disclaimers`,
      `- FAQ / related internal links`,
      ``,
      `## Compliance reminder`,
      `This is informational content, not personalised financial advice. Flag uncertainty, cite sources, and distinguish fact from opinion.`,
    ].join("\n");

    return { success: true, data: brief };
  },
};

export const createSeoOutline: Tool = {
  definition: {
    name: "create_finance_seo_outline",
    description: "Generate an SEO-first outline for a finance article with intent, entities, FAQs, and internal-link ideas.",
    input_schema: {
      type: "object",
      properties: {
        keyword: { type: "string", description: "Primary finance keyword" },
        search_intent: { type: "string", description: "Intent such as informational, comparison, transactional" },
        related_entities: { type: "array", items: { type: "string" }, description: "Tickers, concepts, brands, or products to cover" },
      },
      required: ["keyword"],
    },
  },
  async execute(input) {
    const keyword = typeof input.keyword === "string" ? input.keyword.trim() : "";
    if (!keyword) return { success: false, data: "Missing required field: keyword" };
    const intent = typeof input.search_intent === "string" && input.search_intent.trim()
      ? input.search_intent.trim()
      : "informational";
    const entities = toStringArray(input.related_entities);

    const outline = [
      `# SEO Outline — ${keyword}`,
      ``,
      `- **Primary keyword:** ${keyword}`,
      `- **Intent:** ${intent}`,
      `- **Suggested title:** ${keyword} in 2026: What Matters, Risks, and Better Alternatives`,
      `- **Meta description:** Clear, source-backed breakdown of ${keyword}, including risks, upside, and what investors should watch next.`,
      ``,
      `## Recommended structure`,
      `1. Quick answer / TL;DR`,
      `2. What ${keyword} is and why investors care`,
      `3. Latest developments or market context`,
      `4. Key metrics, valuation, or yield considerations`,
      `5. Bull vs bear case`,
      `6. Who it may suit / who should avoid it`,
      `7. FAQ`,
      `8. Sources and disclaimer`,
      ``,
      `## FAQ targets`,
      `- Is ${keyword} a good investment right now?`,
      `- What are the main risks of ${keyword}?`,
      `- How does ${keyword} compare with alternatives?`,
      `- What data should investors track next?`,
      ``,
      `## Internal link ideas`,
      `- Beginner's guide to valuation metrics`,
      `- Sector overview / macro explainer`,
      `- Best broker / newsletter / tool comparison`,
      ``,
      entities.length > 0 ? `## Related entities\n${entities.map((e) => `- ${e}`).join("\n")}` : `## Related entities\n- Add comparable tickers, ETFs, brokers, or finance products relevant to the keyword.`,
    ].join("\n");

    return { success: true, data: outline };
  },
};

export const buildAffiliatePlan: Tool = {
  definition: {
    name: "build_affiliate_plan",
    description: "Create a finance affiliate monetization plan for an article, guide, comparison page, or newsletter.",
    input_schema: {
      type: "object",
      properties: {
        content_type: { type: "string", description: "Article, comparison page, landing page, or newsletter" },
        primary_offer: { type: "string", description: "Main affiliate offer or product category" },
        secondary_offers: { type: "array", items: { type: "string" }, description: "Optional supporting offers" },
      },
      required: ["content_type", "primary_offer"],
    },
  },
  async execute(input) {
    const contentType = typeof input.content_type === "string" ? input.content_type.trim() : "";
    const primaryOffer = typeof input.primary_offer === "string" ? input.primary_offer.trim() : "";
    if (!contentType) return { success: false, data: "Missing required field: content_type" };
    if (!primaryOffer) return { success: false, data: "Missing required field: primary_offer" };
    const secondary = toStringArray(input.secondary_offers);

    const plan = [
      `# Affiliate Plan`,
      ``,
      `- **Content type:** ${contentType}`,
      `- **Primary offer:** ${primaryOffer}`,
      secondary.length > 0 ? `- **Secondary offers:** ${secondary.join(", ")}` : `- **Secondary offers:** none specified`,
      ``,
      `## Placement strategy`,
      `1. Add a trust-first disclosure near the top.`,
      `2. Place the primary CTA after the quick answer and again after the comparison table.`,
      `3. Use secondary offers only when they genuinely serve different user intents.`,
      `4. Add a final CTA in the conclusion and one contextual CTA in the FAQ.`,
      ``,
      `## Tracking`,
      `- Standardise UTM naming by channel, campaign, and article slug.`,
      `- Maintain one source of truth for links, commission terms, and disclosure text.`,
      `- Mark every CTA with placement labels such as hero, mid-article, table, faq, footer.`,
      ``,
      `## Compliance`,
      `- Disclose affiliate relationships clearly.`,
      `- Avoid exaggerated income or return claims.`,
      `- Separate editorial analysis from compensated placements.`,
    ].join("\n");

    return { success: true, data: plan };
  },
};

export const createContentCalendar: Tool = {
  definition: {
    name: "create_content_calendar",
    description: "Generate a finance content calendar for blog, YouTube, X, or newsletter publishing.",
    input_schema: {
      type: "object",
      properties: {
        period: { type: "string", description: "Week, month, or quarter" },
        themes: { type: "array", items: { type: "string" }, description: "Core themes such as earnings, dividend stocks, macro, retirement" },
        channels: { type: "array", items: { type: "string" }, description: "Publishing channels such as blog, newsletter, x, youtube" },
      },
      required: ["period"],
    },
  },
  async execute(input) {
    const period = typeof input.period === "string" ? input.period.trim() : "";
    if (!period) return { success: false, data: "Missing required field: period" };
    const themes = toStringArray(input.themes);
    const channels = toStringArray(input.channels);
    const themeList = themes.length > 0 ? themes : ["market outlook", "stock analysis", "finance tools", "newsletter growth"];
    const channelList = channels.length > 0 ? channels : ["blog", "newsletter", "x"];

    const rows = Array.from({ length: 4 }, (_, i) => {
      const theme = themeList[i % themeList.length];
      return `| ${i + 1} | ${theme} | ${channelList.join(", ")} | Research brief -> article draft -> distribution -> refresh top CTA |`;
    }).join("\n");

    const calendar = [
      `# Content Calendar — ${period}`,
      ``,
      `| Slot | Theme | Channels | Workflow |`,
      `|---|---|---|---|`,
      rows,
      ``,
      `## Editorial checkpoints`,
      `- Verify claims against source data before publication.`,
      `- Add at least one chart, table, or primary-source citation per major piece.`,
      `- Pair each article with one newsletter angle and 2-3 short-form distribution hooks.`,
      `- Review affiliate placement and disclosure before scheduling.`,
    ].join("\n");

    return { success: true, data: calendar };
  },
};

export const createNewsletterWorkflow: Tool = {
  definition: {
    name: "create_newsletter_workflow",
    description: "Create a repeatable workflow for finance newsletter production, QA, and post-send analysis.",
    input_schema: {
      type: "object",
      properties: {
        newsletter_name: { type: "string", description: "Newsletter name" },
        cadence: { type: "string", description: "Daily, weekly, or biweekly" },
        goal: { type: "string", description: "Primary goal such as retention, clicks, affiliate revenue, or trust" },
      },
      required: ["newsletter_name"],
    },
  },
  async execute(input) {
    const newsletterName = typeof input.newsletter_name === "string" ? input.newsletter_name.trim() : "";
    if (!newsletterName) return { success: false, data: "Missing required field: newsletter_name" };
    const cadence = typeof input.cadence === "string" && input.cadence.trim() ? input.cadence.trim() : "weekly";
    const goal = typeof input.goal === "string" && input.goal.trim() ? input.goal.trim() : "trust and click-through rate";

    const workflow = [
      `# Newsletter Workflow — ${newsletterName}`,
      ``,
      `- **Cadence:** ${cadence}`,
      `- **Primary goal:** ${goal}`,
      ``,
      `## Production sequence`,
      `1. Collect top stories, charts, and notes from the week's research queue.`,
      `2. Rank ideas by urgency, novelty, and audience value.`,
      `3. Draft subject line options, preview text, and a one-paragraph opener.`,
      `4. Insert primary article CTA and optional affiliate CTA with clear disclosure.`,
      `5. Run factual QA, compliance review, and link validation.`,
      `6. Schedule send and define post-send metrics to review in 24-48 hours.`,
      ``,
      `## KPI review`,
      `- Open rate`,
      `- Click-through rate`,
      `- Replies / qualitative feedback`,
      `- Affiliate clicks and conversion by placement`,
      `- Unsubscribes and spam complaints`,
    ].join("\n");

    return { success: true, data: workflow };
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
    const entry = input.entry;
    if (typeof entry !== "string" || !entry.trim()) {
      return { success: false, data: "Missing required field: entry" };
    }
    appendLog(entry);
    return { success: true, data: "Logged." };
  },
};
