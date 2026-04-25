import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: "💰",
    title: "Punto de Venta",
    description:
      "Cobra rápido, gestiona turnos y lleva el control de caja desde cualquier dispositivo.",
    color: "tangerine",
  },
  {
    icon: "💬",
    title: "Chatbot WhatsApp",
    description:
      "Tus clientes hacen pedidos por WhatsApp y el sistema los procesa automáticamente.",
    color: "mint",
  },
  {
    icon: "📦",
    title: "Inventario",
    description:
      "Controla ingredientes, recibe alertas de stock bajo y reduce el desperdicio.",
    color: "rose",
  },
  {
    icon: "🪑",
    title: "Mesas y Comandas",
    description:
      "Asigna mesas, envía comandas a cocina y agiliza el servicio en sala.",
    color: "slate",
  },
];

const STEPS: Step[] = [
  {
    number: 1,
    title: "Regístrate",
    description: "Crea tu cuenta y configura tu restaurante en minutos.",
  },
  {
    number: 2,
    title: "Configura tu menú",
    description: "Agrega productos, precios e ingredientes desde el panel.",
  },
  {
    number: 3,
    title: "Opera tu restaurante",
    description:
      "Usa el POS, recibe pedidos por WhatsApp y gestiona mesas en tiempo real.",
  },
  {
    number: 4,
    title: "Analiza resultados",
    description:
      "Revisa ventas, inventario y rendimiento para tomar mejores decisiones.",
  },
];

/* ------------------------------------------------------------------ */
/*  Color map for feature card accents                                 */
/* ------------------------------------------------------------------ */

const COLOR_BG: Record<string, string> = {
  tangerine: "bg-tangerine/10",
  mint: "bg-mint/10",
  rose: "bg-rose/10",
  slate: "bg-slate/10",
};

const COLOR_TEXT: Record<string, string> = {
  tangerine: "text-tangerine",
  mint: "text-mint-dark",
  rose: "text-rose",
  slate: "text-slate",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <header className="flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        {/* Logo */}
        <svg
          role="img"
          aria-label="BOTNIK logo"
          className="mb-6"
          width="220"
          height="56"
          viewBox="0 0 220 56"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            className="font-display font-black"
            style={{ fontSize: "48px" }}
          >
            <tspan fill="#5B8496">bot</tspan>
            <tspan fill="#F1943F">nik</tspan>
          </text>
        </svg>

        <p className="font-body text-lg sm:text-xl text-slate-deep max-w-md mb-8">
          El sistema POS todo-en-uno con chatbot de WhatsApp para tu
          restaurante.
        </p>

        <Link
          to="/login"
          className="inline-block bg-tangerine text-white font-body font-bold text-base px-8 py-3 rounded-pill shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-tangerine focus:ring-offset-2"
        >
          Comenzar ahora
        </Link>
      </header>

      <main>
        {/* ── Features Section ───────────────────────────────────── */}
        <section className="px-4 py-16 sm:py-20 max-w-5xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-deep text-center mb-12">
            Todo lo que necesita tu restaurante
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-card shadow-card p-6 hover:shadow-card-hover transition-shadow duration-300"
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-icon text-2xl mb-4 ${COLOR_BG[f.color]}`}
                >
                  {f.icon}
                </div>
                <h3
                  className={`font-display font-bold text-lg mb-2 ${COLOR_TEXT[f.color]}`}
                >
                  {f.title}
                </h3>
                <p className="font-body text-sm text-slate-deep leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cómo Funciona Section ──────────────────────────────── */}
        <section className="px-4 py-16 sm:py-20 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-deep text-center mb-12">
              Cómo funciona
            </h2>

            <div className="space-y-0">
              {STEPS.map((step, idx) => (
                <div key={step.number} className="flex gap-4 sm:gap-6">
                  {/* Number column with connector line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-tangerine text-white font-display font-bold flex items-center justify-center shrink-0">
                      {step.number}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="w-0.5 flex-1 bg-tangerine/20 my-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8">
                    <h3 className="font-display font-bold text-lg text-slate-deep mb-1">
                      {step.title}
                    </h3>
                    <p className="font-body text-sm text-slate-deep/80 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final Section ──────────────────────────────────── */}
        <section className="px-4 py-16 sm:py-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-deep mb-4">
            ¿Listo para transformar tu restaurante?
          </h2>
          <p className="font-body text-base sm:text-lg text-slate-deep/80 max-w-md mx-auto mb-8">
            Únete a BOTNIK y lleva la operación de tu negocio al siguiente
            nivel.
          </p>
          <Link
            to="/login"
            className="inline-block bg-tangerine text-white font-body font-bold text-base px-8 py-3 rounded-pill shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-tangerine focus:ring-offset-2"
          >
            Empezar gratis
          </Link>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-slate-deep text-cream py-6 text-center">
        <p className="font-body text-sm">
          BOTNIK &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
