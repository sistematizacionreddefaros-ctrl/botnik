import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { LandingPage } from "../src/pages/LandingPage";

/* ------------------------------------------------------------------ */
/*  Mocks for the route-level test (test 1)                            */
/* ------------------------------------------------------------------ */

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

vi.mock("../src/components/layout/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../src/components/layout/AppLayout", () => {
  const { Outlet } = require("react-router-dom");
  return { AppLayout: () => <Outlet /> };
});

const mockUseAuthStore = vi.fn();
vi.mock("../src/stores/authStore", () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
}));

const { App } = await import("../src/App");

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("LandingPage unit tests", () => {
  afterEach(() => {
    cleanup();
  });

  /* 1. Route "/" renders LandingPage without active session */
  describe("Routing", () => {
    beforeEach(() => {
      mockUseAuthStore.mockReset();
    });

    it("renders LandingPage at '/' when user is not authenticated", () => {
      mockUseAuthStore.mockReturnValue({
        session: null,
        role: null,
        isLoading: false,
        user: null,
        profile: null,
        activeRestaurant: null,
        userRestaurants: [],
      });

      render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );

      // LandingPage renders the BOTNIK logo text and tagline
      expect(screen.getByText(/Comenzar ahora/i)).toBeInTheDocument();
    });

    it("redirects non-existent routes to '/' showing LandingPage", () => {
      mockUseAuthStore.mockReturnValue({
        session: null,
        role: null,
        isLoading: false,
        user: null,
        profile: null,
        activeRestaurant: null,
        userRestaurants: [],
      });

      render(
        <MemoryRouter initialEntries={["/some-nonexistent-route"]}>
          <App />
        </MemoryRouter>,
      );

      // Catch-all redirects to "/" which renders LandingPage for unauthenticated users
      expect(screen.getByText(/Comenzar ahora/i)).toBeInTheDocument();

      // No error page or 404 content is shown
      expect(screen.queryByText(/404/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/not found/i)).not.toBeInTheDocument();
    });
  });

  /* 2. Semantic structure */
  it("has correct semantic structure: header, main, sections, footer, headings", () => {
    const { container } = renderLanding();

    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("main")).toBeInTheDocument();
    expect(container.querySelector("footer")).toBeInTheDocument();

    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(3);

    // h2 headings for each section
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBeGreaterThanOrEqual(3);
  });

  /* 3. Hero: logo BOTNIK, tagline, CTA with link to /login */
  it("renders Hero with BOTNIK logo, tagline, and CTA linking to /login", () => {
    renderLanding();

    // SVG logo contains "bot" and "nik" text
    const logoSvg = screen.getByRole("img", { name: /botnik logo/i });
    expect(logoSvg).toBeInTheDocument();
    expect(logoSvg.textContent).toContain("bot");
    expect(logoSvg.textContent).toContain("nik");

    // Tagline about POS + WhatsApp (scoped to header)
    const header = logoSvg.closest("header")!;
    const headerScope = within(header);
    expect(
      headerScope.getByText(/POS.*WhatsApp|WhatsApp.*POS/i),
    ).toBeInTheDocument();

    // CTA links to /login
    const ctaLink = screen.getByRole("link", { name: /Comenzar ahora/i });
    expect(ctaLink).toHaveAttribute("href", "/login");
  });

  /* 4. At least 4 Feature Cards with icon, title, description */
  it("renders at least 4 Feature Cards with icon, title, and description", () => {
    renderLanding();

    const expectedFeatures = [
      { icon: "💰", title: "Punto de Venta" },
      { icon: "💬", title: "Chatbot WhatsApp" },
      { icon: "📦", title: "Inventario" },
      { icon: "🪑", title: "Mesas y Comandas" },
    ];

    for (const feature of expectedFeatures) {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.icon)).toBeInTheDocument();
    }

    // Each card also has a description (non-empty paragraph)
    expect(
      screen.getByText(/Cobra rápido/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/clientes hacen pedidos/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Controla ingredientes/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Asigna mesas/i),
    ).toBeInTheDocument();
  });

  /* 5. "Cómo Funciona" section with 3-4 steps */
  it("renders 3-4 steps in 'Cómo funciona' with number, title, and description", () => {
    renderLanding();

    expect(screen.getByText(/Cómo funciona/i)).toBeInTheDocument();

    const steps = [
      { number: "1", title: "Regístrate" },
      { number: "2", title: "Configura tu menú" },
      { number: "3", title: "Opera tu restaurante" },
      { number: "4", title: "Analiza resultados" },
    ];

    for (const step of steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.number)).toBeInTheDocument();
    }

    // Descriptions
    expect(screen.getByText(/Crea tu cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/Agrega productos/i)).toBeInTheDocument();
    expect(screen.getByText(/Usa el POS/i)).toBeInTheDocument();
    expect(screen.getByText(/Revisa ventas/i)).toBeInTheDocument();
  });

  /* 6. CTA final with link to /login and primary button styling */
  it("renders CTA final with link to /login and primary button styling classes", () => {
    renderLanding();

    const ctaFinal = screen.getByRole("link", { name: /Empezar gratis/i });
    expect(ctaFinal).toHaveAttribute("href", "/login");
    expect(ctaFinal.className).toContain("bg-tangerine");
    expect(ctaFinal.className).toContain("rounded-pill");
    expect(ctaFinal.className).toContain("shadow-btn-primary");
  });

  /* 7. Footer with "BOTNIK" and current year */
  it("renders footer with BOTNIK and current year", () => {
    const { container } = renderLanding();

    const footer = container.querySelector("footer")!;
    expect(footer).toBeInTheDocument();

    const currentYear = new Date().getFullYear().toString();
    expect(footer.textContent).toContain("BOTNIK");
    expect(footer.textContent).toContain(currentYear);
  });

  /* 8. SVG logo has role="img" and aria-label */
  it("has role='img' and aria-label on logo SVG", () => {
    renderLanding();

    const logoSvg = screen.getByRole("img", { name: /botnik logo/i });
    expect(logoSvg).toBeInTheDocument();
    expect(logoSvg.tagName.toLowerCase()).toBe("svg");
    expect(logoSvg).toHaveAttribute("aria-label");
  });

  /* 9. Responsive grid classes on Feature Cards container */
  it("has responsive grid classes on Feature Cards container", () => {
    const { container } = renderLanding();

    // The grid container is the div wrapping the feature cards
    const gridContainer = container.querySelector(
      ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-2",
    );
    expect(gridContainer).toBeInTheDocument();
  });
});
