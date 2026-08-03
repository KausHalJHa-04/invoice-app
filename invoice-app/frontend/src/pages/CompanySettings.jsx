import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, Input, Textarea, Button } from "../components/UI";
import toast from "react-hot-toast";

export default function CompanySettings() {
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/company").then((res) => setForm(res.data));
  }, []);

  if (!form) return <p className="text-slate-500">Loading...</p>;

  const set = (key, value) => setForm({ ...form, [key]: value });
  const setBank = (key, value) => setForm({ ...form, bankDetails: { ...form.bankDetails, [key]: value } });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let logoUrl = form.logoUrl;
      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        const res = await api.post("/company/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
        logoUrl = res.data.url;
      }
      const res = await api.put("/company", { ...form, logoUrl });
      setForm(res.data);
      toast.success("Company settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Company Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Company Name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="GSTIN" value={form.gstin || ""} onChange={(e) => set("gstin", e.target.value)} />
          <Input label="PAN" value={form.pan || ""} onChange={(e) => set("pan", e.target.value)} />
          <Input label="Phone" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
          <Input label="Email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
          <Input label="Invoice Prefix" value={form.invoicePrefix || ""} onChange={(e) => set("invoicePrefix", e.target.value)} />
          <Input label="Proforma Prefix" value={form.proformaPrefix || ""} onChange={(e) => set("proformaPrefix", e.target.value)} />
          <Input label="Invoice Year" value={form.invoiceYear || ""} onChange={(e) => set("invoiceYear", e.target.value)} />
        </div>
        <div className="mt-4">
          <Textarea label="Address" rows={2} value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Input label="City" value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
          <Input label="State" value={form.state || ""} onChange={(e) => set("state", e.target.value)} />
          <Input label="Pincode" value={form.pincode || ""} onChange={(e) => set("pincode", e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="block text-sm text-slate-600 font-medium mb-1">Logo</label>
          {form.logoUrl && <img src={form.logoUrl} alt="logo" className="h-12 mb-2 object-contain" />}
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="text-sm" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Account Name" value={form.bankDetails?.accountName || ""} onChange={(e) => setBank("accountName", e.target.value)} />
          <Input label="Account Number" value={form.bankDetails?.accountNumber || ""} onChange={(e) => setBank("accountNumber", e.target.value)} />
          <Input label="Bank Name" value={form.bankDetails?.bankName || ""} onChange={(e) => setBank("bankName", e.target.value)} />
          <Input label="IFSC" value={form.bankDetails?.ifsc || ""} onChange={(e) => setBank("ifsc", e.target.value)} />
          <Input label="Branch" value={form.bankDetails?.branch || ""} onChange={(e) => setBank("branch", e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Terms & Conditions</h3>
        <Textarea rows={4} value={form.termsAndConditions || ""} onChange={(e) => set("termsAndConditions", e.target.value)} />
      </Card>

      <Button disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
    </form>
  );
}
