import React, { useState } from 'react';
import { AIEngine, AspectRatio, GenerationRequestParams, MediaType } from '../types';
import { ASPECT_RATIOS, PROMPT_PRESETS } from '../constants/engines';
import { 
  Sparkles, 
  Send, 
  Settings2, 
  Sliders, 
  Film, 
  Image as ImageIcon, 
  Clock, 
  RefreshCw,
  Lightbulb,
  Check
} from 'lucide-react';
import { enhancePrompt } from '../services/generationService';

interface PromptComposerProps {
  currentEngine: AIEngine;
  onGenerate: (params: GenerationRequestParams) => Promise<void>;
  isGenerating: boolean;
  generationProgressText: string;
  userApiKey?: string;
}

export const PromptComposer: React.FC<PromptComposerProps> = ({
  currentEngine,
  onGenerate,
  isGenerating,
  generationProgressText,
  userApiKey,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [showNegative, setShowNegative] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<string>('2k');
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [creativity, setCreativity] = useState<number>(50); // For Magnific
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedSuccess, setEnhancedSuccess] = useState<boolean>(false);

  const isVideo = currentEngine.type === 'video';
  const isMagnificUpscaler = currentEngine.id === 'magnific-upscale';

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setEnhancedSuccess(false);
    try {
      const improved = await enhancePrompt(prompt, currentEngine.id, currentEngine.type);
      setPrompt(improved);
      setEnhancedSuccess(true);
      setTimeout(() => setEnhancedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to enhance prompt', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    onGenerate({
      type: currentEngine.type,
      engine: currentEngine.id,
      prompt: prompt.trim(),
      negativePrompt: showNegative ? negativePrompt.trim() : undefined,
      aspectRatio,
      resolution,
      durationSeconds: isVideo ? durationSeconds : undefined,
      creativity: isMagnificUpscaler ? creativity : undefined,
      apiKey: userApiKey,
    });
  };

  return (
    <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl backdrop-blur-md">
      
      {/* Current Active Engine Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isVideo ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {isVideo ? <Film className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Syne',sans-serif] font-bold text-white text-base">
                {currentEngine.name}
              </span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                {currentEngine.provider}
              </span>
              <span className="rounded bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 text-[10px] font-medium text-orange-400">
                {currentEngine.quality}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{currentEngine.description}</p>
          </div>
        </div>

        {/* Prompt presets trigger */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-amber-400" />
            Inspiración:
          </span>
          {PROMPT_PRESETS.filter(p => p.type === currentEngine.type).slice(0, 2).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.prompt)}
              className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Main Prompt Input Area */}
        <div className="relative">
          <textarea
            id="input-prompt-composer"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              isVideo
                ? `Describe la toma de video para ${currentEngine.name} (ej. "Tomas cinematográficas con dron sobre la costa a 60fps con luz dorada")...`
                : `Escribe tu idea visual para ${currentEngine.name} (ej. "Retrato fotorrealista 8k, luz de atardecer, lente Hasselblad 85mm")...`
            }
            className="w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-sans leading-relaxed"
          />

          {/* Enhance with Gemini button */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              id="btn-enhance-prompt-gemini"
              type="button"
              onClick={handleEnhance}
              disabled={!prompt.trim() || isEnhancing}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
                enhancedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/70'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Optimiza tu prompt con IA Gemini específicamente para este motor"
            >
              {isEnhancing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-orange-400" />
                  <span>Mejorando...</span>
                </>
              ) : enhancedSuccess ? (
                <>
                  <Check className="h-3 w-3 text-emerald-200" />
                  <span>¡Prompt Optimizado!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Mejorar con Gemini IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Negative prompt collapse */}
        <div>
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Sliders className="h-3 w-3" />
            <span>{showNegative ? 'Ocultar Prompt Negativo' : '+ Agregar Prompt Negativo (elementos a evitar)'}</span>
          </button>
          {showNegative && (
            <input
              id="input-negative-prompt"
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Ej. blur, low quality, artifacts, distorted hands, noisy, watermark..."
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/90 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none"
            />
          )}
        </div>

        {/* Controls Grid: Aspect Ratio, Resolution, Duration, Creativity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-zinc-800/60">
          
          {/* Aspect Ratio */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Relación de Aspecto
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_RATIOS.slice(0, 4).map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id as AspectRatio)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                    aspectRatio === ar.id
                      ? 'border-orange-500 bg-orange-500/15 text-orange-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className={ar.iconClass} />
                  <span>{ar.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Resolución de Salida
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/90 px-3 py-1.5 text-xs text-zinc-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="1k">1K Estándar (1024x1024)</option>
              <option value="2k">2K QHD Alta Definición</option>
              <option value="4k">4K Ultra HD Master</option>
              {isMagnificUpscaler && <option value="8k">8K Extreme Remaster</option>}
            </select>
          </div>

          {/* Video Duration (if video engine) */}
          {isVideo ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duración del Clip
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDurationSeconds(5)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                    durationSeconds === 5
                      ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  5 Segundos
                </button>
                <button
                  type="button"
                  onClick={() => setDurationSeconds(10)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                    durationSeconds === 10
                      ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-semibold'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  10 Segundos
                </button>
              </div>
            </div>
          ) : isMagnificUpscaler ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400 flex items-center justify-between">
                <span>Alucinación / Creatividad: {creativity}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={creativity}
                onChange={(e) => setCreativity(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Calidad de Render
              </label>
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-300">
                {currentEngine.quality}
              </div>
            </div>
          )}

          {/* Generate Button Action */}
          <div className="flex items-end">
            <button
              id="btn-generate-media"
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-bold shadow-lg transition-all ${
                isVideo
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:from-rose-600 hover:to-orange-600 shadow-rose-500/20'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-zinc-950 hover:opacity-95 shadow-orange-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-current" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Generar {isVideo ? 'Video' : 'Imagen'}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Live Generation Progress Overlay */}
        {isGenerating && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-950/30 p-3.5 text-center animate-pulse">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-orange-300">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-400" />
              <span>{generationProgressText || 'Enviando trabajo a clúster de Freepik / Magnific...'}</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Guardando automáticamente el registro en la base de datos de Firebase.
            </p>
          </div>
        )}

      </form>
    </div>
  );
};
