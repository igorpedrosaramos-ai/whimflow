import { Board, MindMapNode, BoardCategory } from '../types';

export const STORAGE_KEY = 'whimflow_boards_v6';
export const LEGACY_STORAGE_KEY = 'whimflow_boards_v5';
export const ACTIVE_BOARD_KEY = 'whimflow_active_board_id';
export const CURRENT_VIEW_KEY = 'whimflow_current_view';
export const THEME_KEY = 'whimflow_theme';
export const CATEGORIES_KEY = 'whimflow_board_categories_v1';

export const DEFAULT_CATEGORIES: BoardCategory[] = [
  { id: 'cat-marketing', name: 'Marketing & Vendas', color: '#f97316' },
  { id: 'cat-produto', name: 'Design & Produto', color: '#8b5cf6' },
  { id: 'cat-operacoes', name: 'Estratégia & Operações', color: '#10b981' }
];

export function loadCategories(): BoardCategory[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Erro ao carregar categorias:', e);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: BoardCategory[]): void {
  if (typeof window === 'undefined' || !Array.isArray(categories)) return;
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn('Erro ao salvar categorias:', e);
  }
}

const DB_NAME = 'whimflow_indexeddb';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';
const BOARDS_DOC_ID = 'all_boards_payload';

// Sanitiza e normaliza nós do mapa mental
export function cleanAndNormalizeMindMap(nodes: MindMapNode[] | undefined): MindMapNode[] {
  if (!nodes || !Array.isArray(nodes)) return [];
  return nodes
    .filter(n => n && typeof n.id === 'string' && n.text !== undefined && n.text !== null)
    .map(n => ({
      ...n,
      text: typeof n.text === 'string' ? n.text : String(n.text || ''),
      childrenIds: Array.isArray(n.childrenIds) ? n.childrenIds.filter(Boolean) : [],
      width: n.width || 200,
      height: n.height || 42,
      x: typeof n.x === 'number' ? n.x : 0,
      y: typeof n.y === 'number' ? n.y : 0
    }));
}

// Inicializa ou abre conexão com IndexedDB
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result as IDBDatabase);
      };

      request.onerror = (err) => {
        console.warn('[Storage] IndexedDB indisponível, usando localStorage:', err);
        resolve(null);
      };
    } catch (e) {
      console.warn('[Storage] Falha ao inicializar IndexedDB:', e);
      resolve(null);
    }
  });
}

/**
 * Salva boards no IndexedDB com fallback e sincronização no localStorage
 */
export async function saveBoards(boards: Board[]): Promise<void> {
  if (!Array.isArray(boards)) return;

  // 1. Sempre tenta salvar no IndexedDB (ilimitado, assíncrono, não trava a UI)
  try {
    const db = await openIndexedDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.put(boards, BOARDS_DOC_ID);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e);
      });
    }
  } catch (idbErr) {
    console.warn('[Storage] Erro ao gravar no IndexedDB:', idbErr);
  }

  // 2. Salva também no localStorage (garante compatibilidade síncrona imediata)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (lsErr: any) {
    // Se estourar a cota de 5MB do localStorage, tenta salvar versão compactada sem snapshots pesados
    if (lsErr?.name === 'QuotaExceededError' || lsErr?.code === 22) {
      try {
        const stripped = boards.map(b => ({
          ...b,
          historySnapshots: [] // Remove snapshots pesados para caber no localStorage
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      } catch (retryErr) {
        console.warn('[Storage] LocalStorage cheio. Dados protegidos no IndexedDB.');
      }
    }
  }
}

/**
 * Carrega boards: tenta primeiro IndexedDB, depois localStorage, garantindo recuperação total
 */
export async function loadBoards(): Promise<Board[] | null> {
  // 1. Tenta carregar do IndexedDB
  try {
    const db = await openIndexedDB();
    if (db) {
      const idbData = await new Promise<Board[] | null>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(BOARDS_DOC_ID);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });

      if (idbData && Array.isArray(idbData) && idbData.length > 0) {
        return idbData.map(b => ({
          ...b,
          mindMapNodes: cleanAndNormalizeMindMap(b.mindMapNodes)
        }));
      }
    }
  } catch (e) {
    console.warn('[Storage] Falha ao ler do IndexedDB:', e);
  }

  // 2. Fallback para localStorage
  return loadBoardsSync();
}

/**
 * Leitura síncrona inicial de fallback do localStorage
 */
export function loadBoardsSync(): Board[] | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((b: Board) => ({
        ...b,
        mindMapNodes: cleanAndNormalizeMindMap(b.mindMapNodes)
      }));
    }
  } catch (e) {
    console.warn('[Storage] Erro ao carregar do localStorage:', e);
  }
  return null;
}

// Debounce utilitário para salvamento contínuo
let saveTimer: any = null;
export function debouncedSaveBoards(boards: Board[], delay = 350): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveBoards(boards).catch(err => console.error('[Storage] Erro no save debounced:', err));
  }, delay);
}

// Persistência do ID do quadro ativo
export function saveActiveBoardId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_BOARD_KEY, id);
  } catch (e) {}
}

export function loadActiveBoardId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_BOARD_KEY);
  } catch (e) {
    return null;
  }
}

// Persistência da tela atual (canvas, doc, dashboard)
export function saveCurrentView(view: string): void {
  try {
    localStorage.setItem(CURRENT_VIEW_KEY, view);
  } catch (e) {}
}

export function loadCurrentView(): string | null {
  try {
    return localStorage.getItem(CURRENT_VIEW_KEY);
  } catch (e) {
    return null;
  }
}
