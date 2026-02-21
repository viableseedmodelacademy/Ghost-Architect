"use client";

import React, { useState } from "react";
import { Scale, Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Login successful
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-4 glow-gold">
            <Scale className="text-navy-dark" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Legal Oracle</h1>
          <p className="text-muted">Enterprise-grade AI-powered legal research</p>
          <p className="text-xs text-muted mt-2">Powered By Alwenum AI</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface/30 rounded-2xl border border-border p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <Lock className="text-gold" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gold">Secure Login</h2>
              <p className="text-xs text-muted">Enter your credentials to continue</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 animate-fade-in">
              <AlertCircle className="text-error flex-shrink-0" size={20} />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-hover-lift flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted text-center">
              🔒 Your session is encrypted and secure. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          © 2024 Legal Oracle. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;