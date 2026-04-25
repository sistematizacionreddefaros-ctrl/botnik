import { useAuthStore } from "../../stores/authStore";

interface HeaderProps {
  onMenuToggle: () => void;
}

/**
 * Header bar showing restaurant name, current user, and logout button.
 *
 * - Cream background with subtle border-bottom
 * - Restaurant name in Fraunces 700
 * - User name in Nunito 500
 * - Logout button styled as outline
 */
export function Header({ onMenuToggle }: HeaderProps) {
  const { activeRestaurant, profile, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-cream border-b border-slate/[0.08]">
      {/* Left: hamburger (mobile/tablet) + restaurant name */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-icon text-slate hover:bg-slate/[0.05] transition-colors"
          aria-label="Abrir menú"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="font-display text-xl font-bold text-slate-deep">
          {activeRestaurant?.name ?? "Botnik POS"}
        </h1>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-4">
        {profile && (
          <span className="font-body font-medium text-sm text-slate hidden sm:inline">
            {profile.full_name}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-pill border-2 border-slate text-slate font-body font-semibold text-sm hover:bg-slate hover:text-white transition-all duration-300"
        >
          Salir
        </button>
      </div>
    </header>
  );
}