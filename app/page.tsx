"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import FileUploader from "../components/FileUploader";
import ChatWindow from "../components/ChatWindow";
import Settings from "../components/Settings";
import { Scale, Brain, Shield, Zap } from "lucide-react";

interface FileContext {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content?: string;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [processedFiles, setProcessedFiles] = useState<FileContext[]>([]);

  const handleFilesProcessed = (files: FileContext[]) => {
    setProcessedFiles(files);
  };

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="px-8 py-6 border-b border-border bg-surface/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-gold">
                THE LEGAL ORACLE
              </h1>
              <p className="text-muted mt-1">
                Enterprise-grade AI-powered legal research platform
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Feature Badges */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/50 rounded-lg border border-border">
                  <Brain size={14} className="text-gold" />
                  <span className="text-xs text-muted">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/50 rounded-lg border border-border">
                  <Shield size={14} className="text-success" />
                  <span className="text-xs text-muted">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/50 rounded-lg border border-border">
                  <Zap size={14} className="text-gold-light" />
                  <span className="text-xs text-muted">Fast</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gold">Settings</h2>
                  <p className="text-muted">Configure your API keys and preferences</p>
                </div>
                <Settings />
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[ 
                    { label: "Documents Indexed", value: processedFiles.length.toString(), icon: Scale },
                    { label: "Queries Processed", value: "15.2K", icon: Brain },
                    { label: "Avg Response Time", value: "1.2s", icon: Zap },
                    { label: "Accuracy Rate", value: "99.2%", icon: Shield },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-surface/30 rounded-xl border border-border p-5 hover:border-gold/30 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <stat.icon size={20} className="text-gold" />
                        <span className="text-xs text-muted">Live</span>
                      </div>
                      <p className="text-2xl font-bold text-gold">{stat.value}</p>
                      <p className="text-sm text-muted mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Private Vault Section */}
                  <section className="bg-surface/20 rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                        <Scale className="text-navy-dark" size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gold">Private Vault</h2>
                        <p className="text-xs text-muted">Secure document management</p>
                      </div>
                    </div>
                    <FileUploader onFilesProcessed={handleFilesProcessed} processedFiles={processedFiles} />
                  </section>

                  {/* Quick Actions */}
                  <section className="bg-surface/20 rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                        <Zap className="text-navy-dark" size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gold">Quick Actions</h2>
                        <p className="text-xs text-muted">Common research tasks</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { title: "Case Law Search", desc: "Find relevant precedents" },
                        { title: "Statute Analysis", desc: "Interpret legislation" },
                        { title: "Contract Review", desc: "Analyze agreements" },
                        { title: "Legal Brief", desc: "Generate summaries" },
                      ].map((action, i) => (
                        <button
                          key={i}
                          className="p-4 text-left bg-surface/50 hover:bg-surface border border-border hover:border-gold/30 rounded-xl transition-all duration-200 group"
                        >
                          <p className="font-medium text-gold group-hover:text-gold-light transition-colors">
                            {action.title}
                          </p>
                          <p className="text-xs text-muted mt-1">{action.desc}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Chat Section */}
                <section className="bg-surface/20 rounded-2xl border border-border overflow-hidden" style={{ height: "600px" }}>
                  <ChatWindow processedFiles={processedFiles} />
                </section>
              </>
            )}

            {/* Vault Section */}
            {activeSection === "vault" && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gold">Private Vault</h2>
                  <p className="text-muted">Upload and manage your legal documents</p>
                </div>
                <div className="bg-surface/20 rounded-2xl border border-border p-6">
                  <FileUploader onFilesProcessed={handleFilesProcessed} processedFiles={processedFiles} />
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === "documents" && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gold">Documents</h2>
                  <p className="text-muted">Browse your uploaded documents</p>
                </div>
                {processedFiles.length > 0 ? (
                  <div className="bg-surface/20 rounded-2xl border border-border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {processedFiles.map((file, index) => (
                        <div key={index} className="p-4 bg-surface/50 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-navy-dark flex items-center justify-center">
                              <Scale className="text-gold" size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gold truncate">{file.name}</p>
                              <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface/20 rounded-2xl border border-border p-12 text-center">
                    <Scale className="mx-auto text-gold mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gold mb-2">No Documents Yet</h3>
                    <p className="text-muted mb-6">Upload documents in the Private Vault to get started</p>
                    <button
                      onClick={() => setActiveSection("vault")}
                      className="px-6 py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 transition-all duration-200"
                    >
                      Go to Private Vault
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-border bg-surface/20">
          <div className="flex items-center justify-between text-xs text-muted">
            <p>© 2024 GHOST ARCHITECT. All rights reserved.</p>
            <p>Powered by AI • Enterprise-grade security</p>
          </div>
        </footer>
      </main>
    </div>
  );
}