"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.user) {
          router.push("/");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        await Swal.fire({
          title: "❌ Error",
          text: data.error || "Something went wrong",
          icon: "error",
          background: "#1e293b",
          color: "#ffffff",
          confirmButtonColor: "#9333ea",
        });
        return;
      }

      await Swal.fire({
        title: "✅ Success!",
        text: isLogin
          ? "Welcome back! Redirecting..."
          : "Account created! Redirecting...",
        icon: "success",
        background: "#1e293b",
        color: "#ffffff",
        confirmButtonColor: "#9333ea",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Auth error:", error);
      await Swal.fire({
        title: "❌ Error",
        text: "Something went wrong. Please try again.",
        icon: "error",
        background: "#1e293b",
        color: "#ffffff",
        confirmButtonColor: "#9333ea",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-500/30">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {isLogin ? "WELCOME BACK" : "JOIN THE MISSION"}
            </h1>
            <p className="text-purple-300 text-sm font-bold uppercase tracking-wider">
              {isLogin
                ? "Ready to dominate your tasks?"
                : "Start your productivity journey"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required={!isLogin}
                  placeholder="Your name"
                  className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-4 py-3 transition-all text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="your@email.com"
                className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-4 py-3 transition-all text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-4 py-3 transition-all text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20"
              />
              {!isLogin && (
                <p className="text-xs text-purple-400 mt-1">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "PROCESSING..."
                : isLogin
                ? "⚡ LOGIN"
                : "🚀 CREATE ACCOUNT"}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: "", password: "", name: "" });
              }}
              className="text-purple-300 hover:text-purple-200 text-sm font-bold transition-colors"
            >
              {isLogin
                ? "New here? Create an account"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>

        {/* Power Message */}
        <div className="mt-6 text-center">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
            💪 DISCIPLINE EQUALS FREEDOM • 🎯 EXECUTE DAILY
          </p>
        </div>
      </div>
    </main>
  );
}

