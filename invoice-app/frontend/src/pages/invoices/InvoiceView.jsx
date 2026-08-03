import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { Card, Button, Badge } from "../../components/UI";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const statusColor = { draft: "slate", sent: "blue", paid: "green", cancelled: "red", converted: "yellow" };

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const printRef = useRef();

  const load = () => api.get(`/invoices/${id}`).then((res) => setInvoice(res.data));

  useEffect(() => {
    load();
    api.get("/company").then((res) => setCompany(res.data));
  }, [id]);

  if (!invoice || !company) return <p className="text-slate-500">Loading...</p>;

  const isProforma = invoice.type === "proforma";
  const customer = invoice.customer || invoice.customerSnapshot;

  const downloadPdf = async () => {
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`${invoice.invoiceNumber}.pdf`);
  };

  const convert = async () => {
    if (!confirm("Convert this Proforma Invoice into a Tax Invoice?")) return;
    try {
      const res = await api.post(`/invoices/${id}/convert`, {});
      toast.success("Converted to Tax Invoice");
      navigate(`/invoices/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Conversion failed");
    }
  };

  const duplicate = async () => {
    try {
      const res = await api.post(`/invoices/${id}/duplicate`, {});
      toast.success("Duplicate copy created");
      navigate(`/invoices/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to duplicate");
    }
  };

  const cancelInvoice = async () => {
    if (!confirm("Cancel this invoice? Stock will be restored.")) return;
    try {
      await api.post(`/invoices/${id}/cancel`, {});
      toast.success("Invoice cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">{invoice.invoiceNumber}</h2>
          <Badge color={statusColor[invoice.status]}>{invoice.status}</Badge>
          {invoice.isDuplicateCopyOf && <Badge color="yellow">Duplicate Copy</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
          <Button variant="outline" onClick={downloadPdf}>Download PDF</Button>
          {!isProforma && <Button variant="outline" onClick={duplicate}>Duplicate Copy</Button>}
          {isProforma && !invoice.convertedTo && invoice.status !== "cancelled" && (
            <Button onClick={convert}>Convert to Tax Invoice</Button>
          )}
          {invoice.status !== "cancelled" && (
            <Button variant="danger" onClick={cancelInvoice}>Cancel Invoice</Button>
          )}
        </div>
      </div>

      <Card className="print-area">
        <div ref={printRef} className="bg-white p-2">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              {company.logoUrl && <img src={company.logoUrl} className="h-12 mb-2 object-contain" />}
              <h1 className="text-xl font-bold text-slate-800">{company.name}</h1>
              <p className="text-xs text-slate-500 whitespace-pre-line">{company.address}</p>
              <p className="text-xs text-slate-500">{[company.city, company.state, company.pincode].filter(Boolean).join(", ")}</p>
              {company.gstin && <p className="text-xs text-slate-500">GSTIN: {company.gstin}</p>}
              {company.pan && <p className="text-xs text-slate-500">PAN: {company.pan}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-primary-700 uppercase">{isProforma ? "Proforma Invoice" : "Tax Invoice"}</h2>
              <p className="text-sm text-slate-600 mt-1">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500">Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</p>
              {invoice.dueDate && <p className="text-xs text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Billed To</h4>
              <p className="font-medium text-slate-800">{customer.name}</p>
              {customer.companyName && <p className="text-sm text-slate-600">{customer.companyName}</p>}
              <p className="text-sm text-slate-600">{customer.mobile}</p>
              {customer.gstNumber && <p className="text-sm text-slate-600">GSTIN: {customer.gstNumber}</p>}
              {customer.billingAddress && (
                <p className="text-sm text-slate-500">
                  {[customer.billingAddress.line1, customer.billingAddress.city, customer.billingAddress.state, customer.billingAddress.pincode].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            {!isProforma && (
              <div className="text-sm text-slate-600 space-y-0.5">
                {invoice.eWayBillNumber && <p>E-Way Bill: {invoice.eWayBillNumber}</p>}
                {invoice.transportDetails && <p>Transport: {invoice.transportDetails}</p>}
                {invoice.vehicleNumber && <p>Vehicle No: {invoice.vehicleNumber}</p>}
                {invoice.placeOfSupply && <p>Place of Supply: {invoice.placeOfSupply}</p>}
                {invoice.reverseCharge && <p>Reverse Charge: Yes</p>}
              </div>
            )}
          </div>

          <table className="w-full text-sm mt-4">
            <thead className="text-left text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2">Item</th>
                <th className="py-2">HSN/SAC</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">GST</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2">{it.hsnSac}</td>
                  <td className="py-2 text-right">{it.quantity} {it.unit}</td>
                  <td className="py-2 text-right">₹{it.price?.toFixed(2)}</td>
                  <td className="py-2 text-right">{it.gstRate}%</td>
                  <td className="py-2 text-right font-medium">₹{it.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-full sm:w-72 space-y-1.5 text-sm">
              <Row label="Sub Total" value={invoice.subTotal} />
              <Row label={`Discount (${invoice.discountPercent}%)`} value={-invoice.discountAmount} />
              {invoice.isInterState ? (
                <Row label="IGST" value={invoice.totalIgst} />
              ) : (
                <>
                  <Row label="CGST" value={invoice.totalCgst} />
                  <Row label="SGST" value={invoice.totalSgst} />
                </>
              )}
              <Row label="Shipping" value={invoice.shippingCharge} />
              <Row label="Round Off" value={invoice.roundOff} />
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-800">
                <span>Grand Total</span>
                <span>₹{invoice.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-4 text-sm">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Notes</h4>
              <p className="text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {company.bankDetails?.accountNumber && (
            <div className="mt-4 text-sm">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Bank Details</h4>
              <p className="text-slate-600">
                {company.bankDetails.accountName} • {company.bankDetails.bankName} • A/C {company.bankDetails.accountNumber} • IFSC {company.bankDetails.ifsc}
              </p>
            </div>
          )}

          {company.termsAndConditions && (
            <div className="mt-4 text-sm">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Terms & Conditions</h4>
              <p className="text-slate-500 whitespace-pre-line">{company.termsAndConditions}</p>
            </div>
          )}

          <div className="flex justify-end mt-10">
            <div className="text-center text-sm text-slate-600">
              <div className="h-12"></div>
              <p className="border-t border-slate-300 pt-1">Authorized Signature</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>₹{Number(value || 0).toFixed(2)}</span>
    </div>
  );
}
