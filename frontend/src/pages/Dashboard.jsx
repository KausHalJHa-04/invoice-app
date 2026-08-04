import { useEffect, useState } from "react";
import api from "../api/axios";
import { Card } from "../components/UI";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [mode, setMode] = useState("daily");
  const [graph, setGraph] = useState([]);

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => setSummary(res.data));
  }, []);

  useEffect(() => {
    api.get(`/dashboard/sales-graph?mode=${mode}`).then((res) => setGraph(res.data));
  }, [mode]);

  const chartData = {
    labels: graph.map((g) => g.label),
    datasets: [
      {
        label: "Sales (₹)",
        data: graph.map((g) => g.total),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.15)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const stats = [
    { label: "Today's Sales", value: summary ? `₹${summary.todaySales.toLocaleString("en-IN")}` : "—", sub: summary ? `${summary.todayInvoiceCount} invoices` : "" },
    { label: "Total Customers", value: summary?.totalCustomers ?? "—" },
    { label: "Total Products", value: summary?.totalProducts ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
            {s.sub && <p className="text-xs text-slate-400 mt-1">{s.sub}</p>}
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Sales Graph</h3>
          <div className="flex gap-2">
            {["daily", "monthly"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                  mode === m ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {graph.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">No sales data yet</p>
        ) : (
          <Line data={chartData} />
        )}
      </Card>
    </div>
  );
}
