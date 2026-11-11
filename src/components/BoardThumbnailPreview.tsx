import React, { useMemo } from 'react';
import { Board, MindMapNode } from '../types';
import { calculateMindMapLayout } from '../utils/treeLayout';

interface BoardThumbnailPreviewProps {
  board: Board;
  isDark?: boolean;
}

export const BoardThumbnailPreview: React.FC<BoardThumbnailPreviewProps> = ({ board, isDark = false }) => {
  const nodes = board.mindMapNodes || [];
  const stickies = board.stickies || [];
  const wireframes = board.wireframes || [];
  const shapes = board.shapes || [];
  const texts = board.texts || [];

  // 1. Determina o perfil predominante do projeto
  const isStickiesDominant = stickies.length > 0 && nodes.length <= 1;
  const isWireframeDominant = wireframes.length > 0 && nodes.length <= 1;
  const isDocDominant = (texts.length > 0 || (board.title?.toLowerCase().includes('doc') && nodes.length <= 1)) && stickies.length === 0;
  const isEmptyBoard = nodes.length <= 1 && stickies.length === 0 && wireframes.length === 0 && shapes.length === 0 && texts.length === 0;

  // ─── CASO 1: MINIATURA DE NOTAS ADESIVAS (STICKIES) ─────────────────────────
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
              {/* Sombra sutil da nota adesiva */}
              <rect
                x={s.x + 2}
                y={s.y + 3}
                width={w}
                height={h}
                rx="6"
                fill="rgba(0,0,0,0.06)"
              />
              {/* Corpo da nota com cor real */}
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
              {/* Linhas indicativas de texto manuscrito com alta legibilidade visual */}
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

  // ─── CASO 2: MINIATURA DE WIREFRAMES ─────────────────────────────────────────
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

  // ─── CASO 3: MINIATURA DE DOCUMENTO / TEXTO EXECUTIVO ────────────────────────
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

  // ─── CASO 4: QUADRO VAZIO / SEM ELEMENTOS RELEVANTES ────────────────────────
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
        >
          + Quadro em branco
        </text>
      </svg>
    );
  }

  // ─── CASO 5: MINIATURA REAL DE MAPA MENTAL / ÁRVORE HIERÁRQUICA ───────────────
  // Para árvores densas ou muito extensas (como cardápios de 100+ itens),
  // selecionamos ramos estruturais representativos equilibrados (esquerda e direita)
  // para compor uma miniatura harmônica com proporção horizontal ideal (2:1).
  const root = nodes.find(n => n.side === 'root' || !n.parentId) || nodes[0];
  const isOrg = board.layoutType === 'orgchart';

  // Filhos imediatos do root
  const rootChildren = nodes.filter(n => n.parentId === (root?.id || 'root'));

  let displayNodes: MindMapNode[] = [];

  if (nodes.length <= 16) {
    displayNodes = nodes;
  } else {
    // Para boards com muitos nós, seleciona até 6 a 8 ramos primários
    const maxPrimary = isOrg ? 5 : 6;
    const selectedPrimary = rootChildren.slice(0, maxPrimary);
    const selectedPrimaryIds = new Set(selectedPrimary.map(p => p.id));

    // Se todos estiverem no mesmo lado (unilateral), balanceia para a miniatura
    const allSameSide = !isOrg && selectedPrimary.length >= 2 && (
      selectedPrimary.every(p => p.side === 'right') ||
      selectedPrimary.every(p => p.side === 'left') ||
      selectedPrimary.every(p => !p.side)
    );

    displayNodes = [root ? { ...root, side: 'root' as const } : nodes[0]];

    selectedPrimary.forEach((p, idx) => {
      const assignedSide: 'left' | 'right' | 'root' | undefined = allSameSide
        ? (idx < Math.ceil(selectedPrimary.length / 2) ? 'right' : 'left')
        : p.side;

      displayNodes.push({
        ...p,
        side: assignedSide
      });

      // Pega até 2 filhos imediatos de cada ramo primário
      const grandChildren = nodes.filter(n => n.parentId === p.id).slice(0, 2);
      grandChildren.forEach(gc => {
        displayNodes.push({
          ...gc,
          side: assignedSide
        });
      });
    });
  }

  const layout = calculateMindMapLayout(displayNodes, root?.id || 'root', {
    layoutType: isOrg ? 'orgchart' : 'bidirectional',
    horizontalGap: isOrg ? 35 : 55,
    verticalGap: isOrg ? 28 : 14,
    rootX: 0,
    rootY: 0
  });

  const nodePositions = new Map<string, { x: number; y: number; w: number; h: number; color: string; isRoot: boolean }>();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  displayNodes.forEach(n => {
    const computed = layout.get(n.id);
    const x = (computed ? computed.x : (n.x || 0)) + (n.offsetX || 0);
    const y = (computed ? computed.y : (n.y || 0)) + (n.offsetY || 0);
    const isRoot = n.id === root?.id;
    const w = isRoot ? 100 : (computed ? Math.min(85, Math.max(45, computed.width * 0.65)) : 55);
    const h = isRoot ? 26 : (computed ? Math.min(22, Math.max(16, computed.height * 0.65)) : 18);
    const color = n.color || (isRoot ? '#7c3aed' : '#818cf8');

    nodePositions.set(n.id, { x, y, w, h, color, isRoot });

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  });

  const spanX = Math.max(140, maxX - minX);
  const spanY = Math.max(90, maxY - minY);
  const padX = Math.max(24, spanX * 0.08);
  const padY = Math.max(18, spanY * 0.12);

  const viewBox = `${minX - padX} ${minY - padY} ${spanX + 2 * padX} ${spanY + 2 * padY}`;

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
      <rect
        x={minX - padX}
        y={minY - padY}
        width={spanX + 2 * padX}
        height={spanY + 2 * padY}
        fill={`url(#dot-grid-mindmap-${board.id})`}
      />

      {/* 1. Conectores e Ramos em SVG */}
      {displayNodes.map(node => {
        if (!node.parentId) return null;
        const parentPos = nodePositions.get(node.parentId);
        const childPos = nodePositions.get(node.id);
        if (!parentPos || !childPos) return null;

        let pathD = '';
        if (isOrg) {
          const startX = parentPos.x + parentPos.w / 2;
          const startY = parentPos.y + parentPos.h;
          const endX = childPos.x + childPos.w / 2;
          const endY = childPos.y;
          const midY = (startY + endY) / 2;
          pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
        } else {
          const isRight = childPos.x >= parentPos.x;
          const startX = isRight ? parentPos.x + parentPos.w : parentPos.x;
          const startY = parentPos.y + parentPos.h / 2;
          const endX = isRight ? childPos.x : childPos.x + childPos.w;
          const endY = childPos.y + childPos.h / 2;
          const midX = (startX + endX) / 2;
          pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
        }

        return (
          <path
            key={`conn-${node.id}`}
            d={pathD}
            fill="none"
            stroke={childPos.color || '#818cf8'}
            strokeWidth="1.8"
            strokeOpacity={0.75}
          />
        );
      })}

      {/* 2. Nós do Mapa Mental com cores e proporções reais */}
      {displayNodes.map(node => {
        const pos = nodePositions.get(node.id);
        if (!pos) return null;

        if (pos.isRoot) {
          return (
            <g key={node.id}>
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx="6"
                fill={pos.color || '#7c3aed'}
              />
              <rect
                x={pos.x + 8}
                y={pos.y + pos.h / 2 - 2.5}
                width={Math.max(20, pos.w - 16)}
                height="5"
                rx="1.5"
                fill="#ffffff"
              />
            </g>
          );
        }

        return (
          <g key={node.id}>
            <rect
              x={pos.x}
              y={pos.y}
              width={pos.w}
              height={pos.h}
              rx="4"
              fill={isDark ? '#1a2230' : '#ffffff'}
              stroke={pos.color || '#94a3b8'}
              strokeWidth="1.6"
            />
            <rect
              x={pos.x + 6}
              y={pos.y + pos.h / 2 - 2}
              width={Math.max(12, pos.w - 12)}
              height="4"
              rx="1.2"
              fill={isDark ? '#475569' : '#cbd5e1'}
            />
          </g>
        );
      })}
    </svg>
  );
};
