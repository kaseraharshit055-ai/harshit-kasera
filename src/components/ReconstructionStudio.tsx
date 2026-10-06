import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Eye, 
  Grid3X3, 
  Sun, 
  Palette, 
  Sliders, 
  RefreshCw, 
  RotateCcw, 
  CheckCircle2, 
  Maximize2, 
  HelpCircle,
  Cpu,
  Box,
  Image as ImageIcon,
  Check,
  Zap,
  Download
} from 'lucide-react';
import { 
  SceneDescription, 
  UploadedImageInfo, 
  ImageAnalysisResult, 
  ModelQuality, 
  MaterialType, 
  LightingPreset, 
  SceneObject 
} from '../types';
import { imageTo3DService } from '../services/imageTo3DService';
import { ThreeCanvas } from './ThreeCanvas';
import { ShapeXAIPanel } from './ShapeXAIPanel';
import { ExportModal } from './ExportModal';

interface ReconstructionStudioProps {
  imageInfo: UploadedImageInfo;
  analysis: ImageAnalysisResult;
  onStartOver: () => void;
}

type ReconstructionStage = 'reference' | 'synthesizing' | 'ready';

const MATERIAL_OPTIONS: MaterialType[] = [
  'plastic',
  'metal',
  'glass',
  'wood',
  'fabric',
  'rubber',
  'matte',
  'glossy',
];

export function ReconstructionStudio({
  imageInfo,
  analysis,
  onStartOver,
}: ReconstructionStudioProps) {
  // 3-Stage Progress: 1. Reference Image, 2. AI Reconstruction, 3. 3D Model
  const [stage, setStage] = useState<ReconstructionStage>('synthesizing');
  const [synthProgress, setSynthProgress] = useState(0);
  const [synthStatusText, setSynthStatusText] = useState('Initializing volumetric synthesis...');

  // Model Quality
  const [quality, setQuality] = useState<ModelQuality>('medium');

  // Scene state and History stack for Undo / Redo
  const [initialScene, setInitialScene] = useState<SceneDescription>(() => 
    imageTo3DService.generateScene({ analysis, quality: 'medium' })
  );
  const [sceneHistory, setSceneHistory] = useState<SceneDescription[]>([initialScene]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active current scene
  const currentScene = sceneHistory[historyIndex] || initialScene;

  // Viewport toggles
  const [wireframe, setWireframe] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [lighting, setLighting] = useState<LightingPreset>('studio');
  const [materialOverride, setMaterialOverride] = useState<MaterialType | null>(null);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);

  // Side panels & overlays
  const [showReferenceOverlay, setShowReferenceOverlay] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Simulate 3-stage synthesis when component mounts
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current === 20) {
        setSynthStatusText('Extracting geometric primitives from visual contours...');
      } else if (current === 40) {
        setSynthStatusText('Synthesizing coordinate transforms and volumetric bounding boxes...');
      } else if (current === 60) {
        setSynthStatusText('Assigning PBR physical material shaders...');
      } else if (current === 80) {
        setSynthStatusText('Compiling Three.js interactive scene graph...');
      } else if (current >= 100) {
        clearInterval(interval);
        setSynthProgress(100);
        setTimeout(() => {
          setStage('ready');
        }, 500);
      }
      setSynthProgress(Math.min(current, 100));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Update Scene handler (called by AI or manual controls)
  const handleUpdateScene = (newScene: SceneDescription) => {
    const updatedHistory = sceneHistory.slice(0, historyIndex + 1);
    updatedHistory.push(newScene);
    setSceneHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < sceneHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Reset to initial scene
  const handleReset = () => {
    const fresh = imageTo3DService.generateScene({ analysis, quality });
    handleUpdateScene(fresh);
  };

  // Regenerate approximation
  const handleRegenerate = () => {
    const fresh = imageTo3DService.generateScene({ analysis, quality });
    handleUpdateScene(fresh);
  };

  // Improve Detail (Cycle low -> medium -> high)
  const handleImproveDetail = () => {
    const nextQuality: ModelQuality = quality === 'low' ? 'medium' : (quality === 'medium' ? 'high' : 'medium');
    setQuality(nextQuality);
    const updated = imageTo3DService.generateScene({ analysis, quality: nextQuality });
    handleUpdateScene(updated);
  };

  // Quick Material Change
  const handleApplyMaterial = (mat: MaterialType) => {
    setMaterialOverride(mat);
    setShowMaterialModal(false);
  };

  // Export Scene JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentScene, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${analysis.objectName.toLowerCase().replace(/\s+/g, '_')}_shapex_3d.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-[#050505] text-[#ededed] overflow-hidden">
      {/* Top 3-Stage Progress & Action Bar */}
      <header className="px-4 py-3 bg-[#0a0a0a] border-b border-[#262626] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onStartOver}
            className="p-2 rounded-xl text-[#888888] hover:text-[#ededed] hover:bg-[#141414] transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Return to Image to 3D Upload"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
          <div className="h-4 w-[1px] bg-[#262626]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#ededed] tracking-wide">
                ShapeX 3D Studio
              </h2>
              {/* Mandatory AI Estimated Label */}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] font-medium">
                AI Estimated 3D Model
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#888888]">
              {analysis.objectName} • {analysis.category}
            </p>
          </div>
        </div>

        {/* Center: 3 STAGES INDICATOR */}
        <div className="flex items-center gap-1 bg-[#121212] border border-[#262626] px-3 py-1.5 rounded-xl text-xs font-mono">
          {/* Stage 1: Reference Image */}
          <button
            onClick={() => setShowReferenceOverlay(!showReferenceOverlay)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
              showReferenceOverlay ? 'bg-[#00f2ff]/15 text-[#00f2ff]' : 'text-[#888888] hover:text-[#ededed]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#1c1c1c] text-[10px] flex items-center justify-center font-bold text-[#888888]">
              1
            </span>
            <span>Reference Image</span>
          </button>

          <span className="text-[#383838]">→</span>

          {/* Stage 2: AI Reconstruction */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
            stage === 'synthesizing' ? 'bg-[#00f2ff]/15 text-[#00f2ff] animate-pulse' : 'text-[#888888]'
          }`}>
            <span className="w-4 h-4 rounded-full bg-[#1c1c1c] text-[10px] flex items-center justify-center font-bold text-[#888888]">
              2
            </span>
            <span>AI Reconstruction</span>
            {stage === 'ready' && <Check className="w-3 h-3 text-emerald-400" />}
          </div>

          <span className="text-[#383838]">→</span>

          {/* Stage 3: 3D Model */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
            stage === 'ready' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-[#555555]'
          }`}>
            <span className="w-4 h-4 rounded-full bg-[#1c1c1c] text-[10px] flex items-center justify-center font-bold text-[#888888]">
              3
            </span>
            <span>3D Model</span>
          </div>
        </div>

        {/* Right: Quick Studio Actions */}
        <div className="flex items-center gap-2">
          {/* Quality Selector */}
          <div className="hidden sm:flex items-center bg-[#121212] border border-[#262626] rounded-lg p-0.5 text-xs font-mono">
            {(['low', 'medium', 'high'] as ModelQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuality(q);
                  const fresh = imageTo3DService.generateScene({ analysis, quality: q });
                  handleUpdateScene(fresh);
                }}
                className={`px-2 py-1 rounded-md capitalize transition-colors ${
                  quality === q ? 'bg-[#00f2ff] text-black font-bold' : 'text-[#888888] hover:text-[#ededed]'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            title="Export 3D Model (.OBJ, .GLB, .STL, .JSON)"
            className="px-2.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] hover:border-[#00f2ff]/40 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm group"
          >
            <Download className="w-3.5 h-3.5 text-[#00f2ff] group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Export</span>
            <span className="hidden sm:inline text-[10px] text-[#888888]">(.OBJ/.GLB/.STL)</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: 3D Viewer on Left + ShapeX AI Panel on Right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* STAGE 2: PROCESSING ANIMATION OVERLAY */}
        {stage === 'synthesizing' && (
          <div className="absolute inset-0 z-40 bg-[#050505]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#00f2ff]/20 to-blue-600/20 border border-[#00f2ff]/40 flex items-center justify-center text-[#00f2ff] shadow-[0_0_50px_rgba(0,242,255,0.25)]">
                <Box className="w-10 h-10 animate-bounce" />
              </div>
              <div className="absolute -inset-1 rounded-3xl border border-[#00f2ff]/30 animate-ping pointer-events-none" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] text-xs font-mono mb-3">
              <Cpu className="w-3.5 h-3.5 animate-spin" />
              <span>STAGE 2 // AI RECONSTRUCTION</span>
            </div>

            <h3 className="text-xl font-bold text-[#ededed] mb-2">
              Synthesizing 3D Geometry
            </h3>
            <p className="text-xs font-mono text-[#00f2ff] max-w-md mx-auto mb-6">
              {synthStatusText}
            </p>

            {/* Progress bar */}
            <div className="w-72 bg-[#121212] border border-[#262626] rounded-full h-2 overflow-hidden shadow-inner mb-3">
              <div 
                className="bg-gradient-to-r from-[#00f2ff] to-[#00b4d8] h-full transition-all duration-300 rounded-full"
                style={{ width: `${synthProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#888888]">
              {synthProgress}% • Processing Three.js Geometry Map
            </span>
          </div>
        )}

        {/* 3D Viewport Column */}
        <main className="flex-1 flex flex-col h-full overflow-hidden p-3 lg:p-4 relative">
          {/* Result Status Banner */}
          {stage === 'ready' && (
            <div className="mb-3 bg-[#121212]/90 border border-[#262626] backdrop-blur-md rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                    3D Model Generated
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                      Interactive Three.js
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#888888]">
                    Editable mesh graph with {currentScene.objects.length} geometric elements.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Edit Model, Regenerate, Improve Detail, Change Material, Start Over */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setIsAIPanelOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#00f2ff] hover:bg-[#33f5ff] text-black font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Edit Model</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] text-[#ededed] border border-[#262626] flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#00f2ff]" />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleImproveDetail}
                  className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] text-[#ededed] border border-[#262626] flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Improve Detail ({quality})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMaterialModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] text-[#ededed] border border-[#262626] flex items-center gap-1.5 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Change Material</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#ededed] border border-[#262626] hover:border-[#00f2ff]/60 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Export 3D Model (.OBJ, .GLB, .STL, .JSON)"
                >
                  <Download className="w-3.5 h-3.5 text-[#00f2ff]" />
                  <span>Export 3D</span>
                </button>

                <button
                  type="button"
                  onClick={onStartOver}
                  className="px-3 py-1.5 rounded-lg bg-[#241014] hover:bg-[#34161c] text-red-300 border border-red-900/50 flex items-center gap-1.5 transition-colors"
                >
                  <span>Start Over</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive 3D Canvas Viewport */}
          <div className="flex-1 relative w-full h-full min-h-[350px]">
            <ThreeCanvas
              scene={currentScene}
              wireframeGlobal={wireframe}
              gridVisible={gridVisible}
              materialOverride={materialOverride}
              lightingPreset={lighting}
              selectedObjectId={selectedObject?.id}
              onSelectObject={(obj) => setSelectedObject(obj)}
            />

            {/* Viewport Floating Toggles Toolbar */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#262626] p-1.5 rounded-xl shadow-xl">
              {/* Wireframe toggle */}
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  wireframe ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40' : 'text-[#888888] hover:text-[#ededed] hover:bg-[#181818]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Wireframe</span>
              </button>

              {/* Grid toggle */}
              <button
                onClick={() => setGridVisible(!gridVisible)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  gridVisible ? 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40' : 'text-[#888888] hover:text-[#ededed] hover:bg-[#181818]'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>

              {/* Lighting selector */}
              <div className="flex items-center gap-1 pl-1 border-l border-[#262626]">
                <Sun className="w-3.5 h-3.5 text-amber-400 ml-1" />
                {(['studio', 'neon', 'warm', 'cool'] as LightingPreset[]).map((lp) => (
                  <button
                    key={lp}
                    onClick={() => setLighting(lp)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-colors ${
                      lighting === lp ? 'bg-[#222222] text-[#00f2ff] font-bold' : 'text-[#888888] hover:text-[#ededed]'
                    }`}
                  >
                    {lp}
                  </button>
                ))}
              </div>

              {/* Reference Image Quick Button */}
              <div className="pl-1 border-l border-[#262626]">
                <button
                  onClick={() => setShowReferenceOverlay(!showReferenceOverlay)}
                  className="px-2 py-1 rounded-lg text-xs font-mono text-[#888888] hover:text-[#ededed] hover:bg-[#181818] flex items-center gap-1 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ref</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right-Side Panel: ShapeX AI Natural Language 3D Editor */}
        <ShapeXAIPanel
          currentScene={currentScene}
          onUpdateScene={handleUpdateScene}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          onRegenerate={handleRegenerate}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < sceneHistory.length - 1}
          isOpen={isAIPanelOpen}
          onToggleOpen={() => setIsAIPanelOpen(!isAIPanelOpen)}
        />
      </div>

      {/* STAGE 1: REFERENCE IMAGE CORNER OVERLAY */}
      {showReferenceOverlay && (
        <div className="fixed bottom-16 right-6 z-50 bg-[#121212]/95 border border-[#262626] rounded-2xl p-4 shadow-2xl max-w-sm w-full backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-[#262626] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00f2ff]" />
              <h4 className="text-xs font-bold text-[#ededed]">Stage 1: Reference Image</h4>
            </div>
            <button
              onClick={() => setShowReferenceOverlay(false)}
              className="text-[#888888] hover:text-[#ededed] text-xs font-mono"
            >
              ✕
            </button>
          </div>

          <div className="aspect-square rounded-xl overflow-hidden bg-black/80 border border-[#262626] mb-3 flex items-center justify-center p-2">
            <img
              src={imageInfo.dataUrl}
              alt={imageInfo.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-[11px] font-mono text-[#888888] space-y-1">
            <div className="flex justify-between">
              <span>File:</span>
              <span className="text-[#ededed] truncate max-w-[180px]">{imageInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="text-[#a1a1aa]">{imageInfo.width} × {imageInfo.height} px</span>
            </div>
            <div className="flex justify-between">
              <span>Target Object:</span>
              <span className="text-[#00f2ff]">{analysis.objectName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Material Palette Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#262626] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-[#ededed]">Select Material Override</h3>
              </div>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-[#888888] hover:text-[#ededed] font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#888888] mb-4">
              Apply realistic physical shaders across all geometry in the current scene:
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {MATERIAL_OPTIONS.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => handleApplyMaterial(mat)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold capitalize text-left flex items-center justify-between transition-all ${
                    materialOverride === mat
                      ? 'bg-[#00f2ff]/15 border-[#00f2ff] text-[#00f2ff]'
                      : 'bg-[#171717] border-[#262626] text-[#ededed] hover:border-[#383838] hover:bg-[#1f1f1f]'
                  }`}
                >
                  <span>{mat}</span>
                  {materialOverride === mat && <Check className="w-4 h-4 text-[#00f2ff]" />}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => {
                  setMaterialOverride(null);
                  setShowMaterialModal(false);
                }}
                className="text-xs font-mono text-[#888888] hover:text-[#ededed]"
              >
                Reset to Original Materials
              </button>
              <button
                type="button"
                onClick={() => setShowMaterialModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#262626] text-[#ededed] text-xs font-medium border border-[#262626]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export 3D Model Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        scene={currentScene}
        objectName={analysis.objectName}
        category={analysis.category}
        materialOverride={materialOverride}
      />
    </div>
  );
}
