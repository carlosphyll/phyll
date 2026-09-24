import { Link } from "react-router-dom";
import { Sparkles, Zap, Bot, BarChart3, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "1. Pick a keyword",
    description: "Choose the word people comment on your post, such as LINK or CODE.",
  },
  {
    icon: Bot,
    title: "2. Write the DM",
    description: "Write the message they get, with the link or code you promised in the post.",
  },
  {
    icon: BarChart3,
    title: "3. Replyloop answers",
    description: "Everyone who comments the keyword gets your DM within seconds, day and night.",
  },
];

// What a follower sees, in the cards the testimonials used to fill.
const examples = [
  {
    comment: "LINK",
    dm: "Here is the link you asked for: https://your-site.com/guide",
    post: "A post about your free guide",
  },
  {
    comment: "code please!",
    dm: "Your 10% discount code is WELCOME10. It works until Sunday.",
    post: "A post announcing a sale, keyword CODE",
  },
];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-24 pt-32 text-center">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700">
          <Sparkles size={14} /> ✨ New: send yourself a test DM first
        </span>
        <h1 className="mt-8 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-6xl font-extrabold leading-tight text-transparent">
          Send a DM to everyone who comments a keyword
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xl text-gray-500">
          Pick a keyword, write the message, and Replyloop answers every comment on your Instagram posts with it.
          You can try it before connecting your account.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/flows?new=1"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            Create your first automation <ArrowRight size={18} />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105"
          >
            See how it works
          </a>
        </div>
        <div className="mt-10 flex items-center justify-center gap-3">
          <p className="text-sm text-gray-500">Free to try. Connect Instagram only when your first automation is ready 🚀</p>
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
            <a href="#how-it-works">How it works</a>
            <Link to="/dashboard" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 font-semibold text-white">
              Open Replyloop
            </Link>
          </nav>
        </div>
      </header>

      <Hero />

      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold text-gray-900">How it works 💡</h2>
          <p className="mt-4 text-center text-lg text-gray-500">Three steps, and the first DM goes out on the next comment.</p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{title}</h3>
                <p className="mt-3 text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-bold text-gray-900">What your followers get</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {examples.map((e) => (
              <div key={e.comment} className="rounded-2xl bg-white p-8 text-left shadow-lg">
                <p className="text-sm font-semibold text-gray-500">Someone comments</p>
                <p className="mt-2 inline-block rounded-2xl bg-gray-100 px-4 py-2 text-gray-900">{e.comment}</p>
                <p className="mt-6 text-sm font-semibold text-gray-500">They get this DM</p>
                <p className="mt-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-3 text-white">{e.dm}</p>
                <p className="mt-6 text-sm text-gray-500">{e.post}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold">Try it on your next post</h2>
          <p className="mt-4 text-lg text-white/80">Set up your first automation in about a minute.</p>
          <Link to="/flows?new=1" className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-purple-600 transition-all hover:scale-105">
            Create your first automation
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10 text-center text-sm text-gray-500">
        <div className="flex justify-center gap-6">
          <a href="mailto:hello@replyloop.example">Contact</a>
        </div>
        <p className="mt-4">© 2026 Replyloop AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
