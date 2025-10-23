import React, { useEffect, useState } from "react";
import { getOrders } from "@/services/orders";
import AppLayout from "@/layouts/app-layout";

export default function DashboardOrders() {
  const [activeTab, setActiveTab] = useState<"buyer" | "owner">("buyer");
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [ownerOrders, setOwnerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your dashboard.");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("http://127.0.0.1:8000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://127.0.0.1:8000/api/owner-orders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([buyerRes, ownerRes]) => {
        const buyerData = await buyerRes.json();
        const ownerData = await ownerRes.json();
        setBuyerOrders(buyerData?.data || buyerData || []);
        setOwnerOrders(ownerData?.data || ownerData || []);
      })
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, [token]);

  const statusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderOrderTable = (orders: any[]) => (
    <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-xl mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total (RM)</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{o.id}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {(() => {
                  const car = o.car;
                  if (!car) return `Car #${o.car_id}`;
                  const make = car.make?.name || "";
                  const model = car.model?.name || "";
                  const variant = car.variant?.name || "";
                  const year = car.year ? String(car.year) : "";
                  const title = [make, model, variant, year].filter(Boolean).join(" ");
                  return title || `Car #${o.car_id}`;
                })()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                RM {Number(o.total_price).toLocaleString("en-MY", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${statusClass(o.status)}`}
                >
                  {o.status || "Unknown"}
                </span>
              </td>
              <td className="px-6 py-4 space-x-3">
                <a
                  href={`/orders/${o.id}`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto mt-10 px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("buyer")}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === "buyer"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-indigo-500"
            }`}
          >
            🛒 Buyer Orders
          </button>
          <button
            onClick={() => setActiveTab("owner")}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === "owner"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-indigo-500"
            }`}
          >
            🚘 Owner Orders
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading orders...</p>
        ) : error ? (
          <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        ) : activeTab === "buyer" ? (
          buyerOrders.length ? (
            renderOrderTable(buyerOrders)
          ) : (
            <p className="text-gray-600 text-center py-10">No buyer orders yet.</p>
          )
        ) : ownerOrders.length ? (
          renderOrderTable(ownerOrders)
        ) : (
          <p className="text-gray-600 text-center py-10">No owner orders yet.</p>
        )}
      </div>
    </AppLayout>
  );
}


