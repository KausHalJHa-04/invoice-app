import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, Button, Input, Select, Modal } from "../components/UI";
import toast from "react-hot-toast";

const categories = ["Office Expense", "Salary", "Rent", "Electricity", "Internet", "Fuel", "Other"];
const emptyForm = { category: "Office Expense", title: "", amount: 0, date: new Date().toISOString().slice(0, 10), paymentMode: "Cash", notes: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get(`/expenses${filterCategory ? `?category=${filterCategory}` : ""}`).then((res) => setExpenses(res.data));
  useEffect(() => { load(); }, [filterCategory]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", form);
      toast.success("Expense recorded");
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    toast.success("Expense deleted");
    load();
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="max-w-xs">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button onClick={() => setOpen(true)}>+ Add Expense</Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Payment Mode</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id} className="border-t border-slate-100">
                <td className="px-4 py-3">{new Date(e.date).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3">{e.category}</td>
                <td className="px-4 py-3">{e.title}</td>
                <td className="px-4 py-3">{e.paymentMode}</td>
                <td className="px-4 py-3 text-right font-medium">₹{e.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(e._id)} className="text-red-600 font-medium">Delete</button></td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No expenses recorded</td></tr>
            )}
          </tbody>
          {expenses.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold text-slate-800">
                <td colSpan={4} className="px-4 py-3 text-right">Total</td>
                <td className="px-4 py-3 text-right">₹{total.toLocaleString("en-IN")}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Expense">
        <form onSubmit={submit} className="space-y-4">
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Amount" type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select label="Payment Mode" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
            {["Cash", "Bank Transfer", "UPI", "Cheque", "Card"].map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button className="w-full">Save Expense</Button>
        </form>
      </Modal>
    </div>
  );
}
