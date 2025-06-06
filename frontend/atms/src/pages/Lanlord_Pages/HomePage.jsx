import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast, ToastContainer } from "react-toastify";
import RentalStatusCard from "./RentalStatusCard";

const incomeExpenseData = [
  { month: "Jan", income: 12000, expense: 8000 },
  { month: "Feb", income: 13500, expense: 7500 },
  { month: "Mar", income: 14200, expense: 9500 },
  { month: "Apr", income: 12500, expense: 8600 },
];

const expenseBreakdown = [
  { name: "Maintenance", amount: 3000 },
  { name: "Utilities", amount: 1800 },
  { name: "Repairs", amount: 2800 },
  { name: "Others", amount: 1000 },
];

const incomeByProperty = [
  { name: "Maple Apartments", value: 4500 },
  { name: "Sunset Villas", value: 3200 },
  { name: "Downtown Lofts", value: 2800 },
  { name: "Greenview Homes", value: 1900 },
];

const HomePage = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const notifiedPayments = useRef(new Set());

  useEffect(() => {
    // Show login toast if needed
    const showLoginToast = sessionStorage.getItem("showLoginToast");
    if (showLoginToast === "true") {
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        pauseOnHover: true,
        theme: "colored",
      });
      sessionStorage.removeItem("showLoginToast");
    }

    // Fetch recent payments for notifications
    const fetchRecentPayments = async () => {
      try {
        const userId = sessionStorage.getItem("userID");
        const res = await fetch(
          "http://localhost:5000/api/payments/recent?hours=12",
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const payments = await res.json();

        for (const payment of payments) {
          if (
            payment.landlordId === userId &&
            !notifiedPayments.current.has(payment._id)
          ) {
            toast.success(`Rent received from ${payment.tenantName}`, {
              position: "top-right",
              autoClose: 3000,
              pauseOnHover: true,
              theme: "light",
            });
            notifiedPayments.current.add(payment._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch rent payment notifications:", err);
      }
    };

    // Fetch total income for current month
    const fetchTotalIncome = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    console.log("Fetching payments from", startOfMonth, "to", endOfMonth);

    const res = await fetch(
      `http://localhost:5000/api/payments?startDate=${startOfMonth}&endDate=${endOfMonth}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const payments = await res.json();
    console.log("Payments fetched for income:", payments);

    const userId = sessionStorage.getItem("userID");
    const filteredPayments = payments.filter(p => p.landlordId === userId);
    const incomeSum = filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    
    setTotalIncome(incomeSum);
  } catch (err) {
    console.error("Failed to fetch total income:", err);
    setTotalIncome(0);
  } finally {
    setLoadingIncome(false);
  }
};


    fetchRecentPayments();
    fetchTotalIncome();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Landlord Dashboard</h1>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Total Properties" value="12" textColor="text-blue-600" />
        <Card title="Active Tenants" value="38" textColor="text-blue-600" />
        <Card title="Pending Maintenance" value="4" textColor="text-blue-600" />
        <Card
          title="Total Income (This Month)"
          value={loadingIncome ? "Loading..." : `PKR ${totalIncome.toLocaleString()}`}
          textColor="text-green-600"
        />
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {expenseBreakdown.map((item) => (
          <Card
            key={item.name}
            title={item.name}
            value={`PKR ${item.amount.toLocaleString()}`}
            textColor="text-red-600"
          />
        ))}
      </div>

      {/* Rental Status Card */}
      <RentalStatusCard />
      <br />

      {/* Maintenance Summary */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Maintenance Requests</h3>
        <ul className="space-y-3">
          <li className="flex justify-between text-sm">
            <span>Plumbing - Apt 12B</span>
            <span className="text-red-500">Pending</span>
          </li>
          <li className="flex justify-between text-sm">
            <span>AC - Apt 4A</span>
            <span className="text-green-500">Resolved</span>
          </li>
          <li className="flex justify-between text-sm">
            <span>Lighting - Apt 9C</span>
            <span className="text-yellow-500">In Progress</span>
          </li>
        </ul>
      </div>

      <br />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenseBreakdown}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expense Comparison Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Income vs Expense (Monthly)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={incomeExpenseData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income by Property Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Income by Property</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeByProperty}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#3B82F6"
                label
              >
                {incomeByProperty.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF"][index % 4]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, textColor = "text-blue-600" }) => (
  <div className="bg-white shadow rounded-xl p-6">
    <h3 className="text-sm text-gray-500">{title}</h3>
    <p className={`text-2xl font-semibold mt-2 ${textColor}`}>{value}</p>
  </div>
);

export default HomePage;