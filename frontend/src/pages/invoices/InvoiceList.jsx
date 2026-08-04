import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Card, Button, Input, Badge } from "../../components/UI";

const statusColor = { draft: "slate", sent: "blue", paid: "green", cancelled: "red", converted: "yellow" };

// type: "proforma" | "tax"
export default function InvoiceList({ type }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const isTax = type === "tax";

  useEffect(() => {
    api.get(`/invoices?type=${type}${search ? `&search=${search}` : ""}`).then((res) => setInvoices(res.data));
  }, [type, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input placeholder="Search invoice number..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Link to={isTax ? "/invoices/new" : "/proforma/new"}>
          <Button>+ New {isTax ? "Tax Invoice" : "Proforma Invoice"}</Button>
        </Link>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">{new Date(inv.invoiceDate).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3">{inv.customer?.name}</td>
                <td className="px-4 py-3">₹{inv.grandTotal?.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3"><Badge color={statusColor[inv.status] || "slate"}>{inv.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/${isTax ? "invoices" : "proforma"}/${inv._id}`} className="text-primary-600 font-medium">View</Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
