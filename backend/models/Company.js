const mongoose = require("mongoose");

// Singleton-style collection - app expects exactly one active company profile
const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gstin: { type: String, trim: true },
    pan: { type: String, trim: true },
    address: { type: String },
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String,
    logoUrl: String,
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      ifsc: String,
      branch: String,
    },
    termsAndConditions: { type: String, default: "" },
    invoicePrefix: { type: String, default: "INV" },
    proformaPrefix: { type: String, default: "PRO" },
    invoiceYear: { type: String, default: () => `${new Date().getFullYear()}` },
    lastInvoiceSeq: { type: Number, default: 0 },
    lastProformaSeq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
