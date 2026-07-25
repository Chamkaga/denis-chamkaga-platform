// backend/src/ai/services/business-readiness.service.ts
// Dynamic 5-Pillar Business Readiness Diagnostic Engine

export interface PillarScore {
  name: string;
  swahiliName: string;
  score: number; // 0 - 100%
  status: 'critical' | 'moderate' | 'strong';
}

export interface ReadinessDiagnosticResult {
  digitalMaturity: PillarScore;
  inventoryControl: PillarScore;
  salesTracking: PillarScore;
  customerManagement: PillarScore;
  reportingAnalytics: PillarScore;
  overallReadinessScore: number;
  readinessGrade: 'Critical Automation Need' | 'Moderate Automation' | 'Digitally Advanced';
  swahiliReadinessGrade: string;
  recommendedPriorities: { priority: number; title: string; swahiliTitle: string }[];
}

export const businessReadinessService = {
  /**
   * Calculates dynamic 5-pillar readiness score based on accumulated visitor facts.
   */
  calculateDiagnostic(facts: Record<string, any>): ReadinessDiagnosticResult {
    const currentSystem = (facts.currentSystem || facts.tools || '').toLowerCase();
    const challenges = (facts.challenges || facts.painPoints || '').toLowerCase();
    const hasEmployees = facts.employees ? parseInt(facts.employees) > 1 : false;

    // 1. Digital Maturity Score calculation
    let maturityVal = 20;
    if (currentSystem.includes('pos')) maturityVal = 65;
    else if (currentSystem.includes('excel') || currentSystem.includes('sheets')) maturityVal = 45;
    else if (currentSystem.includes('whatsapp') || currentSystem.includes('instagram')) maturityVal = 30;
    else if (currentSystem.includes('erp')) maturityVal = 85;

    // 2. Inventory Control Score
    let inventoryVal = 30;
    if (challenges.includes('stoki') || challenges.includes('stock') || challenges.includes('theft') || challenges.includes('potea')) {
      inventoryVal = 15;
    } else if (currentSystem.includes('pos') || currentSystem.includes('barcode')) {
      inventoryVal = 75;
    }

    // 3. Sales Tracking Score
    let salesVal = 50;
    if (challenges.includes('faida') || challenges.includes('profit') || challenges.includes('mauzo')) {
      salesVal = 25;
    } else if (currentSystem.includes('excel')) {
      salesVal = 60;
    } else if (currentSystem.includes('pos')) {
      salesVal = 80;
    }

    // 4. Customer Management & Debt Score
    let crmVal = 40;
    if (challenges.includes('madeni') || challenges.includes('debt') || challenges.includes('wateja')) {
      crmVal = 15;
    } else if (currentSystem.includes('crm')) {
      crmVal = 85;
    }

    // 5. Reporting & Analytics Score
    let reportingVal = 25;
    if (currentSystem.includes('dashboard') || currentSystem.includes('erp')) {
      reportingVal = 80;
    } else if (hasEmployees) {
      reportingVal = 20;
    }

    const total = Math.round((maturityVal + inventoryControlScore(inventoryVal) + salesVal + crmVal + reportingVal) / 5);

    const getStatus = (val: number): 'critical' | 'moderate' | 'strong' => {
      if (val < 40) return 'critical';
      if (val < 70) return 'moderate';
      return 'strong';
    };

    let readinessGrade: 'Critical Automation Need' | 'Moderate Automation' | 'Digitally Advanced' = 'Critical Automation Need';
    let swahiliReadinessGrade = 'Biashara Inahitaji Mfumo wa Haraka (Critical Automation Need)';

    if (total >= 70) {
      readinessGrade = 'Digitally Advanced';
      swahiliReadinessGrade = 'Biashara Ipovizuri Ki-Kidijitali (Digitally Advanced)';
    } else if (total >= 40) {
      readinessGrade = 'Moderate Automation';
      swahiliReadinessGrade = 'Biashara Ina Ukuaji wa Kati Ki-Kidijitali (Moderate Automation)';
    }

    const priorities: { priority: number; title: string; swahiliTitle: string }[] = [];
    let priorityCount = 1;

    if (inventoryVal < 40) {
      priorities.push({
        priority: priorityCount++,
        title: 'Barcode Inventory & Depletion Control',
        swahiliTitle: 'Mfumo wa Stoki & Barcode Depletion'
      });
    }
    if (crmVal < 40) {
      priorities.push({
        priority: priorityCount++,
        title: 'Customer Debt Ledger & SMS Reminders (Madeni)',
        swahiliTitle: 'Kumbukumbu za Madeni ya Wateja & Ujumbe wa SMS'
      });
    }
    if (reportingVal < 40) {
      priorities.push({
        priority: priorityCount++,
        title: 'Real-Time Daily Profit Dashboard',
        swahiliTitle: 'Dashboard ya Faida Halisi ya Kila Siku'
      });
    }

    if (priorities.length === 0) {
      priorities.push({
        priority: 1,
        title: 'AI Business Intelligence & Predictive Analytics',
        swahiliTitle: 'Uchanganuzi wa AI na Utabiri wa Kibiashara'
      });
    }

    return {
      digitalMaturity: { name: 'Digital Maturity', swahiliName: 'Utayari wa Kidijitali', score: maturityVal, status: getStatus(maturityVal) },
      inventoryControl: { name: 'Inventory Control', swahiliName: 'Usimamizi wa Stoki', score: inventoryVal, status: getStatus(inventoryVal) },
      salesTracking: { name: 'Sales Tracking', swahiliName: 'Ufuatiliaji wa Mauzo', score: salesVal, status: getStatus(salesVal) },
      customerManagement: { name: 'Customer & Debt Management', swahiliName: 'Usimamizi wa Wateja & Madeni', score: crmVal, status: getStatus(crmVal) },
      reportingAnalytics: { name: 'Reporting & Analytics', swahiliName: 'Ripoti & Dashboard', score: reportingVal, status: getStatus(reportingVal) },
      overallReadinessScore: total,
      readinessGrade,
      swahiliReadinessGrade,
      recommendedPriorities: priorities
    };
  }
};

function inventoryControlScore(val: number): number {
  return val;
}
