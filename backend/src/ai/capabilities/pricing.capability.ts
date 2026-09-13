import { SME_CATEGORIES_MAP } from '@dc/shared';
import { ChatSessionFacts } from '../memory';

const aliases: Record<string, string[]> = {
  retail: ['retail', 'shop', 'duka', 'supermarket', 'grocery'],
  pharmacy: ['pharmacy', 'clinic', 'famasi', 'dawa', 'chemist'],
  school: ['school', 'academy', 'shule', 'chuo'],
  restaurant: ['restaurant', 'cafe', 'mgahawa', 'kitchen'],
  salon: ['salon', 'barbershop', 'urembo', 'kinyozi'],
};

export const pricingCapability = {
  explainApprovedRange(input: { facts: ChatSessionFacts; conversationText: string; language: 'sw' | 'en' }): string | undefined {
    const text = `${input.facts.industry || ''} ${input.conversationText}`.toLowerCase();
    const key = Object.keys(SME_CATEGORIES_MAP).find(category =>
      category === input.facts.industry || (aliases[category] || [category]).some(alias => text.includes(alias))
    );
    if (!key) return undefined;
    const offering = SME_CATEGORIES_MAP[key];
    return input.language === 'sw'
      ? `Makadirio yaliyoidhinishwa kwa ${offering.swahiliName} ni ${offering.pricingRange}. Bei ya mwisho hutegemea matawi, watumiaji, vifaa na moduli; quotation rasmi hutolewa baada ya tathmini ya mahitaji. Ni vituo vingapi vya kazi au matawi unahitaji?`
      : `The approved estimate for ${offering.name} is ${offering.pricingRange}. The final price depends on branches, users, hardware, and modules; an official quotation follows requirements discovery. How many workstations or branches do you need?`;
  }
};
