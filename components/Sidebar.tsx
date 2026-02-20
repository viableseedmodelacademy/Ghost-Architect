"use client";

import React, { useState } from 'react';
import { Aperture, Upload, MessageSquareText, Settings, Globe, ChevronRight, Sparkles, FileText, Shield } from 'lucide-react';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isLocalMode, setIsLocalMode] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: MessageSquareText, label: 'Dashboard' },
    { id: 'vault', icon: Upload, label: 'Private Vault' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-navy-dark to-navy border-r border-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center glow-gold-sm">
              <Aperture className="text-navy-dark" size={28} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-navy-dark animate-pulse-gold"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient-gold">GHOST</h1>
            <p className="text-xs text-muted tracking-wider">ARCHITECT</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-3 px-3">Main Menu</p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveItem(item.id)}
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

      {/* Mode Toggle */}
      <div className="p-4 border-t border-border">
        <div className="bg-surface/50 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe size={18} className={isLocalMode ? 'text-success' : 'text-muted'} />
              <span className="text-sm font-medium text-gold">Local Mode</span>
            </div>
            <button
              onClick={() => setIsLocalMode(!isLocalMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                isLocalMode ? 'bg-success' : 'bg-border'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  isLocalMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted">
            {isLocalMode
              ? 'Running on local infrastructure'
              : 'Connected to cloud services'}
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-navy-dark/50 rounded-lg">
          <Shield size={14} className="text-success" />
          <span className="text-xs text-muted">Enterprise-grade encryption</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;