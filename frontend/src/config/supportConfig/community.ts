export interface CommunityRole {
  role: string;
  icon: string;
  desc: string;
}

export const communityRoles: CommunityRole[] = [
  { role: 'Developers', icon: '👨‍💻', desc: 'Contribute to open-source code and build practical business tools.' },
  { role: 'Designers', icon: '🎨', desc: 'Help shape premium user interfaces and intuitive workflow experiences.' },
  { role: 'Entrepreneurs', icon: '💼', desc: 'Share workflow challenges and build digital systems together.' },
  { role: 'Students', icon: '🎓', desc: 'Gain real-world experience by collaborating on active MVPs.' },
  { role: 'Companies', icon: '🏢', desc: 'Partner on research pilots, integrations, and automation.' },
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
    { title: 'Become a Collaborator', desc: 'Join active repositories to develop features.' },
    { title: 'Join Beta Testing', desc: 'Test early release MVPs and debug database systems.' },
    { title: 'Share Ideas', desc: 'Suggest workflow updates or database schema improvements.' }
  ],
  promote: [
    { title: 'Share My Work', desc: 'Promote open-source projects to developers.' },
    { title: 'Recommend the Platform', desc: 'Introduce local SMEs to automation concepts.' },
    { title: 'Spread the Vision', desc: 'Share educational tutorials on social platforms.' }
  ],
  partner: [
    { title: 'Business Collaboration', desc: 'Integrate tools into active customer operations.' },
    { title: 'Sponsorship Opportunities', desc: 'Sponsor server infrastructure and research.' },
    { title: 'Technology Partnership', desc: 'Co-develop specialized software APIs.' }
  ],
  learn: [
    { title: 'Read Articles', desc: 'Study operational logs and normalization guides.' },
    { title: 'Join Workshops', desc: 'Participate in live systems development events.' },
    { title: 'Explore Projects', desc: 'Inspect source code architectures to learn patterns.' }
  ]
};
