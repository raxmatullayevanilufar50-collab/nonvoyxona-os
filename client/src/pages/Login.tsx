import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<"role-select" | "pin" | "secret">("role-select");
  const [selectedRole, setSelectedRole] = useState<"owner" | "manager" | "cashier" | "driver" | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "owner" as const, label: t("roles.owner"), color: "bg-purple-500" },
    { id: "manager" as const, label: t("roles.manager"), color: "bg-blue-500" },
    { id: "cashier" as const, label: t("roles.cashier"), color: "bg-green-500" },
    { id: "driver" as const, label: t("roles.driver"), color: "bg-orange-500" },
  ];

  const handleRoleSelect = (role: typeof selectedRole) => {
    setSelectedRole(role);
    setStep("pin");
    setError(null);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pinCode || pinCode.length < 4) {
      setError(t("errors.invalidPin"));
      return;
    }

    if (selectedRole === "owner") {
      setStep("secret");
    } else {
      // TODO: Implement actual PIN verification and login
      setLoading(true);
      try {
        // Simulate login
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onLoginSuccess?.();
      } catch (err) {
        setError(t("errors.operationFailed"));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSecretCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!secretCode) {
      setError(t("auth.secretCodeRequired"));
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual secret code verification and login
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onLoginSuccess?.();
    } catch (err) {
      setError(t("errors.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "pin") {
      setSelectedRole(null);
      setStep("role-select");
      setPinCode("");
      setError(null);
    } else if (step === "secret") {
      setStep("pin");
      setSecretCode("");
      setError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Nonvoyxona</h1>
          <p className="text-amber-700">{t("common.loading")}</p>
        </div>

        {/* Role Selection */}
        {step === "role-select" && (
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("auth.selectRole")}</CardTitle>
              <CardDescription className="text-amber-50">
                {t("auth.welcome")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-4 rounded-lg font-semibold text-white transition-all hover:scale-105 ${role.color} hover:shadow-lg`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PIN Entry */}
        {step === "pin" && (
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle>{t("auth.login")}</CardTitle>
              <CardDescription className="text-amber-50">
                {selectedRole && `${t("roles." + selectedRole)} - ${t("auth.enterPin")}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePinSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("auth.pinCode")}
                  </label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="text-center text-2xl tracking-widest font-bold"
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || pinCode.length < 4}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Secret Code Entry (Owner Only) */}
        {step === "secret" && (
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle>{t("auth.login")}</CardTitle>
              <CardDescription className="text-purple-50">
                {t("auth.enterSecretCode")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSecretCodeSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("auth.secretCode")}
                  </label>
                  <Input
                    type="password"
                    placeholder={t("auth.enterSecretCode")}
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !secretCode}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2026 Nonvoyxona OS. {t("common.info")}</p>
        </div>
      </div>
    </div>
  );
}
