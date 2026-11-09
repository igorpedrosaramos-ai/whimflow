import { MindMapNode } from '../types';

export interface ComputedNodeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight: number;
}

/**
 * Calcula a largura estimada do nó baseada no tamanho do texto
 * Garante que o texto fique em linha única limpa (sem quebras estranhas)
 */
export function estimateNodeDimensions(node: MindMapNode): { width: number; height: number } {
  if (node.side === 'root') {
    const textLen = (node.text || '').length;
    const iconPadding = node.icon ? 24 : 0;
    return { width: Math.max(180, Math.round(textLen * 9.5 + 56 + iconPadding)), height: 48 };
  }
  const text = node.text || '';
  const textLen = text.length;
  if (textLen === 0) {
    return { width: 100, height: 38 };
  }

  // Medição proporcional precisa sem corte arbitrário (zero sobreposição com nós-filhos)
  // ~8.8px por caractere no corpo 13.5px com folga de padding lateral e possíveis badges
  const hasChildBadge = Boolean(node.childrenIds && node.childrenIds.length > 0 && node.collapsed);
  const badgePadding = hasChildBadge ? 36 : 0;
  const iconPadding = node.icon ? 22 : 0;
  const linkPadding = node.link ? 20 : 0;
  const charMultiplier = node.fontSize === 'small' ? 7.8 : node.fontSize === 'large' ? 10.2 : (node.bold ? 9.4 : 8.8);
  const basePadding = 42; // 14px padding esquerdo + 14px padding direito + folga segura

  const width = Math.max(110, Math.round(textLen * charMultiplier + basePadding + badgePadding + iconPadding + linkPadding));
  const height = node.fontSize === 'large' ? 44 : node.fontSize === 'small' ? 34 : 38;
  return { width, height };
}

/**
 * Algoritmo Tidy Tree Horizontal para Mapas Mentais (Idêntico ao Whimsical)
 * Calcula recursivamente a altura de cada ramificação e distribui os nós
 * garantindo ZERO sobreposição, 100% de responsividade e conexões contínuas.
 */
export function calculateMindMapLayout(
  nodes: MindMapNode[],
  rootId: string = 'root',
  options: {
    horizontalGap?: number;
    verticalGap?: number;
    rootX?: number;
    rootY?: number;
  } = {}
): Map<string, ComputedNodeLayout> {
  const horizontalGap = options.horizontalGap ?? 100;
  const verticalGap = options.verticalGap ?? 18;
  const rootX = options.rootX ?? 0;
  const rootY = options.rootY ?? 0;

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const rootNode = nodeMap.get(rootId) || nodes.find(n => n.side === 'root') || nodes[0];
  if (!rootNode) return new Map();
  const effectiveRootId = rootNode.id;

  // Sanitização e normalização robusta da hierarquia da árvore:
  // Constrói uma relação pai->filhos estritamente consistente
  const childrenMap = new Map<string, string[]>();
  nodes.forEach(n => {
    // Começa com os filhos declarados válidos
    const valid = (n.childrenIds || []).filter(cid => cid !== n.id && nodeMap.has(cid));
    childrenMap.set(n.id, [...new Set(valid)]);
  });

  // Sincroniza parentId -> children: se child.parentId === parent.id, adiciona na lista
  nodes.forEach(child => {
    if (child.id === effectiveRootId) return;
    if (child.parentId && nodeMap.has(child.parentId)) {
      const parentChildren = childrenMap.get(child.parentId) || [];
      if (!parentChildren.includes(child.id)) {
        parentChildren.push(child.id);
        childrenMap.set(child.parentId, parentChildren);
      }
    }
  });

  // Previne nós órfãos: se algum nó não-raiz não estiver em nenhum ramo acessível a partir da raiz,
  // conecta-o à raiz para garantir que NUNCA fique sobreposto ou invisível
  const visited = new Set<string>();
  function markReachable(id: string) {
    visited.add(id);
    const cids = childrenMap.get(id) || [];
    cids.forEach(cid => {
      if (!visited.has(cid)) markReachable(cid);
    });
  }
  markReachable(effectiveRootId);

  nodes.forEach(n => {
    if (n.id !== effectiveRootId && !visited.has(n.id)) {
      // Anexa nó órfão à raiz
      const rootChildren = childrenMap.get(effectiveRootId) || [];
      if (!rootChildren.includes(n.id)) {
        rootChildren.push(n.id);
        childrenMap.set(effectiveRootId, rootChildren);
      }
    }
  });

  const layoutMap = new Map<string, ComputedNodeLayout>();

  // Passo 1: Pós-Ordem - Calcular a altura de cada subárvore recursivamente
  function computeSubtreeHeight(nodeId: string): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const { width, height } = estimateNodeDimensions(node);
    const childrenIds = childrenMap.get(nodeId) || [];

    // Se estiver colapsado ou for folha
    if (node.collapsed || childrenIds.length === 0) {
      const subtreeHeight = height + verticalGap;
      layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
      return subtreeHeight;
    }

    let childrenTotalHeight = 0;
    childrenIds.forEach(childId => {
      childrenTotalHeight += computeSubtreeHeight(childId);
    });

    const subtreeHeight = Math.max(height + verticalGap, childrenTotalHeight);
    layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
    return subtreeHeight;
  }

  computeSubtreeHeight(effectiveRootId);

  // Passo 2: Pré-Ordem - Posicionar nós na grade horizontal com base na altura calculada
  const rootLayout = layoutMap.get(effectiveRootId)!;
  if (rootLayout) {
    rootLayout.x = rootX;
    rootLayout.y = rootY;
  }

  function positionChildren(parentId: string) {
    const parent = nodeMap.get(parentId);
    const parentLayout = layoutMap.get(parentId);
    if (!parent || !parentLayout || parent.collapsed) return;

    const childrenIds = childrenMap.get(parentId) || [];
    if (childrenIds.length === 0) return;

    let totalChildrenHeight = 0;
    childrenIds.forEach(cid => {
      const childLayout = layoutMap.get(cid);
      if (childLayout) totalChildrenHeight += childLayout.subtreeHeight;
    });

    // Centraliza os ramos-filhos no eixo Y relativo ao pai
    const parentCenterY = parentLayout.y + parentLayout.height / 2;
    let currentY = parentCenterY - totalChildrenHeight / 2;

    childrenIds.forEach(cid => {
      const child = nodeMap.get(cid);
      const childLayout = layoutMap.get(cid);
      if (!child || !childLayout) return;

      const childCenterY = currentY + childLayout.subtreeHeight / 2;
      childLayout.x = parentLayout.x + parentLayout.width + horizontalGap;
      childLayout.y = childCenterY - childLayout.height / 2;

      currentY += childLayout.subtreeHeight;

      // Recursão para o próximo nível
      positionChildren(cid);
    });
  }

  positionChildren(effectiveRootId);

  return layoutMap;
}

/**
 * Curva Bézier Cúbica Suave (Spline) orgânica idêntica ao Whimsical
 * Suporta conexões tanto para a direita quanto para a esquerda (bi-direcional)
 * com transições suaves e tangentes horizontais nas extremidades dos nós.
 */
export function getBezierPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const dx = Math.abs(endX - startX);
  const direction = endX >= startX ? 1 : -1;
  const cpX = startX + dx * 0.5 * direction;
  return `M ${startX} ${startY} C ${cpX} ${startY}, ${cpX} ${endY}, ${endX} ${endY}`;
}

/**
 * Purga e Normalização Definitiva de Nós do Mapa Mental:
 * Elimina nós em branco, nós contendo apenas traço '-', 'Novo Quadrado', 'Novo nó'
 * e reparenta automaticamente os filhos válidos para o nó superior, garantindo
 * ZERO espaços em branco soltos e conexões consistentes.
 */
export function cleanAndNormalizeMindMap(nodes: MindMapNode[]): MindMapNode[] {
  if (!nodes || nodes.length === 0) return [];

  const isInvalid = (n: MindMapNode): boolean => {
    if (n.side === 'root' || n.id === 'root') return false;
    const clean = (n.text || '').replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF]/g, '');
    return (
      !clean || 
      clean === '-' || 
      clean === '--' || 
      clean === '—' || 
      clean === '–' || 
      clean.toLowerCase() === 'novoquadrado' || 
      clean.toLowerCase() === 'novonó'
    );
  };

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, { ...n, childrenIds: [...(n.childrenIds || [])] }));

  // Coleta todos os nós inválidos
  const invalidIds = new Set<string>();
  nodes.forEach(n => {
    if (isInvalid(n)) invalidIds.add(n.id);
  });

  if (invalidIds.size === 0) {
    return nodes;
  }

  // Reparenta os filhos dos nós inválidos para o pai do nó inválido
  invalidIds.forEach(badId => {
    const badNode = nodeMap.get(badId);
    if (!badNode) return;
    const parentId = badNode.parentId;
    const childrenToHoist = badNode.childrenIds || [];

    if (parentId && nodeMap.has(parentId)) {
      const parentNode = nodeMap.get(parentId)!;
      childrenToHoist.forEach(cid => {
        const childNode = nodeMap.get(cid);
        if (childNode) {
          childNode.parentId = parentId;
          if (!parentNode.childrenIds.includes(cid)) {
            parentNode.childrenIds.push(cid);
          }
        }
      });
      // Remove badNode da lista de filhos do pai
      parentNode.childrenIds = parentNode.childrenIds.filter(id => id !== badId);
    }
  });

  // Filtra os nós inválidos e higieniza as referências de childrenIds
  const result: MindMapNode[] = [];
  nodeMap.forEach((n, id) => {
    if (!invalidIds.has(id)) {
      n.childrenIds = n.childrenIds.filter(cid => !invalidIds.has(cid) && nodeMap.has(cid));
      result.push(n);
    }
  });

  return result;
}
