const Customer = require("../models/Customer");

exports.getCustomers = async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? { $or: [{ name: new RegExp(search, "i") }, { mobile: new RegExp(search, "i") }, { companyName: new RegExp(search, "i") }] }
    : {};
  const customers = await Customer.find(filter).sort("-createdAt");
  res.json(customers);
};

exports.getCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Customer deleted" });
};
