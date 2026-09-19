import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const sessionCapability = localStorage.getItem('assistantSessionCapability');
    if (sessionCapability && config.headers && config.url?.includes('/ai/')) {
      config.headers['X-Session-Capability'] = sessionCapability;
    }
    const csrfToken = document.cookie.split('; ').find(part => part.startsWith('dc_csrf='))?.split('=')[1];
    if (csrfToken && config.headers) config.headers['X-CSRF-Token'] = decodeURIComponent(csrfToken);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh tokens on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh logic for login/logout/refresh endpoints
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        const csrfToken = document.cookie.split('; ').find(part => part.startsWith('dc_csrf='))?.split('=')[1];
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken || undefined },
          { withCredentials: true, headers: csrfToken ? { 'X-CSRF-Token': decodeURIComponent(csrfToken) } : {} }
        );
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Clear local storage and log out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshErr);
      }
    }

    // Attach parsed ProblemDetails or RFC7807 structured error if available
    if (error.response?.data?.problem) {
      error.problemDetails = error.response.data.problem;
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  logout: async () => {
    await api.post('/auth/logout', {});
  },
};

// Public Endpoints
export const publicApi = {
  getServices: async () => {
    const res = await api.get('/services');
    return res.data.data;
  },
  getServiceBySlug: async (slug: string) => {
    const res = await api.get(`/services/${slug}`);
    return res.data.data;
  },
  getProjects: async (params?: any) => {
    const res = await api.get('/projects', { params });
    return res.data;
  },
  getFeaturedProjects: async () => {
    const res = await api.get('/projects/featured');
    return res.data.data;
  },
  getProjectBySlug: async (slug: string) => {
    const res = await api.get(`/projects/${slug}`);
    return res.data.data;
  },
  getExperiences: async () => {
    const res = await api.get('/experiences');
    return res.data.data;
  },
  getEducation: async () => {
    const res = await api.get('/education');
    return res.data.data;
  },
  getCertificates: async () => {
    const res = await api.get('/certificates');
    return res.data.data;
  },
  getGallery: async (category?: string) => {
    const res = await api.get('/gallery', { params: { category } });
    return res.data.data;
  },
  getFaqs: async () => {
    const res = await api.get('/faqs');
    return res.data.data;
  },
  getBlogPosts: async (params?: any) => {
    const res = await api.get('/blog-posts', { params });
    return res.data;
  },
  getBlogPostBySlug: async (slug: string) => {
    const res = await api.get(`/blog-posts/${slug}`);
    return res.data.data;
  },
  getTutorials: async () => {
    const res = await api.get('/tutorials');
    return res.data.data;
  },
  initiateSupportCheckout: async (data: { amount: number; currency: string; email: string; name?: string; tier: string }) => {
    const res = await api.post('/payments/support', data);
    return res.data.data;
  },
  verifyPayment: async (token: string) => {
    const res = await api.get('/payments/verify', { params: { token } });
    return res.data.data;
  },
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data.data;
  },
  getTestimonials: async (featured?: boolean) => {
    const res = await api.get('/testimonials', { params: { featured } });
    return res.data.data;
  },
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data.data;
  },
  submitContact: async (data: { name: string; email: string; phone?: string; subject?: string; content: string }) => {
    const res = await api.post('/contact', data);
    return res.data.data;
  },
  getHealth: async () => {
    const res = await api.get('/health');
    return res.data.data;
  },
};

// AI Endpoints
export const aiApi = {
  chat: async (data: { message: string; sessionId?: string; visitorId?: string }) => {
    const res = await api.post('/ai/chat', data);
    return res.data.data;
  },
  getHistory: async (sessionId: string) => {
    const res = await api.get(`/ai/sessions/${sessionId}/history`);
    return res.data.data.messages;
  },
  closeSession: async (sessionId: string, rating?: number, comments?: string) => {
    const res = await api.post(`/ai/sessions/${sessionId}/close`, { rating, comments });
    return res.data.data;
  },
  getVisitorSessions: async (visitorId: string) => {
    const res = await api.get(`/ai/sessions/visitor/${visitorId}`);
    return res.data.data.sessions;
  },
  renameSession: async (sessionId: string, title: string) => {
    const res = await api.patch(`/ai/sessions/${sessionId}/rename`, { title });
    return res.data.data;
  },
  deleteSession: async (sessionId: string) => {
    const res = await api.delete(`/ai/sessions/${sessionId}`);
    return res.data.data;
  },
  downloadSession: (sessionId: string) => {
    // Returns a URL to the download endpoint — browser triggers native download
    return `${import.meta.env.VITE_API_URL || '/api'}/ai/sessions/${sessionId}/download`;
  },
  uploadAttachment: async (file: File, sessionId: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('sessionId', sessionId);
    const res = await api.post('/ai/attachments', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data as { id: string; url: string; name: string; originalName: string; mimeType: string; sizeBytes: number; extension: string };
  },
};

// Admin Endpoints
export const adminApi = {
  updatePresence: async (status: string) => {
    const res = await api.put('/admin/presence', { status });
    return res.data.data;
  },
  getPresence: async () => {
    const res = await api.get('/presence');
    return res.data.data;
  },
  getDashboardStats: async (params?: { from?: string; to?: string }) => {
    const res = await api.get('/admin/dashboard', { params });
    return res.data.data;
  },
  getAnalytics: async (days?: number) => {
    const res = await api.get('/admin/analytics', { params: { days } });
    return res.data.data;
  },
  getAiAnalytics: async () => {
    const res = await api.get('/admin/analytics/ai');
    return res.data.data;
  },
  // Projects CRUD
  getProjects: async (params?: any) => {
    const res = await api.get('/admin/projects', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createProject: async (data: any) => {
    const res = await api.post('/admin/projects', data);
    return res.data.data;
  },
  updateProject: async (id: string, data: any) => {
    const res = await api.put(`/admin/projects/${id}`, data);
    return res.data.data;
  },
  deleteProject: async (id: string) => {
    const res = await api.delete(`/admin/projects/${id}`);
    return res.data.data;
  },
  // Services CRUD
  getServices: async (params?: any) => {
    const res = await api.get('/admin/services', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createService: async (data: any) => {
    const res = await api.post('/admin/services', data);
    return res.data.data;
  },
  updateService: async (id: string, data: any) => {
    const res = await api.put(`/admin/services/${id}`, data);
    return res.data.data;
  },
  deleteService: async (id: string) => {
    const res = await api.delete(`/admin/services/${id}`);
    return res.data.data;
  },
  // Blog Posts CRUD
  getBlogPosts: async (params?: any) => {
    const res = await api.get('/admin/blog-posts', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createBlogPost: async (data: any) => {
    const res = await api.post('/admin/blog-posts', data);
    return res.data.data;
  },
  updateBlogPost: async (id: string, data: any) => {
    const res = await api.put(`/admin/blog-posts/${id}`, data);
    return res.data.data;
  },
  deleteBlogPost: async (id: string) => {
    const res = await api.delete(`/admin/blog-posts/${id}`);
    return res.data.data;
  },
  // Leads Management
  getLeads: async (params?: any) => {
    const res = await api.get('/admin/leads', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  updateLead: async (id: string, data: any) => {
    const res = await api.put(`/admin/leads/${id}`, data);
    return res.data.data;
  },
  // WebRTC Call logs & CRM Summary
  getCalls: async (search?: string) => {
    const res = await api.get('/admin/webrtc/calls', { params: { search } });
    return res.data.data;
  },
  generateCrmSummary: async (sessionId: string, rawNotes: string) => {
    const res = await api.post('/admin/webrtc/crm-summary', { sessionId, rawNotes });
    return res.data.data;
  },
  syncCrmSummary: async (sessionId: string, rawNotes: string, summary: any) => {
    const res = await api.post('/admin/webrtc/crm-sync', { sessionId, rawNotes, summary });
    return res.data;
  },
  // Messages Management
  getMessages: async (params?: any) => {
    const res = await api.get('/admin/messages', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  markMessageRead: async (id: string) => {
    const res = await api.patch(`/admin/messages/${id}/read`);
    return res.data.data;
  },
  // Appointments Management
  getAppointments: async (params?: any) => {
    const res = await api.get('/admin/appointments', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  updateAppointment: async (id: string, data: any) => {
    const res = await api.put(`/admin/appointments/${id}`, data);
    return res.data.data;
  },
  // Testimonials CRUD
  getTestimonials: async (params?: any) => {
    const res = await api.get('/admin/testimonials', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createTestimonial: async (data: any) => {
    const res = await api.post('/admin/testimonials', data);
    return res.data.data;
  },
  updateTestimonial: async (id: string, data: any) => {
    const res = await api.put(`/admin/testimonials/${id}`, data);
    return res.data.data;
  },
  deleteTestimonial: async (id: string) => {
    const res = await api.delete(`/admin/testimonials/${id}`);
    return res.data.data;
  },
  // Gallery CRUD
  getGallery: async (params?: any) => {
    const res = await api.get('/admin/gallery', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createGalleryItem: async (data: any) => {
    const res = await api.post('/admin/gallery', data);
    return res.data.data;
  },
  updateGalleryItem: async (id: string, data: any) => {
    const res = await api.put(`/admin/gallery/${id}`, data);
    return res.data.data;
  },
  deleteGalleryItem: async (id: string) => {
    const res = await api.delete(`/admin/gallery/${id}`);
    return res.data.data;
  },
  // Settings CRUD
  getSettings: async (category?: string) => {
    const res = await api.get('/admin/settings', { params: { category } });
    return res.data.data;
  },
  updateSettings: async (updates: Array<{ key: string; value: string }>) => {
    const res = await api.put('/admin/settings', updates);
    return res.data.data;
  },
  updateSetting: async (key: string, value: string) => {
    const res = await api.put(`/admin/settings/${key}`, { value });
    return res.data.data;
  },
  // Users Management
  getUsers: async (params?: any) => {
    const res = await api.get('/admin/users', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  toggleUserActive: async (id: string) => {
    const res = await api.patch(`/admin/users/${id}/toggle-active`);
    return res.data.data;
  },
  // Experiences CRUD
  getExperiences: async (params?: any) => {
    const res = await api.get('/admin/experiences', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createExperience: async (data: any) => {
    const res = await api.post('/admin/experiences', data);
    return res.data.data;
  },
  updateExperience: async (id: string, data: any) => {
    const res = await api.put(`/admin/experiences/${id}`, data);
    return res.data.data;
  },
  deleteExperience: async (id: string) => {
    const res = await api.delete(`/admin/experiences/${id}`);
    return res.data.data;
  },
  // Education CRUD
  getEducation: async (params?: any) => {
    const res = await api.get('/admin/education', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createEducation: async (data: any) => {
    const res = await api.post('/admin/education', data);
    return res.data.data;
  },
  updateEducation: async (id: string, data: any) => {
    const res = await api.put(`/admin/education/${id}`, data);
    return res.data.data;
  },
  deleteEducation: async (id: string) => {
    const res = await api.delete(`/admin/education/${id}`);
    return res.data.data;
  },
  // Certificates CRUD
  getCertificates: async (params?: any) => {
    const res = await api.get('/admin/certificates', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createCertificate: async (data: any) => {
    const res = await api.post('/admin/certificates', data);
    return res.data.data;
  },
  updateCertificate: async (id: string, data: any) => {
    const res = await api.put(`/admin/certificates/${id}`, data);
    return res.data.data;
  },
  deleteCertificate: async (id: string) => {
    const res = await api.delete(`/admin/certificates/${id}`);
    return res.data.data;
  },
  // Languages CRUD
  getLanguages: async (params?: any) => {
    const res = await api.get('/admin/languages', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createLanguage: async (data: any) => {
    const res = await api.post('/admin/languages', data);
    return res.data.data;
  },
  updateLanguage: async (id: string, data: any) => {
    const res = await api.put(`/admin/languages/${id}`, data);
    return res.data.data;
  },
  deleteLanguage: async (id: string) => {
    const res = await api.delete(`/admin/languages/${id}`);
    return res.data.data;
  },
  // FAQs CRUD
  getFaqs: async (params?: any) => {
    const res = await api.get('/admin/faqs', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createFaq: async (data: any) => {
    const res = await api.post('/admin/faqs', data);
    return res.data.data;
  },
  updateFaq: async (id: string, data: any) => {
    const res = await api.put(`/admin/faqs/${id}`, data);
    return res.data.data;
  },
  deleteFaq: async (id: string) => {
    const res = await api.delete(`/admin/faqs/${id}`);
    return res.data.data;
  },
  // Tutorials CRUD
  getTutorials: async (params?: any) => {
    const res = await api.get('/admin/tutorials', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createTutorial: async (data: any) => {
    const res = await api.post('/admin/tutorials', data);
    return res.data.data;
  },
  updateTutorial: async (id: string, data: any) => {
    const res = await api.put(`/admin/tutorials/${id}`, data);
    return res.data.data;
  },
  deleteTutorial: async (id: string) => {
    const res = await api.delete(`/admin/tutorials/${id}`);
    return res.data.data;
  },
  // Chat Sessions Logs
  getChatSessions: async (params?: any) => {
    const res = await api.get('/admin/assistant/sessions', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  getChatSessionHistory: async (id: string) => {
    const res = await api.get(`/admin/assistant/sessions/${id}`);
    return res.data.data;
  },
  deleteChatSession: async (id: string) => {
    const res = await api.delete(`/admin/assistant/sessions/${id}`);
    return res.data.data;
  },
  // Audit Logs
  getAuditLogs: async (params?: any) => {
    const res = await api.get('/admin/audit-logs', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  // Database Backup
  triggerBackup: async () => {
    const res = await api.post('/admin/backup');
    return res.data.data;
  },
  // Leads Extended
  createLead: async (data: any) => {
    const res = await api.post('/admin/leads', data);
    return res.data.data;
  },
  deleteLead: async (id: string) => {
    const res = await api.delete(`/admin/leads/${id}`);
    return res.data.data;
  },
  // Messages Extended
  deleteMessage: async (id: string) => {
    const res = await api.delete(`/admin/messages/${id}`);
    return res.data.data;
  },
  // Users Extended
  createUser: async (data: any) => {
    const res = await api.post('/admin/users', data);
    return res.data.data;
  },
  resetUserPassword: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/reset-password`);
    return res.data.data;
  },
  // Scheduled Projects (Calendar)
  getCalendarEvents: async (params?: any) => {
    const res = await api.get('/admin/calendar', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createCalendarEvent: async (data: any) => {
    const res = await api.post('/admin/calendar', data);
    return res.data.data;
  },
  updateCalendarEvent: async (id: string, data: any) => {
    const res = await api.put(`/admin/calendar/${id}`, data);
    return res.data.data;
  },
  deleteCalendarEvent: async (id: string) => {
    const res = await api.delete(`/admin/calendar/${id}`);
    return res.data.data;
  },
  getUpcomingDeadlines: async (days = 14) => {
    const res = await api.get('/admin/calendar/deadlines', { params: { days } });
    return res.data.data;
  },
  // Activity Feed
  getActivity: async (params?: any) => {
    const res = await api.get('/admin/activity', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  // Supporters & Membership Management
  getSupportersOverview: async () => {
    const res = await api.get('/admin/supporters/overview');
    return res.data.data;
  },
  getSupporters: async (params?: any) => {
    const res = await api.get('/admin/supporters', { params });
    return res.data.data;
  },
  recordSupporterContribution: async (data: any) => {
    const res = await api.post('/admin/supporters/record', data);
    return res.data.data;
  },
  getCollaboratorsOverview: async () => {
    const res = await api.get('/admin/supporters/collaborators/overview');
    return res.data.data;
  },
  getCollaborators: async (search?: string) => {
    const res = await api.get('/admin/supporters/collaborators', { params: { search } });
    return res.data.data;
  },
  upsertCollaborator: async (data: any) => {
    const res = await api.post('/admin/supporters/collaborators', data);
    return res.data.data;
  },
  // Visitor Analytics
  getVisitorAnalytics: async (days = 30) => {
    const res = await api.get('/admin/visitor-analytics', { params: { days } });
    return res.data.data;
  },
  // Newsletter CRUD
  getNewsletters: async (params?: any) => {
    const res = await api.get('/admin/newsletter', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createNewsletter: async (data: any) => {
    const res = await api.post('/admin/newsletter', data);
    return res.data.data;
  },
  deleteNewsletter: async (id: string) => {
    const res = await api.delete(`/admin/newsletter/${id}`);
    return res.data.data;
  },
  // Campaigns CRUD
  getCampaigns: async (params?: any) => {
    const res = await api.get('/admin/campaigns', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createCampaign: async (data: any) => {
    const res = await api.post('/admin/campaigns', data);
    return res.data.data;
  },
  updateCampaign: async (id: string, data: any) => {
    const res = await api.put(`/admin/campaigns/${id}`, data);
    return res.data.data;
  },
  deleteCampaign: async (id: string) => {
    const res = await api.delete(`/admin/campaigns/${id}`);
    return res.data.data;
  },
  // ProductIdeas CRUD
  getProductIdeas: async (params?: any) => {
    const res = await api.get('/admin/product-ideas', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createProductIdea: async (data: any) => {
    const res = await api.post('/admin/product-ideas', data);
    return res.data.data;
  },
  updateProductIdea: async (id: string, data: any) => {
    const res = await api.put(`/admin/product-ideas/${id}`, data);
    return res.data.data;
  },
  deleteProductIdea: async (id: string) => {
    const res = await api.delete(`/admin/product-ideas/${id}`);
    return res.data.data;
  },
  // RoadmapItems CRUD
  getRoadmapItems: async (params?: any) => {
    const res = await api.get('/admin/roadmap-items', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createRoadmapItem: async (data: any) => {
    const res = await api.post('/admin/roadmap-items', data);
    return res.data.data;
  },
  updateRoadmapItem: async (id: string, data: any) => {
    const res = await api.put(`/admin/roadmap-items/${id}`, data);
    return res.data.data;
  },
  deleteRoadmapItem: async (id: string) => {
    const res = await api.delete(`/admin/roadmap-items/${id}`);
    return res.data.data;
  },
  // Partnerships CRUD
  getPartnershipRequests: async (params?: any) => {
    const res = await api.get('/admin/partnerships', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createPartnershipRequest: async (data: any) => {
    const res = await api.post('/admin/partnerships', data);
    return res.data.data;
  },
  updatePartnershipRequest: async (id: string, data: any) => {
    const res = await api.put(`/admin/partnerships/${id}`, data);
    return res.data.data;
  },
  deletePartnershipRequest: async (id: string) => {
    const res = await api.delete(`/admin/partnerships/${id}`);
    return res.data.data;
  },
  // AI Prompts CRUD
  getAiPrompts: async (params?: any) => {
    const res = await api.get('/admin/ai-prompts', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  createAiPrompt: async (data: any) => {
    const res = await api.post('/admin/ai-prompts', data);
    return res.data.data;
  },
  updateAiPrompt: async (id: string, data: any) => {
    const res = await api.put(`/admin/ai-prompts/${id}`, data);
    return res.data.data;
  },
  deleteAiPrompt: async (id: string) => {
    const res = await api.delete(`/admin/ai-prompts/${id}`);
    return res.data.data;
  },
  // AI Knowledge Base CRUD + Health + Versions
  getAiKnowledge: async (params?: { status?: string; category?: string }) => {
    const res = await api.get('/admin/ai-knowledge', { params });
    return res.data.data;
  },
  getAiKnowledgeHealth: async () => {
    const res = await api.get('/admin/ai-knowledge/health');
    return res.data.data;
  },
  getAiKnowledgeVersions: async (id: string) => {
    const res = await api.get(`/admin/ai-knowledge/${id}/versions`);
    return res.data.data;
  },
  createAiKnowledge: async (data: any, skipDuplicateCheck = false) => {
    const res = await api.post('/admin/ai-knowledge', { ...data, skipDuplicateCheck });
    return res.data;  // Return full response so caller can inspect success + code
  },
  updateAiKnowledge: async (id: string, data: any) => {
    const res = await api.put(`/admin/ai-knowledge/${id}`, data);
    return res.data.data;
  },
  deleteAiKnowledge: async (id: string) => {
    const res = await api.delete(`/admin/ai-knowledge/${id}`);
    return res.data.data;
  },
  restoreAiKnowledgeVersion: async (id: string, versionId: string) => {
    const res = await api.post(`/admin/ai-knowledge/${id}/restore/${versionId}`);
    return res.data.data;
  },
  reindexAiKnowledge: async () => {
    const res = await api.post('/admin/ai-knowledge/reindex');
    return res.data.data;
  },
  getAiKnowledgeOpsJobs: async () => {
    const res = await api.get('/admin/ai-knowledge/ops/jobs');
    return res.data.data;
  },
  getAiKnowledgeOpsLogs: async () => {
    const res = await api.get('/admin/ai-knowledge/ops/logs');
    return res.data.data;
  },
  getAiKnowledgeOpsHealth: async () => {
    const res = await api.get('/admin/ai-knowledge/ops/health');
    return res.data.data;
  },
  getAiKnowledgeOpsMetrics: async () => {
    const res = await api.get('/admin/ai-knowledge/ops/metrics');
    return res.data.data;
  },
  triggerAiKnowledgeOpsAction: async (action: string) => {
    const res = await api.post('/admin/ai-knowledge/ops/trigger', { action });
    return res.data.data;
  },
  generateContent: async (data: { type: string; topic: string; context?: string }) => {
    const res = await api.post('/admin/content/generate', data);
    return res.data.data;
  },
  getAdminAiCopilotHistory: async (sessionId: string) => {
    const res = await api.get(`/admin/ai-copilot/sessions/${sessionId}/history`);
    return res.data.data;
  },
  getAdminCopilotContext: async () => {
    const res = await api.get('/admin/ai-copilot/context');
    return res.data.data;
  },
  // DAM API Endpoints
  getAssets: async (params?: any) => {
    const res = await api.get('/admin/assets', { params });
    return { items: res.data.data, meta: res.data.meta };
  },
  getDamAnalytics: async () => {
    const res = await api.get('/admin/assets/analytics');
    return res.data.data;
  },
  getAssetUsage: async (id: string) => {
    const res = await api.get(`/admin/assets/${id}/usage`);
    return res.data.data;
  },
  uploadAsset: async (formData: FormData) => {
    const res = await api.post('/admin/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  importAssetFromUrl: async (data: { fileUrl: string; folder: string }) => {
    const res = await api.post('/admin/assets/import-url', data);
    return res.data.data;
  },
  replaceAsset: async (id: string, formData: FormData) => {
    const res = await api.put(`/admin/assets/${id}/replace`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  renameAsset: async (id: string, name: string) => {
    const res = await api.put(`/admin/assets/${id}`, { name });
    return res.data.data;
  },
  updateAssetTags: async (id: string, tags: string[]) => {
    const res = await api.put(`/admin/assets/${id}`, { tags });
    return res.data.data;
  },
  archiveAsset: async (id: string) => {
    const res = await api.delete(`/admin/assets/${id}/archive`);
    return res.data.data;
  },
  restoreAsset: async (id: string, folder: string) => {
    const res = await api.post(`/admin/assets/${id}/restore`, { folder });
    return res.data.data;
  },
  deleteAssetPermanently: async (id: string, force: boolean = false) => {
    const res = await api.delete(`/admin/assets/${id}/permanent`, {
      params: { force },
    });
    return res.data.data;
  },

  // Organizations CRUD
  getOrganizations: async () => {
    const res = await api.get('/admin/business/organizations');
    return res.data.data;
  },
  createOrganization: async (data: any) => {
    const res = await api.post('/admin/business/organizations', data);
    return res.data.data;
  },
  updateOrganization: async (id: string, data: any) => {
    const res = await api.put(`/admin/business/organizations/${id}`, data);
    return res.data.data;
  },

  // Contacts/Clients CRUD
  getOrgClients: async (params?: any) => {
    const res = await api.get('/admin/business/clients', { params });
    return res.data.data;
  },
  createOrgClient: async (data: any) => {
    const res = await api.post('/admin/business/clients', data);
    return res.data.data;
  },
  convertLead: async (id: string, data: any) => {
    const res = await api.post(`/admin/business/leads/${id}/convert`, data);
    return res.data.data;
  },

  // Consultations CRUD
  getConsultations: async () => {
    const res = await api.get('/admin/business/consultations');
    return res.data.data;
  },
  createConsultation: async (data: any) => {
    const res = await api.post('/admin/business/consultations', data);
    return res.data.data;
  },

  // Project Progress Updates
  updateProjectProgress: async (id: string, data: any) => {
    const res = await api.patch(`/admin/business/projects/${id}/progress`, data);
    return res.data.data;
  },
  getBusinessProjects: async (params?: any) => {
    const res = await api.get('/admin/business/projects', { params });
    return res.data.data;
  },

  // Contracts CRUD
  getContracts: async (params?: any) => {
    const res = await api.get('/admin/business/contracts', { params });
    return res.data.data;
  },
  createContract: async (data: any) => {
    const res = await api.post('/admin/business/contracts', data);
    return res.data.data;
  },

  // Shared Documents CRUD
  getSharedDocuments: async (params?: any) => {
    const res = await api.get('/admin/business/documents', { params });
    return res.data.data;
  },
  shareDocument: async (data: any) => {
    const res = await api.post('/admin/business/documents', data);
    return res.data.data;
  },

  // Business Timeline log
  getTimeline: async () => {
    const res = await api.get('/admin/business/timeline');
    return res.data.data;
  },

  // Announcements CRUD
  getAnnouncements: async () => {
    const res = await api.get('/admin/business/announcements');
    return res.data.data;
  },
  createAnnouncement: async (data: any) => {
    const res = await api.post('/admin/business/announcements', data);
    return res.data.data;
  },

  // Messages CRUD
  getPortalMessages: async () => {
    const res = await api.get('/admin/business/messages');
    return res.data.data;
  },
  sendPortalMessage: async (data: any) => {
    const res = await api.post('/admin/business/messages', data);
    return res.data.data;
  },

  // Tenant Config
  getTenantConfig: async () => {
    const res = await api.get('/admin/finance/tenant-config');
    return res.data.data;
  },
  updateTenantConfig: async (data: any) => {
    const res = await api.put('/admin/finance/tenant-config', data);
    return res.data.data;
  },

  // Quotations CRUD
  getQuotations: async (params?: any) => {
    const res = await api.get('/admin/finance/quotations', { params });
    return res.data.data;
  },
  createQuotation: async (data: any) => {
    const res = await api.post('/admin/finance/quotations', data);
    return res.data.data;
  },
  reviseQuotation: async (id: string, data: any) => {
    const res = await api.post(`/admin/finance/quotations/${id}/revise`, data);
    return res.data.data;
  },
  approveQuotation: async (id: string, data: any) => {
    const res = await api.post(`/admin/finance/quotations/${id}/approve`, data);
    return res.data.data;
  },

  // Invoices CRUD
  getInvoices: async (params?: any) => {
    const res = await api.get('/admin/finance/invoices', { params });
    return res.data.data;
  },
  getInvoiceDetails: async (id: string) => {
    const res = await api.get(`/admin/finance/invoices/${id}`);
    return res.data.data;
  },
  createInvoice: async (data: any) => {
    const res = await api.post('/admin/finance/invoices', data);
    return res.data.data;
  },
  updateInvoiceStatus: async (id: string, status: string) => {
    const res = await api.patch(`/admin/finance/invoices/${id}/status`, { status });
    return res.data.data;
  },
  emailInvoice: async (id: string) => {
    const res = await api.post(`/admin/finance/invoices/${id}/email`);
    return res.data.data;
  },

  // Credit Notes CRUD
  getCreditNotes: async () => {
    const res = await api.get('/admin/finance/credit-notes');
    return res.data.data;
  },
  createCreditNote: async (invoiceId: string, data: any) => {
    const res = await api.post(`/admin/finance/invoices/${invoiceId}/credit-notes`, data);
    return res.data.data;
  },

  // Payments & Receipts CRUD
  getPayments: async () => {
    const res = await api.get('/admin/finance/payments');
    return res.data.data;
  },
  createPayment: async (invoiceId: string, data: any) => {
    const res = await api.post(`/admin/finance/invoices/${invoiceId}/payments`, data);
    return res.data.data;
  },

  emailQuotation: async (id: string) => {
    const res = await api.post(`/admin/finance/quotations/${id}/email`);
    return res.data.data;
  },

  // Access tokens management
  generateAccessToken: async (data: { docId: string; docType: string; expiresDays?: number }) => {
    const res = await api.post('/admin/finance/access/generate', data);
    return res.data.data;
  },

  revokeAccessToken: async (token: string) => {
    const res = await api.post('/admin/finance/access/revoke', { token });
    return res.data.data;
  },

  getAccessTokenAnalytics: async (docId: string) => {
    const res = await api.get(`/admin/finance/access/${docId}/analytics`);
    return res.data.data;
  },

  // Expenses CRUD
  getExpenses: async (params?: any) => {
    const res = await api.get('/admin/finance/expenses', { params });
    return res.data.data;
  },
  createExpense: async (data: any) => {
    const res = await api.post('/admin/finance/expenses', data);
    return res.data.data;
  },

  // Financial Reports
  getPnlReport: async () => {
    const res = await api.get('/admin/finance/reports/pnl');
    return res.data.data;
  },
  getBalanceSheet: async () => {
    const res = await api.get('/admin/finance/reports/balance-sheet');
    return res.data.data;
  },
  getClientFinancialSummary: async (email: string) => {
    const res = await api.get('/admin/finance/client-summary', { params: { email } });
    return res.data.data;
  },
};

export const publicDocsApi = {
  getPublicDoc: async (token: string) => {
    const res = await api.get(`/public/docs/${token}`);
    return res.data;
  },

  submitPublicResponse: async (token: string, data: {
    responseType: 'accepted' | 'rejected' | 'revision_requested';
    notes?: string;
    responderName?: string;
    responderEmail?: string;
  }) => {
    const res = await api.post(`/public/docs/${token}/response`, data);
    return res.data;
  },

  initializePublicPayment: async (token: string) => {
    const res = await api.post(`/public/docs/${token}/pay`);
    return res.data.data;
  },

  verifyPublicPayment: async (transactionId: string) => {
    const res = await api.get('/public/docs/payments/verify', {
      params: { transaction_id: transactionId }
    });
    return res.data.data;
  }
};
