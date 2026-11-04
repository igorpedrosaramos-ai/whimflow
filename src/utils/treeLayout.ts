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
    return { width: Math.max(220, Math.round(node.text.length * 9 + 48)), height: 52 };
  }
  const textLen = node.text.length;
  // Largura confortável baseada no texto para nunca quebrar palavras
  const width = Math.max(140, Math.min(480, Math.round(textLen * 8.6 + 44)));
  const height = 40;
  return { width, height };
}

/**
 * Algoritmo Tidy Tree Horizontal para Mapas Mentais (Idêntico ao Whimsical)
 * Calcula recursivamente a altura de cada ramificação e distribui os nós
 * garantindo ZERO sobreposição e conexões vetoriais contínuas.
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
  const horizontalGap = options.horizontalGap ?? 80;
  const verticalGap = options.verticalGap ?? 16;
  const rootX = options.rootX ?? 0;
  const rootY = options.rootY ?? 0;

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const layoutMap = new Map<string, ComputedNodeLayout>();

  // Passo 1: Pós-Ordem - Calcular a altura de cada subárvore recursivamente
  function computeSubtreeHeight(nodeId: string): number {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const { width, height } = estimateNodeDimensions(node);

    // Se estiver colapsado ou for folha
    if (node.collapsed || !node.childrenIds || node.childrenIds.length === 0) {
      const subtreeHeight = height + verticalGap;
      layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
      return subtreeHeight;
    }

    let childrenTotalHeight = 0;
    node.childrenIds.forEach(childId => {
      childrenTotalHeight += computeSubtreeHeight(childId);
    });

    const subtreeHeight = Math.max(height + verticalGap, childrenTotalHeight);
    layoutMap.set(nodeId, { x: 0, y: 0, width, height, subtreeHeight });
    return subtreeHeight;
  }

  const rootNode = nodeMap.get(rootId);
  if (!rootNode) return layoutMap;

  computeSubtreeHeight(rootId);

  // Passo 2: Pré-Ordem - Posicionar nós na grade horizontal com base na altura calculada
  const rootLayout = layoutMap.get(rootId)!;
  rootLayout.x = rootX;
  rootLayout.y = rootY;

  function positionChildren(parentId: string) {
    const parent = nodeMap.get(parentId);
    const parentLayout = layoutMap.get(parentId);
    if (!parent || !parentLayout || parent.collapsed || !parent.childrenIds) return;

    let totalChildrenHeight = 0;
    parent.childrenIds.forEach(cid => {
      const childLayout = layoutMap.get(cid);
      if (childLayout) totalChildrenHeight += childLayout.subtreeHeight;
    });

    // Centraliza os ramos-filhos no eixo Y relativo ao pai
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

      // Recursão para o próximo nível
      positionChildren(cid);
    });
  }

  positionChildren(rootId);

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
  const dy = Math.abs(endY - startY);
  const direction = endX >= startX ? 1 : -1;
  // Distância de controle balanceada que preserva a curvatura orgânica mesmo com grande deslocamento vertical
  const cpDistance = Math.max(34, Math.min(dx * 0.52 + dy * 0.08, dx * 0.95));
  const cp1X = startX + cpDistance * direction;
  const cp1Y = startY;
  const cp2X = endX - cpDistance * direction;
  const cp2Y = endY;
  return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
}
