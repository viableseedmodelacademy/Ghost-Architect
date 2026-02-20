"use client";

import React, { useState, useEffect } from "react";
import { Key, Save, Eye, EyeOff, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError("Please enter a valid API key");
      return;
    }

    // Save to localStorage
    localStorage.setItem("gemini_api_key", apiKey.trim());
    setSaved(true);
    setError("");
    
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setSaved(false);
  };

  return (
    <div className="space-y-8">
      {/* API Key Section */}
      <div className="bg-surface/30 rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
            <Key className="text-navy-dark" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gold">API Configuration</h3>
            <p className="text-xs text-muted">Configure your Gemini API key for cloud mode</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gold mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="w-full px-4 py-3 pr-12 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              Get your API key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm animate-fade-in">
              <CheckCircle2 size={16} />
              API key saved successfully!
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 btn-hover-lift flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save API Key
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-surface hover:bg-error/10 border border-border hover:border-error/30 text-muted hover:text-error rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Local Mode Info */}
      <div className="bg-surface/30 rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Key className="text-success" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gold">Local Mode</h3>
            <p className="text-xs text-muted">No API key required</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          When Local Mode is enabled, the application uses Ollama running on your local machine. 
          Make sure Ollama is installed and running with your preferred model (e.g., llama2).
        </p>
        <div className="mt-4 p-3 bg-navy-dark/50 rounded-lg border border-border">
          <code className="text-xs text-gold">
            ollama run llama2
          </code>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-surface/30 rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold text-gold mb-4">How to Use</h3>
        <ol className="space-y-3 text-sm text-muted">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold">1</span>
            <span>Get your API key from Google AI Studio (link above)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold">2</span>
            <span>Paste the API key in the field above and click Save</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold">3</span>
            <span>Go to Dashboard and start chatting with THE LEGAL ORACLE</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold">4</span>
            <span>Toggle Local Mode if you want to use Ollama instead</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Settings;