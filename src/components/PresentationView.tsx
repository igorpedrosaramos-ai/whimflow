import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw
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

  // Dimensões dinâmicas da janela para responsividade perfeita em qualquer tela
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Ajustes manuais de câmera pelo usuário durante o slide (pan livre e zoom)
  const [userPanOffset, setUserPanOffset] = useState({ x: 0, y: 0 });
  const [userZoomFactor, setUserZoomFactor] = useState(1.0);
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideStripRef = useRef<HTMLDivElement>(null);
  const activeSlideButtonRef = useRef<HTMLButtonElement>(null);

  const totalSlides = Math.max(1, 1 + primaryBranches.length);

  // Monitora redimensionamento da janela para recalcular o enquadramento instantaneamente
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ao mudar de slide, reseta os offsets manuais para o enquadramento perfeito do novo slide
  useEffect(() => {
    setUserPanOffset({ x: 0, y: 0 });
    setUserZoomFactor(1.0);
  }, [currentSlideIndex]);

  // Auto-scroll da barra de slides para manter o botão ativo visível no centro
  useEffect(() => {
    if (activeSlideButtonRef.current && slideStripRef.current) {
      activeSlideButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentSlideIndex]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    board.mindMapNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [board.mindMapNodes]);

  // Layout espacial da árvore responsiva (mesmo algoritmo do editor para zero sobreposição)
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
      x: baseX,
      y: baseY,
      width: computed ? computed.width : 120,
      height: computed ? computed.height : 38
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
    if (!branch) return new Set(board.mindMapNodes.map(n => n.id));
    const branchIds = getBranchNodeIds(branch.id);
    if (rootNode) branchIds.add(rootNode.id);
    return branchIds;
  }, [currentSlideIndex, primaryBranches, board.mindMapNodes, rootNode]);

  // Calcula câmera automática (Pan e Zoom) com enquadramento proporcional e responsivo
  const cameraTransform = useMemo(() => {
    const width = windowDimensions.width;
    const height = Math.max(300, windowDimensions.height - 120); // Altura útil descontando header e footer

    if (currentSlideIndex === 0 || primaryBranches.length === 0) {
      // Visão Geral: Enquadra todos os nós com margem de respiro
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      board.mindMapNodes.forEach(node => {
        const pos = getNodePos(node);
        if (pos.x < minX) minX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.x + pos.width > maxX) maxX = pos.x + pos.width;
        if (pos.y + pos.height > maxY) maxY = pos.y + pos.height;
      });

      if (!isFinite(minX)) {
        return { panX: width / 2, panY: height / 2, zoom: 1.0 };
      }

      const mapWidth = Math.max(maxX - minX, 400);
      const mapHeight = Math.max(maxY - minY, 260);

      const padX = Math.min(100, width * 0.08);
      const padY = Math.min(70, height * 0.08);

      const zoomX = (width - padX * 2) / mapWidth;
      const zoomY = (height - padY * 2) / mapHeight;
      const baseZoom = Math.min(Math.min(zoomX, zoomY), 1.05);
      const zoom = Math.max(0.2, baseZoom) * userZoomFactor;

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const panX = width / 2 - centerX * zoom + userPanOffset.x;
      const panY = height / 2 - centerY * zoom + userPanOffset.y;

      return { panX, panY, zoom };
    }

    // Slide com Foco em um Ramo Específico (inclui a raiz como âncora visual)
    const branch = primaryBranches[currentSlideIndex - 1];
    if (!branch) {
      return { panX: width / 2, panY: height / 2, zoom: 1.0 };
    }

    const branchIds = getBranchNodeIds(branch.id);
    if (rootNode) branchIds.add(rootNode.id);

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

    const bWidth = Math.max(maxX - minX, 360);
    const bHeight = Math.max(maxY - minY, 220);

    const padX = Math.min(140, width * 0.12);
    const padY = Math.min(90, height * 0.12);

    const zoomX = (width - padX * 2) / bWidth;
    const zoomY = (height - padY * 2) / bHeight;
    const baseZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.35), 1.25);
    const zoom = baseZoom * userZoomFactor;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const panX = width / 2 - centerX * zoom + userPanOffset.x;
    const panY = height / 2 - centerY * zoom + userPanOffset.y;

    return { panX, panY, zoom };
  }, [currentSlideIndex, primaryBranches, board.mindMapNodes, layoutMap, windowDimensions, userPanOffset, userZoomFactor, rootNode]);

  // Teclas de atalho para apresentação
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
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

  // Controles de arraste do canvas durante a apresentação
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isDraggingCanvasRef.current && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setUserPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUpCanvas = () => {
    isDraggingCanvasRef.current = false;
    dragStartRef.current = null;
  };

  // Zoom pelo scroll do mouse no canvas
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setUserZoomFactor(prev => Math.min(Math.max(prev * factor, 0.25), 3.0));
  };

  const currentBranch = currentSlideIndex > 0 ? primaryBranches[currentSlideIndex - 1] : null;

  // Renderiza conectores com portas distribuídas na borda do pai
  const renderConnectors = () => {
    const parentChildrenMap = new Map<string, MindMapNode[]>();
    board.mindMapNodes.forEach(child => {
      if (!child.parentId) return;
      const parent = nodeMap.get(child.parentId);
      if (!parent) return;

      if (!parentChildrenMap.has(child.parentId)) {
        parentChildrenMap.set(child.parentId, []);
      }
      parentChildrenMap.get(child.parentId)!.push(child);
    });

    const paths: React.ReactElement[] = [];

    parentChildrenMap.forEach((children, parentId) => {
      const parent = nodeMap.get(parentId);
      if (!parent) return;
      const pPos = getNodePos(parent);

      children.sort((a, b) => {
        const aPos = getNodePos(a);
        const bPos = getNodePos(b);
        return aPos.y - bPos.y;
      });

      const numChildren = children.length;
      const pad = Math.min(10, pPos.height * 0.22);
      const usableHeight = pPos.height - pad * 2;

      children.forEach((child, index) => {
        const cPos = getNodePos(child);
        const isChildOnLeft = (cPos.x + cPos.width / 2) < (pPos.x + pPos.width / 2);
        const startX = isChildOnLeft ? pPos.x : pPos.x + pPos.width;
        const startY = numChildren <= 1 
          ? pPos.y + pPos.height / 2 
          : pPos.y + pad + (usableHeight * index) / (numChildren - 1);

        const endX = isChildOnLeft ? cPos.x + cPos.width : cPos.x;
        const endY = cPos.y + cPos.height / 2;

        const strokeColor = child.color || parent.color || '#6366f1';
        const lineStyle = child.lineStyle || 'bezier';

        const pathData = lineStyle === 'straight'
          ? `M ${startX} ${startY} L ${endX} ${endY}`
          : getBezierPath(startX, startY, endX, endY);

        const isChildHighlighted = activeHighlightedIds.has(child.id);
        const isParentHighlighted = activeHighlightedIds.has(parent.id);
        const isConnActive = isChildHighlighted && isParentHighlighted;

        paths.push(
          <g key={`pres-conn-${child.id}`} style={{ transition: 'opacity 0.4s ease' }}>
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isConnActive ? "3.2" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: isConnActive ? 1 : 0.12,
                transition: 'opacity 0.4s ease, stroke-width 0.4s ease'
              }}
            />
            <circle
              cx={endX}
              cy={endY}
              r={isConnActive ? 3.5 : 2}
              fill={strokeColor}
              style={{ opacity: isConnActive ? 1 : 0.12 }}
            />
          </g>
        );
      });
    });

    return (
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
        {paths}
      </svg>
    );
  };

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
        height: '54px',
        borderBottom: '1px solid #1e2430',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#12161f',
        zIndex: 50,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            Apresentação
          </div>
          <span style={{ 
            fontWeight: 700, 
            fontSize: '14px', 
            color: '#f8fafc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {board.title}
          </span>
          {currentBranch && (
            <span style={{ 
              fontSize: '13.5px', 
              color: currentBranch.color || '#38bdf8', 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              • {currentBranch.text || 'Ramo em Destaque'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '12.5px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {currentSlideIndex === 0 ? 'Visão Geral' : `${currentSlideIndex} / ${primaryBranches.length}`}
          </span>
          <button
            onClick={toggleFullscreen}
            style={{
              background: '#1e2430',
              border: '1px solid #2d3546',
              color: '#cbd5e1',
              padding: '5px 9px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px'
            }}
            title="Alternar Tela Cheia (F)"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#37181f',
              border: '1px solid #5c202b',
              color: '#f87171',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 600
            }}
            title="Sair da Apresentação (Esc)"
          >
            <X size={14} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL VISUAL DO MAPA MENTAL COM PAN E ZOOM LIVRES */}
      <div 
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
          cursor: isDraggingCanvasRef.current ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onWheel={handleWheel}
      >
        {/* Camada Espacial com Transição Suave de Câmera */}
        <div style={{
          position: 'absolute',
          transform: `translate(${cameraTransform.panX}px, ${cameraTransform.panY}px) scale(${cameraTransform.zoom})`,
          transformOrigin: '0 0',
          transition: isDraggingCanvasRef.current ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.9, 0.2, 1)',
          willChange: 'transform'
        }}>
          {/* Conectores com portas distribuídas */}
          {renderConnectors()}

          {/* Nós / Quadrados Visuais */}
          {board.mindMapNodes.map(node => {
            const isRoot = node.side === 'root';
            const pos = getNodePos(node);
            const nodeColor = node.color || '#6366f1';
            const isHighlighted = activeHighlightedIds.has(node.id);
            const borderStyle = node.borderStyle || 'accent';

            let bg = '#1e232d';
            let border = `1.5px solid ${nodeColor}`;
            let borderLeft: string | undefined = `4px solid ${nodeColor}`;

            if (isRoot) {
              bg = '#1e293b';
              border = '2px solid #64748b';
              borderLeft = undefined;
            } else if (borderStyle === 'fill') {
              bg = nodeColor;
              border = `2px solid ${nodeColor}`;
              borderLeft = undefined;
            } else if (borderStyle === 'border') {
              bg = '#1e232d';
              border = `2px solid ${nodeColor}`;
              borderLeft = undefined;
            }

            return (
              <div
                key={`pres-node-${node.id}`}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  minWidth: `${pos.width}px`,
                  minHeight: `${pos.height}px`,
                  backgroundColor: bg,
                  border: border,
                  borderLeft: borderLeft,
                  borderRadius: isRoot ? '10px' : '6px',
                  boxShadow: isHighlighted ? `0 0 16px ${nodeColor}40` : 'none',
                  padding: isRoot ? '10px 20px' : '7px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  opacity: isHighlighted ? 1 : 0.15,
                  transform: isHighlighted && !isRoot && currentSlideIndex > 0 ? 'scale(1.02)' : 'scale(1)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease',
                  zIndex: isRoot ? 25 : (isHighlighted ? 20 : 10)
                }}
              >
                <span style={{
                  color: borderStyle === 'fill' ? '#ffffff' : (isRoot ? '#ffffff' : '#f8fafc'),
                  fontSize: isRoot ? '16px' : '13.5px',
                  fontWeight: isRoot ? 700 : 600,
                  letterSpacing: '-0.01em',
                  minWidth: node.text ? undefined : '40px',
                  display: 'inline-block'
                }}>
                  {node.text}
                </span>

                {node.childrenIds && node.childrenIds.length > 0 && !isRoot && (
                  <span style={{
                    backgroundColor: borderStyle === 'fill' ? 'rgba(0,0,0,0.25)' : nodeColor,
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    flexShrink: 0
                  }}>
                    {node.childrenIds.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Controles Flutuantes de Zoom e Reset no Canto Inferior Direito do Canvas */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#12161f',
          border: '1px solid #2a3243',
          borderRadius: '8px',
          padding: '3px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 60
        }}>
          <button
            onClick={() => setUserZoomFactor(prev => Math.min(prev * 1.15, 3.0))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Aproximar (+)"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setUserZoomFactor(prev => Math.max(prev * 0.85, 0.25))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Afastar (-)"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => {
              setUserPanOffset({ x: 0, y: 0 });
              setUserZoomFactor(1.0);
            }}
            style={{
              padding: '0 8px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Recentrar Câmera no Slide"
          >
            <RotateCcw size={12} />
            <span>Recentralizar</span>
          </button>
        </div>
      </div>

      {/* FOOTER 100% RESPONSIVO COM STRIP DE SLIDES ROLÁVEL */}
      <div style={{
        height: '62px',
        borderTop: '1px solid #1e2430',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        backgroundColor: '#12161f',
        zIndex: 50,
        flexShrink: 0
      }}>
        {/* Botão Anterior */}
        <button
          onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            backgroundColor: currentSlideIndex === 0 ? '#181d26' : '#222836',
            color: currentSlideIndex === 0 ? '#475569' : '#f8fafc',
            border: '1px solid #2a3243',
            borderRadius: '6px',
            cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '12.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          title="Slide Anterior (←)"
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </button>

        {/* Faixa Rolável de Indicadores de Slide */}
        <div
          ref={slideStripRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            padding: '4px 0',
            flex: 1,
            justifyContent: primaryBranches.length > 5 ? 'flex-start' : 'center',
            minWidth: 0
          }}
        >
          <button
            ref={currentSlideIndex === 0 ? activeSlideButtonRef : null}
            onClick={() => setCurrentSlideIndex(0)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: currentSlideIndex === 0 ? 'var(--accent-purple, #6366f1)' : '#1a1f2c',
              border: currentSlideIndex === 0 ? '1.5px solid #ffffff' : '1px solid #2d3546',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Visão Geral
          </button>

          {primaryBranches.map((branch, idx) => {
            const isCurrent = currentSlideIndex === idx + 1;
            const branchColor = branch.color || '#6366f1';
            const displayText = branch.text.trim() || `Ramo ${idx + 1}`;
            return (
              <button
                key={branch.id}
                ref={isCurrent ? activeSlideButtonRef : null}
                onClick={() => setCurrentSlideIndex(idx + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: isCurrent ? branchColor : '#1a1f2c',
                  border: isCurrent ? '1.5px solid #ffffff' : '1px solid #2d3546',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title={branch.text || `Ramo ${idx + 1}`}
              >
                {displayText}
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
            padding: '7px 14px',
            backgroundColor: currentSlideIndex === totalSlides - 1 ? '#181d26' : 'var(--accent-purple, #6366f1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: currentSlideIndex === totalSlides - 1 ? 'not-allowed' : 'pointer',
            fontSize: '12.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          title="Próximo Slide (→ / Espaço)"
        >
          <span>Próximo</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
