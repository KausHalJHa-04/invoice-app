const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const { calculateInvoiceTotals } = require("../utils/invoiceCalc");
const { getNextInvoiceNumber } = require("../utils/invoiceNumber");

// Shared builder for creating a proforma or tax invoice from request body
async function buildInvoiceDoc(req, type) {
  const {
    customer: customerId,
    items,
    discountPercent,
    shippingCharge,
    isInterState,
    invoiceDate,
    dueDate,
    eWayBillNumber,
    transportDetails,
    vehicleNumber,
    placeOfSupply,
    reverseCharge,
    notes,
    authorizedSignature,
  } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  const totals = calculateInvoiceTotals({ items, discountPercent, shippingCharge, isInterState });
  const invoiceNumber = await getNextInvoiceNumber(type);

  return new Invoice({
    type,
    invoiceNumber,
    invoiceDate: invoiceDate || Date.now(),
    dueDate,
    customer: customer._id,
    customerSnapshot: customer.toObject(),
    items: totals.items,
    discountPercent: discountPercent || 0,
    discountAmount: totals.discountAmount,
    shippingCharge: shippingCharge || 0,
    roundOff: totals.roundOff,
    subTotal: totals.subTotal,
    totalCgst: totals.totalCgst,
    totalSgst: totals.totalSgst,
    totalIgst: totals.totalIgst,
    grandTotal: totals.grandTotal,
    isInterState: !!isInterState,
    eWayBillNumber,
    transportDetails,
    vehicleNumber,
    placeOfSupply,
    reverseCharge: !!reverseCharge,
    notes,
    authorizedSignature,
    createdBy: req.user._id,
  });
}

// Deduct stock quantities when a Tax Invoice is finalized
async function deductStock(items) {
  for (const item of items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } });
    }
  }
}

// GET /api/invoices?type=proforma|tax
exports.getInvoices = async (req, res) => {
  const { type, status, search } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) filter.invoiceNumber = new RegExp(search, "i");
  const invoices = await Invoice.find(filter).populate("customer", "name mobile companyName").sort("-createdAt");
  res.json(invoices);
};

// GET /api/invoices/:id
exports.getInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("customer");
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  res.json(invoice);
};

// POST /api/invoices/proforma
exports.createProforma = async (req, res) => {
  try {
    const invoice = await buildInvoiceDoc(req, "proforma");
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/invoices/tax
exports.createTaxInvoice = async (req, res) => {
  try {
    const invoice = await buildInvoiceDoc(req, "tax");
    await invoice.save();
    await deductStock(invoice.items);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/invoices/:id  (edit a draft invoice - proforma or tax before stock affecting actions)
exports.updateInvoice = async (req, res) => {
  try {
    const existing = await Invoice.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Invoice not found" });
    if (existing.status === "cancelled") return res.status(400).json({ message: "Cannot edit a cancelled invoice" });

    const { items, discountPercent, shippingCharge, isInterState } = req.body;
    const totals = calculateInvoiceTotals({
      items: items || existing.items,
      discountPercent: discountPercent ?? existing.discountPercent,
      shippingCharge: shippingCharge ?? existing.shippingCharge,
      isInterState: isInterState ?? existing.isInterState,
    });

    Object.assign(existing, req.body, {
      items: totals.items,
      discountAmount: totals.discountAmount,
      roundOff: totals.roundOff,
      subTotal: totals.subTotal,
      totalCgst: totals.totalCgst,
      totalSgst: totals.totalSgst,
      totalIgst: totals.totalIgst,
      grandTotal: totals.grandTotal,
    });

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/invoices/:id/convert  (Proforma -> Tax Invoice)
exports.convertToTaxInvoice = async (req, res) => {
  try {
    const proforma = await Invoice.findById(req.params.id);
    if (!proforma) return res.status(404).json({ message: "Proforma invoice not found" });
    if (proforma.type !== "proforma") return res.status(400).json({ message: "Only proforma invoices can be converted" });
    if (proforma.convertedTo) return res.status(400).json({ message: "This proforma has already been converted" });

    const invoiceNumber = await getNextInvoiceNumber("tax");

    const taxInvoice = await Invoice.create({
      type: "tax",
      invoiceNumber,
      invoiceDate: Date.now(),
      dueDate: req.body.dueDate,
      customer: proforma.customer,
      customerSnapshot: proforma.customerSnapshot,
      items: proforma.items,
      discountPercent: proforma.discountPercent,
      discountAmount: proforma.discountAmount,
      shippingCharge: proforma.shippingCharge,
      roundOff: proforma.roundOff,
      subTotal: proforma.subTotal,
      totalCgst: proforma.totalCgst,
      totalSgst: proforma.totalSgst,
      totalIgst: proforma.totalIgst,
      grandTotal: proforma.grandTotal,
      isInterState: proforma.isInterState,
      eWayBillNumber: req.body.eWayBillNumber,
      transportDetails: req.body.transportDetails,
      vehicleNumber: req.body.vehicleNumber,
      placeOfSupply: req.body.placeOfSupply,
      reverseCharge: req.body.reverseCharge,
      notes: req.body.notes,
      convertedFrom: proforma._id,
      createdBy: req.user._id,
    });

    await deductStock(taxInvoice.items);

    proforma.status = "converted";
    proforma.convertedTo = taxInvoice._id;
    await proforma.save();

    res.status(201).json(taxInvoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/invoices/:id/duplicate  (Duplicate Copy of a Tax Invoice, for printing "Duplicate for Transporter" etc.)
exports.duplicateInvoice = async (req, res) => {
  try {
    const original = await Invoice.findById(req.params.id);
    if (!original) return res.status(404).json({ message: "Invoice not found" });

    const dup = original.toObject();
    delete dup._id;
    delete dup.createdAt;
    delete dup.updatedAt;
    dup.isDuplicateCopyOf = original._id;

    const created = await Invoice.create(dup);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/invoices/:id/cancel
exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (invoice.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });

    // restore stock if it was a tax invoice that had deducted stock
    if (invoice.type === "tax") {
      for (const item of invoice.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: item.quantity } });
        }
      }
    }

    invoice.status = "cancelled";
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/invoices/:id/status  (mark sent/paid)
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  res.json(invoice);
};
