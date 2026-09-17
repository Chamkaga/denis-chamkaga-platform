/**
 * Centralized Image Constants Mapping File
 * Single source of truth for all image assets used across the platform.
 * Allows easy replacement of placeholders with actual photos by changing filenames or paths here.
 */

export const IMAGES = {
  // 1. Hero Section
  hero: {
    portrait: '/images/hero/denis_portrait.webp',
    dashboardMockup: '/images/hero/dashboard_mockup.webp',
    workspacePlaceholder: '/images/hero/workspace.webp',
  },

  // 2. About Section
  about: {
    // Reuse the owner's real portrait in a wider About crop; the Hero controls its own crop.
    portrait: '/images/hero/denis_portrait.webp',
    workspace: '/images/about/workspace.webp',
    programming: '/images/about/programming.png',
    consulting: '/images/about/consulting.png',
    university: '/images/about/university.webp',
    technology: '/images/about/technology.webp',
    dailyWork: '/images/about/daily_work.png',
  },

  // 3. Timeline Section
  timeline: {
    security: '/images/timeline/security_operations.webp',
    customerService: '/images/timeline/customer_service.webp',
    udcc: '/images/timeline/udcc_campus.webp',
    development: '/images/timeline/self_learning.webp',
    projects: '/images/timeline/projects_development.webp',
    futureVision: '/images/timeline/future_goal.webp',
    award: '/images/timeline/performance_award.webp',
    // 3D Illustrations (premium isometric, SaaS quality)
    security3d: '/images/timeline/security_3d.png',
    customerService3d: '/images/timeline/customer_service_3d.png',
    udcc3d: '/images/timeline/udcc_3d.png',
    udsmFuture3d: '/images/timeline/udsm_future_3d.png',
    terrasafi3d: '/images/timeline/terrasafi_3d.png',
  },

  // 4. Services Section
  services: {
    consultation: '/images/services/business_consultation.png',
    webDev: '/images/services/web_development.png',
    databaseDesign: '/images/services/database_design.png',
    automation: '/images/services/business_automation.png',
    customerSupport: '/images/services/customer_support_strategy.png',
    training: '/images/services/training_capacity.png',
  },

  // 5. Projects Section
  projects: {
    fods: '/images/projects/fods-marketplace.webp',
    schoolManagement: '/images/projects/school_management.webp',
    libraryManagement: '/images/projects/library_management.png',
    hostelManagement: '/images/projects/hostel_management.webp',
    inventoryManagement: '/images/projects/inventory_management.png',
    portfolio: '/images/projects/personal_portfolio.webp',
    terrasafi: '/images/projects/terrasafi_platform.webp?v=2',
  },

  // 6. Gallery Section
  gallery: {
    work: '/images/gallery/work_environment.webp',
    university: '/images/gallery/university_life.webp',
    assignments: '/images/gallery/student_assignments.webp',
    projects: '/images/gallery/project_showcase.webp',
    certificates: '/images/gallery/certificate_wall.webp',
    awards: '/images/gallery/awards_podium.webp',
    events: '/images/gallery/tech_events.webp',
    training: '/images/gallery/classroom_training.webp',
    community: '/images/gallery/tech_community.webp',
    technology: '/images/gallery/hardware_server.webp',
  },

  // 7. Certificates Section
  certificates: {
    udccDiploma: '/images/certificates/udcc_diploma.webp',
    customerServiceCert: '/images/certificates/customer_service_pcci.webp',
    securityCert: '/images/certificates/security_cert.webp',
  },

  // 8. Denis Assistant Section
  assistant: {
    consultation: '/images/assistant/consultation.webp',
    crm: '/images/assistant/crm.webp',
    analysis: '/images/assistant/business_analysis.webp',
    workflow: '/images/assistant/workflow.webp',
    automation: '/images/assistant/automation.webp',
    architecture: '/images/assistant/software_architecture.webp',
    aiFlow: '/images/assistant/ai_flow.webp',
    qualification: '/images/assistant/lead_qualification.webp',
    journey: '/images/assistant/client_journey.webp',
    botPortrait: '/images/assistant/bot_portrait.webp',
  },

  // 9. Future Vision Section
  future: {
    innovationLab: '/images/future/innovation_lab.webp',
    futureOffice: '/images/future/future_office.webp',
    softwareCompany: '/images/future/software_company.webp',
    technologyTeam: '/images/future/technology_team.webp',
    trainingCenter: '/images/future/training_center.webp',
    incubation: '/images/future/business_incubation.webp',
    transformation: '/images/future/digital_transformation.webp',
    startup: '/images/future/startup_growth.webp',
  },

  // 10. Backgrounds & Placeholders
  backgrounds: {
    darkHero: '/images/backgrounds/hero_glow_dark.webp',
    lightHero: '/images/backgrounds/hero_glow_light.webp',
  },
  placeholders: {
    companyLogo: '/images/placeholders/company_logo.webp',
    emptyPhoto: '/images/placeholders/empty_photo.webp',
  }
} as const;
