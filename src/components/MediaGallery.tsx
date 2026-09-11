import React, { useState } from 'react';
import { GenerationItem, MediaType } from '../types';
import { 
  Heart, 
  Download, 
  Trash2, 
  Maximize2, 
  Film, 
  Image as ImageIcon, 
  Search, 
  Sparkles, 
  Music,
  Coins,
  Volume2
} from 'lucide-react';
import { ALL_MAGNIFIC_ENGINES, getEngineById } from '../constants/magnificEngines';

interface MediaGalleryProps {
  generations: GenerationItem[];
  isLoading: boolean;
  onToggleFavorite: (id: string, current: boolean) => Promise<void>;
  onDeleteGeneration: (id: string) => Promise<void>;
  onSelectMedia: (item: GenerationItem) => void;
  onReusePrompt: (prompt: string, engine: string) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  generations,
  isLoading,
  onToggleFavorite,
  onDeleteGeneration,
  onSelectMedia,
  onReusePrompt,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'images' | 'video' | 'editing' | 'audio' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = generations.filter((item) => {
    if (filterType === 'favorites' && !item.isFavorite) return false;
    const cat = item.category || (item.type === 'video' ? 'video' : 'images');
    if (filterType !== 'all' && filterType !== 'favorites' && cat !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.prompt.toLowerCase().includes(q) ||
        item.engine.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getEngineName = (engineId: string) => {
    const found = getEngineById(engineId);
    return found ? found.name : engineId;
  };

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      
      {/* Gallery Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="font-['Syne',sans-serif] text-lg font-bold text-white flex items-center gap-2">
            <span>Historial en Firebase</span>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-sans">
              {generations.length} {generations.length === 1 ? 'elemento' : 'elementos'}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Tus generaciones se sincronizan en tiempo real con Firestore
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          
          {/* Search bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              id="input-gallery-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar prompt o motor..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 pl-8 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                filterType === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('images')}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                filterType === 'images'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Imágenes
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                filterType === 'video'
                  ? 'bg-violet-500/20 text-violet-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setFilterType('editing')}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                filterType === 'editing'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Edición
            </button>
            <button
              onClick={() => setFilterType('audio')}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                filterType === 'audio'
                  ? 'bg-pink-500/20 text-pink-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Audio
            </button>
            <button
              onClick={() => setFilterType('favorites')}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                filterType === 'favorites'
                  ? 'bg-red-500/20 text-red-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Favoritos
            </button>
          </div>

        </div>
      </div>

      {/* Grid of Generations */}
      {isLoading && generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="mt-3 text-xs">Cargando base de datos de Firebase...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 mb-3">
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {searchQuery ? 'No se encontraron resultados' : 'Aún no hay generaciones en esta categoría'}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
            {searchQuery
              ? 'Prueba con otro término de búsqueda o cambia los filtros de contenido.'
              : 'Elige un motor de IA de Magnific (Mystic, Kling, MiniMax, Upscaler, ElevenLabs), escribe un prompt y haz clic en Generar para guardar en Firebase.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const cat = item.category || (item.type === 'video' ? 'video' : 'images');
            const isVideo = cat === 'video';
            const isAudio = cat === 'audio';
            const engineLabel = getEngineName(item.engine);

            return (
              <div
                key={item.id}
                id={`card-gen-${item.id}`}
                onClick={() => onSelectMedia(item)}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40 cursor-pointer"
              >
                {/* Media Preview Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
                  {item.status === 'processing' ? (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-2" />
                      <span className="text-[11px] font-medium text-amber-400">Procesando en Magnific...</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{engineLabel}</span>
                    </div>
                  ) : isVideo && item.outputUrl ? (
                    <div className="relative h-full w-full">
                      <video
                        src={item.outputUrl}
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                        <Film className="h-3 w-3 text-violet-400" />
                        <span>{item.durationSeconds || 5}s</span>
                      </div>
                    </div>
                  ) : isAudio && item.outputUrl ? (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-950/30 to-zinc-950 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 shadow-lg group-hover:scale-110 transition-transform">
                        <Volume2 className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-full">Audio Generado</span>
                      <span className="text-[10px] text-pink-300 mt-0.5 font-mono">ElevenLabs Engine</span>
                      <audio src={item.outputUrl} controls className="w-full mt-3 h-8 opacity-80" onClick={(e) => e.stopPropagation()} />
                    </div>
                  ) : item.outputUrl ? (
                    <img
                      src={item.outputUrl}
                      alt={item.prompt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600 text-xs">
                      Sin vista previa
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur-xs border border-white/10">
                      {engineLabel}
                    </span>
                    {item.estimatedCredits && (
                      <span className="rounded bg-amber-500/80 text-zinc-950 font-bold px-1.5 py-0.5 text-[10px] backdrop-blur-xs flex items-center gap-0.5">
                        <Coins className="w-2.5 h-2.5" />
                        {item.estimatedCredits}c
                      </span>
                    )}
                  </div>

                  {/* Floating Action Icons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id, item.isFavorite);
                      }}
                      title={item.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      className={`rounded-full p-1.5 backdrop-blur-md transition-colors ${
                        item.isFavorite
                          ? 'bg-red-500/80 text-white'
                          : 'bg-black/60 text-zinc-300 hover:bg-black/90 hover:text-white'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    {item.outputUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, item.outputUrl!, `${item.engine}-${item.id}.${isVideo ? 'mp4' : isAudio ? 'mp3' : 'jpg'}`)}
                        title="Descargar archivo"
                        className="rounded-full bg-black/60 p-1.5 text-zinc-300 hover:bg-black/90 hover:text-white backdrop-blur-md transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGeneration(item.id);
                      }}
                      title="Eliminar de Firebase"
                      className="rounded-full bg-black/60 p-1.5 text-zinc-300 hover:bg-red-950 hover:text-red-400 backdrop-blur-md transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

                {/* Card Info Details */}
                <div className="flex flex-1 flex-col justify-between p-3">
                  <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed" title={item.prompt}>
                    {item.prompt}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReusePrompt(item.prompt, item.engine);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                    >
                      Reutilizar
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

