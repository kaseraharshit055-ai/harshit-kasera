import React from 'react';
import { Menu, Sparkles, Box, Flame, ExternalLink } from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopNavProps {
  activePage: NavPage;
  onOpenMobileMenu: () => void;
  onQuickTryDemo: () => void;
}

export function TopNav({ activePage, onOpenMobileMenu, onQuickTryDemo }: TopNavProps) {
  const getPageTitle = () => {
    switch (activePage) {
      case 'image-to-3d':
        return 'Image to 3D';
      case '3d-studio':
        return '3D Studio';
      case 'prompt-to-3d':
        return 'Prompt to 3D';
      case 'asset-library':
        return 'Asset Library';
      case 'settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#262626] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#888888] hover:text-[#ededed] hover:bg-[#141414]"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#888888] hidden sm:inline">ShapeX</span>
          <span className="text-[#383838] hidden sm:inline">/</span>
          <span className="text-[#00f2ff] font-semibold">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onQuickTryDemo}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] text-[#ededed] border border-[#262626] hover:border-[#383838] text-xs font-mono transition-colors"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Objects</span>
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#121212] border border-[#262626] text-xs font-mono text-[#888888]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline">Gemini Vision & 3D</span>
        </div>
      </div>
    </header>
  );
}
