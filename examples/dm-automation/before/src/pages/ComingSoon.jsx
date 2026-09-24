import { Sparkles } from "lucide-react";

export default function ComingSoon({ title }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
        <Sparkles size={28} />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">{title} is coming soon! 🚧</h1>
      <p className="mt-2 max-w-md text-center text-gray-400">
        We're working hard to bring you this feature. Stay tuned for something amazing!
      </p>
      <button onClick={() => {}} className="mt-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg">
        Notify Me
      </button>
    </div>
  );
}
