"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Mode = "choose" | "student-login" | "student-register" | "admin-login";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push(isAdmin ? '/admin' : '/');
    }
  }, [loading, user, isAdmin, router]);
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent, redirectTo: string) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ email, password, firstName, lastName, phone: phone || undefined });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src="/Logo.png"
                alt="Children's Foundation of America Logo"
                className="h-16 w-16 object-contain flex-shrink-0"
              />
              <div>
                <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                  Children's Foundation of America
                </h1>
                <p className="text-gray-600">Scholarship Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to the CFA Scholarship Portal
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Supporting present and former foster youth in pursuing their academic and
            vocational education goals.
          </p>
          <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2 inline-block">
            For the best experience, please use Google Chrome.
          </p>
        </div>

        {mode === "choose" && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Login Card */}
            <button
              onClick={() => { resetForm(); setMode("student-login"); }}
              className="bg-white rounded-lg shadow-xl p-8 text-left hover:shadow-2xl transition-shadow group"
            >
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-6 group-hover:bg-violet-200 transition-colors">
                <User className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Student Login</h3>
              <p className="text-gray-600 mb-6">
                Access your scholarship applications and manage your awards
              </p>
              <span className="inline-flex items-center gap-2 text-violet-600 font-semibold group-hover:gap-3 transition-all duration-200">
                Continue as Student
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {/* Admin Login Card */}
            <button
              onClick={() => { resetForm(); setMode("admin-login"); }}
              className="bg-white rounded-lg shadow-xl p-8 text-left hover:shadow-2xl transition-shadow group"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Admin Login</h3>
              <p className="text-gray-600 mb-6">
                Manage applications, review submissions, and oversee the scholarship program
              </p>
              <span className="inline-flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all duration-200">
                Continue as Admin
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}

        {/* Student Login Form */}
        {mode === "student-login" && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
            <button
              onClick={() => { resetForm(); setMode("choose"); }}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Student Login</h3>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e, "/")} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setError(""); setMode("student-register"); }}
                  className="text-violet-600 font-medium hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Student Registration Form */}
        {mode === "student-register" && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
            <button
              onClick={() => { resetForm(); setMode("student-login"); }}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Create Account</h3>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-10"
                    placeholder="Min 8 chars, upper, lower, number, special"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be 8-32 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => { setError(""); setMode("student-login"); }}
                  className="text-violet-600 font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Admin Login Form */}
        {mode === "admin-login" && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
            <button
              onClick={() => { resetForm(); setMode("choose"); }}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Admin Login</h3>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e, "/admin")} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

