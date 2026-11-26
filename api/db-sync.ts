// Handler serverless para persistência e recuperação em nuvem do Mapa Mental Turbine

let inMemoryBoardsCache: any[] = [];
let inMemoryCategoriesCache: any[] = [];
let inMemoryWorkspacesCache: any[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : (res.statusCode = 200, res.end());
  }

  const queryType = req.query?.type || (req.url && req.url.includes('type=categories') ? 'categories' : (req.url && req.url.includes('type=workspaces') ? 'workspaces' : 'boards'));

  try {
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          if (res.status) return res.status(400).json({ error: 'JSON de requisição inválido.' });
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'JSON de requisição inválido.' }));
        }
      }

      const type = body?.type || queryType;
      const payload = body?.payload;

      if (!Array.isArray(payload)) {
        if (res.status) return res.status(400).json({ error: 'Payload deve ser um array válido.' });
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Payload deve ser um array válido.' }));
      }

      if (type === 'boards') {
        inMemoryBoardsCache = payload;
      } else if (type === 'categories') {
        inMemoryCategoriesCache = payload;
      } else if (type === 'workspaces') {
        inMemoryWorkspacesCache = payload;
      }

      const responsePayload = {
        success: true,
        type,
        count: payload.length,
        syncedAt: new Date().toISOString()
      };

      if (res.status) return res.status(200).json(responsePayload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(responsePayload));
    }

    if (req.method === 'GET') {
      let data: any[] = [];
      if (queryType === 'boards') data = inMemoryBoardsCache;
      else if (queryType === 'categories') data = inMemoryCategoriesCache;
      else if (queryType === 'workspaces') data = inMemoryWorkspacesCache;

      const responsePayload = {
        success: true,
        type: queryType,
        data,
        timestamp: new Date().toISOString()
      };

      if (res.status) return res.status(200).json(responsePayload);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(responsePayload));
    }

    if (res.status) return res.status(405).json({ error: 'Método não suportado. Utilize GET ou POST.' });
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Método não suportado.' }));
  } catch (err: any) {
    if (res.status) return res.status(500).json({ error: err.message || 'Erro interno de sincronização.' });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err.message || 'Erro interno de sincronização.' }));
  }
}
