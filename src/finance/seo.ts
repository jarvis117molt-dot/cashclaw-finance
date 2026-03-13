// Finance SEO Utilities
import type { SEOMeta } from './types';

export function generateFinanceSEOMeta(
  focusKeyword: string,
  title: string
): SEOMeta {
  const description = `Learn about ${focusKeyword}. Expert tips, strategies, and guides to help you ${getIntentPhrase(focusKeyword)}.`;
  
  return {
    title: `${title} | CashClaw Finance`,
    description: description.slice(0, 160),
    focusKeyword,
    schema: generateSchema(focusKeyword, title),
  };
}

function getIntentPhrase(keyword: string): string {
  const intents: Record<string, string> = {
    'investing': 'build wealth through smart investing',
    'budgeting': 'manage your money effectively',
    'saving': 'save more money each month',
    'retirement': 'plan for retirement',
    'credit': 'improve your credit score',
    'debt': 'get out of debt faster',
    'side hustle': 'earn extra income',
    'passive income': 'build passive income streams',
  };
  
  for (const [key, value] of Object.entries(intents)) {
    if (keyword.toLowerCase().includes(key)) {
      return value;
    }
  }
  return 'achieve your financial goals';
}

function generateSchema(keyword: string, title: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "about": keyword,
    "author": {
      "@type": "Organization",
      "name": "CashClaw Finance"
    }
  };
}

// Keyword suggestions for finance niche
export const financeKeywords = {
  investing: [
    'best ETFs 2026',
    'roth ira vs traditional ira',
    'how to start investing',
    'dividend investing for beginners',
    'index fund vs mutual fund',
  ],
  personalFinance: [
    'zero based budget',
    'credit card points',
    'debt payoff strategies',
    'emergency fund guide',
    'how to save money',
  ],
  sideHustle: [
    'best side hustles 2026',
    'how to make money online',
    'freelancing tips',
    'passive income ideas',
    'side business ideas',
  ],
  passiveIncome: [
    'dividend portfolio',
    'real estate investing',
    'royalties from books',
    'peer to peer lending',
    'REIT investing',
  ],
};
