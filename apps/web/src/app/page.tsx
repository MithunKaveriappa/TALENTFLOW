import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <div className="h-4 w-4 rounded-sm bg-white rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              TalentFlow
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="#features"
              className="hover:text-indigo-600 transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#solutions"
              className="hover:text-indigo-600 transition-colors"
            >
              Solutions
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pb-48">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                High-Trust Recruitment <br />
                <span className="text-indigo-600">Driven by Signals</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                The world&#39;s first assessment-first marketplace for tech
                sales. Move beyond the resume with real-time signal capturing
                and deterministic matching.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup?role=candidate"
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-center"
                >
                  Join as Candidate
                </Link>
                <Link
                  href="/signup?role=recruiter"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all text-center"
                >
                  Join as Recruiter
                </Link>
              </div>
            </div>
          </div>

          {/* Subtle Background Elements */}
          <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white" />
        </section>

        {/* Features / Value Props */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 border-none!">
                  Assessment First
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  No dashboards until verified. Every candidate and recruiter
                  undergoes a one-time assessment to build baseline trust
                  scores.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Real-Time Signals
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  We don&#39;t store raw answers. We capture voice and behavior
                  signals to generate explainable, deterministic scores.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Perfect Fit
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Our matching algorithm uses mutual culture, experience, and
                  trust alignment to connect the right talent with the right
                  teams.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-40">
            <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center">
              <div className="h-3 w-3 rounded-sm bg-white rotate-45" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              TalentFlow
            </span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} TalentFlow. High-Trust Recruitment
            Ecosystem.
          </p>
        </div>
      </footer>
    </div>
  );
}
