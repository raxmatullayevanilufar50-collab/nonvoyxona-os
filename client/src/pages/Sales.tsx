import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import { voiceService } from "@/services/voiceService";

export default function Sales() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: 1,
    quantity: "",
    unitPrice: "",
    paymentMethod: "cash" as "cash" | "card" | "debt",
    amountPaid: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: sales, isLoading: salesLoading, refetch } = trpc.sales.list.useQuery({ limit: 50 });
  const createSale = trpc.sales.create.useMutation();
  const deleteSale = trpc.sales.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createSale.mutateAsync({
        productId: parseInt(formData.productId.toString()),
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        paymentMethod: formData.paymentMethod,
        amountPaid: formData.paymentMethod === "debt" ? parseFloat(formData.amountPaid || "0") : parseFloat(formData.unitPrice) * parseFloat(formData.quantity),
        notes: formData.notes,
      });

      setFormData({
        productId: 1,
        quantity: "",
        unitPrice: "",
        paymentMethod: "cash",
        amountPaid: "",
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
      await deleteSale.mutateAsync({ id });
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
            <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("sales.title")}</h1>
            <p className="text-amber-700">{t("dashboard.overview")}</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus size={20} className="mr-2" />
            {t("sales.newSale")}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-2 border-amber-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("sales.addSale")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Voice Input Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">🎤 Ovozli Kiritish</h3>
                  <VoiceInput
                    onTranscript={(text) => {
                      // Parse voice input for product ID
                      const numbers = voiceService.extractNumbers(text);
                      if (numbers.length > 0) {
                        setFormData({ ...formData, productId: numbers[0] });
                      }
                    }}
                    onComplete={(text) => {
                      // Auto-fill fields from voice
                      const numbers = voiceService.extractNumbers(text);
                      if (numbers.length >= 3) {
                        setFormData({
                          ...formData,
                          productId: numbers[0],
                          quantity: numbers[1].toString(),
                          unitPrice: numbers[2].toString(),
                        });
                      }
                    }}
                    placeholder="Mahsulot raqami, miqdori va narxni ayting..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("sales.product")}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.productId}
                      onChange={(e) =>
                        setFormData({ ...formData, productId: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("sales.quantity")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("sales.price")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("sales.paymentMethod")}
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value as "cash" | "card" | "debt",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="cash">{t("sales.cash")}</option>
                      <option value="card">{t("sales.card")}</option>
                      <option value="debt">{t("sales.debt")}</option>
                    </select>
                  </div>

                  {formData.paymentMethod === "debt" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("sales.amountPaid")}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                      />
                    </div>
                  )}
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

        {/* Sales List */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("sales.salesList")}</CardTitle>
            <CardDescription>{t("dashboard.recentTransactions")}</CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : sales && sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("sales.product")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("sales.quantity")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("sales.totalAmount")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("sales.paymentMethod")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <td className="py-3 px-4">{sale.id}</td>
                        <td className="py-3 px-4">Product #{sale.productId}</td>
                        <td className="py-3 px-4">{sale.quantity}</td>
                        <td className="py-3 px-4 font-semibold">{sale.totalAmount} UZS</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                            {t(`sales.${sale.paymentMethod}`)}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {}}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(sale.id)}
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
