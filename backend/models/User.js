const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const permissionsList = [
  "create_invoice",
  "delete_invoice",
  "edit_product",
  "view_reports",
  "manage_users",
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["Admin", "Accountant", "Sales Person"],
      default: "Sales Person",
    },
    permissions: {
      type: [String],
      enum: permissionsList,
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Admin implicitly gets all permissions
userSchema.methods.hasPermission = function (perm) {
  if (this.role === "Admin") return true;
  return this.permissions.includes(perm);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
module.exports.PERMISSIONS = permissionsList;
