import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getDefaultRoute } from "../lib/constants";

/**
 * Bot SVG logo component — circular bot with bicolor eyes (rose/tangerine).
 */
function BotLogo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Botnik logo"
      role="img"
    >
      <circle cx="19" cy="19" r="18" fill="white" stroke="#93D8C3" strokeWidth="2" />
      <ellipse cx="19" cy="20" rx="10" ry="8" stroke="#5B8496" strokeWidth="2" />
      <circle cx="15" cy="19" r="2" fill="#DF909E" />
      <circle cx="23" cy="19" r="2" fill="#F1943F" />
      <path
        d="M15 24c0 0 1.5 2 4 2s4-2 4-2"
        stroke="#5B8496"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 12c1-2 3-3 5-3s4 1 5 3"
        stroke="#93D8C3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoginPage() {
  const { session, role, isLoading, signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to role-based default view
  if (session && role && !isLoading) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      // Redirect happens via the Navigate check above on re-render
    } catch {
      // Generic error message — don't reveal if email exists (Requirement 3.7)
      setError("Email o contraseña incorrectos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BotLogo size={64} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-card shadow-card p-8">
          {/* Title */}
          <h1 className="font-display text-2xl font-bold text-slate-deep text-center mb-6">
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-body text-sm font-semibold text-slate-deep mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-slate/10 bg-white font-body text-sm text-slate-deep placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-tangerine/50 focus:border-tangerine transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-body text-sm font-semibold text-slate-deep mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-slate/10 bg-white font-body text-sm text-slate-deep placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-tangerine/50 focus:border-tangerine transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="font-body text-sm text-rose text-center" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-pill bg-tangerine text-white font-body font-bold text-sm shadow-btn-primary hover:bg-tangerine-dark hover:shadow-btn-primary-hover hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}