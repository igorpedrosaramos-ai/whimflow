import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  Layers,
  Plus,
  Minus
} from 'lucide-react';
import { Board, MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath, estimateNodeDimensions, cleanAndNormalizeMindMap } from '../utils/treeLayout';

interface PresentationViewProps {
  board: Board;
  initialSelectedNodeId?: string | null;
  onClose: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ 
  board, 
  initialSelectedNodeId, 
  onClose 
}) => {
  // Purga nós em branco, traços e orfãos, normalizando a hierarquia da árvore
  const cleanNodes = useMemo(() => {
    return cleanAndNormalizeMindMap(board.mindMapNodes);
  }, [board.mindMapNodes]);

  const rootNode = cleanNodes.find(n => n.side === 'root') || cleanNodes[0];
  const primaryBranches = useMemo(() => {
    return cleanNodes.filter(n => n.parentId === rootNode?.id);
  }, [cleanNodes, rootNode]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    cleanNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [cleanNodes]);

  // Se o usuário já tinha um nó selecionado ao clicar em "Apresentar", inicia focado no ramo correspondente
  const initialSlide = useMemo(() => {
    if (!initialSelectedNodeId || !rootNode) return 0;
    if (initialSelectedNodeId === rootNode.id) return 0;

    let curr = nodeMap.get(initialSelectedNodeId);
    while (curr && curr.parentId && curr.parentId !== rootNode.id) {
      curr = nodeMap.get(curr.parentId);
    }
    if (curr && curr.parentId === rootNode.id) {
      const idx = primaryBranches.findIndex(b => b.id === curr!.id);
      if (idx !== -1) return idx + 1;
    }
    return 0;
  }, [initialSelectedNodeId, rootNode, nodeMap, primaryBranches]);

  // Slide 0 = Visão Geral Completa; Slide 1..N = Ramos Principais
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modo "Isolar Ramo": quando ativo, remove os outros ramos e foca 100% apenas no que foi selecionado
  const [isolateMode, setIsolateMode] = useState(false);

  // Escala dos cards (Diminuir / Aumentar): 0.85 = Compacto, 1.0 = Padrão, 1.15 = Grande
  const [cardScale, setCardScale] = useState<number>(1.0);

  // Estado local de colapso de nós na apresentação (permite recolher e expandir cards sem alterar o quadro original)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(() => new Set());

  // Foco ativo em um card específico dentro do slide (ao clicar num nó durante a apresentação)
  const [activeFocusNodeId, setActiveFocusNodeId] = useState<string | null>(initialSelectedNodeId || null);

  // Dimensões dinâmicas da janela para responsividade total
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Pan livre e zoom com o mouse
  const [userPanOffset, setUserPanOffset] = useState({ x: 0, y: 0 });
  const [userZoomFactor, setUserZoomFactor] = useState(1.0);
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideStripRef = useRef<HTMLDivElement>(null);
  const activeSlideButtonRef = useRef<HTMLButtonElement>(null);

  const totalSlides = Math.max(1, 1 + primaryBranches.length);

  // Atualiza dimensões da tela
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

  // Ao mudar de slide, reseta ajustes manuais e ajusta foco
  useEffect(() => {
    setUserPanOffset({ x: 0, y: 0 });
    setUserZoomFactor(1.0);
    if (currentSlideIndex > 0) {
      const branch = primaryBranches[currentSlideIndex - 1];
      setActiveFocusNodeId(branch ? branch.id : null);
    } else {
      setActiveFocusNodeId(rootNode ? rootNode.id : null);
    }
  }, [currentSlideIndex, primaryBranches, rootNode]);

  // Auto-scroll da barra de slides
  useEffect(() => {
    if (activeSlideButtonRef.current && slideStripRef.current) {
      activeSlideButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentSlideIndex]);

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

  // Alterna colapso / expansão de um nó específico durante a apresentação
  const toggleNodeCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Predefinição de profundidade de visualização (Diminuir/Expandir tudo)
  const applyDepthLevel = (level: 1 | 2 | 999) => {
    if (level === 999) {
      setCollapsedNodeIds(new Set());
      return;
    }

    const newCollapsed = new Set<string>();
    cleanNodes.forEach(node => {
      if (node.side === 'root') return;
      if (!node.childrenIds || node.childrenIds.length === 0) return;

      // Nível 1: Todos os nós com filhos ficam recolhidos (exceto raiz)
      if (level === 1) {
        newCollapsed.add(node.id);
      } 
      // Nível 2: Apenas sub-filhos (netos da raiz ou mais profundos) são recolhidos
      else if (level === 2) {
        if (node.parentId !== rootNode?.id) {
          newCollapsed.add(node.id);
        }
      }
    });
    setCollapsedNodeIds(newCollapsed);
  };

  // Nós estritamente visíveis e ativos no slide atual (Zero colisões e sem nós desnecessários)
  const slideNodes = useMemo(() => {
    if (!rootNode) return [];

    let baseNodes: MindMapNode[];

    if (currentSlideIndex === 0) {
      // Visão Geral: todos os nós incluídos
      baseNodes = cleanNodes;
    } else {
      const branch = primaryBranches[currentSlideIndex - 1];
      if (!branch) return cleanNodes;

      const activeIds = getBranchNodeIds(branch.id);
      activeIds.add(rootNode.id);

      baseNodes = cleanNodes.filter(n => {
        if (n.id === rootNode.id) return true;
        if (activeIds.has(n.id)) return true;
        // Se isolateMode estiver ativo, NÃO mostra outros ramos primários
        if (!isolateMode && n.parentId === rootNode.id) return true;
        return false;
      });
    }

    // Aplica o status de colapso local
    return baseNodes.map(n => {
      const isLocallyCollapsed = collapsedNodeIds.has(n.id);
      // Se não for o ramo ativo no slide e for outro ramo primário em modo contexto: recolhido
      const isOtherBranch = currentSlideIndex > 0 && n.parentId === rootNode.id && n.id !== primaryBranches[currentSlideIndex - 1]?.id;

      return {
        ...n,
        collapsed: isLocallyCollapsed || isOtherBranch
      };
    });
  }, [currentSlideIndex, cleanNodes, primaryBranches, rootNode, collapsedNodeIds, isolateMode]);

  // Mapa de verificação rápida para visibilidade de nós (respeita pais colapsados)
  const slideNodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    slideNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [slideNodes]);

  const isNodeVisible = (node: MindMapNode): boolean => {
    let current = node;
    while (current.parentId) {
      const parent = slideNodeMap.get(current.parentId);
      if (!parent) break;
      if (parent.collapsed) return false;
      current = parent;
    }
    return true;
  };

  // Layout espacial calculado exclusivamente para os nós visíveis (Zero sobreposição)
  const layoutMap = useMemo(() => {
    if (!rootNode || slideNodes.length === 0) return new Map();
    return calculateMindMapLayout(slideNodes, rootNode.id, {
      horizontalGap: Math.round(95 * cardScale),
      verticalGap: Math.round(18 * cardScale),
      rootX: 0,
      rootY: 0
    });
  }, [slideNodes, rootNode, cardScale]);

  const getNodePos = (node: MindMapNode) => {
    const computed = layoutMap.get(node.id);
    const dims = estimateNodeDimensions(node);
    const scaledWidth = Math.round(dims.width * cardScale);
    const scaledHeight = Math.round(dims.height * cardScale);
    return {
      x: computed ? computed.x : (node.x || 0),
      y: computed ? computed.y : (node.y || 0),
      width: computed ? Math.round(computed.width * cardScale) : scaledWidth,
      height: computed ? Math.round(computed.height * cardScale) : scaledHeight
    };
  };

  // Conjunto de nós em destaque no slide atual
  const activeHighlightedIds = useMemo(() => {
    if (activeFocusNodeId) {
      const focusBranch = getBranchNodeIds(activeFocusNodeId);
      if (rootNode) focusBranch.add(rootNode.id);
      return focusBranch;
    }

    if (currentSlideIndex === 0) {
      return new Set(slideNodes.map(n => n.id));
    }
    const branch = primaryBranches[currentSlideIndex - 1];
    if (!branch) return new Set(slideNodes.map(n => n.id));
    const branchIds = getBranchNodeIds(branch.id);
    if (rootNode) branchIds.add(rootNode.id);
    return branchIds;
  }, [currentSlideIndex, primaryBranches, slideNodes, rootNode, activeFocusNodeId]);

  // Câmera automática inteligente (Pan e Zoom)
  const cameraTransform = useMemo(() => {
    const width = windowDimensions.width;
    const height = Math.max(300, windowDimensions.height - 120);

    // Considera apenas nós estritamente visíveis
    const visibleNodes = slideNodes.filter(n => isNodeVisible(n));
    if (visibleNodes.length === 0) {
      return { panX: width / 2, panY: height / 2, zoom: 1.0 };
    }

    let targetNodes = visibleNodes;

    // Se estiver em um slide específico, enquadra o ramo ativo
    if (currentSlideIndex > 0) {
      const branch = primaryBranches[currentSlideIndex - 1];
      if (branch) {
        const branchIds = getBranchNodeIds(branch.id);
        if (rootNode) branchIds.add(rootNode.id);
        targetNodes = visibleNodes.filter(n => branchIds.has(n.id));
      }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    targetNodes.forEach(node => {
      const pos = getNodePos(node);
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x + pos.width > maxX) maxX = pos.x + pos.width;
      if (pos.y + pos.height > maxY) maxY = pos.y + pos.height;
    });

    if (!isFinite(minX)) {
      return { panX: width / 2, panY: height / 2, zoom: 1.0 };
    }

    const boxWidth = Math.max(maxX - minX, 360);
    const boxHeight = Math.max(maxY - minY, 220);

    const padX = Math.min(120, width * 0.1);
    const padY = Math.min(80, height * 0.1);

    const zoomX = (width - padX * 2) / boxWidth;
    const zoomY = (height - padY * 2) / boxHeight;
    const maxZoom = currentSlideIndex === 0 ? 1.0 : 1.25;
    const baseZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.35), maxZoom);
    const zoom = baseZoom * userZoomFactor;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const panX = width / 2 - centerX * zoom + userPanOffset.x;
    const panY = height / 2 - centerY * zoom + userPanOffset.y;

    return { panX, panY, zoom };
  }, [currentSlideIndex, primaryBranches, slideNodes, windowDimensions, userPanOffset, userZoomFactor, rootNode, cardScale, layoutMap]);

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

  // Arraste do canvas
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

  // Zoom pelo scroll suave
  const handleWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setUserZoomFactor(prev => Math.min(Math.max(prev * factor, 0.25), 3.0));
  };

  const currentBranch = currentSlideIndex > 0 ? primaryBranches[currentSlideIndex - 1] : null;

  // Renderiza conectores respeitando estritamente a visibilidade de nós
  const renderConnectors = () => {
    const parentChildrenMap = new Map<string, MindMapNode[]>();

    slideNodes.forEach(child => {
      if (!child.parentId || !isNodeVisible(child)) return;
      const parent = slideNodeMap.get(child.parentId);
      if (!parent || parent.collapsed) return;

      if (!parentChildrenMap.has(child.parentId)) {
        parentChildrenMap.set(child.parentId, []);
      }
      parentChildrenMap.get(child.parentId)!.push(child);
    });

    const paths: React.ReactElement[] = [];

    parentChildrenMap.forEach((children, parentId) => {
      const parent = slideNodeMap.get(parentId);
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
        const startY = pPos.y + pPos.height / 2;

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
          <g key={`pres-conn-${child.id}`} style={{ transition: 'opacity 0.35s ease' }}>
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isConnActive ? "2.8" : "1.6"}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: isConnActive ? 1 : 0.12,
                transition: 'opacity 0.35s ease, stroke-width 0.35s ease'
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
      {/* ─── BARRA SUPERIOR EXECUTIVA ELEGANTE ──────────────────────────────────── */}
      <div style={{
        height: '56px',
        borderBottom: '1px solid #1e2638',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f131c',
        zIndex: 50,
        flexShrink: 0,
        gap: '12px'
      }}>
        {/* Esquerda: Identificação e Título do Slide */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div style={{
            padding: '4px 9px',
            borderRadius: '5px',
            backgroundColor: 'rgba(99, 102, 241, 0.18)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#818cf8',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            Apresentação
          </div>
          <span style={{ 
            fontWeight: 700, 
            fontSize: '13.5px', 
            color: '#f8fafc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {board.title}
          </span>
          {currentBranch && (
            <span style={{ 
              fontSize: '13px', 
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

        {/* Centro: Controles de Diminuir/Aumentar Cards e Nível de Detalhe */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Seletor de Nível de Profundidade */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#161b26',
            borderRadius: '6px',
            border: '1px solid #232c3d',
            padding: '2px',
            gap: '2px'
          }} title="Nível de detalhe dos ramos">
            <span style={{ fontSize: '11px', color: '#64748b', padding: '0 6px', fontWeight: 600 }}>
              Detalhes:
            </span>
            <button
              onClick={() => applyDepthLevel(1)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Mostrar apenas o primeiro nível (recolhe sub-itens)"
            >
              Nível 1
            </button>
            <button
              onClick={() => applyDepthLevel(2)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Mostrar até o segundo nível de ramificação"
            >
              Nível 2
            </button>
            <button
              onClick={() => applyDepthLevel(999)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Expandir todos os ramos"
            >
              Tudo Aberto
            </button>
          </div>

          {/* Ajuste de Tamanho dos Cards (Diminuir / Aumentar) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#161b26',
            borderRadius: '6px',
            border: '1px solid #232c3d',
            padding: '2px 4px',
            gap: '3px'
          }} title="Tamanho visual dos cards">
            <button
              onClick={() => setCardScale(prev => Math.max(0.8, Number((prev - 0.1).toFixed(2))))}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Diminuir tamanho dos cards"
            >
              <Minus size={12} />
            </button>
            <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '38px', textAlign: 'center', fontWeight: 600 }}>
              {Math.round(cardScale * 100)}%
            </span>
            <button
              onClick={() => setCardScale(prev => Math.min(1.3, Number((prev + 0.1).toFixed(2))))}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Aumentar tamanho dos cards"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Botão de Isolar Seleção (Mostra só o que foi selecionado) */}
          {currentSlideIndex > 0 && (
            <button
              onClick={() => setIsolateMode(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: isolateMode ? 'var(--accent-purple, #6366f1)' : '#161b26',
                border: isolateMode ? '1px solid #ffffff' : '1px solid #232c3d',
                color: '#ffffff',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Oculta os outros ramos de contexto e foca 100% apenas no ramo selecionado"
            >
              <Eye size={12} />
              <span>{isolateMode ? 'Isolado' : 'Isolar Ramo'}</span>
            </button>
          )}
        </div>

        {/* Direita: Tela Cheia e Sair */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={toggleFullscreen}
            style={{
              background: '#1a202c',
              border: '1px solid #2d3546',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: '6px',
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
              padding: '6px 12px',
              borderRadius: '6px',
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

      {/* ─── ÁREA CENTRAL DO MAPA MENTAL (PAN LIVRE E ZOOM) ───────────────────── */}
      <div 
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
          cursor: isDraggingCanvasRef.current ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onWheel={handleWheel}
      >
        {/* Camada com Transição Suave de Câmera */}
        <div style={{
          position: 'absolute',
          transform: `translate(${cameraTransform.panX}px, ${cameraTransform.panY}px) scale(${cameraTransform.zoom})`,
          transformOrigin: '0 0',
          transition: isDraggingCanvasRef.current ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.9, 0.2, 1)',
          willChange: 'transform'
        }}>
          {/* Conectores com portas distribuídas */}
          {renderConnectors()}

          {/* Cards Visuais Interativos */}
          {slideNodes.map(node => {
            if (!isNodeVisible(node)) return null;

            const isRoot = node.side === 'root';
            const pos = getNodePos(node);
            const nodeColor = node.color || '#6366f1';
            const isHighlighted = activeHighlightedIds.has(node.id);
            const borderStyle = node.borderStyle || 'accent';
            const hasChildren = node.childrenIds && node.childrenIds.length > 0;
            const isCollapsed = !!node.collapsed;

            let bg = '#181d26';
            let border = `1.5px solid ${nodeColor}`;
            let borderLeft: string | undefined = `4px solid ${nodeColor}`;

            if (isRoot) {
              bg = '#1a2233';
              border = '2px solid #64748b';
              borderLeft = undefined;
            } else if (borderStyle === 'fill') {
              bg = nodeColor;
              border = `2px solid ${nodeColor}`;
              borderLeft = undefined;
            } else if (borderStyle === 'border') {
              bg = '#181d26';
              border = `2px solid ${nodeColor}`;
              borderLeft = undefined;
            }

            return (
              <div
                key={`pres-node-${node.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFocusNodeId(node.id);
                }}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${pos.width}px`,
                  minWidth: `${pos.width}px`,
                  minHeight: `${pos.height}px`,
                  backgroundColor: bg,
                  border: border,
                  borderLeft: borderLeft,
                  borderRadius: isRoot ? '10px' : '6px',
                  boxShadow: isHighlighted ? `0 0 16px ${nodeColor}35` : 'none',
                  padding: isRoot ? '10px 20px' : '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  opacity: isHighlighted ? 1 : 0.16,
                  transform: isHighlighted && !isRoot && currentSlideIndex > 0 ? 'scale(1.02)' : 'scale(1)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease',
                  zIndex: isRoot ? 25 : (isHighlighted ? 20 : 10),
                  cursor: 'pointer'
                }}
                title={hasChildren ? (isCollapsed ? 'Clique no botão + para abrir' : 'Clique no botão − para recolher') : undefined}
              >
                <span style={{
                  color: borderStyle === 'fill' ? '#ffffff' : (isRoot ? '#ffffff' : '#f8fafc'),
                  fontSize: isRoot ? `${16 * cardScale}px` : `${13 * cardScale}px`,
                  fontWeight: isRoot ? 700 : 500,
                  letterSpacing: '-0.01em',
                  minWidth: node.text ? undefined : '40px',
                  display: 'inline-block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {node.text}
                </span>

                {/* Botão Interativo de Diminuir/Aumentar (Recolher/Expandir) diretamente no Card */}
                {hasChildren && !isRoot && (
                  <button
                    onClick={(e) => toggleNodeCollapse(node.id, e)}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isCollapsed ? nodeColor : 'rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: isCollapsed ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                      transition: 'transform 0.15s ease, background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title={isCollapsed ? `Expandir ${node.childrenIds.length} sub-ramos` : 'Recolher sub-ramos'}
                  >
                    {isCollapsed ? '+' : '−'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Controles Flutuantes de Zoom e Recentralizar */}
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

      {/* ─── FOOTER RESPONSIVO COM STRIP DE SLIDES ROLÁVEL ────────────────────── */}
      <div style={{
        height: '62px',
        borderTop: '1px solid #1e2638',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        backgroundColor: '#0f131c',
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
              backgroundColor: currentSlideIndex === 0 ? 'var(--accent-purple, #6366f1)' : '#161b26',
              border: currentSlideIndex === 0 ? '1.5px solid #ffffff' : '1px solid #232c3d',
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
                  backgroundColor: isCurrent ? branchColor : '#161b26',
                  border: isCurrent ? '1.5px solid #ffffff' : '1px solid #232c3d',
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
