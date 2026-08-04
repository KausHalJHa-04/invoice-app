import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, Button, Input, Select, Modal, Badge } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const emptyForm = {
  name: "", sku: "", barcode: "", brand: "", hsnSac: "", unit: "Nos",
  purchasePrice: 0, sellingPrice: 0, gstRate: 18, stockQuantity: 0, lowStockThreshold: 5, imageUrl: "",
};

export default function Products() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("edit_product");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);

  const load = () => api.get(`/products${search ? `?search=${search}` : ""}`).then((res) => setProducts(res.data));
  useEffect(() => { load(); }, [search]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setImageFile(null); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm(p); setImageFile(null); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await api.post("/products/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
        imageUrl = res.data.url;
      }
      const payload = { ...form, imageUrl };
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product added");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        {canEdit && <Button onClick={openNew}>+ Add Product</Button>}
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">HSN/SAC</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="px-4 py-3 flex items-center gap-2">
                  {p.imageUrl ? <img src={p.imageUrl} className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 rounded bg-slate-100" />}
                  <div>
                    <div className="font-medium text-slate-700">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.brand}</div>
                  </div>
                </td>
                <td className="px-4 py-3">{p.sku}</td>
                <td className="px-4 py-3">{p.hsnSac}</td>
                <td className="px-4 py-3">₹{p.sellingPrice}</td>
                <td className="px-4 py-3">{p.gstRate}%</td>
                <td className="px-4 py-3">
                  {p.stockQuantity <= p.lowStockThreshold ? <Badge color="red">{p.stockQuantity} {p.unit}</Badge> : <span>{p.stockQuantity} {p.unit}</span>}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {canEdit && <button onClick={() => openEdit(p)} className="text-primary-600 font-medium">Edit</button>}
                  {canEdit && <button onClick={() => remove(p._id)} className="text-red-600 font-medium">Delete</button>}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No products found</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Product" : "Add Product"} wide>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Product Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input label="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            <Input label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <Input label="HSN/SAC Code" required value={form.hsnSac} onChange={(e) => setForm({ ...form, hsnSac: e.target.value })} />
            <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {["Nos", "Kg", "Ltr", "Box", "Pcs", "Mtr", "Set"].map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>
            <Input label="Purchase Price" type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: +e.target.value })} />
            <Input label="Selling Price" type="number" step="0.01" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })} />
            <Input label="GST Rate %" type="number" required value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: +e.target.value })} />
            <Input label="Stock Quantity" type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: +e.target.value })} />
            <Input label="Low Stock Alert" type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: +e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 font-medium mb-1">Product Image</label>
            {form.imageUrl && <img src={form.imageUrl} className="h-16 mb-2 object-cover rounded" />}
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm" />
          </div>
          <Button className="w-full">{editing ? "Update Product" : "Add Product"}</Button>
        </form>
      </Modal>
    </div>
  );
}
