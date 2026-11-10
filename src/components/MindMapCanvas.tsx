import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath, cleanAndNormalizeMindMap } from '../utils/treeLayout';
import { NodeContextMenu } from './NodeContextMenu';

interface MindMapCanvasProps {
  nodes: MindMapNode[];
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  editingNodeId?: string | null;
  layoutType?: 'bidirectional' | 'right' | 'orgchart' | 'timeline' | 'free';
  onClearEditingNodeId?: () => void;
  onSelectNode: (id: string | null) => void;
  onSelectMultipleNodes?: (ids: string[]) => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddChildNode: (parentId: string) => void;
  onAddSiblingNode: (nodeId: string) => void;
  onAddSiblingAboveNode?: (nodeId: string) => void;
  onAddParentNode?: (nodeId: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteMultipleNodes?: (ids: string[]) => void;
  onDuplicateMultipleNodes?: (ids: string[]) => void;
  onMoveNodeOffset?: (id: string, dx: number, dy: number) => void;
  onReorderNode: (nodeId: string, direction: 'up' | 'down') => void;
  onReparentNode: (childId: string, newParentId: string) => void;
  onReorderInsertNode?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onUpdateNodeStyle: (nodeId: string, updates: Partial<MindMapNode>) => void;
  onDuplicateNode: (nodeId: string) => void;
  pan?: { x: number; y: number };
  zoom?: number;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
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
  onReorderNode,
  onReparentNode,
  onReorderInsertNode,
  onUpdateNodeStyle,
  onDuplicateNode,
  pan,
  zoom = 1
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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

  // Sincroniza início de edição direta quando um novo nó é criado
  useEffect(() => {
    if (editingNodeId) {
      const target = nodes.find(n => n.id === editingNodeId);
      if (target) {
        setEditingId(target.id);
        setEditingText(target.text);
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

  // Determina o layout efetivo (passado explicitamente pelo board/template ou auto-detectado com elegância)
  const effectiveLayout = useMemo(() => {
    if (layoutType) return layoutType;
    const root = effectiveNodes.find(n => n.side === 'root') || effectiveNodes[0];
    const rootText = (root?.text || '').toLowerCase();
    if (rootText.includes('timeline') || rootText.includes('roadmap') || rootText.includes('cronograma')) return 'timeline';
    if (rootText.includes('org chart') || rootText.includes('pod structure') || rootText.includes('organograma')) return 'orgchart';
    if (effectiveNodes.some(n => n.side === 'left')) return 'bidirectional';
    return 'bidirectional';
  }, [layoutType, effectiveNodes]);

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
  }, [effectiveNodes, effectiveLayout]);

  // Posição final calculada estritamente pelo algoritmo responsivo (Zero entrelaçamento)
  const getNodePos = (node: MindMapNode) => {
    const computed = layoutMap.get(node.id);
    return {
      x: computed ? computed.x : (node.x || 0),
      y: computed ? computed.y : (node.y || 0),
      width: computed ? computed.width : 160,
      height: computed ? computed.height : 40
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
      // Se o usuário não digitou nada em um nó novo (ou limpou o texto), remove para não deixar espaço em branco
      if (!trimmed && node && node.side !== 'root' && node.id !== 'root') {
        onDeleteNode(editingId);
      } else {
        onUpdateNodeText(editingId, trimmed);
      }
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
      const trimmed = editingText.trim();
      if (!trimmed && node.side !== 'root' && node.id !== 'root') {
        onDeleteNode(node.id);
      }
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
    if (editingId === node.id) return;
    if (e.button !== 0) return;
    e.stopPropagation();

    const isAlreadySelected = selectedNodeIds && selectedNodeIds.includes(node.id);
    if (!isAlreadySelected && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      onSelectNode(node.id);
    }

    if (node.side === 'root') return;

    dragPendingRef.current = { id: node.id, clientX: e.clientX, clientY: e.clientY };
  };

  // ─── DRAG: mouse move + mouse up (global) ────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Ativa o arraste somente após threshold de 4px
      if (dragPendingRef.current && !draggingIdRef.current) {
        const dx = Math.abs(e.clientX - dragPendingRef.current.clientX);
        const dy = Math.abs(e.clientY - dragPendingRef.current.clientY);
        if (dx > 4 || dy > 4) {
          const pendingId = dragPendingRef.current.id;
          draggingIdRef.current = pendingId;

          // Captura síncronamente o centro do card no viewport
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

          // Dispara o re-render para mostrar o ghost
          setDraggingNodeId(pendingId);
          setDragCursorPos({ x: e.clientX, y: e.clientY });
        }
      }

      if (!draggingIdRef.current) return;

      // Atualiza posição via RAF — evita re-renders desnecessários em 60fps
      dragCursorRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (dragCursorRef.current) {
            setDragCursorPos({ ...dragCursorRef.current });
          }
        });
      }

      // Helper para verificar ciclos na árvore (não permite soltar em descendentes)
      const isDescendant = (ancestorId: string, candidateId: string): boolean => {
        const ancestor = nodeMap.get(ancestorId);
        if (!ancestor || !ancestor.childrenIds) return false;
        if (ancestor.childrenIds.includes(candidateId)) return true;
        return ancestor.childrenIds.some(cid => isDescendant(cid, candidateId));
      };

      // 1. Detecção direta sob o cursor
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

          if (targetNode?.side === 'root' || e.clientX > rect.right - 25) {
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

      // 2. Detecção magnética por proximidade (facilita muito conectar à direita de qualquer nó)
      if (!foundId) {
        let bestDist = Infinity;
        const allCards = document.querySelectorAll<HTMLElement>('.mindmap-node-card:not(.drag-ghost-card)');

        allCards.forEach(card => {
          const cid = card.id.replace('node-', '');
          if (!draggingIdRef.current || cid === draggingIdRef.current || isDescendant(draggingIdRef.current, cid)) return;

          const rect = card.getBoundingClientRect();
          // Zona magnética generosa: até 140px à direita (onde filhos vivem) e 25px em torno
          const inMagneticZone = (
            e.clientX >= rect.left - 20 &&
            e.clientX <= rect.right + 140 &&
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
              if (e.clientX > rect.right - 15) {
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
      dragPendingRef.current = null;

      const dragId = draggingIdRef.current;
      const { id: targetId, pos } = dropTargetRef.current;

      if (dragId && targetId && dragId !== targetId) {
        if (onReorderInsertNode) {
          onReorderInsertNode(dragId, targetId, pos);
        } else {
          onReparentNode(dragId, targetId);
        }
      }

      // Reset completo do estado de drag
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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onReparentNode, onReorderInsertNode, nodeMap]);

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

      children.sort((a, b) => {
        const aPos = getNodePos(a);
        const bPos = getNodePos(b);
        return isOrgChart || isTimeline ? aPos.x - bPos.x : aPos.y - bPos.y;
      });

      const numChildren = children.length;
      const pad = Math.min(10, pPos.height * 0.22);
      const usableHeight = pPos.height - pad * 2;

      children.forEach((child, index) => {
        const cPos = getNodePos(child);
        const strokeColor = child.color || parent.color || '#6366f1';
        const isSelected = selectedNodeId === child.id || selectedNodeId === parent.id;
        const lineStyle = child.lineStyle || (isOrgChart ? 'stepped' : (isTimeline ? 'straight' : 'bezier'));
        const isDraggingThis = draggingNodeId === child.id;

        // Determina se a conexão deve ser vertical (topo para base)
        const isVertical = isOrgChart || isTimeline || (cPos.y >= pPos.y + pPos.height * 0.7 && Math.abs(cPos.x - pPos.x) < 400);

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
          const isChildOnLeft = (cPos.x + cPos.width / 2) < (pPos.x + pPos.width / 2);
          const startX = isChildOnLeft ? pPos.x : pPos.x + pPos.width;

          const startY = numChildren <= 1
            ? pPos.y + pPos.height / 2
            : pPos.y + pad + (usableHeight * index) / (numChildren - 1);

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
              strokeWidth={isSelected ? "3.2" : "2.2"}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: isSelected ? 1 : 0.88,
                transition: 'stroke-width 0.15s ease, opacity 0.15s ease'
              }}
            />
            <circle
              cx={endX}
              cy={endY}
              r={isSelected ? 3.5 : 2.5}
              fill={strokeColor}
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
          const portX = tRect.right;
          const portY = tRect.top + tRect.height / 2;
          const endX = Math.max(portX + 15, cx - 80);
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

      {/* Menu Contextual Flutuante Superior (Block UI Oficial Whimsical) */}
      {selectedNode && selectedPos && (
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
          hasChildren={selectedNode.childrenIds && selectedNode.childrenIds.length > 0}
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
        const childCount = countDescendants(node.id);
        const hasChildren = node.childrenIds && node.childrenIds.length > 0;
        const isDraggingThis = draggingNodeId === node.id;

        const pos = getNodePos(node);
        const nodeColor = node.color || '#6366f1';
        const borderStyle = node.borderStyle || 'accent';

        let bg = 'var(--bg-surface)';
        let border = `1.5px solid ${isSelected ? nodeColor : 'var(--border-subtle)'}`;
        let borderLeft = undefined;

        if (isRoot) {
          bg = 'var(--bg-elevated)';
          border = '2px solid var(--border-strong)';
        } else if (borderStyle === 'fill') {
          bg = nodeColor;
          border = `1.5px solid ${nodeColor}`;
        } else if (borderStyle === 'border') {
          bg = 'var(--bg-surface)';
          border = `2px solid ${nodeColor}`;
        } else if (borderStyle === 'text') {
          bg = 'transparent';
          border = isSelected ? `1.5px dashed ${nodeColor}` : '1.5px solid transparent';
        } else {
          bg = 'var(--bg-surface)';
          borderLeft = `4px solid ${nodeColor}`;
        }

        const isBold = !!node.bold || isRoot;
        const isItalic = !!node.italic;
        const fontSizePx = node.fontSize === 'small' ? '12px' : node.fontSize === 'large' ? '16px' : (isRoot ? '16px' : '13.5px');
        const textColor = borderStyle === 'fill' ? '#ffffff' : (borderStyle === 'text' ? nodeColor : 'var(--text-primary)');

        return (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${pos.width}px`,
              minWidth: `${pos.width}px`,
              minHeight: `${pos.height}px`,
              backgroundColor: bg,
              borderTop: isMultiSelected ? '1.5px solid var(--accent-purple, #6366f1)' : border,
              borderRight: isMultiSelected ? '1.5px solid var(--accent-purple, #6366f1)' : border,
              borderBottom: isMultiSelected ? '1.5px solid var(--accent-purple, #6366f1)' : border,
              borderLeft: isMultiSelected ? '1.5px solid var(--accent-purple, #6366f1)' : (borderLeft || border),
              outline: isDropTarget && dropPosition === 'inside'
                ? `2px solid ${nodeColor}`
                : isMultiSelected
                ? '2px solid var(--accent-purple, #6366f1)'
                : (isSelected ? `2px solid ${nodeColor}` : undefined),
              outlineOffset: '2px',
              boxShadow: isDropTarget && dropPosition === 'inside'
                ? `0 0 0 3px ${nodeColor}33, 0 6px 20px ${nodeColor}25`
                : (isSelected ? `0 0 12px ${nodeColor}55` : '0 2px 8px rgba(0, 0, 0, 0.2)'),
              zIndex: isDropTarget ? 45 : (isSelected ? 35 : 20),
              padding: isRoot ? '12px 24px' : '8px 14px',
              whiteSpace: 'nowrap',
              // Nó-fonte durante drag: semi-transparente + desfocado (como o Whimsical)
              opacity: isDraggingThis ? 0.35 : 1,
              filter: isDraggingThis ? 'grayscale(0.4) blur(0.5px)' : undefined,
              transition: isDraggingThis ? 'none' : 'opacity 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease',
              cursor: isRoot ? 'default' : (isDraggingThis ? 'grabbing' : 'grab'),
              pointerEvents: isDraggingThis ? 'none' : undefined
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (e.ctrlKey || e.metaKey || e.shiftKey) {
                const current = selectedNodeIds || [];
                const next = current.includes(node.id)
                  ? current.filter(id => id !== node.id)
                  : [...current, node.id];
                onSelectMultipleNodes?.(next);
              } else {
                onSelectNode(node.id);
              }
            }}
            onDoubleClick={(e) => handleStartEdit(node, e)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onMouseDown={(e) => handleMouseDown(node, e)}
          >
            {/* Ícone / Emoji Associado */}
            {node.icon && (
              <span style={{ marginRight: '6px', fontSize: '14px', verticalAlign: 'middle', userSelect: 'none' }}>
                {node.icon}
              </span>
            )}

            {/* Texto ou Input de Edição */}
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                placeholder="Digite algo..."
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleCommitEdit}
                onKeyDown={(e) => handleKeyDown(e, node)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: textColor,
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: fontSizePx,
                  fontWeight: isBold ? 700 : 500,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  outline: 'none',
                  minWidth: '80px'
                }}
              />
            ) : node.text.includes('\n') ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', userSelect: 'none' }}>
                <span style={{
                  color: textColor,
                  fontSize: fontSizePx,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.25
                }}>
                  {node.text.split('\n')[0]}
                </span>
                <span style={{
                  color: 'var(--text-muted, #64748b)',
                  fontSize: `calc(${fontSizePx} - 1.5px)`,
                  fontWeight: 400,
                  marginTop: '2px',
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
                minWidth: node.text ? undefined : '50px',
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

            {/* Badge de Ramos Recolhidos */}
            {hasChildren && node.collapsed && (
              <div
                className="branch-counter-badge"
                style={{ backgroundColor: nodeColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node.id);
                }}
                title={`Expandir ${childCount} ramos`}
              >
                {childCount}
              </div>
            )}

            {/* Botão de Recolher Ramo Aberto */}
            {hasChildren && !node.collapsed && !isRoot && (
              <div
                className="branch-collapse-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node.id);
                }}
                title="Recolher ramos deste nó"
              >
                −
              </div>
            )}

            {/* Botões Externos de Adicionar (Apenas 1 botão Filho e 1 botão Irmão) */}
            {(isSelected || isHovered) && !isEditing && !draggingNodeId && (
              <>
                {/* Adicionar Filho (à esquerda se o nó for do lado esquerdo, senão à direita) */}
                <div
                  style={{
                    position: 'absolute',
                    ...(node.side === 'left' ? { left: '-34px' } : { right: '-34px' }),
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChildNode(node.id);
                  }}
                  title="Criar Quadrado Filho (Atalho: Tab)"
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: nodeColor,
                      color: '#ffffff',
                      border: '2px solid var(--bg-surface, #ffffff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Plus size={13} strokeWidth={2.6} />
                  </div>
                </div>

                {/* Adicionar Irmão Abaixo (se não for raiz) */}
                {!isRoot && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-28px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '34px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 50
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSiblingNode(node.id);
                    }}
                    title="Criar Quadrado Irmão (Atalho: Enter)"
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        color: nodeColor,
                        border: `2px solid ${nodeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                        transition: 'transform 0.15s ease, background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.15)';
                        e.currentTarget.style.backgroundColor = nodeColor;
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface, #ffffff)';
                        e.currentTarget.style.color = nodeColor;
                      }}
                    >
                      <Plus size={13} strokeWidth={2.6} />
                    </div>
                  </div>
                )}
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
