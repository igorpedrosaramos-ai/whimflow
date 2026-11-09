import { MindMapNode } from '../types';
import { WHIMSICAL_PALETTE } from '../components/NodeContextMenu';

interface ParsedLine {
  text: string;
  depth: number;
}

export function parseOutlineText(rawText: string): ParsedLine[] {
  const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  return lines.map(line => {
    // Calcula a indentação em tabs ou espaços
    let indent = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '\t') {
        indent += 4;
      } else if (line[i] === ' ') {
        indent += 1;
      } else {
        break;
      }
    }

    const depth = Math.floor(indent / 2);

    // Remove marcadores comuns: -, *, +, 1., 1), •, ◦, ⁃
    let clean = line.trim();
    clean = clean.replace(/^(\*|\-|\+|•|◦|⁃|\d+[\.\)])\s+/, '').trim();

    return { text: clean, depth };
  });
}

/**
 * Converte um texto de múltiplos tópicos em uma árvore de nós conectada ao nó selecionado (ou à raiz)
 */
export function createNodesFromOutline(
  outline: ParsedLine[],
  targetParent: MindMapNode,
  existingNodes: MindMapNode[]
): MindMapNode[] {
  if (outline.length === 0) return [];

  const timestamp = Date.now();
  const newNodes: MindMapNode[] = [];
  const depthMap = new Map<number, string>(); // depth -> nodeId
  depthMap.set(-1, targetParent.id);

  // Determina cor base
  let branchColor = targetParent.color;
  if (targetParent.side === 'root' || !branchColor) {
    const palIdx = (targetParent.childrenIds.length + newNodes.length) % WHIMSICAL_PALETTE.length;
    branchColor = WHIMSICAL_PALETTE[palIdx].hex;
  }

  // Normaliza profundidade relativa à primeira linha
  const minDepth = Math.min(...outline.map(o => o.depth));

  outline.forEach((item, index) => {
    const relDepth = Math.max(0, item.depth - minDepth);
    const parentId = depthMap.get(relDepth - 1) || targetParent.id;
    const newId = `node-paste-${timestamp}-${index}`;

    depthMap.set(relDepth, newId);

    const node: MindMapNode = {
      id: newId,
      text: item.text,
      x: targetParent.x + (relDepth + 1) * 220,
      y: targetParent.y + index * 42,
      parentId: parentId,
      childrenIds: [],
      collapsed: false,
      color: branchColor,
      borderStyle: targetParent.borderStyle || 'accent',
      lineStyle: targetParent.lineStyle || 'bezier',
      side: targetParent.side === 'root' ? 'right' : targetParent.side
    };

    newNodes.push(node);
  });

  // Atualiza as listas de childrenIds entre os novos nós
  newNodes.forEach(child => {
    const p = newNodes.find(n => n.id === child.parentId);
    if (p) {
      p.childrenIds.push(child.id);
    }
  });

  return newNodes;
}
