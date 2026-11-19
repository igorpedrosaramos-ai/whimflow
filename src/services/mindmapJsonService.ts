import { MindMapNode, Board } from '../types';
import { estimateNodeDimensions } from '../utils/treeLayout';
import { layoutNodes } from './agentEngine';

export interface ParsedMindMapResult {
  success: boolean;
  title: string;
  nodes: MindMapNode[];
  board?: Partial<Board>;
  boards?: Board[];
  error?: string;
  sourceFormat: 'whimflow-board' | 'whimflow-backup' | 'nodes-array' | 'nested-tree' | 'generic-nodes' | 'unknown';
}

const DEFAULT_COLORS = ['#0284c7', '#7c3aed', '#0d9488', '#ea580c', '#e11d48', '#2563eb'];

/**
 * Normaliza e recalcula posições caso estejam ausentes ou zeradas
 */
function normalizeAndLayoutNodes(nodes: MindMapNode[]): MindMapNode[] {
  if (!nodes || nodes.length === 0) return [];

  // Garante integridade referencial de IDs
  const existingIds = new Set(nodes.map(n => n.id));
  const rootNode = nodes.find(n => n.parentId === null) || nodes[0];
  const rootId = rootNode.id;

  // Corrige nós com parentId inválido
  const fixedNodes = nodes.map(n => {
    let pId = n.parentId;
    if (n.id !== rootId && (!pId || !existingIds.has(pId))) {
      pId = rootId;
    }
    return {
      ...n,
      parentId: n.id === rootId ? null : pId
    };
  });

  // Reconstrói childrenIds
  const childrenMap = new Map<string, string[]>();
  fixedNodes.forEach(n => {
    if (n.parentId) {
      const current = childrenMap.get(n.parentId) || [];
      if (!current.includes(n.id)) {
        current.push(n.id);
        childrenMap.set(n.parentId, current);
      }
    }
  });

  const hydratedNodes: MindMapNode[] = fixedNodes.map((n, idx) => {
    const dims = estimateNodeDimensions(n);
    return {
      ...n,
      childrenIds: childrenMap.get(n.id) || [],
      width: n.width && n.width > 30 ? n.width : dims.width,
      height: n.height && n.height > 20 ? n.height : dims.height,
      color: n.color || (n.id === rootId ? '#7c3aed' : DEFAULT_COLORS[idx % DEFAULT_COLORS.length]),
      side: n.id === rootId ? 'root' : (n.side || (idx % 2 === 0 ? 'right' : 'left'))
    };
  });

  // Se todas as posições x, y forem 0 ou idênticas, calcula layout automaticamente
  const allZero = hydratedNodes.every(n => (n.x === 0 || n.x === undefined) && (n.y === 0 || n.y === undefined));
  if (allZero || hydratedNodes.length > 1) {
    try {
      return layoutNodes(hydratedNodes);
    } catch {
      return hydratedNodes;
    }
  }

  return hydratedNodes;
}

/**
 * Converte árvore aninhada (formato nested JSON) em lista de MindMapNode[]
 */
function parseNestedTree(rawTree: any, fallbackTitle?: string): MindMapNode[] {
  const nodes: MindMapNode[] = [];
  let counter = 0;

  function traverse(item: any, parentId: string | null, depth: number): string {
    counter++;
    const id = item.id || `node-${counter}-${Date.now()}`;
    const text = item.text || item.title || item.name || item.label || (depth === 0 ? (fallbackTitle || 'Ideia Central') : `Tópico ${counter}`);
    const color = item.color || (depth === 0 ? '#7c3aed' : DEFAULT_COLORS[counter % DEFAULT_COLORS.length]);

    const node: MindMapNode = {
      id,
      text: String(text),
      parentId,
      childrenIds: [],
      x: typeof item.x === 'number' ? item.x : 0,
      y: typeof item.y === 'number' ? item.y : 0,
      width: item.width || 180,
      height: item.height || 40,
      color,
      side: depth === 0 ? 'root' : (counter % 2 === 0 ? 'right' : 'left')
    };

    nodes.push(node);

    const children = item.children || item.nodes || item.subtopics || item.items;
    if (Array.isArray(children)) {
      children.forEach((childItem: any) => {
        const childId = traverse(childItem, id, depth + 1);
        node.childrenIds.push(childId);
      });
    }

    return id;
  }

  traverse(rawTree, null, 0);
  return normalizeAndLayoutNodes(nodes);
}

/**
 * Parser Universal de Arquivo JSON de Mapa Mental
 */
export function parseMindMapJson(jsonString: string, defaultTitle = 'Mapa Mental Importado'): ParsedMindMapResult {
  try {
    const data = JSON.parse(jsonString);

    if (!data) {
      return {
        success: false,
        title: defaultTitle,
        nodes: [],
        error: 'O arquivo JSON está vazio ou é inválido.',
        sourceFormat: 'unknown'
      };
    }

    // 1. Caso: Backup Completo Whimflow (contém lista de quadros `boards`)
    if (Array.isArray(data.boards) && data.boards.length > 0) {
      const firstBoard = data.boards[0];
      const nodes = Array.isArray(firstBoard.mindMapNodes) ? normalizeAndLayoutNodes(firstBoard.mindMapNodes) : [];
      return {
        success: true,
        title: firstBoard.title || defaultTitle,
        nodes,
        board: firstBoard,
        boards: data.boards,
        sourceFormat: 'whimflow-backup'
      };
    }

    // 2. Caso: Objeto de Quadro Whimflow (`mindMapNodes` presente)
    if (Array.isArray(data.mindMapNodes)) {
      const nodes = normalizeAndLayoutNodes(data.mindMapNodes);
      return {
        success: true,
        title: data.title || defaultTitle,
        nodes,
        board: data,
        sourceFormat: 'whimflow-board'
      };
    }

    // 3. Caso: Objeto genérico com array `nodes`
    if (Array.isArray(data.nodes) && data.nodes.length > 0) {
      // Verifica se os nós são planos ou aninhados
      const isFlat = typeof data.nodes[0] === 'object' && ('parentId' in data.nodes[0] || 'id' in data.nodes[0]);
      if (isFlat) {
        const nodes = normalizeAndLayoutNodes(data.nodes.map((n: any, idx: number) => ({
          id: String(n.id || `node-${idx}`),
          text: String(n.text || n.title || n.label || n.name || `Tópico ${idx}`),
          parentId: n.parentId ? String(n.parentId) : null,
          childrenIds: Array.isArray(n.childrenIds) ? n.childrenIds.map(String) : [],
          x: typeof n.x === 'number' ? n.x : 0,
          y: typeof n.y === 'number' ? n.y : 0,
          color: n.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
          side: n.side || (idx % 2 === 0 ? 'right' : 'left'),
          width: n.width || 180,
          height: n.height || 40
        })));

        return {
          success: true,
          title: data.title || data.name || defaultTitle,
          nodes,
          sourceFormat: 'generic-nodes'
        };
      }
    }

    // 4. Caso: Array direto de nós na raiz do JSON (`[ { id, text, parentId }, ... ]`)
    if (Array.isArray(data) && data.length > 0) {
      const nodes = normalizeAndLayoutNodes(data.map((n: any, idx: number) => ({
        id: String(n.id || `node-${idx}`),
        text: String(n.text || n.title || n.label || n.name || `Item ${idx}`),
        parentId: n.parentId ? String(n.parentId) : null,
        childrenIds: Array.isArray(n.childrenIds) ? n.childrenIds.map(String) : [],
        x: typeof n.x === 'number' ? n.x : 0,
        y: typeof n.y === 'number' ? n.y : 0,
        color: n.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        side: n.side || (idx % 2 === 0 ? 'right' : 'left'),
        width: n.width || 180,
        height: n.height || 40
      })));

      const rootNode = nodes.find(n => n.parentId === null) || nodes[0];
      return {
        success: true,
        title: rootNode?.text || defaultTitle,
        nodes,
        sourceFormat: 'nodes-array'
      };
    }

    // 5. Caso: Árvore hierárquica aninhada (`{ text: '...', children: [...] }`)
    if (typeof data === 'object' && (data.text || data.title || data.name || data.label || data.children)) {
      const title = data.text || data.title || data.name || data.label || defaultTitle;
      const nodes = parseNestedTree(data, title);
      return {
        success: true,
        title,
        nodes,
        sourceFormat: 'nested-tree'
      };
    }

    return {
      success: false,
      title: defaultTitle,
      nodes: [],
      error: 'O formato do JSON não contém uma estrutura de mapa mental reconhecível.',
      sourceFormat: 'unknown'
    };
  } catch (err: any) {
    return {
      success: false,
      title: defaultTitle,
      nodes: [],
      error: `Erro ao processar JSON: ${err.message || 'Sintaxe inválida'}`,
      sourceFormat: 'unknown'
    };
  }
}

/**
 * Lê e analisa um arquivo File do navegador
 */
export function readJsonFile(file: File): Promise<ParsedMindMapResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve({
        success: false,
        title: 'Sem arquivo',
        nodes: [],
        error: 'Nenhum arquivo fornecido.',
        sourceFormat: 'unknown'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const fallbackTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const parsed = parseMindMapJson(content, fallbackTitle);
      resolve(parsed);
    };
    reader.onerror = () => {
      reject(new Error('Falha ao ler o arquivo selecionado.'));
    };
    reader.readAsText(file);
  });
}
