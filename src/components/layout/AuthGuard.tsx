import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { getDefaultRoute, getPermittedRoutes } from "../../lib/constants";
import type { UserRole } from "../../lib/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

/**
 * Protects routes based on authentication state and role permissions.
 *
 * 1. No session → redirect to /login
 * 2. Session but no active restaurant → show waiting screen
 * 3. requiredRoles defined and current role not included → redirect to first permitted view
 * 4. All OK → render children
 */
export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { session, activeRestaurant, role, isLoading } = useAuthStore();

  // While loading auth state, show nothing (avoids flash of redirect)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <p className="font-body text-slate text-lg">Cargando…</p>
      </div>
    );
  }

  // 1. No session → redirect to /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Session but no active restaurant → waiting screen
  if (!activeRestaurant || !role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream gap-4">
        <p className="font-display text-2xl font-bold text-slate-deep">
          Esperando asignación
        </p>
        <p className="font-body text-slate">
          Tu cuenta aún no está vinculada a un restaurante. Contacta al
          propietario para que te asigne un rol.
        </p>
      </div>
    );
  }

  // 3. requiredRoles defined and current role not included → redirect to permitted view
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(role)) {
    const permittedRoutes = getPermittedRoutes(role);
    const fallback = permittedRoutes.length > 0 ? permittedRoutes[0].path : "/login";
    return <Navigate to={fallback} replace />;
  }

  // 4. All OK → render children
  return <>{children}</>;
}