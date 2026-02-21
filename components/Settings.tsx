"use client";

import React, { useState } from "react";
import { Lock, Shield, Loader2, Copy, Check, CheckCircle2, AlertCircle } from "lucide-react";

const Settings = () => {
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [newHash, setNewHash] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setNewHash("");

    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess(data.message);
      setNewHash(data.newHash);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Password Change Section */}
      <div className="bg-surface/30 rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
            <Lock className="text-navy-dark" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gold">Change Password</h3>
            <p className="text-xs text-muted">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-12 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                className="w-full px-4 py-3 pr-12 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
            />
          </div>

          {/* Status Messages */}
          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              <AlertCircle size={16} />
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} />
                {passwordSuccess}
              </div>
              {newHash && (
                <div className="mt-3 p-3 bg-navy-dark/50 rounded-lg border border-border">
                  <p className="text-xs text-muted mb-2">
                    For Vercel deployment, update your environment variable:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gold flex-1 break-all">{newHash}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(newHash)}
                      className="p-2 hover:bg-surface rounded-lg transition-colors"
                      title="Copy hash"
                    >
                      {copied ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-muted" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-hover-lift flex items-center justify-center gap-2"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Shield size={18} />
                <span>Change Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* System Info */}
      <div className="bg-surface/30 rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold text-gold mb-4">System Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Version</span>
            <span className="text-gold">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Platform</span>
            <span className="text-gold">Alwenum AI</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">AI Model</span>
            <span className="text-gold">Alwenum - "Command"</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;