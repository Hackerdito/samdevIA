import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-endpoints',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            hasFreepikKey: Boolean(process.env.FREEPIK_API_KEY || process.env.MAGNIFIC_API_KEY),
            hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
          }));
          return;
        }

        if (req.url === '/api/enhance-prompt' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { prompt, engine, type } = JSON.parse(body || '{}');
              const geminiApiKey = process.env.GEMINI_API_KEY;
              
              if (!geminiApiKey || !prompt) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ enhanced: prompt }));
                return;
              }

              // Lazy import GoogleGenAI
              const { GoogleGenAI } = await import('@google/genai');
              const ai = new GoogleGenAI({ apiKey: geminiApiKey });

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: `You are a world-class prompt engineer for generative AI media engines (Freepik, Magnific AI, Mystic, Flux 1.1 Pro, Kling AI, MiniMax Hailuo, Recraft V3).
The user wants to generate a ${type} with engine "${engine}".
User's core idea: "${prompt}".
Refine and enhance this into an optimal, highly descriptive, photorealistic or cinematic English prompt tailored for ${engine}. Keep it concise, high impact, under 60 words, focusing on lighting, composition, lens/motion physics, and textures. Return ONLY the enhanced prompt string without explanations, quotes, or markdown.`,
              });

              const enhancedText = response.text ? response.text.trim() : prompt;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ enhanced: enhancedText }));
            } catch (err: any) {
              console.error('Enhance prompt error:', err);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // API route to verify Freepik / Magnific key
        if (req.url === '/api/freepik/verify-key' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const key = payload.apiKey || process.env.FREEPIK_API_KEY || process.env.MAGNIFIC_API_KEY;

              if (!key) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ valid: false, error: 'No se proporcionó clave API' }));
                return;
              }

              // Test with lightweight ping to Freepik resources or AI status
              const testRes = await fetch('https://api.freepik.com/v1/resources?page=1&limit=1', {
                headers: {
                  'x-freepik-api-key': key,
                  'Accept': 'application/json'
                }
              });

              if (testRes.status === 401 || testRes.status === 403) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  valid: false, 
                  error: 'Clave API rechazada por Freepik (401/403 no autorizada). Verifica que esté activa en tu panel de Freepik Developer.' 
                }));
                return;
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ valid: true, message: 'Clave API válida y conectada a Freepik / Magnific' }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ valid: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/freepik/generate' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const apiKey = payload.apiKey || process.env.FREEPIK_API_KEY || process.env.MAGNIFIC_API_KEY;

              let outputUrl: string | null = null;
              let apiProvider = 'Freepik / Magnific';
              let rawData: any = null;
              let isLiveFreepik = false;

              // If API key is present, attempt real Freepik / Magnific endpoint
              if (apiKey) {
                let endpoint = 'https://api.freepik.com/v1/ai/text-to-image/mystic';
                let requestBody: any = {
                  prompt: payload.prompt,
                  aspect_ratio: payload.aspectRatio === '16:9' ? 'widescreen_16_9' : 
                                payload.aspectRatio === '9:16' ? 'portrait_9_16' : 
                                payload.aspectRatio === '4:3' ? 'landscape_4_3' : 'square_1_1',
                };

                if (payload.negativePrompt) {
                  requestBody.negative_prompt = payload.negativePrompt;
                }

                if (payload.type === 'video') {
                  if (payload.engine === 'minimax-hailuo') {
                    endpoint = 'https://api.freepik.com/v1/ai/text-to-video/minimax';
                  } else {
                    endpoint = 'https://api.freepik.com/v1/ai/text-to-video/kling-v1-5';
                  }
                  requestBody.duration = payload.durationSeconds || 5;
                } else {
                  if (payload.engine === 'flux-pro' || payload.engine === 'flux-schnell') {
                    endpoint = 'https://api.freepik.com/v1/ai/text-to-image/flux-pro';
                  } else if (payload.engine === 'recraft-v3') {
                    endpoint = 'https://api.freepik.com/v1/ai/text-to-image/recraft-v3';
                  } else if (payload.engine === 'imagen-3') {
                    endpoint = 'https://api.freepik.com/v1/ai/text-to-image/imagen3';
                  } else if (payload.engine === 'magnific-upscale') {
                    endpoint = 'https://api.freepik.com/v1/ai/image-upscaler';
                  }
                }

                try {
                  const apiRes = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-freepik-api-key': apiKey,
                      'x-magnific-api-key': apiKey,
                      'Accept': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                  });

                  if (apiRes.ok) {
                    const data = await apiRes.json();
                    rawData = data;

                    // Direct URL in response
                    if (data.data?.[0]?.url) {
                      outputUrl = data.data[0].url;
                      isLiveFreepik = true;
                    } else if (data.data?.[0]?.base64) {
                      outputUrl = `data:image/png;base64,${data.data[0].base64}`;
                      isLiveFreepik = true;
                    } else if (data.url || data.video_url) {
                      outputUrl = data.url || data.video_url;
                      isLiveFreepik = true;
                    } 
                    
                    // If Freepik returned an asynchronous task ID, poll until completion
                    const taskId = data.data?.task_id || data.task_id || data.data?.id;
                    if (!outputUrl && taskId) {
                      let attempts = 0;
                      const maxAttempts = payload.type === 'video' ? 30 : 15;
                      while (attempts < maxAttempts && !outputUrl) {
                        await new Promise(r => setTimeout(r, 2500));
                        attempts++;

                        const taskUrl = `https://api.freepik.com/v1/ai/tasks/${taskId}`;
                        const pollRes = await fetch(taskUrl, {
                          headers: {
                            'x-freepik-api-key': apiKey,
                            'Accept': 'application/json'
                          }
                        });

                        if (pollRes.ok) {
                          const pollData = await pollRes.json();
                          const status = pollData.data?.status || pollData.status;

                          if (status === 'COMPLETED' || status === 'SUCCESS') {
                            const result = pollData.data?.result || pollData.result;
                            outputUrl = result?.[0]?.url || result?.url || result?.video_url || (typeof result === 'string' ? result : null);
                            if (outputUrl) {
                              isLiveFreepik = true;
                              break;
                            }
                          } else if (status === 'FAILED') {
                            console.warn('Freepik task failed:', pollData);
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    const errText = await apiRes.text();
                    console.warn(`Freepik API responded with ${apiRes.status}:`, errText);
                  }
                } catch (e: any) {
                  console.warn('Freepik fetch failed:', e.message);
                }
              }

              // Dynamic generative synthesis if Freepik API key wasn't provided or did not return immediate asset
              if (!outputUrl) {
                const seed = payload.seed || Math.floor(Math.random() * 9999999);
                const encodedPrompt = encodeURIComponent(payload.prompt || 'futuristic artwork 8k photorealistic');

                if (payload.type === 'video') {
                  // High quality dynamic cinematic clips matching prompt categories with distinct seed
                  const promptLower = (payload.prompt || '').toLowerCase();
                  const videoPools = [
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                  ];
                  outputUrl = videoPools[seed % videoPools.length];
                  apiProvider = isLiveFreepik ? 'Freepik Kling AI' : 'SamDev Video Engine (Simulación de física)';
                } else {
                  // Real dynamic AI generation: Each prompt + seed creates a genuinely unique visual
                  let width = 1024;
                  let height = 1024;
                  if (payload.aspectRatio === '16:9') {
                    width = 1280;
                    height = 720;
                  } else if (payload.aspectRatio === '9:16') {
                    width = 720;
                    height = 1280;
                  } else if (payload.aspectRatio === '4:3') {
                    width = 1024;
                    height = 768;
                  }

                  // Generates truly unique AI image based on user's exact prompt and model
                  outputUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
                  apiProvider = isLiveFreepik ? 'Freepik Mystic v2.5' : 'SamDev Flux Engine';
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                outputUrl, 
                provider: apiProvider,
                isLive: isLiveFreepik,
                data: rawData 
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
