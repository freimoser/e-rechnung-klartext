// Erzeugt frei erfundene Testrechnungen (tests/fixtures/out) und die Beispielrechnungen der Website (src/beispiele).
// Alle Namen, Adressen und Nummern sind erfunden. Die IBAN DE79000000001234567890 ist die
// Dummy-IBAN aus der KoSIT-Testsuite („nicht existierende, aber valide IBAN“).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, AFRelationship, PDFName, PDFString, rgb } from 'pdf-lib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'tests', 'fixtures', 'out');
const SAMPLES = path.join(ROOT, 'src', 'beispiele');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SAMPLES, { recursive: true });

const XR = 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0';
const PEPPOL_PROC = 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';
export const IDS = {
  xrechnung: XR,
  en16931: 'urn:cen.eu:en16931:2017',
  basic: 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic',
  extended: 'urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended',
  minimum: 'urn:factur-x.eu:1p0:minimum',
  basicwl: 'urn:factur-x.eu:1p0:basicwl',
};

const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cents = (n) => Math.round(n * 100);
const amt = (c) => (c < 0 ? '-' : '') + (Math.abs(c) / 100).toFixed(2);
const ymd = (iso) => iso.replace(/-/g, '');

// Rechnung berechnen: Positionen, Steuergruppen und Summen in Cent
function compute(inv) {
  const lines = inv.lines.map((l) => ({ ...l, netC: cents(l.qty * l.price) }));
  const allowC = (inv.allowances || []).reduce((s, a) => s + cents(a.amount), 0);
  const groups = new Map();
  for (const l of lines) {
    const k = `${l.cat}|${l.rate}`;
    const g = groups.get(k) || { cat: l.cat, rate: l.rate, baseC: 0, reason: l.reason, reasonCode: l.reasonCode };
    g.baseC += l.netC;
    groups.set(k, g);
  }
  for (const a of inv.allowances || []) {
    const g = groups.get(`${a.cat}|${a.rate}`);
    g.baseC -= cents(a.amount);
  }
  const vat = [...groups.values()].map((g) => ({ ...g, taxC: Math.round((g.baseC * g.rate) / 100) }));
  const lineC = lines.reduce((s, l) => s + l.netC, 0);
  const exclC = lineC - allowC;
  const taxC = vat.reduce((s, g) => s + g.taxC, 0);
  const inclC = exclC + taxC;
  const prepaidC = cents(inv.prepaid || 0);
  return { ...inv, lines, vat, lineC, allowC, exclC, taxC, inclC, prepaidC, dueC: inclC - prepaidC };
}

/* ---------------- UBL ---------------- */
function ublParty(p) {
  return `<cac:Party>
      ${p.endpoint ? `<cbc:EndpointID schemeID="${x(p.endpoint[0])}">${x(p.endpoint[1])}</cbc:EndpointID>` : ''}
      ${p.id ? `<cac:PartyIdentification><cbc:ID>${x(p.id)}</cbc:ID></cac:PartyIdentification>` : ''}
      ${p.tradingName ? `<cac:PartyName><cbc:Name>${x(p.tradingName)}</cbc:Name></cac:PartyName>` : ''}
      <cac:PostalAddress>
        <cbc:StreetName>${x(p.street)}</cbc:StreetName>
        ${p.city !== undefined ? `<cbc:CityName>${x(p.city)}</cbc:CityName>` : ''}
        ${p.zip !== undefined ? `<cbc:PostalZone>${x(p.zip)}</cbc:PostalZone>` : ''}
        <cac:Country><cbc:IdentificationCode>${x(p.country || 'DE')}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      ${p.vatId ? `<cac:PartyTaxScheme><cbc:CompanyID>${x(p.vatId)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : ''}
      ${p.taxId ? `<cac:PartyTaxScheme><cbc:CompanyID>${x(p.taxId)}</cbc:CompanyID><cac:TaxScheme><cbc:ID>FC</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : ''}
      <cac:PartyLegalEntity><cbc:RegistrationName>${x(p.name)}</cbc:RegistrationName>${p.legalId ? `<cbc:CompanyID>${x(p.legalId)}</cbc:CompanyID>` : ''}</cac:PartyLegalEntity>
      ${p.contact ? `<cac:Contact>${p.contact.name ? `<cbc:Name>${x(p.contact.name)}</cbc:Name>` : ''}${p.contact.phone ? `<cbc:Telephone>${x(p.contact.phone)}</cbc:Telephone>` : ''}${p.contact.email ? `<cbc:ElectronicMail>${x(p.contact.email)}</cbc:ElectronicMail>` : ''}</cac:Contact>` : ''}
    </cac:Party>`;
}

export function toUBL(raw, opt = {}) {
  const inv = compute(raw);
  const c = inv.currency || 'EUR';
  const A = (cc) => `currencyID="${c}"`;
  const lineSum = opt.lineSumOverrideC ?? inv.lineC;
  return `<?xml version="1.0" encoding="UTF-8"?>
<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>${x(inv.spec || XR)}</cbc:CustomizationID>
  <cbc:ProfileID>${PEPPOL_PROC}</cbc:ProfileID>
  <cbc:ID>${x(inv.number)}</cbc:ID>
  <cbc:IssueDate>${inv.issueDate}</cbc:IssueDate>
  ${inv.dueDate ? `<cbc:DueDate>${inv.dueDate}</cbc:DueDate>` : ''}
  <cbc:InvoiceTypeCode>${inv.typeCode || '380'}</cbc:InvoiceTypeCode>
  ${(inv.notes || []).map((n) => `<cbc:Note>${x(n)}</cbc:Note>`).join('')}
  <cbc:DocumentCurrencyCode>${c}</cbc:DocumentCurrencyCode>
  ${inv.buyerRef ? `<cbc:BuyerReference>${x(inv.buyerRef)}</cbc:BuyerReference>` : ''}
  ${inv.period ? `<cac:InvoicePeriod><cbc:StartDate>${inv.period[0]}</cbc:StartDate><cbc:EndDate>${inv.period[1]}</cbc:EndDate></cac:InvoicePeriod>` : ''}
  ${inv.orderRef ? `<cac:OrderReference><cbc:ID>${x(inv.orderRef)}</cbc:ID></cac:OrderReference>` : ''}
  ${(inv.attachments || []).map((a) => `<cac:AdditionalDocumentReference><cbc:ID>${x(a.id)}</cbc:ID><cbc:DocumentDescription>${x(a.desc)}</cbc:DocumentDescription><cac:Attachment><cbc:EmbeddedDocumentBinaryObject mimeCode="${a.mime}" filename="${x(a.filename)}">${a.base64}</cbc:EmbeddedDocumentBinaryObject></cac:Attachment></cac:AdditionalDocumentReference>`).join('')}
  <cac:AccountingSupplierParty>${ublParty(inv.seller)}</cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>${ublParty(inv.buyer)}</cac:AccountingCustomerParty>
  ${inv.deliveryDate ? `<cac:Delivery><cbc:ActualDeliveryDate>${inv.deliveryDate}</cbc:ActualDeliveryDate></cac:Delivery>` : ''}
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${inv.payment.code}</cbc:PaymentMeansCode>
    ${inv.payment.ref ? `<cbc:PaymentID>${x(inv.payment.ref)}</cbc:PaymentID>` : ''}
    <cac:PayeeFinancialAccount><cbc:ID>${inv.payment.iban}</cbc:ID>${inv.payment.name ? `<cbc:Name>${x(inv.payment.name)}</cbc:Name>` : ''}${inv.payment.bic ? `<cac:FinancialInstitutionBranch><cbc:ID>${inv.payment.bic}</cbc:ID></cac:FinancialInstitutionBranch>` : ''}</cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  ${inv.terms ? `<cac:PaymentTerms><cbc:Note>${x(inv.terms)}</cbc:Note></cac:PaymentTerms>` : ''}
  ${(inv.allowances || []).map((a) => `<cac:AllowanceCharge><cbc:ChargeIndicator>false</cbc:ChargeIndicator><cbc:AllowanceChargeReason>${x(a.reason)}</cbc:AllowanceChargeReason><cbc:Amount ${A()}>${amt(cents(a.amount))}</cbc:Amount><cac:TaxCategory><cbc:ID>${a.cat}</cbc:ID><cbc:Percent>${a.rate}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory></cac:AllowanceCharge>`).join('')}
  <cac:TaxTotal>
    <cbc:TaxAmount ${A()}>${amt(inv.taxC)}</cbc:TaxAmount>
    ${inv.vat.map((g) => `<cac:TaxSubtotal><cbc:TaxableAmount ${A()}>${amt(g.baseC)}</cbc:TaxableAmount><cbc:TaxAmount ${A()}>${amt(g.taxC)}</cbc:TaxAmount><cac:TaxCategory><cbc:ID>${g.cat}</cbc:ID><cbc:Percent>${g.rate}</cbc:Percent>${g.reasonCode ? `<cbc:TaxExemptionReasonCode>${g.reasonCode}</cbc:TaxExemptionReasonCode>` : ''}${g.reason ? `<cbc:TaxExemptionReason>${x(g.reason)}</cbc:TaxExemptionReason>` : ''}<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>`).join('\n    ')}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount ${A()}>${amt(lineSum)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount ${A()}>${amt(inv.exclC)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount ${A()}>${amt(inv.inclC)}</cbc:TaxInclusiveAmount>
    ${inv.allowC ? `<cbc:AllowanceTotalAmount ${A()}>${amt(inv.allowC)}</cbc:AllowanceTotalAmount>` : ''}
    ${inv.prepaidC ? `<cbc:PrepaidAmount ${A()}>${amt(inv.prepaidC)}</cbc:PrepaidAmount>` : ''}
    <cbc:PayableAmount ${A()}>${amt(inv.dueC)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${inv.lines.map((l) => `<cac:InvoiceLine>
    <cbc:ID>${l.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${l.unit}">${l.qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount ${A()}>${amt(l.netC)}</cbc:LineExtensionAmount>
    <cac:Item>${l.desc ? `<cbc:Description>${x(l.desc)}</cbc:Description>` : ''}<cbc:Name>${x(l.name)}</cbc:Name>${l.sku ? `<cac:SellersItemIdentification><cbc:ID>${x(l.sku)}</cbc:ID></cac:SellersItemIdentification>` : ''}<cac:ClassifiedTaxCategory><cbc:ID>${l.cat}</cbc:ID><cbc:Percent>${l.rate}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory></cac:Item>
    <cac:Price><cbc:PriceAmount ${A()}>${l.price.toFixed(2)}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>`).join('\n  ')}
</ubl:Invoice>
`;
}

/* ---------------- CII ---------------- */
function ciiParty(tag, p) {
  return `<ram:${tag}>
        ${p.id ? `<ram:ID>${x(p.id)}</ram:ID>` : ''}
        <ram:Name>${x(p.name)}</ram:Name>
        ${p.contact ? `<ram:DefinedTradeContact>${p.contact.name ? `<ram:PersonName>${x(p.contact.name)}</ram:PersonName>` : ''}${p.contact.phone ? `<ram:TelephoneUniversalCommunication><ram:CompleteNumber>${x(p.contact.phone)}</ram:CompleteNumber></ram:TelephoneUniversalCommunication>` : ''}${p.contact.email ? `<ram:EmailURIUniversalCommunication><ram:URIID>${x(p.contact.email)}</ram:URIID></ram:EmailURIUniversalCommunication>` : ''}</ram:DefinedTradeContact>` : ''}
        <ram:PostalTradeAddress>${p.zip !== undefined ? `<ram:PostcodeCode>${x(p.zip)}</ram:PostcodeCode>` : ''}<ram:LineOne>${x(p.street)}</ram:LineOne>${p.city !== undefined ? `<ram:CityName>${x(p.city)}</ram:CityName>` : ''}<ram:CountryID>${x(p.country || 'DE')}</ram:CountryID></ram:PostalTradeAddress>
        ${p.endpoint ? `<ram:URIUniversalCommunication><ram:URIID schemeID="${x(p.endpoint[0])}">${x(p.endpoint[1])}</ram:URIID></ram:URIUniversalCommunication>` : ''}
        ${p.vatId ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${x(p.vatId)}</ram:ID></ram:SpecifiedTaxRegistration>` : ''}
        ${p.taxId ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="FC">${x(p.taxId)}</ram:ID></ram:SpecifiedTaxRegistration>` : ''}
      </ram:${tag}>`;
}

export function toCII(raw, opt = {}) {
  const inv = compute(raw);
  const c = inv.currency || 'EUR';
  const minimal = opt.minimal; // MINIMUM/BASIC WL: keine Positionen
  const d = (iso) => `<udt:DateTimeString format="102">${ymd(iso)}</udt:DateTimeString>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    ${opt.noProcess ? '' : `<ram:BusinessProcessSpecifiedDocumentContextParameter><ram:ID>${PEPPOL_PROC}</ram:ID></ram:BusinessProcessSpecifiedDocumentContextParameter>`}
    <ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>${x(inv.spec || XR)}</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${x(inv.number)}</ram:ID>
    <ram:TypeCode>${inv.typeCode || '380'}</ram:TypeCode>
    <ram:IssueDateTime>${d(inv.issueDate)}</ram:IssueDateTime>
    ${(inv.notes || []).map((n) => `<ram:IncludedNote><ram:Content>${x(n)}</ram:Content></ram:IncludedNote>`).join('')}
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    ${minimal ? '' : inv.lines.map((l) => `<ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument><ram:LineID>${l.id}</ram:LineID></ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>${l.sku ? `<ram:SellerAssignedID>${x(l.sku)}</ram:SellerAssignedID>` : ''}<ram:Name>${x(l.name)}</ram:Name>${l.desc ? `<ram:Description>${x(l.desc)}</ram:Description>` : ''}</ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement><ram:NetPriceProductTradePrice><ram:ChargeAmount>${l.price.toFixed(2)}</ram:ChargeAmount></ram:NetPriceProductTradePrice></ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="${l.unit}">${l.qty}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>${l.cat}</ram:CategoryCode><ram:RateApplicablePercent>${l.rate}</ram:RateApplicablePercent></ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${amt(l.netC)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`).join('\n    ')}
    <ram:ApplicableHeaderTradeAgreement>
      ${inv.buyerRef ? `<ram:BuyerReference>${x(inv.buyerRef)}</ram:BuyerReference>` : ''}
      ${ciiParty('SellerTradeParty', inv.seller)}
      ${ciiParty('BuyerTradeParty', inv.buyer)}
      ${inv.orderRef ? `<ram:BuyerOrderReferencedDocument><ram:IssuerAssignedID>${x(inv.orderRef)}</ram:IssuerAssignedID></ram:BuyerOrderReferencedDocument>` : ''}
      ${(inv.attachments || []).map((a) => `<ram:AdditionalReferencedDocument><ram:IssuerAssignedID>${x(a.id)}</ram:IssuerAssignedID><ram:TypeCode>916</ram:TypeCode><ram:Name>${x(a.desc)}</ram:Name><ram:AttachmentBinaryObject mimeCode="${a.mime}" filename="${x(a.filename)}">${a.base64}</ram:AttachmentBinaryObject></ram:AdditionalReferencedDocument>`).join('')}
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>${inv.deliveryDate ? `<ram:ActualDeliverySupplyChainEvent><ram:OccurrenceDateTime>${d(inv.deliveryDate)}</ram:OccurrenceDateTime></ram:ActualDeliverySupplyChainEvent>` : ''}</ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
      ${inv.payment.ref ? `<ram:PaymentReference>${x(inv.payment.ref)}</ram:PaymentReference>` : ''}
      <ram:InvoiceCurrencyCode>${c}</ram:InvoiceCurrencyCode>
      ${minimal ? '' : `<ram:SpecifiedTradeSettlementPaymentMeans><ram:TypeCode>${inv.payment.code}</ram:TypeCode><ram:PayeePartyCreditorFinancialAccount><ram:IBANID>${inv.payment.iban}</ram:IBANID>${inv.payment.name ? `<ram:AccountName>${x(inv.payment.name)}</ram:AccountName>` : ''}</ram:PayeePartyCreditorFinancialAccount>${inv.payment.bic ? `<ram:PayeeSpecifiedCreditorFinancialInstitution><ram:BICID>${inv.payment.bic}</ram:BICID></ram:PayeeSpecifiedCreditorFinancialInstitution>` : ''}</ram:SpecifiedTradeSettlementPaymentMeans>`}
      ${inv.vat.map((g) => `<ram:ApplicableTradeTax><ram:CalculatedAmount>${amt(g.taxC)}</ram:CalculatedAmount><ram:TypeCode>VAT</ram:TypeCode>${g.reason ? `<ram:ExemptionReason>${x(g.reason)}</ram:ExemptionReason>` : ''}<ram:BasisAmount>${amt(g.baseC)}</ram:BasisAmount><ram:CategoryCode>${g.cat}</ram:CategoryCode>${g.reasonCode ? `<ram:ExemptionReasonCode>${g.reasonCode}</ram:ExemptionReasonCode>` : ''}<ram:RateApplicablePercent>${g.rate}</ram:RateApplicablePercent></ram:ApplicableTradeTax>`).join('\n      ')}
      ${inv.period ? `<ram:BillingSpecifiedPeriod><ram:StartDateTime>${d(inv.period[0])}</ram:StartDateTime><ram:EndDateTime>${d(inv.period[1])}</ram:EndDateTime></ram:BillingSpecifiedPeriod>` : ''}
      ${(inv.allowances || []).map((a) => `<ram:SpecifiedTradeAllowanceCharge><ram:ChargeIndicator><udt:Indicator>false</udt:Indicator></ram:ChargeIndicator><ram:ActualAmount>${amt(cents(a.amount))}</ram:ActualAmount><ram:Reason>${x(a.reason)}</ram:Reason><ram:CategoryTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>${a.cat}</ram:CategoryCode><ram:RateApplicablePercent>${a.rate}</ram:RateApplicablePercent></ram:CategoryTradeTax></ram:SpecifiedTradeAllowanceCharge>`).join('')}
      ${inv.terms || inv.dueDate ? `<ram:SpecifiedTradePaymentTerms>${inv.terms ? `<ram:Description>${x(inv.terms)}</ram:Description>` : ''}${inv.dueDate ? `<ram:DueDateDateTime>${d(inv.dueDate)}</ram:DueDateDateTime>` : ''}</ram:SpecifiedTradePaymentTerms>` : ''}
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        ${minimal ? '' : `<ram:LineTotalAmount>${amt(inv.lineC)}</ram:LineTotalAmount>`}
        ${inv.allowC ? `<ram:AllowanceTotalAmount>${amt(inv.allowC)}</ram:AllowanceTotalAmount>` : ''}
        <ram:TaxBasisTotalAmount>${amt(inv.exclC)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${c}">${amt(inv.taxC)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${amt(inv.inclC)}</ram:GrandTotalAmount>
        ${inv.prepaidC ? `<ram:TotalPrepaidAmount>${amt(inv.prepaidC)}</ram:TotalPrepaidAmount>` : ''}
        <ram:DuePayableAmount>${amt(inv.dueC)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`;
}

/* ---------------- Daten ---------------- */
const SELLER = {
  name: 'Musterfirma Labordienst Beispiel GmbH',
  street: 'Erfundene Straße 1',
  zip: '12345',
  city: 'Musterstadt',
  country: 'DE',
  vatId: 'DE123456789',
  endpoint: ['EM', 'rechnung@labordienst.example'],
  contact: { name: 'Erika Beispiel', phone: '+49 123 456789-0', email: 'buchhaltung@labordienst.example' },
};
const BUYER = {
  name: 'Tierarztpraxis Dr. Max Mustermann (erfunden)',
  street: 'Beispielweg 7',
  zip: '54321',
  city: 'Beispielhausen',
  country: 'DE',
  endpoint: ['EM', 'praxis@tierarzt.example'],
};
const PAYMENT = { code: '58', iban: 'DE79000000001234567890', name: 'Musterfirma Labordienst Beispiel GmbH', ref: 'RE-2026-0815' };

export function baseInvoice(overrides = {}) {
  return {
    number: 'RE-2026-0815',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    currency: 'EUR',
    buyerRef: 'KD-4711',
    period: ['2026-09-01', '2026-09-30'],
    notes: ['BEISPIELRECHNUNG – frei erfunden, keine echte Rechnung.'],
    seller: SELLER,
    buyer: BUYER,
    payment: PAYMENT,
    terms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
    lines: [
      { id: '1', name: 'Blutbild groß (Labor)', desc: 'Probe vom 03.09.2026, Patient „Bello“', qty: 3, unit: 'C62', price: 24.5, cat: 'S', rate: 19, sku: 'LAB-100' },
      { id: '2', name: 'Kurierfahrt Probenabholung', qty: 2, unit: 'C62', price: 18, cat: 'S', rate: 19, sku: 'KUR-01' },
      { id: '3', name: 'Befundbericht, ausführlich', qty: 1.5, unit: 'HUR', price: 60, cat: 'S', rate: 19 },
    ],
    ...overrides,
  };
}

/* ---------------- ZUGFeRD-PDF ---------------- */
function xmp(conformance, fileName = 'factur-x.xml') {
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"><pdfaid:part>3</pdfaid:part><pdfaid:conformance>B</pdfaid:conformance></rdf:Description>
<rdf:Description rdf:about="" xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#"><fx:DocumentType>INVOICE</fx:DocumentType><fx:DocumentFileName>${fileName}</fx:DocumentFileName><fx:Version>1.0</fx:Version><fx:ConformanceLevel>${conformance}</fx:ConformanceLevel></rdf:Description>
</rdf:RDF></x:xmpmeta>
<?xpacket end="w"?>`;
}

export async function makePdf({ title, lines, xml, conformance, attachName = 'factur-x.xml', extraAttachment }) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setCreationDate(new Date('2026-10-01T10:00:00Z'));
  doc.setModificationDate(new Date('2026-10-01T10:00:00Z'));
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawText(title, { x: 50, y: 780, size: 18, font: bold, color: rgb(0.1, 0.1, 0.1) });
  lines.forEach((l, i) => page.drawText(l, { x: 50, y: 750 - i * 16, size: 10, font }));
  if (xml) {
    await doc.attach(new TextEncoder().encode(xml), attachName, {
      mimeType: 'text/xml',
      description: 'Rechnungsdaten (frei erfunden)',
      afRelationship: AFRelationship.Data,
      creationDate: new Date('2026-10-01T10:00:00Z'),
      modificationDate: new Date('2026-10-01T10:00:00Z'),
    });
  }
  if (extraAttachment) {
    await doc.attach(extraAttachment.bytes, extraAttachment.name, { mimeType: extraAttachment.mime, description: extraAttachment.desc, afRelationship: AFRelationship.Supplement });
  }
  if (conformance) {
    const meta = doc.context.stream(new TextEncoder().encode(xmp(conformance, attachName)), { Type: 'Metadata', Subtype: 'XML' });
    doc.catalog.set(PDFName.of('Metadata'), doc.context.register(meta));
  }
  doc.catalog.set(PDFName.of('Lang'), PDFString.of('de-DE'));
  return doc.save({ useObjectStreams: false });
}

const visual = (inv) => {
  const c = compute(inv);
  return [
    `Rechnung ${inv.number} vom ${inv.issueDate.split('-').reverse().join('.')}`,
    `${inv.seller.name}, ${inv.seller.street}, ${inv.seller.zip} ${inv.seller.city}`,
    `an: ${inv.buyer.name}`,
    ...c.lines.slice(0, 20).map((l) => `${l.id}  ${l.name}  ${l.qty} x ${l.price.toFixed(2)} EUR = ${amt(l.netC)} EUR`),
    `Gesamt brutto: ${amt(c.inclC)} EUR`,
    'BEISPIELRECHNUNG – frei erfunden.',
  ];
};

/* ---------------- Ausgabe ---------------- */
function write(name, content, sample) {
  fs.writeFileSync(path.join(OUT, name), content);
  if (sample) fs.writeFileSync(path.join(SAMPLES, sample), content);
}

async function main() {
  const inv = baseInvoice();
  write('xrechnung-ubl.xml', toUBL(inv), 'beispiel-xrechnung-ubl.xml');
  write('xrechnung-cii.xml', toCII(baseInvoice({ number: 'RE-2026-0816' })), 'beispiel-xrechnung-cii.xml');

  // Umlaute und Sonderzeichen
  write('umlaute-sonderzeichen.xml', toUBL(baseInvoice({
    number: 'RE-2026-ÄÖÜ-1',
    seller: { ...SELLER, name: 'Größenwahn & Söhne Prüflabor GmbH (erfunden)', street: 'Äußere Weißenburger Straße 5', city: 'Übelbach-Süd' },
    buyer: { ...BUYER, name: 'Zahnarztpraxis Dr. Jürgen Weiß & Łucja Kowalczyk (erfunden)', city: 'Köln' },
    notes: ['Sonderzeichen-Test: „Anführungszeichen“, ‚einfach‘, Gedankenstrich – Euro € Paragraph § Grad ° ½ <spitze Klammern> & "gerade" \'Apostroph\' ß ẞ é è ñ č ř ő'],
    lines: [
      { id: '1', name: 'Prüfung „Härtegrad“ – Größe XL (Ø 12 mm)', desc: 'Müller-Thurgau & Söhne, Fußnote: § 14 UStG', qty: 2, unit: 'C62', price: 49.99, cat: 'S', rate: 19 },
      { id: '2', name: 'Straßenkehrmaschine Ölwechsel <Spezial>', qty: 1, unit: 'C62', price: 120, cat: 'S', rate: 19 },
    ],
  })));

  // Mehrere Steuersätze inkl. steuerbefreiter Position
  write('mehrere-steuersaetze.xml', toUBL(baseInvoice({
    number: 'RE-2026-0900',
    lines: [
      { id: '1', name: 'Futtermittel Spezialdiät', qty: 4, unit: 'KGM', price: 12.9, cat: 'S', rate: 7 },
      { id: '2', name: 'Röntgenschürze', qty: 1, unit: 'C62', price: 249, cat: 'S', rate: 19 },
      { id: '3', name: 'Fortbildungsgebühr (steuerbefreit)', qty: 1, unit: 'C62', price: 150, cat: 'E', rate: 0, reason: 'Steuerfrei nach § 4 Nr. 21 UStG (erfundenes Beispiel)' },
    ],
    allowances: [{ reason: 'Treuerabatt', amount: 10, cat: 'S', rate: 19 }],
  })));
  write('mehrere-steuersaetze-cii.xml', toCII(baseInvoice({
    number: 'RE-2026-0901',
    lines: [
      { id: '1', name: 'Futtermittel Spezialdiät', qty: 4, unit: 'KGM', price: 12.9, cat: 'S', rate: 7 },
      { id: '2', name: 'Röntgenschürze', qty: 1, unit: 'C62', price: 249, cat: 'S', rate: 19 },
    ],
  })));

  // Mit Anhang (kleine PDF)
  const attPdf = await makePdf({ title: 'Anlage: Leistungsnachweis (erfunden)', lines: ['Dies ist ein erfundener Leistungsnachweis.', 'Positionen siehe Rechnung RE-2026-0950.'] });
  const att = { id: 'Anlage-1', desc: 'Leistungsnachweis September', filename: 'leistungsnachweis.pdf', mime: 'application/pdf', base64: Buffer.from(attPdf).toString('base64') };
  write('mit-anhang.xml', toUBL(baseInvoice({ number: 'RE-2026-0950', attachments: [att] })));
  write('mit-anhang-cii.xml', toCII(baseInvoice({ number: 'RE-2026-0951', attachments: [att] })));

  // Absichtliche Fehler: falsche Summe (BR-CO-10) und fehlende Pflichtangabe (BR-DE-15, BR-DE-6)
  const bad = baseInvoice({ number: 'RE-2026-FEHLER', buyerRef: '', seller: { ...SELLER, contact: { name: 'Erika Beispiel', email: 'buchhaltung@labordienst.example' } } });
  write('fehlerhaft.xml', toUBL(bad, { lineSumOverrideC: compute(bad).lineC + 1000 }), 'beispiel-mit-fehlern.xml');
  write('fehlerhaft-cii.xml', toCII(baseInvoice({ number: 'RE-2026-FEHLER-CII', buyerRef: '' }), { noProcess: true }));

  // Kaputte XML
  write('kaputt.xml', toUBL(inv).slice(0, 1800) + '\n<cbc:Note>abgebrochen');

  // Sehr große Rechnung mit 2.000 Positionen
  const many = Array.from({ length: 2000 }, (_, i) => ({ id: String(i + 1), name: `Laborparameter Nr. ${i + 1} – Ölprobe Größe ${(i % 5) + 1}`, qty: (i % 7) + 1, unit: 'C62', price: 1 + (i % 50) / 4, cat: 'S', rate: i % 3 === 0 ? 7 : 19 }));
  write('gross-2000.xml', toUBL(baseInvoice({ number: 'RE-2026-2000', lines: many })));

  // ZUGFeRD / Factur-X in verschiedenen Profilen
  const zf = async (file, spec, conformance, opt = {}, sample) => {
    const data = baseInvoice({ number: `ZF-${conformance.replace(/\s/g, '')}`, spec, ...opt.inv });
    const xml = toCII(data, opt.cii || {});
    const pdf = await makePdf({ title: `Rechnung ${data.number} (Beispiel, ZUGFeRD ${conformance})`, lines: visual(data), xml, conformance, attachName: opt.attachName });
    write(file, pdf, sample);
  };
  await zf('zugferd-en16931.pdf', IDS.en16931, 'EN 16931', {}, 'beispiel-zugferd-en16931.pdf');
  await zf('zugferd-basic.pdf', IDS.basic, 'BASIC');
  await zf('zugferd-extended.pdf', IDS.extended, 'EXTENDED');
  await zf('zugferd-xrechnung.pdf', IDS.xrechnung, 'XRECHNUNG', { attachName: 'xrechnung.xml' });
  await zf('zugferd-minimum.pdf', IDS.minimum, 'MINIMUM', { cii: { minimal: true, noProcess: true } });
  await zf('zugferd-basicwl.pdf', IDS.basicwl, 'BASIC WL', { cii: { minimal: true, noProcess: true } });

  // Normale PDF ohne Rechnungsdaten
  write('normale-rechnung.pdf', await makePdf({ title: 'Rechnung 2026-17 (normale PDF, erfunden)', lines: visual(inv) }));

  // ZUGFeRD mit zusätzlichem Anhang
  const zfAtt = baseInvoice({ number: 'ZF-ANHANG', spec: IDS.en16931 });
  write('zugferd-mit-anhang.pdf', await makePdf({ title: 'Rechnung ZF-ANHANG (Beispiel)', lines: visual(zfAtt), xml: toCII(zfAtt), conformance: 'EN 16931', extraAttachment: { bytes: attPdf, name: 'leistungsnachweis.pdf', mime: 'application/pdf', desc: 'Leistungsnachweis' } }));

  console.log('Testrechnungen erzeugt:', fs.readdirSync(OUT).length, 'Dateien;', 'Beispiele:', fs.readdirSync(SAMPLES).join(', '));
}

main();
