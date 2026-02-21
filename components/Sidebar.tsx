"use client";

import React from 'react';
import { Aperture, Upload, MessageSquareText, Settings, Globe, ChevronRight, Sparkles, FileText, Shield, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ activeSection, setActiveSection, isOpen = true, onToggle }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', icon: MessageSquareText, label: 'Dashboard' },
    { id: 'vault', icon: Upload, label: 'Private Vault' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024 && onToggle) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto
        w-72 min-h-screen bg-gradient-to-b from-navy-dark to-navy border-r border-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center glow-gold-sm">
                  <Aperture className="text-navy-dark" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-navy-dark animate-pulse-gold"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-gold">Legal</h1>
                <p className="text-xs text-muted tracking-wider">Oracle</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs text-muted uppercase tracking-wider mb-3 px-3">Main Menu</p>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-surface text-gold border border-gold/20'
                          : 'text-muted hover:text-gold hover:bg-surface/50'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-gold' : 'group-hover:text-gold'} />
                      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                      {isActive && (
                        <ChevronRight size={16} className="text-gold" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="bg-surface/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-gold" />
              <span className="text-sm font-medium text-gold">Quick Stats</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Documents</span>
                <span className="text-gold font-medium">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Queries Today</span>
                <span className="text-gold font-medium">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Storage Used</span>
                <span className="text-gold font-medium">2.4 GB</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Mode Info */}
        <div className="p-4 border-t border-border">
          <div className="bg-surface/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-gold" />
              <span className="text-sm font-medium text-gold">Cloud Mode</span>
            </div>
            <p className="text-xs text-muted">
              Connected to Cohere AI for legal research
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-navy-dark/50 rounded-lg">
            <Shield size={14} className="text-success" />
            <span className="text-xs text-muted">Enterprise-grade encryption</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;