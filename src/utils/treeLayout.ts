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
 */
export function estimateNodeDimensions(node: MindMapNode): { width: number; height: number } {
  if (node.side === 'root') {
    return { width: 220, height: 54 };
  }
  const textLen = node.text.length;
  // Largura proporcional ao texto com limites confortáveis
  const width = Math.max(130, Math.min(340, Math.round(textLen * 8.2 + 36)));
  const height = textLen > 40 ? 46 : 36;
  return { width, height };
}

/**
 * Algoritmo Tidy Tree Horizontal para Mapas Mentais (Estilo Whimsical)
 * Garante que nenhum nó se sobreponha e que as linhas conectem perfeitamente.
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
  const horizontalGap = options.horizontalGap ?? 64;
  const verticalGap = options.verticalGap ?? 14;
  const rootX = options.rootX ?? 0;
  const rootY = options.rootY ?? 0;

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const layoutMap = new Map<string, ComputedNodeLayout>();

  // 1. Passo Pós-Ordem: Calcular altura do subárvore recursivamente
  function computeSubtreeHeight(nodeId: string): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const { width, height } = estimateNodeDimensions(node);

    // Se estiver colapsado ou não tiver filhos visíveis
    if (node.collapsed || !node.childrenIds || node.childrenIds.length === 0) {
      const subtreeHeight = height + verticalGap;
      layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
      return subtreeHeight;
    }

    // Calcula a altura de cada filho visível
    let childrenTotalHeight = 0;
    node.childrenIds.forEach(childId => {
      childrenTotalHeight += computeSubtreeHeight(childId);
    });

    const subtreeHeight = Math.max(height + verticalGap, childrenTotalHeight);
    layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
    return subtreeHeight;
  }

  // Inicia cálculo a partir da raiz
  const rootNode = nodeMap.get(rootId);
  if (!rootNode) return layoutMap;

  computeSubtreeHeight(rootId);

  // 2. Passo Pré-Ordem: Posicionar os nós na grade horizontal
  const rootLayout = layoutMap.get(rootId)!;
  rootLayout.x = rootX;
  rootLayout.y = rootY;

  function positionChildren(parentId: string) {
    const parent = nodeMap.get(parentId);
    const parentLayout = layoutMap.get(parentId);
    if (!parent || !parentLayout || parent.collapsed || !parent.childrenIds) return;

    // Altura total das subárvores dos filhos
    let totalChildrenHeight = 0;
    parent.childrenIds.forEach(cid => {
      const childLayout = layoutMap.get(cid);
      if (childLayout) totalChildrenHeight += childLayout.subtreeHeight;
    });

    // Centraliza os filhos verticalmente em relação ao centro do nó-pai
    const parentCenterY = parentLayout.y + parentLayout.height / 2;
    let currentY = parentCenterY - totalChildrenHeight / 2;

    parent.childrenIds.forEach(cid => {
      const child = nodeMap.get(cid);
      const childLayout = layoutMap.get(cid);
      if (!child || !childLayout) return;

      const childCenterY = currentY + childLayout.subtreeHeight / 2;
      childLayout.x = parentLayout.x + parentLayout.width + horizontalGap;
      childLayout.y = childCenterY - childLayout.height / 2;

      currentY += childLayout.subtreeHeight;

      // Recursão para os netos
      positionChildren(cid);
    });
  }

  positionChildren(rootId);

  return layoutMap;
}

/**
 * Gera a string de comando do caminho SVG da curva Bézier cúbica suave (Spline)
 * idêntica ao Whimsical, conectando o centro-direito do pai ao centro-esquerdo do filho.
 */
export function getBezierPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const dx = Math.max(endX - startX, 30);
  const cp1X = startX + dx * 0.45;
  const cp1Y = startY;
  const cp2X = endX - dx * 0.45;
  const cp2Y = endY;
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}
