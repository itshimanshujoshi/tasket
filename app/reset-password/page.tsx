"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      await Swal.fire({
        title: "❌ Error",
        text: "Passwords do not match",
        icon: "error",
        background: "#1e293b",
        color: "#ffffff",
        confirmButtonColor: "#9333ea",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
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
        text: "Password reset successfully. Redirecting to login...",
        icon: "success",
        background: "#1e293b",
        color: "#ffffff",
        confirmButtonColor: "#9333ea",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/login");
    } catch (error) {
      console.error("Reset password error:", error);
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
              RESET PASSWORD
            </h1>
            <p className="text-purple-300 text-sm font-bold uppercase tracking-wider">
              Enter the OTP and your new password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                OTP Code
              </label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) =>
                  setFormData({ ...formData, otp: e.target.value })
                }
                required
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-4 py-3 transition-all text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-purple-400 mt-1">
                Check your email for the 6-digit code
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-4 py-3 transition-all text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-4 py-3 transition-all text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "RESETTING..." : "🔐 RESET PASSWORD"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-purple-300 hover:text-purple-200 text-sm font-bold transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Power Message */}
        <div className="mt-6 text-center">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
            🔥 RISE STRONGER • 🎯 SECURE YOUR MISSION
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-500/30">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-purple-300 mt-4">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
