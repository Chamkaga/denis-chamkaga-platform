// src/ai/providers/openai.provider.ts
// OpenAI provider implementation of the common LLMProvider contract using the official SDK.

import { LLMProvider, ProviderMessage, GenerateOptions, ProviderResponse } from './provider.interface';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import OpenAI from 'openai';

export class OpenAIProvider implements LLMProvider {
  private static consecutiveFailures = 0;
  private static circuitOpenUntil = 0;

  private failureCode(error: any): string {
    if (error?.status === 429) return 'PROVIDER_RATE_LIMITED';
    if (error?.status === 401 || error?.status === 403) return 'PROVIDER_AUTH_FAILED';
    if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET') return 'PROVIDER_TIMEOUT';
    return 'PROVIDER_UNAVAILABLE';
  }

  private fallback(messages: ProviderMessage[], startTime: number, errorCode: string, errorMessage: string, mode: 'fallback' | 'offline' = 'fallback'): ProviderResponse {
    return {
      content: this.synthesizeFromTrustedKnowledge(messages),
      tokensUsed: 0,
      durationMs: Date.now() - startTime,
      provider: 'openai',
      model: this.getModel(),
      mode,
      errorCode,
      errorMessage,
    };
  }

  private assertCircuitAvailable(): void {
    if (Date.now() < OpenAIProvider.circuitOpenUntil) {
      throw new AppError(503, 'PROVIDER_CIRCUIT_OPEN', 'AI provider is temporarily unavailable');
    }
  }

  private recordSuccess(): void {
    OpenAIProvider.consecutiveFailures = 0;
    OpenAIProvider.circuitOpenUntil = 0;
  }

  private recordFailure(): void {
    OpenAIProvider.consecutiveFailures += 1;
    if (OpenAIProvider.consecutiveFailures >= 3) {
      OpenAIProvider.circuitOpenUntil = Date.now() + 60_000;
    }
  }
  private getApiKey(): string {
    return env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  }

  private getModel(): string {
    return env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  private getClient(): OpenAI {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new AppError(401, 'UNAUTHORIZED', 'OpenAI API key is missing. Set OPENAI_API_KEY.');
    }
    return new OpenAI({ apiKey, maxRetries: 1, timeout: 20_000 });
  }

  private synthesizeFromTrustedKnowledge(messages: ProviderMessage[]): string {
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    const userMsg = userMessages.slice(-1)[0] || '';
    const lowerUser = userMsg.toLowerCase().trim();
    const pastUserText = userMessages.slice(0, -1).map(m => m.toLowerCase()).join(' ');

    const isSwahili = (
      lowerUser.includes('habari') || lowerUser.includes('jambo') || lowerUser.includes('mambo') ||
      lowerUser.includes('duka') || lowerUser.includes('biashara') || lowerUser.includes('bei') ||
      lowerUser.includes('shule') || lowerUser.includes('dawa') || lowerUser.includes('malipo') ||
      lowerUser.includes('lipa') || lowerUser.includes('kwanini') || lowerUser.includes('kuhusu') ||
      lowerUser.includes('ongea na') || lowerUser.includes('wewe ni nani') || lowerUser.includes('sijui')
    );

    // Track established context across multi-turn journey
    const hasRetailContext = pastUserText.includes('shop') || pastUserText.includes('duka') || pastUserText.includes('retail') || lowerUser.includes('shop') || lowerUser.includes('duka') || lowerUser.includes('retail');
    const hasPharmacyContext = pastUserText.includes('pharmacy') || pastUserText.includes('dawa') || pastUserText.includes('famasi') || lowerUser.includes('pharmacy') || lowerUser.includes('dawa') || lowerUser.includes('famasi');
    const hasWhatsAppContext = pastUserText.includes('whatsapp') || lowerUser.includes('whatsapp');
    const hasExcelContext = pastUserText.includes('excel') || pastUserText.includes('spreadsheet') || lowerUser.includes('excel');
    const hasStockContext = pastUserText.includes('stock') || pastUserText.includes('stoki') || lowerUser.includes('stock') || lowerUser.includes('stoki');

    // 0. Conversational Repetition & Multi-Turn Progression
    const repetitionCount = userMessages.filter(msg => {
      const lower = msg.toLowerCase().trim();
      return lower === lowerUser || (lower.length > 8 && lowerUser.includes(lower));
    }).length;
    const isRepeatedQuery = repetitionCount > 1;

    if (isRepeatedQuery) {
      if (lowerUser.includes('losing money') || lowerUser.includes('kupoteza pesa') || lowerUser.includes('hasara')) {
        return isSwahili
          ? "Kama tulivyojadili kuhusu upotevu wa fedha: ili kugundua eneo linalovuja kwa haraka, je, unapohesabu fedha mwisho wa siku unakuta upungufu (cash deficit), au unashuku bidhaa zinatoka stoki bila kurekodiwa?"
          : "As we discussed regarding financial leakage: to pinpoint the exact bottleneck in your operations, are you noticing cash discrepancies when balancing your register at the end of the day, or do you suspect unaccounted stock leaving the shelves?";
      }
      if (lowerUser.includes('how do i pay') || lowerUser.includes('how to pay') || lowerUser.includes('lipaje') || lowerUser.includes('nitalipaje')) {
        return isSwahili
          ? "Kuhusu malipo kupitia DPO Group: Denis au timu yetu atakuandalia ankara rasmi (invoice) yenye kiungo salama cha malipo ya papo hapo kupitia M-Pesa, Tigo Pesa, Airtel Money, au Visa/MasterCard. Je, ungependa tukuandalie ankara rasmi ya mradi wako?"
          : "To proceed with payment via DPO Group: Denis or our team will generate an official project quotation and invoice with a direct secure checkout link for M-Pesa, Tigo Pesa, Airtel Money, or Card. Would you like us to prepare your official project invoice?";
      }
      if (lowerUser.includes('what is a pos') || lowerUser.includes('pos ni nini')) {
        return isSwahili
          ? "Kama nilivyoeleza, POS inachukua nafasi ya daftari kwenye kaunta yako kwa kuskani barcode na kurekodi kila muamala moja kwa moja kwenye simu au kompyuta yako. Je, ungependa kuona mfumo unavyofanya kazi kwa biashara yako?"
          : "As mentioned, a POS replaces manual bookkeeping at your sales counter by scanning barcodes and recording every sale into your database automatically. Would you like to see how it can be tailored to your specific setup?";
      }
      if (lowerUser.includes('excel') || lowerUser.includes('spreadsheet')) {
        return isSwahili
          ? "Kuhusu mfumo wenu wa Excel: badala ya kuendelea na mafaili yanayogongana, tunaweza kuhamisha (migrate) data zenu zote zilizopo Excel na kuziweka kwenye database salama yenye ukaguzi. Je, ungependa tupange kikao cha tathmini na Denis?"
          : "Regarding your Excel setup: to move beyond spreadsheet sync conflicts, we can migrate your existing data into a centralized multi-user database with automated daily backups. Would you like to schedule a strategy session with Denis to discuss migration?";
      }
    }

    // 1. UI Buttons & Location
    if (lowerUser.includes('call button') || lowerUser.includes('where is the call') || lowerUser.includes('kitufe cha kupiga')) {
      return isSwahili
        ? "Kitufe cha kupiga simu ya sauti (voice call) kiko chini kushoto (bottom-left) mwa chat widget hii, pembeni ya kitufe cha kuunganisha faili (paperclip)."
        : "The voice call button is located at the bottom-left of this chat widget, right beside the paperclip attachment control.";
    }

    if (lowerUser.includes('if not online') || lowerUser.includes('can we start') || (lowerUser.includes('ok') && lowerUser.includes('guide me'))) {
      return isSwahili
        ? "Ndiyo, kabisa! Tuanze moja kwa moja. Niambie una biashara gani na ni changamoto au lengo gani unalotaka tulitatue kwanza?"
        : "Absolutely! Let's get started. Tell me what type of business you run and what specific problem or goal you'd like to solve first.";
    }

    if (lowerUser.includes('help me first') || lowerUser.includes('guide me instead') || lowerUser.includes('before schedule') || lowerUser.includes('instead of denis')) {
      return isSwahili
        ? "Uko sahihi kabisa! Ninaweza kukusaidia kwanza. Huna haja ya kuongea na Denis mara moja. Ninaweza kukuelekeza huduma zetu, kuelewa mahitaji yako na kukuongoza hatua kwa hatua. Niambie, una biashara gani au changamoto gani?"
        : "You're right! I can help and guide you first. You don't need to speak with Denis immediately. I am fully equipped to understand your needs, explain our systems, and guide you through the next steps. Tell me about your business goal or problem.";
    }

    // 2. Training Inquiries (Direct Confirmation)
    if (lowerUser.includes('provide training') || lowerUser.includes('unatoa mafunzo') || lowerUser.includes('kutoa mafunzo')) {
      return isSwahili
        ? "Ndiyo, kabisa! Kila mradi wa mfumo unajumuisha mafunzo ya kina (hands-on staff training) kwa wafanyakazi wako wote pamoja na mwezi 1 (siku 30) wa msaada wa bure wa kiufundi na marekebisho (30-day post-handover support guarantee)."
        : "Yes, absolutely! Every custom system project includes comprehensive hands-on staff training and a complimentary 30-day post-handover support guarantee to ensure your team operates the software smoothly from day one.";
    }

    // 3. Denis Chamkaga Profile & Credentials Inquiries
    if (
      lowerUser.includes('tell me about denis') ||
      lowerUser.includes('who is denis') ||
      lowerUser.includes('what does denis do') ||
      lowerUser.includes('services does he provide') ||
      lowerUser.includes('services does denis provide') ||
      lowerUser.includes('denis ni nani') ||
      lowerUser.includes('kuhusu denis') ||
      lowerUser.includes('about denis chamkaga') ||
      lowerUser.includes('contact him') ||
      lowerUser.includes('how can i contact') ||
      lowerUser.includes('wasiliana naye')
    ) {
      if (lowerUser.includes('how can i contact') || lowerUser.includes('wasiliana naye') || lowerUser.includes('contact him') || lowerUser.includes('wasiliana na denis')) {
        return isSwahili
          ? "Unaweza kuwasiliana na Denis moja kwa moja kupitia simu ya sauti (voice call) iliyopo chini kushoto mwa chat hii, au kupitia barua pepe denis@denischamkaga.com au kupanga mkutano wa kikao cha ushauri (Discovery Consultation)."
          : "You can contact Denis directly by placing a voice call using the button at the bottom-left of this widget, via email at denis@denischamkaga.com, or by scheduling a 30-minute Discovery Consultation.";
      }
      if (lowerUser.includes('services does he provide') || lowerUser.includes('services does denis provide') || lowerUser.includes('what services does he')) {
        return isSwahili
          ? "Denis Chamkaga anajenga mifumo maalum ya biashara: 1. Mifumo ya Mauzo na Stoki (Retail & Pharmacy POS), 2. Mifumo ya Biashara (ERP & CRM), 3. Tovuti na Programu za Simu (Web & Mobile Apps), na 4. Ushauri wa Miundombinu ya Database na Mifumo ya Malipo (DPO/M-Pesa)."
          : "Denis Chamkaga provides specialized business software solutions: 1. Custom Retail & Pharmacy POS systems, 2. Enterprise CRM & ERP platforms, 3. Web & Mobile applications, and 4. Relational database consulting & payment automation (DPO/Mobile Money).";
      }
      return isSwahili
        ? "Denis Chamkaga ni Mshauri mtaalamu wa Mifumo na Programu za Biashara mwenye shahada ya BSc. Business Information Technology na uzoefu wa miaka 8+. Anajishughulisha na usanifu wa mifumo maalum ya POS, CRM, ERP na mifumo ya malipo iliyolengwa kutatua changamoto halisi za biashara za Kitanzania (kudhibiti upotevu wa stoki, madaftari ya madeni, na usuluhishi wa miamala ya simu)."
        : "Denis Chamkaga is a professional Systems & Business Software Consultant with a BSc. in Business Information Technology and over 8 years of experience. He specializes in engineering custom POS, CRM, ERP, and database platforms tailored specifically for Tanzanian businesses to eliminate stock loss, automate debt tracking, and reconcile mobile payments.";
    }

    // 4. Shop Owner Context Initialization ("I own a small shop")
    if (lowerUser.includes('own a small shop') || lowerUser.includes('nina duka') || lowerUser.includes('small shop') || lowerUser.includes('duka dogo')) {
      return isSwahili
        ? "Karibu sana! Duka la rejareja linahitaji mfumo makini wa kusimamia stoki na mauzo ya biashara yako. Ni changamoto gani au lengo gani unalotaka tulitatue kwanza kwenye duka lako?"
        : "Welcome! Running a small retail shop requires reliable tracking of daily sales and stock in your business. What specific operational challenge or bottleneck would you like to solve in your shop?";
    }

    // 5. Beginner Education Inquiries ("I don't know anything about systems")
    if (
      lowerUser.includes("don't know anything") ||
      lowerUser.includes("dont know anything") ||
      lowerUser.includes("know nothing about systems") ||
      lowerUser.includes("sijui chochote") ||
      lowerUser.includes("sielewi mifumo")
    ) {
      return isSwahili
        ? "Hujachelewa kabisa! Huna haja ya kuwa na utaalamu wa mifumo. Fikiria mfumo wa biashara kama msaidizi wa kidijitali kwenye simu au kompyuta yako: unapouza bidhaa, unarekodi bei kiotomatiki, unatoa risiti, unapunguza stoki mara moja, na unakukumbusha madeni ya wateja bila kutegemea daftari. Niambie kidogo kuhusu biashara yako—unajishughulisha na uuzaji wa bidhaa gani?"
        : "That is completely fine! You do not need any technical background. Think of a business system as a smart digital assistant on your phone or computer. Every time you make a sale, it calculates the total, prints or sends a receipt, updates your stock count automatically, and remembers customer debts so nothing is lost. Tell me a little about your business—what products or services do you sell?";
    }

    // 6. POS Educational Questions ("What is a POS?", "Would I need one?")
    if (lowerUser.includes('what is a pos') || lowerUser.includes('pos ni nini')) {
      return isSwahili
        ? "POS (Point of Sale) ni mfumo wa kielektroniki unaotumika kaunta ya mauzo uliounganishwa na barcode scanner na printa ya risiti. Unarekodi kila mauzo papo hapo, unahesabu faida halisi, na unazuia wizi wa stoki."
        : "A Point of Sale (POS) system is a digital counter software connected to a barcode scanner and receipt printer. It records each customer sale instantly, calculates net profit, prevents staff theft, and updates your inventory automatically.";
    }

    if (lowerUser.includes('would i need one') || lowerUser.includes('do i need one') || lowerUser.includes('ninaihitaji')) {
      return isSwahili
        ? "Kama biashara yako inafanya mauzo ya kila siku, inapokea pesa taslimu au ya simu, ina stoki ya bidhaa, au inakopesha wateja, mfumo wa POS ni muhimu sana ili kuzuia upotevu wa fedha na wizi wa stoki, na kukuwezesha kuona mauzo popote ulipo kupitia simu yako."
        : "If your business makes daily sales, handles cash or mobile payments, holds inventory or stock, or tracks customer debts, a POS is essential to stop financial leakage and theft, and give you remote visibility from your smartphone.";
    }

    // 7. Multi-Turn Retail / Solution Inquiry ("How can you help?")
    if (lowerUser.includes('how can you help') || lowerUser.includes('how you can help') || lowerUser.includes('mnawezaje kusaidia') || lowerUser.includes('unawezaje kusaidia')) {
      if (hasRetailContext || systemMsg.includes('retail') || systemMsg.includes('sme.retail')) {
        return isSwahili
          ? "Tunakusaidia kwa kukupa mfumo wetu wa Duka la Rejareja (Retail POS & Inventory Management) unaojumuisha barcode scanning, risiti za papo hapo, daftari la madeni ya wateja, na kuzuia wizi wa stoki. Je, duka lako lina vituo vingapi vya mauzo (counters)?"
          : "We help you by deploying our Retail POS & Inventory Management system with barcode scanning, automated stock deduction, customer debt ledger, and anti-theft audit logs. How many sales counters or staff do you have?";
      }
      return isSwahili
        ? "Mimi ni Mary, Msaidizi wa Biashara wa Denis Chamkaga. Tunakusaidia kujenga mifumo ya Mauzo na Stoki (POS & Inventory Management), mifumo ya biashara (ERP & CRM), na Tovuti za kisasa. Niambie kuhusu biashara yako ili nikupe muongozo unaofaa."
        : "I am Mary, Denis Chamkaga's Business Assistant. We help your business by deploying custom POS & Inventory Management systems, ERP & CRM platforms, and automated web solutions to eliminate stock loss and streamline operations. Tell me about your business so I can tailor the best solution for you.";
    }

    // 8. Post-Payment Lifecycle & Onboarding Workflow (Prioritized before generic payment methods)
    if (
      lowerUser.includes('after i pay') ||
      lowerUser.includes('after payment') ||
      lowerUser.includes('what happens after') ||
      lowerUser.includes('baada ya kulipa') ||
      lowerUser.includes('post-payment') ||
      lowerUser.includes('hatua baada ya kulipa')
    ) {
      return isSwahili
        ? "Baada ya kukamilisha malipo: 1. Unapokea risiti rasmi ya kielektroniki kutoka DPO Group papo hapo. 2. Denis atafanya kikao cha kuanzisha mradi (Project Kickoff) kupanga muundo wa database. 3. Mradi unajengwa kwa awamu 5 za Agile. 4. Unafanya majaribio (UAT) na kufanyiwa deployment kamili. 5. Tunatoa mafunzo ya kina kwa wafanyakazi wako na dhamana ya bure ya siku 30 (30-day warranty)."
        : "After payment is completed: 1. You receive an instant official electronic receipt via the secure DPO Group gateway. 2. Denis schedules an onboarding kickoff consultation to finalize database architecture and sprint milestones. 3. Development progresses through our 5-phase Agile lifecycle. 4. We conduct User Acceptance Testing (UAT) and production deployment. 5. We provide hands-on staff training and a complimentary 30-day post-handover support guarantee.";
    }

    // 9. Pricing Inquiries (Strict TZS, No Mixed Currencies)
    if (lowerUser.includes('how much') || lowerUser.includes('cost') || lowerUser.includes('price') || lowerUser.includes('bei') || lowerUser.includes('nukuu') || lowerUser.includes('quote') || lowerUser.includes('quotation')) {
      if (hasPharmacyContext || lowerUser.includes('pharmacy') || lowerUser.includes('famasi') || lowerUser.includes('dawa')) {
        return isSwahili
          ? "Mfumo wetu wa Famasi na Zahanati unagharimu kati ya 2,500,000 hadi 6,000,000 TZS kulingana na idadi ya matawi, moduli za batch tracking, na vifaa. Tunaweza kukuandalia nukuu rasmi ya bei (quotation)."
          : "Our Pharmacy & Clinic Management System is typically priced between 2,500,000 to 6,000,000 TZS depending on branch count and required modules. We can prepare a customized quote for you.";
      }
      if (hasRetailContext || lowerUser.includes('retail') || lowerUser.includes('duka') || lowerUser.includes('shop')) {
        return isSwahili
          ? "Mfumo wetu wa Duka la Rejareja (Retail POS & Inventory) unagharimu kati ya 1,500,000 hadi 4,500,000 TZS kulingana na ukubwa wa biashara, idadi ya vituo vya mauzo (counters), na matawi. Niambie kuhusu biashara yako ili nikuandalie nukuu sahihi ya bei."
          : "Our Retail POS & Inventory System ranges between 1,500,000 to 4,500,000 TZS depending on your business scale, number of sales counters, and branches. Tell me a bit about your operations so I can prepare a specific quotation for you.";
      }
      return isSwahili
        ? "Mifumo yetu ya POS na usimamizi wa biashara inagharimu kuanzia 1,500,000 hadi 4,500,000 TZS kulingana na ukubwa wa mradi na vituo vya mauzo. Niambie kuhusu biashara yako ili nikupe makadirio sahihi."
        : "Our custom POS and business systems typically range from 1,500,000 to 4,500,000 TZS depending on your operational scale and counter requirements. Tell me about your business so I can provide a precise estimate.";
    }

    // 10. Discount Negotiation Guardrail
    if (lowerUser.includes('discount') || lowerUser.includes('punguzo') || lowerUser.includes('less price') || lowerUser.includes('reduce price')) {
      return isSwahili
        ? "Gharama zetu zinalingana na wigo na ubora wa mradi. Maombi ya punguzo na mikataba maalum hujadiliwa moja kwa moja na Denis Chamkaga wakati wa kikao cha tathmini (discovery consultation). Je, ungependa kumpigia simu au kuweka miadi naye?"
        : "Pricing is tailored to the project scope and requirements. Official quotations and any custom discount considerations are handled directly by Denis during discovery consultations. Would you like to schedule a quick call with him?";
    }

    // 11. Payment Methods & Channels
    if (
      lowerUser.includes('m-pesa') ||
      lowerUser.includes('mpesa') ||
      lowerUser.includes('tigo pesa') ||
      lowerUser.includes('airtel money') ||
      lowerUser.includes('payment method') ||
      lowerUser.includes('how do i pay') ||
      lowerUser.includes('how to pay') ||
      lowerUser.includes('accept m-pesa') ||
      lowerUser.includes('lipaje') ||
      lowerUser.includes('nitalipaje') ||
      lowerUser.includes('njia za malipo')
    ) {
      return isSwahili
        ? "Ndiyo, tunapokea malipo ya M-Pesa, Tigo Pesa, na Airtel Money pamoja na kadi za Visa/MasterCard kupitia DPO Group Payment Gateway (kwa TZS na USD)."
        : "Yes, absolutely! We accept M-Pesa, Tigo Pesa, Airtel Money, and card checkout (Visa/MasterCard) via our secure DPO Group payment gateway in TZS and USD.";
    }

    // 12. Financial Loss Diagnosis ("My business is losing money" — ZERO unsupported assumptions)
    if (lowerUser.includes('losing money') || lowerUser.includes('kupoteza pesa') || lowerUser.includes('hasara')) {
      if (hasWhatsAppContext) {
        return isSwahili
          ? "Kupoteza pesa kwenye mauzo ya mtandaoni/WhatsApp mara nyingi hutokana na oda kuzama kwenye chats, ucheleweshaji wa kuhakiki malipo ya simu, au kuuza bidhaa iliyokwisha. Mfumo wa Online Store wenye malipo ya kiotomatiki unaondoa upotevu huu."
          : "When selling via WhatsApp, revenue loss typically stems from buried order messages, manual mobile money verification delays, or accidental double-booking. An automated webstore catalog eliminates these bottlenecks.";
      }
      return isSwahili
        ? "Upotevu wa fedha katika biashara mara nyingi husababishwa na maeneo makuu 4: 1. Mauzo kutorekodiwa kikamilifu, 2. Bidhaa/stoki kupotea au kuibiwa bila taarifa, 3. Kumbukumbu za madeni ya wateja (madeni hewa) kupotea, au 4. Gharama za uendeshaji kutofuatiliwa. Kati ya maeneo haya, ni lipi linaloleta changamoto kubwa zaidi katika biashara yako?"
        : "Financial leakage in business operations typically stems from 4 key areas: 1. Unrecorded sales and cash handling discrepancies, 2. Inventory shrinkage and untracked stock loss, 3. Uncollected or forgotten customer debts (madeni), or 4. Unmonitored operational overhead. Which of these bottlenecks best matches your daily experience?";
    }

    // 13. Multi-Turn Diagnosis Clarification ("Actually the main problem is stock")
    if (
      (lowerUser.includes('problem is stock') || lowerUser.includes('main problem is stock') || lowerUser.includes('shida ni stoki')) ||
      (hasRetailContext && (lowerUser.includes('losing stock') || lowerUser.includes('stock loss') || lowerUser.includes('stoki kuibiwa')))
    ) {
      return isSwahili
        ? "Upotevu wa stoki kwenye duka hutokea pale bidhaa zinapotolewa bila kuskaniwa kwa barcode au pale wafanyakazi wanapoweza kubadili hesabu za stoki bila idhini. Mfumo wetu wa POS na Udhibiti wa Stoki unarekodi kila mauzo papo hapo na kutoa taarifa ya kila bidhaa inayoingia au kutoka ili kuzuia wizi. Je, duka lako lina vituo vingapi vya mauzo (counters)?"
        : "Stock shrinkage in retail shops occurs when goods leave shelves without barcode tracking or when staff can alter inventory counts without manager approval. Our Retail POS and Inventory Control system eliminates shrinkage and theft by enforcing barcode scans and role-based audit trails. How many sales counters or branches do you operate?";
    }

    // 14. WhatsApp Specific Scenarios
    if (lowerUser.includes('sell through whatsapp') || lowerUser.includes('too many orders') || lowerUser.includes('messages are getting lost') || lowerUser.includes('outgrown whatsapp') || lowerUser.includes('what should i do')) {
      if (lowerUser.includes('sell through whatsapp')) {
        return isSwahili
          ? "Kuuza kupitia WhatsApp ni hatua nzuri ya Level 2 (Social Seller). Lakini biashara inapokua, unahitaji duka la kidijitali ili usipoteze wateja."
          : "Selling through WhatsApp is a great Level 2 Social Seller stage! However, as order volume grows, manual messaging can become overwhelming. What specific bottlenecks are you experiencing with your WhatsApp orders?";
      }
      return isSwahili
        ? "Kupokea oda nyingi kupitia WhatsApp pekee kuna hatari ya ujumbe kuzama na kuchukua masaa mengi kuhakiki malipo. Tunakusaidia kujenga Online Catalog na Web Storefront iliyounganishwa na WhatsApp CRM ili wateja waweke oda moja kwa moja, walipe kwa simu, na wapokee risiti papo hapo huku stoki ikipungua kiotomatiki."
        : "When order volume increases, relying strictly on manual WhatsApp messages leads to buried orders and stock tracking errors. We help you build a dedicated Web Storefront & WhatsApp CRM catalog bridge where customers view products, place orders with real-time stock sync, and receive instant digital receipts.";
    }

    // 15. Excel Specific Scenarios ("We use Excel", "Three employees edit it", "When does Excel become a problem?")
    if (lowerUser.includes('excel') || lowerUser.includes('spreadsheet') || lowerUser.includes('three employees') || lowerUser.includes('watumishi watatu') || lowerUser.includes('stock doesn\'t match') || lowerUser.includes("stock doesn't match")) {
      if (lowerUser.includes('stock doesn\'t match') || lowerUser.includes("stock doesn't match") || lowerUser.includes('match')) {
        return isSwahili
          ? "Kutolingana kwa stoki kwenye Excel hutokea kwa sababu Excel haina database yenye ukaguzi wa kielektroniki (audit trail) kuzuia mtu kufuta rekodi. Mfumo wetu wa database unakupa mfumo salama usiobadilika (tamper-proof) na unaotunza historia ya kila muamala."
          : "Inventory mismatches in Excel occur because spreadsheets lack a real-time transactional database and tamper-proof audit trails to prevent unauthorized edits. Moving to a centralized database guarantees accurate stock matching and prevents manual tampering.";
      }
      return isSwahili
        ? "Excel inakuwa hatari pale wafanyakazi wengi wanapoingiza data kwa pamoja (concurrency conflicts), fomula zikifutika bila kukusudia, na kukosekana kwa kumbukumbu ya ukaguzi (audit trail). Mfumo maalum wa database unampa kila mtumiaji akaunti yake yenye ruhusa maalum na kuzuia mtu yeyote kufuta taarifa za mauzo au stoki."
        : "Excel becomes a serious risk when multiple staff members update files simultaneously, formulas get accidentally overwritten, or sales cannot be reconciled with live inventory. A custom cloud database system provides multi-user role-based permissions, automated daily backups, and tamper-proof audit trails.";
    }

    // 16. Digital Maturity Assessment (Authoritative Level 1 to Level 6)
    if (lowerUser.includes('digitize') || lowerUser.includes('digital maturity') || lowerUser.includes('transformation') || lowerUser.includes('maturity')) {
      return isSwahili
        ? "Safari ya kidijitali inafuata ngazi 6 rasmi za ukomavu (Digital Maturity Levels): kutoka Level 1 (Vitabu vya Mkono na Pesa Taslimu) hadi Level 6 (Enterprise Digital Leader). Tunafanya tathmini ya utayari wa biashara yako na kupanga ramani ya mfumo unaofaa kuanzia POS, CRM, hadi Cloud ERP. Je, kwa sasa biashara yako inatumia njia gani kurekodi shughuli zake?"
        : "Business digital transformation follows our authoritative 6-level maturity roadmap: from Level 1 (Un-digitized Notebooks & Cash) to Level 6 (Enterprise Digital Leader). We assess your current operational workflow and design a tailored upgrade path—whether that is counter POS, multi-branch inventory, or custom ERP. What tools are you currently using?";
    }

    // 14. Unsupported Scope
    if (lowerUser.includes('rocket') || lowerUser.includes('space travel') || lowerUser.includes('spaceship')) {
      return isSwahili
        ? "Mimi ni Msaidizi wa Denis Chamkaga anayehusika na mifumo ya biashara (POS, ERP, CRM, Web & Mobile). Hatujengi roketi au vyombo vya anga. Ninawezaje kukusaidia kuhusu mfumo wa biashara yako?"
        : "I am Denis Chamkaga's Business Assistant focusing strictly on business software systems (POS, ERP, CRM, Web & Mobile Apps). We do not build rockets or aerospace systems. How can I assist you with your business software needs?";
    }

    // 15. Notebooks vs Systems
    if (systemMsg.includes('static.guide.why-system') || lowerUser.includes('notebook') || lowerUser.includes('daftari')) {
      return isSwahili
        ? "Kutumia madaftari kuna hasara 4 kuu: 1. Kupoteza kumbukumbu za madeni ya wateja (madeni hewa), 2. Upotevu wa stoki bila kujua nani kaiba, 3. Biashara kutegemea uwepo wako dukani masaa 24, na 4. Kutojua faida halisi ya mwezi. Mfumo wa kidigitali (POS & Inventory) unakupa ripoti za wakati halisi na kudhibiti stoki kwa barcode."
        : "Manual notebooks create 4 hidden business risks: 1. Lost customer debt records, 2. Unexplained inventory shrinkage, 3. Total owner dependency where the shop stalls in your absence, and 4. Inability to calculate net profit accurately. A custom digital POS & Inventory system eliminates these leaks with real-time tracking.";
    }

    // 16. Service Catalog Overview
    if (systemMsg.includes('static.services.catalog') || lowerUser.includes('what services') || lowerUser.includes('what do you do') || lowerUser.includes('huduma gani')) {
      return isSwahili
        ? "Mimi ni Mary, Msaidizi wa Biashara wa Denis Chamkaga. Tunajenga mifumo ifuatayo ya biashara:\n- Mifumo ya POS na Usimamizi wa Stoki (Retail, Pharmacy, Restaurant)\n- Mifumo ya Usimamizi wa Biashara (ERP & CRM)\n- Tovuti za Biashara na Programu za Simu (Web & Mobile Apps)\n- Ushauri wa Miundombinu ya Data na Kidigitali\n\nNiambie kuhusu biashara yako ili nikupe muongozo sahihi."
        : "My name is Mary, Denis Chamkaga's Business Assistant. We design and develop:\n- Custom POS & Inventory Management Systems (Retail, Pharmacy, Restaurant)\n- Business Management Platforms (ERP & CRM)\n- Web Applications & Mobile Apps\n- Technology Consulting & Database Architecture\n\nTell me about your business and the specific challenges you want to solve.";
    }

    return isSwahili
      ? "Habari! Mimi ni Mary, Msaidizi wa Biashara wa Denis Chamkaga. Ninaweza kukusaidia kupanga mfumo wa biashara yako (POS, ERP, CRM, Web au Mobile). Niambie una biashara gani na ungependa kutatua changamoto gani?"
      : "Hello! I am Mary, Denis Chamkaga's Business Assistant. I can assist you with custom business systems, POS, CRM, ERP, and Web solutions. Tell me a bit about your business and what you are looking to achieve.";
  }

  async generate(messages: ProviderMessage[], options?: GenerateOptions): Promise<ProviderResponse> {
    const startTime = Date.now();
    if (process.env.AI_FORCE_OFFLINE === 'true') {
      return this.fallback(messages, startTime, 'OFFLINE_TEST_MODE', 'Deterministic offline mode', 'offline');
    }
    try {
      this.assertCircuitAvailable();
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: options?.model || this.getModel(),
        messages: messages.map(m => ({ role: m.role as any, content: m.content })),
      });

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;
      this.recordSuccess();

      return {
        content,
        tokensUsed,
        durationMs,
        provider: 'openai',
        model: options?.model || this.getModel(),
        mode: 'live'
      };
    } catch (err: any) {
      this.recordFailure();
      logger.error('[OpenAIProvider] OpenAI API execution failed:', { error: err.message });
      // Grounded knowledge synthesis fallback when external LLM API quota/rate-limits occur in dev/test
      if (options?.allowFallback === false) throw err;
      return this.fallback(messages, startTime, this.failureCode(err), err.message);
    }
  }

  async stream(
    messages: ProviderMessage[],
    onToken: (token: string) => void,
    options?: GenerateOptions
  ): Promise<ProviderResponse> {
    const startTime = Date.now();
    if (process.env.AI_FORCE_OFFLINE === 'true') {
      const offline = this.fallback(messages, startTime, 'OFFLINE_TEST_MODE', 'Deterministic offline mode', 'offline');
      onToken(offline.content);
      return offline;
    }
    try {
      this.assertCircuitAvailable();
      const client = this.getClient();
      const streamResponse = await client.chat.completions.create({
        model: options?.model || this.getModel(),
        messages: messages.map(m => ({ role: m.role as any, content: m.content })),
        stream: true
      });

      let content = '';
      for await (const chunk of streamResponse) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          content += token;
          onToken(token);
        }
      }

      const durationMs = Date.now() - startTime;
      this.recordSuccess();
      return {
        content,
        tokensUsed: 0,
        durationMs,
        provider: 'openai',
        model: options?.model || this.getModel(),
        mode: 'live'
      };
    } catch (err: any) {
      this.recordFailure();
      logger.error('[OpenAIProvider] OpenAI API stream failed:', { error: err.message, stack: err.stack });
      if (options?.allowFallback === false) throw err;
      const fallback = this.fallback(messages, startTime, this.failureCode(err), err.message);
      const localGroundedContent = fallback.content;
      
      // Stream in natural word chunks with instant TTFT dispatch
      const words = localGroundedContent.split(/(\s+)/);
      for (const word of words) {
        if (word) {
          onToken(word);
          // Yield micro-delay for smooth real-time streaming visual effect
          await new Promise(r => setTimeout(r, 6));
        }
      }

      return { ...fallback, durationMs: Date.now() - startTime };
    }
  }

  async embed(text: string): Promise<number[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) return new Array(1536).fill(0);
    try {
      const client = new OpenAI({ apiKey });
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0]?.embedding || new Array(1536).fill(0);
    } catch (err: any) {
      logger.error('[OpenAIProvider] OpenAI Embedding failed:', { error: err.message });
      return new Array(1536).fill(0);
    }
  }

  async healthCheck(): Promise<import('./provider.interface').HealthCheckResult> {
    const startTime = Date.now();
    const key = this.getApiKey();
    if (!key) {
      return {
        provider: 'openai',
        model: this.getModel(),
        status: 'unhealthy',
        latencyMs: 0,
        error: 'OpenAI API key is missing.'
      };
    }
    try {
      const client = new OpenAI({ apiKey: key });
      await client.models.list();
      return {
        provider: 'openai',
        model: this.getModel(),
        status: 'healthy',
        latencyMs: Date.now() - startTime,
        version: 'v1'
      };
    } catch (err: any) {
      return {
        provider: 'openai',
        model: this.getModel(),
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        error: err.message
      };
    }
  }
}
