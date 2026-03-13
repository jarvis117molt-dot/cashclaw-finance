// Finance Content Generator
import { generateFinanceSEOMeta, financeKeywords } from './seo';
import type { FinanceArticle, AffiliateLink } from './types';

export class FinanceContentGenerator {
  private affiliateLinks: AffiliateLink[] = [];

  addAffiliateLink(link: AffiliateLink) {
    this.affiliateLinks.push(link);
  }

  generateArticle(topic: FinanceArticle['topic'], keyword: string): FinanceArticle {
    const keywords = financeKeywords[topic];
    
    return {
      title: this.generateTitle(keyword),
      topic,
      keywords: [keyword, ...keywords.slice(0, 4)],
      affiliateLinks: this.getRelevantAffiliates(topic),
      seoMeta: generateFinanceSEOMeta(keyword, keyword),
    };
  }

  private generateTitle(keyword: string): string {
    const templates = [
      `The Ultimate Guide to ${keyword}`,
      `${keyword}: Everything You Need to Know`,
      `How to Master ${keyword} in 2026`,
      `${keyword} - Complete Beginner's Guide`,
      `Why ${keyword} Matters for Your Finances`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private getRelevantAffiliates(topic: FinanceArticle['topic']): AffiliateLink[] {
    const platformMap: Record<FinanceArticle['topic'], string[]> = {
      'investing': ['m1', 'public', 'webull', 'fundrise'],
      'personal-finance': ['ynab'],
      'side-hustle': ['m1'],
      'passive-income': ['fundrise', 'm1'],
    };
    
    return this.affiliateLinks.filter(link => 
      platformMap[topic]?.includes(link.platform)
    );
  }
}

export const contentPillars = {
  investing: [
    'Tax-Efficient Investing',
    'ETF Screeners',
    'Retirement Planning',
    'Stock Analysis',
  ],
  personalFinance: [
    'Budgeting',
    'Credit Optimization',
    'Debt Payoff',
    'Savings Strategies',
  ],
  sideHustle: [
    'Freelancing',
    'Online Business',
    'Side Business Ideas',
    'Time Management',
  ],
  passiveIncome: [
    'Dividend Investing',
    'Real Estate',
    'Digital Products',
    'Royalties',
  ],
};
