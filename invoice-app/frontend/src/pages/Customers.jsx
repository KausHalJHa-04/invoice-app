import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, Button, Input, Modal } from "../components/UI";
import toast from "react-hot-toast";

const emptyForm = {
  name: "", mobile: "", email: "", companyName: "", gstNumber: "", pan: "",
  billingAddress: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India" },
  shippingAddress: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India" },
  sameAsShipping: true,
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get(`/customers${search ? `?search=${search}` : ""}`).then((res) => setCustomers(res.data));

  useEffect(() => { load(); }, [search]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      ...emptyForm,
      ...c,
      billingAddress: c.billingAddress || emptyForm.billingAddress,
      shippingAddress: c.shippingAddress || emptyForm.shippingAddress,
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.sameAsShipping) payload.shippingAddress = payload.billingAddress;
    try {
      if (editing) {
        await api.put(`/customers/${editing._id}`, payload);
        toast.success("Customer updated");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer added");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this customer?")) return;
    await api.delete(`/customers/${id}`);
    toast.success("Customer deleted");
    load();
  };

  const setAddr = (type, key, value) => setForm({ ...form, [type]: { ...form[type], [key]: value } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button onClick={openNew}>+ Add Customer</Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">GSTIN</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700">{c.name}</td>
                <td className="px-4 py-3">{c.mobile}</td>
                <td className="px-4 py-3">{c.companyName || "—"}</td>
                <td className="px-4 py-3">{c.gstNumber || "—"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(c)} className="text-primary-600 font-medium">Edit</button>
                  <button onClick={() => remove(c._id)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Customer" : "Add Customer"} wide>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Mobile" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <Input label="GST Number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
            <Input label="PAN (Optional)" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Billing Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Address Line 1" value={form.billingAddress.line1} onChange={(e) => setAddr("billingAddress", "line1", e.target.value)} />
              <Input placeholder="Address Line 2" value={form.billingAddress.line2} onChange={(e) => setAddr("billingAddress", "line2", e.target.value)} />
              <Input placeholder="City" value={form.billingAddress.city} onChange={(e) => setAddr("billingAddress", "city", e.target.value)} />
              <Input placeholder="State" value={form.billingAddress.state} onChange={(e) => setAddr("billingAddress", "state", e.target.value)} />
              <Input placeholder="Pincode" value={form.billingAddress.pincode} onChange={(e) => setAddr("billingAddress", "pincode", e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.sameAsShipping} onChange={(e) => setForm({ ...form, sameAsShipping: e.target.checked })} />
            Shipping address same as billing
          </label>

          {!form.sameAsShipping && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Shipping Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Address Line 1" value={form.shippingAddress.line1} onChange={(e) => setAddr("shippingAddress", "line1", e.target.value)} />
                <Input placeholder="Address Line 2" value={form.shippingAddress.line2} onChange={(e) => setAddr("shippingAddress", "line2", e.target.value)} />
                <Input placeholder="City" value={form.shippingAddress.city} onChange={(e) => setAddr("shippingAddress", "city", e.target.value)} />
                <Input placeholder="State" value={form.shippingAddress.state} onChange={(e) => setAddr("shippingAddress", "state", e.target.value)} />
                <Input placeholder="Pincode" value={form.shippingAddress.pincode} onChange={(e) => setAddr("shippingAddress", "pincode", e.target.value)} />
              </div>
            </div>
          )}

          <Button className="w-full">{editing ? "Update Customer" : "Add Customer"}</Button>
        </form>
      </Modal>
    </div>
  );
}
