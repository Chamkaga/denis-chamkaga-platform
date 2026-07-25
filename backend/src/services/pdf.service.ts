// src/services/pdf.service.ts
// Deprecation Wrapper: Aliases references to the new DocumentTemplateEngine.

import { documentTemplateEngine, PdfDocumentData } from './document-template-engine';

export const pdfService = {
  async generate(data: PdfDocumentData): Promise<Buffer> {
    return documentTemplateEngine.generatePdf(data);
  }
};
export default pdfService;
export { PdfDocumentData };
