import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasket - Command Your Day",
  description:
    "Your personal command center for tasks — AI-powered, laser-focused, and unstoppable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white antialiased">
        {/* Epic Navbar */}
        <header className="bg-slate-900/50 backdrop-blur-md border-b-2 border-purple-500/30 sticky top-0 z-50 shadow-xl shadow-purple-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <Image
                  src={logo}
                  alt="Tasket logo"
                  width={48}
                  height={48}
                  priority
                  className="rounded-xl relative z-10 border-2 border-purple-500/50 group-hover:border-purple-400 transition-all"
                />
              </div>
            </Link>

            {/* Quick Stats / User Info */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-purple-900/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-purple-200">
                  SYSTEM ACTIVE
                </span>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 hover:bg-purple-500/20 rounded-lg transition-colors">
                <svg
                  className="w-6 h-6 text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content - Full Width */}
        <main className="min-h-[calc(100vh-140px)]">{children}</main>

        {/* Epic Footer */}
        <footer className="border-t-2 border-purple-500/30 bg-slate-900/50 backdrop-blur-md mt-10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Footer Left */}
              <div className="text-center md:text-left">
                <p className="text-sm font-bold text-purple-300">
                  © {new Date().getFullYear()} TASKET
                </p>
                <p className="text-xs text-purple-400 mt-1">
                  Built with 🔥 • Powered by AI • Designed for Winners
                </p>
              </div>

              {/* Footer Stats/Info */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI
                  </div>
                  <div className="text-[10px] text-purple-300 font-bold uppercase">
                    Powered
                  </div>
                </div>
                <div className="w-px h-8 bg-purple-500/30"></div>
                <div className="text-center">
                  <div className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-[10px] text-purple-300 font-bold uppercase">
                    Ready
                  </div>
                </div>
                <div className="w-px h-8 bg-purple-500/30"></div>
                <div className="text-center">
                  <div className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ∞
                  </div>
                  <div className="text-[10px] text-purple-300 font-bold uppercase">
                    Potential
                  </div>
                </div>
              </div>
            </div>

            {/* Power Tagline */}
            <div className="mt-6 pt-6 border-t border-purple-500/20 text-center">
              <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">
                🎯 EXECUTE • ⚡ DOMINATE • 🔥 REPEAT
              </p>
            </div>
          </div>
        </footer>

        {/* Ambient Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </body>
    </html>
  );
}
