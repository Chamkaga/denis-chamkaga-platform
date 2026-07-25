export interface SupporterTier {
  id: string;
  name: string;
  impact: string;
  amountTzs: number;
  amountUsd: number;
  badge: string;
}

export const supporterTiers: SupporterTier[] = [
  {
    id: 'seed',
    name: 'Seed Supporter',
    impact: 'Helps keep learning resources freely available for local builders.',
    amountTzs: 5000,
    amountUsd: 2,
    badge: '🌱'
  },
  {
    id: 'growth',
    name: 'Growth Supporter',
    impact: 'Supports open-source software development and platform infrastructure.',
    amountTzs: 20000,
    amountUsd: 8,
    badge: '🚀'
  },
  {
    id: 'vision',
    name: 'Vision Builder',
    impact: 'Accelerates Terrasafi development and artificial intelligence innovation.',
    amountTzs: 50000,
    amountUsd: 20,
    badge: '⭐'
  },
  {
    id: 'champion',
    name: 'Mission Champion',
    impact: 'Helps build long-term technology that creates lasting community impact.',
    amountTzs: 100000,
    amountUsd: 40,
    badge: '❤️'
  }
];
