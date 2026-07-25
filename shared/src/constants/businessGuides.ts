// shared/src/constants/businessGuides.ts
// Single Source of Truth for Business Intelligence, SME Profiles, Denis Personal Knowledge & Educational Guides

export interface SMECategoryInfo {
  id: string;
  name: string;
  swahiliName: string;
  icon: string;
  commonProblems: string[];
  swahiliProblems: string[];
  recommendedRoadmap: string[];
  estimatedROI: string;
  swahiliROI: string;
  commonQuestions: string[];
  relevantServices: string[];
  pricingRange: string;
  caseStudySnippet: string;
}

export interface BusinessGuideTopic {
  id: string;
  slug: string;
  title: string;
  swahiliTitle: string;
  summary: string;
  swahiliSummary: string;
  contentMarkdown: string;
  swahiliContentMarkdown: string;
  category: 'growth' | 'automation' | 'systems' | 'roadmap';
  readTimeMinutes: number;
}

export interface DenisProfileKnowledge {
  name: string;
  title: string;
  background: string;
  philosophy: string;
  strengths: string[];
  workStyle: string;
  certifications: string[];
  keyAchievements: string[];
  whyChooseDenis: string[];
  swahiliWhyChooseDenis: string[];
}

export const DENIS_PERSONAL_KNOWLEDGE: DenisProfileKnowledge = {
  name: "Denis Chamkaga",
  title: "Systems & Business Software Consultant | Web Software Developer",
  background: "BSc. Business Information Technology Graduate with 8+ years of experience engineering transaction systems, enterprise databases, and digital transformation for Tanzanian businesses.",
  philosophy: "Software is not an expense; it is a high-return investment that protects profit, eliminates financial leakage, and scales operations.",
  strengths: [
    "Custom POS, CRM, and ERP system architecture tailored to Tanzanian SME realities",
    "Zero event-loss transaction processing and cash reconciliation (M-Pesa, Airtel Money, DPO)",
    "PostgreSQL, React, TypeScript, Node.js, Docker, Microservices, and OWASP-certified security baseline",
    "Dual focus on technical excellence and practical business profitability"
  ],
  workStyle: "Pragmatic, consultative, and quality-obsessed. Conducts deep operational audits before writing code, providing ongoing long-term technical partnership.",
  certifications: [
    "BSc. Business Information Technology",
    "OWASP Certified Security Baseline Specialist",
    "Enterprise PostgreSQL & Database Architect",
    "OpenTelemetry System Reliability Engineer"
  ],
  keyAchievements: [
    "Engineered 20+ enterprise business systems across retail, healthcare, agriculture, and logistics",
    "Eliminated stock theft and uncollected customer debt for dozens of Tanzanian SMEs",
    "Trained 100+ business staff members on digital tools and POS operational excellence"
  ],
  whyChooseDenis: [
    "Understands local Tanzanian business realities (notebooks, debt books / madeni, M-Pesa reconciliations, TRA compliance)",
    "Engineers custom software tailored to your specific workflow—not generic off-the-shelf software",
    "Provides end-to-end partnership from initial operational audit to employee training and post-launch support"
  ],
  swahiliWhyChooseDenis: [
    "Anajua halisi mazingira ya biashara za Kitanzania (daftari za madeni, stoki kupotea, M-Pesa na Airtel Money reconciliations)",
    "Anatengeneza mfumo maalum unaofaa mchakato wa biashara yako badala ya mfumo wa jumla (off-the-shelf)",
    "Anatoa ushirikiano wa muda mrefu kuanzia ukaguzi wa biashara, mafunzo kwa wafanyakazi, hadi msaada wa kiufundi baada ya mfumo kuanza"
  ]
};

export const DIGITAL_MATURITY_LEVELS = [
  {
    level: 1,
    name: "Un-digitized (Notebooks & Cash)",
    swahiliName: "Kiwango cha 1: Vitabu vya Mkono na Pesa Taslimu",
    tools: ["Notebooks", "Paper Receipts", "Memory"],
    risks: ["Unrecorded sales", "Untracked customer debt (madeni)", "Inventory theft"],
    initialStep: "Digital Point of Sale (POS) + Customer Debt Ledger"
  },
  {
    level: 2,
    name: "Social Seller (WhatsApp / Instagram)",
    swahiliName: "Kiwango cha 2: Wauzaji wa WhatsApp na Instagram",
    tools: ["WhatsApp Business", "Instagram DMs", "Personal Mobile Money"],
    risks: ["Buried order chats", "Double-booking stock", "Manual payment verification fatigue"],
    initialStep: "Digital Webstore Catalog + WhatsApp Order Bot + Mobile Payments"
  },
  {
    level: 3,
    name: "Spreadsheet User (Excel / Google Sheets)",
    swahiliName: "Kiwango cha 3: Watumiaji wa Excel na Sheets",
    tools: ["Excel", "Google Sheets"],
    risks: ["Formula corruption", "No multi-user concurrency", "No real-time stock alert"],
    initialStep: "Centralized Sales & Inventory Database System"
  },
  {
    level: 4,
    name: "Basic Point-of-Sale (POS)",
    swahiliName: "Kiwango cha 4: Watumiaji wa POS ya Kawaida",
    tools: ["Standalone POS", "Receipt Printer"],
    risks: ["Siloed data", "No supplier credit portal", "No multi-branch visibility"],
    initialStep: "Integrated Multi-Branch Inventory & Supplier Portal"
  },
  {
    level: 5,
    name: "Modular ERP User",
    swahiliName: "Kiwango cha 5: Watumiaji wa ERP za Moduli",
    tools: ["Accounting Software", "Third-party POS"],
    risks: ["Disconnected departments", "Lack of real-time executive dashboard"],
    initialStep: "Enterprise Unified ERP & Financial Reconciliation System"
  },
  {
    level: 6,
    name: "Enterprise Digital Leader",
    swahiliName: "Kiwango cha 6: Viongozi wa Kidijitali",
    tools: ["Unified Custom Cloud ERP", "Customer Portal"],
    risks: ["Slow response times", "Un-automated customer support"],
    initialStep: "AI Front Office Assistant & Predictive Business Intelligence"
  }
];

export const SME_CATEGORIES_MAP: Record<string, SMECategoryInfo> = {
  retail: {
    id: "retail",
    name: "Retail Shop & Supermarket",
    swahiliName: "Duka la Rejareja & Supermarket",
    icon: "ShoppingBag",
    commonProblems: [
      "Inventory leaks and untracked theft",
      "Forgotten customer debts (madeni)",
      "Uncertain daily net profit at end of month"
    ],
    swahiliProblems: [
      "Bidhaa kupotea au kuibiwa pasipo kujulikana",
      "Kusahau au kupoteza kumbukumbu za madeni ya wateja",
      "Kutokujua faida halisi ya kila siku wala ya mwezi"
    ],
    recommendedRoadmap: [
      "Barcode Inventory System",
      "Point of Sale (POS)",
      "Digital Debt Ledger",
      "Daily Profit Dashboard"
    ],
    estimatedROI: "Recovers 10-25% lost margin from inventory leaks within 60 days.",
    swahiliROI: "Inarudisha 10-25% ya faida iliyopotea kutokana na stoki kupotea ndani ya siku 60.",
    commonQuestions: [
      "Je, mfumo unafanya kazi hata mtandao ukikatika?",
      "Je, inasaidia kupunguza stoki kiotomatiki wakati wa kuuza?"
    ],
    relevantServices: ["Custom POS System", "Inventory Control Engine", "Debt Tracking Portal"],
    pricingRange: "1.5M - 4.5M TZS",
    caseStudySnippet: "Supermarket in Dar es Salaam reduced stock discrepancy by 94% within 3 months using custom POS."
  },
  pharmacy: {
    id: "pharmacy",
    name: "Pharmacy & Clinic",
    swahiliName: "Famasi & Zahanati",
    icon: "Pill",
    commonProblems: [
      "Expired medicine inventory waste",
      "Batch number & dosage tracking difficulty",
      "Supplier credit payment reconciliation"
    ],
    swahiliProblems: [
      "Madawa ku-expire na kusababisha hasara kubwa",
      "Ugumu wa kufuatilia namba za batch na maelekezo ya dawa",
      "Kutochanganua madeni ya wauzaji wa jumla (wholesalers)"
    ],
    recommendedRoadmap: [
      "Batch-Tracked Inventory",
      "Expiry Alert Engine (60 Days Prior)",
      "Prescription POS",
      "Supplier Reconciliation Portal"
    ],
    estimatedROI: "Zero expired medicine waste; saves 3M-10M TZS annually in wasted stock.",
    swahiliROI: "Zero hasara ya madawa ku-expire; inaokoa Shilingi Milioni 3-10 kila mwaka.",
    commonQuestions: [
      "Je, mfumo unatoa taarifa mapema kabla ya dawa ku-expire?",
      "Je, inatenganisha dawa za Prescription na OTC?"
    ],
    relevantServices: ["Batch Pharmacy System", "Supplier Accounts Engine", "Clinical POS"],
    pricingRange: "2.5M - 6.0M TZS",
    caseStudySnippet: "Dar Pharmacy saved 4.2M TZS in year 1 by eliminating drug expiry waste with automated batch alerts."
  },
  whatsapp_boutique: {
    id: "whatsapp_boutique",
    name: "WhatsApp Boutique & Social Commerce",
    swahiliName: "Wauzaji wa Nguo na Bidhaa Kupitia WhatsApp",
    icon: "MessageCircle",
    commonProblems: [
      "Buried messages & forgotten customer orders",
      "Manual M-Pesa / Airtel Money payment verification",
      "Double-booking limited stock"
    ],
    swahiliProblems: [
      "Ujumbe kuzama kwenye WhatsApp na kupoteza oda za wateja",
      "Kuhakiki malipo ya M-Pesa/Airtel Money kwa mkono kila saa",
      "Kuuza nguo moja kwa wateja wawili kwa wakati mmoja"
    ],
    recommendedRoadmap: [
      "Digital Webstore Catalog",
      "Mobile Money Payment Gateway",
      "Automated Receipt Generator",
      "WhatsApp Order Bot"
    ],
    estimatedROI: "Saves 15+ hours/week chatting; converts 40% more browsers to paid buyers.",
    swahiliROI: "Inaokoa masaa 15+ kwa wiki na kuongeza mauzo kwa 40% kupitia catalog ya kidijitali.",
    commonQuestions: [
      "Je, mteja anaweza kulipa kwa M-Pesa na kupokea risiti bila mimi kuchat naye?",
      "Je, katalogi inafanya kazi kwenye simu za mkononi?"
    ],
    relevantServices: ["E-Commerce Webstore", "Mobile Money Gateway", "WhatsApp Bot"],
    pricingRange: "1.0M - 3.0M TZS",
    caseStudySnippet: "Fashion Boutique in Kinondoni automated order taking and saw 65% revenue growth in 90 days."
  },
  school: {
    id: "school",
    name: "School & Academic Institution",
    swahiliName: "Shule & Vyuo",
    icon: "GraduationCap",
    commonProblems: [
      "Uncollected school fee balance tracking",
      "Manual paper receipt issuing & reconciliation",
      "Parent communication bottlenecks"
    ],
    swahiliProblems: [
      "Ugumu wa kufuatilia salio la ada za wanafunzi",
      "Kutoa risiti za karatasi za mkono na upotevu wa kumbukumbu",
      "Kukosa mfumo rahisi wa kuwasiliana na wazazi"
    ],
    recommendedRoadmap: [
      "Student Management System",
      "Fee Payment Gateway (Control Numbers)",
      "SMS Parent Portal",
      "Digital Report Card Engine"
    ],
    estimatedROI: "Improves school fee collection by 30%; eliminates unverified fee receipts.",
    swahiliROI: "Inaongeza ukusanyaji wa ada kwa 30% na kuondoa risiti bandia.",
    commonQuestions: [
      "Je, wazazi wanaweza kupokea SMS za kumbukumbu ya ada?",
      "Je, mfumo unatengeneza Control Numbers za malipo?"
    ],
    relevantServices: ["School Management System", "Parent Portal", "SMS Broadcast Gateway"],
    pricingRange: "3.5M - 8.0M TZS",
    caseStudySnippet: "Academy in Arusha collected 98% of term fees on time via automated SMS fee notifications."
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant, Bar & Cafe",
    swahiliName: "Mgahawa, Bar & Nyama Choma",
    icon: "Utensils",
    commonProblems: [
      "Kitchen order delay and waiter bill mismatches",
      "Ingredient depletion & recipe waste",
      "Cashier cash collection discrepancies"
    ],
    swahiliProblems: [
      "Cheki za waiter kuchelewa jikoni au kuchanganyika",
      "Upotevu wa kiungo cha chakula jikoni bila taarifa",
      "Tofauti za hesabu kati ya cashier na mauzo halisi"
    ],
    recommendedRoadmap: [
      "Mobile Waiter Ordering POS",
      "Kitchen Display System (KDS)",
      "Recipe Ingredient Stock Depletion",
      "Shift Cashier Closure Reports"
    ],
    estimatedROI: "Speed up table service by 50%; reduces kitchen ingredient leakage by 20%.",
    swahiliROI: "Inaongeza kasi ya kuhudumia meza kwa 50% na kupunguza upotevu wa jikoni kwa 20%.",
    commonQuestions: [
      "Je, waiter anaweza kuchukua oda kwa tablet/simu ikaenda jikoni moja kwa moja?",
      "Je, inazuia kufuta oda bila idhini ya Meneja?"
    ],
    relevantServices: ["Restaurant POS", "Kitchen Display System", "Shift Audit Engine"],
    pricingRange: "2.0M - 5.5M TZS",
    caseStudySnippet: "Grill Lounge in Mikocheni cut meal waiting time from 40 to 18 minutes with KDS tablets."
  },
  hardware: {
    id: "hardware",
    name: "Hardware & Building Materials",
    swahiliName: "Duka la Hardware & Vifaa vya Ujenzi",
    icon: "Hammer",
    commonProblems: [
      "High-value bulk inventory disappearing",
      "Multi-branch stock reconciliation issues",
      "Customer credit ledger confusion"
    ],
    swahiliProblems: [
      "Bidhaa za thamani kubwa (nondo, bati, sementi) kupotea",
      "Ugumu wa kusawazisha stoki kati ya stoo kuu na maduka",
      "Kuchanganyikiwa kwa madeni ya wakandarasi"
    ],
    recommendedRoadmap: [
      "Bulk Hardware POS",
      "Store Dispatch Authorization",
      "Multi-Branch Stock Sync",
      "Contractor Credit Ledger"
    ],
    estimatedROI: "Eliminates high-value inventory theft; secures credit sales for contractors.",
    swahiliROI: "Inazuia upotevu wa vifaa vya thamani kubwa na kulinda kiasi kinachokopeshwa wakandarasi.",
    commonQuestions: [
      "Je, inaruhusu kutenganisha muuzaji wa cashier na mtu wa kutoa mzigo stoo?",
      "Je, inatuma maonyo wakati sementi au nondo zinapofikia kikomo?"
    ],
    relevantServices: ["Hardware ERP", "Store Dispatch System", "Multi-Branch Sync"],
    pricingRange: "3.0M - 7.5M TZS",
    caseStudySnippet: "Hardware distributor in Mwanza prevented 15M TZS in annual store leakage using Dispatch Control."
  }
};

export const BUSINESS_GUIDES_TOPICS: BusinessGuideTopic[] = [
  {
    id: "why-system",
    slug: "why-your-business-needs-a-system",
    title: "Why Your Business Needs a Custom System (Not Just Notebooks)",
    swahiliTitle: "Kwa Nini Biashara Yako Inahitaji Mfumo wa Kidijitali (Siyo Daftari Tu)",
    category: "growth",
    readTimeMinutes: 5,
    summary: "Discover how manual notebooks create financial leakage, cause debt loss, and limit business scaling—and how custom systems safeguard profit.",
    swahiliSummary: "Fahamu jinsi daftari za mkono zinavyosababisha kuvuja kwa fedha, kupotea kwa madeni, na jinsi mfumo unavyolinda faida yako.",
    contentMarkdown: `
# Why Your Business Needs a Custom System

When starting a business in Tanzania, a simple notebook and WhatsApp group work well. But as daily sales grow beyond 30 transactions, **manual tracking becomes your biggest operational risk**.

## The 4 Hidden Costs of Manual Tracking:

1. **Unrecorded Customer Debts (Madeni)**: Pages get torn, notebooks get misplaced, or credit sales aren't written down during rush hour.
2. **Inventory Leakage**: Stock disappears unit by unit without any automated audit trail.
3. **Owner Dependency**: You cannot step away for a single day because employees cannot verify prices or issue official receipts independently.
4. **Unknown Monthly Profit**: At the end of the month, cash in hand never matches expected profit margins.

## The Custom System Solution
A custom business system provides:
- **Instant Stock Sync**: Every sale automatically reduces inventory count.
- **Automated Debt Reminders**: Track who owes you, payment due dates, and SMS reminders.
- **Smartphone Monitoring**: Check your total sales, expenses, and net profit from anywhere in the world.
    `,
    swahiliContentMarkdown: `
# Kwa Nini Biashara Yako Inahitaji Mfumo wa Kidijitali

Unapoanza biashara, daftari la mkono na WhatsApp hufanya kazi vizuri. Lakini mauzo yako yanapozidi miamala 30 kwa siku, **njia za mkono zinakuwa chanzo kikubwa cha hasara**.

## Gharama 4 Zilizofichika za Daftari la Mkono:

1. **Madeni Kupotea**: Kurasa zinachanika, daftari linapotea, au muuzaji anasahau kuandika wakati wa foleni.
2. **Stoki Kuibiwa**: Bidhaa zinapotea kidogo kidogo bila kuwa na kumbukumbu ya kiotomatiki.
3. **Biashara Kumtegemea Mtu Mmoja**: Huwezi kusafiri wala kupumzika kwa sababu wafanyakazi hawajui bei halisi au hawawezi kutoa risiti.
4. **Kutokujua Faida ya Mwezi**: Mwisho wa mwezi, fedha zilizopo mkononi hazilingani na hesabu za mauzo.

## Suluhisho la Mfumo wa Kidijitali
- **Stoki Kupungua Kiotomatiki**: Kila mauzo yanapofanyika, stoki inapungua papo hapo.
- **Kumbukumbu za Madeni**: Kuona nani anadaiwa, tarehe ya kulipa, na maonyo ya SMS.
- **Usimamizi Kupitia Simu**: Kuona mauzo na faida ukiwa mahali popote duniani.
    `
  },
  {
    id: "outgrown-whatsapp",
    slug: "signs-your-business-has-outgrown-whatsapp",
    title: "Signs Your Business Has Outgrown WhatsApp Orders",
    swahiliTitle: "Ishara Kwamba Biashara Yako Imepita Uwezo wa Kuchat WhatsApp",
    category: "automation",
    readTimeMinutes: 4,
    summary: "Receiving 50+ WhatsApp messages a day? Learn when WhatsApp chatting turns into sales bottlenecks and how e-commerce webstores streamline order flow.",
    swahiliSummary: "Unapokea jumbe 50+ kwa siku? Jifunze jinsi kuchat kuliko pitiliza kunavyopoteza wateja na jinsi catalog ya mtandaoni inavyosaidia.",
    contentMarkdown: `
# Signs Your Business Has Outgrown WhatsApp Orders

WhatsApp is an incredible messaging tool, but **it was never designed to be an inventory or e-commerce platform**.

## Key Warning Signs:
- Customers wait 2+ hours for price confirmation while you check stock manually.
- Payment screenshots from M-Pesa / Airtel Money take hours to manually verify against bank SMS notifications.
- Items sell out on Instagram while you accept payment for the same item on WhatsApp.
- You spend 80% of your day chatting and only 20% fulfilling orders.

## What to Do Instead
Transition to an **Automated E-Commerce Webstore with Mobile Money Integration**:
1. Customer clicks your link on Instagram / WhatsApp bio.
2. Selects sizes, colors, or quantities.
3. Pays via M-Pesa / Tigo Pesa / Airtel Money / Bank.
4. Receives instant digital receipt; order automatically arrives in your delivery dashboard.
    `,
    swahiliContentMarkdown: `
# Ishara Kwamba Biashara Yako Imepita Uwezo wa Kuchat WhatsApp

WhatsApp ni chombo kizuri cha mawasiliano, lakini **haikubuniwa kuwa mfumo wa stoki au duka la mtandaoni**.

## Ishara Kuu za Hatari:
- Mteja anasubiri masaa 2 kuambiwa bei wakati ukiangalia stoki kwa mkono.
- Screenshots za M-Pesa/Airtel Money zinachukua masaa kuzihakiki moja baada ya nyingine.
- Nguo inauzwa kwenye Instagram wakati huo huo unapokea pesa ya nguo hiyo hiyo WhatsApp.
- Unatumia 80% ya muda wako kuchat badala ya kuendeleza biashara.

## Suluhisho Sahihi
Hama na utumie **Katalogi ya Mtandaoni yenye Malipo ya Simu (M-Pesa/Tigo Pesa/Airtel Money)**:
1. Mteja anabonyeza link kwenye bio yako.
2. Anachagua bidhaa, saizi, au rangi.
3. Analipa kwa M-Pesa/Tigo Pesa na kupokea risiti ya kiotomatiki.
4. Oda inaingia moja kwa moja kwenye mfumo wako wa uwasilishaji.
    `
  },
  {
    id: "excel-not-enough",
    slug: "when-excel-is-no-longer-enough",
    title: "When Excel Spreadsheets Become a Risk to Your Business",
    swahiliTitle: "Wakati Gani Excel Inakuwa Hatari Kwa Uhai wa Biashara Yako",
    category: "systems",
    readTimeMinutes: 5,
    summary: "Excel is great for scratch calculations, but terrible for concurrent multi-user inventory, security control, and real-time alerts.",
    swahiliSummary: "Excel ni nzuri kwa hesabu za haraka, lakini ni hatari kwa usimamizi wa stoki ya watu wengi na usalama wa taarifa.",
    contentMarkdown: `
# When Excel Spreadsheets Become a Risk

Many SME owners upgrade from notebooks to Excel. While this is a step forward, **Excel spreadsheets carry severe structural limitations**:

1. **Formula Corruption**: A single accidental key press can erase formula logic, leaving you with wrong profit calculations.
2. **No Multi-User Concurrency**: When two staff members open the file, one overwrites the other's sales entries.
3. **No Access Audit Trail**: Anyone can edit historical numbers or delete debt entries without a trace.
4. **No Real-Time Stock Depletion Alerts**: Excel won't alert your smartphone when popular items hit re-order levels.

## Upgrade to a Multi-User Centralized Database
Custom business systems store your data in certified PostgreSQL databases with role-based permissions, automated backups, and instant real-time notifications.
    `,
    swahiliContentMarkdown: `
# Wakati Gani Excel Inakuwa Hatari Kwa Biashara Yako

Wamiliki wengi wa biashara wanapohama kwenye daftari huenda kwenye Excel. Pamoja na kwamba ni hatua nzuri, **Excel ina hatari kubwa za kimfumo**:

1. **Kuharibika kwa Formula**: Kufuta namba moja kwa bahati mbaya kunaweza kuharibu hesabu zote za faida.
2. **Wafanyakazi Wawili Kutoweza Kutumia Pamoja**: Mfanyakazi mmoja akiingiza mauzo wakati mwingine amefungua, taarifa za mmoja zitafutika.
3. **Kukosa Ulinzi wa Taarifa**: Mfanyakazi anaweza kufuta deni au kubadili namba za mauzo bila kuacha kumbukumbu.
4. **Kukosa Maonyo ya Stoki**: Excel haitakutumia maonyo kwenye simu stoki inapofikia kikomo.

## Badilisha Kuwa Custom Database System
Mifumo yetu inahifadhi taarifa kwenye PostgreSQL zenye ulinzi wa hali ya juu, kuingia kwa usalama (passwords/roles), na backups za kiotomatiki.
    `
  }
];
