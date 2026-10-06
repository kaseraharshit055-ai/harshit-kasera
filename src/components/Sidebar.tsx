import React from 'react';
import { 
  Box, 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Wand2, 
  FolderGit2, 
  Settings, 
  ChevronRight,
  Hexagon,
  Cpu
} from 'lucide-react';

export type NavPage = 'image-to-3d' | '3d-studio' | 'prompt-to-3d' | 'asset-library' | 'settings';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activePage, onNavigate, isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const navItems = [
    {
      id: 'image-to-3d' as NavPage,
      label: 'Image to 3D',
      icon: ImageIcon,
      badge: 'NEW',
      isNew: true,
      desc: 'Reconstruct 3D from visual reference',
    },
    {
      id: '3d-studio' as NavPage,
      label: '3D Studio',
      icon: Box,
      badge: 'PRO',
      desc: 'Interactive Three.js scene viewport',
    },
    {
      id: 'prompt-to-3d' as NavPage,
      label: 'Prompt to 3D',
      icon: Wand2,
      desc: 'Generate scene via natural language',
    },
    {
      id: 'asset-library' as NavPage,
      label: 'Asset Library',
      icon: FolderGit2,
      desc: 'Pre-analyzed procedural 3D models',
    },
    {
      id: 'settings' as NavPage,
      label: 'Settings',
      icon: Settings,
      desc: 'PBR Shaders & lighting preferences',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-[#262626] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f2ff]/20 to-[#00f2ff]/5 border border-[#00f2ff]/40 shadow-md shadow-[#00f2ff]/10">
              <Hexagon className="w-5 h-5 text-[#00f2ff]" />
              <div className="absolute inset-0 rounded-xl border border-white/10" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wider text-[#ededed] flex items-center gap-1">
                Shape<span className="text-[#00f2ff]">X</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#888888] uppercase block">
                3D AI PLATFORM
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#888888] hover:text-[#ededed] rounded-lg hover:bg-[#141414]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 py-1 text-[11px] font-mono font-medium text-[#71717a] tracking-wider">
            CORE WORKFLOWS
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-[#141414] text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.08)]'
                    : 'text-[#888888] hover:text-[#ededed] hover:bg-[#141414] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30'
                        : 'bg-[#121212] text-[#888888] group-hover:text-[#ededed] border border-[#262626]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="block truncate">{item.label}</span>
                    <span className="text-[10px] text-[#71717a] font-normal font-sans block truncate">
                      {item.desc}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide shrink-0 ${
                      item.isNew
                        ? 'bg-[#00f2ff] text-black shadow-sm font-semibold'
                        : 'bg-[#1f1635] text-purple-300 border border-purple-800/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Engine Telemetry Bottom Card */}
        <div className="p-3 border-t border-[#262626] bg-[#080808]">
          <div className="p-3 rounded-xl bg-[#121212] border border-[#262626] text-[11px] font-mono space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#888888]">Gemini Engine</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-[#888888]">
              <span>Three.js WebGL</span>
              <span className="text-[#ededed]">R3F v9.7</span>
            </div>
            <div className="pt-1 border-t border-[#262626] flex items-center gap-1.5 text-[#71717a] text-[10px]">
              <Cpu className="w-3 h-3 text-[#00f2ff]" />
              <span>ShapeX AI Studio Core 2.5</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
