import { Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/layout/AuthGuard";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { CajaPage } from "./pages/CajaPage";
import { CocinaPage } from "./pages/CocinaPage";
import { MesasPage } from "./pages/MesasPage";
import { InventarioPage } from "./pages/InventarioPage";
import { TurnosPage } from "./pages/TurnosPage";
import { ConfigPage } from "./pages/ConfigPage";
import { useAuthStore } from "./stores/authStore";
import { getDefaultRoute } from "./lib/constants";

/**
 * Public route wrapper that redirects authenticated users to their
 * default view and renders children for unauthenticated visitors.
 */
function PublicRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { session, role, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (session && role) return <Navigate to={getDefaultRoute(role)} replace />;
  return <>{children}</>;
}

/**
 * Root application component with route configuration.
 *
 * - "/" renders the public landing page (redirects authenticated users)
 * - /login is public
 * - All other routes are protected by AuthGuard with role-based access
 * - Unknown routes redirect to "/"
 */
export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes wrapped in AuthGuard + AppLayout */}
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route
          path="/caja"
          element={
            <AuthGuard requiredRoles={["owner", "admin", "cashier"]}>
              <CajaPage />
            </AuthGuard>
          }
        />
        <Route
          path="/cocina"
          element={
            <AuthGuard requiredRoles={["owner", "admin", "cashier", "kitchen"]}>
              <CocinaPage />
            </AuthGuard>
          }
        />
        <Route
          path="/mesas"
          element={
            <AuthGuard
              requiredRoles={["owner", "admin", "cashier", "waiter", "kitchen"]}
            >
              <MesasPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventario"
          element={
            <AuthGuard
              requiredRoles={["owner", "admin", "cashier", "kitchen"]}
            >
              <InventarioPage />
            </AuthGuard>
          }
        />
        <Route
          path="/turnos"
          element={
            <AuthGuard
              requiredRoles={["owner", "admin", "cashier", "waiter", "kitchen"]}
            >
              <TurnosPage />
            </AuthGuard>
          }
        />
        <Route
          path="/config"
          element={
            <AuthGuard requiredRoles={["owner", "admin"]}>
              <ConfigPage />
            </AuthGuard>
          }
        />
      </Route>

      {/* Catch-all: redirect unknown routes to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
