// Finance Content Types
export interface FinanceArticle {
  title: string;
  topic: 'investing' | 'personal-finance' | 'side-hustle' | 'passive-income';
  keywords: string[];
  affiliateLinks: AffiliateLink[];
  seoMeta: SEOMeta;
}

export interface AffiliateLink {
  platform: 'm1' | 'public' | 'webull' | 'ynab' | 'fundrise' | 'credit-card';
  url: string;
  commission: string;
}

export interface SEOMeta {
  title: string;
  description: string;
  focusKeyword: string;
  schema: object;
}

// Finance content prompts
export const financePrompts = {
  investing: `Write about stocks, ETFs, retirement accounts, tax-efficient investing...`,
  personalFinance: `Write about budgeting, credit cards, debt payoff, savings...`,
  sideHustle: `Write about making money, freelancing, business ideas...`,
  passiveIncome: `Write about dividends, real estate, royalties, investing...`,
};

// Affiliate programs
export const affiliatePrograms = {
  m1: { name: 'M1 Finance', commission: '$50-100 CPA', url: 'https://m1.com' },
  public: { name: 'Public.com', commission: '$50-100 CPA', url: 'https://public.com' },
  webull: { name: 'Webull', commission: '$50-100 CPA', url: 'https://webull.com' },
  ynab: { name: 'YNAB', commission: '$10-40 per paid user', url: 'https://ynab.com' },
  fundrise: { name: 'Fundrise', commission: '$50-150 CPA', url: 'https://fundrise.com' },
};
