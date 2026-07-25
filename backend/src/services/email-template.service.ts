// src/services/email-template.service.ts
// Reusable template-driven email service using the central DocumentTemplateEngine.

import nodemailer from 'nodemailer';
import { env } from '../config/env';
import prisma from '../config/database';
import { documentTemplateEngine } from './document-template-engine';

export class EmailTemplateService {
  private getTransporter() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
    return null;
  }

  async sendEmail(to: string, subject: string, html: string, attachments?: any[]) {
    const transporter = this.getTransporter();
    const from = env.EMAIL_FROM || 'no-reply@denischamkaga.com';

    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to,
          subject,
          html,
          attachments,
        });
        console.log(`Email successfully dispatched to ${to} with subject: "${subject}"`);
        return true;
      } catch (err) {
        console.error('SMTP Email dispatch failed:', err);
        return false;
      }
    } else {
      console.log('================ MOCK EMAIL TRANSMISSION ================');
      console.log(`FROM:    ${from}`);
      console.log(`TO:      ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`ATTACHMENTS: ${attachments?.map(a => a.filename).join(', ') || 'None'}`);
      console.log('------------------- BODY PREVIEW -------------------');
      console.log(html.replace(/<[^>]*>/g, ' ').substring(0, 500).trim() + '...');
      console.log('========================================================');
      return true;
    }
  }

  private async getTenantContext() {
    const tenant = await prisma.tenantConfig.findFirst();
    return {
      name: tenant?.name || 'Terrasafi T Ltd',
      address: tenant?.address || 'Victoria, Dar es Salaam, Tanzania',
      email: tenant?.email || 'finance@terrasafi.co.tz',
      phone: tenant?.phone || '+255 700 000 000'
    };
  }

  // Quotation secure review link
  async sendQuotation(to: string, clientName: string, quoteNumber: string, value: string, link: string, pdfBuffer?: Buffer) {
    const tenant = await this.getTenantContext();
    const attachments = pdfBuffer ? [{
      filename: `Quotation_${quoteNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : [];

    const html = documentTemplateEngine.generateEmailLayout({
      title: `Quotation ${quoteNumber}`,
      tenant,
      bodyContent: `
        <p>Dear ${clientName},</p>
        <p>A new quotation has been prepared for your corporate review. Please find summary details below:</p>
        <table class="meta-table">
          <tr><th>Document</th><td>Quotation (${quoteNumber})</td></tr>
          <tr><th>Value</th><td>${value}</td></tr>
        </table>
        <p>You can review detailed lines, accept, reject, or request a revised version directly from the secure checkout link below:</p>
        <p style="text-align: center;"><a href="${link}" class="button">Review Quotation Details</a></p>
        <p>Or review the attached PDF document for offline confirmation.</p>
      `
    });

    return this.sendEmail(to, `Proposal Prepared: ${quoteNumber}`, html, attachments);
  }

  // Invoice notifications
  async sendInvoice(to: string, clientName: string, invoiceNumber: string, amount: string, dueDate: string, link: string, pdfBuffer?: Buffer) {
    const tenant = await this.getTenantContext();
    const attachments = pdfBuffer ? [{
      filename: `Invoice_${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : [];

    const html = documentTemplateEngine.generateEmailLayout({
      title: `Invoice ${invoiceNumber}`,
      tenant,
      bodyContent: `
        <p>Dear ${clientName},</p>
        <p>A new statement has been generated for your active project deliverables. Details:</p>
        <table class="meta-table">
          <tr><th>Invoice Ref</th><td>${invoiceNumber}</td></tr>
          <tr><th>Total Due</th><td>${amount}</td></tr>
          <tr><th>Due Date</th><td>${new Date(dueDate).toLocaleDateString()}</td></tr>
        </table>
        <p>Click below to inspect the invoice details and complete payment checkout securely:</p>
        <p style="text-align: center;"><a href="${link}" class="button">Settle Invoice Now</a></p>
        <p>A PDF attachment has also been enclosed for your record.</p>
      `
    });

    return this.sendEmail(to, `Billing Statement: ${invoiceNumber}`, html, attachments);
  }

  // Payments / Receipts
  async sendReceipt(to: string, clientName: string, receiptNumber: string, amount: string, method: string, pdfBuffer: Buffer) {
    const tenant = await this.getTenantContext();
    const attachments = [{
      filename: `Receipt_${receiptNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }];

    const html = documentTemplateEngine.generateEmailLayout({
      title: `Payment Receipt ${receiptNumber}`,
      tenant,
      bodyContent: `
        <p>Dear ${clientName},</p>
        <p>Thank you for your payment. We have successfully confirmed transaction clearance and generated an official receipt:</p>
        <table class="meta-table">
          <tr><th>Receipt Number</th><td>${receiptNumber}</td></tr>
          <tr><th>Cleared Amount</th><td>${amount}</td></tr>
          <tr><th>Channel</th><td>${method.toUpperCase()}</td></tr>
        </table>
        <p>Please find the official PDF receipt attached to this email.</p>
      `
    });

    return this.sendEmail(to, `Payment Confirmed: Receipt ${receiptNumber}`, html, attachments);
  }

  // Project update emails
  async sendProjectUpdate(to: string, clientName: string, projectTitle: string, progress: number, notes: string) {
    const tenant = await this.getTenantContext();
    const html = documentTemplateEngine.generateEmailLayout({
      title: 'Project Progress Milestone',
      tenant,
      bodyContent: `
        <p>Dear ${clientName},</p>
        <p>We have updated the development velocity status for **${projectTitle}**:</p>
        <table class="meta-table">
          <tr><th>Project</th><td>${projectTitle}</td></tr>
          <tr><th>Status</th><td>${progress}% Completed</td></tr>
        </table>
        <p><strong>Status Notes:</strong></p>
        <p style="background: #27272a; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed; color: #f4f4f5;">
          ${notes || 'No notes written.'}
        </p>
      `
    });

    return this.sendEmail(to, `Milestone Update: ${projectTitle}`, html);
  }
}

export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;
