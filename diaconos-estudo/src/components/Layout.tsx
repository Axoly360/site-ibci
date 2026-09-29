import { NavLink, Outlet } from "react-router-dom";

const ITENS_NAV = [
  { to: "/", label: "Painel", icone: "🏠" },
  { to: "/sabatina", label: "Sabatina", icone: "🗣️" },
  { to: "/decorar", label: "Decorar", icone: "🧠" },
  { to: "/quiz", label: "Quiz", icone: "✅" },
  { to: "/simulado", label: "Simulado", icone: "⏱️" },
  { to: "/apresentacao", label: "Minha fala", icone: "📝" },
  { to: "/concilio", label: "O concílio", icone: "ℹ️" },
];

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col pb-20">
      <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h1 className="text-lg font-semibold">Estudo do Diaconato</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Preparação para o concílio de exame</p>
      </header>

      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>

      <nav
        className="no-print fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
        aria-label="Navegação principal"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-4 gap-1 px-1 py-1 text-[11px] sm:grid-cols-7">
          {ITENS_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex min-h-[44px] flex-col items-center justify-center rounded-lg px-1 py-1 ${
                  isActive
                    ? "bg-accent/10 text-accent-dark dark:text-accent-light"
                    : "text-slate-500 dark:text-slate-400"
                }`
              }
            >
              <span aria-hidden="true" className="text-base leading-none">
                {item.icone}
              </span>
              <span className="mt-0.5">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
