import React from 'react';
import { Sparkles, Check, Info } from 'lucide-react';
import { MagnificEngine } from '../types/magnific';

interface MagnificEngineSelectorProps {
  engines: MagnificEngine[];
  selectedEngineId: string;
  onSelectEngine: (engine: MagnificEngine) => void;
}

export const MagnificEngineSelector: React.FC<MagnificEngineSelectorProps> = ({
  engines,
  selectedEngineId,
  onSelectEngine,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
        <span>Selecciona el Motor de IA</span>
        <span className="text-[11px] text-slate-500">{engines.length} motores disponibles en esta categoría</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {engines.map((engine) => {
          const isSelected = selectedEngineId === engine.id;
          return (
            <button
              key={engine.id}
              type="button"
              onClick={() => onSelectEngine(engine)}
              className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 w-full mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white group-hover:text-slate-100'}`}>
                    {engine.name}
                  </span>
                  {engine.isFlagship && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950">
                      Top
                    </span>
                  )}
                </div>
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">
                    {engine.provider}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                {engine.description}
              </p>

              {/* Feature Tags & Badge */}
              <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-800/60 text-[10px]">
                <span className="text-amber-400/90 font-medium truncate max-w-[140px]">
                  {engine.badge}
                </span>
                <span className="text-slate-500 font-mono">
                  {engine.speed || 'High Res'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
