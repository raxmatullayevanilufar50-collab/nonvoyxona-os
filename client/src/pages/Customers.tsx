import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Loader2, Users, DollarSign } from "lucide-react";

export default function Customers() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    notes: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    customerId: 0,
    amount: "",
    paymentMethod: "cash" as "cash" | "card" | "check",
    notes: "",
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: customers, isLoading: customersLoading, refetch } = trpc.customers.list.useQuery({ limit: 50 });
  const { data: debtCustomers } = trpc.customers.getWithDebt.useQuery();
  const createCustomer = trpc.customers.create.useMutation();
  const recordPayment = trpc.customers.recordPayment.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createCustomer.mutateAsync({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        notes: formData.notes,
      });

      setFormData({
        name: "",
        phoneNumber: "",
        address: "",
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await recordPayment.mutateAsync({
        customerId: paymentForm.customerId,
        amount: parseFloat(paymentForm.amount),
        paymentDate: new Date(),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes,
      });

      setPaymentForm({
        customerId: 0,
        amount: "",
        paymentMethod: "cash",
        notes: "",
      });
      setShowPaymentForm(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const totalDebt = debtCustomers
    ? debtCustomers.reduce((sum, c) => sum + parseFloat(c.totalDebt.toString()), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("customers.title")}</h1>
            <p className="text-amber-700">{t("dashboard.overview")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Plus size={20} className="mr-2" />
              {t("customers.recordPayment")}
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Plus size={20} className="mr-2" />
              {t("customers.newCustomer")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">{t("customers.totalCustomers")}</p>
                  <p className="text-3xl font-bold text-blue-600">{customers?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="text-orange-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">{t("customers.withDebt")}</p>
                  <p className="text-3xl font-bold text-orange-600">{debtCustomers?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">{t("customers.totalDebt")}</p>
                  <p className="text-3xl font-bold text-red-600">{totalDebt.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <Card className="border-2 border-green-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle>{t("customers.recordPayment")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleRecordPayment} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("customers.customer")}
                    </label>
                    <select
                      value={paymentForm.customerId}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, customerId: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value={0}>Select customer...</option>
                      {debtCustomers?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({parseFloat(c.totalDebt.toString()).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("customers.amount")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("customers.paymentMethod")}
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentMethod: e.target.value as "cash" | "card" | "check",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.notes")}
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPaymentForm(false)}
                    disabled={loading}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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

        {/* Customer Form */}
        {showForm && (
          <Card className="border-2 border-amber-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("customers.addCustomer")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("customers.name")}
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("customers.phoneNumber")}
                    </label>
                    <Input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("customers.address")}
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

        {/* Customers List */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("customers.customersList")}</CardTitle>
            <CardDescription>{t("dashboard.overview")}</CardDescription>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : customers && customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("customers.name")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("customers.phoneNumber")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("customers.totalDebt")}
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
                    {customers.map((cust) => {
                      const debt = parseFloat(cust.totalDebt.toString());
                      return (
                        <tr key={cust.id} className="border-b border-amber-100 hover:bg-amber-50">
                          <td className="py-3 px-4">{cust.id}</td>
                          <td className="py-3 px-4 font-semibold">{cust.name}</td>
                          <td className="py-3 px-4">{cust.phoneNumber}</td>
                          <td className="py-3 px-4 font-semibold text-red-600">
                            {debt.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                debt > 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {debt > 0 ? t("customers.indebted") : t("common.clear")}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
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
