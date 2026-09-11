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
  ExternalLink,
  Layers
} from 'lucide-react';
import { AI_ENGINES } from '../constants/engines';

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
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = generations.filter((item) => {
    if (filterType === 'favorites' && !item.isFavorite) return false;
    if (filterType === 'image' && item.type !== 'image') return false;
    if (filterType === 'video' && item.type !== 'video') return false;
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
    const found = AI_ENGINES.find((e) => e.id === engineId);
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

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          
          {/* Search bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              id="input-gallery-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar prompt o motor..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 pl-8 text-xs text-zinc-200 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                filterType === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                filterType === 'image'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Imágenes
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                filterType === 'video'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setFilterType('favorites')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="mt-3 text-xs">Cargando base de datos de Firebase...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 mb-3">
            <Sparkles className="h-6 w-6 text-orange-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {searchQuery ? 'No se encontraron resultados' : 'Aún no hay generaciones'}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
            {searchQuery
              ? 'Prueba con otro término de búsqueda o cambia los filtros de contenido.'
              : 'Elige un motor de IA (Mystic, Flux, Kling, Minimax, etc.), escribe un prompt y haz clic en Generar para ver la magia guardada en Firebase.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const isVideo = item.type === 'video';
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
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mb-2" />
                      <span className="text-[11px] font-medium text-orange-400">Procesando...</span>
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
                        <Film className="h-3 w-3 text-rose-400" />
                        <span>{item.durationSeconds || 5}s</span>
                      </div>
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
                    <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 backdrop-blur-xs border border-white/10">
                      {item.aspectRatio}
                    </span>
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
                        onClick={(e) => handleDownload(e, item.outputUrl!, `${item.engine}-${item.id}.${isVideo ? 'mp4' : 'jpg'}`)}
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
                      className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                    >
                      Reutilizar prompt
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
