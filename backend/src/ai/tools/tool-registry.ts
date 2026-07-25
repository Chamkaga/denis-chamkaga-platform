// src/ai/tools/tool-registry.ts

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description?: string; required?: boolean }>;
    required: string[];
  };
  allowedRoles: ('visitor' | 'client' | 'admin' | 'super_admin')[];
}

export const AI_TOOLS_REGISTRY: Record<string, ToolDefinition> = {
  createLead: {
    name: 'createLead',
    description: 'Registers a new lead in the CRM from progressive visitor details.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the contact' },
        email: { type: 'string', description: 'Contact email address' },
        phone: { type: 'string', description: 'Optional contact phone number' },
        notes: { type: 'string', description: 'Notes on their systems requirements' }
      },
      required: ['name', 'email']
    },
    allowedRoles: ['visitor', 'client', 'admin', 'super_admin']
  },
  
  createQuotation: {
    name: 'createQuotation',
    description: 'Prepares a new system quotation estimate for an organization (Admin only).',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the quote description' },
        organizationId: { type: 'string', description: 'UUID of the company' },
        subtotal: { type: 'number', description: 'Total cost before taxes' },
        items: { type: 'string', description: 'JSON formatted array of quotation items' }
      },
      required: ['title', 'organizationId', 'subtotal']
    },
    allowedRoles: ['admin', 'super_admin']
  },

  createInvoice: {
    name: 'createInvoice',
    description: 'Generates a customer invoice link in the billing system (Admin only).',
    parameters: {
      type: 'object',
      properties: {
        organizationId: { type: 'string', description: 'Company database ID' },
        subtotal: { type: 'number', description: 'Pre-tax billing amount' },
        dueDate: { type: 'string', description: 'ISO format date string' }
      },
      required: ['organizationId', 'subtotal', 'dueDate']
    },
    allowedRoles: ['admin', 'super_admin']
  },

  sendEmail: {
    name: 'sendEmail',
    description: 'Sends automated updates or reports to users.',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email header subject line' },
        body: { type: 'string', description: 'Content text body' }
      },
      required: ['to', 'subject', 'body']
    },
    allowedRoles: ['admin', 'super_admin']
  },

  scheduleMeeting: {
    name: 'scheduleMeeting',
    description: 'Schedules a business consultation appointment on Denis\'s calendar.',
    parameters: {
      type: 'object',
      properties: {
        leadId: { type: 'string', description: 'Optional database ID of the client lead' },
        title: { type: 'string', description: 'Title of the meeting topic' },
        scheduledAt: { type: 'string', description: 'ISO format date string' }
      },
      required: ['title', 'scheduledAt']
    },
    allowedRoles: ['visitor', 'client', 'admin', 'super_admin']
  },

  searchKnowledge: {
    name: 'searchKnowledge',
    description: 'Queries Denis\'s knowledge base vector context using RAG keywords.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords' }
      },
      required: ['query']
    },
    allowedRoles: ['visitor', 'client', 'admin', 'super_admin']
  }
};
