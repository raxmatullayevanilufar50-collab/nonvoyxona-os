import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, CheckCircle, Clock, DollarSign } from "lucide-react";

export default function Salaries() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    employeeId: 1,
    baseSalary: "",
    advances: "",
    deductions: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: salaries, isLoading: salariesLoading, refetch } = trpc.salaries.list.useQuery({ limit: 50 });
  const { data: summary } = trpc.salaries.getSummary.useQuery({ month: selectedMonth, year: selectedYear });
  const recordPayment = trpc.salaries.recordPayment.useMutation();
  const markAsPaid = trpc.salaries.markAsPaid.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await recordPayment.mutateAsync({
        employeeId: parseInt(formData.employeeId.toString()),
        month: selectedMonth,
        year: selectedYear,
        baseSalary: parseFloat(formData.baseSalary),
        advances: parseFloat(formData.advances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
      });

      setFormData({
        employeeId: 1,
        baseSalary: "",
        advances: "",
        deductions: "",
      });
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await markAsPaid.mutateAsync({
        id,
        paidDate: new Date(),
        paymentMethod: "cash",
      });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("salaries.title")}</h1>
            <p className="text-amber-700">{t("dashboard.overview")}</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus size={20} className="mr-2" />
            {t("salaries.newPayment")}
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{t("salaries.totalBaseSalary")}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.summary.totalBaseSalary.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{t("salaries.totalNetSalary")}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.summary.totalNetSalary.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{t("salaries.paid")}</p>
                    <p className="text-2xl font-bold text-green-600">{summary.summary.paidCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="text-orange-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">{t("salaries.unpaid")}</p>
                    <p className="text-2xl font-bold text-orange-600">{summary.summary.unpaidCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="border-2 border-amber-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("salaries.recordPayment")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("common.month")}
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {t(`common.month${m}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("common.year")}
                    </label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("salaries.employeeId")}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("salaries.baseSalary")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("salaries.advances")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.advances}
                      onChange={(e) => setFormData({ ...formData, advances: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("salaries.deductions")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.deductions}
                      onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("common.save")
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Salaries List */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("salaries.paymentsList")}</CardTitle>
            <CardDescription>{t("dashboard.overview")}</CardDescription>
          </CardHeader>
          <CardContent>
            {salariesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : salaries && salaries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("salaries.employeeId")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.month")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("salaries.baseSalary")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("salaries.netSalary")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.status")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map((sal) => (
                      <tr key={sal.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <td className="py-3 px-4">{sal.id}</td>
                        <td className="py-3 px-4">{sal.employeeId}</td>
                        <td className="py-3 px-4">
                          {sal.month}/{sal.year}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {parseFloat(sal.baseSalary.toString()).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          {parseFloat(sal.netSalary.toString()).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              sal.isPaid
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {sal.isPaid ? t("common.paid") : t("common.unpaid")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {!sal.isPaid && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(sal.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              {t("common.markAsPaid")}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>{t("common.noData")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
