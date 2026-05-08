import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Loader2, AlertTriangle } from "lucide-react";

export default function Ingredients() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "kg",
    minStockLevel: "",
    unitCost: "",
    supplier: "",
  });
  const [purchaseData, setPurchaseData] = useState({
    quantity: "",
    unitCost: "",
    supplier: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: ingredients, isLoading: ingredientsLoading, refetch } = trpc.ingredients.list.useQuery({});
  const { data: lowStock } = trpc.ingredients.getLowStock.useQuery();
  const createIngredient = trpc.ingredients.create.useMutation();
  const recordPurchase = trpc.ingredients.recordPurchase.useMutation();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createIngredient.mutateAsync({
        name: formData.name,
        unit: formData.unit,
        minStockLevel: parseFloat(formData.minStockLevel || "0"),
        unitCost: parseFloat(formData.unitCost),
        supplier: formData.supplier,
      });

      setFormData({
        name: "",
        unit: "kg",
        minStockLevel: "",
        unitCost: "",
        supplier: "",
      });
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    setError(null);
    setLoading(true);

    try {
      await recordPurchase.mutateAsync({
        ingredientId: selectedIngredient,
        quantity: parseFloat(purchaseData.quantity),
        unitCost: parseFloat(purchaseData.unitCost),
        supplier: purchaseData.supplier,
      });

      setPurchaseData({
        quantity: "",
        unitCost: "",
        supplier: "",
      });
      setShowPurchaseForm(false);
      setSelectedIngredient(null);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("ingredients.title")}</h1>
            <p className="text-amber-700">{t("dashboard.overview")}</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus size={20} className="mr-2" />
            {t("ingredients.newIngredient")}
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStock && lowStock.length > 0 && (
          <Alert className="mb-8 border-2 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{t("ingredients.lowStockAlert")}:</strong> {lowStock.length} ingredient(s) are below minimum stock level
            </AlertDescription>
          </Alert>
        )}

        {/* Create Ingredient Form */}
        {showForm && (
          <Card className="border-2 border-amber-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("ingredients.addIngredient")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("ingredients.name")}
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
                      {t("ingredients.unit")}
                    </label>
                    <Input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("ingredients.minStockLevel")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("ingredients.unitCost")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("ingredients.supplier")}
                    </label>
                    <Input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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

        {/* Ingredients List */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("ingredients.ingredientsList")}</CardTitle>
            <CardDescription>{t("ingredients.inventory")}</CardDescription>
          </CardHeader>
          <CardContent>
            {ingredientsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : ingredients && ingredients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("ingredients.name")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("ingredients.unit")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("ingredients.currentStock")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("ingredients.minStockLevel")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("ingredients.unitCost")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => {
                      const isLowStock =
                        parseFloat(ingredient.currentStock.toString()) <=
                        parseFloat(ingredient.minStockLevel.toString());
                      return (
                        <tr
                          key={ingredient.id}
                          className={`border-b border-amber-100 ${isLowStock ? "bg-red-50" : "hover:bg-amber-50"}`}
                        >
                          <td className="py-3 px-4 font-medium">{ingredient.name}</td>
                          <td className="py-3 px-4">{ingredient.unit}</td>
                          <td className="py-3 px-4">{ingredient.currentStock}</td>
                          <td className="py-3 px-4">{ingredient.minStockLevel}</td>
                          <td className="py-3 px-4">{ingredient.unitCost} UZS</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedIngredient(ingredient.id);
                                setShowPurchaseForm(true);
                              }}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <Plus size={16} />
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

        {/* Purchase Form Modal */}
        {showPurchaseForm && selectedIngredient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="border-2 border-amber-200 w-full max-w-md shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle>{t("ingredients.newPurchase")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("ingredients.quantity")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchaseData.quantity}
                      onChange={(e) => setPurchaseData({ ...purchaseData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("ingredients.unitCost")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchaseData.unitCost}
                      onChange={(e) => setPurchaseData({ ...purchaseData, unitCost: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("ingredients.supplier")}
                    </label>
                    <Input
                      type="text"
                      value={purchaseData.supplier}
                      onChange={(e) => setPurchaseData({ ...purchaseData, supplier: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPurchaseForm(false);
                        setSelectedIngredient(null);
                      }}
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
          </div>
        )}
      </div>
    </div>
  );
}
