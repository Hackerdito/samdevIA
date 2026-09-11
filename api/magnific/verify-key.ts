export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const key = payload.apiKey || process.env.MAGNIFIC_API_KEY || process.env.FREEPIK_API_KEY;

    if (!key) {
      res.status(400).json({ valid: false, error: 'No se proporcionó clave de API' });
      return;
    }

    let testRes = await fetch('https://api.magnific.com/v1/resources?page=1&limit=1', {
      headers: {
        'x-magnific-api-key': key,
        'x-freepik-api-key': key,
        'Accept': 'application/json'
      }
    }).catch(() => null);

    if (!testRes || testRes.status === 404) {
      testRes = await fetch('https://api.freepik.com/v1/resources?page=1&limit=1', {
        headers: {
          'x-freepik-api-key': key,
          'Accept': 'application/json'
        }
      }).catch(() => null);
    }

    if (testRes && (testRes.status === 401 || testRes.status === 403)) {
      res.status(200).json({
        valid: false,
        error: 'Clave rechazada por la API de Magnific (401/403 no autorizada). Verifica tu clave en https://www.magnific.com/user/organization/api-keys'
      });
      return;
    }

    res.status(200).json({ valid: true, message: 'Clave de Magnific API conectada correctamente' });
  } catch (err: any) {
    res.status(200).json({ valid: false, error: err.message });
  }
}
