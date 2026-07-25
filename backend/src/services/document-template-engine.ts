// src/services/document-template-engine.ts
// Reusable template engine for PDFs, HTML, Email layouts, and print styles.

import PDFDocument from 'pdfkit';

export interface PdfLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PdfDocumentData {
  title: string; // e.g., "INVOICE", "QUOTATION", "RECEIPT"
  number: string; // e.g., "INV-2026-000001"
  date: string;
  dueDate?: string;
  status: string;
  currency: string;
  tenant: {
    name: string;
    address: string;
    email: string;
    phone: string;
    vatNumber?: string;
    logoUrl?: string;
  };
  customer: {
    companyName: string;
    contactName: string;
    email: string;
    address?: string;
  };
  items: PdfLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  balanceDue?: number;
  notes?: string;
  terms?: string;
}

export const documentTemplateEngine = {
  // Generate streamable PDF binary Buffer
  async generatePdf(data: PdfDocumentData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Color Palette - Slate primary + accent violet
      const primaryColor = '#0f172a'; // Slate 900
      const accentColor = '#7c3aed';  // Violet 600
      const textColor = '#334155';    // Slate 700
      const lightBgColor = '#f8fafc'; // Slate 50
      const borderColor = '#e2e8f0';  // Slate 200

      // ─── 1. Header (Branding & Tenant Details) ──────────────────────────
      doc.fillColor(accentColor)
         .rect(0, 0, 600, 15)
         .fill();

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(20)
         .text(data.tenant.name.toUpperCase(), 40, 35);

      doc.fillColor(textColor)
         .font('Helvetica')
         .fontSize(8)
         .text(data.tenant.address, 40, 58)
         .text(`Email: ${data.tenant.email} | Tel: ${data.tenant.phone}`, 40, 70);

      if (data.tenant.vatNumber) {
        doc.text(`VAT No: ${data.tenant.vatNumber}`, 40, 82);
      }

      // Title & Document Info
      doc.fillColor(accentColor)
         .font('Helvetica-Bold')
         .fontSize(22)
         .text(data.title, 400, 35, { align: 'right', width: 150 });

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`${data.title} #: ${data.number}`, 400, 60, { align: 'right', width: 150 });

      doc.font('Helvetica')
         .fontSize(8)
         .text(`Date: ${new Date(data.date).toLocaleDateString()}`, 400, 75, { align: 'right', width: 150 });

      if (data.dueDate) {
        doc.text(`Due Date: ${new Date(data.dueDate).toLocaleDateString()}`, 400, 88, { align: 'right', width: 150 });
      }

      // Divider Line
      doc.moveTo(40, 108)
         .lineTo(550, 108)
         .strokeColor(borderColor)
         .lineWidth(1)
         .stroke();

      // ─── 2. Client & Account Panel ───────────────────────────────────────
      const billingTop = 125;
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('CLIENT BILLING INFORMATION', 40, billingTop);

      doc.fillColor(textColor)
         .font('Helvetica')
         .fontSize(9)
         .text(`Company: ${data.customer.companyName}`, 40, billingTop + 18)
         .text(`Contact: ${data.customer.contactName}`, 40, billingTop + 32)
         .text(`Email: ${data.customer.email}`, 40, billingTop + 46);

      if (data.customer.address) {
        doc.text(`Address: ${data.customer.address}`, 40, billingTop + 60);
      }

      // Payment Terms Box
      const termsBoxLeft = 340;
      doc.fillColor(lightBgColor)
         .rect(termsBoxLeft, billingTop, 210, 70)
         .fill()
         .strokeColor(borderColor)
         .stroke();

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(8)
         .text('SUMMARY OF TERMS', termsBoxLeft + 15, billingTop + 12);

      doc.fillColor(textColor)
         .font('Helvetica')
         .fontSize(8)
         .text(`Base Currency: ${data.currency}`, termsBoxLeft + 15, billingTop + 28)
         .text(`Status: ${data.status.toUpperCase()}`, termsBoxLeft + 15, billingTop + 40);

      if (data.balanceDue !== undefined) {
        doc.fillColor(data.balanceDue > 0 ? '#b91c1c' : '#047857')
           .font('Helvetica-Bold')
           .text(`Balance Due: ${data.currency} ${data.balanceDue.toLocaleString()}`, termsBoxLeft + 15, billingTop + 52);
      }

      // ─── 3. Line Items Table ─────────────────────────────────────────────
      const tableTop = 220;
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(9);

      // Header Row
      doc.text('LINE DESCRIPTION', 45, tableTop);
      doc.text('QTY', 300, tableTop, { width: 40, align: 'center' });
      doc.text('UNIT PRICE', 360, tableTop, { width: 80, align: 'right' });
      doc.text('SUBTOTAL', 460, tableTop, { width: 85, align: 'right' });

      doc.moveTo(40, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .strokeColor(primaryColor)
         .lineWidth(1)
         .stroke();

      let currentY = tableTop + 22;
      doc.font('Helvetica').fontSize(8.5).fillColor(textColor);

      data.items.forEach((item) => {
        // Draw details
        doc.text(item.description, 45, currentY, { width: 240 });
        doc.text(item.quantity.toString(), 300, currentY, { width: 40, align: 'center' });
        doc.text(`${data.currency} ${item.unitPrice.toLocaleString()}`, 360, currentY, { width: 80, align: 'right' });
        doc.text(`${data.currency} ${item.subtotal.toLocaleString()}`, 460, currentY, { width: 85, align: 'right' });

        currentY += 24;
      });

      doc.moveTo(40, currentY)
         .lineTo(550, currentY)
         .strokeColor(borderColor)
         .lineWidth(1)
         .stroke();

      // ─── 4. Totals Block ─────────────────────────────────────────────────
      const totalsLeft = 320;
      currentY += 12;

      doc.font('Helvetica').fontSize(8.5);
      
      doc.text('Subtotal:', totalsLeft, currentY);
      doc.text(`${data.currency} ${data.subtotal.toLocaleString()}`, 460, currentY, { width: 85, align: 'right' });
      currentY += 16;

      if (data.discountAmount > 0) {
        doc.text('Discounts:', totalsLeft, currentY);
        doc.text(`- ${data.currency} ${data.discountAmount.toLocaleString()}`, 460, currentY, { width: 85, align: 'right' });
        currentY += 16;
      }

      if (data.taxAmount > 0) {
        doc.text(`VAT (${data.taxRate}%):`, totalsLeft, currentY);
        doc.text(`${data.currency} ${data.taxAmount.toLocaleString()}`, 460, currentY, { width: 85, align: 'right' });
        currentY += 16;
      }

      // Grand Total
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor(primaryColor);
      doc.text('GRAND TOTAL DUE:', totalsLeft, currentY);
      doc.text(`${data.currency} ${data.total.toLocaleString()}`, 460, currentY, { width: 85, align: 'right' });

      // ─── 5. Notes & Footer terms ─────────────────────────────────────────
      let footerY = 650;
      doc.moveTo(40, footerY)
         .lineTo(550, footerY)
         .strokeColor(borderColor)
         .lineWidth(0.5)
         .stroke();

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(7)
         .text('TERMS AND INSTRUCTIONS', 40, footerY + 12);

      doc.fillColor(textColor)
         .font('Helvetica')
         .fontSize(7)
         .text(data.terms || 'All bills are payable via the secure payment links. Thank you for choosing our engineering and consulting solutions.', 40, footerY + 24, { width: 500, lineGap: 3 });

      if (data.notes) {
        doc.font('Helvetica-Bold').text('NOTES', 40, footerY + 60);
        doc.font('Helvetica').text(data.notes, 40, footerY + 70, { width: 500 });
      }

      doc.end();
    });
  },

  // Generate branded responsive HTML email frame from Tenant parameters
  generateEmailLayout(params: {
    title: string;
    bodyContent: string;
    tenant: { name: string; address?: string; email?: string; phone?: string };
  }): string {
    const primaryColor = '#7c3aed'; // violet accent
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #e4e4e7; margin: 0; padding: 20px; }
          .wrapper { max-width: 600px; margin: 20px auto; background: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: #0f172a; border-bottom: 1px solid #1e293b; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .content { padding: 35px; line-height: 1.6; font-size: 14.5px; color: #d4d4d8; }
          .footer { background: #09090b; padding: 25px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a; }
          .button { display: inline-block; padding: 12px 28px; background-color: ${primaryColor}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
          .meta-table { width: 100%; border-collapse: collapse; margin: 25px 0; background: #27272a/40; border-radius: 8px; overflow: hidden; }
          .meta-table th, .meta-table td { padding: 12px 16px; border-bottom: 1px solid #27272a; text-align: left; }
          .meta-table th { color: #a1a1aa; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta-table td { color: #f4f4f5; font-size: 13.5px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>${params.title}</h1>
          </div>
          <div class="content">
            ${params.bodyContent}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${params.tenant.name}.</p>
            ${params.tenant.address ? `<p>${params.tenant.address}</p>` : ''}
            <p>This is a secure business transmission. Please do not forward this link.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

export const DocumentTemplateEngine = documentTemplateEngine;
