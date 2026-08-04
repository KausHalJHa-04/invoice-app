const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    hsnSac: String,
    unit: String,
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }, // selling price per unit
    discountPercent: { type: Number, default: 0 },
    gstRate: { type: Number, required: true, default: 18 },
    taxableAmount: Number, // (qty*price) - discount
    cgst: Number,
    sgst: Number,
    igst: Number,
    total: Number,
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["proforma", "tax"], required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: Date,

    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerSnapshot: mongoose.Schema.Types.Mixed, // frozen copy of customer at time of invoice

    items: [itemSchema],

    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },

    subTotal: { type: Number, default: 0 }, // sum of taxable amounts
    totalCgst: { type: Number, default: 0 },
    totalSgst: { type: Number, default: 0 },
    totalIgst: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    isInterState: { type: Boolean, default: false },

    // Tax invoice specific fields
    eWayBillNumber: String,
    transportDetails: String,
    vehicleNumber: String,
    placeOfSupply: String,
    reverseCharge: { type: Boolean, default: false },
    notes: String,
    authorizedSignature: String,

    status: {
      type: String,
      enum: ["draft", "sent", "paid", "cancelled", "converted"],
      default: "draft",
    },

    convertedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }, // proforma this tax invoice was converted from
    convertedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }, // tax invoice this proforma became
    isDuplicateCopyOf: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
