const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    companyName: String,
    gstNumber: String,
    pan: String,
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    sameAsShipping: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customerSchema.index({ name: "text", mobile: "text", companyName: "text" });

module.exports = mongoose.model("Customer", customerSchema);
