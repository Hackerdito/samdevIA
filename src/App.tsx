/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection, loginWithGoogle, logoutUser, ADMIN_EMAIL } from './firebase/config';
import { 
  subscribeToUserGenerations, 
  deleteGeneration, 
  toggleFavorite, 
  saveUserProfile, 
  getUserProfile,
  saveGeneration 
} from './services/firestoreService';
import { executeGeneration } from './services/generationService';
import { AIEngine, EngineId, GenerationItem, GenerationRequestParams } from './types';
import { AI_ENGINES } from './constants/engines';
import { Navbar } from './components/Navbar';
import { EngineSelector } from './components/EngineSelector';
import { PromptComposer } from './components/PromptComposer';
import { MediaGallery } from './components/MediaGallery';
import { MediaModal } from './components/MediaModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Sparkles, Database, ShieldCheck, Video, Image as ImageIcon, LogIn, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);
  const [currentEngine, setCurrentEngine] = useState<AIEngine>(AI_ENGINES[0]); // Mystic v2.5 by default
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgressText, setGenerationProgressText] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<GenerationItem | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('freepik_api_key') || '';
  });

  // Test Firestore connection and authenticate user
  useEffect(() => {
    let unsubscribeGenerations: (() => void) | null = null;

    testConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Clean up any prior listener
      if (unsubscribeGenerations) {
        unsubscribeGenerations();
        unsubscribeGenerations = null;
      }

      // CRITICAL: Only attach onSnapshot listener when user is authenticated!
      if (user) {
        setIsLoadingGenerations(true);

        try {
          const profile = await getUserProfile(user.uid);
          if (profile?.freepikApiKey && !userApiKey) {
            setUserApiKey(profile.freepikApiKey);
            localStorage.setItem('freepik_api_key', profile.freepikApiKey);
          }
          await saveUserProfile({
            uid: user.uid,
            email: user.email || ADMIN_EMAIL,
            displayName: user.displayName || 'Gerito Diseño',
            photoURL: user.photoURL || undefined,
            isAdmin: (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase(),
          });
        } catch (e) {
          console.warn('Profile sync notice:', e);
        }

        unsubscribeGenerations = subscribeToUserGenerations(
          user.uid,
          user.email,
          (items) => {
            setGenerations(items);
            setIsLoadingGenerations(false);
          },
          (error) => {
            console.warn('Firestore listener notice:', error.message);
            setIsLoadingGenerations(false);
          }
        );
      } else {
        // When unauthenticated, load from local storage cache if available
        setIsLoadingGenerations(false);
        const cached = localStorage.getItem('guest_generations');
        if (cached) {
          try {
            setGenerations(JSON.parse(cached));
          } catch {
            setGenerations([]);
          }
        } else {
          setGenerations([]);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeGenerations) {
        unsubscribeGenerations();
      }
    };
  }, []);

  // Handle generation action
  const handleGenerate = async (params: GenerationRequestParams) => {
    setIsGenerating(true);
    setGenerationProgressText('Iniciando proceso de generación...');

    const effectiveUserId = currentUser ? currentUser.uid : 'guest-creator';
    const effectiveEmail = currentUser?.email || ADMIN_EMAIL;

    try {
      const result = await executeGeneration(
        params,
        effectiveUserId,
        effectiveEmail,
        (status) => setGenerationProgressText(status)
      );

      // If user is guest, update local list
      if (!currentUser) {
        setGenerations((prev) => {
          const updated = [result, ...prev];
          localStorage.setItem('guest_generations', JSON.stringify(updated.slice(0, 20)));
          return updated;
        });
      }

      // Open newly generated media modal
      setSelectedMedia(result);
    } catch (err: any) {
      console.error('Error during generation:', err);
      let errorText = err.message || String(err);
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error) {
          errorText = parsed.error;
        }
      } catch {
        // Not JSON
      }
      alert('Error en la generación: ' + errorText);
    } finally {
      setIsGenerating(false);
      setGenerationProgressText('');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      if (currentUser) {
        await toggleFavorite(id, current);
      }
      setGenerations((prev) => {
        const next = prev.map((g) => (g.id === id ? { ...g, isFavorite: !current } : g));
        if (!currentUser) {
          localStorage.setItem('guest_generations', JSON.stringify(next));
        }
        return next;
      });
      if (selectedMedia?.id === id) {
        setSelectedMedia((prev) => prev ? { ...prev, isFavorite: !current } : null);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Delete generation
  const handleDeleteGeneration = async (id: string) => {
    if (!confirm('¿Deseas eliminar este registro?')) return;
    try {
      if (currentUser) {
        await deleteGeneration(id);
      }
      setGenerations((prev) => {
        const next = prev.filter((g) => g.id !== id);
        if (!currentUser) {
          localStorage.setItem('guest_generations', JSON.stringify(next));
        }
        return next;
      });
      if (selectedMedia?.id === id) {
        setSelectedMedia(null);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Save Freepik API key
  const handleSaveApiKey = async (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('freepik_api_key', key);

    if (currentUser) {
      await saveUserProfile({
        uid: currentUser.uid,
        email: currentUser.email || ADMIN_EMAIL,
        freepikApiKey: key,
      });
    }
  };

  // Reuse prompt from gallery
  const handleReusePrompt = (promptText: string, engineId: string) => {
    const foundEngine = AI_ENGINES.find((e) => e.id === engineId);
    if (foundEngine) {
      setCurrentEngine(foundEngine);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler
  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        // Sync any cached generations into Firestore
        const cached = localStorage.getItem('guest_generations');
        if (cached) {
          try {
            const items: GenerationItem[] = JSON.parse(cached);
            for (const it of items) {
              await saveGeneration({
                ...it,
                userId: loggedUser.uid,
                userEmail: loggedUser.email || ADMIN_EMAIL,
              });
            }
            localStorage.removeItem('guest_generations');
          } catch {
            // Ignore
          }
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      setGenerations([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={Boolean(userApiKey)}
        isFirestoreConnected={isFirestoreConnected}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        
        {/* Studio Hero & Status Dashboard */}
        <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  SamDev IA • Generación Creativa
                </span>
                <span className="flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Cuenta Autorizada: {ADMIN_EMAIL}
                </span>
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  <Database className="h-3 w-3" />
                  Firebase Firestore: Conectado
                </span>
              </div>
              <h1 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                SamDev IA • Estudio Multi-Motor de Video e Imagen
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Genera con <strong>Mystic v2.5</strong>, <strong>Flux 1.1 Pro</strong>, <strong>Kling 1.5 HD</strong>, <strong>MiniMax Hailuo</strong>, <strong>Imagen 3</strong>, <strong>Recraft V3</strong> y herramientas de escalado de detalle. Todo tu historial y parámetros se almacenan de forma segura en Firebase Firestore.
              </p>
            </div>

            {/* Quick Engine Metrics */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <div className="flex-1 lg:flex-initial rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center min-w-[110px]">
                <div className="text-xl font-extrabold text-orange-400 font-['Syne',sans-serif]">
                  {AI_ENGINES.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Motores de IA</div>
              </div>
              <div className="flex-1 lg:flex-initial rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center min-w-[110px]">
                <div className="text-xl font-extrabold text-white font-['Syne',sans-serif]">
                  {generations.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Generaciones en DB</div>
              </div>
              <div className="flex-1 lg:flex-initial rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center min-w-[110px]">
                <div className="text-xl font-extrabold text-emerald-400 font-['Syne',sans-serif]">
                  Activo
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Firestore Sync</div>
              </div>
            </div>
          </div>

          {/* Prompt to Sign In if not logged in */}
          {!currentUser && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-200">
                  Inicia sesión con tu cuenta de Google (<strong>{ADMIN_EMAIL}</strong>) para sincronizar y respaldar todas tus generaciones en tu base de datos de Firebase.
                </p>
              </div>
              <button
                onClick={handleLogin}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-900 hover:bg-zinc-200 shadow-sm transition-colors shrink-0"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Acceder con Google</span>
              </button>
            </div>
          )}
        </section>

        {/* Section 1: Engine Selector */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-['Syne',sans-serif] text-base font-bold text-white flex items-center gap-2">
              <span>Selecciona el Motor de IA</span>
              <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300 font-sans font-medium">
                {currentEngine.name} seleccionado
              </span>
            </h2>
          </div>

          <EngineSelector
            selectedEngineId={currentEngine.id}
            onSelectEngine={(engine) => {
              setCurrentEngine(engine);
              setMediaTypeFilter(engine.type);
            }}
            mediaTypeFilter={mediaTypeFilter}
            onSetMediaTypeFilter={(filter) => setMediaTypeFilter(filter)}
          />
        </section>

        {/* Section 2: Generation Workspace & Prompt Composer */}
        <section className="space-y-3">
          <h2 className="font-['Syne',sans-serif] text-base font-bold text-white flex items-center gap-2">
            <span>Estudio de Creación & Prompting</span>
          </h2>
          <PromptComposer
            currentEngine={currentEngine}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            generationProgressText={generationProgressText}
            userApiKey={userApiKey}
          />
        </section>

        {/* Section 3: Firebase Gallery & Assets */}
        <section className="space-y-3 pt-4 border-t border-zinc-800/80">
          <MediaGallery
            generations={generations}
            isLoading={isLoadingGenerations}
            onToggleFavorite={handleToggleFavorite}
            onDeleteGeneration={handleDeleteGeneration}
            onSelectMedia={(item) => setSelectedMedia(item)}
            onReusePrompt={handleReusePrompt}
          />
        </section>

      </main>

      {/* Media Detail & Lightbox Modal */}
      <MediaModal
        item={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteGeneration}
      />

      {/* Freepik / Magnific API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={userApiKey}
        onSaveApiKey={handleSaveApiKey}
        userEmail={currentUser?.email || ADMIN_EMAIL}
      />

    </div>
  );
}
