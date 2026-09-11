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

        if (req.url === '/api/freepik/generate' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const apiKey = payload.apiKey || process.env.FREEPIK_API_KEY || process.env.MAGNIFIC_API_KEY;

              if (!apiKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'No Freepik / Magnific API Key provided' }));
                return;
              }

              // Map engine to Freepik API endpoint
              let endpoint = 'https://api.freepik.com/v1/ai/text-to-image/mystic';
              let requestBody: any = {
                prompt: payload.prompt,
                aspect_ratio: payload.aspectRatio === '16:9' ? 'widescreen_16_9' : 
                              payload.aspectRatio === '9:16' ? 'portrait_9_16' : 
                              payload.aspectRatio === '4:3' ? 'landscape_4_3' : 'square_1_1'
              };

              if (payload.type === 'video') {
                if (payload.engine === 'kling-1-5') {
                  endpoint = 'https://api.freepik.com/v1/ai/text-to-video/kling-v1-5';
                } else if (payload.engine === 'minimax-hailuo') {
                  endpoint = 'https://api.freepik.com/v1/ai/text-to-video/minimax';
                } else {
                  endpoint = 'https://api.freepik.com/v1/ai/text-to-video/kling-v1-5';
                }
              } else {
                if (payload.engine === 'flux-pro') {
                  endpoint = 'https://api.freepik.com/v1/ai/text-to-image/flux-pro';
                } else if (payload.engine === 'recraft-v3') {
                  endpoint = 'https://api.freepik.com/v1/ai/text-to-image/recraft-v3';
                } else if (payload.engine === 'imagen-3') {
                  endpoint = 'https://api.freepik.com/v1/ai/text-to-image/imagen-3';
                }
              }

              const apiRes = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-freepik-api-key': apiKey,
                  'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
              });

              if (!apiRes.ok) {
                const errData = await apiRes.text();
                res.statusCode = apiRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Freepik API responded with: ${errData}` }));
                return;
              }

              const data = await apiRes.json();
              const outputUrl = data.data?.[0]?.url || data.url || data.video_url || data.image_url;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ data, outputUrl }));
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
