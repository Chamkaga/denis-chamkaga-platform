// src/ai/tools/tool-router.ts

import { aiToolPermissions } from './tool-permissions';
import { adminService } from '../../services/admin.service';
import { financeService } from '../../services/finance.service';
import { businessService } from '../../services/business.service';
import { aiKnowledgeEngine } from '../knowledge-engine';
import { aiEventBus } from '../event-bus';
import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

export const aiToolRouter = {
  /**
   * Routes and executes tool calls securely through Permission Guards and Domain Services.
   */
  async execute(
    toolName: string,
    args: any,
    userRole: string,
    sessionId: string
  ): Promise<any> {
    logger.info(`[AI ToolRouter] Attempting to execute tool "${toolName}" for session ${sessionId} as role ${userRole}...`);
    
    // 1. Permission Check
    const allowed = aiToolPermissions.checkPermission(toolName, userRole);
    if (!allowed) {
      throw new AppError(403, 'UNAUTHORIZED_AI_TOOL', `Execution of tool "${toolName}" is not permitted for your current access level.`);
    }

    // 2. Dispatch call to corresponding Domain Service Layer
    switch (toolName) {
      case 'createLead': {
        const lead = await adminService.createLead({
          name: args.name,
          email: args.email,
          phone: args.phone || null,
          requirements: args.notes || null,
          source: 'ai_chat',
        });
        
        // Link Lead to the active Chat Session
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { leadId: lead.id }
        });

        // Publish event to Event Bus
        aiEventBus.publish('LeadCreated', {
          leadId: lead.id,
          name: lead.name,
          email: lead.email || undefined,
          score: lead.score
        });

        return {
          success: true,
          message: 'Lead created successfully.',
          leadId: lead.id
        };
      }

      case 'createQuotation': {
        // Parse items string if passed as string JSON
        let itemsArray = args.items;
        if (typeof itemsArray === 'string') {
          try {
            itemsArray = JSON.parse(itemsArray);
          } catch {
            itemsArray = [];
          }
        }
        
        const quote = await financeService.createQuotation({
          title: args.title,
          organizationId: args.organizationId,
          currency: args.currency || 'TZS',
          taxRate: args.taxRate !== undefined ? Number(args.taxRate) : 0,
          discountRate: args.discountRate !== undefined ? Number(args.discountRate) : 0,
          validUntil: args.validUntil ? new Date(args.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: itemsArray && itemsArray.length > 0 ? itemsArray : [
            { description: args.title || 'Custom System Development', quantity: 1, unitPrice: args.subtotal !== undefined ? Number(args.subtotal) : 0 }
          ]
        }, 'ai_assistant');

        return {
          success: true,
          message: 'Quotation estimate drafted successfully.',
          quotationId: quote.id,
          quotationNumber: quote.quotationNumber
        };
      }

      case 'createInvoice': {
        // Parse items string if passed as string JSON
        let itemsArray = args.items;
        if (typeof itemsArray === 'string') {
          try {
            itemsArray = JSON.parse(itemsArray);
          } catch {
            itemsArray = [];
          }
        }

        const invoice = await financeService.createInvoice({
          organizationId: args.organizationId,
          currency: args.currency || 'TZS',
          taxRate: args.taxRate !== undefined ? Number(args.taxRate) : 0,
          discountRate: args.discountRate !== undefined ? Number(args.discountRate) : 0,
          dueDate: args.dueDate ? new Date(args.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          items: itemsArray && itemsArray.length > 0 ? itemsArray : [
            { description: 'Business Solutions Consulting Services', quantity: 1, unitPrice: args.subtotal !== undefined ? Number(args.subtotal) : 0 }
          ]
        }, 'ai_assistant');

        return {
          success: true,
          message: 'Invoice created successfully.',
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber
        };
      }

      case 'scheduleMeeting': {
        const consultation = await businessService.createConsultation({
          leadId: args.leadId || undefined,
          title: args.title,
          scheduledAt: new Date(args.scheduledAt),
          notes: 'Scheduled by Denis AI platform assistant.'
        });

        aiEventBus.publish('ConsultationBooked', {
          consultationId: consultation.id,
          leadId: consultation.leadId || undefined,
          scheduledAt: consultation.scheduledAt
        });

        return {
          success: true,
          message: 'Intake consultation scheduled.',
          consultationId: consultation.id
        };
      }

      case 'searchKnowledge': {
        const results = await aiKnowledgeEngine.retrieve(args.query, 3);
        return {
          success: true,
          results: results.map(r => ({ title: r.title, content: r.content }))
        };
      }

      default:
        throw new AppError(400, 'UNKNOWN_AI_TOOL', `Tool "${toolName}" is not a routable action.`);
    }
  }
};
