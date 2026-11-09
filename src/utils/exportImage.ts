import { Board, MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath, estimateNodeDimensions } from './treeLayout';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Gera um SVG matematicamente proporcional e idêntico ao canvas da aplicação,
 * renderizando apenas nós visíveis (respeitando nós recolhidos com seus badges)
 * e portas de conector distribuídas, evitando qualquer distorção visual.
 */
export function generateBoardSVG(board: Board, theme: 'light' | 'dark' = 'light'): string {
  const nodes = board.mindMapNodes;
  if (!nodes || nodes.length === 0) return '';

  const root = nodes.find(n => n.side === 'root') || nodes[0];
  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Verifica visibilidade (nós dentro de ramos recolhidos NÃO são renderizados no export)
  const isNodeVisible = (node: MindMapNode): boolean => {
    let current = node;
    while (current.parentId) {
      const parent = nodeMap.get(current.parentId);
      if (!parent) break;
      if (parent.collapsed) return false;
      current = parent;
    }
    return true;
  };

  const countDescendants = (nodeId: string): number => {
    const node = nodeMap.get(nodeId);
    if (!node || !node.childrenIds || node.childrenIds.length === 0) return 0;
    let count = 0;
    const stack = [...node.childrenIds];
    while (stack.length > 0) {
      const cid = stack.pop()!;
      count++;
      const child = nodeMap.get(cid);
      if (child && child.childrenIds && child.childrenIds.length > 0) {
        stack.push(...child.childrenIds);
      }
    }
    return count;
  };

  const visibleNodes = nodes.filter(isNodeVisible);
  if (visibleNodes.length === 0) return '';

  // Layout responsivo puro (zero entrelaçamento)
  const layout = calculateMindMapLayout(nodes, root.id, {
    horizontalGap: 90,
    verticalGap: 18,
    rootX: 0,
    rootY: 0
  });

  const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  visibleNodes.forEach(node => {
    const computed = layout.get(node.id);
    const dims = estimateNodeDimensions(node);
    const x = computed ? computed.x : 0;
    const y = computed ? computed.y : 0;
    const w = computed ? computed.width : dims.width;
    const h = computed ? computed.height : dims.height;

    positions.set(node.id, { x, y, width: w, height: h });

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  });

  const padding = 60;
  const totalWidth = Math.ceil(Math.max(600, maxX - minX + padding * 2));
  const totalHeight = Math.ceil(Math.max(400, maxY - minY + padding * 2));
  const viewX = Math.floor(minX - padding);
  const viewY = Math.floor(minY - padding);

  // 1. Linhas conectoras com portas distribuídas na borda do nó
  let pathsSvg = '';
  const parentChildrenMap = new Map<string, MindMapNode[]>();
  visibleNodes.forEach(child => {
    if (!child.parentId) return;
    const parent = nodeMap.get(child.parentId);
    if (!parent || parent.collapsed) return;

    if (!parentChildrenMap.has(child.parentId)) {
      parentChildrenMap.set(child.parentId, []);
    }
    parentChildrenMap.get(child.parentId)!.push(child);
  });

  parentChildrenMap.forEach((children, parentId) => {
    const parent = nodeMap.get(parentId);
    if (!parent) return;
    const pPos = positions.get(parentId);
    if (!pPos) return;

    children.sort((a, b) => {
      const aPos = positions.get(a.id) || { y: 0 };
      const bPos = positions.get(b.id) || { y: 0 };
      return aPos.y - bPos.y;
    });

    const numChildren = children.length;
    const pad = Math.min(10, pPos.height * 0.22);
    const usableHeight = pPos.height - pad * 2;

    children.forEach((child, index) => {
      const cPos = positions.get(child.id);
      if (!cPos) return;

      const isChildOnLeft = (cPos.x + cPos.width / 2) < (pPos.x + pPos.width / 2);
      const startX = isChildOnLeft ? pPos.x : pPos.x + pPos.width;
      const startY = numChildren <= 1 
        ? pPos.y + pPos.height / 2 
        : pPos.y + pad + (usableHeight * index) / (numChildren - 1);

      const endX = isChildOnLeft ? cPos.x + cPos.width : cPos.x;
      const endY = cPos.y + cPos.height / 2;

      const strokeColor = child.color || parent.color || '#6366f1';
      const pathD = child.lineStyle === 'straight'
        ? `M ${startX} ${startY} L ${endX} ${endY}`
        : getBezierPath(startX, startY, endX, endY);

      pathsSvg += `
        <g>
          <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.88" />
          <circle cx="${endX}" cy="${endY}" r="3" fill="${strokeColor}" />
        </g>
      `;
    });
  });

  // Cores de fundo e texto baseadas no tema
  const isLight = theme === 'light';
  const canvasBg = isLight ? '#f8fafc' : '#121418';
  const cardBg = isLight ? '#ffffff' : '#1e222a';
  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const borderColor = isLight ? '#cbd5e1' : '#2d3340';
  const rootBg = isLight ? '#ffffff' : '#282d38';
  const rootBorder = isLight ? '#334155' : '#475569';

  // 2. Nós / Cartões
  let nodesSvg = '';
  visibleNodes.forEach(node => {
    const pos = positions.get(node.id);
    if (!pos) return;

    const isRoot = node.side === 'root';
    const color = node.color || '#6366f1';
    const bg = isRoot ? rootBg : cardBg;
    const border = isRoot ? rootBorder : borderColor;
    const hasChildren = node.childrenIds && node.childrenIds.length > 0;
    const isCollapsed = node.collapsed;
    const count = countDescendants(node.id);

    // Se tiver filhos recolhidos, renderiza badge pill
    let badgeSvg = '';
    if (hasChildren && isCollapsed) {
      const badgeW = count > 99 ? 32 : count > 9 ? 26 : 22;
      const badgeX = pos.width - badgeW - 8;
      const badgeY = (pos.height - 18) / 2;
      badgeSvg = `
        <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="18" rx="9" fill="${color}" />
        <text x="${badgeX + badgeW / 2}" y="${badgeY + 13}" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">${count}</text>
      `;
    }

    nodesSvg += `
      <g transform="translate(${pos.x}, ${pos.y})">
        <!-- Sombra sutil -->
        <rect x="0" y="2" width="${pos.width}" height="${pos.height}" rx="8" fill="rgba(0,0,0,0.06)" />
        <!-- Cartão -->
        <rect width="${pos.width}" height="${pos.height}" rx="8" fill="${bg}" stroke="${border}" stroke-width="${isRoot ? 2 : 1.5}" />
        <!-- Acento colorido na borda esquerda -->
        ${!isRoot ? `<rect x="0" y="0" width="5" height="${pos.height}" rx="3" fill="${color}" />` : ''}
        <!-- Texto do Nó -->
        <text 
          x="${isRoot ? 20 : 16}" 
          y="${pos.height / 2 + 5}" 
          fill="${textColor}" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-size="${isRoot ? 16 : 13.5}" 
          font-weight="${isRoot ? 700 : 500}"
        >${escapeXml(node.text)}</text>
        ${badgeSvg}
      </g>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="${viewX} ${viewY} ${totalWidth} ${totalHeight}">
      <rect x="${viewX}" y="${viewY}" width="${totalWidth}" height="${totalHeight}" fill="${canvasBg}" />
      ${pathsSvg}
      ${nodesSvg}
    </svg>
  `.trim();
}

export function exportBoardAsSVG(board: Board) {
  const currentTheme = (localStorage.getItem('whimflow_theme') as 'light' | 'dark') || 'light';
  const svg = generateBoardSVG(board, currentTheme);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${board.title.replace(/\s+/g, '_')}_mapa_mental_turbine.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportBoardAsPNG(
  board: Board,
  options: { scale?: number; transparent?: boolean; theme?: 'light' | 'dark' } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const currentTheme = options.theme || (localStorage.getItem('whimflow_theme') as 'light' | 'dark') || 'light';
      const scale = options.scale || 2; // Padrão Retina 2x (ou 1x / 3x)
      const isTransparent = Boolean(options.transparent);

      const svg = generateBoardSVG(board, currentTheme);
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context não suportado'));
          return;
        }

        if (!isTransparent) {
          ctx.fillStyle = currentTheme === 'light' ? '#f8fafc' : '#121418';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            reject(new Error('Falha ao gerar PNG'));
            return;
          }
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${board.title.replace(/\s+/g, '_')}_sem_marca_dagua.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Exporta o Mapa Mental como Outline Markdown (.md) estruturado
 * Pronto para importação no Notion, Obsidian, GitHub ou análise com IA
 */
export function exportBoardAsMarkdown(board: Board) {
  const nodes = board.mindMapNodes;
  const root = nodes.find(n => n.side === 'root') || nodes[0];
  if (!root) return;

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const lines: string[] = [];
  lines.push(`# ${board.title}`);
  lines.push('');
  lines.push(`> Exportado em ${new Date().toLocaleDateString('pt-BR')} • Mapa Mental Turbine (Exportação Pro Sem Marca D'Água)`);
  lines.push('');

  const visit = (nodeId: string, level: number) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const indent = '  '.repeat(level);
    lines.push(`${indent}- ${node.text || 'Sem título'}`);
    (node.childrenIds || []).forEach(cid => visit(cid, level + 1));
  };

  (root.childrenIds || []).forEach(cid => visit(cid, 0));

  const mdContent = lines.join('\n');
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${board.title.replace(/\s+/g, '_')}_outline.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
