const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

// GET /api/dashboard/summary
exports.getSummary = async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [todaySalesAgg, totalCustomers, totalProducts] = await Promise.all([
    Invoice.aggregate([
      { $match: { type: "tax", status: { $ne: "cancelled" }, invoiceDate: { $gte: startOfToday, $lte: endOfToday } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
    ]),
    Customer.countDocuments(),
    Product.countDocuments(),
  ]);

  res.json({
    todaySales: todaySalesAgg[0]?.total || 0,
    todayInvoiceCount: todaySalesAgg[0]?.count || 0,
    totalCustomers,
    totalProducts,
  });
};

// GET /api/dashboard/sales-graph?mode=daily|monthly
exports.getSalesGraph = async (req, res) => {
  const { mode = "daily" } = req.query;

  let groupStage;
  let matchDate = new Date();

  if (mode === "monthly") {
    matchDate.setMonth(matchDate.getMonth() - 11);
    matchDate.setDate(1);
    groupStage = {
      _id: { year: { $year: "$invoiceDate" }, month: { $month: "$invoiceDate" } },
      total: { $sum: "$grandTotal" },
    };
  } else {
    matchDate.setDate(matchDate.getDate() - 29);
    groupStage = {
      _id: { year: { $year: "$invoiceDate" }, month: { $month: "$invoiceDate" }, day: { $dayOfMonth: "$invoiceDate" } },
      total: { $sum: "$grandTotal" },
    };
  }
  matchDate.setHours(0, 0, 0, 0);

  const data = await Invoice.aggregate([
    { $match: { type: "tax", status: { $ne: "cancelled" }, invoiceDate: { $gte: matchDate } } },
    { $group: groupStage },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const formatted = data.map((d) => ({
    label:
      mode === "monthly"
        ? `${d._id.month}/${d._id.year}`
        : `${d._id.day}/${d._id.month}/${d._id.year}`,
    total: d.total,
  }));

  res.json(formatted);
};
