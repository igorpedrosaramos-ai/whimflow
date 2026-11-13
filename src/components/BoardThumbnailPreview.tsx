import React, { useMemo } from 'react';
import { Board, MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath } from '../utils/treeLayout';
import { measureNodeText } from '../utils/textMeasurement';

interface BoardThumbnailPreviewProps {
  board: Board;
  isDark?: boolean;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const BoardThumbnailPreview: React.FC<BoardThumbnailPreviewProps> = ({ board, isDark = false }) => {
  const nodes = board.mindMapNodes || [];
  const stickies = board.stickies || [];
  const wireframes = board.wireframes || [];
  const shapes = board.shapes || [];
  const texts = board.texts || [];
  const drawings = board.drawings || [];

  // 1. Determinação de perfil do projeto
  const isStickiesDominant = stickies.length > 0 && nodes.length <= 1 && shapes.length === 0;
  const isWireframeDominant = wireframes.length > 0 && nodes.length <= 1;
  const isDocDominant = (texts.length > 0 || (board.title?.toLowerCase().includes('doc') && nodes.length <= 1)) && stickies.length === 0 && shapes.length === 0;
  
  const rootNodeCandidate = nodes.find(n => n.side === 'root' || !n.parentId) || nodes[0];
  const isRootDefault = !rootNodeCandidate || 
    !rootNodeCandidate.text || 
    rootNodeCandidate.text === 'Ideia Central' || 
    rootNodeCandidate.text === 'Meu Novo Projeto';

  const isEmptyBoard = (nodes.length === 0 || (nodes.length === 1 && isRootDefault && (!rootNodeCandidate.childrenIds || rootNodeCandidate.childrenIds.length === 0))) &&
    stickies.length === 0 && 
    wireframes.length === 0 && 
    shapes.length === 0 && 
    texts.length === 0 &&
    drawings.length === 0;

  // ─── CASO 1: QUADRO EM BRANCO (ESTADO VAZIO LIMPO) ─────────────────────────
  if (isEmptyBoard) {
    return (
      <svg
        viewBox="0 0 240 120"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <pattern id={`dot-grid-empty-${board.id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill={isDark ? '#2e3a4e' : '#e2e8f0'} />
          </pattern>
        </defs>
        <rect x="0" y="0" width="240" height="120" fill={`url(#dot-grid-empty-${board.id})`} />

        <rect
          x="65"
          y="42"
          width="110"
          height="36"
          rx="6"
          fill={isDark ? '#1a2230' : '#ffffff'}
          stroke="#818cf8"
          strokeWidth="1.6"
          strokeDasharray="4 3"
        />
        <text
          x="120"
          y="64"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill={isDark ? '#94a3b8' : '#64748b'}
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
        >
          + Quadro em branco
        </text>
      </svg>
    );
  }

  // ─── CASO 2: MINIATURA DE NOTAS ADESIVAS (STICKIES) ─────────────────────────
  if (isStickiesDominant) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    stickies.forEach(s => {
      const x = s.x || 0;
      const y = s.y || 0;
      const w = s.width || 180;
      const h = s.height || 140;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    const padX = Math.max(20, (maxX - minX) * 0.08);
    const padY = Math.max(16, (maxY - minY) * 0.1);
    const boxW = Math.max(100, maxX - minX + 2 * padX);
    const boxH = Math.max(60, maxY - minY + 2 * padY);
    const viewBox = `${minX - padX} ${minY - padY} ${boxW} ${boxH}`;

    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <pattern id={`dot-grid-stickies-${board.id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill={isDark ? '#2e3a4e' : '#e2e8f0'} />
          </pattern>
        </defs>
        <rect x={minX - padX} y={minY - padY} width={boxW} height={boxH} fill={`url(#dot-grid-stickies-${board.id})`} />

        {stickies.map(s => {
          const w = s.width || 180;
          const h = s.height || 140;
          const color = s.color || '#fef08a';

          return (
            <g key={s.id}>
              <rect
                x={s.x + 2}
                y={s.y + 3}
                width={w}
                height={h}
                rx="6"
                fill="rgba(0,0,0,0.06)"
              />
              <rect
                x={s.x}
                y={s.y}
                width={w}
                height={h}
                rx="6"
                fill={color}
                stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}
                strokeWidth="1.5"
              />
              <rect
                x={s.x + 14}
                y={s.y + 20}
                width={Math.min(w - 28, 120)}
                height="8"
                rx="2"
                fill="rgba(15, 23, 42, 0.35)"
              />
              <rect
                x={s.x + 14}
                y={s.y + 36}
                width={Math.min(w - 32, 135)}
                height="6"
                rx="1.5"
                fill="rgba(15, 23, 42, 0.20)"
              />
              <rect
                x={s.x + 14}
                y={s.y + 50}
                width={Math.min(w - 44, 95)}
                height="6"
                rx="1.5"
                fill="rgba(15, 23, 42, 0.15)"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  // ─── CASO 3: MINIATURA DE WIREFRAMES ─────────────────────────────────────────
  if (isWireframeDominant) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    wireframes.forEach(w => {
      const x = w.x || 0;
      const y = w.y || 0;
      const width = w.width || 180;
      const height = w.height || 100;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + width > maxX) maxX = x + width;
      if (y + height > maxY) maxY = y + height;
    });

    const padX = Math.max(24, (maxX - minX) * 0.08);
    const padY = Math.max(18, (maxY - minY) * 0.1);
    const boxW = Math.max(100, maxX - minX + 2 * padX);
    const boxH = Math.max(70, maxY - minY + 2 * padY);
    const viewBox = `${minX - padX} ${minY - padY} ${boxW} ${boxH}`;

    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <pattern id={`dot-grid-wf-${board.id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill={isDark ? '#2e3a4e' : '#e2e8f0'} />
          </pattern>
        </defs>
        <rect x={minX - padX} y={minY - padY} width={boxW} height={boxH} fill={`url(#dot-grid-wf-${board.id})`} />

        {wireframes.map(wf => {
          const w = wf.width || 180;
          const h = wf.height || 100;
          const isScreenCard = wf.type === 'card' || h > 150;

          if (isScreenCard) {
            return (
              <g key={wf.id}>
                <rect
                  x={wf.x}
                  y={wf.y}
                  width={w}
                  height={h}
                  rx="10"
                  fill={isDark ? '#1a2230' : '#ffffff'}
                  stroke={isDark ? '#3b4961' : '#cbd5e1'}
                  strokeWidth="2.5"
                />
                <rect x={wf.x + 20} y={wf.y + 12} width={w - 40} height="6" rx="2" fill={isDark ? '#334155' : '#e2e8f0'} />
                <rect x={wf.x + 16} y={wf.y + 34} width={w - 32} height={Math.max(28, h * 0.32)} rx="4" fill={isDark ? '#253043' : '#f8fafc'} stroke={isDark ? '#334155' : '#e2e8f0'} strokeWidth="1" />
                <rect x={wf.x + 20} y={wf.y + h - 42} width={w - 40} height="22" rx="5" fill="#0284c7" />
              </g>
            );
          }

          if (wf.type === 'button') {
            return (
              <rect
                key={wf.id}
                x={wf.x}
                y={wf.y}
                width={w}
                height={h}
                rx="6"
                fill="#0284c7"
              />
            );
          }

          return (
            <rect
              key={wf.id}
              x={wf.x}
              y={wf.y}
              width={w}
              height={h}
              rx="4"
              fill={isDark ? '#202a3a' : '#f8fafc'}
              stroke={isDark ? '#3b4961' : '#cbd5e1'}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
  }

  // ─── CASO 4: MINIATURA DE DOCUMENTO EXECUTIVO ────────────────────────────────
  if (isDocDominant) {
    return (
      <svg
        viewBox="0 0 240 130"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <pattern id={`dot-grid-doc-${board.id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill={isDark ? '#2e3a4e' : '#e2e8f0'} />
          </pattern>
        </defs>
        <rect x="0" y="0" width="240" height="130" fill={`url(#dot-grid-doc-${board.id})`} />

        <rect x="48" y="10" width="144" height="110" rx="6" fill="rgba(0,0,0,0.08)" />
        <rect
          x="45"
          y="8"
          width="144"
          height="110"
          rx="6"
          fill={isDark ? '#1a2230' : '#ffffff'}
          stroke={isDark ? '#2e3a4e' : '#cbd5e1'}
          strokeWidth="1.5"
        />

        <rect x="45" y="8" width="144" height="24" rx="6" fill={isDark ? '#222d3e' : '#f1f5f9'} />
        <rect x="58" y="17" width="55" height="6" rx="2" fill="#0284c7" />

        <rect x="58" y="42" width="118" height="6" rx="2" fill={isDark ? '#475569' : '#cbd5e1'} />
        <rect x="58" y="55" width="105" height="5" rx="1.5" fill={isDark ? '#334155' : '#e2e8f0'} />
        <rect x="58" y="66" width="90" height="5" rx="1.5" fill={isDark ? '#334155' : '#e2e8f0'} />
        
        <circle cx="62" cy="88" r="3" fill="#10b981" />
        <rect x="70" y="85" width="85" height="6" rx="2" fill={isDark ? '#475569' : '#cbd5e1'} />
        <rect x="70" y="96" width="65" height="5" rx="1.5" fill={isDark ? '#334155' : '#e2e8f0'} />
      </svg>
    );
  }

  // ─── CASO 5: MINIATURA 100% REAL DE MAPA MENTAL / FLUXOGRAMA / QUADRO GERAL ──
  return useMemo(() => {
    const isOrg = board.layoutType === 'orgchart';
    const rootNode = nodes.find(n => n.side === 'root' || !n.parentId) || nodes[0];
    const nodeMap = new Map<string, MindMapNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    // Determina visibilidade com base no colapso de nós ancestrais
    const isNodeVisible = (node: MindMapNode): boolean => {
      let cur = node;
      while (cur.parentId) {
        const parent = nodeMap.get(cur.parentId);
        if (!parent) break;
        if (parent.collapsed) return false;
        cur = parent;
      }
      return true;
    };

    const visibleNodes = nodes.filter(isNodeVisible);
    const effectiveNodes = visibleNodes.length > 0 ? visibleNodes : (rootNode ? [rootNode] : []);

    // Layout calculado com proporção equilibrada (horizontalGap amplo para curvas orgânicas)
    const layout = calculateMindMapLayout(effectiveNodes, rootNode?.id || 'root', {
      horizontalGap: isOrg ? 45 : 170,
      verticalGap: isOrg ? 36 : 10,
      rootX: 0,
      rootY: 0,
      layoutType: board.layoutType
    });

    const nodePositions = new Map<string, { 
      x: number; 
      y: number; 
      w: number; 
      h: number; 
      color: string; 
      isRoot: boolean;
      text: string;
      collapsed?: boolean;
      hasChildren: boolean;
      descendantCount: number;
      isPrimaryChild: boolean;
    }>();

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Função de contagem de descendentes recolhidos
    const countDescendants = (nodeId: string): number => {
      let count = 0;
      const stack = [nodeId];
      const visited = new Set<string>();
      while (stack.length > 0) {
        const curId = stack.pop()!;
        if (visited.has(curId)) continue;
        visited.add(curId);
        const n = nodeMap.get(curId);
        if (!n || !n.childrenIds) continue;
        for (const cid of n.childrenIds) {
          if (!visited.has(cid)) {
            count++;
            stack.push(cid);
          }
        }
      }
      return count;
    };

    const totalNodesCount = effectiveNodes.length;
    const isDenseMap = totalNodesCount > 30;

    effectiveNodes.forEach(node => {
      const computed = layout.get(node.id);
      const isRoot = node.id === rootNode?.id;
      const isPrimaryChild = node.parentId === rootNode?.id;
      const measured = measureNodeText(node);

      const baseX = computed ? computed.x : (node.x || 0);
      const baseY = computed ? computed.y : (node.y || 0);
      const x = baseX + (node.offsetX || 0);
      const y = baseY + (node.offsetY || 0);

      const textLen = (node.text || '').length;
      const estimatedWidth = Math.max(30, Math.min(180, textLen * 7.5 + 16));
      const w = isRoot 
        ? Math.max(120, Math.min(240, (measured?.width || estimatedWidth) + 32))
        : Math.max(24, Math.min(180, measured?.width || estimatedWidth));
      const h = isRoot 
        ? Math.max(34, (measured?.height || 26) + 12) 
        : Math.max(16, measured?.height || 18);

      const rawColor = node.color;
      const isColorWhite = !rawColor || rawColor.toLowerCase() === '#ffffff' || rawColor.toLowerCase() === '#fff';
      const color = isColorWhite ? (isDark ? '#6366f1' : '#7c3aed') : rawColor;
      
      const hasChildren = Boolean(node.childrenIds && node.childrenIds.length > 0);
      const descendantCount = node.collapsed ? countDescendants(node.id) : 0;

      nodePositions.set(node.id, {
        x,
        y,
        w,
        h,
        color,
        isRoot,
        text: node.text || '',
        collapsed: node.collapsed,
        hasChildren,
        descendantCount,
        isPrimaryChild
      });

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    // Engloba formas geométricas (shapes) no bounding box
    shapes.forEach(sh => {
      const w = sh.width || 140;
      const h = sh.height || 60;
      if (sh.x < minX) minX = sh.x;
      if (sh.y < minY) minY = sh.y;
      if (sh.x + w > maxX) maxX = sh.x + w;
      if (sh.y + h > maxY) maxY = sh.y + h;
    });

    // Engloba notas adesivas (stickies) no bounding box
    stickies.forEach(s => {
      const w = s.width || 160;
      const h = s.height || 120;
      if (s.x < minX) minX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.x + w > maxX) maxX = s.x + w;
      if (s.y + h > maxY) maxY = s.y + h;
    });

    // Engloba wireframes no bounding box
    wireframes.forEach(wf => {
      const w = wf.width || 160;
      const h = wf.height || 60;
      if (wf.x < minX) minX = wf.x;
      if (wf.y < minY) minY = wf.y;
      if (wf.x + w > maxX) maxX = wf.x + w;
      if (wf.y + h > maxY) maxY = wf.y + h;
    });

    // Engloba textos livres
    texts.forEach(txt => {
      const w = txt.width || 140;
      const h = txt.height || 40;
      if (txt.x < minX) minX = txt.x;
      if (txt.y < minY) minY = txt.y;
      if (txt.x + w > maxX) maxX = txt.x + w;
      if (txt.y + h > maxY) maxY = txt.y + h;
    });

    // Fallback de segurança se minX/minY forem infinitos
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      minX = -120;
      minY = -60;
      maxX = 120;
      maxY = 60;
    }

    const rawSpanX = Math.max(160, maxX - minX);
    const rawSpanY = Math.max(90, maxY - minY);

    // ENQUADRAMENTO NATURAL HARMONIOSO:
    // O viewBox abraça o conteúdo com respiro proporcional.
    // Se o canvas for excessivamente vertical (ex: Orion Sushi com 25 ramos verticais de uma linha só),
    // limitamos a altura máxima do enquadramento a 1.25x a largura para preservar legibilidade e amplitude!
    const padX = Math.max(28, rawSpanX * 0.06);
    const padY = Math.max(22, rawSpanY * 0.06);

    let viewMinX = minX - padX;
    let viewMinY = minY - padY;
    let viewWidth = rawSpanX + padX * 2;
    let viewHeight = rawSpanY + padY * 2;

    const isExcessivelyVertical = viewHeight > viewWidth * 1.25;
    if (isExcessivelyVertical) {
      const rootPos = nodePositions.get(rootNode?.id || '');
      const rootY = rootPos ? rootPos.y + rootPos.h / 2 : minY;
      
      viewHeight = viewWidth * 1.10;
      viewMinY = Math.max(minY - padY, rootY - viewHeight * 0.35);
    }

    const viewBox = `${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`;

    // Agrupamento pai -> filhos para linhas conectoras limpas
    const parentChildrenMap = new Map<string, MindMapNode[]>();
    effectiveNodes.forEach(child => {
      if (!child.parentId) return;
      const parent = nodeMap.get(child.parentId);
      if (!parent || parent.collapsed) return;
      if (!parentChildrenMap.has(child.parentId)) {
        parentChildrenMap.set(child.parentId, []);
      }
      parentChildrenMap.get(child.parentId)!.push(child);
    });

    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <pattern id={`dot-grid-mindmap-${board.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill={isDark ? '#2e3a4e' : '#e2e8f0'} />
          </pattern>
        </defs>

        {/* Fundo do Canvas */}
        <rect
          x={viewMinX}
          y={viewMinY}
          width={viewWidth}
          height={viewHeight}
          fill={`url(#dot-grid-mindmap-${board.id})`}
        />

        {/* 1. Conectores e Ramos Reais do Mapa Mental */}
        {Array.from(parentChildrenMap.entries()).map(([parentId, children]) => {
          const parentPos = nodePositions.get(parentId);
          if (!parentPos) return null;

          const isRootParent = parentPos.isRoot;

          return children.map(child => {
            const childPos = nodePositions.get(child.id);
            if (!childPos) return null;

            let pathD = '';
            if (isOrg) {
              const startX = parentPos.x + parentPos.w / 2;
              const startY = parentPos.y + parentPos.h;
              const endX = childPos.x + childPos.w / 2;
              const endY = childPos.y;
              const midY = (startY + endY) / 2;
              pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
            } else {
              const isChildOnLeft = (childPos.x + childPos.w / 2) < (parentPos.x + parentPos.w / 2);
              const startX = isChildOnLeft ? parentPos.x : parentPos.x + parentPos.w;
              const startY = parentPos.y + parentPos.h / 2;
              const endX = isChildOnLeft ? childPos.x + childPos.w : childPos.x;
              const endY = childPos.y + childPos.h / 2;
              pathD = getBezierPath(startX, startY, endX, endY);
            }

            const strokeColor = childPos.color || parentPos.color || '#818cf8';
            const strokeWidth = isRootParent ? 2.8 : 1.9;

            return (
              <path
                key={`conn-${child.id}`}
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.92}
              />
            );
          });
        })}

        {/* 2. Formas Geométricas (se houverem no board) */}
        {shapes.map(sh => {
          const w = sh.width || 140;
          const h = sh.height || 60;
          const bg = sh.color || (isDark ? '#1a2230' : '#ffffff');
          const border = sh.borderColor || (isDark ? '#3b4961' : '#cbd5e1');

          if (sh.type === 'circle') {
            const r = Math.min(w, h) / 2;
            return (
              <circle
                key={`sh-${sh.id}`}
                cx={sh.x + w / 2}
                cy={sh.y + h / 2}
                r={r}
                fill={bg}
                stroke={border}
                strokeWidth="1.5"
              />
            );
          }

          if (sh.type === 'diamond') {
            const cx = sh.x + w / 2;
            const cy = sh.y + h / 2;
            return (
              <polygon
                key={`sh-${sh.id}`}
                points={`${cx},${sh.y} ${sh.x + w},${cy} ${cx},${sh.y + h} ${sh.x},${cy}`}
                fill={bg}
                stroke={border}
                strokeWidth="1.5"
              />
            );
          }

          return (
            <rect
              key={`sh-${sh.id}`}
              x={sh.x}
              y={sh.y}
              width={w}
              height={h}
              rx={sh.type === 'rounded' ? 8 : 4}
              fill={bg}
              stroke={border}
              strokeWidth="1.5"
            />
          );
        })}

        {/* 3. Notas Adesivas (se houverem no board) */}
        {stickies.map(s => {
          const w = s.width || 160;
          const h = s.height || 120;
          return (
            <g key={`st-${s.id}`}>
              <rect x={s.x + 2} y={s.y + 3} width={w} height={h} rx="5" fill="rgba(0,0,0,0.06)" />
              <rect x={s.x} y={s.y} width={w} height={h} rx="5" fill={s.color || '#fef08a'} />
            </g>
          );
        })}

        {/* 4. Nós do Mapa Mental (100% Sem Cards Artificiais) */}
        {effectiveNodes.map(node => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          // Nó Raiz Principal: Cápsula Executiva Sólida com Texto Nítido e Alto Contraste
          if (pos.isRoot) {
            const rawNodeColor = node.color;
            const isWhiteRoot = !rawNodeColor || rawNodeColor.toLowerCase() === '#ffffff' || rawNodeColor.toLowerCase() === '#fff';
            
            const rootFill = isWhiteRoot ? (isDark ? '#1e293b' : '#ffffff') : (pos.color || '#7c3aed');
            const rootStroke = isWhiteRoot ? (isDark ? '#475569' : '#334155') : 'none';
            const rootTextColor = isWhiteRoot ? (isDark ? '#f8fafc' : '#0f172a') : '#ffffff';

            return (
              <g key={`node-${node.id}`}>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.w}
                  height={pos.h}
                  rx="6"
                  fill={rootFill}
                  stroke={rootStroke}
                  strokeWidth="1.8"
                />
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + pos.h / 2 + 5}
                  textAnchor="middle"
                  fill={rootTextColor}
                  fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="13"
                  fontWeight="700"
                  letterSpacing="-0.01em"
                >
                  {escapeXml(pos.text)}
                </text>
              </g>
            );
          }

          // Se o mapa for moderado (<= 35 nós) ou ramo primário, renderiza texto real em SVG
          const shouldRenderRealText = !isDenseMap || pos.isPrimaryChild;

          return (
            <g key={`node-${node.id}`}>
              {shouldRenderRealText ? (
                <text
                  x={pos.x}
                  y={pos.y + pos.h / 2 + 4.5}
                  fill={isDark ? '#f1f5f9' : '#0f172a'}
                  fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize={pos.isPrimaryChild ? '12' : '11'}
                  fontWeight={pos.isPrimaryChild ? '600' : '500'}
                  letterSpacing="-0.01em"
                >
                  {escapeXml(pos.text)}
                </text>
              ) : (
                // Em árvores muito densas (> 35 nós em ramos profundos), traço tipográfico proporcional
                <rect
                  x={pos.x}
                  y={pos.y + pos.h / 2 - 2}
                  width={Math.max(20, Math.min(pos.w * 0.8, 90))}
                  height="4"
                  rx="2"
                  fill={isDark ? '#94a3b8' : '#64748b'}
                  opacity={0.85}
                />
              )}

              {/* Badge de nós colapsados (se houver filhos recolhidos) */}
              {pos.collapsed && pos.descendantCount > 0 && (
                <g>
                  <circle
                    cx={pos.x + pos.w + 10}
                    cy={pos.y + pos.h / 2}
                    r="7.5"
                    fill={pos.color || '#818cf8'}
                  />
                  <text
                    x={pos.x + pos.w + 10}
                    y={pos.y + pos.h / 2 + 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontFamily="Inter, system-ui, -apple-system, sans-serif"
                    fontSize="9"
                    fontWeight="700"
                  >
                    {pos.descendantCount > 99 ? '99+' : pos.descendantCount}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [
    board.id,
    board.updatedAt,
    board.layoutType,
    nodes,
    stickies,
    wireframes,
    shapes,
    texts,
    drawings,
    isDark
  ]);
};
