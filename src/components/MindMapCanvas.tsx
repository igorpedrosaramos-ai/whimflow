import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, Copy, ChevronRight } from 'lucide-react';
import { MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath } from '../utils/treeLayout';
import { NodeContextMenu } from './NodeContextMenu';

interface MindMapCanvasProps {
  nodes: MindMapNode[];
  selectedNodeId: string | null;
  editingNodeId?: string | null;
  onClearEditingNodeId?: () => void;
  onSelectNode: (id: string | null) => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddChildNode: (parentId: string) => void;
  onAddSiblingNode: (nodeId: string) => void;
  onDeleteNode: (id: string) => void;
  onDeleteMultipleNodes?: (ids: string[]) => void;
  onMoveNodeOffset?: (id: string, dx: number, dy: number) => void;
  onMoveMultipleNodesOffset?: (ids: string[], dx: number, dy: number) => void;
  onDuplicateMultipleNodes?: (ids: string[]) => void;
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
  editingNodeId,
  onClearEditingNodeId,
  onSelectNode,
  onUpdateNodeText,
  onToggleCollapse,
  onAddChildNode,
  onAddSiblingNode,
  onDeleteNode,
  onDeleteMultipleNodes,
  onMoveMultipleNodesOffset,
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
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dropTargetNodeId, setDropTargetNodeId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside'>('inside');
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Multi-seleção por arraste (lasso) ─────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionRect, setSelectionRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const isLassoActiveRef = useRef(false);
  // Arraste em grupo
  const groupDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);

  // Limpa multi-seleção quando seleção única muda
  useEffect(() => {
    if (selectedNodeId === null) return;
    setSelectedIds(new Set());
  }, [selectedNodeId]);

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
      horizontalGap: 90,
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
    setEditingText(node.text);
    onSelectNode(node.id);
  };

  const handleCommitEdit = () => {
    if (editingId && editingText.trim()) {
      onUpdateNodeText(editingId, editingText.trim());
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

  // ARRASTE EXCLUSIVO PARA MUDAR DE SETOR / REPARENTALIZAR
  const handleMouseDown = (node: MindMapNode, e: React.MouseEvent) => {
    if (editingId === node.id) return;
    if (e.button !== 0) return;
    if (node.side === 'root') return; // Nó raiz é fixo como âncora do mapa
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    const canvasX = (e.clientX - (pan?.x || 0)) / (zoom || 1);
    const canvasY = (e.clientY - (pan?.y || 0)) / (zoom || 1);
    setDragCursorPos({ x: canvasX, y: canvasY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeId) return;
      const canvasX = (e.clientX - (pan?.x || 0)) / (zoom || 1);
      const canvasY = (e.clientY - (pan?.y || 0)) / (zoom || 1);
      setDragCursorPos({ x: canvasX, y: canvasY });

      // Detecta sobre qual nó o cursor está passando para mudar de setor ou reordenar
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const targetCard = elements.find(el => 
        el.classList.contains('mindmap-node-card') && el.id !== `node-${draggingNodeId}`
      );
      if (targetCard) {
        const targetId = targetCard.id.replace('node-', '');
        const targetNode = nodeMap.get(targetId);
        const draggedNode = nodeMap.get(draggingNodeId);

        if (targetNode && draggedNode) {
          const rect = targetCard.getBoundingClientRect();
          const relY = (e.clientY - rect.top) / rect.height;

          if (targetNode.side === 'root') {
            setDropTargetNodeId(targetId);
            setDropPosition('inside');
          } else if (relY < 0.32) {
            // Parte superior do card: Reordenar para ANTES deste irmão
            setDropTargetNodeId(targetId);
            setDropPosition('before');
          } else if (relY > 0.68) {
            // Parte inferior do card: Reordenar para DEPOIS deste irmão
            setDropTargetNodeId(targetId);
            setDropPosition('after');
          } else {
            // Centro do card: Anexar como filho deste setor
            setDropTargetNodeId(targetId);
            setDropPosition('inside');
          }
        }
      } else {
        setDropTargetNodeId(null);
        setDropPosition('inside');
      }
    };

    const handleMouseUp = () => {
      if (draggingNodeId && dropTargetNodeId && draggingNodeId !== dropTargetNodeId) {
        if (onReorderInsertNode) {
          onReorderInsertNode(draggingNodeId, dropTargetNodeId, dropPosition);
        } else {
          onReparentNode(draggingNodeId, dropTargetNodeId);
        }
      }
      setDraggingNodeId(null);
      setDropTargetNodeId(null);
      setDropPosition('inside');
      setDragCursorPos(null);
    };

    if (draggingNodeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, dropTargetNodeId, dropPosition, onReparentNode, onReorderInsertNode, pan, zoom, nodeMap]);

  // ARRASTE EM GRUPO quando há multi-seleção
  useEffect(() => {
    const handleGroupMouseMove = (e: MouseEvent) => {
      if (!groupDragStartRef.current || !isDraggingGroup) return;
      const dx = e.clientX - groupDragStartRef.current.x;
      const dy = e.clientY - groupDragStartRef.current.y;
      groupDragStartRef.current = { x: e.clientX, y: e.clientY };
      if (onMoveMultipleNodesOffset && selectedIds.size > 0) {
        onMoveMultipleNodesOffset([...selectedIds], dx, dy);
      }
    };
    const handleGroupMouseUp = () => {
      setIsDraggingGroup(false);
      groupDragStartRef.current = null;
    };
    if (isDraggingGroup) {
      window.addEventListener('mousemove', handleGroupMouseMove);
      window.addEventListener('mouseup', handleGroupMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGroupMouseMove);
      window.removeEventListener('mouseup', handleGroupMouseUp);
    };
  }, [isDraggingGroup, selectedIds, onMoveMultipleNodesOffset]);

  // LASSO: detecta início no canvas (chamado de fora via props expostas no return)
  const handleCanvasMouseDownLasso = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isLassoActiveRef.current = true;
    selectionStartRef.current = { x: e.clientX, y: e.clientY };
    setSelectionRect({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY });
    setSelectedIds(new Set());
    onSelectNode(null);
  }, [onSelectNode]);

  const handleCanvasMouseMoveLasso = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLassoActiveRef.current || !selectionStartRef.current) return;
    setSelectionRect({
      x1: selectionStartRef.current.x,
      y1: selectionStartRef.current.y,
      x2: e.clientX,
      y2: e.clientY
    });
  }, []);

  const handleCanvasMouseUpLasso = useCallback(() => {
    if (!isLassoActiveRef.current) return;
    isLassoActiveRef.current = false;
    if (!selectionRect) { setSelectionRect(null); return; }

    const minX = Math.min(selectionRect.x1, selectionRect.x2);
    const maxX = Math.max(selectionRect.x1, selectionRect.x2);
    const minY = Math.min(selectionRect.y1, selectionRect.y2);
    const maxY = Math.max(selectionRect.y1, selectionRect.y2);

    const hit = new Set<string>();
    nodes.forEach(node => {
      if (!isNodeVisible(node)) return;
      const el = document.getElementById(`node-${node.id}`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.right >= minX && r.left <= maxX && r.bottom >= minY && r.top <= maxY) {
        hit.add(node.id);
      }
    });

    if (hit.size > 0) {
      setSelectedIds(hit);
      onSelectNode(null);
    }
    setSelectionRect(null);
  }, [selectionRect, nodes, onSelectNode]);

  // RENDERIZAÇÃO DAS LINHAS CONECTORAS (Bézier ou Retas, com portas distribuídas e cores do ramo)
  const renderConnectors = () => {
    const paths: React.ReactElement[] = [];

    // Agrupa filhos visíveis por nó-pai para distribuir portas de conexão na borda
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

      // Ordena os filhos por sua coordenada Y calculada
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

        // Distribuição uniforme elegante das portas ao longo da borda vertical
        const startY = numChildren <= 1 
          ? pPos.y + pPos.height / 2 
          : pPos.y + pad + (usableHeight * index) / (numChildren - 1);

        const endX = isChildOnLeft ? cPos.x + cPos.width : cPos.x;
        const endY = cPos.y + cPos.height / 2;

        const strokeColor = child.color || parent.color || '#6366f1';
        const isSelected = selectedNodeId === child.id || selectedNodeId === parent.id;
        const lineStyle = child.lineStyle || 'bezier';

        let pathData = '';
        if (lineStyle === 'straight') {
          pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
        } else {
          pathData = getBezierPath(startX, startY, endX, endY);
        }

        paths.push(
          <g key={`conn-${child.id}`}>
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

      {/* Menu Contextual Flutuante Superior — só quando NÃO há multi-seleção */}
      {selectedNode && selectedPos && selectedIds.size === 0 && (
        <NodeContextMenu
          node={selectedNode}
          position={selectedPos}
          onUpdateColor={(color) => onUpdateNodeStyle(selectedNode.id, { color })}
          onUpdateBorderStyle={(borderStyle) => onUpdateNodeStyle(selectedNode.id, { borderStyle })}
          onUpdateLineStyle={(lineStyle) => onUpdateNodeStyle(selectedNode.id, { lineStyle })}
          onMoveUp={() => onReorderNode(selectedNode.id, 'up')}
          onMoveDown={() => onReorderNode(selectedNode.id, 'down')}
          onAddChild={() => onAddChildNode(selectedNode.id)}
          onAddSibling={() => onAddSiblingNode(selectedNode.id)}
          onDuplicate={() => onDuplicateNode(selectedNode.id)}
          onDelete={() => onDeleteNode(selectedNode.id)}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}

      {/* Barra de Ações para Multi-Seleção */}
      {selectedIds.size > 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1.5px solid var(--border-strong)',
            borderRadius: '12px',
            padding: '10px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginRight: '8px',
            letterSpacing: '-0.01em'
          }}>
            {selectedIds.size} quadrados selecionados
          </span>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Arrastar grupo — instrução */}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', userSelect: 'none' }}>
            Arraste qualquer quadrado selecionado para mover o grupo
          </span>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Duplicar */}
          <button
            onClick={() => {
              if (onDuplicateMultipleNodes) onDuplicateMultipleNodes([...selectedIds]);
              setSelectedIds(new Set());
            }}
            title="Duplicar selecionados"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Copy size={14} /> Copiar
          </button>

          {/* Excluir */}
          <button
            onClick={() => {
              if (onDeleteMultipleNodes) onDeleteMultipleNodes([...selectedIds]);
              setSelectedIds(new Set());
              onSelectNode(null);
            }}
            title="Apagar selecionados"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #ef4444',
              backgroundColor: 'transparent', color: '#ef4444',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Trash2 size={14} /> Apagar
          </button>

          {/* Desmarcar */}
          <button
            onClick={() => setSelectedIds(new Set())}
            title="Desmarcar seleção"
            style={{
              padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
              backgroundColor: 'transparent', color: 'var(--text-muted)',
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Overlay de Lasso (retângulo de seleção) — fixo em coords de tela */}
      {selectionRect && (() => {
        const minX = Math.min(selectionRect.x1, selectionRect.x2);
        const minY = Math.min(selectionRect.y1, selectionRect.y2);
        const w = Math.abs(selectionRect.x2 - selectionRect.x1);
        const h = Math.abs(selectionRect.y2 - selectionRect.y1);
        return (
          <div
            style={{
              position: 'fixed',
              left: minX,
              top: minY,
              width: w,
              height: h,
              border: '2px dashed var(--accent-purple, #6366f1)',
              backgroundColor: 'rgba(99,102,241,0.08)',
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 1500,
            }}
          />
        );
      })()}

      {/* Elemento transparente captura eventos de lasso no fundo do canvas */}
      <div
        style={{
          position: 'absolute',
          inset: '-5000px',
          zIndex: 1,
          cursor: selectionRect ? 'crosshair' : 'default',
        }}
        onMouseDown={handleCanvasMouseDownLasso}
        onMouseMove={handleCanvasMouseMoveLasso}
        onMouseUp={handleCanvasMouseUpLasso}
      />

      {/* Renderização dos Nós */}
      {nodes.map(node => {
        if (!isNodeVisible(node)) return null;

        const isRoot = node.side === 'root';
        const isSelected = selectedNodeId === node.id;
        const isMultiSelected = selectedIds.has(node.id);
        const isHovered = hoveredNodeId === node.id;
        const isEditing = editingId === node.id;
        const isDropTarget = dropTargetNodeId === node.id;
        const childCount = countDescendants(node.id);
        const hasChildren = node.childrenIds && node.childrenIds.length > 0;

        const pos = getNodePos(node);
        const nodeColor = node.color || '#6366f1';
        const borderStyle = node.borderStyle || 'accent';

        // Estilização com base na preferência do usuário
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
          // accent (estilo clássico com borda esquerda viva)
          bg = 'var(--bg-surface)';
          borderLeft = `5px solid ${nodeColor}`;
        }

        return (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              minWidth: `${pos.width}px`,
              minHeight: `${pos.height}px`,
              backgroundColor: isDropTarget ? 'rgba(13, 148, 136, 0.25)' : bg,
              border: isMultiSelected ? `2px solid #6366f1` : border,
              borderLeft: isMultiSelected ? undefined : borderLeft,
              outline: isDropTarget
                ? '3px dashed var(--accent-teal)'
                : isMultiSelected
                ? '2.5px solid rgba(99,102,241,0.7)'
                : (isSelected ? `2.5px solid ${nodeColor}` : undefined),
              outlineOffset: isDropTarget ? '4px' : '2px',
              boxShadow: isMultiSelected
                ? '0 0 0 3px rgba(99,102,241,0.25), 0 4px 12px rgba(0,0,0,0.25)'
                : isSelected ? `0 0 16px ${nodeColor}66` : '0 4px 12px rgba(0, 0, 0, 0.25)',
              zIndex: isDropTarget ? 45 : (isSelected || isMultiSelected ? 35 : 20),
              padding: isRoot ? '12px 24px' : '8px 16px',
              whiteSpace: 'nowrap',
              opacity: draggingNodeId === node.id ? 0.35 : 1,
              cursor: isRoot ? 'default' : isDraggingGroup ? 'grabbing' : (draggingNodeId === node.id ? 'grabbing' : 'grab')
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Ctrl/Cmd + clique: adiciona/remove da seleção múltipla
              if (e.ctrlKey || e.metaKey) {
                setSelectedIds(prev => {
                  const next = new Set(prev);
                  if (next.has(node.id)) next.delete(node.id);
                  else next.add(node.id);
                  return next;
                });
                onSelectNode(null);
              } else {
                setSelectedIds(new Set());
                onSelectNode(node.id);
              }
            }}
            onDoubleClick={(e) => handleStartEdit(node, e)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onMouseDown={(e) => {
              // Se o nó faz parte da multi-seleção, inicia arraste em grupo
              if (isMultiSelected && selectedIds.size > 1 && e.button === 0) {
                e.stopPropagation();
                groupDragStartRef.current = { x: e.clientX, y: e.clientY };
                setIsDraggingGroup(true);
                return;
              }
              handleMouseDown(node, e);
            }}
          >
            {/* Indicador Visual de Inserção / Reordenação ao Arrastar */}
            {isDropTarget && dropPosition === 'before' && (
              <div style={{
                position: 'absolute',
                top: '-7px',
                left: '-12px',
                right: '-12px',
                height: '4px',
                backgroundColor: 'var(--accent-teal-light)',
                borderRadius: '3px',
                boxShadow: '0 0 12px var(--accent-teal-light)',
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '7px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  ↑ Reordenar para antes deste
                </div>
              </div>
            )}

            {isDropTarget && dropPosition === 'after' && (
              <div style={{
                position: 'absolute',
                bottom: '-7px',
                left: '-12px',
                right: '-12px',
                height: '4px',
                backgroundColor: 'var(--accent-teal-light)',
                borderRadius: '3px',
                boxShadow: '0 0 12px var(--accent-teal-light)',
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '7px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  ↓ Reordenar para depois deste
                </div>
              </div>
            )}

            {isDropTarget && dropPosition === 'inside' && (
              <div style={{
                position: 'absolute',
                top: '-26px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--accent-teal)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                zIndex: 60
              }}>
                ↳ Mudar para este setor
              </div>
            )}

            {/* Texto ou Input de Edição */}
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleCommitEdit}
                onKeyDown={(e) => handleKeyDown(e, node)}
                style={{
                  background: 'var(--bg-canvas)',
                  border: `1.5px solid ${nodeColor}`,
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: isRoot ? '16px' : '13.5px',
                  fontWeight: isRoot ? 700 : 500,
                  outline: 'none',
                  minWidth: '160px'
                }}
              />
            ) : (
              <span style={{ 
                userSelect: 'none',
                color: borderStyle === 'fill' ? '#ffffff' : 'var(--text-primary)',
                fontSize: isRoot ? '16px' : '13.5px',
                fontWeight: isRoot ? 700 : 500,
                letterSpacing: '-0.01em'
              }}>
                {node.text}
              </span>
            )}

            {/* Badge de Ramos Recolhidos / Contador Whimsical com Cor do Ramo */}
            {hasChildren && node.collapsed && (
              <div
                className="branch-counter-badge"
                style={{ backgroundColor: nodeColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node.id);
                }}
                title={`Expandir ${childCount} ramos conectados`}
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

            {/* Botões Rápidos e Intuitivos de Adicionar Quadrados no Nó */}
            {(isSelected || isHovered) && !isEditing && !draggingNodeId && (
              <>
                {/* 1. Botão Adicionar Filho à Direita (+ com ponte de hover generosa) */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-46px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChildNode(node.id);
                  }}
                  title="Criar Quadrado Filho conectado por linha (Atalho: Tab)"
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: nodeColor,
                      color: '#ffffff',
                      border: '2px solid var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                </div>

                {/* 2. Botão Adicionar Irmão Abaixo (+ no mesmo nível) */}
                {!isRoot && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-36px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '46px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 50
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSiblingNode(node.id);
                    }}
                    title="Criar Quadrado Irmão no mesmo nível (Atalho: Enter)"
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface)',
                        color: nodeColor,
                        border: `2px solid ${nodeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
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
                      <Plus size={15} strokeWidth={2.5} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Cartão Fantasma Flutuante durante o Arraste para Mudar de Setor */}
      {draggingNodeId && dragCursorPos && nodeMap.get(draggingNodeId) && (
        <div
          style={{
            position: 'absolute',
            left: `${dragCursorPos.x}px`,
            top: `${dragCursorPos.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1000,
            backgroundColor: nodeMap.get(draggingNodeId)?.color || 'var(--accent-purple)',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13.5px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            border: '2px solid #ffffff',
            opacity: 0.95,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <span>{nodeMap.get(draggingNodeId)?.text}</span>
          <span style={{ fontSize: '11px', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.35)', padding: '2px 6px', borderRadius: '4px' }}>
            {dropTargetNodeId ? 'Soltar para mover para este setor' : 'Arraste sobre outro setor'}
          </span>
        </div>
      )}
    </>
  );
};
