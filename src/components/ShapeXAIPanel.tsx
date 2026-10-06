import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  RotateCw, 
  RefreshCw, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Bot, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Wand2,
  Terminal
} from 'lucide-react';
import { SceneDescription, ChatMessage } from '../types';

interface ShapeXAIPanelProps {
  currentScene: SceneDescription;
  onUpdateScene: (newScene: SceneDescription) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onRegenerate: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const QUICK_COMMANDS = [
  'Make it red.',
  'Make the material metallic.',
  'Make it bigger.',
  'Add another leg.',
  'Remove the backrest.',
  'Make the chair futuristic.',
  'Add neon lights.',
  'Change the background.',
  'Make the object more detailed.',
];

export function ShapeXAIPanel({
  currentScene,
  onUpdateScene,
  onUndo,
  onRedo,
  onReset,
  onRegenerate,
  canUndo,
  canRedo,
  isOpen = true,
  onToggleOpen,
}: ShapeXAIPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `ShapeX AI is ready with scene context: "${currentScene.title}" (${currentScene.objects.length} parts). Tell me how you'd like to customize this 3D model!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Handle Command Submission
  const handleSendCommand = async (commandText?: string) => {
    const text = (commandText || inputCommand).trim();
    if (!text || isProcessing) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputCommand('');
    setIsProcessing(true);
    setFeedbackToast(null);

    try {
      const response = await fetch('/api/gemini/edit-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: text,
          currentScene,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.scene) {
        throw new Error(data.error || "ShapeX couldn't understand that change. Try describing the change differently.");
      }

      // Validate scene JSON structure safely
      const updatedScene = data.scene;
      if (!updatedScene.objects || !Array.isArray(updatedScene.objects) || updatedScene.objects.length === 0) {
        throw new Error("ShapeX couldn't understand that change. Try describing the change differently.");
      }

      // Apply the updated scene
      onUpdateScene(updatedScene);

      // Add AI response message
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.summary || `Updated 3D scene according to "${text}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'applied',
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Show toast: "Changes applied."
      setFeedbackToast({ text: 'Changes applied.', type: 'success' });
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err: any) {
      console.error('AI Edit error:', err);
      const errorText = "ShapeX couldn't understand that change. Try describing the change differently.";

      const aiErrorMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'failed',
      };
      setMessages((prev) => [...prev, aiErrorMsg]);

      setFeedbackToast({
        text: errorText,
        type: 'error',
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <aside 
      className={`relative flex flex-col h-full bg-[#0a0a0a] border-l border-[#262626] transition-all duration-300 ${
        isOpen ? 'w-full lg:w-96' : 'w-0 lg:w-12 overflow-hidden'
      }`}
    >
      {/* Collapsed view toggle button */}
      {!isOpen && (
        <div className="hidden lg:flex flex-col items-center py-6 h-full justify-between">
          <button
            onClick={onToggleOpen}
            title="Expand ShapeX AI Panel"
            className="p-2 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] text-[#00f2ff] border border-[#262626] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="rotate-90 text-xs font-mono font-bold tracking-widest text-[#71717a] uppercase whitespace-nowrap">
            SHAPEX AI // NATURAL 3D
          </div>
          <div className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse" />
        </div>
      )}

      {isOpen && (
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="p-4 border-b border-[#262626] bg-[#0f0f0f] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] shadow-lg shadow-[#00f2ff]/10">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#ededed] flex items-center gap-2">
                  ShapeX AI
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]">
                    Live 3D
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-[#888888]">Natural Language 3D Editor</p>
              </div>
            </div>

            {onToggleOpen && (
              <button
                onClick={onToggleOpen}
                title="Collapse Panel"
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#141414] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* History Controls Bar: Undo, Redo, Regenerate, Reset */}
          <div className="px-4 py-2 bg-[#0c0c0c] border-b border-[#262626] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo last change"
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#141414] disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo change"
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#141414] disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Redo</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onRegenerate}
                title="Regenerate model approximation"
                className="p-1.5 rounded-lg text-[#00f2ff] hover:text-[#00f2ff] hover:bg-[#00f2ff]/10 border border-[#00f2ff]/30 transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={onReset}
                title="Reset to initial 3D model"
                className="p-1.5 rounded-lg text-[#888888] hover:text-red-400 hover:bg-[#241014] transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Real-time Feedback Toast */}
          {feedbackToast && (
            <div 
              className={`px-4 py-2.5 text-xs font-mono flex items-center gap-2 border-b transition-all ${
                feedbackToast.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/80 border-red-500/40 text-red-300'
              }`}
            >
              {feedbackToast.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span className="flex-1">{feedbackToast.text}</span>
            </div>
          )}

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'user' && (
                  <div className="w-6 h-6 rounded-md bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#00f2ff] text-black font-medium rounded-br-none'
                      : msg.status === 'failed'
                      ? 'bg-[#241014] border border-red-900/60 text-red-200 rounded-bl-none'
                      : 'bg-[#141414] border border-[#262626] text-[#ededed] rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-white/10 text-[10px] font-mono text-[#71717a]">
                    <span>{msg.timestamp}</span>
                    {msg.status === 'applied' && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Changes applied
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-[#00f2ff]/20 border border-[#00f2ff]/40 flex items-center justify-center text-[#00f2ff] shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-2.5 items-center text-[#00f2ff] text-xs font-mono">
                <div className="w-6 h-6 rounded-md bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 border-2 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
                </div>
                <span>ShapeX AI is updating 3D scene...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-3 border-t border-[#262626] bg-[#0c0c0c]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#888888] mb-2">
              <Wand2 className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>Suggested 3D Prompts:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleSendCommand(cmd)}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#1e1e1e] text-[#a1a1aa] hover:text-[#00f2ff] border border-[#262626] text-[11px] font-mono transition-colors disabled:opacity-50 text-left truncate max-w-full"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Command Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCommand();
            }}
            className="p-3 bg-[#0f0f0f] border-t border-[#262626] flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                placeholder='e.g. "Make the material metallic" or "Make it red"'
                disabled={isProcessing}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-[#ededed] placeholder:text-[#555555] focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] font-sans disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={!inputCommand.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-[#00f2ff] hover:bg-[#33f5ff] text-black font-medium shadow-md shadow-[#00f2ff]/20 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
