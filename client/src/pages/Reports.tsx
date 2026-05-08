import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Calendar, Filter, Loader2 } from "lucide-react";

export default function Reports() {
  const { t } = useI18n();
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "year">("month");
  const [reportType, setReportType] = useState<"sales" | "expenses" | "profit" | "production">("sales");

  const { data: dashboardData, isLoading } = trpc.dashboard.getMetrics.useQuery({});

  // Sample data for charts (in production, this would come from backend)
  const salesData = [
    { date: "2026-05-01", sales: 5000000, target: 4000000 },
    { date: "2026-05-02", sales: 6200000, target: 4000000 },
    { date: "2026-05-03", sales: 4800000, target: 4000000 },
    { date: "2026-05-04", sales: 7100000, target: 4000000 },
    { date: "2026-05-05", sales: 5900000, target: 4000000 },
    { date: "2026-05-06", sales: 8300000, target: 4000000 },
    { date: "2026-05-07", sales: 6500000, target: 4000000 },
    { date: "2026-05-08", sales: 7200000, target: 4000000 },
  ];

  const expenseData = [
    { category: t("expenses.categories.utilities"), amount: 2000000 },
    { category: t("expenses.categories.rent"), amount: 5000000 },
    { category: t("expenses.categories.maintenance"), amount: 1500000 },
    { category: t("expenses.categories.fuel"), amount: 1000000 },
    { category: t("expenses.categories.other"), amount: 800000 },
  ];

  const productionData = [
    { product: "Lepinja", quantity: 250 },
    { product: "Somsa", quantity: 180 },
    { product: "Plov", quantity: 120 },
    { product: "Nan", quantity: 300 },
    { product: "Qatlamali", quantity: 90 },
  ];

  const COLORS = ["#f59e0b", "#f97316", "#fb923c", "#fbbf24", "#fcd34d"];

  const handleExportPDF = () => {
    // In production, implement PDF export
    alert(t("reports.exportSuccess"));
  };

  const handleExportExcel = () => {
    // In production, implement Excel export
    alert(t("reports.exportSuccess"));
  };

  const stats = [
    {
      label: t("dashboard.totalSales"),
      value: dashboardData?.totalSales || 0,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: t("dashboard.totalExpenses"),
      value: dashboardData?.totalExpenses || 0,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      label: t("dashboard.netProfit"),
      value: (dashboardData?.totalSales || 0) - (dashboardData?.totalExpenses || 0),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: t("dashboard.totalDebt"),
      value: dashboardData?.totalDebt || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("reports.title")}</h1>
          <p className="text-amber-700">{t("dashboard.overview")}</p>
        </div>

        {/* Filters & Export */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-2 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex gap-2 flex-wrap">
                <Filter size={20} className="text-amber-600" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-3 py-1 border border-amber-300 rounded-lg text-sm"
                >
                  <option value="today">{t("reports.today")}</option>
                  <option value="week">{t("reports.thisWeek")}</option>
                  <option value="month">{t("reports.thisMonth")}</option>
                  <option value="year">{t("reports.thisYear")}</option>
                </select>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="px-3 py-1 border border-amber-300 rounded-lg text-sm"
                >
                  <option value="sales">{t("reports.salesReport")}</option>
                  <option value="expenses">{t("reports.expenseReport")}</option>
                  <option value="profit">{t("reports.profitReport")}</option>
                  <option value="production">{t("reports.productionReport")}</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  onClick={handleExportPDF}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 flex-1"
                >
                  <Download size={16} className="mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={handleExportExcel}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex-1"
                >
                  <Download size={16} className="mr-2" />
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-2 border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className={`p-3 ${stat.bgColor} rounded-lg inline-block mb-3`}>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle>{t("reports.salesTrend")}</CardTitle>
              <CardDescription>{t("reports.last8Days")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2} name={t("dashboard.totalSales")} />
                  <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" name={t("reports.target")} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle>{t("reports.expenseBreakdown")}</CardTitle>
              <CardDescription>{t("reports.byCategoryPercentage")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, amount }) => `${category}: ${amount.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Production Chart */}
        <Card className="border-2 border-amber-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>{t("reports.productionSummary")}</CardTitle>
            <CardDescription>{t("reports.quantityByProduct")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#f97316" name={t("production.quantity")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Table */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("reports.detailedSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-amber-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">{t("reports.metric")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{t("reports.today")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{t("reports.thisWeek")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{t("reports.thisMonth")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{t("reports.thisYear")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="py-3 px-4 font-semibold">{t("dashboard.totalSales")}</td>
                    <td className="text-right py-3 px-4">7,200,000</td>
                    <td className="text-right py-3 px-4">51,000,000</td>
                    <td className="text-right py-3 px-4">204,000,000</td>
                    <td className="text-right py-3 px-4">2,040,000,000</td>
                  </tr>
                  <tr className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="py-3 px-4 font-semibold">{t("dashboard.totalExpenses")}</td>
                    <td className="text-right py-3 px-4">2,100,000</td>
                    <td className="text-right py-3 px-4">14,700,000</td>
                    <td className="text-right py-3 px-4">58,800,000</td>
                    <td className="text-right py-3 px-4">588,000,000</td>
                  </tr>
                  <tr className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="py-3 px-4 font-semibold">{t("dashboard.netProfit")}</td>
                    <td className="text-right py-3 px-4 text-green-600 font-bold">5,100,000</td>
                    <td className="text-right py-3 px-4 text-green-600 font-bold">36,300,000</td>
                    <td className="text-right py-3 px-4 text-green-600 font-bold">145,200,000</td>
                    <td className="text-right py-3 px-4 text-green-600 font-bold">1,452,000,000</td>
                  </tr>
                  <tr className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="py-3 px-4 font-semibold">{t("dashboard.totalDebt")}</td>
                    <td className="text-right py-3 px-4">1,200,000</td>
                    <td className="text-right py-3 px-4">8,400,000</td>
                    <td className="text-right py-3 px-4">33,600,000</td>
                    <td className="text-right py-3 px-4">336,000,000</td>
                  </tr>
                  <tr className="hover:bg-amber-50">
                    <td className="py-3 px-4 font-semibold">{t("reports.profitMargin")}</td>
                    <td className="text-right py-3 px-4">70.8%</td>
                    <td className="text-right py-3 px-4">71.2%</td>
                    <td className="text-right py-3 px-4">71.2%</td>
                    <td className="text-right py-3 px-4">71.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
