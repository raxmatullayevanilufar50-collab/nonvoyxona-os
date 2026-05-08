import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Loader2, DollarSign } from "lucide-react";

export default function Expenses() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: 1,
    amount: "",
    description: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: expenses, isLoading: expensesLoading, refetch } = trpc.expenses.list.useQuery({ limit: 50 });
  const { data: categories } = trpc.expenses.getCategories.useQuery();
  const createExpense = trpc.expenses.create.useMutation();
  const deleteExpense = trpc.expenses.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createExpense.mutateAsync({
        categoryId: parseInt(formData.categoryId.toString()),
        amount: parseFloat(formData.amount),
        description: formData.description,
        expenseDate: new Date(),
        notes: formData.notes,
      });

      setFormData({
        categoryId: 1,
        amount: "",
        description: "",
        notes: "",
      });
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("common.confirm"))) return;

    try {
      await deleteExpense.mutateAsync({ id });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    }
  };

  const totalExpenses = expenses
    ? expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("expenses.title")}</h1>
            <p className="text-amber-700">{t("dashboard.overview")}</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus size={20} className="mr-2" />
            {t("expenses.newExpense")}
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="border-2 border-amber-200 mb-8 shadow-lg bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg">
                <DollarSign className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("expenses.totalExpenses")}</p>
                <p className="text-3xl font-bold text-red-600">{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        {showForm && (
          <Card className="border-2 border-amber-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("expenses.addExpense")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("expenses.category")}
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("expenses.amount")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("expenses.description")}
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.notes")}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
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

        {/* Expenses List */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("expenses.expensesList")}</CardTitle>
            <CardDescription>{t("dashboard.overview")}</CardDescription>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : expenses && expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("expenses.category")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("expenses.amount")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("expenses.description")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.date")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <td className="py-3 px-4">{exp.id}</td>
                        <td className="py-3 px-4">Category #{exp.categoryId}</td>
                        <td className="py-3 px-4 font-semibold text-red-600">
                          {parseFloat(exp.amount.toString()).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{exp.description}</td>
                        <td className="py-3 px-4">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
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
