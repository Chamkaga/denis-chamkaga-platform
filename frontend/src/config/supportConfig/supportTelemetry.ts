// Dynamic Analytics Funnel Logger for Support the Vision page

export const trackSupportAnalytics = (eventName: string, data?: any) => {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    pathname: window.location.pathname,
    ...data
  };
  
  // Developer console logger and window queue hook for Mixpanel / Google Analytics
  console.log(`[Analytics Event - Support Funnel]`, payload);
  if (typeof window !== 'undefined') {
    const win = window as any;
    win.supportAnalyticsQueue = win.supportAnalyticsQueue || [];
    win.supportAnalyticsQueue.push(payload);
  }
};

export const trackPageView = () => trackSupportAnalytics('Support page viewed');

export const trackScroll = (percentage: number) => trackSupportAnalytics(`Scrolled ${percentage}%`);

export const trackTierSelected = (tierId: string) => trackSupportAnalytics('Support Tier Selected', { tierId });

export const trackCheckoutStarted = (data: { tier: string; amount: number; currency: string }) => 
  trackSupportAnalytics('Checkout started', data);

export const trackCheckoutCompleted = (data: { currency: string; email: string }) => 
  trackSupportAnalytics('Checkout completed', data);

export const trackCheckoutCancelled = (reason?: string) => 
  trackSupportAnalytics('Checkout cancelled', { reason });

export const trackCollaboratorClicked = () => trackSupportAnalytics('Collaborator clicked');

export const trackPartnerClicked = () => trackSupportAnalytics('Partner clicked');

export const trackContactClicked = () => trackSupportAnalytics('Contact clicked');

export const trackCommunityJoinClicked = () => trackSupportAnalytics('Community Join Click');

export const trackNewsletterSignup = (email: string) => trackSupportAnalytics('Newsletter Signup', { email });

export const trackShareClicked = (platform: string) => trackSupportAnalytics('Share Click', { platform });
