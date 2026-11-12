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
 * Garante que o texto fique em linha legível e elegante
 */
export function estimateNodeDimensions(node: MindMapNode): { width: number; height: number } {
  const text = (node.text || '').trim();
  const lines = text.split('\n');
  const isMultiline = lines.length > 1;
  const maxLineLen = Math.max(...lines.map(l => l.length), 0);

  if (node.side === 'root') {
    const iconPadding = node.icon ? 20 : 0;
    const width = isMultiline
      ? Math.max(90, Math.round(maxLineLen * 9.2 + 24 + iconPadding))
      : Math.max(90, Math.round(text.length * 9.2 + 24 + iconPadding));
    const height = isMultiline ? Math.max(32, lines.length * 20 + 8) : 32;
    return { width, height };
  }

  if (text.length === 0) {
    return { width: 44, height: 24 };
  }

  // Tratamento especial para nós curtos como marcos de timeline ('Q1', 'Q2', etc.)
  if (text.length <= 4 && !isMultiline) {
    return { width: 40, height: 24 };
  }

  const hasChildBadge = Boolean(node.childrenIds && node.childrenIds.length > 0 && node.collapsed);
  const badgePadding = hasChildBadge ? 28 : 0;
  const iconPadding = node.icon ? 20 : 0;
  const linkPadding = node.link ? 18 : 0;
  const charMultiplier = node.fontSize === 'small' ? 7.0 : node.fontSize === 'large' ? 9.2 : (node.bold ? 8.4 : 7.8);
  const basePadding = 14;

  const width = Math.max(
    30,
    Math.round((isMultiline ? maxLineLen : text.length) * charMultiplier + basePadding + badgePadding + iconPadding + linkPadding)
  );
  const height = isMultiline
    ? Math.max(26, lines.length * 20 + 4)
    : (node.fontSize === 'large' ? 28 : node.fontSize === 'small' ? 20 : 24);

  return { width, height };
}

/**
 * Algoritmo Multi-Layout para Mapas Mentais, Organogramas e Cronogramas
 * Suporta:
 * 1. 'bidirectional' (Mapa Mental Canônico do Whimsical com ramificações balanceadas à esquerda e à direita)
 * 2. 'orgchart' (Organograma e Pods Verticais de Cima para Baixo com nós filhos centralizados)
 * 3. 'timeline' (Cronograma Horizontal com marcos Q1..Q4 no eixo e entregáveis abaixo)
 * 4. 'right' (Árvore Horizontal Tradicional Unilateral)
 * 5. 'free' (Posicionamento Livre Preservado)
 */
export function calculateMindMapLayout(
  nodes: MindMapNode[],
  rootId: string = 'root',
  options: {
    horizontalGap?: number;
    verticalGap?: number;
    rootX?: number;
    rootY?: number;
    layoutType?: 'bidirectional' | 'right' | 'orgchart' | 'timeline' | 'free';
  } = {}
): Map<string, ComputedNodeLayout> {
  const horizontalGap = options.horizontalGap ?? 65;
  const verticalGap = options.verticalGap ?? 8;
  const rootX = options.rootX ?? 0;
  const rootY = options.rootY ?? 0;

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const rootNode = nodeMap.get(rootId) || nodes.find(n => n.side === 'root') || nodes[0];
  if (!rootNode) return new Map();
  const effectiveRootId = rootNode.id;

  // Sanitização e normalização da hierarquia pai -> filhos
  const childrenMap = new Map<string, string[]>();
  nodes.forEach(n => {
    const valid = (n.childrenIds || []).filter(cid => cid !== n.id && nodeMap.has(cid));
    childrenMap.set(n.id, [...new Set(valid)]);
  });

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

  // Previne nós órfãos
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
      const rootChildren = childrenMap.get(effectiveRootId) || [];
      if (!rootChildren.includes(n.id)) {
        rootChildren.push(n.id);
        childrenMap.set(effectiveRootId, rootChildren);
      }
    }
  });

  const layoutMap = new Map<string, ComputedNodeLayout>();

  // 1. Determinação / Auto-detecção do tipo de Layout
  let effectiveLayout = options.layoutType;
  if (!effectiveLayout) {
    const rootText = (rootNode.text || '').toLowerCase();
    const hasLeftNodes = nodes.some(n => n.side === 'left');
    const isTimelineText = rootText.includes('timeline') || rootText.includes('roadmap') || rootText.includes('cronograma');
    const isOrgText = rootText.includes('org chart') || rootText.includes('pod structure') || rootText.includes('organograma');

    if (isTimelineText) {
      effectiveLayout = 'timeline';
    } else if (isOrgText) {
      effectiveLayout = 'orgchart';
    } else if (hasLeftNodes) {
      effectiveLayout = 'bidirectional';
    } else {
      effectiveLayout = 'bidirectional';
    }
  }

  // -------------------------------------------------------------
  // MODO A: LAYOUT LIVRE PRESERVADO ('free')
  // -------------------------------------------------------------
  if (effectiveLayout === 'free') {
    nodes.forEach(n => {
      const { width, height } = estimateNodeDimensions(n);
      layoutMap.set(n.id, {
        x: typeof n.x === 'number' ? n.x : 0,
        y: typeof n.y === 'number' ? n.y : 0,
        width: n.width || width,
        height: n.height || height,
        subtreeHeight: height
      });
    });
    return layoutMap;
  }

  // -------------------------------------------------------------
  // MODO B: CRONOGRAMA / TIMELINE HORIZONTAL ('timeline')
  // -------------------------------------------------------------
  if (effectiveLayout === 'timeline') {
    const { width: rootW, height: rootH } = estimateNodeDimensions(rootNode);
    layoutMap.set(rootNode.id, {
      x: rootX - rootW / 2,
      y: rootY - 120,
      width: rootW,
      height: rootH,
      subtreeHeight: rootH
    });

    const milestones = childrenMap.get(rootNode.id) || [];
    const mCount = milestones.length;
    const timelineStep = 240;
    const startX = rootX - ((mCount - 1) * timelineStep) / 2;

    milestones.forEach((mId, idx) => {
      const mNode = nodeMap.get(mId);
      if (!mNode) return;
      const { width: mW, height: mH } = estimateNodeDimensions(mNode);
      const mX = startX + idx * timelineStep;
      const mY = rootY;

      layoutMap.set(mId, {
        x: mX - mW / 2,
        y: mY,
        width: mW,
        height: mH,
        subtreeHeight: mH
      });

      // Cards e entregáveis abaixo de cada marco
      const tasks = childrenMap.get(mId) || [];
      let taskY = mY + mH + 40;
      tasks.forEach(tId => {
        const tNode = nodeMap.get(tId);
        if (!tNode) return;
        const { width: tW, height: tH } = estimateNodeDimensions(tNode);
        layoutMap.set(tId, {
          x: mX - tW / 2,
          y: taskY,
          width: tW,
          height: tH,
          subtreeHeight: tH
        });
        taskY += tH + 16;
      });
    });

    return layoutMap;
  }

  // -------------------------------------------------------------
  // MODO C: ORGANOGRAMA / ÁRVORE VERTICAL ('orgchart')
  // -------------------------------------------------------------
  if (effectiveLayout === 'orgchart') {
    const vGap = options.verticalGap ?? 64;
    const hGap = options.horizontalGap ?? 36;

    // Pós-ordem: calcula largura total necessária para cada subárvore
    function computeSubtreeWidth(nodeId: string): number {
      const node = nodeMap.get(nodeId);
      if (!node) return 0;
      const { width, height } = estimateNodeDimensions(node);
      const childrenIds = childrenMap.get(nodeId) || [];

      if (node.collapsed || childrenIds.length === 0) {
        const subtreeWidth = width + hGap;
        layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight: subtreeWidth });
        return subtreeWidth;
      }

      let totalWidth = 0;
      childrenIds.forEach(cid => {
        totalWidth += computeSubtreeWidth(cid);
      });

      const subtreeWidth = Math.max(width + hGap, totalWidth);
      layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight: subtreeWidth });
      return subtreeWidth;
    }

    computeSubtreeWidth(effectiveRootId);

    // Pré-ordem: distribui nós verticalmente para baixo e horizontalmente centralizados
    const rootLayout = layoutMap.get(effectiveRootId)!;
    rootLayout.x = rootX - rootLayout.width / 2;
    rootLayout.y = rootY;

    function positionOrgChildren(parentId: string) {
      const parent = nodeMap.get(parentId);
      const pLayout = layoutMap.get(parentId);
      if (!parent || !pLayout || parent.collapsed) return;

      const childrenIds = childrenMap.get(parentId) || [];
      if (childrenIds.length === 0) return;

      let totalSubtreeWidth = 0;
      childrenIds.forEach(cid => {
        totalSubtreeWidth += layoutMap.get(cid)?.subtreeHeight || 0;
      });

      const parentCenterX = pLayout.x + pLayout.width / 2;
      let currentX = parentCenterX - totalSubtreeWidth / 2;
      const nextY = pLayout.y + pLayout.height + vGap;

      childrenIds.forEach(cid => {
        const cLayout = layoutMap.get(cid);
        if (!cLayout) return;

        const cCenterX = currentX + cLayout.subtreeHeight / 2;
        cLayout.x = cCenterX - cLayout.width / 2;
        cLayout.y = nextY;

        currentX += cLayout.subtreeHeight;

        positionOrgChildren(cid);
      });
    }

    positionOrgChildren(effectiveRootId);
    return layoutMap;
  }

  // -------------------------------------------------------------
  // MODO D: MAPA MENTAL BI-DIRECIONAL ('bidirectional' - WHIMSICAL CANÔNICO)
  // -------------------------------------------------------------
  const rootChildren = childrenMap.get(effectiveRootId) || [];
  const leftChildren: string[] = [];
  const rightChildren: string[] = [];

  rootChildren.forEach(cid => {
    const child = nodeMap.get(cid);
    if (child?.side === 'left') {
      leftChildren.push(cid);
    } else if (child?.side === 'right') {
      rightChildren.push(cid);
    } else {
      if (leftChildren.length < rightChildren.length) {
        leftChildren.push(cid);
      } else {
        rightChildren.push(cid);
      }
    }
  });

  // Função para calcular a altura recursiva de ramos
  function computeSubtreeHeight(nodeId: string): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;
    const { width, height } = estimateNodeDimensions(node);
    const childrenIds = childrenMap.get(nodeId) || [];

    if (node.collapsed || childrenIds.length === 0) {
      const subtreeHeight = height + verticalGap;
      layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
      return subtreeHeight;
    }

    let childrenTotalHeight = 0;
    childrenIds.forEach(cid => {
      childrenTotalHeight += computeSubtreeHeight(cid);
    });

    const subtreeHeight = Math.max(height + verticalGap, childrenTotalHeight);
    layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
    return subtreeHeight;
  }

  // Raiz posicionada no centro
  const { width: rootW, height: rootH } = estimateNodeDimensions(rootNode);
  layoutMap.set(effectiveRootId, {
    x: rootX - rootW / 2,
    y: rootY - rootH / 2,
    width: rootW,
    height: rootH,
    subtreeHeight: rootH
  });

  leftChildren.forEach(cid => computeSubtreeHeight(cid));
  rightChildren.forEach(cid => computeSubtreeHeight(cid));

  const rootCenterX = rootX;
  const rootCenterY = rootY;

  // Ramo Esquerdo: ramifica em direção a -X
  let totalLeftHeight = 0;
  leftChildren.forEach(cid => {
    totalLeftHeight += layoutMap.get(cid)?.subtreeHeight || 0;
  });
  let currentLeftY = rootCenterY - totalLeftHeight / 2;

  function positionBranchLeft(nodeId: string) {
    const parentLayout = layoutMap.get(nodeId);
    if (!parentLayout) return;

    const childrenIds = childrenMap.get(nodeId) || [];
    if (childrenIds.length === 0 || nodeMap.get(nodeId)?.collapsed) return;

    let childrenHeight = 0;
    childrenIds.forEach(cid => {
      childrenHeight += layoutMap.get(cid)?.subtreeHeight || 0;
    });

    let curY = (parentLayout.y + parentLayout.height / 2) - childrenHeight / 2;

    childrenIds.forEach(cid => {
      const cLayout = layoutMap.get(cid);
      if (!cLayout) return;

      cLayout.x = parentLayout.x - cLayout.width - horizontalGap;
      cLayout.y = (curY + cLayout.subtreeHeight / 2) - cLayout.height / 2;
      curY += cLayout.subtreeHeight;

      positionBranchLeft(cid);
    });
  }

  leftChildren.forEach(cid => {
    const cLayout = layoutMap.get(cid);
    if (!cLayout) return;

    cLayout.x = rootCenterX - rootW / 2 - cLayout.width - horizontalGap;
    cLayout.y = (currentLeftY + cLayout.subtreeHeight / 2) - cLayout.height / 2;
    currentLeftY += cLayout.subtreeHeight;

    positionBranchLeft(cid);
  });

  // Ramo Direito: ramifica em direção a +X
  let totalRightHeight = 0;
  rightChildren.forEach(cid => {
    totalRightHeight += layoutMap.get(cid)?.subtreeHeight || 0;
  });
  let currentRightY = rootCenterY - totalRightHeight / 2;

  function positionBranchRight(nodeId: string) {
    const parentLayout = layoutMap.get(nodeId);
    if (!parentLayout) return;

    const childrenIds = childrenMap.get(nodeId) || [];
    if (childrenIds.length === 0 || nodeMap.get(nodeId)?.collapsed) return;

    let childrenHeight = 0;
    childrenIds.forEach(cid => {
      childrenHeight += layoutMap.get(cid)?.subtreeHeight || 0;
    });

    let curY = (parentLayout.y + parentLayout.height / 2) - childrenHeight / 2;

    childrenIds.forEach(cid => {
      const cLayout = layoutMap.get(cid);
      if (!cLayout) return;

      cLayout.x = parentLayout.x + parentLayout.width + horizontalGap;
      cLayout.y = (curY + cLayout.subtreeHeight / 2) - cLayout.height / 2;
      curY += cLayout.subtreeHeight;

      positionBranchRight(cid);
    });
  }

  rightChildren.forEach(cid => {
    const cLayout = layoutMap.get(cid);
    if (!cLayout) return;

    cLayout.x = rootCenterX + rootW / 2 + horizontalGap;
    cLayout.y = (currentRightY + cLayout.subtreeHeight / 2) - cLayout.height / 2;
    currentRightY += cLayout.subtreeHeight;

    positionBranchRight(cid);
  });

  return layoutMap;
}

/**
 * Curva Bézier Cúbica Suave (Spline Hermite) idêntica ao Whimsical
 * Suporta conexões tanto para a direita quanto para a esquerda (bi-direcional).
 * Os pontos de controle ficam no ponto médio horizontal exato, garantindo que a curva
 * permaneça estritamente contida no espaço livre entre colunas e JAMAIS intercepte nós irmãos.
 */
export function getBezierPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  if (dx < 2 && dy < 2) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }
  if (dy === 0) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

/**
 * Purga e Normalização Definitiva de Nós do Mapa Mental
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

  const invalidIds = new Set<string>();
  nodes.forEach(n => {
    if (isInvalid(n)) invalidIds.add(n.id);
  });

  if (invalidIds.size === 0) {
    return nodes;
  }

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
      parentNode.childrenIds = parentNode.childrenIds.filter(id => id !== badId);
    } else {
      // Se não havia pai válido, ancora os nós filhos no nó raiz para evitar nós órfãos desconectados
      const rootNode = Array.from(nodeMap.values()).find(n => n.side === 'root' || n.id === 'root') || Array.from(nodeMap.values())[0];
      if (rootNode && !invalidIds.has(rootNode.id)) {
        childrenToHoist.forEach(cid => {
          const childNode = nodeMap.get(cid);
          if (childNode) {
            childNode.parentId = rootNode.id;
            if (!rootNode.childrenIds.includes(cid)) {
              rootNode.childrenIds.push(cid);
            }
          }
        });
      }
    }
  });

  const result: MindMapNode[] = [];
  nodeMap.forEach((n, id) => {
    if (!invalidIds.has(id)) {
      n.childrenIds = n.childrenIds.filter(cid => !invalidIds.has(cid) && nodeMap.has(cid));
      result.push(n);
    }
  });

  return result;
}