import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Sidebar() {
  const { user, hasPermission } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col no-print">
      <div className="px-5 py-5 border-b border-slate-200">
        <h1 className="text-xl font-bold text-primary-700">InvoicePro</h1>
        <p className="text-xs text-slate-400 mt-0.5">GST Invoice Manager</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/customers" className={linkClass}>Customers</NavLink>
        <NavLink to="/products" className={linkClass}>Products</NavLink>
        <NavLink to="/proforma" className={linkClass}>Proforma Invoices</NavLink>
        <NavLink to="/invoices" className={linkClass}>Tax Invoices</NavLink>
        {(user?.role === "Admin" || user?.role === "Accountant") && (
          <NavLink to="/expenses" className={linkClass}>Expenses</NavLink>
        )}
        {user?.role === "Admin" && (
          <NavLink to="/users" className={linkClass}>User Management</NavLink>
        )}
        {user?.role === "Admin" && (
          <NavLink to="/settings" className={linkClass}>Company Settings</NavLink>
        )}
      </nav>
      <div className="p-4 border-t border-slate-200 text-xs text-slate-400">
        Logged in as <span className="font-medium text-slate-600">{user?.name}</span>
        <div>{user?.role}</div>
      </div>
    </aside>
  );
}
