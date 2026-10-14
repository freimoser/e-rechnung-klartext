// Liest XRechnung/EN-16931-Rechnungen in UBL 2.1 und UN/CEFACT CII D16B in ein gemeinsames Modell.
// Die Zuordnung Syntax → Business Term (BT/BG) folgt der KoSIT-Referenz „XRechnung Visualization“
// (ubl-invoice-xr.xsl, cii-xr.xsl, Release 2026-08-31).
import { kid, kids, at, all, F, A, v } from './xml.js';

export const NS = {
  UBL_INVOICE: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  UBL_CREDITNOTE: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
  CII: 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
  ZUGFERD1: 'urn:ferd:CrossIndustryDocument:invoice:1p0',
};

// Erkennt Syntax und Dokumentart am Wurzelelement
export function detectSyntax(doc) {
  const root = doc.documentElement;
  const ns = root.namespaceURI;
  if (root.localName === 'Invoice' && ns === NS.UBL_INVOICE) return { syntax: 'UBL', docType: 'invoice' };
  if (root.localName === 'CreditNote' && ns === NS.UBL_CREDITNOTE) return { syntax: 'UBL', docType: 'creditnote' };
  if (root.localName === 'CrossIndustryInvoice' && ns === NS.CII) return { syntax: 'CII', docType: 'invoice' };
  if (root.localName === 'CrossIndustryDocument' && ns === NS.ZUGFERD1) return { syntax: 'ZUGFeRD1', docType: 'invoice' };
  return { syntax: 'unknown', docType: null, rootName: root.localName, rootNs: ns };
}

// Datum vereinheitlichen: liefert ISO-Datum (JJJJ-MM-TT) oder den Originaltext
export function isoDate(field) {
  if (!field) return null;
  const s = field.v;
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return { ...field, iso: s };
  m = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (m) return { ...field, iso: `${m[1]}-${m[2]}-${m[3]}` };
  return { ...field, iso: null };
}

function scheme(field, attr = 'schemeID') {
  if (!field) return null;
  return { ...field, scheme: field.el.getAttribute(attr) || '' };
}

function amount(el) {
  const f = F(el);
  if (!f) return null;
  return { ...f, currency: el.getAttribute('currencyID') || '' };
}

function emptyAddress() {
  return { line1: null, line2: null, line3: null, city: null, zip: null, region: null, country: null };
}

/* ---------------- UBL ---------------- */

function ublAddress(addr) {
  if (!addr) return null;
  return {
    el: addr,
    line1: F(kid(addr, 'StreetName')),
    line2: F(kid(addr, 'AdditionalStreetName')),
    line3: F(at(addr, 'AddressLine/Line')),
    city: F(kid(addr, 'CityName')),
    zip: F(kid(addr, 'PostalZone')),
    region: F(kid(addr, 'CountrySubentity')),
    country: F(at(addr, 'Country/IdentificationCode')),
  };
}

function ublTaxIds(party) {
  let vat = null;
  let other = null;
  for (const pts of kids(party, 'PartyTaxScheme')) {
    const id = (v(F(at(pts, 'TaxScheme/ID'))) || '').toUpperCase();
    const comp = F(kid(pts, 'CompanyID'));
    if (id === 'VAT') vat = vat || comp;
    else other = other || comp;
  }
  return { vat, other };
}

function ublParty(wrapper, isSeller) {
  const party = kid(wrapper, 'Party') || wrapper;
  if (!party) return null;
  const tax = ublTaxIds(party);
  const ids = kids(party, 'PartyIdentification').map((pi) => scheme(F(kid(pi, 'ID')))).filter(Boolean);
  const contact = kid(party, 'Contact');
  return {
    el: party,
    name: F(at(party, 'PartyLegalEntity/RegistrationName')),
    tradingName: F(at(party, 'PartyName/Name')),
    ids: ids.filter((x) => x.scheme !== 'SEPA'),
    sepaId: ids.find((x) => x.scheme === 'SEPA') || null,
    legalId: scheme(F(at(party, 'PartyLegalEntity/CompanyID'))),
    vatId: tax.vat,
    taxId: tax.other,
    legalInfo: isSeller ? F(at(party, 'PartyLegalEntity/CompanyLegalForm')) : null,
    endpoint: scheme(F(kid(party, 'EndpointID'))),
    address: ublAddress(kid(party, 'PostalAddress')),
    contact: contact ? {
      el: contact,
      name: F(kid(contact, 'Name')),
      phone: F(kid(contact, 'Telephone')),
      email: F(kid(contact, 'ElectronicMail')),
    } : null,
  };
}

function ublAllowanceCharge(ac) {
  const isCharge = v(F(kid(ac, 'ChargeIndicator'))).toLowerCase() === 'true';
  const cat = kid(ac, 'TaxCategory');
  return {
    el: ac,
    isCharge,
    amount: amount(kid(ac, 'Amount')),
    base: amount(kid(ac, 'BaseAmount')),
    percent: F(kid(ac, 'MultiplierFactorNumeric')),
    vatCat: F(kid(cat, 'ID')),
    vatRate: F(kid(cat, 'Percent')),
    reason: F(kid(ac, 'AllowanceChargeReason')),
    reasonCode: F(kid(ac, 'AllowanceChargeReasonCode')),
  };
}

function ublLine(line, docType) {
  const qtyEl = kid(line, docType === 'creditnote' ? 'CreditedQuantity' : 'InvoicedQuantity') || kid(line, 'InvoicedQuantity');
  const item = kid(line, 'Item');
  const price = kid(line, 'Price');
  const priceAc = kid(price, 'AllowanceCharge');
  const period = kid(line, 'InvoicePeriod');
  const acs = kids(line, 'AllowanceCharge').map(ublAllowanceCharge);
  const objRef = kids(line, 'DocumentReference').find((d) => v(F(kid(d, 'DocumentTypeCode'))) === '130');
  return {
    el: line,
    id: F(kid(line, 'ID')),
    note: F(kid(line, 'Note')),
    objectId: objRef ? scheme(F(kid(objRef, 'ID'))) : null,
    qty: F(qtyEl),
    unit: A(qtyEl, 'unitCode'),
    net: amount(kid(line, 'LineExtensionAmount')),
    orderLineRef: F(at(line, 'OrderLineReference/LineID')),
    accounting: F(kid(line, 'AccountingCost')),
    period: period ? { el: period, start: isoDate(F(kid(period, 'StartDate'))), end: isoDate(F(kid(period, 'EndDate'))) } : null,
    allowances: acs.filter((a) => !a.isCharge),
    charges: acs.filter((a) => a.isCharge),
    price: {
      el: price,
      net: amount(kid(price, 'PriceAmount')),
      discount: priceAc && v(F(kid(priceAc, 'ChargeIndicator'))).toLowerCase() === 'false' ? amount(kid(priceAc, 'Amount')) : null,
      gross: priceAc && v(F(kid(priceAc, 'ChargeIndicator'))).toLowerCase() === 'false' ? amount(kid(priceAc, 'BaseAmount')) : null,
      baseQty: F(kid(price, 'BaseQuantity')),
      baseUnit: A(kid(price, 'BaseQuantity'), 'unitCode'),
    },
    vatCat: F(at(item, 'ClassifiedTaxCategory/ID')),
    vatRate: F(at(item, 'ClassifiedTaxCategory/Percent')),
    name: F(kid(item, 'Name')),
    desc: F(kid(item, 'Description')),
    sellerItemId: F(at(item, 'SellersItemIdentification/ID')),
    buyerItemId: F(at(item, 'BuyersItemIdentification/ID')),
    stdId: scheme(F(at(item, 'StandardItemIdentification/ID'))),
    classifications: all(item, 'CommodityClassification/ItemClassificationCode').map((e) => scheme(F(e), 'listID')),
    origin: F(at(item, 'OriginCountry/IdentificationCode')),
    attributes: kids(item, 'AdditionalItemProperty').map((p) => ({ el: p, name: F(kid(p, 'Name')), value: F(kid(p, 'Value')) })),
    sub: kids(line, 'SubInvoiceLine').map((s) => ublLine(s, docType)),
  };
}

function parseUBL(doc, docType) {
  const r = doc.documentElement;
  const currency = v(F(kid(r, 'DocumentCurrencyCode')));
  const taxCurrency = v(F(kid(r, 'TaxCurrencyCode')));
  const taxTotals = kids(r, 'TaxTotal');
  let taxAmount = null;
  let taxAmountAcc = null;
  for (const tt of taxTotals) {
    const amt = amount(kid(tt, 'TaxAmount'));
    if (!amt) continue;
    if (amt.currency === currency && !taxAmount) taxAmount = amt;
    else if (taxCurrency && amt.currency === taxCurrency && !taxAmountAcc) taxAmountAcc = amt;
  }
  const lmt = kid(r, 'LegalMonetaryTotal');
  const delivery = kid(r, 'Delivery');
  const dLoc = kid(delivery, 'DeliveryLocation');
  const period = kid(r, 'InvoicePeriod');
  const payee = kid(r, 'PayeeParty');
  const taxRep = kid(r, 'TaxRepresentativeParty');
  const notes = kids(r, 'Note').map((n) => {
    const f = F(n);
    const m = /^#([A-Za-z]{3})#([\s\S]*)$/.exec(f.v);
    return m ? { el: n, subject: { v: m[1], el: n }, content: { v: m[2].trim(), el: n } } : { el: n, subject: null, content: f };
  });
  const addDocs = kids(r, 'AdditionalDocumentReference');
  const objDoc = addDocs.find((d) => v(F(kid(d, 'DocumentTypeCode'))) === '130');
  const docs = addDocs.filter((d) => d !== objDoc).map((d) => {
    const bin = at(d, 'Attachment/EmbeddedDocumentBinaryObject');
    return {
      el: d,
      id: F(kid(d, 'ID')),
      desc: F(kid(d, 'DocumentDescription')),
      uri: F(at(d, 'Attachment/ExternalReference/URI')),
      bin: bin ? { el: bin, mime: bin.getAttribute('mimeCode') || '', filename: bin.getAttribute('filename') || '', data: bin.textContent } : null,
    };
  });
  const sellerParty = ublParty(kid(r, 'AccountingSupplierParty'), true);
  const payeeParty = payee ? {
    el: payee,
    name: F(at(payee, 'PartyName/Name')),
    ids: kids(payee, 'PartyIdentification').map((pi) => scheme(F(kid(pi, 'ID')))).filter((x) => x && x.scheme !== 'SEPA'),
    sepaId: kids(payee, 'PartyIdentification').map((pi) => scheme(F(kid(pi, 'ID')))).find((x) => x && x.scheme === 'SEPA') || null,
    legalId: scheme(F(at(payee, 'PartyLegalEntity/CompanyID'))),
  } : null;
  const creditorId = (payeeParty && payeeParty.sepaId) || (sellerParty && sellerParty.sepaId) || null;
  const pms = kids(r, 'PaymentMeans').map((pm) => {
    const code = F(kid(pm, 'PaymentMeansCode'));
    return {
      el: pm,
      code,
      text: A(kid(pm, 'PaymentMeansCode'), 'name'),
      ref: F(kid(pm, 'PaymentID')),
      accounts: kids(pm, 'PayeeFinancialAccount').map((a) => ({
        el: a,
        iban: F(kid(a, 'ID')),
        name: F(kid(a, 'Name')),
        bic: F(at(a, 'FinancialInstitutionBranch/ID')),
      })),
      card: kid(pm, 'CardAccount') ? {
        el: kid(pm, 'CardAccount'),
        pan: F(at(pm, 'CardAccount/PrimaryAccountNumberID')),
        holder: F(at(pm, 'CardAccount/HolderName')),
      } : null,
      mandate: F(at(pm, 'PaymentMandate/ID')),
      debitedAccount: F(at(pm, 'PaymentMandate/PayerFinancialAccount/ID')),
      creditorId,
    };
  });
  const acs = kids(r, 'AllowanceCharge').map(ublAllowanceCharge);
  const lineName = docType === 'creditnote' ? 'CreditNoteLine' : 'InvoiceLine';
  const dueDate = F(kid(r, 'DueDate')) || F(at(r, 'PaymentMeans/PaymentDueDate'));
  return {
    syntax: 'UBL',
    docType,
    root: r,
    number: F(kid(r, 'ID')),
    issueDate: isoDate(F(kid(r, 'IssueDate'))),
    typeCode: F(kid(r, docType === 'creditnote' ? 'CreditNoteTypeCode' : 'InvoiceTypeCode')),
    currency: F(kid(r, 'DocumentCurrencyCode')),
    taxCurrency: F(kid(r, 'TaxCurrencyCode')),
    taxPointDate: isoDate(F(kid(r, 'TaxPointDate'))),
    taxPointCode: F(at(r, 'InvoicePeriod/DescriptionCode')),
    dueDate: isoDate(dueDate),
    buyerRef: F(kid(r, 'BuyerReference')),
    projectRef: F(at(r, 'ProjectReference/ID')),
    contractRef: F(at(r, 'ContractDocumentReference/ID')),
    orderRef: F(at(r, 'OrderReference/ID')),
    salesOrderRef: F(at(r, 'OrderReference/SalesOrderID')),
    receivingAdviceRef: F(at(r, 'ReceiptDocumentReference/ID')),
    despatchAdviceRef: F(at(r, 'DespatchDocumentReference/ID')),
    tenderRef: F(at(r, 'OriginatorDocumentReference/ID')),
    invoicedObject: objDoc ? scheme(F(kid(objDoc, 'ID'))) : null,
    buyerAccountingRef: F(kid(r, 'AccountingCost')),
    paymentTerms: kids(r, 'PaymentTerms').map((pt) => F(kid(pt, 'Note'))).filter(Boolean),
    notes,
    processId: F(kid(r, 'ProfileID')),
    specId: F(kid(r, 'CustomizationID')),
    preceding: all(r, 'BillingReference/InvoiceDocumentReference').map((d) => ({ el: d, id: F(kid(d, 'ID')), date: isoDate(F(kid(d, 'IssueDate'))) })),
    seller: sellerParty,
    buyer: ublParty(kid(r, 'AccountingCustomerParty'), false),
    payee: payeeParty,
    taxRep: taxRep ? {
      el: taxRep,
      name: F(at(taxRep, 'PartyName/Name')),
      vatId: ublTaxIds(taxRep).vat,
      address: ublAddress(kid(taxRep, 'PostalAddress')),
    } : null,
    delivery: delivery ? {
      el: delivery,
      name: F(at(delivery, 'DeliveryParty/PartyName/Name')),
      locationId: scheme(F(kid(dLoc, 'ID'))),
      date: isoDate(F(kid(delivery, 'ActualDeliveryDate'))),
      address: ublAddress(kid(dLoc, 'Address')),
    } : null,
    period: period ? { el: period, start: isoDate(F(kid(period, 'StartDate'))), end: isoDate(F(kid(period, 'EndDate'))) } : null,
    paymentMeans: pms,
    allowances: acs.filter((a) => !a.isCharge),
    charges: acs.filter((a) => a.isCharge),
    totals: lmt ? {
      el: lmt,
      lineNet: amount(kid(lmt, 'LineExtensionAmount')),
      allowances: amount(kid(lmt, 'AllowanceTotalAmount')),
      charges: amount(kid(lmt, 'ChargeTotalAmount')),
      taxExcl: amount(kid(lmt, 'TaxExclusiveAmount')),
      tax: taxAmount,
      taxAcc: taxAmountAcc,
      taxIncl: amount(kid(lmt, 'TaxInclusiveAmount')),
      prepaid: amount(kid(lmt, 'PrepaidAmount')),
      rounding: amount(kid(lmt, 'PayableRoundingAmount')),
      due: amount(kid(lmt, 'PayableAmount')),
    } : { el: null },
    vat: taxTotals.flatMap((tt) => kids(tt, 'TaxSubtotal')).map((st) => {
      const cat = kid(st, 'TaxCategory');
      return {
        el: st,
        base: amount(kid(st, 'TaxableAmount')),
        amount: amount(kid(st, 'TaxAmount')),
        cat: F(kid(cat, 'ID')),
        rate: F(kid(cat, 'Percent')),
        exReason: F(kid(cat, 'TaxExemptionReason')),
        exCode: F(kid(cat, 'TaxExemptionReasonCode')),
      };
    }),
    docs,
    lines: kids(r, lineName).map((l) => ublLine(l, docType)),
    // Rohzählungen für Regeln, die auf die Syntax selbst schauen
    raw: { taxTotals: taxTotals.length },
  };
}

/* ---------------- CII ---------------- */

function ciiDate(el) {
  return isoDate(F(el));
}

function ciiAddress(addr) {
  if (!addr) return null;
  return {
    el: addr,
    line1: F(kid(addr, 'LineOne')),
    line2: F(kid(addr, 'LineTwo')),
    line3: F(kid(addr, 'LineThree')),
    city: F(kid(addr, 'CityName')),
    zip: F(kid(addr, 'PostcodeCode')),
    region: F(kid(addr, 'CountrySubDivisionName')),
    country: F(kid(addr, 'CountryID')),
  };
}

function ciiParty(p, isSeller) {
  if (!p) return null;
  const regs = kids(p, 'SpecifiedTaxRegistration').map((t) => scheme(F(kid(t, 'ID'))));
  const contact = kid(p, 'DefinedTradeContact');
  const ids = [
    ...kids(p, 'ID').map((e) => scheme(F(e))),
    ...kids(p, 'GlobalID').map((e) => scheme(F(e))),
  ].filter(Boolean);
  return {
    el: p,
    name: F(kid(p, 'Name')),
    tradingName: F(at(p, 'SpecifiedLegalOrganization/TradingBusinessName')),
    ids,
    legalId: scheme(F(at(p, 'SpecifiedLegalOrganization/ID'))),
    vatId: regs.find((x) => x && (x.scheme === 'VA' || x.scheme === 'VAT')) || null,
    taxId: regs.find((x) => x && x.scheme === 'FC') || null,
    legalInfo: isSeller ? F(kid(p, 'Description')) : null,
    endpoint: scheme(F(at(p, 'URIUniversalCommunication/URIID'))),
    address: ciiAddress(kid(p, 'PostalTradeAddress')),
    contact: contact ? {
      el: contact,
      name: F(kid(contact, 'PersonName')) || F(kid(contact, 'DepartmentName')),
      department: F(kid(contact, 'DepartmentName')),
      phone: F(at(contact, 'TelephoneUniversalCommunication/CompleteNumber')),
      email: F(at(contact, 'EmailURIUniversalCommunication/URIID')),
    } : null,
  };
}

function ciiAllowanceCharge(ac) {
  const isCharge = v(F(at(ac, 'ChargeIndicator/Indicator'))).toLowerCase() === 'true';
  return {
    el: ac,
    isCharge,
    amount: amount(kid(ac, 'ActualAmount')),
    base: amount(kid(ac, 'BasisAmount')),
    percent: F(kid(ac, 'CalculationPercent')),
    vatCat: F(at(ac, 'CategoryTradeTax/CategoryCode')),
    vatRate: F(at(ac, 'CategoryTradeTax/RateApplicablePercent')),
    reason: F(kid(ac, 'Reason')),
    reasonCode: F(kid(ac, 'ReasonCode')),
  };
}

function ciiLine(li) {
  const doc = kid(li, 'AssociatedDocumentLineDocument');
  const prod = kid(li, 'SpecifiedTradeProduct');
  const agr = kid(li, 'SpecifiedLineTradeAgreement');
  const del = kid(li, 'SpecifiedLineTradeDelivery');
  const set = kid(li, 'SpecifiedLineTradeSettlement');
  const qtyEl = kid(del, 'BilledQuantity');
  const netP = kid(agr, 'NetPriceProductTradePrice');
  const grossP = kid(agr, 'GrossPriceProductTradePrice');
  const baseQtyEl = kid(netP, 'BasisQuantity') || kid(grossP, 'BasisQuantity');
  const period = kid(set, 'BillingSpecifiedPeriod');
  const acs = kids(set, 'SpecifiedTradeAllowanceCharge').map(ciiAllowanceCharge);
  const objRef = kids(set, 'AdditionalReferencedDocument').find((d) => v(F(kid(d, 'TypeCode'))) === '130');
  return {
    el: li,
    id: F(kid(doc, 'LineID')),
    parentId: F(kid(doc, 'ParentLineID')),
    note: F(at(doc, 'IncludedNote/Content')),
    objectId: objRef ? scheme(F(kid(objRef, 'IssuerAssignedID'))) : null,
    qty: F(qtyEl),
    unit: A(qtyEl, 'unitCode'),
    net: amount(at(set, 'SpecifiedTradeSettlementLineMonetarySummation/LineTotalAmount')),
    orderLineRef: F(at(agr, 'BuyerOrderReferencedDocument/LineID')),
    accounting: F(at(set, 'ReceivableSpecifiedTradeAccountingAccount/ID')),
    period: period ? { el: period, start: ciiDate(at(period, 'StartDateTime/DateTimeString')), end: ciiDate(at(period, 'EndDateTime/DateTimeString')) } : null,
    allowances: acs.filter((a) => !a.isCharge),
    charges: acs.filter((a) => a.isCharge),
    price: {
      el: netP,
      net: amount(kid(netP, 'ChargeAmount')),
      discount: amount(at(grossP, 'AppliedTradeAllowanceCharge/ActualAmount')),
      gross: amount(kid(grossP, 'ChargeAmount')),
      baseQty: F(baseQtyEl),
      baseUnit: A(baseQtyEl, 'unitCode'),
    },
    vatCat: F(at(set, 'ApplicableTradeTax/CategoryCode')),
    vatRate: F(at(set, 'ApplicableTradeTax/RateApplicablePercent')),
    name: F(kid(prod, 'Name')),
    desc: F(kid(prod, 'Description')),
    sellerItemId: F(kid(prod, 'SellerAssignedID')),
    buyerItemId: F(kid(prod, 'BuyerAssignedID')),
    stdId: scheme(F(kid(prod, 'GlobalID'))),
    classifications: all(prod, 'DesignatedProductClassification/ClassCode').map((e) => scheme(F(e), 'listID')),
    origin: F(at(prod, 'OriginTradeCountry/ID')),
    attributes: kids(prod, 'ApplicableProductCharacteristic').map((p) => ({ el: p, name: F(kid(p, 'Description')), value: F(kid(p, 'Value')) })),
    sub: [],
  };
}

function parseCII(doc) {
  const r = doc.documentElement;
  const ctx = kid(r, 'ExchangedDocumentContext');
  const ed = kid(r, 'ExchangedDocument');
  const tx = kid(r, 'SupplyChainTradeTransaction');
  const agr = kid(tx, 'ApplicableHeaderTradeAgreement');
  const del = kid(tx, 'ApplicableHeaderTradeDelivery');
  const set = kid(tx, 'ApplicableHeaderTradeSettlement');
  const sum = kid(set, 'SpecifiedTradeSettlementHeaderMonetarySummation');
  const currency = v(F(kid(set, 'InvoiceCurrencyCode')));
  const taxCurrency = v(F(kid(set, 'TaxCurrencyCode')));
  let taxAmount = null;
  let taxAmountAcc = null;
  for (const t of kids(sum, 'TaxTotalAmount')) {
    const a = amount(t);
    if (a.currency === currency && !taxAmount) taxAmount = a;
    else if (taxCurrency && a.currency === taxCurrency && !taxAmountAcc) taxAmountAcc = a;
    else if (!a.currency && !taxAmount) taxAmount = a;
  }
  const shipTo = kid(del, 'ShipToTradeParty');
  const actualDel = at(del, 'ActualDeliverySupplyChainEvent/OccurrenceDateTime/DateTimeString');
  const period = kid(set, 'BillingSpecifiedPeriod');
  const terms = kids(set, 'SpecifiedTradePaymentTerms');
  const addDocs = kids(agr, 'AdditionalReferencedDocument');
  const typeOf = (d) => v(F(kid(d, 'TypeCode')));
  const payee = kid(set, 'PayeeTradeParty');
  const taxRep = kid(agr, 'SellerTaxRepresentativeTradeParty');
  const applicableTax = kids(set, 'ApplicableTradeTax');
  const acs = kids(set, 'SpecifiedTradeAllowanceCharge').map(ciiAllowanceCharge);
  const creditorId = F(kid(set, 'CreditorReferenceID'));
  const mandate = terms.map((t) => F(kid(t, 'DirectDebitMandateID'))).find(Boolean) || null;
  return {
    syntax: 'CII',
    docType: 'invoice',
    root: r,
    number: F(kid(ed, 'ID')),
    issueDate: ciiDate(at(ed, 'IssueDateTime/DateTimeString')),
    typeCode: F(kid(ed, 'TypeCode')),
    currency: F(kid(set, 'InvoiceCurrencyCode')),
    taxCurrency: F(kid(set, 'TaxCurrencyCode')),
    taxPointDate: applicableTax.map((t) => ciiDate(at(t, 'TaxPointDate/DateString'))).find(Boolean) || null,
    taxPointCode: applicableTax.map((t) => F(kid(t, 'DueDateTypeCode'))).find(Boolean) || null,
    dueDate: terms.map((t) => ciiDate(at(t, 'DueDateDateTime/DateTimeString'))).find(Boolean) || null,
    buyerRef: F(kid(agr, 'BuyerReference')),
    projectRef: F(at(agr, 'SpecifiedProcuringProject/ID')),
    contractRef: F(at(agr, 'ContractReferencedDocument/IssuerAssignedID')),
    orderRef: F(at(agr, 'BuyerOrderReferencedDocument/IssuerAssignedID')),
    salesOrderRef: F(at(agr, 'SellerOrderReferencedDocument/IssuerAssignedID')),
    receivingAdviceRef: F(at(del, 'ReceivingAdviceReferencedDocument/IssuerAssignedID')),
    despatchAdviceRef: F(at(del, 'DespatchAdviceReferencedDocument/IssuerAssignedID')),
    tenderRef: (() => { const d = addDocs.find((x) => typeOf(x) === '50'); return d ? F(kid(d, 'IssuerAssignedID')) : null; })(),
    invoicedObject: (() => { const d = addDocs.find((x) => typeOf(x) === '130'); return d ? scheme(F(kid(d, 'IssuerAssignedID')), 'schemeID') : null; })(),
    buyerAccountingRef: F(at(set, 'ReceivableSpecifiedTradeAccountingAccount/ID')),
    paymentTerms: terms.map((t) => F(kid(t, 'Description'))).filter(Boolean),
    notes: kids(ed, 'IncludedNote').map((n) => ({ el: n, subject: F(kid(n, 'SubjectCode')), content: F(kid(n, 'Content')) })),
    processId: F(at(ctx, 'BusinessProcessSpecifiedDocumentContextParameter/ID')),
    specId: F(at(ctx, 'GuidelineSpecifiedDocumentContextParameter/ID')),
    preceding: kids(set, 'InvoiceReferencedDocument').map((d) => ({ el: d, id: F(kid(d, 'IssuerAssignedID')), date: ciiDate(at(d, 'FormattedIssueDateTime/DateTimeString')) })),
    seller: ciiParty(kid(agr, 'SellerTradeParty'), true),
    buyer: ciiParty(kid(agr, 'BuyerTradeParty'), false),
    payee: payee ? {
      el: payee,
      name: F(kid(payee, 'Name')),
      ids: [...kids(payee, 'ID'), ...kids(payee, 'GlobalID')].map((e) => scheme(F(e))),
      legalId: scheme(F(at(payee, 'SpecifiedLegalOrganization/ID'))),
    } : null,
    taxRep: taxRep ? {
      el: taxRep,
      name: F(kid(taxRep, 'Name')),
      vatId: F(at(taxRep, 'SpecifiedTaxRegistration/ID')),
      address: ciiAddress(kid(taxRep, 'PostalTradeAddress')),
    } : null,
    delivery: (shipTo || actualDel) ? {
      el: shipTo || actualDel,
      name: F(kid(shipTo, 'Name')),
      locationId: scheme(F(kid(shipTo, 'GlobalID')) || F(kid(shipTo, 'ID'))),
      date: ciiDate(actualDel),
      address: ciiAddress(kid(shipTo, 'PostalTradeAddress')),
    } : null,
    period: period ? { el: period, start: ciiDate(at(period, 'StartDateTime/DateTimeString')), end: ciiDate(at(period, 'EndDateTime/DateTimeString')) } : null,
    paymentMeans: kids(set, 'SpecifiedTradeSettlementPaymentMeans').map((pm) => {
      const acc = kids(pm, 'PayeePartyCreditorFinancialAccount');
      const card = kid(pm, 'ApplicableTradeSettlementFinancialCard');
      return {
        el: pm,
        code: F(kid(pm, 'TypeCode')),
        text: F(kid(pm, 'Information')),
        ref: F(kid(set, 'PaymentReference')),
        accounts: acc.map((a) => ({
          el: a,
          iban: F(kid(a, 'IBANID')) || F(kid(a, 'ProprietaryID')),
          name: F(kid(a, 'AccountName')),
          bic: F(at(pm, 'PayeeSpecifiedCreditorFinancialInstitution/BICID')),
        })),
        card: card ? { el: card, pan: F(kid(card, 'ID')), holder: F(kid(card, 'CardholderName')) } : null,
        mandate,
        debitedAccount: F(at(pm, 'PayerPartyDebtorFinancialAccount/IBANID')),
        creditorId,
      };
    }),
    allowances: acs.filter((a) => !a.isCharge),
    charges: acs.filter((a) => a.isCharge),
    totals: sum ? {
      el: sum,
      lineNet: amount(kid(sum, 'LineTotalAmount')),
      allowances: amount(kid(sum, 'AllowanceTotalAmount')),
      charges: amount(kid(sum, 'ChargeTotalAmount')),
      taxExcl: amount(kid(sum, 'TaxBasisTotalAmount')),
      tax: taxAmount,
      taxAcc: taxAmountAcc,
      taxIncl: amount(kid(sum, 'GrandTotalAmount')),
      prepaid: amount(kid(sum, 'TotalPrepaidAmount')),
      rounding: amount(kid(sum, 'RoundingAmount')),
      due: amount(kid(sum, 'DuePayableAmount')),
    } : { el: null },
    vat: applicableTax.map((t) => ({
      el: t,
      base: amount(kid(t, 'BasisAmount')),
      amount: amount(kid(t, 'CalculatedAmount')),
      cat: F(kid(t, 'CategoryCode')),
      rate: F(kid(t, 'RateApplicablePercent')),
      exReason: F(kid(t, 'ExemptionReason')),
      exCode: F(kid(t, 'ExemptionReasonCode')),
    })),
    docs: addDocs.filter((d) => typeOf(d) === '916').map((d) => {
      const bin = kid(d, 'AttachmentBinaryObject');
      return {
        el: d,
        id: F(kid(d, 'IssuerAssignedID')),
        desc: F(kid(d, 'Name')),
        uri: F(kid(d, 'URIID')),
        bin: bin ? { el: bin, mime: bin.getAttribute('mimeCode') || '', filename: bin.getAttribute('filename') || '', data: bin.textContent } : null,
      };
    }),
    lines: kids(tx, 'IncludedSupplyChainTradeLineItem').map(ciiLine),
    raw: { taxTotals: kids(sum, 'TaxTotalAmount').length },
  };
}

export function parseInvoice(doc) {
  const d = detectSyntax(doc);
  if (d.syntax === 'UBL') return parseUBL(doc, d.docType);
  if (d.syntax === 'CII') return parseCII(doc);
  return null;
}

export { emptyAddress };
