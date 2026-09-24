import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Workflow, Users, Settings, Sparkles } from "lucide-react";
import Toast from "./Toast.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/flows", label: "Automations", icon: Workflow },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
    isActive
      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
      : "text-gray-600 hover:bg-gray-100"
  }`;

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50">
        <Sparkles size={18} />
      </div>
      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
        Replyloop AI
      </span>
    </div>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white p-6 md:block">
        <div className="mb-10">
          <Logo />
        </div>
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <header className="border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Logo />
        <nav className="mt-3 flex flex-wrap gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="p-4 md:ml-64 md:p-8">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
