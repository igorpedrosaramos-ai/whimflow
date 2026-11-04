import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  LayoutGrid,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Board, MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath } from '../utils/treeLayout';

interface PresentationViewProps {
  board: Board;
  onClose: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ board, onClose }) => {
  const rootNode = board.mindMapNodes.find(n => n.side === 'root') || board.mindMapNodes[0];
  const primaryBranches = useMemo(() => {
    return board.mindMapNodes.filter(n => n.parentId === rootNode?.id);
  }, [board.mindMapNodes, rootNode]);

  // Slide 0 = Visão Geral Completa; Slide 1..N = Foco nos Ramos Principais
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = 1 + primaryBranches.length;

  const nodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    board.mindMapNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [board.mindMapNodes]);

  // Layout espacial da árvore
  const layoutMap = useMemo(() => {
    if (!rootNode) return new Map();
    return calculateMindMapLayout(board.mindMapNodes, rootNode.id, {
      horizontalGap: 90,
      verticalGap: 18,
      rootX: 0,
      rootY: 0
    });
  }, [board.mindMapNodes, rootNode]);

  const getNodePos = (node: MindMapNode) => {
    const computed = layoutMap.get(node.id);
    const baseX = computed ? computed.x : node.x;
    const baseY = computed ? computed.y : node.y;
    return {
      x: baseX + (node.offsetX || 0),
      y: baseY + (node.offsetY || 0),
      width: computed ? computed.width : 160,
      height: computed ? computed.height : 40
    };
  };

  // Coleta todos os nós descendentes de um ramo
  const getBranchNodeIds = (branchId: string): Set<string> => {
    const set = new Set<string>([branchId]);
    const gather = (id: string) => {
      const node = nodeMap.get(id);
      if (node && node.childrenIds) {
        node.childrenIds.forEach(cid => {
          set.add(cid);
          gather(cid);
        });
      }
    };
    gather(branchId);
    return set;
  };

  // Conjunto de nós em destaque no slide atual
  const activeHighlightedIds = useMemo(() => {
    if (currentSlideIndex === 0) {
      // Visão Geral: todos os nós estão ativos
      return new Set(board.mindMapNodes.map(n => n.id));
    }
    const branch = primaryBranches[currentSlideIndex - 1];
    if (!branch) return new Set();
    const branchIds = getBranchNodeIds(branch.id);
    if (rootNode) branchIds.add(rootNode.id);
    return branchIds;
  }, [currentSlideIndex, primaryBranches, board.mindMapNodes, rootNode]);

  // Calcula câmera (Pan e Zoom) para cada slide
  const cameraTransform = useMemo(() => {
    const width = window.innerWidth;
    const height = window.innerHeight - 120; // Espaço útil entre header e footer

    if (currentSlideIndex === 0) {
      // Visão Geral: Enquadra todos os nós
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      board.mindMapNodes.forEach(node => {
        const pos = getNodePos(node);
        if (pos.x < minX) minX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.x + pos.width > maxX) maxX = pos.x + pos.width;
        if (pos.y + pos.height > maxY) maxY = pos.y + pos.height;
      });

      const mapWidth = Math.max(maxX - minX, 600);
      const mapHeight = Math.max(maxY - minY, 400);

      const zoomX = (width - 120) / mapWidth;
      const zoomY = (height - 120) / mapHeight;
      const zoom = Math.min(Math.min(zoomX, zoomY), 1.05);

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const panX = width / 2 - centerX * zoom;
      const panY = (height / 2 + 50) - centerY * zoom;

      return { panX, panY, zoom };
    }

    // Slide com Foco em um Ramo Específico
    const branch = primaryBranches[currentSlideIndex - 1];
    if (!branch) return { panX: width / 2, panY: height / 2, zoom: 1.0 };

    const branchIds = getBranchNodeIds(branch.id);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    branchIds.forEach(id => {
      const node = nodeMap.get(id);
      if (node) {
        const pos = getNodePos(node);
        if (pos.x < minX) minX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.x + pos.width > maxX) maxX = pos.x + pos.width;
        if (pos.y + pos.height > maxY) maxY = pos.y + pos.height;
      }
    });

    const bWidth = Math.max(maxX - minX, 400);
    const bHeight = Math.max(maxY - minY, 250);

    const zoomX = (width - 240) / bWidth;
    const zoomY = (height - 160) / bHeight;
    const zoom = Math.min(Math.min(zoomX, zoomY), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const panX = width / 2 - centerX * zoom;
    const panY = (height / 2 + 40) - centerY * zoom;

    return { panX, panY, zoom };
  }, [currentSlideIndex, primaryBranches, board.mindMapNodes, layoutMap]);

  // Teclas de atalho para apresentação
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentBranch = currentSlideIndex > 0 ? primaryBranches[currentSlideIndex - 1] : null;

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0d14',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <div style={{
        height: '56px',
        borderBottom: '1px solid #1e2430',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12161f',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Modo Apresentação
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#f8fafc' }}>
            {board.title}
          </span>
          {currentBranch && (
            <span style={{ fontSize: '14px', color: currentBranch.color || '#38bdf8', fontWeight: 600 }}>
              • {currentBranch.text}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {currentSlideIndex === 0 ? 'Visão Geral' : `Ramo ${currentSlideIndex} de ${primaryBranches.length}`}
          </span>
          <button
            onClick={toggleFullscreen}
            style={{
              background: '#1e2430',
              border: 'none',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
            title="Alternar Tela Cheia (F)"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'Janela' : 'Tela Cheia'}</span>
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#37181f',
              border: '1px solid #5c202b',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <X size={15} />
            <span>Sair (Esc)</span>
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL VISUAL DO MAPA MENTAL */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px'
      }}>
        {/* Camada Espacial Cinematográfica com Transição Suave de Câmera */}
        <div style={{
          position: 'absolute',
          transform: `translate(${cameraTransform.panX}px, ${cameraTransform.panY}px) scale(${cameraTransform.zoom})`,
          transformOrigin: '0 0',
          transition: 'transform 0.6s cubic-bezier(0.2, 0.9, 0.2, 1)',
          willChange: 'transform'
        }}>
          {/* Linhas Conectoras do Mapa Mental */}
          <svg
            width="10000"
            height="10000"
            viewBox="-5000 -5000 10000 10000"
            style={{
              position: 'absolute',
              top: -5000,
              left: -5000,
              width: 10000,
              height: 10000,
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 5
            }}
          >
            {board.mindMapNodes.map(child => {
              if (!child.parentId) return null;
              const parent = nodeMap.get(child.parentId);
              if (!parent) return null;

              const pPos = getNodePos(parent);
              const cPos = getNodePos(child);

              const isChildOnLeft = (cPos.x + cPos.width / 2) < (pPos.x + pPos.width / 2);
              const startX = isChildOnLeft ? pPos.x : pPos.x + pPos.width;
              const startY = pPos.y + pPos.height / 2;
              const endX = isChildOnLeft ? cPos.x + cPos.width : cPos.x;
              const endY = cPos.y + cPos.height / 2;

              const strokeColor = child.color || parent.color || '#6366f1';
              const pathData = getBezierPath(startX, startY, endX, endY);

              // Opacidade com base no foco da apresentação
              const isChildHighlighted = activeHighlightedIds.has(child.id);
              const isParentHighlighted = activeHighlightedIds.has(parent.id);
              const isConnActive = isChildHighlighted && isParentHighlighted;

              return (
                <g key={`pres-conn-${child.id}`} style={{ transition: 'opacity 0.4s ease' }}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isConnActive ? "3.5" : "1.8"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      opacity: isConnActive ? 1 : 0.15,
                      transition: 'opacity 0.4s ease, stroke-width 0.4s ease'
                    }}
                  />
                  <circle
                    cx={endX}
                    cy={endY}
                    r={isConnActive ? 4 : 2}
                    fill={strokeColor}
                    style={{ opacity: isConnActive ? 1 : 0.15 }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nós / Quadrados Visuais com Textos e Cores */}
          {board.mindMapNodes.map(node => {
            const isRoot = node.side === 'root';
            const pos = getNodePos(node);
            const nodeColor = node.color || '#6366f1';
            const isHighlighted = activeHighlightedIds.has(node.id);

            return (
              <div
                key={`pres-node-${node.id}`}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  minWidth: `${pos.width}px`,
                  minHeight: `${pos.height}px`,
                  backgroundColor: isRoot ? '#1e293b' : '#1e232d',
                  border: isRoot ? '2px solid #475569' : `1.5px solid ${nodeColor}`,
                  borderLeft: isRoot ? '2px solid #475569' : `5px solid ${nodeColor}`,
                  borderRadius: isRoot ? '12px' : '8px',
                  boxShadow: isHighlighted ? `0 0 20px ${nodeColor}44` : 'none',
                  padding: isRoot ? '12px 24px' : '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  whiteSpace: 'nowrap',
                  opacity: isHighlighted ? 1 : 0.22,
                  transform: isHighlighted && !isRoot && currentSlideIndex > 0 ? 'scale(1.02)' : 'scale(1)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease',
                  zIndex: isRoot ? 25 : (isHighlighted ? 20 : 10)
                }}
              >
                <span style={{
                  color: '#ffffff',
                  fontSize: isRoot ? '17px' : '14px',
                  fontWeight: isRoot ? 700 : 600,
                  letterSpacing: '-0.01em'
                }}>
                  {node.text}
                </span>

                {node.childrenIds && node.childrenIds.length > 0 && !isRoot && (
                  <span style={{
                    backgroundColor: nodeColor,
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '12px'
                  }}>
                    {node.childrenIds.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div style={{
        height: '66px',
        borderTop: '1px solid #1e2430',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12161f',
        zIndex: 50
      }}>
        {/* Botão Anterior */}
        <button
          onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: currentSlideIndex === 0 ? '#181d26' : '#222836',
            color: currentSlideIndex === 0 ? '#64748b' : '#f8fafc',
            border: '1px solid #2a3243',
            borderRadius: '6px',
            cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <ChevronLeft size={16} />
          <span>Anterior (←)</span>
        </button>

        {/* Indicadores de Slide */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setCurrentSlideIndex(0)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: currentSlideIndex === 0 ? 'var(--accent-purple)' : '#1a1f2c',
              border: '1px solid #2d3546',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Visão Geral
          </button>

          {primaryBranches.map((branch, idx) => {
            const isCurrent = currentSlideIndex === idx + 1;
            const branchColor = branch.color || '#6366f1';
            return (
              <button
                key={branch.id}
                onClick={() => setCurrentSlideIndex(idx + 1)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: isCurrent ? branchColor : '#1a1f2c',
                  border: isCurrent ? `1.5px solid #ffffff` : '1px solid #2d3546',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={branch.text}
              >
                {branch.text}
              </button>
            );
          })}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlideIndex === totalSlides - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: currentSlideIndex === totalSlides - 1 ? '#181d26' : 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: currentSlideIndex === totalSlides - 1 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <span>Próximo (→ / Espaço)</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
