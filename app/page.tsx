import Sidebar from "../components/Sidebar";
import FileUploader from "../components/FileUploader";
import ChatWindow from "../components/ChatWindow";
import { Scale, Brain, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />
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
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Documents Indexed", value: "2,847", icon: Scale },
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
                <FileUploader />
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
              <ChatWindow />
            </section>
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