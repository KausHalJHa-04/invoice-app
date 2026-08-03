import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CompanySettings from "./pages/CompanySettings";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Expenses from "./pages/Expenses";
import Users from "./pages/Users";
import InvoiceList from "./pages/invoices/InvoiceList";
import InvoiceForm from "./pages/invoices/InvoiceForm";
import InvoiceView from "./pages/invoices/InvoiceView";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
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
    </>
  );
}
