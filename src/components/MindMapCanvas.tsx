import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { MindMapNode, Connector, ToolType } from '../types';
import { calculateMindMapLayout, getBezierPath, cleanAndNormalizeMindMap } from '../utils/treeLayout';
import { clearMeasurementCache, measureNodeText } from '../utils/textMeasurement';
import { NodeContextMenu } from './NodeContextMenu';
import { getTemplateEngine } from '../engines/templateEngineManager';
import { NodeDirection } from '../engines/templateEngineTypes';

interface MindMapCanvasProps {
  nodes: MindMapNode[];
  connectors?: Connector[];
  currentTool?: ToolType;
  connectingSourceId?: string | null;
  onConnectNode?: (nodeId: string) => void;
  onDeleteConnector?: (id: string) => void;
  onUpdateConnectorLabel?: (id: string, label: string) => void;
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  editingNodeId?: string | null;
  layoutType?: 'bidirectional' | 'right' | 'orgchart' | 'flowchart' | 'timeline' | 'free';
  onClearEditingNodeId?: () => void;
  onSelectNode: (id: string | null) => void;
  onSelectMultipleNodes?: (ids: string[]) => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddChildNode: (parentId: string, direction?: NodeDirection) => void;
  onAddSiblingNode: (nodeId: string) => void;
  onAddSiblingAboveNode?: (nodeId: string) => void;
  onAddParentNode?: (nodeId: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteMultipleNodes?: (ids: string[]) => void;
  onDuplicateMultipleNodes?: (ids: string[]) => void;
  onMoveNodeOffset?: (id: string, dx: number, dy: number) => void;
  onMoveNodeFree?: (nodeId: string, deltaX: number, deltaY: number) => void;
  onReorderNode: (nodeId: string, direction: 'up' | 'down') => void;
  onReparentNode: (childId: string, newParentId: string) => void;
  onReorderInsertNode?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onUpdateNodeStyle: (nodeId: string, updates: Partial<MindMapNode>) => void;
  onDuplicateNode: (nodeId: string) => void;
  pan?: { x: number; y: number };
  zoom?: number;
  isOverlayOpen?: boolean;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
  connectors = [],
  currentTool = 'select',
  connectingSourceId = null,
  onConnectNode,
  onDeleteConnector,
  onUpdateConnectorLabel,
  selectedNodeId,
  selectedNodeIds = [],
  editingNodeId,
  layoutType,
  onClearEditingNodeId,
  onSelectNode,
  onSelectMultipleNodes,
  onUpdateNodeText,
  onToggleCollapse,
  onAddChildNode,
  onAddSiblingNode,
  onAddSiblingAboveNode,
  onAddParentNode,
  onDeleteNode,
  onDeleteMultipleNodes,
  onDuplicateMultipleNodes,
  onMoveNodeFree,
  onReorderNode,
  onReparentNode,
  onReorderInsertNode,
  onUpdateNodeStyle,
  onDuplicateNode,
  pan,
  zoom = 1,
  isOverlayOpen = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnterNode = (nodeId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredNodeId(nodeId);
  };

  const handleMouseLeaveNode = (nodeId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredNodeId(prev => (prev === nodeId ? null : prev));
      hoverTimeoutRef.current = null;
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Garante que após o carregamento da fonte Inter o layout seja recalculado com precisão tipográfica máxima
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        clearMeasurementCache();
        setFontsReady(true);
      });
    }
  }, []);

  // ─── DRAG STATE ──────────────────────────────────────────────────────────────
  // draggingNodeId: React state (causa re-render para mostrar/esconder ghost)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dropTargetNodeId, setDropTargetNodeId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside'>('inside');

  // Posição do cursor em viewport coords (atualiza via ref + state para evitar re-renders excessivos)
  const dragCursorRef = useRef<{ x: number; y: number } | null>(null);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Posição do CENTRO do nó-fonte no viewport (capturada no momento exato do início do drag)
  const dragSourceScreenPosRef = useRef<{ x: number; y: number } | null>(null);

  // Ref síncrono do ID sendo arrastado (para lógica dentro dos event listeners)
  const draggingIdRef = useRef<string | null>(null);
  const dropTargetRef = useRef<{ id: string | null; pos: 'before' | 'after' | 'inside' }>({ id: null, pos: 'inside' });

  // Evita drag acidental em clique simples (threshold 4px)
  const dragPendingRef = useRef<{ id: string; clientX: number; clientY: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── RAF para posição do ghost (suave, sem re-renders excessivos) ──────────
  const rafRef = useRef<number | null>(null);

  // Ref síncrono para seleção múltipla sem race conditions de render
  const selectedNodeIdsRef = useRef<string[]>(selectedNodeIds || []);
  useEffect(() => {
    selectedNodeIdsRef.current = selectedNodeIds || [];
  }, [selectedNodeIds]);

  // Sincroniza início de edição direta quando um novo nó é criado
  useEffect(() => {
    if (editingNodeId) {
      const target = nodes.find(n => n.id === editingNodeId);
      if (target) {
        setEditingId(target.id);
        setEditingText(target.text || '');
      }
      onClearEditingNodeId?.();
    }
  }, [editingNodeId, nodes, onClearEditingNodeId]);

  // Filtra nós vazios/fantasmas e nós de traço '-', reparentando filhos para que NUNCA apareçam como "espaços em branco"
  const effectiveNodes = useMemo(() => {
    const cleaned = cleanAndNormalizeMindMap(nodes);
    // Se o nó em edição foi temporariamente filtrado por estar vazio, mantenha-o para digitação
    if (editingId && !cleaned.some(n => n.id === editingId)) {
      const editingNode = nodes.find(n => n.id === editingId);
      if (editingNode) {
        return [...cleaned, editingNode];
      }
    }
    return cleaned;
  }, [nodes, editingId]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    effectiveNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [effectiveNodes]);

  // Mapeamento bidirecional e infalível de filhos (suporta childrenIds E parentId)
  const nodeChildrenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    effectiveNodes.forEach(child => {
      if (child.parentId) {
        const list = map.get(child.parentId) || [];
        if (!list.includes(child.id)) {
          list.push(child.id);
        }
        map.set(child.parentId, list);
      }
    });
    return map;
  }, [effectiveNodes]);

  const getNodeChildrenIds = (node: MindMapNode): string[] => {
    const fromParent = nodeChildrenMap.get(node.id) || [];
    const fromNode = node.childrenIds || [];
    return Array.from(new Set([...fromNode, ...fromParent]));
  };

  // Determina o layout efetivo (passado explicitamente pelo board/template ou auto-detectado com elegância)
  const effectiveLayout = useMemo(() => {
    if (layoutType) return layoutType;
    const root = effectiveNodes.find(n => n.side === 'root') || effectiveNodes[0];
    const rootText = (root?.text || '').toLowerCase();
    if (rootText.includes('timeline') || rootText.includes('roadmap') || rootText.includes('cronograma')) return 'timeline';
    if (rootText.includes('fluxograma') || rootText.includes('flowchart')) return 'flowchart';
    if (rootText.includes('org chart') || rootText.includes('pod structure') || rootText.includes('organograma')) return 'orgchart';
    if (effectiveNodes.some(n => n.side === 'left')) return 'bidirectional';
    return 'bidirectional';
  }, [layoutType, effectiveNodes]);

  // Motor especializado do template ativo (isolado por layoutType)
  const engine = useMemo(() => getTemplateEngine(effectiveLayout), [effectiveLayout]);

  // Layout base da árvore - 100% Responsivo e sem sobreposição
  const layoutMap = useMemo(() => {
    const root = effectiveNodes.find(n => n.side === 'root') || effectiveNodes[0];
    if (!root) return new Map();
    return calculateMindMapLayout(effectiveNodes, root.id, {
      horizontalGap: 100,
      verticalGap: effectiveLayout === 'orgchart' ? 56 : 18,
      rootX: 0,
      rootY: 0,
      layoutType: effectiveLayout
    });
  }, [effectiveNodes, effectiveLayout, fontsReady]);

  // Posição final calculada estritamente pelo algoritmo responsivo (Zero entrelaçamento)
  const getNodePos = (node: MindMapNode) => {
    const computed = layoutMap.get(node.id);
    const measured = measureNodeText(node);
    const computedWidth = computed ? Math.max(computed.width, measured.width) : measured.width;
    const computedHeight = computed ? Math.max(computed.height, measured.height) : measured.height;
    const baseX = computed ? computed.x : (node.x || 0);
    const baseY = computed ? computed.y : (node.y || 0);
    return {
      x: baseX + (node.offsetX || 0),
      y: baseY + (node.offsetY || 0),
      width: computedWidth,
      height: computedHeight
    };
  };

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
    const direct = nodeChildrenMap.get(nodeId) || [];
    const node = nodeMap.get(nodeId);
    const initial = Array.from(new Set([...(node?.childrenIds || []), ...direct]));
    if (initial.length === 0) return 0;
    let count = 0;
    const visited = new Set<string>();
    const stack = [...initial];
    while (stack.length > 0) {
      const cid = stack.pop()!;
      if (visited.has(cid)) continue;
      visited.add(cid);
      count++;
      const childDirect = nodeChildrenMap.get(cid) || [];
      const child = nodeMap.get(cid);
      const combined = Array.from(new Set([...(child?.childrenIds || []), ...childDirect]));
      combined.forEach(id => {
        if (!visited.has(id)) stack.push(id);
      });
    }
    return count;
  };

  const handleStartEdit = (node: MindMapNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(node.id);
    setEditingText(node.text || '');
    onSelectNode(node.id);
  };

  const handleCommitEdit = () => {
    if (editingId) {
      const trimmed = editingText.trim();
      const node = nodeMap.get(editingId);
      // Mantém o nó aberto com o texto digitado ou com 'Novo item' se o usuário não digitou nada
      const finalVal = trimmed || node?.text || 'Novo item';
      onUpdateNodeText(editingId, finalVal);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, node: MindMapNode) => {
    if (e.altKey && e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit();
      onAddParentNode?.(node.id);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit();
      onAddSiblingAboveNode?.(node.id);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit();
      onAddSiblingNode(node.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCommitEdit();
      onAddChildNode(node.id);
    } else if (e.key === 'Escape') {
      // Escape encerra o modo de edição sem descartar o nó
      setEditingId(null);
    }
  };

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // ─── DRAG: início ────────────────────────────────────────────────────────────
  const handleMouseDown = (node: MindMapNode, e: React.MouseEvent) => {
    if (currentTool === 'hand') return;
    if (editingId === node.id) return;
    if (e.button !== 0) return;
    e.stopPropagation();

    const isAlreadySelected = selectedNodeIds && selectedNodeIds.includes(node.id);
    if (!isAlreadySelected && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      onSelectNode(node.id);
    }

    if (node.side === 'root' || currentTool === 'connect') return;

    dragPendingRef.current = { id: node.id, clientX: e.clientX, clientY: e.clientY };
  };

  // ─── DRAG: mouse move + mouse up + cancelamento seguro (global) ──────────────
  useEffect(() => {
    const resetDragState = () => {
      dragPendingRef.current = null;
      draggingIdRef.current = null;
      dragSourceScreenPosRef.current = null;
      dragCursorRef.current = null;
      dropTargetRef.current = { id: null, pos: 'inside' };

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      setDraggingNodeId(null);
      setDropTargetNodeId(null);
      setDropPosition('inside');
      setDragCursorPos(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Ativa o arraste somente após threshold de 4px
      if (dragPendingRef.current && !draggingIdRef.current) {
        const dx = Math.abs(e.clientX - dragPendingRef.current.clientX);
        const dy = Math.abs(e.clientY - dragPendingRef.current.clientY);
        if (dx > 4 || dy > 4) {
          const pendingId = dragPendingRef.current.id;
          draggingIdRef.current = pendingId;

          const el = document.getElementById(`node-${pendingId}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            dragSourceScreenPosRef.current = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
          } else {
            dragSourceScreenPosRef.current = { x: e.clientX, y: e.clientY };
          }

          setDraggingNodeId(pendingId);
          setDragCursorPos({ x: e.clientX, y: e.clientY });
        }
      }

      if (!draggingIdRef.current) return;

      dragCursorRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (dragCursorRef.current) {
            setDragCursorPos({ ...dragCursorRef.current });
          }
        });
      }

      const isDescendant = (ancestorId: string, candidateId: string): boolean => {
        const ancestor = nodeMap.get(ancestorId);
        if (!ancestor || !ancestor.childrenIds) return false;
        if (ancestor.childrenIds.includes(candidateId)) return true;
        return ancestor.childrenIds.some(cid => isDescendant(cid, candidateId));
      };

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const targetCard = elements.find(el =>
        el.classList.contains('mindmap-node-card') &&
        el.id !== `node-${draggingIdRef.current}` &&
        !el.classList.contains('drag-ghost-card')
      );

      let foundId: string | null = null;
      let foundPos: 'before' | 'after' | 'inside' = 'inside';

      if (targetCard) {
        const tid = targetCard.id.replace('node-', '');
        if (!isDescendant(draggingIdRef.current, tid)) {
          foundId = tid;
          const rect = targetCard.getBoundingClientRect();
          const relY = (e.clientY - rect.top) / rect.height;
          const targetNode = nodeMap.get(tid);

          if (targetNode?.side === 'root') {
            foundPos = 'inside';
          } else if (targetNode?.side === 'left' && e.clientX < rect.left + 25) {
            foundPos = 'inside';
          } else if (targetNode?.side !== 'left' && e.clientX > rect.right - 25) {
            foundPos = 'inside';
          } else if (relY < 0.20) {
            foundPos = 'before';
          } else if (relY > 0.80) {
            foundPos = 'after';
          } else {
            foundPos = 'inside';
          }
        }
      }

      // Detecção magnética bidirecional (suporta nós do lado esquerdo e direito)
      if (!foundId) {
        let bestDist = Infinity;
        const allCards = document.querySelectorAll<HTMLElement>('.mindmap-node-card:not(.drag-ghost-card)');

        allCards.forEach(card => {
          const cid = card.id.replace('node-', '');
          if (!draggingIdRef.current || cid === draggingIdRef.current || isDescendant(draggingIdRef.current, cid)) return;

          const rect = card.getBoundingClientRect();
          const candidateNode = nodeMap.get(cid);
          const isLeftBranch = candidateNode?.side === 'left';
          const leftBound = isLeftBranch ? rect.left - 140 : rect.left - 20;
          const rightBound = isLeftBranch ? rect.right + 20 : rect.right + 140;

          const inMagneticZone = (
            e.clientX >= leftBound &&
            e.clientX <= rightBound &&
            e.clientY >= rect.top - 25 &&
            e.clientY <= rect.bottom + 25
          );

          if (inMagneticZone) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

            if (dist < bestDist) {
              bestDist = dist;
              foundId = cid;
              if (candidateNode?.side === 'root') {
                foundPos = 'inside';
              } else if ((isLeftBranch && e.clientX < rect.left + 15) || (!isLeftBranch && e.clientX > rect.right - 15)) {
                foundPos = 'inside';
              } else {
                const relY = (e.clientY - rect.top) / rect.height;
                if (relY < 0.20) foundPos = 'before';
                else if (relY > 0.80) foundPos = 'after';
                else foundPos = 'inside';
              }
            }
          }
        });
      }

      if (foundId) {
        dropTargetRef.current = { id: foundId, pos: foundPos };
        setDropTargetNodeId(foundId);
        setDropPosition(foundPos);
      } else {
        dropTargetRef.current = { id: null, pos: 'inside' };
        setDropTargetNodeId(null);
        setDropPosition('inside');
      }
    };

    const handleMouseUp = () => {
      const dragId = draggingIdRef.current;
      const { id: targetId, pos } = dropTargetRef.current;

      if (dragId && targetId && dragId !== targetId) {
        if (onReorderInsertNode) {
          onReorderInsertNode(dragId, targetId, pos);
        } else {
          onReparentNode(dragId, targetId);
        }
      } else if (dragId && !targetId && dragSourceScreenPosRef.current && dragCursorRef.current) {
        const curZoom = zoom > 0 ? zoom : 1;
        const deltaX = (dragCursorRef.current.x - dragSourceScreenPosRef.current.x) / curZoom;
        const deltaY = (dragCursorRef.current.y - dragSourceScreenPosRef.current.y) / curZoom;
        if (Math.hypot(deltaX, deltaY) > 8 && onMoveNodeFree) {
          onMoveNodeFree(dragId, deltaX, deltaY);
        }
      }

      resetDragState();
    };

    const handleCancelKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (draggingIdRef.current || dragPendingRef.current)) {
        resetDragState();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', resetDragState);
    window.addEventListener('keydown', handleCancelKey);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', resetDragState);
      window.removeEventListener('keydown', handleCancelKey);
    };
  }, [onReparentNode, onReorderInsertNode, onMoveNodeFree, nodeMap, zoom]);

  // ─── CONECTORES SVG ──────────────────────────────────────────────────────────
  const renderConnectors = () => {
    const paths: React.ReactElement[] = [];

    const parentChildrenMap = new Map<string, MindMapNode[]>();
    effectiveNodes.forEach(child => {
      if (!child.parentId || !isNodeVisible(child)) return;
      const parent = nodeMap.get(child.parentId);
      if (!parent || parent.collapsed) return;

      if (!parentChildrenMap.has(child.parentId)) {
        parentChildrenMap.set(child.parentId, []);
      }
      parentChildrenMap.get(child.parentId)!.push(child);
    });

    // Se for timeline: renderizar o eixo horizontal conectando os marcos
    if (effectiveLayout === 'timeline') {
      const rootNode = effectiveNodes.find(n => n.side === 'root') || effectiveNodes[0];
      const milestones = (rootNode?.childrenIds || [])
        .map(id => nodeMap.get(id))
        .filter((n): n is MindMapNode => Boolean(n));

      if (milestones.length > 0) {
        const sorted = [...milestones].sort((a, b) => getNodePos(a).x - getNodePos(b).x);
        const firstPos = getNodePos(sorted[0]);
        const lastPos = getNodePos(sorted[sorted.length - 1]);
        const axisY = firstPos.y + firstPos.height / 2;
        const axisStartX = firstPos.x - 50;
        const axisEndX = lastPos.x + lastPos.width + 50;

        // Linha principal do eixo horizontal do cronograma (estilo Whimsical)
        paths.push(
          <line
            key="timeline-axis-bar"
            x1={axisStartX}
            y1={axisY}
            x2={axisEndX}
            y2={axisY}
            stroke="#cbd5e1"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );

        // Se o root estiver acima, conectar o cabeçalho ao eixo
        if (rootNode) {
          const rPos = getNodePos(rootNode);
          paths.push(
            <line
              key="root-to-timeline-axis"
              x1={rPos.x + rPos.width / 2}
              y1={rPos.y + rPos.height}
              x2={rPos.x + rPos.width / 2}
              y2={axisY - 18}
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeDasharray="4 3"
            />
          );
        }
      }
    }

    parentChildrenMap.forEach((children, parentId) => {
      const parent = nodeMap.get(parentId);
      if (!parent) return;
      const pPos = getNodePos(parent);

      // No modo timeline, a linha horizontal do eixo já unifica o root aos marcos
      if (effectiveLayout === 'timeline' && parent.side === 'root') {
        return;
      }

      const isOrgChart = effectiveLayout === 'orgchart';
      const isTimeline = effectiveLayout === 'timeline';
      const isFlowchart = effectiveLayout === 'flowchart';

      children.sort((a, b) => {
        const aPos = getNodePos(a);
        const bPos = getNodePos(b);
        return isOrgChart || isTimeline || isFlowchart ? aPos.x - bPos.x : aPos.y - bPos.y;
      });

      const numChildren = children.length;
      const pad = Math.min(10, pPos.height * 0.22);
      const usableHeight = pPos.height - pad * 2;

      children.forEach((child, index) => {
        const cPos = getNodePos(child);
        const strokeColor = child.color || parent.color || '#6366f1';
        const isSelected = selectedNodeId === child.id || selectedNodeId === parent.id;
        const lineStyle = child.lineStyle || (isOrgChart || isFlowchart ? 'stepped' : (isTimeline ? 'straight' : 'bezier'));
        const isDraggingThis = draggingNodeId === child.id;

        // Determina se a conexão deve ser vertical
        const isVertical = isOrgChart || isTimeline || (isFlowchart && Math.abs(cPos.y - pPos.y) >= Math.abs(cPos.x - pPos.x) * 0.6);

        let pathData = '';
        let endX = 0;
        let endY = 0;

        if (isVertical) {
          const startX = pPos.x + pPos.width / 2;
          const startY = pPos.y + pPos.height;
          endX = cPos.x + cPos.width / 2;
          endY = cPos.y;

          if (lineStyle === 'straight' || (isTimeline && Math.abs(startX - endX) < 10)) {
            pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
          } else if (lineStyle === 'stepped' || isOrgChart) {
            const midY = startY + (endY - startY) * 0.5;
            pathData = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
          } else {
            const dy = Math.abs(endY - startY);
            const cpY = startY + dy * 0.5;
            pathData = `M ${startX} ${startY} C ${startX} ${cpY}, ${endX} ${cpY}, ${endX} ${endY}`;
          }
        } else {
          // Conexão Horizontal / Bi-direcional
          const hasSignificantOffset = Math.abs(child.offsetX || 0) >= 20;
          const isChildOnLeft =
            effectiveLayout === 'bidirectional' && !hasSignificantOffset && (child.side === 'left' || child.side === 'right')
              ? child.side === 'left'
              : (cPos.x + cPos.width / 2) < (pPos.x + pPos.width / 2);
          // No estilo Whimsical oficial, todos os ramos filhos partem do mesmo centro do pai
          const startX = isChildOnLeft ? pPos.x : pPos.x + pPos.width;
          const startY = pPos.y + pPos.height / 2;

          endX = isChildOnLeft ? cPos.x + cPos.width : cPos.x;
          endY = cPos.y + cPos.height / 2;

          if (lineStyle === 'straight') {
            pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
          } else if (lineStyle === 'stepped') {
            const midX = (startX + endX) / 2;
            pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
          } else {
            pathData = getBezierPath(startX, startY, endX, endY);
          }
        }

        paths.push(
          <g key={`conn-${child.id}`} style={{ opacity: isDraggingThis ? 0.2 : 1, transition: 'opacity 0.15s ease' }}>
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isSelected ? "2.6" : "1.8"}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: isSelected ? 1 : 0.88,
                transition: 'stroke-width 0.15s ease, opacity 0.15s ease'
              }}
            />
          </g>
        );
      });
    });

    // ─── CONEXÕES TRANSVERSAIS ENTRE RAMOS (CROSS-LINKS) ──────────────────────
    const crossLinkPaths = (connectors || []).map(conn => {
      const fromNode = nodeMap.get(conn.fromId);
      const toNode = nodeMap.get(conn.toId);
      if (!fromNode || !toNode || !isNodeVisible(fromNode) || !isNodeVisible(toNode)) return null;

      const p1 = getNodePos(fromNode);
      const p2 = getNodePos(toNode);

      const c1x = p1.x + p1.width / 2;
      const c1y = p1.y + p1.height / 2;
      const c2x = p2.x + p2.width / 2;
      const c2y = p2.y + p2.height / 2;

      // Determina borda mais próxima
      const startX = c1x < c2x ? p1.x + p1.width : p1.x;
      const startY = c1y;
      const endX = c1x < c2x ? p2.x : p2.x + p2.width;
      const endY = c2y;

      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curvature = Math.min(80, Math.max(30, dist * 0.22));

      const cp1x = startX + (c1x < c2x ? curvature : -curvature);
      const cp1y = startY - curvature * 0.6;
      const cp2x = endX - (c1x < c2x ? curvature : -curvature);
      const cp2y = endY - curvature * 0.6;

      const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 - curvature * 0.45;

      const color = conn.color || '#6366f1';

      return (
        <g key={conn.id} className="crosslink-group">
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeDasharray="5 4"
            markerEnd="url(#crosslink-arrow)"
            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
          />
          <foreignObject
            x={midX - 55}
            y={midY - 14}
            width="110"
            height="28"
            style={{ pointerEvents: 'auto', overflow: 'visible' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1e293b',
                border: `1px solid ${color}`,
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#f8fafc',
                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onClick={(e) => {
                e.stopPropagation();
                const newLabel = prompt('Nome da relação:', conn.label || 'relação');
                if (newLabel !== null) onUpdateConnectorLabel?.(conn.id, newLabel.trim());
              }}
              title="Clique para renomear. Clique no × para excluir."
            >
              <span>{conn.label || 'relação'}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConnector?.(conn.id);
                }}
                style={{ marginLeft: '6px', opacity: 0.65, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                title="Excluir conexão"
              >
                ×
              </span>
            </div>
          </foreignObject>
        </g>
      );
    });

    // Calcula o bounding box dinâmico real apenas do conteúdo visível (elimina buffer fixo 10000x10000 na GPU)
    let minSvgX = Infinity;
    let minSvgY = Infinity;
    let maxSvgX = -Infinity;
    let maxSvgY = -Infinity;

    effectiveNodes.forEach(n => {
      if (!isNodeVisible(n)) return;
      const p = getNodePos(n);
      if (p.x < minSvgX) minSvgX = p.x;
      if (p.y < minSvgY) minSvgY = p.y;
      if (p.x + p.width > maxSvgX) maxSvgX = p.x + p.width;
      if (p.y + p.height > maxSvgY) maxSvgY = p.y + p.height;
    });

    const svgX = isFinite(minSvgX) ? Math.floor(minSvgX - 260) : -600;
    const svgY = isFinite(minSvgY) ? Math.floor(minSvgY - 260) : -400;
    const svgW = isFinite(minSvgX) ? Math.max(200, Math.ceil(maxSvgX - minSvgX + 520)) : 1200;
    const svgH = isFinite(minSvgY) ? Math.max(200, Math.ceil(maxSvgY - minSvgY + 520)) : 800;

    return (
      <svg
        width={svgW}
        height={svgH}
        viewBox={`${svgX} ${svgY} ${svgW} ${svgH}`}
        style={{
          position: 'absolute',
          top: svgY,
          left: svgX,
          width: svgW,
          height: svgH,
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 5
        }}
      >
        <defs>
          <marker
            id="crosslink-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366f1" />
          </marker>
        </defs>
        {paths}
        {crossLinkPaths}
      </svg>
    );
  };

  // ─── GHOST CARD + DUAL CONNECTOR LINES via Portal ───────────────────────────
  // Renderiza no document.body para isolar completamente de transforms de zoom/pan.
  // 1. Linha de origem: rastro suave de onde o card foi puxado
  // 2. Linha de destino: conecta dinamicamente do nó-alvo até o cursor em tempo real
  // 3. Card compacto: tamanho reduzido (nunca tampa a tela), texto com reticências
  const renderDragGhost = () => {
    if (!draggingNodeId || !dragCursorPos) return null;

    const dragNode = nodeMap.get(draggingNodeId);
    if (!dragNode) return null;

    const nodeColor = dragNode.color || '#6366f1';
    const borderStyle = dragNode.borderStyle || 'accent';

    let ghostBg = 'var(--bg-surface)';
    let ghostBorder = `1.5px solid var(--border-subtle)`;
    let ghostBorderLeft: string | undefined = undefined;

    if (borderStyle === 'fill') {
      ghostBg = nodeColor;
      ghostBorder = `1.5px solid ${nodeColor}`;
    } else if (borderStyle === 'border') {
      ghostBg = 'var(--bg-surface)';
      ghostBorder = `1.5px solid ${nodeColor}`;
    } else {
      ghostBg = 'var(--bg-surface)';
      ghostBorder = `1px solid var(--border-subtle)`;
      ghostBorderLeft = `3.5px solid ${nodeColor}`;
    }

    const src = dragSourceScreenPosRef.current;
    const cx = dragCursorPos.x;
    const cy = dragCursorPos.y;

    // 1. Linha do nó de origem (onde o card estava originalmente)
    let srcBezierD = '';
    if (src) {
      const cpx = src.x + (cx - src.x) * 0.5;
      srcBezierD = `M ${src.x} ${src.y} C ${cpx} ${src.y}, ${cpx} ${cy}, ${cx} ${cy}`;
    }

    // 2. Linha do nó de destino (para onde o card vai se conectar!)
    let targetInfo: {
      nodeColor: string;
      bezierD: string;
      portX: number;
      portY: number;
      insertX1?: number;
      insertX2?: number;
      insertY?: number;
      position: 'before' | 'after' | 'inside';
    } | null = null;

    if (dropTargetNodeId) {
      const targetEl = document.getElementById(`node-${dropTargetNodeId}`);
      const targetNode = nodeMap.get(dropTargetNodeId);
      if (targetEl && targetNode) {
        const tRect = targetEl.getBoundingClientRect();
        const tColor = targetNode.color || '#6366f1';

        if (dropPosition === 'inside') {
          const attachLeft = targetNode.side === 'left';
          const portX = attachLeft ? tRect.left : tRect.right;
          const portY = tRect.top + tRect.height / 2;
          const endX = attachLeft ? Math.min(portX - 15, cx + 80) : Math.max(portX + 15, cx - 80);
          const endY = cy;
          const cpx = portX + (endX - portX) * 0.5;
          const bezierD = `M ${portX} ${portY} C ${cpx} ${portY}, ${cpx} ${endY}, ${endX} ${endY}`;
          targetInfo = {
            nodeColor: tColor,
            bezierD,
            portX,
            portY,
            position: 'inside'
          };
        } else {
          // Reordenação 'before' ou 'after'
          const insertY = dropPosition === 'before' ? tRect.top - 4 : tRect.bottom + 4;
          targetInfo = {
            nodeColor: tColor,
            bezierD: '',
            portX: tRect.left,
            portY: insertY,
            insertX1: tRect.left - 6,
            insertX2: tRect.right + 6,
            insertY,
            position: dropPosition
          };
        }
      }
    }

    return createPortal(
      <>
        {/* SVG de tela cheia para ambas as conexões em tempo real */}
        <svg
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9998,
            overflow: 'visible'
          }}
        >
          {/* Linha 1: Do nó-fonte ao cursor (rastro sutil de onde veio) */}
          {src && (
            <g opacity={targetInfo ? 0.22 : 0.85} style={{ transition: 'opacity 0.15s ease' }}>
              <path
                d={srcBezierD}
                fill="none"
                stroke={nodeColor}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeDasharray="6 4"
              />
              <circle cx={src.x} cy={src.y} r={3.5} fill={nodeColor} opacity={0.6} />
            </g>
          )}

          {/* Linha 2: Conexão viva ao nó-alvo (Whimsical style - novo pai conectado!) */}
          {targetInfo && targetInfo.position === 'inside' && (
            <g>
              {/* Glow sutil ao redor da linha */}
              <path
                d={targetInfo.bezierD}
                fill="none"
                stroke={targetInfo.nodeColor}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.2}
              />
              {/* Linha conectora viva com fluxo animado */}
              <path
                className="drag-connector-march"
                d={targetInfo.bezierD}
                fill="none"
                stroke={targetInfo.nodeColor}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeDasharray="7 4"
                opacity={0.95}
              />
              {/* Ponto / Porta de conexão no card-alvo */}
              <circle
                cx={targetInfo.portX}
                cy={targetInfo.portY}
                r={5.5}
                fill={targetInfo.nodeColor}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              {/* Círculo de encaixe no card filho */}
              <circle
                cx={Math.max(targetInfo.portX + 15, cx - 80)}
                cy={cy}
                r={4}
                fill={targetInfo.nodeColor}
                opacity={0.9}
              />
            </g>
          )}

          {/* Linha 3: Barra sutil e limpa de inserção entre irmãos */}
          {targetInfo && (targetInfo.position === 'before' || targetInfo.position === 'after') && (
            <g>
              <line
                x1={targetInfo.insertX1}
                y1={targetInfo.insertY}
                x2={targetInfo.insertX2}
                y2={targetInfo.insertY}
                stroke={targetInfo.nodeColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                opacity={0.95}
              />
              <circle
                cx={targetInfo.insertX1}
                cy={targetInfo.insertY}
                r={4}
                fill={targetInfo.nodeColor}
              />
              {/* Linha guia suave do ponto de inserção até o cursor */}
              <path
                d={`M ${(targetInfo.insertX1! + targetInfo.insertX2!) / 2} ${targetInfo.insertY} Q ${cx} ${targetInfo.insertY}, ${cx} ${cy}`}
                fill="none"
                stroke={targetInfo.nodeColor}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0.55}
              />
            </g>
          )}
        </svg>

        {/* Card fantasma: compacto, elegante, NUNCA cobre a tela inteira */}
        <div
          className="drag-ghost-card"
          style={{
            position: 'fixed',
            left: `${cx}px`,
            top: `${cy}px`,
            transform: 'translate(-50%, -50%) scale(0.92)',
            pointerEvents: 'none',
            zIndex: 10000,
            maxWidth: '190px',
            backgroundColor: ghostBg,
            borderTop: ghostBorder,
            borderRight: ghostBorder,
            borderBottom: ghostBorder,
            borderLeft: ghostBorderLeft || ghostBorder,
            borderRadius: '6px',
            padding: '5px 11px',
            fontWeight: 500,
            fontSize: '12px',
            color: borderStyle === 'fill' ? '#ffffff' : 'var(--text-primary)',
            boxShadow: `0 10px 28px rgba(0,0,0,0.45), 0 0 0 1px ${targetInfo ? targetInfo.nodeColor : nodeColor}55`,
            opacity: 0.96,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em',
            userSelect: 'none',
            willChange: 'transform',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            fontSize: '12px'
          }}>
            {dragNode.text || '...'}
          </span>
          {targetInfo && (
            <span style={{
              fontSize: '9.5px',
              padding: '1px 5px',
              borderRadius: '3px',
              backgroundColor: targetInfo.nodeColor,
              color: '#ffffff',
              fontWeight: 700,
              flexShrink: 0,
              letterSpacing: '0.03em',
              textTransform: 'uppercase'
            }}>
              {targetInfo.position === 'inside' ? 'Filho' : 'Irmão'}
            </span>
          )}
        </div>
      </>,
      document.body
    );
  };

  // Encontra nó selecionado para renderizar o menu contextual
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;
  const selectedPos = selectedNode ? getNodePos(selectedNode) : null;

  // Determina se pode mover para cima ou para baixo entre os irmãos
  let canMoveUp = false;
  let canMoveDown = false;
  if (selectedNode && selectedNode.parentId) {
    const parent = nodeMap.get(selectedNode.parentId);
    if (parent) {
      const idx = parent.childrenIds.indexOf(selectedNode.id);
      canMoveUp = idx > 0;
      canMoveDown = idx < parent.childrenIds.length - 1;
    }
  }

  return (
    <>
      {/* Camada Vetorial Global de Linhas */}
      {renderConnectors()}

      {/* Menu Contextual Flutuante Superior (oculto durante arraste, edição, overlay, multisseleção ou ramo recolhido) */}
      {!isOverlayOpen &&
        !draggingNodeId &&
        !editingId &&
        selectedNode &&
        selectedPos &&
        isNodeVisible(selectedNode) &&
        (!selectedNodeIds || selectedNodeIds.length <= 1) && (
        <NodeContextMenu
          node={selectedNode}
          position={selectedPos}
          pan={pan}
          zoom={zoom}
          onUpdateStyle={(updates) => onUpdateNodeStyle(selectedNode.id, updates)}
          onToggleCollapse={() => onToggleCollapse(selectedNode.id)}
          onAddChild={() => onAddChildNode(selectedNode.id)}
          onAddSibling={() => onAddSiblingNode(selectedNode.id)}
          onMoveUp={() => onReorderNode(selectedNode.id, 'up')}
          onMoveDown={() => onReorderNode(selectedNode.id, 'down')}
          onDuplicate={() => onDuplicateNode(selectedNode.id)}
          onDelete={() => onDeleteNode(selectedNode.id)}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          hasChildren={getNodeChildrenIds(selectedNode).length > 0}
        />
      )}

      {/* Renderização dos Nós */}
      {effectiveNodes.map(node => {
        if (!isNodeVisible(node)) return null;

        const isRoot = node.side === 'root';
        const isMultiSelected = selectedNodeIds && selectedNodeIds.length > 1 && selectedNodeIds.includes(node.id);
        const isSingleSelected = selectedNodeId === node.id || (selectedNodeIds && selectedNodeIds.length === 1 && selectedNodeIds[0] === node.id);
        const isSelected = isSingleSelected || isMultiSelected;
        const isHovered = hoveredNodeId === node.id;
        const isEditing = editingId === node.id;
        const isDropTarget = dropTargetNodeId === node.id;
        const directChildrenIds = getNodeChildrenIds(node);
        const hasChildren = directChildrenIds.length > 0;
        const totalDescendants = countDescendants(node.id);
        const childCount = totalDescendants > 0 ? totalDescendants : directChildrenIds.length;
        const isDraggingThis = draggingNodeId === node.id;

        const pos = getNodePos(node);
        const nodeColor = node.color || '#38bdf8';

        // Dimensões dinâmicas: durante a edição, garante espaço confortável de no mínimo 160px para acomodar todo o texto e placeholder
        const editMinWidth = 160;
        const cardWidth = isEditing ? Math.max(pos.width, editMinWidth) : pos.width;
        const cardLeft = isEditing && node.side === 'left' ? (pos.x + pos.width - cardWidth) : pos.x;

        const isBold = !!node.bold || isRoot;
        const isItalic = !!node.italic;
        const fontSizePx = node.fontSize === 'small' ? '12px' : node.fontSize === 'large' ? '15.5px' : (isRoot ? '16px' : '13.5px');
        const textColor = 'var(--text-primary)';

        const isConnectingSource = connectingSourceId === node.id;
        const isUncertain = node.origin === 'uncertain' || node.confidence === 'low';
        const isSuggested = node.origin === 'suggested';

        // ESTILO DO CARD (Normal vs Edição vs Sugestão/Incerteza)
        // Quando em edição: fundo sólido corporativo de alto contraste, borda viva, sombra elegante
        const nodeBg = isEditing
          ? 'var(--bg-surface, #1e222a)'
          : isSelected
          ? 'rgba(56, 189, 248, 0.08)'
          : isUncertain
          ? 'rgba(245, 158, 11, 0.06)'
          : isSuggested
          ? 'rgba(16, 185, 129, 0.06)'
          : (isHovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent');

        const nodeBorder = isEditing
          ? `1.5px solid ${nodeColor}`
          : isSelected
          ? `1.5px solid ${nodeColor}`
          : isUncertain
          ? '1.5px dashed #f59e0b'
          : isSuggested
          ? '1.5px solid #10b981'
          : (isHovered ? '1.5px solid rgba(255, 255, 255, 0.12)' : '1.5px solid transparent');

        const nodeBoxShadow = isEditing
          ? `0 0 0 3px ${nodeColor}28, 0 6px 18px rgba(0,0,0,0.35)`
          : 'none';

        return (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''} ${isConnectingSource ? 'connecting-source' : ''} ${isEditing ? 'editing' : ''}`}
            style={{
              position: 'absolute',
              left: `${cardLeft}px`,
              top: `${pos.y}px`,
              width: `${cardWidth}px`,
              minHeight: `${pos.height}px`,
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: nodeBg,
              border: nodeBorder,
              borderRadius: isRoot ? '6px' : '4px',
              boxShadow: nodeBoxShadow,
              outline: 'none',
              padding: isEditing ? '3px 8px' : (isRoot ? '2px 8px' : '1px 8px'),
              zIndex: isEditing ? 100 : (isConnectingSource ? 50 : (isDropTarget ? 45 : (isSelected ? 35 : 20))),
              cursor: currentTool === 'connect' ? 'crosshair' : (isRoot ? 'default' : (isDraggingThis ? 'grabbing' : 'grab')),
              opacity: isDraggingThis ? 0.35 : 1,
              filter: isDraggingThis ? 'grayscale(0.4) blur(0.5px)' : undefined,
              userSelect: 'none',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              transition: isDraggingThis ? 'none' : 'background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease'
            }}
            onClick={(e) => {
              if (currentTool === 'hand') return;
              e.stopPropagation();
              if (currentTool === 'connect') {
                onConnectNode?.(node.id);
                return;
              }
              if (e.ctrlKey || e.metaKey || e.shiftKey) {
                const current = selectedNodeIdsRef.current || [];
                const next = current.includes(node.id)
                  ? current.filter(id => id !== node.id)
                  : [...current, node.id];
                selectedNodeIdsRef.current = next;
                onSelectMultipleNodes?.(next);
              } else {
                selectedNodeIdsRef.current = [node.id];
                onSelectNode(node.id);
              }
            }}
            onDoubleClick={(e) => handleStartEdit(node, e)}
            onMouseEnter={() => handleMouseEnterNode(node.id)}
            onMouseLeave={() => handleMouseLeaveNode(node.id)}
            onMouseDown={(e) => handleMouseDown(node, e)}
          >
            {/* Ícone / Emoji Associado */}
            {node.icon && (
              <span style={{ marginRight: '6px', fontSize: '14px', verticalAlign: 'middle', userSelect: 'none' }}>
                {node.icon}
              </span>
            )}

            {/* Badges de Origem da IA (Sugestão vs Incerto) */}
            {!isEditing && isSuggested && (
              <span
                data-testid={`badge-suggested-${node.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  marginRight: '6px',
                  userSelect: 'none',
                  lineHeight: '1.2'
                }}
                title="Sugestão gerada pela IA"
              >
                Sugestão
              </span>
            )}
            {!isEditing && isUncertain && (
              <span
                data-testid={`badge-uncertain-${node.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontSize: '9.5px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  marginRight: '6px',
                  userSelect: 'none',
                  lineHeight: '1.2'
                }}
                title="Informação incerta ou ambígua detectada pela IA"
              >
                Incerto
              </span>
            )}

            {/* Texto ou Input de Edição */}
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                placeholder="Digite o texto..."
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleCommitEdit}
                onKeyDown={(e) => handleKeyDown(e, node)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: textColor,
                  borderRadius: '2px',
                  padding: '2px 4px',
                  fontSize: fontSizePx,
                  fontWeight: isBold ? 700 : 500,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  outline: 'none',
                  caretColor: nodeColor,
                  lineHeight: '1.3'
                }}
              />
            ) : node.text.includes('\n') ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', userSelect: 'none' }}>
                <span style={{
                  color: textColor,
                  fontSize: fontSizePx,
                  fontWeight: isBold ? 700 : 500,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.25
                }}>
                  {node.text.split('\n')[0]}
                </span>
                <span style={{
                  color: 'var(--text-muted, #64748b)',
                  fontSize: `calc(${fontSizePx} - 1.5px)`,
                  fontWeight: 400,
                  marginTop: '1px',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}>
                  {node.text.split('\n').slice(1).join(' ')}
                </span>
              </div>
            ) : (
              <span style={{
                userSelect: 'none',
                color: textColor,
                fontSize: fontSizePx,
                fontWeight: isBold ? 700 : 500,
                fontStyle: isItalic ? 'italic' : 'normal',
                letterSpacing: '-0.01em',
                minWidth: node.text ? undefined : '40px',
                display: 'inline-block'
              }}>
                {node.text}
              </span>
            )}

            {/* Hiperlink Externo */}
            {node.link && (
              <a
                href={node.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginLeft: '6px',
                  color: textColor,
                  display: 'inline-flex',
                  alignItems: 'center',
                  verticalAlign: 'middle',
                  opacity: 0.85
                }}
                title={`Abrir link: ${node.link}`}
              >
                <ExternalLink size={12} />
              </a>
            )}

            {/* Corredor de Ações Rápidas: Minimizar/Expandir e Adicionar Nós Filhos com Espaçamento Limpo */}
            {!isEditing && !draggingNodeId && currentTool === 'select' && (
              <div
                className="node-actions-bridge"
                style={{
                  position: 'absolute',
                  ...(node.side === 'left'
                    ? { right: '100%', paddingRight: '8px', paddingLeft: '4px', flexDirection: 'row-reverse' }
                    : { left: '100%', paddingLeft: '8px', paddingRight: '4px', flexDirection: 'row' }
                  ),
                  top: '0',
                  bottom: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  zIndex: 60,
                  pointerEvents: 'auto',
                  // Se recolhido, o badge é sempre visível; se expandido, os botões surgem no hover ou seleção
                  visibility: (hasChildren && node.collapsed) || (isHovered || isSelected) ? 'visible' : 'hidden',
                  opacity: (hasChildren && node.collapsed) || (isHovered || isSelected) ? 1 : 0,
                  transition: 'opacity 0.15s ease'
                }}
              >
                {/* Se o ramo estiver RECOLHIDO: exibe Badge Contador com total de itens ocultos */}
                {hasChildren && node.collapsed && (
                  <button
                    type="button"
                    className="branch-counter-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCollapse(node.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title={`${childCount} ${childCount === 1 ? 'item recolhido' : 'itens recolhidos'}. Clique para expandir (Atalho: Ctrl+/).`}
                    style={{
                      height: '22px',
                      minWidth: '22px',
                      borderRadius: '11px',
                      padding: '0 7px',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: `1.5px solid ${nodeColor || '#6366f1'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                      userSelect: 'none',
                      flexShrink: 0,
                      lineHeight: 1,
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {childCount}
                  </button>
                )}

                {/* Se o ramo estiver ABERTO e tiver filhos: exibe Botão de Minimizar / Recolher com espaçamento confortável de 10px em relação ao + */}
                {hasChildren && !node.collapsed && (isHovered || isSelected) && (
                  <button
                    type="button"
                    className="node-collapse-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCollapse(node.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title={`Recolher ramo (${childCount} ${childCount === 1 ? 'item' : 'itens'}) (Atalho: Ctrl+/)`}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface, #1e293b)',
                      color: 'var(--text-secondary, #cbd5e1)',
                      border: '1.5px solid var(--border-subtle, #475569)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      lineHeight: 1,
                      userSelect: 'none',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease'
                    }}
                  >
                    −
                  </button>
                )}

                {/* Se não houver alças direcionais dedicadas do motor: exibe o botão + rápido lateral clássico */}
                {engine.id === 'mindmap' && (isHovered || isSelected) && (
                  <div
                    className="node-quick-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChildNode(node.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Adicionar nó filho (Atalho: Tab)"
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: nodeColor || '#6366f1',
                      border: '2px solid #ffffff',
                      boxShadow: `0 2px 8px ${nodeColor || '#6366f1'}55`,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 700,
                      lineHeight: 1,
                      userSelect: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease'
                    }}
                  >
                    +
                  </div>
                )}
              </div>
            )}

            {/* Alças de Ação Direcional Específicas do Motor do Template (Organograma e Fluxograma) */}
            {!isEditing && !draggingNodeId && currentTool === 'select' && (isHovered || isSelected) && engine.id !== 'mindmap' && (
              <>
                {engine.getActionHandles(node, isRoot).map(handle => (
                  <button
                    key={handle.id}
                    type="button"
                    className="template-engine-handle"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChildNode(node.id, handle.direction);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title={handle.tooltip}
                    style={{
                      ...handle.style,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: handle.color || nodeColor || '#6366f1',
                      border: '2px solid #ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      lineHeight: 1,
                      userSelect: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = `${handle.style.transform || ''} scale(1.2)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = `${handle.style.transform || ''} scale(1)`;
                    }}
                  >
                    +
                  </button>
                ))}
              </>
            )}
          </div>
        );
      })}

      {/* Ghost Card + Linha Elástica (Whimsical-style) — renderizado FORA do canvas transform */}
      {renderDragGhost()}
    </>
  );
};
