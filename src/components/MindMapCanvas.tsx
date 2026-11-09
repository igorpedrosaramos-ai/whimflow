import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath } from '../utils/treeLayout';
import { NodeContextMenu } from './NodeContextMenu';

interface MindMapCanvasProps {
  nodes: MindMapNode[];
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  editingNodeId?: string | null;
  onClearEditingNodeId?: () => void;
  onSelectNode: (id: string | null) => void;
  onSelectMultipleNodes?: (ids: string[]) => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddChildNode: (parentId: string) => void;
  onAddSiblingNode: (nodeId: string) => void;
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
  onClearEditingNodeId,
  onSelectNode,
  onSelectMultipleNodes,
  onUpdateNodeText,
  onToggleCollapse,
  onAddChildNode,
  onAddSiblingNode,
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

  const nodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Layout base da árvore - 100% Responsivo e sem sobreposição
  const layoutMap = useMemo(() => {
    const root = nodes.find(n => n.side === 'root') || nodes[0];
    if (!root) return new Map();
    return calculateMindMapLayout(nodes, root.id, {
      horizontalGap: 100,
      verticalGap: 18,
      rootX: 0,
      rootY: 0
    });
  }, [nodes]);

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
      onUpdateNodeText(editingId, editingText);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, node: MindMapNode) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit();
      onAddSiblingNode(node.id);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCommitEdit();
      onAddChildNode(node.id);
    } else if (e.key === 'Escape') {
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

      // Hit-test: detecta o nó sob o cursor (ignora o próprio nó arrastado e o ghost)
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const targetCard = elements.find(el =>
        el.classList.contains('mindmap-node-card') &&
        el.id !== `node-${draggingIdRef.current}` &&
        !el.classList.contains('drag-ghost-card')
      );

      if (targetCard) {
        const targetId = targetCard.id.replace('node-', '');
        const targetNode = nodeMap.get(targetId);

        if (targetNode) {
          const rect = targetCard.getBoundingClientRect();
          const relY = (e.clientY - rect.top) / rect.height;

          let pos: 'before' | 'after' | 'inside';
          if (targetNode.side === 'root') {
            pos = 'inside';
          } else if (relY < 0.30) {
            pos = 'before';
          } else if (relY > 0.70) {
            pos = 'after';
          } else {
            pos = 'inside';
          }

          dropTargetRef.current = { id: targetId, pos };
          setDropTargetNodeId(targetId);
          setDropPosition(pos);
        }
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
    nodes.forEach(child => {
      if (!child.parentId || !isNodeVisible(child)) return;
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
        const isSelected = selectedNodeId === child.id || selectedNodeId === parent.id;
        const lineStyle = child.lineStyle || 'bezier';

        // Nó arrastado: linha fica mais transparente (indica que está "em voo")
        const isDraggingThis = draggingNodeId === child.id;

        let pathData = '';
        if (lineStyle === 'straight') {
          pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
        } else {
          pathData = getBezierPath(startX, startY, endX, endY);
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

  // ─── GHOST CARD + CONNECTOR LINE (Whimsical-style) ───────────────────────────
  const renderDragGhost = () => {
    if (!draggingNodeId || !dragCursorPos) return null;

    const dragNode = nodeMap.get(draggingNodeId);
    if (!dragNode) return null;

    const nodeColor = dragNode.color || '#6366f1';
    const borderStyle = dragNode.borderStyle || 'accent';

    // Estilo igual ao card real
    let ghostBg = 'var(--bg-surface)';
    let ghostBorder = `1.5px solid var(--border-subtle)`;
    let ghostBorderLeft: string | undefined = undefined;

    if (borderStyle === 'fill') {
      ghostBg = nodeColor;
      ghostBorder = `2px solid ${nodeColor}`;
    } else if (borderStyle === 'border') {
      ghostBg = 'var(--bg-surface)';
      ghostBorder = `2px solid ${nodeColor}`;
    } else {
      // accent
      ghostBg = 'var(--bg-surface)';
      ghostBorder = `1.5px solid var(--border-subtle)`;
      ghostBorderLeft = `4px solid ${nodeColor}`;
    }

    const src = dragSourceScreenPosRef.current;
    const cx = dragCursorPos.x;
    const cy = dragCursorPos.y;

    // Bézier: da posição original até o cursor (igual ao Whimsical — curva horizontal)
    let bezierD = '';
    if (src) {
      const cp1x = src.x + (cx - src.x) * 0.5;
      const cp2x = src.x + (cx - src.x) * 0.5;
      bezierD = `M ${src.x} ${src.y} C ${cp1x} ${src.y}, ${cp2x} ${cy}, ${cx} ${cy}`;
    }

    return (
      <>
        {/* SVG de tela cheia para a linha conectora "elástica" */}
        {src && (
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
            {/* Glow suave por baixo */}
            <path
              d={bezierD}
              fill="none"
              stroke={nodeColor}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.15}
            />
            {/* Linha tracejada principal — animada via CSS */}
            <path
              className="drag-connector-line"
              d={bezierD}
              fill="none"
              stroke={nodeColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="8 5"
              opacity={0.9}
            />
            {/* Ponto de ancora no nó-fonte */}
            <circle cx={src.x} cy={src.y} r={4} fill={nodeColor} opacity={0.55} />
            <circle cx={src.x} cy={src.y} r={7} fill="none" stroke={nodeColor} strokeWidth={1} opacity={0.25} />
            {/* Ponto no cursor */}
            <circle cx={cx} cy={cy} r={3.5} fill={nodeColor} opacity={0.95} />
            <circle cx={cx} cy={cy} r={7} fill="none" stroke={nodeColor} strokeWidth={1.5} opacity={0.5} />
          </svg>
        )}

        {/* Card fantasma real — cópia visual exata do nó, flutuando no cursor */}
        <div
          className="mindmap-node-card drag-ghost-card"
          style={{
            position: 'fixed',
            left: `${cx}px`,
            top: `${cy}px`,
            // offset de -50% para centrar, leve rotação e lift de escala (Trello feel)
            transform: 'translate(-50%, -50%) rotate(-2deg) scale(1.07)',
            pointerEvents: 'none',
            zIndex: 10000,
            backgroundColor: ghostBg,
            border: ghostBorder,
            borderLeft: ghostBorderLeft,
            borderRadius: '6px',
            padding: '8px 14px',
            fontWeight: 500,
            fontSize: '13.5px',
            color: borderStyle === 'fill' ? '#ffffff' : 'var(--text-primary)',
            boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${nodeColor}44`,
            opacity: 0.95,
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
            userSelect: 'none',
            willChange: 'transform'
          }}
        >
          <span style={{
            color: borderStyle === 'fill' ? '#ffffff' : 'var(--text-primary)',
            fontSize: '13.5px',
            fontWeight: 500
          }}>
            {dragNode.text}
          </span>
          {/* Overlay de brilho sutil no topo */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '6px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, transparent 55%)',
            pointerEvents: 'none'
          }} />
        </div>
      </>
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

      {/* Menu Contextual Flutuante Superior */}
      {selectedNode && selectedPos && (
        <NodeContextMenu
          node={selectedNode}
          position={selectedPos}
          onUpdateColor={(color) => onUpdateNodeStyle(selectedNode.id, { color })}
          onUpdateBorderStyle={(borderStyle) => onUpdateNodeStyle(selectedNode.id, { borderStyle })}
          onUpdateLineStyle={(lineStyle) => onUpdateNodeStyle(selectedNode.id, { lineStyle })}
          onMoveUp={() => onReorderNode(selectedNode.id, 'up')}
          onMoveDown={() => onReorderNode(selectedNode.id, 'down')}
          onDuplicate={() => onDuplicateNode(selectedNode.id)}
          onDelete={() => onDeleteNode(selectedNode.id)}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}

      {/* Renderização dos Nós */}
      {nodes.map(node => {
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
          border = `2px solid ${nodeColor}`;
        } else if (borderStyle === 'border') {
          bg = 'var(--bg-surface)';
          border = `2px solid ${nodeColor}`;
        } else {
          bg = 'var(--bg-surface)';
          borderLeft = `4px solid ${nodeColor}`;
        }

        return (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''} ${isDropTarget && dropPosition === 'inside' ? 'drop-inside-active' : ''}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${pos.width}px`,
              minWidth: `${pos.width}px`,
              minHeight: `${pos.height}px`,
              backgroundColor: isDropTarget && dropPosition === 'inside' ? 'rgba(13, 148, 136, 0.15)' : bg,
              border: isMultiSelected ? '1.5px solid var(--accent-purple, #6366f1)' : border,
              borderLeft: isMultiSelected ? undefined : borderLeft,
              outline: isDropTarget && dropPosition === 'inside'
                ? '2px solid var(--accent-teal, #0d9488)'
                : isMultiSelected
                ? '2px solid var(--accent-purple, #6366f1)'
                : (isSelected ? `2px solid ${nodeColor}` : undefined),
              outlineOffset: '2px',
              boxShadow: isSelected ? `0 0 12px ${nodeColor}55` : '0 2px 8px rgba(0, 0, 0, 0.2)',
              zIndex: isDropTarget ? 45 : (isSelected ? 35 : 20),
              padding: isRoot ? '12px 24px' : '8px 14px',
              whiteSpace: 'nowrap',
              // Nó-fonte durante drag: semi-transparente + desfocado (como o Whimsical)
              opacity: isDraggingThis ? 0.4 : 1,
              filter: isDraggingThis ? 'grayscale(0.4) blur(0.5px)' : undefined,
              transition: isDraggingThis ? 'none' : 'opacity 0.15s ease, filter 0.15s ease',
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
            {/* Indicadores de Drop Reordenação — linha estilo Notion */}
            {isDropTarget && dropPosition === 'before' && (
              <div style={{
                position: 'absolute',
                top: '-7px',
                left: '-8px',
                right: '-8px',
                height: '3px',
                backgroundColor: 'var(--accent-teal, #0d9488)',
                borderRadius: '2px',
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '-3px',
                  top: '-2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-teal, #0d9488)'
                }} />
              </div>
            )}

            {isDropTarget && dropPosition === 'after' && (
              <div style={{
                position: 'absolute',
                bottom: '-7px',
                left: '-8px',
                right: '-8px',
                height: '3px',
                backgroundColor: 'var(--accent-teal, #0d9488)',
                borderRadius: '2px',
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '-3px',
                  top: '-2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-teal, #0d9488)'
                }} />
              </div>
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
                  color: borderStyle === 'fill' ? '#ffffff' : 'var(--text-primary)',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: isRoot ? '16px' : '13.5px',
                  fontWeight: isRoot ? 700 : 500,
                  outline: 'none',
                  minWidth: '80px'
                }}
              />
            ) : (
              <span style={{
                userSelect: 'none',
                color: borderStyle === 'fill' ? '#ffffff' : 'var(--text-primary)',
                fontSize: isRoot ? '16px' : '13.5px',
                fontWeight: isRoot ? 700 : 500,
                letterSpacing: '-0.01em',
                minWidth: node.text ? undefined : '50px',
                display: 'inline-block'
              }}>
                {node.text}
              </span>
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

            {/* Botões Externos de Adicionar */}
            {(isSelected || isHovered) && !isEditing && !draggingNodeId && (
              <>
                {/* Adicionar Filho à Direita */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-42px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '42px',
                    height: '42px',
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
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: nodeColor,
                      color: '#ffffff',
                      border: '2px solid var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Adicionar Irmão Abaixo */}
                {!isRoot && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-34px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '42px',
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
                      onAddSiblingNode(node.id);
                    }}
                    title="Criar Quadrado Irmão (Atalho: Enter)"
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface)',
                        color: nodeColor,
                        border: `2px solid ${nodeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        transition: 'transform 0.15s ease, background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.15)';
                        e.currentTarget.style.backgroundColor = nodeColor;
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        e.currentTarget.style.color = nodeColor;
                      }}
                    >
                      <Plus size={14} strokeWidth={2.5} />
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
