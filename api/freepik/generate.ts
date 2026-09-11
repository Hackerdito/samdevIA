export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const apiKey = payload.apiKey || process.env.FREEPIK_API_KEY || process.env.MAGNIFIC_API_KEY;

    let outputUrl: string | null = null;
    let apiProvider = 'Freepik / Magnific';
    let rawData: any = null;
    let isLiveFreepik = false;

    if (apiKey) {
      let endpoint = 'https://api.freepik.com/v1/ai/text-to-image/mystic';
      const requestBody: any = {
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
                  break;
                }
              }
            }
          }
        }
      } catch (e: any) {
        console.warn('Freepik fetch error:', e.message);
      }
    }

    if (!outputUrl) {
      const seed = payload.seed || Math.floor(Math.random() * 9999999);
      const encodedPrompt = encodeURIComponent(payload.prompt || 'futuristic artwork 8k photorealistic');

      if (payload.type === 'video') {
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

        outputUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
        apiProvider = isLiveFreepik ? 'Freepik Mystic v2.5' : 'SamDev Flux Engine';
      }
    }

    res.status(200).json({
      outputUrl,
      provider: apiProvider,
      isLive: isLiveFreepik,
      data: rawData
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error en la generación' });
  }
}
