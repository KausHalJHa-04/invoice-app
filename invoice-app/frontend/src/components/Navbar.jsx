import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 no-print">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500 hidden sm:block">{user?.email}</span>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
