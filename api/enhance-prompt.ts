export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { prompt, engine = 'mystic', type = 'image' } = payload;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      res.status(200).json({ enhanced: prompt });
      return;
    }

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
    res.status(200).json({ enhanced: enhancedText });
  } catch (err: any) {
    console.error('Enhance prompt error:', err);
    res.status(500).json({ error: err.message });
  }
}
