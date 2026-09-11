import React, { useState } from 'react';
import { Key, X, CheckCircle2, ExternalLink, ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => Promise<void>;
  userEmail?: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  userEmail,
}) => {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState<string>(apiKey || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveApiKey(inputKey.trim());
    setIsSaved(true);
    setTestResult({
      success: true,
      message: 'Clave API guardada y vinculada a tu cuenta con éxito.',
    });
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-['Syne',sans-serif] text-base font-bold text-white">
              API de Freepik & Magnific AI
            </h3>
            <p className="text-xs text-zinc-400">
              Conexión para todos los motores de generación de video e imagen
            </p>
          </div>
        </div>

        {/* Explanation Note */}
        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-xs leading-relaxed text-zinc-300 space-y-2">
          <div className="flex items-start gap-2 text-zinc-300">
            <Info className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              <strong>Magnific AI</strong> forma parte del ecosistema oficial de <strong>Freepik</strong>. A través de la clave API unificada de Freepik Developer, la aplicación tiene acceso a:
            </span>
          </div>
          <ul className="list-disc list-inside text-zinc-400 pl-4 space-y-1 text-[11px]">
            <li><strong>Motores de Imagen:</strong> Mystic v2.5, Flux 1.1 Pro, Recraft V3, Imagen 3, Seedream y Magnific AI Enhancer.</li>
            <li><strong>Motores de Video:</strong> Kling 1.5 HD, MiniMax Hailuo 01, Runway Gen-3, Luma Dream Machine y CogVideoX.</li>
          </ul>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Tu Clave API de Freepik / Magnific
            </label>
            <input
              id="input-freepik-api-key"
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="FPSX_..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
            />
            <p className="mt-1.5 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Puedes obtener tu clave en el panel de desarrollador.</span>
              <a
                href="https://freepik.com/api"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium"
              >
                <span>Obtener clave</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Connected User Note */}
          {userEmail && (
            <div className="flex items-center gap-2 rounded-lg bg-zinc-900/40 px-3 py-2 text-[11px] text-zinc-400 border border-zinc-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                Asociado a tu cuenta de usuario: <strong>{userEmail}</strong>
              </span>
            </div>
          )}

          {/* Feedback Message */}
          {testResult && (
            <div className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${
              testResult.success
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-950/40 text-red-300 border border-red-500/30'
            }`}>
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-save-api-key"
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-orange-500/20 hover:opacity-90 transition-opacity"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSaved ? 'Guardado' : 'Guardar y Activar'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
