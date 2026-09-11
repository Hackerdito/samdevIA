import React, { useRef } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Upload, 
  X, 
  Camera, 
  Layers, 
  Cpu, 
  Maximize2, 
  Clock, 
  Volume2, 
  Move3d,
  Coins
} from 'lucide-react';
import { MagnificEngine, MagnificCategory } from '../types/magnific';
import { AspectRatio } from '../types';

interface DynamicControlsProps {
  engine: MagnificEngine;
  category: MagnificCategory;
  resolution: string;
  onChangeResolution: (res: string) => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ar: AspectRatio) => void;
  durationSeconds: number;
  onChangeDurationSeconds: (dur: number) => void;
  hdr: number;
  onChangeHdr: (val: number) => void;
  adherence: number;
  onChangeAdherence: (val: number) => void;
  creativeDetailing: number;
  onChangeCreativeDetailing: (val: number) => void;
  scaleFactor: number;
  onChangeScaleFactor: (val: number) => void;
  cameraMovement: string;
  onChangeCameraMovement: (mov: string) => void;
  genre: string;
  onChangeGenre: (genre: string) => void;
  tempo: string;
  onChangeTempo: (tempo: string) => void;
  inputImageBase64?: string;
  onSetInputImage: (base64?: string) => void;
  styleReferenceBase64?: string;
  onSetStyleReference: (base64?: string) => void;
  structureReferenceBase64?: string;
  onSetStructureReference: (base64?: string) => void;
  estimatedCredits: number;
}

export const DynamicControls: React.FC<DynamicControlsProps> = ({
  engine,
  category,
  resolution,
  onChangeResolution,
  aspectRatio,
  onChangeAspectRatio,
  durationSeconds,
  onChangeDurationSeconds,
  hdr,
  onChangeHdr,
  adherence,
  onChangeAdherence,
  creativeDetailing,
  onChangeCreativeDetailing,
  scaleFactor,
  onChangeScaleFactor,
  cameraMovement,
  onChangeCameraMovement,
  genre,
  onChangeGenre,
  tempo,
  onChangeTempo,
  inputImageBase64,
  onSetInputImage,
  styleReferenceBase64,
  onSetStyleReference,
  structureReferenceBase64,
  onSetStructureReference,
  estimatedCredits
}) => {
  const inputImageRef = useRef<HTMLInputElement>(null);
  const styleRefRef = useRef<HTMLInputElement>(null);
  const structureRefRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (b64?: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const aspectRatios: { id: AspectRatio; label: string; iconClass: string }[] = [
    { id: '16:9', label: '16:9 Landscape', iconClass: 'w-5 h-3' },
    { id: '1:1', label: '1:1 Cuadrado', iconClass: 'w-4 h-4' },
    { id: '9:16', label: '9:16 Vertical / Reel', iconClass: 'w-3 h-5' },
    { id: '4:3', label: '4:3 Clásico', iconClass: 'w-4 h-3' },
    { id: '21:9', label: '21:9 CinemaScope', iconClass: 'w-6 h-2.5' },
  ];

  return (
    <div className="space-y-5 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
      {/* Engine Info & Estimated Credits Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{engine.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {engine.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1">{engine.description}</p>
          </div>
        </div>

        {/* Live Estimated Credits Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-inner">
          <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Costo Estimado: <strong>{estimatedCredits}</strong> créditos</span>
        </div>
      </div>

      {/* Dynamic Aspect Ratio (for images, video, editing) */}
      {category !== 'audio' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            Relación de Aspecto
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {aspectRatios.map((ar) => {
              const isSelected = aspectRatio === ar.id;
              return (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => onChangeAspectRatio(ar.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className={`border border-current rounded-xs mb-1.5 ${ar.iconClass}`} />
                  <span className="text-[11px] font-mono">{ar.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolution Selector (for Mystic and images/upscalers) */}
      {(engine.supportedResolutions && engine.supportedResolutions.length > 0) && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Resolución de Salida
            </span>
            <span className="text-[11px] text-slate-400">
              {resolution === '4k' ? 'Ultra HD 4K (Mayor consumo)' : resolution === '2k' ? 'Quad HD 2K (Equilibrado)' : 'Estándar 1K'}
            </span>
          </label>
          <div className="flex gap-2">
            {engine.supportedResolutions.map((res) => {
              const isSelected = resolution === res;
              return (
                <button
                  key={res}
                  type="button"
                  onClick={() => onChangeResolution(res)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  {res}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MYSTIC EXCLUSIVE CONTROLS */}
      {engine.id === 'mystic' && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            Parámetros Avanzados de Mystic
          </div>

          {/* HDR Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">HDR (Rango Dinámico):</span>
              <span className="font-mono text-amber-400 font-bold">{hdr}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={hdr}
              onChange={(e) => onChangeHdr(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Natural / Suave</span>
              <span>Intenso / Cinemático</span>
            </div>
          </div>

          {/* Adherence Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Adherence (Fidelidad al Prompt):</span>
              <span className="font-mono text-amber-400 font-bold">{adherence}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adherence}
              onChange={(e) => onChangeAdherence(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Creative Detailing Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Creative Detailing (Micro-texturas):</span>
              <span className="font-mono text-amber-400 font-bold">{creativeDetailing}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={creativeDetailing}
              onChange={(e) => onChangeCreativeDetailing(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Style and Structure References */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Style Ref */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>Referencia de Estilo</span>
                {styleReferenceBase64 && (
                  <button
                    onClick={() => onSetStyleReference(undefined)}
                    className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Quitar
                  </button>
                )}
              </div>
              {styleReferenceBase64 ? (
                <img
                  src={styleReferenceBase64}
                  alt="Style Ref"
                  className="w-full h-24 object-cover rounded-md border border-slate-700"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => styleRefRef.current?.click()}
                  className="w-full h-24 border border-dashed border-slate-700 hover:border-slate-500 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition text-xs"
                >
                  <Upload className="w-4 h-4 mb-1 text-slate-500" />
                  <span>Subir imagen de estilo</span>
                </button>
              )}
              <input
                ref={styleRefRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, onSetStyleReference)}
              />
            </div>

            {/* Structure Ref */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>Referencia de Estructura</span>
                {structureReferenceBase64 && (
                  <button
                    onClick={() => onSetStructureReference(undefined)}
                    className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Quitar
                  </button>
                )}
              </div>
              {structureReferenceBase64 ? (
                <img
                  src={structureReferenceBase64}
                  alt="Structure Ref"
                  className="w-full h-24 object-cover rounded-md border border-slate-700"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => structureRefRef.current?.click()}
                  className="w-full h-24 border border-dashed border-slate-700 hover:border-slate-500 rounded-md flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition text-xs"
                >
                  <Upload className="w-4 h-4 mb-1 text-slate-500" />
                  <span>Subir pose o estructura</span>
                </button>
              )}
              <input
                ref={structureRefRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, onSetStructureReference)}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIDEO CONTROLS */}
      {category === 'video' && (
        <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-violet-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
            <Clock className="w-4 h-4" />
            Parámetros Cinemáticos de Video
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Duración:</label>
              <div className="flex gap-2">
                {[5, 10].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => onChangeDurationSeconds(dur)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      durationSeconds === dur
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {dur} Segundos
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Movement */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Camera className="w-3 h-3 text-violet-400" />
                Movimiento de Cámara:
              </label>
              <select
                value={cameraMovement}
                onChange={(e) => onChangeCameraMovement(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-400"
              >
                <option value="cinematic_dynamic">Cinemático Dinámico</option>
                <option value="pan_left">Panorámica Izquierda (Pan Left)</option>
                <option value="pan_right">Panorámica Derecha (Pan Right)</option>
                <option value="zoom_in">Acercamiento (Zoom In)</option>
                <option value="zoom_out">Alejamiento (Zoom Out)</option>
                <option value="tilt_up">Inclinación Arriba (Tilt Up)</option>
                <option value="tilt_down">Inclinación Abajo (Tilt Down)</option>
                <option value="orbit">Orbital 360°</option>
              </select>
            </div>
          </div>

          {/* Image-to-video start frame */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Fotograma Inicial (Image-to-Video opcional):
              </label>
              {inputImageBase64 && (
                <button
                  type="button"
                  onClick={() => onSetInputImage(undefined)}
                  className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Quitar
                </button>
              )}
            </div>
            {inputImageBase64 ? (
              <img
                src={inputImageBase64}
                alt="Start frame"
                className="w-full h-32 object-cover rounded-xl border border-violet-500/30"
              />
            ) : (
              <button
                type="button"
                onClick={() => inputImageRef.current?.click()}
                className="w-full h-20 border border-dashed border-slate-700 hover:border-violet-500 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition text-xs bg-slate-900/40"
              >
                <Upload className="w-4 h-4 text-violet-400" />
                <span>Subir imagen base para animar con {engine.name}</span>
              </button>
            )}
            <input
              ref={inputImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, onSetInputImage)}
            />
          </div>
        </div>
      )}

      {/* EDITING & UPSCALING CONTROLS */}
      {category === 'editing' && (
        <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            Parámetros de Edición & Magnific Upscale
          </div>

          {/* Scale Factor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Factor de Escala:</label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 8, 16].map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => onChangeScaleFactor(scale)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    scaleFactor === scale
                      ? 'bg-emerald-600 text-white border-emerald-500 font-black'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>
          </div>

          {/* Hallucination / Creativity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Creatividad / Alucinación Magnific:</span>
              <span className="font-mono text-emerald-400 font-bold">{creativeDetailing}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={creativeDetailing}
              onChange={(e) => onChangeCreativeDetailing(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Fiel al original</span>
              <span>Reimaginación micro-detallada</span>
            </div>
          </div>

          {/* Input Image Upload (Required for Upscale/Edit) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Imagen a mejorar o transformar (Requerida):
              </label>
              {inputImageBase64 && (
                <button
                  type="button"
                  onClick={() => onSetInputImage(undefined)}
                  className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Quitar
                </button>
              )}
            </div>
            {inputImageBase64 ? (
              <img
                src={inputImageBase64}
                alt="Source"
                className="w-full h-36 object-contain rounded-xl border border-emerald-500/30 bg-black/40"
              />
            ) : (
              <button
                type="button"
                onClick={() => inputImageRef.current?.click()}
                className="w-full h-24 border border-dashed border-emerald-700/60 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-300 transition text-xs bg-emerald-950/15"
              >
                <Upload className="w-5 h-5 text-emerald-400" />
                <span>Haz clic o arrastra la imagen que deseas escalar o editar</span>
              </button>
            )}
            <input
              ref={inputImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, onSetInputImage)}
            />
          </div>
        </div>
      )}

      {/* AUDIO CONTROLS */}
      {category === 'audio' && (
        <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-pink-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
            <Volume2 className="w-4 h-4" />
            Parámetros Acústicos (ElevenLabs)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Duración:</label>
              <select
                value={durationSeconds}
                onChange={(e) => onChangeDurationSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value={15}>15 Segundos</option>
                <option value={30}>30 Segundos</option>
                <option value={60}>60 Segundos</option>
              </select>
            </div>

            {/* Genre */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Género:</label>
              <select
                value={genre}
                onChange={(e) => onChangeGenre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Cinematic">Cinematográfico</option>
                <option value="Electronic">Electrónica / Synthwave</option>
                <option value="Ambient">Ambiental / Meditativo</option>
                <option value="Orchestral">Orquesta Épica</option>
                <option value="Lo-Fi">Lo-Fi Chill</option>
                <option value="Rock">Rock / Guitarras</option>
              </select>
            </div>

            {/* Tempo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tempo:</label>
              <select
                value={tempo}
                onChange={(e) => onChangeTempo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="Slow">Lento (60-80 BPM)</option>
                <option value="Moderate">Moderado (90-120 BPM)</option>
                <option value="Fast">Rápido (128-150 BPM)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
