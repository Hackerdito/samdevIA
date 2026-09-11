export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const key = payload.apiKey || process.env.FREEPIK_API_KEY || process.env.MAGNIFIC_API_KEY;

    if (!key) {
      res.status(400).json({ valid: false, error: 'No se proporcionó clave API' });
      return;
    }

    const testRes = await fetch('https://api.freepik.com/v1/resources?page=1&limit=1', {
      headers: {
        'x-freepik-api-key': key,
        'Accept': 'application/json'
      }
    });

    if (testRes.status === 401 || testRes.status === 403) {
      res.status(200).json({ 
        valid: false, 
        error: 'Clave API rechazada por Freepik (401/403 no autorizada). Verifica que esté activa en tu panel de Freepik Developer.' 
      });
      return;
    }

    res.status(200).json({ valid: true, message: 'Clave API válida y conectada a Freepik / Magnific' });
  } catch (err: any) {
    res.status(200).json({ valid: false, error: err.message });
  }
}
