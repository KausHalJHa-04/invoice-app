// Small shared UI primitives used across pages
export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>{children}</div>;
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className = "", ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="text-slate-600 font-medium">{label}</span>}
      <input
        className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="text-slate-600 font-medium">{label}</span>}
      <select
        className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="text-slate-600 font-medium">{label}</span>}
      <textarea
        className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 no-print">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Badge({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}
