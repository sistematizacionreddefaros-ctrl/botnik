// ============================================================
// BOTNIK POS — Constants & Permission Matrix
// ============================================================

import type { UserRole } from "./types";

/**
 * System view identifiers used for permission mapping.
 */
export type SystemView =
    | "caja"
    | "cocina"
    | "mesas"
    | "inventario"
    | "turnos"
    | "config";

/**
 * ROLE_PERMISSIONS maps each UserRole to the set of views it can access.
 * Derived from the Router section in design.md.
 *
 * - /caja:       owner, admin, cashier
 * - /cocina:     owner, admin, cashier, kitchen
 * - /mesas:      owner, admin, cashier, waiter, kitchen (all roles)
 * - /inventario: owner, admin, cashier, kitchen
 * - /turnos:     owner, admin, cashier, waiter, kitchen (all roles)
 * - /config:     owner, admin
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly SystemView[]> = {
    owner: ["caja", "cocina", "mesas", "inventario", "turnos", "config"],
    admin: ["caja", "cocina", "mesas", "inventario", "turnos", "config"],
    cashier: ["caja", "cocina", "mesas", "inventario", "turnos"],
    waiter: ["mesas", "turnos"],
    kitchen: ["cocina", "mesas", "inventario", "turnos"],
};

/**
 * Route definition with its path and the roles allowed to access it.
 */
export interface RouteDefinition {
    readonly path: string;
    readonly view: SystemView;
    readonly requiredRoles: readonly UserRole[];
    readonly label: string;
    readonly icon: string;
}

/**
 * SYSTEM_ROUTES defines each protected route, its associated view,
 * the roles that can access it, and display metadata for the sidebar.
 */
export const SYSTEM_ROUTES: readonly RouteDefinition[] = [
    {
        path: "/caja",
        view: "caja",
        requiredRoles: ["owner", "admin", "cashier"],
        label: "Caja",
        icon: "💰",
    },
    {
        path: "/cocina",
        view: "cocina",
        requiredRoles: ["owner", "admin", "cashier", "kitchen"],
        label: "Cocina",
        icon: "👨‍🍳",
    },
    {
        path: "/mesas",
        view: "mesas",
        requiredRoles: ["owner", "admin", "cashier", "waiter", "kitchen"],
        label: "Mesas",
        icon: "🪑",
    },
    {
        path: "/inventario",
        view: "inventario",
        requiredRoles: ["owner", "admin", "cashier", "kitchen"],
        label: "Inventario",
        icon: "📦",
    },
    {
        path: "/turnos",
        view: "turnos",
        requiredRoles: ["owner", "admin", "cashier", "waiter", "kitchen"],
        label: "Turnos",
        icon: "🕐",
    },
    {
        path: "/config",
        view: "config",
        requiredRoles: ["owner", "admin"],
        label: "Configuración",
        icon: "⚙️",
    },
];

/**
 * Returns the list of views a given role can access.
 */
export function getPermittedViews(role: UserRole): readonly SystemView[] {
    return ROLE_PERMISSIONS[role];
}

/**
 * Returns the routes accessible by a given role.
 */
export function getPermittedRoutes(role: UserRole): readonly RouteDefinition[] {
    return SYSTEM_ROUTES.filter((route) => route.requiredRoles.includes(role));
}

/**
 * Returns the default route path for a given role (first permitted route).
 */
export function getDefaultRoute(role: UserRole): string {
    const permitted = getPermittedRoutes(role);
    return permitted.length > 0 ? permitted[0].path : "/login";
}

/**
 * Checks whether a role has access to a specific view.
 */
export function hasAccess(role: UserRole, view: SystemView): boolean {
    return ROLE_PERMISSIONS[role].includes(view);
}
