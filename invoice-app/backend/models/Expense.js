const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Office Expense", "Salary", "Rent", "Electricity", "Internet", "Fuel", "Other"],
      required: true,
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    paymentMode: { type: String, enum: ["Cash", "Bank Transfer", "UPI", "Cheque", "Card"], default: "Cash" },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
