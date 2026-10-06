import React, { useState } from 'react';
import { Settings, Sliders, Sun, Layers, Cpu, ShieldCheck } from 'lucide-react';

export function SettingsView() {
  const [antialiasing, setAntialiasing] = useState(true);
  const [shadowResolution, setShadowResolution] = useState('1024');
  const [autoRotateSpeed, setAutoRotateSpeed] = useState('1.8');
  const [defaultLighting, setDefaultLighting] = useState('studio');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-[#262626] text-[#888888] text-xs font-mono mb-2">
          <Settings className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span>ENGINE CONFIGURATION</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#ededed]">Studio Settings</h1>
        <p className="text-[#888888] text-sm mt-1">
          Configure Three.js WebGL viewport rendering parameters and AI reconstruction tolerances.
        </p>
      </div>

      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#00f2ff]">
            Viewport & PBR Shaders
          </h3>

          <div className="flex items-center justify-between py-3 border-b border-[#262626]">
            <div>
              <div className="text-xs font-semibold text-[#ededed]">Hardware Antialiasing (MSAA)</div>
              <div className="text-[11px] text-[#888888]">Smooth geometric polygon edges during orbit</div>
            </div>
            <input
              type="checkbox"
              checked={antialiasing}
              onChange={(e) => setAntialiasing(e.target.checked)}
              className="w-4 h-4 rounded text-[#00f2ff] focus:ring-[#00f2ff] bg-[#171717] border-[#262626]"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#262626]">
            <div>
              <div className="text-xs font-semibold text-[#ededed]">Shadow Map Resolution</div>
              <div className="text-[11px] text-[#888888]">Contact shadow texture size</div>
            </div>
            <select
              value={shadowResolution}
              onChange={(e) => setShadowResolution(e.target.value)}
              className="bg-[#171717] border border-[#262626] text-[#ededed] rounded-lg px-3 py-1.5 text-xs font-mono"
            >
              <option value="512">512 px (Low)</option>
              <option value="1024">1024 px (Standard)</option>
              <option value="2048">2048 px (Ultra)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#262626]">
            <div>
              <div className="text-xs font-semibold text-[#ededed]">Default Lighting Preset</div>
              <div className="text-[11px] text-[#888888]">Initial 3-point light setup for new models</div>
            </div>
            <select
              value={defaultLighting}
              onChange={(e) => setDefaultLighting(e.target.value)}
              className="bg-[#171717] border border-[#262626] text-[#ededed] rounded-lg px-3 py-1.5 text-xs font-mono capitalize"
            >
              <option value="studio">Studio</option>
              <option value="neon">Cyber Neon</option>
              <option value="warm">Warm Sunlight</option>
              <option value="cool">Cool Tech</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#00f2ff]">
            AI Engine Safety & Grounding
          </h3>

          <div className="p-4 rounded-xl bg-[#0c0c0c] border border-[#262626] text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Scene JSON Schema Validation Active</span>
            </div>
            <p className="text-[#888888] text-[11px] leading-relaxed">
              ShapeX enforces strict schema checking on all Gemini API scene responses. Arbitrary JavaScript execution is blocked, guaranteeing that only validated Three.js geometries are rendered in your viewport.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
          <span className="text-xs text-[#71717a] font-mono">ShapeX v2.5.0 Production</span>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#00f2ff] hover:bg-[#33f5ff] text-black font-semibold text-xs transition-colors shadow-md shadow-[#00f2ff]/20 cursor-pointer"
          >
            Save Preferences
          </button>
        </div>

        {showSavedToast && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center animate-in fade-in">
            Preferences successfully saved.
          </div>
        )}
      </div>
    </div>
  );
}
