# Invoice Generator — React + Tailwind + Node.js + MongoDB

A full-stack GST invoice management app with Dashboard, Company Settings, Customer
& Product management, Proforma & Tax Invoices, Expense tracking, and role-based
User Management.

```
invoice-app/
├── backend/     Node.js + Express + MongoDB API
└── frontend/    React + Vite + Tailwind CSS
```

## Features implemented

1. **Dashboard** — today's sales, total customers, total products, daily/monthly sales graph
2. **Company Settings** — name, GSTIN, PAN, address, logo upload, bank details, terms & conditions, invoice/proforma prefix (e.g. `INV-2026-0001`)
3. **Customer Management** — name, mobile, email, company, GST, PAN, billing & shipping address
4. **Product Management** — name, SKU, barcode, brand, HSN/SAC, unit, purchase/selling price, GST rate, stock qty, image
5. **Proforma Invoice** — customer + line items, discount, shipping, round-off, GST calc (CGST/SGST or IGST for inter-state), Print, PDF download, **Convert to Tax Invoice**
6. **Tax Invoice** — auto invoice number, invoice/due date, E-Way Bill No. (optional), transport details, vehicle number, place of supply, reverse charge, notes, authorized signature block, Print, PDF, **Duplicate Copy**, **Cancel Invoice** (restores stock)
7. **Expense Management** — Office Expense, Salary, Rent, Electricity, Internet, Fuel, Other — with running total
8. **User Management** — roles (Admin / Accountant / Sales Person) with granular permissions (Create Invoice, Delete Invoice, Edit Product, View Reports, Manage Users)

Stock is automatically deducted when a Tax Invoice is created (or a Proforma is
converted to one), and restored if that invoice is later cancelled.

## Prerequisites

- Node.js 18+
- MongoDB (local install or a free MongoDB Atlas cluster)

## 1. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/invoice_app
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Install and run:

```bash
npm install
npm run dev        # nodemon, auto-restarts on change
# or: npm start
```

The API runs at `http://localhost:5000/api` (health check at `/api/health`).

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Vite is pre-configured to proxy `/api` and
`/uploads` to `http://localhost:5000`, so no extra config is needed for local dev.

## 3. First-time login (create the Admin account)

There's no seeded user — the **first account ever registered automatically
becomes Admin**, regardless of what role is submitted. Go to:

```
http://localhost:5173/register
```

Fill in your name/email/password once. You'll be logged straight in as Admin.
Every subsequent account must be created from **User Management** (Admin only),
where you assign a role and specific permissions.

## 4. Typical first steps after logging in

1. **Company Settings** → fill in your company name, GSTIN, PAN, address, logo,
   bank details, T&Cs, and invoice prefix.
2. **Products** → add your catalog (HSN/SAC + GST rate matter for tax calc).
3. **Customers** → add a customer with billing/shipping address.
4. **Proforma Invoices → New** → pick customer + items, review GST totals, save.
5. Open the proforma → **Convert to Tax Invoice** when the deal is confirmed
   (this deducts stock and generates the next `INV-2026-000X` number).
6. **Expenses** and **User Management** are available from the sidebar (Admin/Accountant only where applicable).

## Deployment notes (cPanel / VPS)

- Backend: deploy as a standard Node app (e.g. via Passenger/cPanel Node.js App
  or PM2 on a VPS), point `MONGO_URI` at your MongoDB instance (Atlas works
  well for cPanel hosting since you likely can't run MongoDB locally there).
- Frontend: `npm run build` produces a static `dist/` folder — deploy it to
  your static hosting / subdomain, and update the API base URL (currently
  relative `/api`, proxied only in dev) to point at your deployed backend, or
  serve both from the same domain behind a reverse proxy.
- Set `CLIENT_URL` in the backend `.env` to your deployed frontend origin for CORS.
- Uploaded logos/product images are stored on disk under `backend/uploads/` —
  make sure that folder persists across deploys (or swap in S3-style storage
  if you need it to survive redeploys on ephemeral hosting).

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Chart.js, jsPDF + html2canvas, Axios, react-hot-toast
- **Backend:** Express, Mongoose, JWT (jsonwebtoken), bcryptjs, multer, morgan
