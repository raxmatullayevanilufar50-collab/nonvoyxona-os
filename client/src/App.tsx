import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Production from "./pages/Production";
import Ingredients from "./pages/Ingredients";
import Expenses from "./pages/Expenses";
import Salaries from "./pages/Salaries";
import Customers from "./pages/Customers";
import Delivery from "./pages/Delivery";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"}>
        {() => <Login />}
      </Route>
      <Route path={"/dashboard"}>
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path={"/sales"}>
        {() => <ProtectedRoute component={Sales} />}
      </Route>
      <Route path={"/production"}>
        {() => <ProtectedRoute component={Production} />}
      </Route>
      <Route path={"/ingredients"}>
        {() => <ProtectedRoute component={Ingredients} />}
      </Route>
      <Route path={"/expenses"}>
        {() => <ProtectedRoute component={Expenses} />}
      </Route>
      <Route path={"/salaries"}>
        {() => <ProtectedRoute component={Salaries} />}
      </Route>
      <Route path={"/customers"}>
        {() => <ProtectedRoute component={Customers} />}
      </Route>
      <Route path={"/delivery"}>
        {() => <ProtectedRoute component={Delivery} />}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
