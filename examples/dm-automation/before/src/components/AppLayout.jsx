import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Workflow,
  Zap,
  Users,
  Send,
  FileText,
  BarChart3,
  Plug,
  Settings,
  Sparkles,
  Bell,
} from "lucide-react";
import Toast from "./Toast.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/flows", label: "Flows", icon: Workflow },
  { to: "/triggers", label: "Triggers", icon: Zap, soon: true },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/broadcasts", label: "Broadcasts", icon: Send, soon: true },
  { to: "/templates", label: "Templates", icon: FileText, soon: true },
  { to: "/analytics", label: "Analytics", icon: BarChart3, soon: true },
  { to: "/integrations", label: "Integrations", icon: Plug, soon: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white p-6">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50">
            <Sparkles size={18} />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
            Replyloop AI
          </span>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, soon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {label}
              </span>
              {soon && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600">Coming soon</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 p-5 text-center text-white shadow-xl">
          <p className="text-sm font-semibold">Upgrade to Pro ✨</p>
          <p className="mt-1 text-xs text-white/70">Unlock the power of unlimited AI-powered flows</p>
          <a href="#" className="mt-3 block rounded-lg bg-white/20 py-2 text-xs font-semibold backdrop-blur-md">
            Learn More
          </a>
        </div>
      </aside>

      <main className="ml-64 min-w-[900px] p-8">
        <div className="mb-6 flex justify-end">
          <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <Bell size={16} />
          </button>
        </div>
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
