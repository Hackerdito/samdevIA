import React, { useState } from 'react';
import { Key, X, CheckCircle2, ExternalLink, ShieldCheck, AlertCircle, Info, RefreshCw, Globe } from 'lucide-react';

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
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestKey = async () => {
    if (!inputKey.trim() || isTesting) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/magnific/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputKey.trim() })
      });
      const data = await res.json();
      if (data.valid) {
        setTestResult({
          success: true,
          message: '¡Conexión exitosa con la API de Magnific!'
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'La clave fue rechazada. Verifica tus créditos o permisos en tu cuenta de Magnific.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Error al contactar con el servidor: ' + err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

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
              SamDev IA • Clave de Magnific API
            </h3>
            <p className="text-xs text-zinc-400">
              Autenticación oficial: header <code className="text-amber-300">x-magnific-api-key</code>
            </p>
          </div>
        </div>

        {/* Security & Cloud Note */}
        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-xs leading-relaxed text-zinc-300 space-y-2">
          <div className="flex items-start gap-2 text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Protección Total de Claves:</strong> Todas las llamadas a la API de Magnific se realizan exclusivamente desde el backend seguro (<code>/api/magnific/*</code>), nunca se exponen al navegador.
            </span>
          </div>
          <div className="flex items-start gap-2 text-zinc-400 text-[11px]">
            <Globe className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Al desplegar en Vercel:</strong> Configura la variable de entorno <code className="text-amber-300">MAGNIFIC_API_KEY</code> en tu panel de Vercel (<em>Settings &gt; Environment Variables</em>).
            </span>
          </div>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Tu Clave API de Magnific
            </label>
            <div className="flex gap-2">
              <input
                id="input-magnific-api-key"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="mag_live_... o clave privada"
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestKey}
                disabled={!inputKey.trim() || isTesting}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white disabled:opacity-40 transition-colors"
                title="Probar conexión con Magnific API"
              >
                {isTesting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                ) : (
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                )}
                <span>Probar</span>
              </button>
            </div>
            
            <p className="mt-1.5 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Panel de Claves de Magnific:</span>
              <a
                href="https://www.magnific.com/user/organization/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <span>magnific.com/user/organization/api-keys</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Connected User Note */}
          {userEmail && (
            <div className="flex items-center gap-2 rounded-lg bg-zinc-900/40 px-3 py-2 text-[11px] text-zinc-400 border border-zinc-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                Asociado a tu cuenta de administrador: <strong>{userEmail}</strong>
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
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
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
              Cerrar
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

