// Handler serverless para persistência e recuperação em nuvem do Mapa Mental Turbine
import { MIGRATED_WHIMFLOW_BOARDS } from '../src/constants/migratedBoards';

// Armazenamento em memória do worker (com fallback para requisições de mesma sessão)
let inMemoryBoardsCache: any[] = [...MIGRATED_WHIMFLOW_BOARDS];
let inMemoryCategoriesCache: any[] = [];
let inMemoryWorkspacesCache: any[] = [];

export default async function handler(req: any, res: any) {
  const method = req.method;
  const url = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`);
  const type = url.searchParams.get('type') || req.body?.type || 'boards';

  // Configuração CORS segura
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const payload = body?.payload;

      if (!Array.isArray(payload)) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Payload deve ser um array válido' }));
        return;
      }

      if (type === 'boards') {
        inMemoryBoardsCache = payload;
      } else if (type === 'categories') {
        inMemoryCategoriesCache = payload;
      } else if (type === 'workspaces') {
        inMemoryWorkspacesCache = payload;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        count: payload.length,
        syncedAt: new Date().toISOString()
      }));
      return;
    }

    if (method === 'GET') {
      let data: any[] = [];
      if (type === 'boards') data = inMemoryBoardsCache;
      else if (type === 'categories') data = inMemoryCategoriesCache;
      else if (type === 'workspaces') data = inMemoryWorkspacesCache;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        type,
        data,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Método não suportado' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Erro interno de sincronização' }));
  }
}
