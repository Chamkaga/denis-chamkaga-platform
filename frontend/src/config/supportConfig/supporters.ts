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
    impact: 'Helps prepare practical learning resources and community guidance.',
    amountTzs: 5000,
    amountUsd: 2,
    badge: '🌱'
  },
  {
    id: 'growth',
    name: 'Growth Supporter',
    impact: 'Supports portfolio hosting, product demonstrations, and platform infrastructure.',
    amountTzs: 20000,
    amountUsd: 8,
    badge: '🚀'
  },
  {
    id: 'vision',
    name: 'Vision Builder',
    impact: 'Supports Terrasafi service preparation, customer research, and business tools.',
    amountTzs: 50000,
    amountUsd: 20,
    badge: '⭐'
  },
  {
    id: 'champion',
    name: 'Mission Champion',
    impact: 'Helps expand practical training, partnerships, and locally useful technology.',
    amountTzs: 100000,
    amountUsd: 40,
    badge: '❤️'
  }
];
