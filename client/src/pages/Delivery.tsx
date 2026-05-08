import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, Truck, CheckCircle, Clock, DollarSign } from "lucide-react";

export default function Delivery() {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    driverId: 1,
    customerId: 1,
    quantity: "",
    deliveryDate: new Date().toISOString().split("T")[0],
  });
  const [settlementForm, setSettlementForm] = useState({
    driverId: 1,
    completedDeliveries: "",
    returnedQuantity: "",
    advances: "",
  });
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: deliveries, isLoading: deliveriesLoading, refetch } = trpc.delivery.list.useQuery({});
  const { data: settlements } = trpc.delivery.getSettlements.useQuery({});
  const createDelivery = trpc.delivery.create.useMutation();
  const recordSettlement = trpc.delivery.recordSettlement.useMutation();
  const updateDeliveryStatus = trpc.delivery.updateStatus.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createDelivery.mutateAsync({
        driverId: parseInt(formData.driverId.toString()),
        totalQuantity: parseInt(formData.quantity),
        deliveryDate: new Date(formData.deliveryDate),
      });

      setFormData({
        driverId: 1,
        customerId: 1,
        quantity: "",
        deliveryDate: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await recordSettlement.mutateAsync({
        driverId: parseInt(settlementForm.driverId.toString()),
        totalEarnings: parseInt(settlementForm.completedDeliveries) * 100000, // Placeholder calculation
        returnDeductions: parseInt(settlementForm.returnedQuantity) * 50000,
        advances: parseFloat(settlementForm.advances) || 0,
        settlementDate: new Date(),
      });

      setSettlementForm({
        driverId: 1,
        completedDeliveries: "",
        returnedQuantity: "",
        advances: "",
      });
      setShowSettlementForm(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: "pending" | "in_transit" | "completed" | "returned") => {
    try {
      await updateDeliveryStatus.mutateAsync({ id, status });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.operationFailed"));
    }
  };

  const stats = [
    {
      label: t("delivery.totalDeliveries"),
      value: deliveries?.length || 0,
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: t("delivery.completed"),
      value: deliveries?.filter((d) => d.status === "completed").length || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: t("delivery.pending"),
      value: deliveries?.filter((d) => d.status === "pending").length || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("delivery.title")}</h1>
            <p className="text-amber-700">{t("dashboard.overview")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSettlementForm(!showSettlementForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus size={20} className="mr-2" />
              {t("delivery.recordSettlement")}
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Plus size={20} className="mr-2" />
              {t("delivery.newDelivery")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-2 border-amber-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                      <Icon className={stat.color} size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Settlement Form */}
        {showSettlementForm && (
          <Card className="border-2 border-purple-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle>{t("delivery.recordSettlement")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleRecordSettlement} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("delivery.driverId")}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={settlementForm.driverId}
                      onChange={(e) =>
                        setSettlementForm({ ...settlementForm, driverId: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("delivery.completedDeliveries")}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={settlementForm.completedDeliveries}
                      onChange={(e) =>
                        setSettlementForm({ ...settlementForm, completedDeliveries: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("delivery.returnedQuantity")}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={settlementForm.returnedQuantity}
                      onChange={(e) =>
                        setSettlementForm({ ...settlementForm, returnedQuantity: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("delivery.advances")}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settlementForm.advances}
                      onChange={(e) => setSettlementForm({ ...settlementForm, advances: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSettlementForm(false)}
                    disabled={loading}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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

        {/* Delivery Form */}
        {showForm && (
          <Card className="border-2 border-amber-200 mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("delivery.addDelivery")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("delivery.driverId")}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.driverId}
                      onChange={(e) =>
                        setFormData({ ...formData, driverId: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("delivery.customerId")}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.customerId}
                      onChange={(e) =>
                        setFormData({ ...formData, customerId: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("delivery.quantity")}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("common.date")}
                    </label>
                    <Input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      required
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

        {/* Deliveries List */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle>{t("delivery.deliveriesList")}</CardTitle>
            <CardDescription>{t("dashboard.overview")}</CardDescription>
          </CardHeader>
          <CardContent>
            {deliveriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : deliveries && deliveries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("delivery.driverId")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("delivery.customerId")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("delivery.quantity")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.status")}
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
                    {deliveries.map((del) => (
                      <tr key={del.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <td className="py-3 px-4">{del.id}</td>
                        <td className="py-3 px-4">{del.driverId}</td>
                        <td className="py-3 px-4">Customer</td>
                        <td className="py-3 px-4 font-semibold">{del.totalQuantity}</td>
                        <td className="py-3 px-4">
                          <select
                            value={del.status}
                            onChange={(e) =>
                              handleUpdateStatus(
                                del.id,
                                e.target.value as "pending" | "in_transit" | "completed" | "returned"
                              )
                            }
                            className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${
                              del.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : del.status === "in_transit"
                                  ? "bg-blue-100 text-blue-800"
                                  : del.status === "returned"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_transit">In Transit</option>
                            <option value="completed">Completed</option>
                            <option value="returned">Returned</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">{new Date(del.deliveryDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="ghost" className="text-blue-600">
                            View
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

        {/* Settlements List */}
        {settlements && settlements.length > 0 && (
          <Card className="border-2 border-purple-200 shadow-lg mt-8">
            <CardHeader>
              <CardTitle>{t("delivery.recentSettlements")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-purple-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("delivery.driverId")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("delivery.completedDeliveries")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("delivery.earnings")}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {t("common.date")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b border-purple-100 hover:bg-purple-50">
                        <td className="py-3 px-4">{settlement.driverId}</td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          {parseFloat(settlement.netPayout.toString()).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{new Date(settlement.settlementDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
