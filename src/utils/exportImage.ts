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

export function generateBoardSVG(board: Board): string {
  const nodes = board.mindMapNodes;
  if (!nodes || nodes.length === 0) return '';

  const root = nodes.find(n => n.side === 'root') || nodes[0];
  const layout = calculateMindMapLayout(nodes, root.id);

  // Mapeia posições calculadas com offset manual
  const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const computed = layout.get(node.id);
    const dims = estimateNodeDimensions(node);
    const baseX = computed ? computed.x : node.x;
    const baseY = computed ? computed.y : node.y;
    const w = computed ? computed.width : dims.width;
    const h = computed ? computed.height : dims.height;

    const x = baseX + (node.offsetX || 0);
    const y = baseY + (node.offsetY || 0);

    positions.set(node.id, { x, y, width: w, height: h });

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  });

  const padding = 80;
  const totalWidth = Math.max(800, maxX - minX + padding * 2);
  const totalHeight = Math.max(600, maxY - minY + padding * 2);
  const viewX = minX - padding;
  const viewY = minY - padding;

  // Linhas conectoras
  let pathsSvg = '';
  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  nodes.forEach(child => {
    if (!child.parentId) return;
    const parent = nodeMap.get(child.parentId);
    if (!parent) return;

    const pPos = positions.get(parent.id);
    const cPos = positions.get(child.id);
    if (!pPos || !cPos) return;

    const isChildOnLeft = (cPos.x + cPos.width / 2) < (pPos.x + pPos.width / 2);
    const startX = isChildOnLeft ? pPos.x : pPos.x + pPos.width;
    const startY = pPos.y + pPos.height / 2;
    const endX = isChildOnLeft ? cPos.x + cPos.width : cPos.x;
    const endY = cPos.y + cPos.height / 2;

    const strokeColor = child.color || parent.color || '#6366f1';
    const pathD = getBezierPath(startX, startY, endX, endY);

    pathsSvg += `
      <g>
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" />
        <circle cx="${endX}" cy="${endY}" r="4" fill="${strokeColor}" />
      </g>
    `;
  });

  // Blocos / Nós de Texto
  let nodesSvg = '';
  nodes.forEach(node => {
    const pos = positions.get(node.id);
    if (!pos) return;

    const isRoot = node.side === 'root';
    const color = node.color || '#6366f1';
    const bg = isRoot ? '#1e293b' : '#1e232d';
    const border = isRoot ? '#475569' : color;
    const textColor = '#ffffff';

    nodesSvg += `
      <g transform="translate(${pos.x}, ${pos.y})">
        <rect width="${pos.width}" height="${pos.height}" rx="8" fill="${bg}" stroke="${border}" stroke-width="${isRoot ? 2.5 : 2}" />
        ${!isRoot ? `<line x1="0" y1="0" x2="0" y2="${pos.height}" stroke="${color}" stroke-width="5" />` : ''}
        <text 
          x="${isRoot ? 24 : 16}" 
          y="${pos.height / 2 + 5}" 
          fill="${textColor}" 
          font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-size="${isRoot ? 16 : 13.5}" 
          font-weight="${isRoot ? 700 : 500}"
        >${escapeXml(node.text)}</text>
      </g>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="${viewX} ${viewY} ${totalWidth} ${totalHeight}">
      <rect x="${viewX}" y="${viewY}" width="${totalWidth}" height="${totalHeight}" fill="#0f1117" />
      ${pathsSvg}
      ${nodesSvg}
    </svg>
  `.trim();
}

export function exportBoardAsSVG(board: Board) {
  const svg = generateBoardSVG(board);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${board.title.replace(/\s+/g, '_')}_whimflow.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportBoardAsPNG(board: Board): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svg = generateBoardSVG(board);
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const scale = 2; // Retina 2x scale
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context não suportado'));
          return;
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
          a.download = `${board.title.replace(/\s+/g, '_')}_whimflow.png`;
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
