import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-2xl">
              <div className="h-5 w-5 rounded bg-white rotate-45" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
              TalentFlow
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-slate-500">
            <Link
              href="#logic"
              className="hover:text-slate-900 transition-colors"
            >
              The Logic
            </Link>
            <Link
              href="#trust"
              className="hover:text-slate-900 transition-colors"
            >
              Trust Signals
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              Executive Portal
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-48 pb-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Assessment-Driven Marketplace
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-8">
                HIRE ON <span className="text-blue-600">SIGNALS</span>,<br />
                NOT SPECULATION.
              </h1>

              <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                The high-trust ecosystem for executive talent. We verify intent
                and skills through real-time AI assessments, providing
                deterministic matches for serious teams.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  href="/signup?role=candidate"
                  className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
                >
                  Join as Candidate
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="/signup?role=recruiter"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 text-sm font-bold uppercase tracking-widest rounded-2xl border-2 border-slate-100 hover:border-slate-900 transition-all flex items-center justify-center"
                >
                  Join as Recruiter
                </Link>
              </div>
            </div>
          </div>

          {/* Background Grid */}
          <div className="absolute top-0 right-0 w-1/2 h-full -z-10 opacity-5">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>
        </section>

        {/* The Logic Section */}
        <section id="logic" className="py-32 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="mb-20">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
                The TalentFlow Framework
              </h2>
              <div className="h-1.5 w-24 bg-blue-600 mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <span className="text-5xl font-black text-slate-200 tabular-nums">
                  01
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Verified Identity
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  We don&apos;t just accept profiles. Every candidate undergoes
                  Aadhaar verification and professional screening before they
                  see a single job.
                </p>
              </div>

              <div className="space-y-6">
                <span className="text-5xl font-black text-slate-200 tabular-nums">
                  02
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  AI Signal Capture
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Our proprietary assessor evaluates depth, specificity, and
                  ownership through 16 behavioral dimensions. We quantify the
                  qualitative.
                </p>
              </div>

              <div className="space-y-6">
                <span className="text-5xl font-black text-slate-200 tabular-nums">
                  03
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  Zero-Spam Dashboard
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  No cold messages. No generic applications. The ecosystem is
                  gated by score-driven visibility, ensuring every match is
                  intentional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Shield Section */}
        <section id="trust" className="py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-3xl">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8">
                  ELIMINATE THE <br />
                  <span className="text-blue-500">SCREENING TAX.</span>
                </h2>
                <p className="text-xl text-slate-400 font-medium mb-12">
                  Stop reading resumes. Start analyzing scores. Our
                  trust-verified marketplace reduces your time-to-hire by 70% by
                  pre-validating every signal.
                </p>
                <div className="flex flex-wrap gap-8 items-center pt-8 border-t border-slate-800">
                  <div>
                    <div className="text-3xl font-black tabular-nums">100%</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Verified Profiles
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black tabular-nums">0.0%</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Spam Tolerance
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black tabular-nums">16+</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Psychometric Signals
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute right-0 bottom-0 opacity-10">
                <svg
                  className="w-100 h-100"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40L50 0Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 grayscale opacity-50">
              <div className="h-6 w-6 rounded bg-slate-900" />
              <span className="text-sm font-black tracking-tighter uppercase italic">
                TalentFlow
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              © 2026 TalentFlow Precision Systems. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Integrity Policy
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
