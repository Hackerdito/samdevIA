import React from 'react';
import { Sparkles, Database, Key, LogIn, LogOut, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { ADMIN_EMAIL } from '../firebase/config';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  isFirestoreConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  onOpenApiKeyModal,
  hasApiKey,
  isFirestoreConnected,
}) => {
  const isDefaultAdmin = user?.email === ADMIN_EMAIL || (!user && false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-zinc-950 shadow-md shadow-orange-500/20">
            <Sparkles className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Syne',sans-serif] text-lg font-bold tracking-tight text-zinc-100">
                MAGNIFIC
              </span>
              <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                FREEPIK ENGINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Generador Universal de Imágenes y Video IA
            </p>
          </div>
        </div>

        {/* Status Indicators & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Firestore Connection Indicator */}
          <div 
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border ${
              isFirestoreConnected 
                ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300' 
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            }`}
            title={isFirestoreConnected ? "Conectado a Firebase Firestore" : "Verificando Firebase..."}
          >
            <Database className="h-3.5 w-3.5" />
            <span className="font-medium">Firebase DB</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Freepik API Key status button */}
          <button
            id="btn-api-key-settings"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
              hasApiKey 
                ? 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50' 
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">API Freepik / Magnific:</span>
            <span className="font-semibold">
              {hasApiKey ? 'Activa' : 'Configurar'}
            </span>
          </button>

          {/* User Account / Admin Badge */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuario'}
                    className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600/20 text-orange-400 font-bold text-xs border border-orange-500/30">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-zinc-200 truncate max-w-[140px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    {user.email === ADMIN_EMAIL && (
                      <span className="flex items-center gap-0.5 rounded-sm bg-orange-500/20 px-1 py-0.2 text-[10px] font-bold text-orange-400 border border-orange-500/30">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        PRO ADMIN
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate block max-w-[140px]">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                id="btn-logout"
                onClick={onLogout}
                title="Cerrar sesión"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-login-google"
                onClick={onLogin}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm hover:bg-zinc-200 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Acceder con Google</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
