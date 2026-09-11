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
import { executeGeneration, enhancePrompt } from './services/generationService';
import { getMonthlyCreditsUsed, recordCreditUsage } from './services/creditsService';
import { AspectRatio, GenerationItem, GenerationRequestParams } from './types';
import { MagnificCategory, MagnificEngine } from './types/magnific';
import { 
  ALL_MAGNIFIC_ENGINES, 
  ENGINES_BY_CATEGORY, 
  CATEGORY_META, 
  getEngineById 
} from './constants/magnificEngines';
import { calculateEstimatedCredits } from './constants/defaultCredits';

import { Navbar } from './components/Navbar';
import { CategoryNav } from './components/CategoryNav';
import { MagnificEngineSelector } from './components/MagnificEngineSelector';
import { DynamicControls } from './components/DynamicControls';
import { MediaGallery } from './components/MediaGallery';
import { MediaModal } from './components/MediaModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CreditsTrackerModal } from './components/CreditsTrackerModal';

import { 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Coins, 
  Send, 
  RefreshCw, 
  Check, 
  AlertCircle,
  LogIn,
  Lightbulb
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  // Active Category & Engine Selection
  const [selectedCategory, setSelectedCategory] = useState<MagnificCategory>('images');
  const [currentEngine, setCurrentEngine] = useState<MagnificEngine>(() => ENGINES_BY_CATEGORY.images?.[0] || ALL_MAGNIFIC_ENGINES[0]); // Mystic by default

  // Engine counts per category
  const categoryCounts: Record<MagnificCategory, number> = {
    images: ENGINES_BY_CATEGORY.images?.length || 0,
    video: ENGINES_BY_CATEGORY.video?.length || 0,
    editing: ENGINES_BY_CATEGORY.editing?.length || 0,
    audio: ENGINES_BY_CATEGORY.audio?.length || 0,
  };

  // Generation Form Parameters
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [showNegative, setShowNegative] = useState<boolean>(false);
  const [resolution, setResolution] = useState<string>('2k');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [hdr, setHdr] = useState<number>(50);
  const [adherence, setAdherence] = useState<number>(75);
  const [creativeDetailing, setCreativeDetailing] = useState<number>(60);
  const [scaleFactor, setScaleFactor] = useState<number>(4);
  const [cameraMovement, setCameraMovement] = useState<string>('cinematic_dynamic');
  const [genre, setGenre] = useState<string>('Cinematic');
  const [tempo, setTempo] = useState<string>('Moderate');
  const [inputImageBase64, setInputImageBase64] = useState<string | undefined>(undefined);
  const [styleReferenceBase64, setStyleReferenceBase64] = useState<string | undefined>(undefined);
  const [structureReferenceBase64, setStructureReferenceBase64] = useState<string | undefined>(undefined);

  // Gallery & Processing State
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgressText, setGenerationProgressText] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<GenerationItem | null>(null);

  // Prompt enhancement
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedSuccess, setEnhancedSuccess] = useState<boolean>(false);

  // Modals & Credit Tracking
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState<boolean>(false);
  const [monthlyCreditsUsed, setMonthlyCreditsUsed] = useState<number>(() => getMonthlyCreditsUsed());
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('magnific_api_key') || localStorage.getItem('freepik_api_key') || '';
  });

  // Calculate live estimated credits
  const currentEstimatedCredits = calculateEstimatedCredits(currentEngine.id, {
    resolution,
    durationSeconds,
    scaleFactor
  });

  // Handle Category Change
  const handleCategorySelect = (category: MagnificCategory) => {
    setSelectedCategory(category);
    const categoryEngines = ENGINES_BY_CATEGORY[category] || [];
    if (categoryEngines.length > 0) {
      setCurrentEngine(categoryEngines[0]);
    }
    
    // Set appropriate default resolutions / durations
    if (category === 'video') {
      setDurationSeconds(5);
    } else if (category === 'editing') {
      setScaleFactor(4);
    } else if (category === 'audio') {
      setDurationSeconds(30);
    }
  };

  // Test Firestore connection and authenticate user
  useEffect(() => {
    let unsubscribeGenerations: (() => void) | null = null;

    testConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (unsubscribeGenerations) {
        unsubscribeGenerations();
        unsubscribeGenerations = null;
      }

      if (user) {
        setIsLoadingGenerations(true);

        try {
          const profile = await getUserProfile(user.uid);
          if (profile?.freepikApiKey && !userApiKey) {
            setUserApiKey(profile.freepikApiKey);
            localStorage.setItem('magnific_api_key', profile.freepikApiKey);
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

  // Update credits counter periodically or on change
  const refreshCreditsDisplay = () => {
    setMonthlyCreditsUsed(getMonthlyCreditsUsed());
  };

  // Enhance prompt with Gemini
  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setEnhancedSuccess(false);
    try {
      const improved = await enhancePrompt(prompt, currentEngine.id, selectedCategory);
      setPrompt(improved);
      setEnhancedSuccess(true);
      setTimeout(() => setEnhancedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to enhance prompt', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle generation action
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Check required image for editing
    if (selectedCategory === 'editing' && !inputImageBase64) {
      alert('Para escalar o editar con este motor, por favor sube una imagen base en los controles de abajo.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgressText(`Conectando con Magnific API (${currentEngine.name})...`);

    const effectiveUserId = currentUser ? currentUser.uid : 'guest-creator';
    const effectiveEmail = currentUser?.email || ADMIN_EMAIL;

    const requestParams: GenerationRequestParams = {
      type: selectedCategory === 'video' ? 'video' : 'image',
      category: selectedCategory,
      engine: currentEngine.id,
      prompt: prompt.trim(),
      negativePrompt: showNegative ? negativePrompt.trim() : undefined,
      aspectRatio,
      resolution,
      durationSeconds: selectedCategory === 'video' || selectedCategory === 'audio' ? durationSeconds : undefined,
      creativity: creativeDetailing,
      apiKey: userApiKey,
      inputImageBase64,
      styleReferenceBase64,
      structureReferenceBase64,
      scaleFactor: selectedCategory === 'editing' ? scaleFactor : undefined,
      cameraMovement: selectedCategory === 'video' ? cameraMovement : undefined,
      hdr: currentEngine.id === 'mystic' ? hdr : undefined,
      adherence: currentEngine.id === 'mystic' ? adherence : undefined,
      creativeDetailing: currentEngine.id === 'mystic' ? creativeDetailing : undefined,
      genre: selectedCategory === 'audio' ? genre : undefined,
      tempo: selectedCategory === 'audio' ? tempo : undefined,
    };

    try {
      const result = await executeGeneration(
        requestParams,
        effectiveUserId,
        effectiveEmail,
        (status) => setGenerationProgressText(status)
      );

      // Record credits
      refreshCreditsDisplay();

      // If user is guest, update local list
      if (!currentUser) {
        setGenerations((prev) => {
          const updated = [result, ...prev];
          localStorage.setItem('guest_generations', JSON.stringify(updated.slice(0, 30)));
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
      alert('Error en la generación con Magnific: ' + errorText);
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
    if (!confirm('¿Deseas eliminar este registro de Firebase?')) return;
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

  // Save Magnific API key
  const handleSaveApiKey = async (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('magnific_api_key', key);
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
    const foundEngine = getEngineById(engineId);
    if (foundEngine) {
      setSelectedCategory(foundEngine.category);
      setCurrentEngine(foundEngine);
    }
    setPrompt(promptText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler
  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
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
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        monthlyCreditsUsed={monthlyCreditsUsed}
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
                <span className="flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  SamDev IA • Magnific Suite Oficial
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
                Dashboard Oficial de Magnific API
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Genera imágenes, videos cinemáticos, upscale hiper-detallado y audio usando <strong>Mystic</strong>, <strong>Flux Pro</strong>, <strong>Kling 1.5</strong>, <strong>MiniMax Hailuo</strong>, <strong>Magnific Upscaler 2.0</strong> y <strong>ElevenLabs</strong> con control de tus créditos.
              </p>
            </div>

            {/* Quick Engine Metrics */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setIsCreditsModalOpen(true)}
                className="flex-1 lg:flex-initial rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center min-w-[120px] hover:bg-amber-500/15 transition cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1 text-xl font-extrabold text-amber-400 font-mono">
                  <Coins className="w-5 h-5" />
                  {monthlyCreditsUsed.toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-300/80 mt-0.5 font-medium">Créditos Usados</div>
              </button>
              <div className="flex-1 lg:flex-initial rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center min-w-[110px]">
                <div className="text-xl font-extrabold text-white font-['Syne',sans-serif]">
                  {ALL_MAGNIFIC_ENGINES.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Motores Magnific</div>
              </div>
              <div className="flex-1 lg:flex-initial rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-center min-w-[110px]">
                <div className="text-xl font-extrabold text-emerald-400 font-['Syne',sans-serif]">
                  {generations.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Generaciones en DB</div>
              </div>
            </div>
          </div>

          {/* Prompt to Sign In if not logged in */}
          {!currentUser && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-200">
                  Inicia sesión con tu cuenta de Google (<strong>{ADMIN_EMAIL}</strong>) para sincronizar tu historial y consumo de créditos en Firestore.
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

        {/* Section 1: Category Navigation (Images, Video, Editing, Audio) */}
        <section className="space-y-4">
          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            counts={categoryCounts}
          />

          {/* Section 2: Magnific Engines for the Selected Category */}
          <MagnificEngineSelector
            engines={ENGINES_BY_CATEGORY[selectedCategory] || []}
            selectedEngineId={currentEngine?.id || ''}
            onSelectEngine={(engine) => setCurrentEngine(engine)}
          />
        </section>

        {/* Section 3: Creation Studio, Prompt Composer & Dynamic Controls */}
        <section className="space-y-4">
          <form onSubmit={handleGenerate} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl backdrop-blur-md space-y-5">
            
            {/* Header with selected engine & live credit cost */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-['Syne',sans-serif] text-base font-bold text-white">
                  Generador de {CATEGORY_META[selectedCategory]?.title || selectedCategory}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                  {currentEngine?.name || 'Magnific'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Consumo previsto:</span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {currentEstimatedCredits} Créditos
                </span>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                id="input-prompt-composer"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  selectedCategory === 'video'
                    ? `Describe la toma cinematográfica para ${currentEngine.name} (ej. "Toma con dron sobre costas volcánicas al atardecer, cinematic 4k, cámara lenta 60fps")...`
                    : selectedCategory === 'audio'
                    ? `Describe la pista musical o efecto de sonido (ej. "Cyberpunk synthwave bassline con sintetizadores analógicos y batería 80s")...`
                    : selectedCategory === 'editing'
                    ? `Describe la transformación o mejora deseada (ej. "Mejora fotorrealista hiper-detallada de rostro y texturas de piel en 8k")...`
                    : `Describe tu visión creativa para ${currentEngine.name} (ej. "Retrato fotorrealista de astronauta en Marte con reflejos en el casco, iluminación dramática")...`
                }
                className="w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-sans leading-relaxed"
              />

              {/* Enhance with Gemini button */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  id="btn-enhance-prompt-gemini"
                  type="button"
                  onClick={handleEnhance}
                  disabled={!prompt.trim() || isEnhancing}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
                    enhancedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/70'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title="Optimiza tu prompt con IA Gemini"
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                      <span>Mejorando...</span>
                    </>
                  ) : enhancedSuccess ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-200" />
                      <span>¡Prompt Optimizado!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Mejorar con Gemini IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Negative Prompt toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowNegative(!showNegative)}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {showNegative ? '− Ocultar Prompt Negativo' : '+ Agregar Prompt Negativo (elementos a evitar)'}
              </button>
              {showNegative && (
                <input
                  id="input-negative-prompt"
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Ej. blur, low quality, artifacts, distorted hands, noisy, watermark..."
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/90 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none"
                />
              )}
            </div>

            {/* Dynamic Controls based on Engine & Category */}
            <DynamicControls
              engine={currentEngine}
              category={selectedCategory}
              resolution={resolution}
              onChangeResolution={setResolution}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={setAspectRatio}
              durationSeconds={durationSeconds}
              onChangeDurationSeconds={setDurationSeconds}
              hdr={hdr}
              onChangeHdr={setHdr}
              adherence={adherence}
              onChangeAdherence={setAdherence}
              creativeDetailing={creativeDetailing}
              onChangeCreativeDetailing={setCreativeDetailing}
              scaleFactor={scaleFactor}
              onChangeScaleFactor={setScaleFactor}
              cameraMovement={cameraMovement}
              onChangeCameraMovement={setCameraMovement}
              genre={genre}
              onChangeGenre={setGenre}
              tempo={tempo}
              onChangeTempo={setTempo}
              inputImageBase64={inputImageBase64}
              onSetInputImage={setInputImageBase64}
              styleReferenceBase64={styleReferenceBase64}
              onSetStyleReference={setStyleReferenceBase64}
              structureReferenceBase64={structureReferenceBase64}
              onSetStructureReference={setStructureReferenceBase64}
              estimatedCredits={currentEstimatedCredits}
            />

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                id="btn-generate-media"
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 px-6 text-sm font-bold shadow-xl transition-all bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-zinc-950 hover:opacity-95 shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-current" />
                    <span>Generando en Magnific API...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>
                      Generar con {currentEngine.name} • {currentEstimatedCredits} Créditos
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Live Progress Banner */}
            {isGenerating && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                  <span>{generationProgressText || 'Enviando petición a Magnific API...'}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Guardando automáticamente el recurso y los créditos en tu base de datos de Firebase.
                </p>
              </div>
            )}

          </form>
        </section>

        {/* Section 4: Firebase Gallery & Assets */}
        <section className="space-y-4 pt-4 border-t border-zinc-800/80">
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

      {/* Magnific API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={userApiKey}
        onSaveApiKey={handleSaveApiKey}
        userEmail={currentUser?.email || ADMIN_EMAIL}
      />

      {/* Magnific Credits Tracker & Analytics Modal */}
      <CreditsTrackerModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        apiKey={userApiKey}
        monthlyCreditsUsed={monthlyCreditsUsed}
        onResetMonthlyCredits={() => {
          localStorage.setItem('magnific_credits_used', '0');
          refreshCreditsDisplay();
        }}
      />

    </div>
  );
}
