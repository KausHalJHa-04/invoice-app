const Company = require("../models/Company");

// Atomically increments and returns the next invoice/proforma number
// Format: PREFIX-YEAR-0001 (e.g. INV-2026-0001)
async function getNextInvoiceNumber(type) {
  const field = type === "proforma" ? "lastProformaSeq" : "lastInvoiceSeq";
  const prefixField = type === "proforma" ? "proformaPrefix" : "invoicePrefix";

  let company = await Company.findOne();
  if (!company) {
    company = await Company.create({ name: "My Company" });
  }

  const updated = await Company.findByIdAndUpdate(
    company._id,
    { $inc: { [field]: 1 } },
    { new: true }
  );

  const seq = String(updated[field]).padStart(4, "0");
  return `${updated[prefixField]}-${updated.invoiceYear}-${seq}`;
}

module.exports = { getNextInvoiceNumber };
