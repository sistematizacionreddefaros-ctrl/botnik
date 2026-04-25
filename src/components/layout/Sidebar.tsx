import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { getPermittedRoutes } from "../../lib/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar navigation filtered by the current user's role.
 * Shows only the routes the user has permission to access.
 *
 * - White background, 260px width on desktop/tablet
 * - Emoji icons + labels (Nunito 600)
 * - Active item: tangerine text with tangerine/12% background
 * - Logo: "bot" in slate + "nik" in tangerine, Fraunces 900
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { role } = useAuthStore();

  const routes = role ? getPermittedRoutes(role) : [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] bg-white
          border-r border-slate/10
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Logo */}
        <div className="flex items-center gap-1 px-6 py-5">
          <span className="font-display text-2xl font-black text-slate-deep">
            bot
          </span>
          <span className="font-display text-2xl font-black text-tangerine">
            nik
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1" role="navigation" aria-label="Navegación principal">
          {routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-[12px] font-body font-semibold text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-tangerine bg-tangerine/[0.12]"
                    : "text-slate/60 hover:bg-slate/[0.05]"
                }`
              }
            >
              <span className="text-lg" role="img" aria-hidden="true">
                {route.icon}
              </span>
              <span>{route.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}