export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const key = payload.apiKey || process.env.MAGNIFIC_API_KEY || process.env.FREEPIK_API_KEY;

    if (!key) {
      res.status(400).json({ error: 'No se encontró clave API de Magnific' });
      return;
    }

    const analyticsRes = await fetch('https://api.magnific.com/v1/analytics/team-credit-usage', {
      method: 'POST',
      headers: {
        'x-magnific-api-key': key,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        start_date: payload.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: payload.endDate || new Date().toISOString().split('T')[0]
      })
    });

    if (!analyticsRes.ok) {
      const errData = await analyticsRes.json().catch(() => ({}));
      res.status(analyticsRes.status).json({ 
        error: errData.message || 'El endpoint POST /v1/analytics/team-credit-usage requiere suscripción Business o Enterprise en Magnific.',
        status: analyticsRes.status
      });
      return;
    }

    const data = await analyticsRes.json();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
