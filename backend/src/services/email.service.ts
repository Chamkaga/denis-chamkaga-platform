// src/services/email.service.ts
// Deprecation Wrapper: Aliases references to the new EmailTemplateService.

import { emailTemplateService } from './email-template.service';

export const emailService = {
  async sendWelcomeClient(to: string, name: string, portalUrl: string) {
    // Left for schema/seeding backward compatibility
    console.log(`Welcome email triggered dynamically in code logic for ${to}`);
    return true;
  },
  async sendQuotation(to: string, clientName: string, quoteNumber: string, value: string, link: string) {
    return emailTemplateService.sendQuotation(to, clientName, quoteNumber, value, link);
  },
  async sendInvoice(to: string, clientName: string, invoiceNumber: string, amount: string, dueDate: string, link: string, pdfBuffer?: Buffer) {
    return emailTemplateService.sendInvoice(to, clientName, invoiceNumber, amount, dueDate, link, pdfBuffer);
  },
  async sendReceipt(to: string, clientName: string, receiptNumber: string, amount: string, method: string, pdfBuffer: Buffer) {
    return emailTemplateService.sendReceipt(to, clientName, receiptNumber, amount, method, pdfBuffer);
  },
  async sendProjectUpdate(to: string, clientName: string, projectTitle: string, progress: number, notes: string) {
    return emailTemplateService.sendProjectUpdate(to, clientName, projectTitle, progress, notes);
  }
};
export default emailService;
