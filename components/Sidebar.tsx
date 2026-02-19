import React from 'react';
import { Aperture, Upload, MessageSquareText, Settings, Globe } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-navy text-gold p-6 border-r border-gold shadow-lg">
      <div className="text-2xl font-bold mb-10 text-center">
        <Aperture className="inline-block mr-3" size={32} />
        GHOST ARCHITECT
      </div>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="#dashboard" className="flex items-center text-lg hover:text-white transition-colors">
              <MessageSquareText className="mr-3" size={20} />
              Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a href="#vault" className="flex items-center text-lg hover:text-white transition-colors">
              <Upload className="mr-3" size={20} />
              Private Vault
            </a>
          </li>
          <li className="mb-4">
            <a href="#settings" className="flex items-center text-lg hover:text-white transition-colors">
              <Settings className="mr-3" size={20} />
              Settings
            </a>
          </li>
        </ul>
      </nav>
      <div className="absolute bottom-6 left-0 w-full px-6">
        <div className="flex items-center justify-between">
          <Globe className="text-gold" size={20} />
          <span className="text-sm text-gold">Local Mode: OFF</span>
          {/* Local Toggle Switch Here */}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
