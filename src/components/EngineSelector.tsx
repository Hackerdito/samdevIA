import React, { useState } from 'react';
import { AIEngine, EngineId, MediaType } from '../types';
import { AI_ENGINES } from '../constants/engines';
import { Video, Image, Sparkles, Zap, Film, Cpu, Layers } from 'lucide-react';

interface EngineSelectorProps {
  selectedEngineId: EngineId;
  onSelectEngine: (engine: AIEngine) => void;
  mediaTypeFilter: 'all' | 'image' | 'video';
  onSetMediaTypeFilter: (filter: 'all' | 'image' | 'video') => void;
}

export const EngineSelector: React.FC<EngineSelectorProps> = ({
  selectedEngineId,
  onSelectEngine,
  mediaTypeFilter,
  onSetMediaTypeFilter,
}) => {
  const [providerFilter, setProviderFilter] = useState<string>('all');

  const filteredEngines = AI_ENGINES.filter((eng) => {
    if (mediaTypeFilter !== 'all' && eng.type !== mediaTypeFilter) {
      return false;
    }
    if (providerFilter !== 'all' && eng.provider !== providerFilter) {
      return false;
    }
    return true;
  });

  const providers = ['all', 'Freepik', 'Magnific', 'Black Forest Labs', 'Kuaishou', 'MiniMax', 'Google', 'Runway', 'Luma'];

  return (
    <div className="space-y-4">
      
      {/* Category Tabs: Image / Video / All */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
          <button
            id="tab-engine-all"
            onClick={() => onSetMediaTypeFilter('all')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              mediaTypeFilter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Todos ({AI_ENGINES.length})</span>
          </button>
          
          <button
            id="tab-engine-images"
            onClick={() => onSetMediaTypeFilter('image')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              mediaTypeFilter === 'image'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Image className="h-3.5 w-3.5 text-amber-400" />
            <span>Imágenes ({AI_ENGINES.filter(e => e.type === 'image').length})</span>
          </button>

          <button
            id="tab-engine-videos"
            onClick={() => onSetMediaTypeFilter('video')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              mediaTypeFilter === 'video'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="h-3.5 w-3.5 text-rose-400" />
            <span>Videos ({AI_ENGINES.filter(e => e.type === 'video').length})</span>
          </button>
        </div>

        {/* Quick provider filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-400 text-[11px] pr-1">Proveedor:</span>
          {providers.slice(0, 5).map((prov) => (
            <button
              key={prov}
              onClick={() => setProviderFilter(prov)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                providerFilter === prov
                  ? 'bg-zinc-700 text-white font-semibold'
                  : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              {prov === 'all' ? 'Cualquiera' : prov}
            </button>
          ))}
        </div>
      </div>

      {/* Engines Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredEngines.map((engine) => {
          const isSelected = engine.id === selectedEngineId;
          const isVideo = engine.type === 'video';

          return (
            <div
              key={engine.id}
              id={`engine-card-${engine.id}`}
              onClick={() => onSelectEngine(engine)}
              className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all text-left ${
                isSelected
                  ? 'border-orange-500 bg-orange-950/20 shadow-md shadow-orange-500/10 ring-1 ring-orange-500'
                  : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {/* Card Header with Provider & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                      isVideo
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {isVideo ? <Film className="h-3.5 w-3.5" /> : <Image className="h-3.5 w-3.5" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white flex items-center gap-1.5">
                      {engine.name}
                      {engine.isFlagship && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" title="Flagship" />
                      )}
                    </h3>
                    <p className="text-[10px] font-medium text-zinc-400">{engine.provider}</p>
                  </div>
                </div>

                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                    isVideo
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                  }`}
                >
                  {engine.type}
                </span>
              </div>

              {/* Description */}
              <p className="mt-2 text-xs leading-relaxed text-zinc-300 line-clamp-2">
                {engine.description}
              </p>

              {/* Engine Specs */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-zinc-400" />
                  <span>{engine.speed}</span>
                </div>
                <div className="font-medium text-zinc-300 truncate max-w-[120px]">
                  {engine.maxResolution}
                </div>
              </div>

              {/* Selected indicator check */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-orange-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
