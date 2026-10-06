import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Check, 
  Box, 
  Layers, 
  Printer, 
  FileCode, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  HardDrive
} from 'lucide-react';
import { SceneDescription, MaterialType } from '../types';
import { 
  modelExportService, 
  EXPORT_FORMATS, 
  ExportFormat, 
  sanitizeFilename 
} from '../services/modelExportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: SceneDescription;
  objectName: string;
  category: string;
  materialOverride?: MaterialType | null;
}

export function ExportModal({
  isOpen,
  onClose,
  scene,
  objectName,
  category,
  materialOverride,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('glb');
  const [customFilename, setCustomFilename] = useState(() => 
    `${sanitizeFilename(objectName)}_shapex_3d`
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<{
    format: ExportFormat;
    filename: string;
    sizeKb: string;
  } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'glb':
        return <Box className="w-5 h-5 text-[#00f2ff]" />;
      case 'obj':
        return <Layers className="w-5 h-5 text-purple-400" />;
      case 'stl':
        return <Printer className="w-5 h-5 text-emerald-400" />;
      case 'json':
        return <FileCode className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleDownload = async (formatToDownload?: ExportFormat) => {
    const targetFormat = formatToDownload || selectedFormat;
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(null);

    try {
      const result = await modelExportService.exportByFormat(
        targetFormat,
        scene,
        customFilename.trim() || sanitizeFilename(objectName),
        materialOverride
      );

      const sizeKb = (result.sizeBytes / 1024).toFixed(1);
      setExportSuccess({
        format: targetFormat,
        filename: result.filename,
        sizeKb: `${sizeKb} KB`,
      });
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportError(err?.message || 'Failed to generate 3D model export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose();
      }}
    >
      <div 
        className="bg-[#121212] border border-[#262626] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0d0d0d] border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.15)]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#ededed] tracking-wide">
                  Export 3D Model
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-[#333333] text-[#888888]">
                  {scene.objects.length} Meshes
                </span>
              </div>
              <p className="text-xs font-mono text-[#888888]">
                {objectName} • {category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#1a1a1a] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Successfully generated and downloaded{' '}
                  <strong className="text-white font-mono">{exportSuccess.filename}</strong>{' '}
                  ({exportSuccess.sizeKb})
                </span>
              </div>
              <button
                onClick={() => setExportSuccess(null)}
                className="text-emerald-400 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error Banner */}
          {exportError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {/* Format Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-mono font-medium text-[#ededed] flex items-center gap-1.5">
                <span>Select 3D Format</span>
              </label>
              <span className="text-[11px] font-mono text-[#888888]">
                Standard .OBJ, .GLB &amp; .STL supported
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#151515] border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.12)] ring-1 ring-[#00f2ff]'
                        : 'bg-[#141414] border-[#262626] hover:border-[#383838] hover:bg-[#181818]'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Icon + Extension + Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[#0a0a0a] border border-[#222222]">
                            {getFormatIcon(fmt.id)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#ededed] font-mono">
                              {fmt.extension.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-[#888888] block font-mono">
                              {fmt.name}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${fmt.badgeColor}`}>
                          {fmt.badge}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-[#999999] leading-relaxed mb-2.5">
                        {fmt.description}
                      </p>
                    </div>

                    {/* Footer Info & Quick Download Trigger */}
                    <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[10px] font-mono text-[#777777]">
                      <span className="truncate max-w-[170px]" title={fmt.recommendedUse}>
                        {fmt.recommendedUse}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFormat(fmt.id);
                          handleDownload(fmt.id);
                        }}
                        disabled={isExporting}
                        className="px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] border border-[#333333] hover:text-[#00f2ff] transition-colors"
                        title={`Export directly as ${fmt.extension}`}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Settings & Filename */}
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono text-[#ededed] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#00f2ff]" />
                <span>Filename Output:</span>
              </label>
              <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="model_filename"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-xs font-mono text-[#ededed] focus:outline-none focus:border-[#00f2ff]"
                />
                <span className="text-xs font-mono text-[#00f2ff] font-semibold shrink-0">
                  .{selectedFormat}
                </span>
              </div>
            </div>

            {/* Model Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1f1f1f] text-[11px] font-mono text-[#888888]">
              <div>
                <span className="block text-[#555555]">Meshes</span>
                <span className="text-[#ededed] font-medium">{scene.objects.length} primitives</span>
              </div>
              <div>
                <span className="block text-[#555555]">Detail Quality</span>
                <span className="text-[#ededed] capitalize font-medium">{scene.quality}</span>
              </div>
              <div>
                <span className="block text-[#555555]">Active Material</span>
                <span className="text-[#ededed] capitalize font-medium">
                  {materialOverride || 'Scene Default'}
                </span>
              </div>
              <div>
                <span className="block text-[#555555]">Selected Format</span>
                <span className="text-[#00f2ff] font-bold">.{selectedFormat.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0d0d0d] border-t border-[#262626] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
            <Info className="w-3.5 h-3.5 text-[#00f2ff]" />
            <span>Ready for 3D printing, CAD, and interactive engines.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-[#171717] hover:bg-[#222222] text-[#888888] hover:text-[#ededed] border border-[#262626] text-xs font-mono transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleDownload()}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-[#00f2ff] hover:bg-[#33f5ff] text-black font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,255,0.25)] transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing .{selectedFormat.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .{selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
