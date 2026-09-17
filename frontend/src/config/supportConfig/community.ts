export interface CommunityRole {
  role: string;
  icon: string;
  desc: string;
}

export const communityRoles: CommunityRole[] = [
  { role: 'Developers', icon: '👨‍💻', desc: 'Collaborate on secure websites, integrations, and practical business systems.' },
  { role: 'Designers', icon: '🎨', desc: 'Help shape premium user interfaces and intuitive workflow experiences.' },
  { role: 'Entrepreneurs', icon: '💼', desc: 'Share workflow challenges and build digital systems together.' },
  { role: 'Students', icon: '🎓', desc: 'Learn from practical projects, mentorship, and structured digital skills.' },
  { role: 'Companies', icon: '🏢', desc: 'Partner on service delivery, supplier relationships, and business solutions.' },
  { role: 'Mentors', icon: '💡', desc: 'Guide the next generation of builders and share systems knowledge.' }
];

export interface ContributionItem {
  title: string;
  desc: string;
}

export interface WaysToContribute {
  collaborate: ContributionItem[];
  promote: ContributionItem[];
  partner: ContributionItem[];
  learn: ContributionItem[];
}

export const waysToContribute: WaysToContribute = {
  collaborate: [
    { title: 'Become a Collaborator', desc: 'Contribute professional skills to suitable projects and services.' },
    { title: 'Join Product Testing', desc: 'Test customer journeys and report clear, reproducible feedback.' },
    { title: 'Share Business Insights', desc: 'Explain real workflow problems that technology can solve.' }
  ],
  promote: [
    { title: 'Share the Work', desc: 'Introduce useful projects and services to people who need them.' },
    { title: 'Recommend the Platform', desc: 'Connect SMEs with practical digital solutions and guidance.' },
    { title: 'Share Learning Resources', desc: 'Help useful business and technology lessons reach more people.' }
  ],
  partner: [
    { title: 'Business Collaboration', desc: 'Work together on delivery, referrals, or customer solutions.' },
    { title: 'Supplier Partnership', desc: 'Support printing, stationery, networking, or electronics fulfilment.' },
    { title: 'Technology Partnership', desc: 'Build secure integrations and specialized business systems.' }
  ],
  learn: [
    { title: 'Read Articles', desc: 'Learn practical business and technology concepts.' },
    { title: 'Join Training', desc: 'Participate in future digital-skills sessions and workshops.' },
    { title: 'Explore Projects', desc: 'Review case studies, decisions, and completed outcomes.' }
  ]
};
