import React from 'react';
import { Image, Video, Sparkles, Music } from 'lucide-react';
import { MagnificCategory } from '../types/magnific';
import { ENGINES_BY_CATEGORY } from '../constants/magnificEngines';

interface CategoryNavProps {
  selectedCategory: MagnificCategory;
  onSelectCategory: (category: MagnificCategory) => void;
  counts?: Partial<Record<MagnificCategory, number>>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  counts
}) => {
  const categories: {
    id: MagnificCategory;
    label: string;
    icon: React.ReactNode;
    desc: string;
    color: string;
  }[] = [
    {
      id: 'images',
      label: 'Generación de Imágenes',
      icon: <Image className="w-4 h-4" />,
      desc: 'Mystic, Flux 1.1 Pro, Recraft v3, Imagen 3, Seedream',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/40'
    },
    {
      id: 'video',
      label: 'Generación de Video',
      icon: <Video className="w-4 h-4" />,
      desc: 'Kling 1.5, MiniMax Hailuo, Runway Gen-3, Luma, CogVideoX',
      color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/40'
    },
    {
      id: 'editing',
      label: 'Edición y Upscaling',
      icon: <Sparkles className="w-4 h-4" />,
      desc: 'Magnific Upscaler 2.0, Relight, Restyle, Inpainting',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40'
    },
    {
      id: 'audio',
      label: 'Generación de Audio',
      icon: <Music className="w-4 h-4" />,
      desc: 'ElevenLabs Music, Voice Design, Efectos de Sonido',
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/40'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`group relative flex flex-col items-start text-left p-3.5 rounded-xl transition-all duration-200 ${
              isSelected
                ? 'bg-slate-800/90 shadow-lg border border-slate-700/80 ring-1 ring-white/10'
                : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className={`p-2 rounded-lg transition-colors ${
                isSelected ? 'bg-slate-700 text-white shadow-inner' : 'bg-slate-800/70 text-slate-400 group-hover:text-white'
              }`}>
                {cat.icon}
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                isSelected ? 'bg-slate-900/90 text-amber-300 border-amber-500/30' : 'bg-slate-900/40 text-slate-500 border-slate-800'
              }`}>
                {counts?.[cat.id] ?? ENGINES_BY_CATEGORY[cat.id]?.length ?? 0} motores
              </span>
            </div>
            <div className={`text-xs font-bold tracking-tight truncate w-full ${isSelected ? 'text-white' : 'text-slate-300'}`}>
              {cat.label}
            </div>
            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
              {cat.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
};
