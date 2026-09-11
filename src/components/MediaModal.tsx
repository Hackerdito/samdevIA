import React, { useState } from 'react';
import { GenerationItem } from '../types';
import { getEngineById } from '../constants/magnificEngines';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Heart, 
  Trash2, 
  Film, 
  Image as ImageIcon, 
  Calendar, 
  Sparkles,
  Database,
  Coins,
  Volume2
} from 'lucide-react';

interface MediaModalProps {
  item: GenerationItem | null;
  onClose: () => void;
  onToggleFavorite: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  item,
  onClose,
  onToggleFavorite,
  onDelete,
}) => {
  if (!item) return null;

  const [copied, setCopied] = useState<boolean>(false);
  const cat = item.category || (item.type === 'video' ? 'video' : 'images');
  const isVideo = cat === 'video';
  const isAudio = cat === 'audio';
  const engineObj = getEngineById(item.engine);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!item.outputUrl) return;
    const ext = isVideo ? 'mp4' : isAudio ? 'mp3' : 'jpg';
    const a = document.createElement('a');
    a.href = item.outputUrl;
    a.download = `magnific-${item.engine}-${item.id}.${ext}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div 
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col lg:flex-row overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 rounded-full bg-black/60 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Media Preview Column */}
        <div className="relative flex flex-1 items-center justify-center bg-zinc-950 p-4 min-h-[300px] lg:min-h-[500px]">
          {isVideo && item.outputUrl ? (
            <video
              src={item.outputUrl}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-[75vh] w-full rounded-lg object-contain shadow-md"
            />
          ) : isAudio && item.outputUrl ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md w-full">
              <div className="w-24 h-24 rounded-3xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-6 shadow-2xl shadow-pink-500/20">
                <Volume2 className="w-12 h-12" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Pista de Audio Generada</h4>
              <p className="text-xs text-zinc-400 mb-6 font-mono">Motor: {engineObj?.name || 'ElevenLabs'}</p>
              <audio src={item.outputUrl} controls autoPlay className="w-full" />
            </div>
          ) : item.outputUrl ? (
            <img
              src={item.outputUrl}
              alt={item.prompt}
              className="max-h-[75vh] w-full rounded-lg object-contain shadow-md"
            />
          ) : (
            <div className="text-zinc-500 text-sm">No hay archivo disponible</div>
          )}
        </div>

        {/* Metadata Details Column */}
        <div className="flex w-full flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/60 p-6 lg:w-96 overflow-y-auto max-h-[85vh]">
          
          <div className="space-y-4">
            
            {/* Engine & Type Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isVideo ? 'bg-violet-500/20 text-violet-400' : isAudio ? 'bg-pink-500/20 text-pink-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isVideo ? <Film className="h-4 w-4" /> : isAudio ? <Volume2 className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                </span>
                <div>
                  <h3 className="font-['Syne',sans-serif] font-bold text-white text-base">
                    {engineObj?.name || item.engine}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {engineObj?.badge || 'Magnific AI Studio'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleFavorite(item.id, item.isFavorite)}
                className={`rounded-full p-2 transition-colors ${
                  item.isFavorite
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Favorito"
              >
                <Heart className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-300">Prompt Creativo</span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs leading-relaxed text-zinc-200">
                {item.prompt}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 text-xs">
              {item.estimatedCredits && (
                <div className="flex justify-between items-center text-amber-300 font-bold bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <span className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    Créditos Consumidos:
                  </span>
                  <span>{item.estimatedCredits} créditos</span>
                </div>
              )}
              {item.aspectRatio && (
                <div className="flex justify-between text-zinc-400">
                  <span>Relación de Aspecto:</span>
                  <span className="font-semibold text-zinc-200">{item.aspectRatio}</span>
                </div>
              )}
              {item.resolution && (
                <div className="flex justify-between text-zinc-400">
                  <span>Resolución:</span>
                  <span className="font-semibold text-zinc-200">{item.resolution.toUpperCase()}</span>
                </div>
              )}
              {isVideo && item.durationSeconds && (
                <div className="flex justify-between text-zinc-400">
                  <span>Duración de Video:</span>
                  <span className="font-semibold text-zinc-200">{item.durationSeconds}s</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800/50">
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3 text-emerald-400" />
                  Almacenamiento:
                </span>
                <span className="font-medium text-emerald-400">Firebase Firestore</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-zinc-500" />
                  Fecha:
                </span>
                <span className="text-zinc-400">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-zinc-800">
            {item.outputUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 px-4 text-xs font-bold text-zinc-950 shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity"
              >
                <Download className="h-4 w-4" />
                <span>Descargar {isVideo ? 'Video MP4' : isAudio ? 'Audio MP3' : 'Imagen HD'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                await onDelete(item.id);
                onClose();
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Eliminar de Firebase</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

