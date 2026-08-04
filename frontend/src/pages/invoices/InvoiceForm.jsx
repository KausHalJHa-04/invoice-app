import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Card, Button, Input, Select, Textarea } from "../../components/UI";
import toast from "react-hot-toast";

// Shared builder for both Proforma and Tax invoices.
// type: "proforma" | "tax"
// Note: Proforma -> Tax Invoice conversion is a separate one-click action
// on the InvoiceView page (calls POST /invoices/:id/convert), it doesn't reuse this form.
export default function InvoiceForm({ type }) {
  const navigate = useNavigate();
  const isTax = type === "tax";

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [isInterState, setIsInterState] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tax-invoice only fields
  const [dueDate, setDueDate] = useState("");
  const [eWayBillNumber, setEWayBillNumber] = useState("");
  const [transportDetails, setTransportDetails] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  const addItem = () => setItems([...items, { product: "", name: "", hsnSac: "", unit: "Nos", quantity: 1, price: 0, discountPercent: 0, gstRate: 18 }]);

  const updateItem = (idx, key, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    setItems(next);
  };

  const selectProduct = (idx, productId) => {
    const p = products.find((pr) => pr._id === productId);
    if (!p) return;
    const next = [...items];
    next[idx] = {
      ...next[idx],
      product: p._id,
      name: p.name,
      hsnSac: p.hsnSac,
      unit: p.unit,
      price: p.sellingPrice,
      gstRate: p.gstRate,
    };
    setItems(next);
  };

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  // Live totals preview (mirrors backend calc)
  const calcPreview = () => {
    let subTotal = 0, cgst = 0, sgst = 0, igst = 0;
    items.forEach((it) => {
      const lineAmount = (it.quantity || 0) * (it.price || 0);
      const lineDiscount = (lineAmount * (it.discountPercent || 0)) / 100;
      const taxable = lineAmount - lineDiscount;
      const gstAmt = (taxable * (it.gstRate || 0)) / 100;
      subTotal += taxable;
      if (isInterState) igst += gstAmt;
      else { cgst += gstAmt / 2; sgst += gstAmt / 2; }
    });
    const discountAmount = (subTotal * (discountPercent || 0)) / 100;
    const preRound = subTotal - discountAmount + cgst + sgst + igst + Number(shippingCharge || 0);
    const rounded = Math.round(preRound);
    return { subTotal, cgst, sgst, igst, discountAmount, roundOff: rounded - preRound, grandTotal: rounded };
  };

  const totals = calcPreview();

  const submit = async (e) => {
    e.preventDefault();
    if (!customerId) return toast.error("Select a customer");
    if (items.length === 0) return toast.error("Add at least one item");
    setSaving(true);
    const payload = {
      customer: customerId,
      items,
      discountPercent: Number(discountPercent),
      shippingCharge: Number(shippingCharge),
      isInterState,
      dueDate: dueDate || undefined,
      eWayBillNumber,
      transportDetails,
      vehicleNumber,
      placeOfSupply,
      reverseCharge,
      notes,
    };
    try {
      const res = await api.post(`/invoices/${type}`, payload);
      toast.success(`${isTax ? "Tax Invoice" : "Proforma Invoice"} created`);
      navigate(`/${isTax ? "invoices" : "proforma"}/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl">
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Customer & Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Customer" required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select customer</option>
            {customers.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-600 mt-6">
            <input type="checkbox" checked={isInterState} onChange={(e) => setIsInterState(e.target.checked)} />
            Inter-state supply (IGST)
          </label>
          {isTax && <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />}
        </div>

        {isTax && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Input label="E-Way Bill Number (Optional)" value={eWayBillNumber} onChange={(e) => setEWayBillNumber(e.target.value)} />
            <Input label="Transport Details" value={transportDetails} onChange={(e) => setTransportDetails(e.target.value)} />
            <Input label="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
            <Input label="Place of Supply" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-slate-600 mt-6">
              <input type="checkbox" checked={reverseCharge} onChange={(e) => setReverseCharge(e.target.checked)} />
              Reverse Charge Applicable
            </label>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Items</h3>
          <Button type="button" variant="secondary" onClick={addItem}>+ Add Item</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="text-slate-500 text-left">
              <tr>
                <th className="py-2 pr-2">Product</th>
                <th className="py-2 pr-2 w-20">Qty</th>
                <th className="py-2 pr-2 w-24">Price</th>
                <th className="py-2 pr-2 w-20">Disc %</th>
                <th className="py-2 pr-2 w-20">GST %</th>
                <th className="py-2 pr-2 w-28 text-right">Line Total</th>
                <th className="py-2 pr-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const lineAmount = (it.quantity || 0) * (it.price || 0);
                const lineDiscount = (lineAmount * (it.discountPercent || 0)) / 100;
                const taxable = lineAmount - lineDiscount;
                const lineTotal = taxable + (taxable * (it.gstRate || 0)) / 100;
                return (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="py-2 pr-2">
                      <select
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        value={it.product || ""}
                        onChange={(e) => selectProduct(idx, e.target.value)}
                      >
                        <option value="">Select product</option>
                        {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-2"><input type="number" min="1" className="w-full rounded-lg border border-slate-300 px-2 py-1.5" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", +e.target.value)} /></td>
                    <td className="py-2 pr-2"><input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 px-2 py-1.5" value={it.price} onChange={(e) => updateItem(idx, "price", +e.target.value)} /></td>
                    <td className="py-2 pr-2"><input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 px-2 py-1.5" value={it.discountPercent} onChange={(e) => updateItem(idx, "discountPercent", +e.target.value)} /></td>
                    <td className="py-2 pr-2"><input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 px-2 py-1.5" value={it.gstRate} onChange={(e) => updateItem(idx, "gstRate", +e.target.value)} /></td>
                    <td className="py-2 pr-2 text-right font-medium">₹{lineTotal.toFixed(2)}</td>
                    <td className="py-2 pr-2"><button type="button" onClick={() => removeItem(idx)} className="text-red-500">&times;</button></td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">No items added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Charges</h3>
          <div className="space-y-4">
            <Input label="Discount %" type="number" step="0.01" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
            <Input label="Shipping Charge" type="number" step="0.01" value={shippingCharge} onChange={(e) => setShippingCharge(e.target.value)} />
            {isTax && <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            <Row label="Sub Total" value={totals.subTotal} />
            <Row label="Discount" value={-totals.discountAmount} />
            {!isInterState ? (
              <>
                <Row label="CGST" value={totals.cgst} />
                <Row label="SGST" value={totals.sgst} />
              </>
            ) : (
              <Row label="IGST" value={totals.igst} />
            )}
            <Row label="Shipping" value={Number(shippingCharge || 0)} />
            <Row label="Round Off" value={totals.roundOff} />
            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-800">
              <span>Grand Total</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Button disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving..." : isTax ? "Create Tax Invoice" : "Create Proforma Invoice"}
      </Button>
    </form>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>₹{value.toFixed(2)}</span>
    </div>
  );
}
