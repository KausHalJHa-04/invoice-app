// Shared GST / totals calculation for proforma & tax invoices.
// isInterState = true -> IGST, else CGST+SGST split evenly.

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function calculateInvoiceTotals({ items, discountPercent = 0, shippingCharge = 0, isInterState = false }) {
  let subTotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const computedItems = items.map((item) => {
    const lineAmount = item.quantity * item.price;
    const lineDiscount = (lineAmount * (item.discountPercent || 0)) / 100;
    const taxableAmount = round2(lineAmount - lineDiscount);

    const gstAmount = (taxableAmount * item.gstRate) / 100;
    let cgst = 0,
      sgst = 0,
      igst = 0;
    if (isInterState) {
      igst = round2(gstAmount);
    } else {
      cgst = round2(gstAmount / 2);
      sgst = round2(gstAmount / 2);
    }
    const total = round2(taxableAmount + cgst + sgst + igst);

    subTotal += taxableAmount;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    return { ...item, taxableAmount, cgst, sgst, igst, total };
  });

  subTotal = round2(subTotal);
  totalCgst = round2(totalCgst);
  totalSgst = round2(totalSgst);
  totalIgst = round2(totalIgst);

  const discountAmount = round2((subTotal * (discountPercent || 0)) / 100);
  const preRoundTotal =
    subTotal - discountAmount + totalCgst + totalSgst + totalIgst + Number(shippingCharge || 0);

  const roundedTotal = Math.round(preRoundTotal);
  const roundOff = round2(roundedTotal - preRoundTotal);

  return {
    items: computedItems,
    subTotal,
    totalCgst,
    totalSgst,
    totalIgst,
    discountAmount,
    roundOff,
    grandTotal: roundedTotal,
  };
}

module.exports = { calculateInvoiceTotals, round2 };
