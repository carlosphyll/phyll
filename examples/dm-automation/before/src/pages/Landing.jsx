import { Link } from "react-router-dom";
import { Sparkles, Zap, Bot, BarChart3, ArrowRight, Star } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Respond to every comment instantly with our cutting-edge automation engine.",
  },
  {
    icon: Bot,
    title: "Smart Automation",
    description: "AI-powered flows that engage your audience seamlessly, 24/7.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    description: "Unlock the power of data-driven insights to grow like never before.",
  },
];

const testimonials = [
  {
    quote: "Replyloop AI completely transformed how we engage with our community. A total game-changer!",
    name: "Sarah Johnson",
    role: "CEO at TechCorp",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    quote: "We saw a 300% increase in engagement in the first week. Absolutely effortless.",
    name: "John Doe",
    role: "Founder at StartupXYZ",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-24 pt-32 text-center">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700">
          <Sparkles size={14} /> ✨ New: AI-powered replies
        </span>
        <h1 className="mt-8 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-6xl font-extrabold leading-tight text-transparent">
          Supercharge your Instagram with AI-powered automation
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xl text-gray-400">
          Streamline your workflow and engage your audience seamlessly. The all-in-one platform for creators who
          want to take their business to the next level.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            Get Started <ArrowRight size={18} />
          </Link>
          <a
            href="#"
            className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
          >
            Learn More
          </a>
        </div>
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {[1, 5, 8, 9, 12].map((i) => (
              <img key={i} src={`https://i.pravatar.cc/150?img=${i}`} alt="" className="h-9 w-9 rounded-full border-2 border-white" />
            ))}
          </div>
          <p className="text-sm text-gray-400">Trusted by 10,000+ creators worldwide 🚀</p>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
            Replyloop AI
          </span>
          <nav className="flex items-center gap-8 text-sm text-gray-600">
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">About</a>
            <Link to="/dashboard" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 font-semibold text-white">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <Hero />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold text-gray-900">Everything you need to grow 💡</h2>
          <p className="mt-4 text-center text-lg text-gray-400">Powerful features to help you engage your audience effortlessly.</p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{title}</h3>
                <p className="mt-3 text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-bold text-gray-900">Loved by creators everywhere</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl bg-white p-8 text-left shadow-lg">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-4 text-gray-600">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={t.avatar} alt="" className="h-10 w-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-lg text-white/80">Join thousands of creators already using Replyloop AI.</p>
          <Link to="/dashboard" className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-purple-600 transition-all hover:scale-105">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <p className="mt-4">© 2026 Replyloop AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
