import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const Customers = lazy(() => import("./pages/Customers"));
const Products = lazy(() => import("./pages/Products"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Users = lazy(() => import("./pages/Users"));
const InvoiceList = lazy(() => import("./pages/invoices/InvoiceList"));
const InvoiceForm = lazy(() => import("./pages/invoices/InvoiceForm"));
const InvoiceView = lazy(() => import("./pages/invoices/InvoiceView"));

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><Layout title="Dashboard" /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Customers" /></ProtectedRoute>}>
            <Route path="/customers" element={<Customers />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Products" /></ProtectedRoute>}>
            <Route path="/products" element={<Products />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Proforma Invoices" /></ProtectedRoute>}>
            <Route path="/proforma" element={<InvoiceList type="proforma" />} />
            <Route path="/proforma/new" element={<InvoiceForm type="proforma" />} />
            <Route path="/proforma/:id" element={<InvoiceView />} />
          </Route>

          <Route element={<ProtectedRoute><Layout title="Tax Invoices" /></ProtectedRoute>}>
            <Route path="/invoices" element={<InvoiceList type="tax" />} />
            <Route path="/invoices/new" element={<InvoiceForm type="tax" />} />
            <Route path="/invoices/:id" element={<InvoiceView />} />
          </Route>

          <Route element={<ProtectedRoute roles={["Admin", "Accountant"]}><Layout title="Expenses" /></ProtectedRoute>}>
            <Route path="/expenses" element={<Expenses />} />
          </Route>

          <Route element={<ProtectedRoute roles={["Admin"]}><Layout title="User Management" /></ProtectedRoute>}>
            <Route path="/users" element={<Users />} />
          </Route>

          <Route element={<ProtectedRoute roles={["Admin"]}><Layout title="Company Settings" /></ProtectedRoute>}>
            <Route path="/settings" element={<CompanySettings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
