import React from 'react';
import { Box, Sparkles, ArrowRight, Layers, Cpu, Eye } from 'lucide-react';
import { DEMO_IMAGES } from '../data/demoImages';
import { DemoImageItem, UploadedImageInfo, ImageAnalysisResult } from '../types';

interface AssetLibraryViewProps {
  onSelectAsset: (imageInfo: UploadedImageInfo, analysis: ImageAnalysisResult) => void;
}

export function AssetLibraryView({ onSelectAsset }: AssetLibraryViewProps) {
  const handleOpenAsset = (demo: DemoImageItem) => {
    const syntheticInfo: UploadedImageInfo = {
      dataUrl: demo.thumbnail,
      name: `${demo.id}.svg`,
      size: 26000,
      width: 400,
      height: 400,
      type: 'image/svg+xml',
    };
    onSelectAsset(syntheticInfo, demo.analysis);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs font-mono mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>PRE-ANALYZED 3D ASSETS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#ededed]">Asset Library</h1>
          <p className="text-[#888888] text-sm mt-1">
            Pre-configured procedural geometry models ready for inspection and AI-assisted modification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_IMAGES.map((item) => (
          <div
            key={item.id}
            className="bg-[#121212] border border-[#262626] rounded-2xl p-5 hover:border-[#00f2ff]/50 hover:shadow-[0_0_25px_rgba(0,242,255,0.12)] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square rounded-xl bg-[#0c0c0c] border border-[#262626] mb-4 p-4 flex items-center justify-center relative overflow-hidden group-hover:border-[#383838] transition-colors">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#171717] border border-[#262626] text-[10px] font-mono text-[#00f2ff]">
                  {item.category}
                </div>
              </div>

              <h3 className="text-base font-bold text-[#ededed] group-hover:text-[#00f2ff] transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-[#888888] mt-1 line-clamp-2">
                {item.label}
              </p>

              <div className="mt-4 pt-3 border-t border-[#262626] flex flex-wrap gap-1.5 text-[11px] font-mono text-[#888888]">
                <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#262626] text-[#ededed]">
                  Mat: {Array.isArray(item.analysis.materials) ? item.analysis.materials.join(', ') : item.analysis.materials}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#262626] text-[#ededed]">
                  Detail: {item.analysis.complexity}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAsset(item)}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] hover:bg-[#00f2ff] hover:text-black text-[#ededed] text-xs font-semibold border border-[#262626] hover:border-[#00f2ff] transition-all shadow-sm cursor-pointer"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Open in 3D Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
