import { Users, Send, Eye, Zap, TrendingUp, Plus, Megaphone, BarChart3 } from "lucide-react";
import { stats, recentActivity, chartData } from "../data/mock.js";

const icons = { users: Users, send: Send, eye: Eye, zap: Zap };

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Welcome back, John! 👋</h1>
      <p className="mt-1 text-gray-400">Here's what's happening with your account today.</p>

      <div className="mt-8 grid grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = icons[s.icon];
          return (
            <div key={s.label} className="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Icon size={22} />
                </div>
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                  <TrendingUp size={12} /> {s.change}
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-400">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-1 text-xs text-gray-400">from last month</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900">Messages over time</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {chartData.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-purple-600 to-blue-400" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <ul className="mt-4 space-y-4">
            {recentActivity.map((a) => (
              <li key={a.name} className="flex items-center gap-3">
                <img src={a.avatar} alt="" className="h-9 w-9 rounded-full" />
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{a.name}</span> {a.action}
                  </p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions ⚡</h2>
        <div className="mt-4 flex gap-4">
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg">
            <Plus size={18} /> Create Flow
          </button>
          <button onClick={() => alert("Coming soon!")} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-3 font-semibold text-white shadow-lg">
            <Megaphone size={18} /> Send Broadcast
          </button>
          <button onClick={() => console.log("analytics")} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg">
            <BarChart3 size={18} /> View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
