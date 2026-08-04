import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Card } from "../components/UI";
import toast from "react-hot-toast";

// Used to bootstrap the very first Admin account. The backend automatically
// makes the first-ever registered user an Admin regardless of role posted.
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary-700 mb-1">Create Account</h1>
        <p className="text-sm text-slate-500 mb-6">First registered user becomes Admin</p>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
        </form>
        <p className="text-xs text-slate-400 mt-4">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
