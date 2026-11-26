import { Board, Workspace, BoardCategory } from '../types';
import { supabase, isDatabaseConfigured } from '../lib/supabaseClient';
import { cleanAndNormalizeMindMap } from './storageService';

export interface CloudSyncStatus {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  target: 'supabase' | 'serverless' | 'local-only';
  message: string;
}

let syncStatusListeners: Array<(status: CloudSyncStatus) => void> = [];
let currentStatus: CloudSyncStatus = {
  lastSyncedAt: null,
  status: 'idle',
  target: isDatabaseConfigured ? 'supabase' : 'serverless',
  message: 'Pronto para sincronização'
};

export function subscribeToSyncStatus(listener: (status: CloudSyncStatus) => void) {
  syncStatusListeners.push(listener);
  listener(currentStatus);
  return () => {
    syncStatusListeners = syncStatusListeners.filter(l => l !== listener);
  };
}

function notifyStatus(update: Partial<CloudSyncStatus>) {
  currentStatus = { ...currentStatus, ...update };
  syncStatusListeners.forEach(l => l(currentStatus));
}

export function getCurrentSyncStatus(): CloudSyncStatus {
  return currentStatus;
}

/**
 * Converte Board da aplicação para o schema do banco mm_boards
 */
function toDbBoard(b: Board) {
  return {
    id: b.id,
    workspace_id: b.workspaceId || 'ws-teste',
    category_id: b.categoryId || null,
    title: b.title || 'Sem Título',
    layout_type: b.layoutType || 'bidirectional',
    mind_map_nodes: cleanAndNormalizeMindMap(b.mindMapNodes),
    sticky_notes: Array.isArray(b.stickies) ? b.stickies : [],
    shapes: Array.isArray(b.shapes) ? b.shapes : [],
    connections: Array.isArray(b.connectors) ? b.connectors : [],
    is_favorite: Boolean(b.isStarred),
    archived: false,
    updated_at: new Date().toISOString()
  };
}

/**
 * Converte registro do banco mm_boards para o modelo Board da aplicação
 */
function fromDbBoard(row: any): Board {
  return {
    id: row.id,
    title: row.title || 'Sem Título',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    workspaceId: row.workspace_id || 'ws-teste',
    categoryId: row.category_id || undefined,
    layoutType: row.layout_type || 'bidirectional',
    mindMapNodes: cleanAndNormalizeMindMap(row.mind_map_nodes),
    stickies: Array.isArray(row.sticky_notes) ? row.sticky_notes : [],
    shapes: Array.isArray(row.shapes) ? row.shapes : [],
    connectors: Array.isArray(row.connections) ? row.connections : [],
    wireframes: [],
    texts: [],
    drawings: [],
    isStarred: Boolean(row.is_favorite),
    historySnapshots: []
  };
}

/**
 * Envia quadros para o banco de dados na nuvem
 */
export async function pushBoardsToCloud(boards: Board[]): Promise<boolean> {
  if (!Array.isArray(boards) || boards.length === 0) return true;

  notifyStatus({ status: 'syncing', message: 'Salvando quadros na nuvem...' });

  // 1. Tenta sincronizar via Supabase dedicado se configurado
  if (isDatabaseConfigured && supabase) {
    try {
      const records = boards.map(toDbBoard);
      const { error } = await supabase
        .from('mm_boards')
        .upsert(records, { onConflict: 'id' });

      if (!error) {
        notifyStatus({
          status: 'synced',
          target: 'supabase',
          lastSyncedAt: new Date().toISOString(),
          message: `${boards.length} quadros salvos no banco Supabase.`
        });
        return true;
      }
      console.warn('[CloudSync] Erro no Supabase:', error);
    } catch (sbErr) {
      console.warn('[CloudSync] Falha ao enviar para Supabase:', sbErr);
    }
  }

  // 2. Fallback resiliente: envia para API serverless do Mapa Mental Turbine
  try {
    const res = await fetch('/api/db-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'boards', payload: boards })
    });

    if (res.ok) {
      notifyStatus({
        status: 'synced',
        target: 'serverless',
        lastSyncedAt: new Date().toISOString(),
        message: `${boards.length} quadros sincronizados na nuvem.`
      });
      return true;
    }
  } catch (apiErr) {
    // API indisponível offline, dados continuam protegidos localmente
  }

  notifyStatus({
    status: 'offline',
    message: 'Nuvem indisponível no momento. Quadros salvos localmente.'
  });
  return false;
}

/**
 * Busca quadros do banco de dados na nuvem
 */
export async function fetchBoardsFromCloud(): Promise<Board[] | null> {
  // 1. Tenta recuperar do Supabase
  if (isDatabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('mm_boards')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(fromDbBoard);
      }
    } catch (e) {
      console.warn('[CloudSync] Erro ao buscar do Supabase:', e);
    }
  }

  // 2. Tenta recuperar da API serverless
  try {
    const res = await fetch('/api/db-sync?type=boards');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((b: any) => ({
          ...b,
          mindMapNodes: cleanAndNormalizeMindMap(b.mindMapNodes)
        }));
      }
    }
  } catch {
    // Silencioso em caso de offline
  }

  return null;
}

/**
 * Envia workspaces para a nuvem
 */
export async function pushWorkspacesToCloud(workspaces: Workspace[]): Promise<boolean> {
  if (!isDatabaseConfigured || !supabase || !Array.isArray(workspaces)) return false;
  try {
    const records = workspaces.map(w => ({ id: w.id, name: w.name, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('mm_workspaces').upsert(records, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Busca workspaces da nuvem
 */
export async function fetchWorkspacesFromCloud(): Promise<Workspace[] | null> {
  if (!isDatabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('mm_workspaces').select('id, name');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Silencioso
  }
  return null;
}

/**
 * Envia categorias para a nuvem
 */
export async function pushCategoriesToCloud(categories: BoardCategory[]): Promise<boolean> {
  if (!isDatabaseConfigured || !supabase || !Array.isArray(categories)) return false;
  try {
    const records = categories.map(c => ({ id: c.id, name: c.name, color: c.color, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('mm_categories').upsert(records, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Busca categorias da nuvem
 */
export async function fetchCategoriesFromCloud(): Promise<BoardCategory[] | null> {
  if (!isDatabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from('mm_categories').select('id, name, color');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Silencioso
  }
  return null;
}
