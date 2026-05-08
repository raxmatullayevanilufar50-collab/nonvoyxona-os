import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Loader2, X } from "lucide-react";

export default function Production() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: 1,
    quantity: "",
    notes: "",
  });
  const [consumptions, setConsumptions] = useState<Array<{ ingredientId: number; quantityUsed: string }>>([]);
  const [newConsumption, setNewConsumption] = useState({ ingredientId: 1, quantityUsed: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: production, isLoading: productionLoading, refetch } = trpc.production.list.useQuery({ limit: 50 });
  const createProduction = trpc.production.create.useMutation();
  const deleteProduction = trpc.production.delete.useMutation();

  const handleAddConsumption = () => {
    if (newConsumption.quantityUsed) {
      setConsumptions([...consumptions, newConsumption]);
      setNewConsumption({ ingredientId: 1, quantityUsed: "" });
    }
  };

  const handleRemoveConsumption = (index: number) => {
    setConsumptions(consumptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (consumptions.length === 0) {
        setError(t("production.selectIngredients"));
        setLoading(false);
        return;
      }

      await createProduction.mutateAsync({
        productId: parseInt(formData.productId.toString()),
        quantity: parseFloat(formData.quantity),
        ingredientConsumption: consumptions.map((c) => ({
          ingredientId: c.ingredientId,
          quantityUsed: parseFloat(c.quantityUsed),
        })),
        notes: formData.notes,
      });

      setFormData({
        productId: 1,
        quantity: "",
        notes: "",
      });
      setConsumptions([]);
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
      await deleteProduction.mutateAsync({ id });
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
            <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("production.title")}</h1>
            <p className="text-amber-700">{t("dashboard.overview")}</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus size={20} className="mr-2" />
            {t("production.newProduction")}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-2 border-amber-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("production.addProduction")}</CardTitle>
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
                      {t("production.product")}
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
                      {t("production.quantity")}
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
                </div>

                {/* Ingredient Consumption */}
                <div className="border-t-2 border-amber-200 pt-4">
                  <h3 className="font-semibold text-gray-700 mb-4">{t("production.ingredientConsumption")}</h3>

                  <div className="space-y-3 mb-4">
                    {consumptions.map((consumption, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                        <span className="flex-1">
                          Ingredient #{consumption.ingredientId}: {consumption.quantityUsed}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveConsumption(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ingredient ID"
                      value={newConsumption.ingredientId}
                      onChange={(e) =>
                        setNewConsumption({
                          ...newConsumption,
                          ingredientId: parseInt(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t("production.quantity")}
                      value={newConsumption.quantityUsed}
                      onChange={(e) =>
                        setNewConsumption({
                          ...newConsumption,
                          quantityUsed: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleAddConsumption}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
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

        {/* Production List */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("production.productionList")}</CardTitle>
            <CardDescription>{t("dashboard.overview")}</CardDescription>
          </CardHeader>
          <CardContent>
            {productionLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : production && production.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("production.product")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("production.quantity")}
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
                    {production.map((prod) => (
                      <tr key={prod.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <td className="py-3 px-4">{prod.id}</td>
                        <td className="py-3 px-4">Product #{prod.productId}</td>
                        <td className="py-3 px-4">{prod.quantity}</td>
                        <td className="py-3 px-4">{new Date(prod.productionDate).toLocaleDateString()}</td>
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
                            onClick={() => handleDelete(prod.id)}
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
