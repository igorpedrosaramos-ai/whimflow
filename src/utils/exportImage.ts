import { Board, MindMapNode, FlowShape, StickyNote, WireframeItem, TextItem, DrawingStroke, Connector } from '../types';
import { calculateMindMapLayout, getBezierPath, estimateNodeDimensions } from './treeLayout';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
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
 * Quebra texto em linhas de largura visual equilibrada para renderização SVG
 */
function wrapTextLines(text: string, maxCharsPerLine: number = 24): string[] {
  if (!text) return [];
  const rawParagraphs = text.split('\n');
  const lines: string[] = [];

  rawParagraphs.forEach(para => {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      return;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = '';

    words.forEach(word => {
      if (!currentLine) {
        currentLine = word;
      } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }
  });

  return lines;
}

/**
 * Renderiza bloco de texto SVG com <tspan> para suporte a múltiplas linhas
 */
function renderSvgText(
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
  textColor: string,
  fontSize: number,
  fontWeight: string | number = 500,
  anchor: 'start' | 'middle' | 'end' = 'middle'
): string {
  if (lines.length === 0) return '';
  const tspans = lines.map((line, idx) => {
    const dy = idx === 0 ? 0 : lineHeight;
    return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
  }).join('');

  return `
    <text 
      x="${x}" 
      y="${startY}" 
      fill="${textColor}" 
      font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
      font-size="${fontSize}" 
      font-weight="${fontWeight}" 
      text-anchor="${anchor}"
    >${tspans}</text>
  `;
}

/**
 * Gera um SVG completo, matematicamente proporcional e idêntico ao canvas,
 * contemplando nós do mapa mental, notas adesivas, formas de fluxograma,
 * wireframes, anotações de texto livre, desenhos à mão livre e conectores.
 */
export function generateBoardSVG(board: Board, theme: 'light' | 'dark' = 'light'): string {
  const isLight = theme === 'light';
  const canvasBg = isLight ? '#f8fafc' : '#121418';
  const cardBg = isLight ? '#ffffff' : '#1e222a';
  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const textMuted = isLight ? '#64748b' : '#94a3b8';
  const borderColor = isLight ? '#cbd5e1' : '#2d3340';
  const rootBg = isLight ? '#ffffff' : '#282d38';
  const rootBorder = isLight ? '#334155' : '#475569';

  const nodes = board.mindMapNodes || [];
  const stickies = board.stickies || [];
  const shapes = board.shapes || [];
  const wireframes = board.wireframes || [];
  const texts = board.texts || [];
  const drawings = board.drawings || [];
  const connectors = board.connectors || [];

  // Mapeamento e cálculo de visibilidade dos nós do mapa mental
  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

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

  // Calcula layout do mapa mental caso haja nós
  const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (visibleNodes.length > 0) {
    const root = visibleNodes.find(n => n.side === 'root') || visibleNodes[0];
    const layout = calculateMindMapLayout(nodes, root.id, {
      horizontalGap: 90,
      verticalGap: 18,
      rootX: 0,
      rootY: 0
    });

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
  }

  // 1. Limites espaciais para notas adesivas (stickies)
  stickies.forEach(s => {
    const w = s.width || 180;
    const h = s.height || 140;
    if (s.x < minX) minX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.x + w > maxX) maxX = s.x + w;
    if (s.y + h > maxY) maxY = s.y + h;
  });

  // 2. Limites espaciais para formas geométricas (shapes)
  shapes.forEach(sh => {
    const w = sh.width || 160;
    const h = sh.height || 70;
    if (sh.x < minX) minX = sh.x;
    if (sh.y < minY) minY = sh.y;
    if (sh.x + w > maxX) maxX = sh.x + w;
    if (sh.y + h > maxY) maxY = sh.y + h;
  });

  // 3. Limites espaciais para wireframes
  wireframes.forEach(wf => {
    const w = wf.width || 200;
    const h = wf.height || 60;
    if (wf.x < minX) minX = wf.x;
    if (wf.y < minY) minY = wf.y;
    if (wf.x + w > maxX) maxX = wf.x + w;
    if (wf.y + h > maxY) maxY = wf.y + h;
  });

  // 4. Limites espaciais para textos livres
  texts.forEach(txt => {
    const w = txt.width || 180;
    const h = txt.height || 40;
    if (txt.x < minX) minX = txt.x;
    if (txt.y < minY) minY = txt.y;
    if (txt.x + w > maxX) maxX = txt.x + w;
    if (txt.y + h > maxY) maxY = txt.y + h;
  });

  // 5. Limites espaciais para traços livres (drawings)
  drawings.forEach(d => {
    d.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
  });

  // Se o quadro estiver vazio, atribui viewport padrão limpo
  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    minX = 0;
    minY = 0;
    maxX = 800;
    maxY = 500;
  }

  const padding = 60;
  const totalWidth = Math.ceil(Math.max(640, maxX - minX + padding * 2));
  const totalHeight = Math.ceil(Math.max(420, maxY - minY + padding * 2));
  const viewX = Math.floor(minX - padding);
  const viewY = Math.floor(minY - padding);

  // Mapeamento central para conexão de conectores livres
  const elementCenters = new Map<string, { x: number; y: number }>();
  visibleNodes.forEach(node => {
    const p = positions.get(node.id);
    if (p) elementCenters.set(node.id, { x: p.x + p.width / 2, y: p.y + p.height / 2 });
  });
  shapes.forEach(sh => {
    elementCenters.set(sh.id, { x: sh.x + (sh.width || 160) / 2, y: sh.y + (sh.height || 70) / 2 });
  });
  stickies.forEach(s => {
    elementCenters.set(s.id, { x: s.x + (s.width || 180) / 2, y: s.y + (s.height || 140) / 2 });
  });
  wireframes.forEach(wf => {
    elementCenters.set(wf.id, { x: wf.x + (wf.width || 200) / 2, y: wf.y + (wf.height || 60) / 2 });
  });

  // CAMADA A: Traços livres desenhados à mão (Freehand Drawings)
  let drawingsSvg = '';
  drawings.forEach(d => {
    if (!d.points || d.points.length < 2) return;
    const pathD = d.points.reduce((acc, point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, '');

    drawingsSvg += `
      <path 
        d="${pathD}" 
        fill="none" 
        stroke="${d.color || '#f43f5e'}" 
        stroke-width="${d.strokeWidth || 3}" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        opacity="0.95"
      />
    `;
  });

  // CAMADA B: Conectores entre elementos livres
  let freeConnectorsSvg = '';
  connectors.forEach(conn => {
    const p1 = elementCenters.get(conn.fromId);
    const p2 = elementCenters.get(conn.toId);
    if (!p1 || !p2) return;

    const strokeColor = conn.color || '#64748b';
    let pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

    if (conn.style === 'curve') {
      const midX = (p1.x + p2.x) / 2;
      pathD = `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;
    }

    freeConnectorsSvg += `
      <g>
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#arrowhead)" />
        ${conn.label ? `
          <text x="${(p1.x + p2.x) / 2}" y="${(p1.y + p2.y) / 2 - 6}" fill="${textMuted}" font-size="11" font-weight="600" text-anchor="middle">
            ${escapeXml(conn.label)}
          </text>
        ` : ''}
      </g>
    `;
  });

  // CAMADA C: Linhas conectoras do mapa mental
  let mindMapPathsSvg = '';
  if (visibleNodes.length > 0) {
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

        mindMapPathsSvg += `
          <g>
            <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.88" />
            <circle cx="${endX}" cy="${endY}" r="3" fill="${strokeColor}" />
          </g>
        `;
      });
    });
  }

  // CAMADA D: Formas geométricas (Flowchart Shapes)
  let shapesSvg = '';
  shapes.forEach(sh => {
    const w = sh.width || 160;
    const h = sh.height || 70;
    const bg = sh.color || (isLight ? '#ffffff' : '#1e293b');
    const border = sh.borderColor || (isLight ? '#94a3b8' : '#475569');
    const shTextColor = sh.textColor || textColor;
    const lines = wrapTextLines(sh.text || '', 18);
    const textStartY = sh.y + h / 2 - ((lines.length - 1) * 16) / 2 + 4;
    const textBlock = renderSvgText(lines, sh.x + w / 2, textStartY, 16, shTextColor, 13, 600, 'middle');

    if (sh.type === 'circle') {
      const radius = Math.min(w, h) / 2;
      shapesSvg += `
        <g>
          <circle cx="${sh.x + w / 2}" cy="${sh.y + h / 2}" r="${radius}" fill="${bg}" stroke="${border}" stroke-width="2" />
          ${textBlock}
        </g>
      `;
    } else if (sh.type === 'diamond') {
      const cx = sh.x + w / 2;
      const cy = sh.y + h / 2;
      shapesSvg += `
        <g>
          <polygon points="${cx},${sh.y} ${sh.x + w},${cy} ${cx},${sh.y + h} ${sh.x},${cy}" fill="${bg}" stroke="${border}" stroke-width="2" />
          ${textBlock}
        </g>
      `;
    } else if (sh.type === 'pill') {
      shapesSvg += `
        <g>
          <rect x="${sh.x}" y="${sh.y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="${border}" stroke-width="2" />
          ${textBlock}
        </g>
      `;
    } else {
      // rectangle / rounded / card
      const rx = sh.type === 'rounded' ? 12 : 4;
      shapesSvg += `
        <g>
          <rect x="${sh.x}" y="${sh.y}" width="${w}" height="${h}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="2" />
          ${textBlock}
        </g>
      `;
    }
  });

  // CAMADA E: Notas adesivas (Sticky Notes)
  let stickiesSvg = '';
  stickies.forEach(s => {
    const w = s.width || 180;
    const h = s.height || 140;
    const bg = s.color || '#fef08a';
    const lines = wrapTextLines(s.text || 'Nota adesiva', 20);
    const textStartY = s.y + 24;
    const textBlock = renderSvgText(lines, s.x + 14, textStartY, 18, '#1e293b', 13, 500, 'start');

    stickiesSvg += `
      <g>
        <!-- Sombra sutil -->
        <rect x="${s.x + 2}" y="${s.y + 3}" width="${w}" height="${h}" rx="6" fill="rgba(0,0,0,0.14)" />
        <!-- Cartão adesivo -->
        <rect x="${s.x}" y="${s.y}" width="${w}" height="${h}" rx="6" fill="${bg}" />
        ${textBlock}
        ${s.author ? `
          <text x="${s.x + w - 12}" y="${s.y + h - 10}" fill="rgba(0,0,0,0.45)" font-size="10" font-weight="600" text-anchor="end">
            ${escapeXml(s.author)}
          </text>
        ` : ''}
      </g>
    `;
  });

  // CAMADA F: Componentes Wireframe
  let wireframesSvg = '';
  wireframes.forEach(wf => {
    const w = wf.width || 200;
    const h = wf.height || 50;

    if (wf.type === 'button') {
      wireframesSvg += `
        <g>
          <rect x="${wf.x}" y="${wf.y}" width="${w}" height="${h}" rx="6" fill="#7c3aed" />
          <text x="${wf.x + w / 2}" y="${wf.y + h / 2 + 5}" fill="#ffffff" font-size="13" font-weight="600" text-anchor="middle">
            ${escapeXml(wf.label || 'Botão')}
          </text>
        </g>
      `;
    } else if (wf.type === 'input') {
      wireframesSvg += `
        <g>
          <text x="${wf.x}" y="${wf.y - 6}" fill="${textMuted}" font-size="11" font-weight="600">
            ${escapeXml(wf.label || 'Campo')}
          </text>
          <rect x="${wf.x}" y="${wf.y}" width="${w}" height="${h}" rx="6" fill="${canvasBg}" stroke="${borderColor}" stroke-width="1.5" />
          <text x="${wf.x + 12}" y="${wf.y + h / 2 + 5}" fill="${textMuted}" font-size="12">Digite aqui...</text>
        </g>
      `;
    } else {
      // Container Card
      wireframesSvg += `
        <g>
          <rect x="${wf.x}" y="${wf.y}" width="${w}" height="${h}" rx="8" fill="${cardBg}" stroke="${borderColor}" stroke-width="1.5" />
          <text x="${wf.x + 14}" y="${wf.y + 24}" fill="${textColor}" font-size="14" font-weight="700">
            ${escapeXml(wf.label || 'Card')}
          </text>
        </g>
      `;
    }
  });

  // CAMADA G: Textos livres (Free Text Items)
  let textsSvg = '';
  texts.forEach(txt => {
    const fs = txt.fontSize || 14;
    const color = txt.color || textColor;
    const lines = wrapTextLines(txt.text || '', 32);
    const textBlock = renderSvgText(lines, txt.x, txt.y + fs, fs * 1.3, color, fs, 600, 'start');
    textsSvg += `<g>${textBlock}</g>`;
  });

  // CAMADA H: Nós do Mapa Mental
  let mindMapNodesSvg = '';
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

    mindMapNodesSvg += `
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
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
        </marker>
      </defs>
      <!-- Fundo do Canvas -->
      <rect x="${viewX}" y="${viewY}" width="${totalWidth}" height="${totalHeight}" fill="${canvasBg}" />
      
      <!-- Camada de Conectores e Traços -->
      ${freeConnectorsSvg}
      ${mindMapPathsSvg}
      ${drawingsSvg}
      
      <!-- Camada de Elementos Visuais e Nós -->
      ${shapesSvg}
      ${wireframesSvg}
      ${stickiesSvg}
      ${textsSvg}
      ${mindMapNodesSvg}
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
  a.download = `${board.title.replace(/\s+/g, '_')}_whimflow.svg`;
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
 * Exporta o Quadro completo como Outline Markdown (.md) estruturado
 * contemplando documento, mapa mental, notas adesivas, fluxogramas e wireframes.
 */
export function exportBoardAsMarkdown(board: Board) {
  const lines: string[] = [];
  lines.push(`# ${board.title}`);
  lines.push('');
  lines.push(`> Exportado em ${new Date().toLocaleDateString('pt-BR')} • Whimflow (Exportação Pro Sem Marca D'Água)`);
  lines.push('');

  // 1. Documento embutido (se houver)
  if (board.docContent && board.docContent.trim()) {
    lines.push('## Documento e Especificações');
    lines.push('');
    lines.push(board.docContent.trim());
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // 2. Mapa Mental
  const nodes = board.mindMapNodes || [];
  if (nodes.length > 0) {
    const root = nodes.find(n => n.side === 'root') || nodes[0];
    const nodeMap = new Map<string, MindMapNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    lines.push('## Estrutura do Mapa Mental');
    lines.push('');
    lines.push(`### ${root.text || 'Tópico Central'}`);
    lines.push('');

    const visit = (nodeId: string, level: number) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      const indent = '  '.repeat(level);
      lines.push(`${indent}- ${node.text || 'Sem título'}`);
      (node.childrenIds || []).forEach(cid => visit(cid, level + 1));
    };

    (root.childrenIds || []).forEach(cid => visit(cid, 0));
    lines.push('');
  }

  // 3. Notas Adesivas (Stickies)
  if (board.stickies && board.stickies.length > 0) {
    lines.push('## Notas Adesivas & Brainstorming');
    lines.push('');
    board.stickies.forEach(s => {
      const authorText = s.author ? ` *(por ${s.author})*` : '';
      lines.push(`- **[Nota]** ${s.text || 'Nota em branco'}${authorText}`);
    });
    lines.push('');
  }

  // 4. Formas de Fluxograma
  if (board.shapes && board.shapes.length > 0) {
    lines.push('## Elementos de Fluxograma & Formas');
    lines.push('');
    board.shapes.forEach(sh => {
      lines.push(`- **[${sh.type.toUpperCase()}]** ${sh.text || 'Sem rótulo'}`);
    });
    lines.push('');
  }

  // 5. Componentes de Interface (Wireframes)
  if (board.wireframes && board.wireframes.length > 0) {
    lines.push('## Componentes de Interface (Wireframes)');
    lines.push('');
    board.wireframes.forEach(wf => {
      lines.push(`- **[${wf.type.toUpperCase()}]** ${wf.label || 'Sem rótulo'}`);
    });
    lines.push('');
  }

  // 6. Textos Livres
  if (board.texts && board.texts.length > 0) {
    lines.push('## Anotações e Textos Livres');
    lines.push('');
    board.texts.forEach(txt => {
      lines.push(`- ${txt.text}`);
    });
    lines.push('');
  }

  const mdContent = lines.join('\n');
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${board.title.replace(/\s+/g, '_')}_completo.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
