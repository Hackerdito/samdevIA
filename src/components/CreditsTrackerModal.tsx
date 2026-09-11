import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  RotateCcw, 
  Save, 
  Settings2, 
  TrendingUp, 
  ShieldAlert, 
  Calendar, 
  CheckCircle, 
  X, 
  Building, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  getStoredCreditsConfig, 
  saveStoredCreditsConfig, 
  getCreditsSummary, 
  resetMonthlyCredits, 
  fetchEnterpriseTeamCredits 
} from '../services/creditsService';
import { DEFAULT_CREDITS_CONFIG } from '../constants/defaultCredits';
import { ModelCreditsConfig, CreditsSummary } from '../types/magnific';

interface CreditsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userApiKey?: string;
}

export const CreditsTrackerModal: React.FC<CreditsTrackerModalProps> = ({
  isOpen,
  onClose,
  userId,
  userApiKey
}) => {
  const [creditsSummary, setCreditsSummary] = useState<CreditsSummary>({
    monthlyUsed: 0,
    billingResetDay: 1,
    lastResetIso: new Date().toISOString(),
    isEnterpriseMode: false
  });
  const [creditsConfig, setCreditsConfig] = useState<ModelCreditsConfig>(DEFAULT_CREDITS_CONFIG);
  const [customResetDay, setCustomResetDay] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'summary' | 'config' | 'enterprise'>('summary');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [enterpriseStatus, setEnterpriseStatus] = useState<string | null>(null);
  const [isLoadingEnterprise, setIsLoadingEnterprise] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    const summary = await getCreditsSummary(userId);
    const config = getStoredCreditsConfig();
    setCreditsSummary(summary);
    setCustomResetDay(summary.billingResetDay || 1);
    setCreditsConfig(config);
  };

  const handleResetCounter = async () => {
    if (window.confirm('¿Seguro que deseas reiniciar el contador mensual a 0 créditos?')) {
      const updated = await resetMonthlyCredits(userId, customResetDay);
      setCreditsSummary(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSaveConfig = () => {
    saveStoredCreditsConfig(creditsConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('¿Restablecer tabla de créditos a los valores recomendados oficiales de Magnific?')) {
      setCreditsConfig(DEFAULT_CREDITS_CONFIG);
      saveStoredCreditsConfig(DEFAULT_CREDITS_CONFIG);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleTestEnterpriseAnalytics = async () => {
    setIsLoadingEnterprise(true);
    setEnterpriseStatus(null);
    try {
      const result = await fetchEnterpriseTeamCredits(userApiKey);
      if (result.success) {
        setEnterpriseStatus(`Conexión exitosa. Datos recibidos: ${JSON.stringify(result.data).slice(0, 120)}...`);
      } else {
        setEnterpriseStatus(`Aviso: ${result.error}`);
      }
    } catch (e: any) {
      setEnterpriseStatus(`Error: ${e.message}`);
    } finally {
      setIsLoadingEnterprise(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Gestor de Créditos Magnific</h3>
              <p className="text-xs text-slate-400">Control de consumo mensual y configuración de costos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Consumo Mensual
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Tabla de Costos por Modelo
          </button>
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'enterprise'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Enterprise Analytics
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {saveSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Configuración guardada y sincronizada con éxito.</span>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Big Credit Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-800 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Consumo Estimado del Ciclo Actual
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-black text-white tracking-tight">
                      {creditsSummary.monthlyUsed.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">créditos Magnific</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Reinicia automáticamente el día <strong className="text-amber-300">{creditsSummary.billingResetDay}</strong> de cada mes.
                    Último reinicio: {new Date(creditsSummary.lastResetIso).toLocaleDateString()}.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={handleResetCounter}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    Reiniciar Contador
                  </button>
                </div>
              </div>

              {/* Billing Cycle Setting */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Día de Facturación / Reinicio de Créditos</h4>
                    <p className="text-xs text-slate-400">Día del mes en que se renuevan tus créditos en magnific.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={customResetDay}
                    onChange={(e) => setCustomResetDay(parseInt(e.target.value) || 1)}
                    className="w-16 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-center text-white focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={async () => {
                      const updated = await resetMonthlyCredits(userId, customResetDay);
                      setCreditsSummary(updated);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Actualizar Día
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-start gap-3 text-xs text-slate-400">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Nota sobre la API de Magnific:</strong> La API oficial de Magnific descuenta créditos directamente de tu cuenta registrada en magnific.com pero no expone un endpoint público de saldo restante en planes estándar. Por eso, SamDev IA calcula y acumula los créditos estimados basándose en la tabla de consumo configurada para que tengas control total de tu presupuesto mensual.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Tabla de Estimación de Créditos</h4>
                  <p className="text-xs text-slate-400">Ajusta los créditos calculados por generación según tu plan de Magnific</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRestoreDefaults}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                  >
                    Valores Oficiales
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Guardar Tabla
                  </button>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Mystic */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="font-bold text-amber-400">Mystic (Buque Insignia)</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Resolución 1K:</span>
                    <input
                      type="number"
                      value={creditsConfig.mystic_1k}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, mystic_1k: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Resolución 2K:</span>
                    <input
                      type="number"
                      value={creditsConfig.mystic_2k}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, mystic_2k: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Resolución 4K:</span>
                    <input
                      type="number"
                      value={creditsConfig.mystic_4k}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, mystic_4k: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                </div>

                {/* Video */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="font-bold text-violet-400">Video Generators (5s / 10s)</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Kling 1.5 (5 seg):</span>
                    <input
                      type="number"
                      value={creditsConfig.kling_5s}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, kling_5s: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">MiniMax Hailuo:</span>
                    <input
                      type="number"
                      value={creditsConfig.minimax_hailuo}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, minimax_hailuo: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Runway Gen-3:</span>
                    <input
                      type="number"
                      value={creditsConfig.runway_gen3}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, runway_gen3: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Luma Dream Machine:</span>
                    <input
                      type="number"
                      value={creditsConfig.luma_dream}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, luma_dream: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                </div>

                {/* Other Images */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="font-bold text-cyan-400">Otros Motores de Imagen</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Flux 1.1 Pro:</span>
                    <input
                      type="number"
                      value={creditsConfig.flux_pro}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, flux_pro: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Recraft v3:</span>
                    <input
                      type="number"
                      value={creditsConfig.recraft_v3}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, recraft_v3: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Google Imagen 3:</span>
                    <input
                      type="number"
                      value={creditsConfig.imagen_3}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, imagen_3: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                </div>

                {/* Editing & Upscale */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="font-bold text-emerald-400">Edición, Upscaling y Audio</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Magnific Upscale:</span>
                    <input
                      type="number"
                      value={creditsConfig.upscaler}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, upscaler: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Magnific Relight / Restyle:</span>
                    <input
                      type="number"
                      value={creditsConfig.relight}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, relight: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">ElevenLabs Audio:</span>
                    <input
                      type="number"
                      value={creditsConfig.audio}
                      onChange={(e) => setCreditsConfig({ ...creditsConfig, audio: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enterprise' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-indigo-500/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Magnific Enterprise Analytics</h4>
                    <p className="text-xs text-slate-300">Endpoint: POST /v1/analytics/team-credit-usage</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Magnific ofrece consulta de consumo en tiempo real de API a través de su endpoint corporativo para cuentas con planes <strong>Business o Enterprise</strong>. La función ya está implementada en SamDev IA y lista para usarse.
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Probar consulta de equipo en vivo</div>
                    <div className="text-xs text-slate-400">Verifica si tu clave cuenta con permisos corporativos de analítica</div>
                  </div>
                  <button
                    onClick={handleTestEnterpriseAnalytics}
                    disabled={isLoadingEnterprise}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                  >
                    {isLoadingEnterprise ? 'Consultando...' : 'Consultar API'}
                  </button>
                </div>

                {enterpriseStatus && (
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 break-words">
                    {enterpriseStatus}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>SamDev IA • Magnific API Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
