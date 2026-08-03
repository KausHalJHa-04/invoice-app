const Company = require("../models/Company");

// GET /api/company
exports.getCompany = async (req, res) => {
  let company = await Company.findOne();
  if (!company) company = await Company.create({ name: "My Company" });
  res.json(company);
};

// PUT /api/company
exports.updateCompany = async (req, res) => {
  let company = await Company.findOne();
  if (!company) {
    company = await Company.create(req.body);
  } else {
    Object.assign(company, req.body);
    await company.save();
  }
  res.json(company);
};
