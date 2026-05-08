import React from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { t } = useI18n();
  const { user, logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Sample data for charts
  const salesData = [
    { date: "1-kun", sales: 120000, expenses: 45000 },
    { date: "2-kun", sales: 150000, expenses: 50000 },
    { date: "3-kun", sales: 130000, expenses: 48000 },
    { date: "4-kun", sales: 180000, expenses: 55000 },
    { date: "5-kun", sales: 160000, expenses: 52000 },
    { date: "6-kun", sales: 200000, expenses: 60000 },
    { date: "7-kun", sales: 190000, expenses: 58000 },
  ];

  const categoryData = [
    { name: "Non", value: 45 },
    { name: "Qo'g'on", value: 30 },
    { name: "Keks", value: 15 },
    { name: "Boshqa", value: 10 },
  ];

  const COLORS = ["#f59e0b", "#f97316", "#fb923c", "#fbbf24"];

  const stats = [
    {
      label: t("dashboard.todaySales"),
      value: "2,450,000",
      currency: "UZS",
      color: "from-green-500 to-emerald-500",
      icon: "📊",
    },
    {
      label: t("dashboard.todayExpenses"),
      value: "450,000",
      currency: "UZS",
      color: "from-red-500 to-rose-500",
      icon: "💸",
    },
    {
      label: t("dashboard.todayProfit"),
      value: "2,000,000",
      currency: "UZS",
      color: "from-blue-500 to-cyan-500",
      icon: "💰",
    },
    {
      label: t("dashboard.totalDebt"),
      value: "1,250,000",
      currency: "UZS",
      color: "from-orange-500 to-amber-500",
      icon: "📋",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-amber-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-amber-900">Nonvoyxona</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-800">{user?.name || "Foydalanuvchi"}</p>
              <p className="text-sm text-gray-600">{t(`roles.${user?.role || "cashier"}`)}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r-2 border-amber-200 p-6 shadow-sm">
            <nav className="space-y-2">
              {[
                { label: t("dashboard.title"), icon: "📊" },
                { label: t("sales.title"), icon: "🛒" },
                { label: t("production.title"), icon: "🏭" },
                { label: t("ingredients.title"), icon: "🥘" },
                { label: t("delivery.title"), icon: "🚚" },
                { label: t("expenses.title"), icon: "💳" },
                { label: t("salaries.title"), icon: "💼" },
                { label: t("customers.title"), icon: "👥" },
                { label: t("reports.title"), icon: "📈" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-medium text-gray-700 hover:text-amber-900"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.title")}</h2>
              <p className="text-gray-600">{t("dashboard.overview")}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="border-2 border-amber-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${stat.color} p-6 text-white`}>
                      <div className="text-4xl mb-2">{stat.icon}</div>
                      <p className="text-sm opacity-90">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      <p className="text-xs opacity-75 mt-1">{stat.currency}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Sales Chart */}
              <Card className="lg:col-span-2 border-2 border-amber-200">
                <CardHeader>
                  <CardTitle>{t("dashboard.charts")}</CardTitle>
                  <CardDescription>{t("reports.dailyReport")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name={t("reports.revenue")}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name={t("reports.expenses")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Pie Chart */}
              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <CardTitle>{t("production.title")}</CardTitle>
                  <CardDescription>{t("dashboard.overview")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle>{t("dashboard.recentTransactions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-amber-200">
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">
                          {t("sales.product")}
                        </th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">
                          {t("sales.quantity")}
                        </th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">
                          {t("sales.totalAmount")}
                        </th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">
                          {t("sales.paymentMethod")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-amber-100 hover:bg-amber-50">
                          <td className="py-3 px-4">Non #{i}</td>
                          <td className="py-3 px-4">50 dona</td>
                          <td className="py-3 px-4">250,000 UZS</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {t("sales.cash")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
