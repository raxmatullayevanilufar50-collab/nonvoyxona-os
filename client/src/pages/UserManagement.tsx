import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function UserManagement() {
  const { t } = useI18n();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phoneNumber: "",
    pinCode: "",
    role: "cashier",
  });

  // Placeholder for users list
  const users: any[] = [];
  const isLoading = false;

  const handleAddUser = async () => {
    if (!formData.name || !formData.pinCode || formData.pinCode.length < 4) {
      toast.error(t("errors.requiredFields"));
      return;
    }

    try {
      toast.success(t("messages.success"));
      setIsAddDialogOpen(false);
      setFormData({ name: "", surname: "", phoneNumber: "", pinCode: "", role: "cashier" });
    } catch (error) {
      toast.error(t("errors.operationFailed"));
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm(t("common.delete"))) return;

    try {
      toast.success(t("messages.success"));
    } catch (error) {
      toast.error(t("errors.operationFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">{t("nav.users")}</h1>
          <p className="text-amber-700">{t("messages.manageUsers")}</p>
        </div>

        {/* Add User Button */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {t("common.add")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-amber-200">
              <DialogHeader>
                <DialogTitle className="text-amber-900">{t("common.add")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">{t("fields.name")}</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("fields.name")}
                    className="border-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">{t("fields.surname")}</label>
                  <Input
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    placeholder={t("fields.surname")}
                    className="border-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">{t("fields.phoneNumber")}</label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder={t("fields.phoneNumber")}
                    className="border-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">{t("fields.pinCode")}</label>
                  <Input
                    type="password"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder={t("fields.pinCode")}
                    className="border-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">{t("fields.role")}</label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">{t("roles.manager")}</SelectItem>
                      <SelectItem value="cashier">{t("roles.cashier")}</SelectItem>
                      <SelectItem value="driver">{t("roles.driver")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  {t("common.save")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-8 text-amber-700">{t("messages.loading")}</div>
          ) : users.length === 0 ? (
            <Card className="p-8 text-center border-amber-200 bg-white/50">
              <p className="text-amber-700">{t("messages.noData")}</p>
            </Card>
          ) : (
            users.map((user: any) => (
              <Card key={user.id} className="p-4 border-amber-200 bg-white/50 hover:bg-white/80 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">
                      {user.name} {user.surname}
                    </h3>
                    <p className="text-sm text-amber-700">{user.phoneNumber}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {t("fields.role")}: {t(`roles.${user.role}`)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
