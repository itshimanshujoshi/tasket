"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "../public/images/logo.png";
import Swal from "sweetalert2";

interface User {
  _id: string;
  email: string;
  name: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "🚪 Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "YES, LOGOUT",
      cancelButtonText: "CANCEL",
      background: "#1e293b",
      color: "#ffffff",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isLoginPage = pathname === "/login";

  return (
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

        {/* User Info / Auth Buttons */}
        <div className="flex items-center gap-4">
          {!isLoginPage && (
            <>
              {loading ? (
                <div className="hidden md:flex items-center gap-3 bg-purple-900/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-purple-200">
                    LOADING...
                  </span>
                </div>
              ) : user ? (
                <>
                  <div className="hidden md:flex items-center gap-3 bg-purple-900/30 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-purple-200">
                      {user.name.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 hover:scale-105"
                  >
                    🚪 LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 hover:scale-105"
                >
                  🔐 LOGIN
                </Link>
              )}
            </>
          )}

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
  );
}

