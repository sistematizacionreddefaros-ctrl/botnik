import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import fc from "fast-check";
import { getDefaultRoute } from "../src/lib/constants";
import type { UserRole } from "../src/lib/types";

/* ------------------------------------------------------------------ */
/*  Mock all page components to keep tests fast & isolated             */
/* ------------------------------------------------------------------ */

vi.mock("../src/pages/LandingPage", () => ({
  LandingPage: () => <div data-testid="landing-page">Landing</div>,
}));

vi.mock("../src/pages/LoginPage", () => ({
  LoginPage: () => <div data-testid="login-page">Login</div>,
}));

vi.mock("../src/pages/CajaPage", () => ({
  CajaPage: () => <div data-testid="caja-page">Caja</div>,
}));

vi.mock("../src/pages/CocinaPage", () => ({
  CocinaPage: () => <div data-testid="cocina-page">Cocina</div>,
}));

vi.mock("../src/pages/MesasPage", () => ({
  MesasPage: () => <div data-testid="mesas-page">Mesas</div>,
}));

vi.mock("../src/pages/InventarioPage", () => ({
  InventarioPage: () => <div data-testid="inventario-page">Inventario</div>,
}));

vi.mock("../src/pages/TurnosPage", () => ({
  TurnosPage: () => <div data-testid="turnos-page">Turnos</div>,
}));

vi.mock("../src/pages/ConfigPage", () => ({
  ConfigPage: () => <div data-testid="config-page">Config</div>,
}));

/* Mock AuthGuard to just render children (bypass auth checks) */
vi.mock("../src/components/layout/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/* Mock AppLayout to render Outlet */
vi.mock("../src/components/layout/AppLayout", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Outlet } = require("react-router-dom");
  return { AppLayout: () => <Outlet /> };
});

/* Mock useAuthStore — we control the return value per test */
const mockUseAuthStore = vi.fn();
vi.mock("../src/stores/authStore", () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
}));

/* ------------------------------------------------------------------ */
/*  Import App AFTER all mocks are set up                              */
/* ------------------------------------------------------------------ */
const { App } = await import("../src/App");

/* ------------------------------------------------------------------ */
/*  Route → testid mapping for verification                            */
/* ------------------------------------------------------------------ */
const ROUTE_TESTID: Record<string, string> = {
  "/caja": "caja-page",
  "/cocina": "cocina-page",
  "/mesas": "mesas-page",
  "/inventario": "inventario-page",
  "/turnos": "turnos-page",
  "/config": "config-page",
};

/* ------------------------------------------------------------------ */
/*  Property Test                                                      */
/* ------------------------------------------------------------------ */

describe("Feature: landing-page, Property 1: Para cualquier rol válido, PublicRoute redirige a getDefaultRoute(role)", () => {
  beforeEach(() => {
    mockUseAuthStore.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * **Validates: Requirements 1.2**
   *
   * Property 1: For any valid role (owner, admin, cashier, waiter, kitchen),
   * when an authenticated user visits "/", PublicRoute redirects to
   * getDefaultRoute(role).
   */
  it("should redirect authenticated users from '/' to getDefaultRoute(role) for any valid role", () => {
    const allRoles: UserRole[] = ["owner", "admin", "cashier", "waiter", "kitchen"];

    fc.assert(
      fc.property(
        fc.constantFrom<UserRole>(...allRoles),
        (role) => {
          // Arrange: simulate authenticated user with this role
          mockUseAuthStore.mockReturnValue({
            session: { user: { id: "test-user" } },
            role,
            isLoading: false,
            user: null,
            profile: null,
            activeRestaurant: { id: "rest-1", name: "Test" },
            userRestaurants: [],
          });

          // Act: render App at "/"
          const { unmount } = render(
            <MemoryRouter initialEntries={["/"]}>
              <App />
            </MemoryRouter>,
          );

          // Assert: landing page should NOT be rendered
          const landingEl = screen.queryByTestId("landing-page");
          expect(landingEl).toBeNull();

          // Assert: the correct page for this role IS rendered
          const expectedRoute = getDefaultRoute(role);
          const expectedTestId = ROUTE_TESTID[expectedRoute];
          expect(expectedTestId).toBeDefined();

          const targetEl = screen.queryByTestId(expectedTestId);
          expect(targetEl).not.toBeNull();

          // Cleanup for next iteration
          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
