import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Lightbulb, Box } from 'lucide-react';
import { SceneDescription, ImageAnalysisResult, UploadedImageInfo } from '../types';
import { imageTo3DService } from '../services/imageTo3DService';
import { DEMO_IMAGES } from '../data/demoImages';

interface PromptTo3DViewProps {
  onOpenInStudio: (imageInfo: UploadedImageInfo, analysis: ImageAnalysisResult) => void;
}

const SAMPLE_PROMPTS = [
  'Pro racing gaming chair with ergonomic backrest and lumbar pillow',
  'Double-wall vacuum insulated sports bottle with carabiner cap',
  'Minimalist modern desk with solid oak top and steel legs',
  'Aerial quadcopter drone with 4K camera gimbal and carbon arms',
  'Studio reference headphones with cushioned headband and aluminum cups',
];

export function PromptTo3DView({ onOpenInStudio }: PromptTo3DViewProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      // Find closest matching template
      const lower = prompt.toLowerCase();
      let matchedDemo = DEMO_IMAGES[0];
      if (lower.includes('bottle') || lower.includes('flask')) matchedDemo = DEMO_IMAGES[1];
      else if (lower.includes('desk') || lower.includes('table')) matchedDemo = DEMO_IMAGES[2];
      else if (lower.includes('drone') || lower.includes('quad')) matchedDemo = DEMO_IMAGES[3];
      else if (lower.includes('headphone') || lower.includes('audio')) matchedDemo = DEMO_IMAGES[4];

      const customAnalysis: ImageAnalysisResult = {
        ...matchedDemo.analysis,
        objectName: prompt.slice(0, 30),
      };

      const syntheticImageInfo: UploadedImageInfo = {
        dataUrl: matchedDemo.thumbnail,
        name: `${matchedDemo.id}.svg`,
        size: 24000,
        width: 400,
        height: 400,
        type: 'image/svg+xml',
      };

      setIsGenerating(false);
      onOpenInStudio(syntheticImageInfo, customAnalysis);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs font-mono mb-4">
          <Wand2 className="w-3.5 h-3.5" />
          <span>TEXT TO 3D SYNTHESIZER</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#ededed] mb-2">Prompt to 3D</h1>
        <p className="text-[#888888] text-sm max-w-lg mx-auto">
          Describe any industrial, ergonomic, or furniture object to generate a structured 3D Three.js scene.
        </p>
      </div>

      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Ergonomic gaming chair with red bolsters and steel 5-wheel star base..."
            rows={4}
            className="w-full bg-[#171717] border border-[#262626] rounded-xl p-4 text-sm text-[#ededed] placeholder:text-[#555555] focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] resize-none font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-[#888888]">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Or click an inspiration prompt below</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="px-6 py-2.5 rounded-xl bg-[#00f2ff] hover:bg-[#33f5ff] text-black font-semibold text-xs shadow-lg shadow-[#00f2ff]/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Generate 3D Scene</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-[#262626] flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(sample)}
                className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#202020] text-[#a1a1aa] hover:text-[#00f2ff] border border-[#262626] text-xs font-mono text-left transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
