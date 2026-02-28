import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold text-blue-900">
          सहज <span className="text-sm font-normal text-gray-500">Sahaj</span>
        </div>
        <div className="text-sm text-gray-500">AI4Bharat Hackathon</div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Voice-First
          <br />
          <span className="text-blue-600">Career Counselor</span>
        </h1>

        <p className="text-xl text-gray-600 mb-4 max-w-2xl">
          Discover your skills, find free courses, prepare for interviews, and
          get matched with jobs — all through a simple voice conversation in your
          language.
        </p>

        <p className="text-lg text-orange-600 font-medium mb-8">
          Supports 22 Indian languages. No app download needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              🎤 Start Counseling
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "22", label: "Languages" },
            { value: "100+", label: "Free Courses" },
            { value: "50+", label: "Job Listings" },
            { value: "5min", label: "To Get Started" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-400">
        Powered by Sarvam AI + Claude | Built for AI4Bharat Hackathon
      </footer>
    </div>
  );
}
