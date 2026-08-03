import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, Button, Input, Select, Modal, Badge } from "../components/UI";
import toast from "react-hot-toast";

const roles = ["Admin", "Accountant", "Sales Person"];
const permissionsList = [
  { key: "create_invoice", label: "Create Invoice" },
  { key: "delete_invoice", label: "Delete Invoice" },
  { key: "edit_product", label: "Edit Product" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_users", label: "Manage Users" },
];
const emptyForm = { name: "", email: "", password: "", role: "Sales Person", permissions: [] };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get("/users").then((res) => setUsers(res.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (u) => { setEditing(u); setForm({ ...u, password: "" }); setOpen(true); };

  const togglePerm = (perm) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm) ? f.permissions.filter((p) => p !== perm) : [...f.permissions, perm],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editing._id}`, payload);
        toast.success("User updated");
      } else {
        await api.post("/users", form);
        toast.success("User created");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    toast.success("User deleted");
    load();
  };

  const toggleActive = async (u) => {
    await api.put(`/users/${u._id}`, { isActive: !u.isActive });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>+ Add User</Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3"><Badge color="blue">{u.role}</Badge></td>
                <td className="px-4 py-3 text-xs text-slate-500">{u.role === "Admin" ? "All" : (u.permissions?.join(", ") || "—")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u)}>
                    <Badge color={u.isActive ? "green" : "red"}>{u.isActive ? "Active" : "Disabled"}</Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(u)} className="text-primary-600 font-medium">Edit</button>
                  <button onClick={() => remove(u._id)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit User" : "Add User"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label={editing ? "New Password (leave blank to keep)" : "Password"} type="password" required={!editing} minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          {form.role !== "Admin" && (
            <div>
              <span className="text-sm text-slate-600 font-medium block mb-2">Permissions</span>
              <div className="grid grid-cols-2 gap-2">
                {permissionsList.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          <Button className="w-full">{editing ? "Update User" : "Create User"}</Button>
        </form>
      </Modal>
    </div>
  );
}
