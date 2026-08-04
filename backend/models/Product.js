const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, trim: true },
    brand: String,
    hsnSac: { type: String, required: true },
    unit: {
      type: String,
      enum: ["Nos", "Kg", "Ltr", "Box", "Pcs", "Mtr", "Set"],
      default: "Nos",
    },
    purchasePrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },
    gstRate: { type: Number, required: true, default: 18 },
    stockQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    imageUrl: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", sku: "text", barcode: "text" });

module.exports = mongoose.model("Product", productSchema);
