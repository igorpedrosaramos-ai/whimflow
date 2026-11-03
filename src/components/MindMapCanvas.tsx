import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { MindMapNode } from '../types';

interface MindMapCanvasProps {
  nodes: MindMapNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddChildNode: (parentId: string) => void;
  onAddSiblingNode: (nodeId: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (id: string, dx: number, dy: number) => void;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNodeText,
  onToggleCollapse,
  onAddChildNode,
  onAddSiblingNode,
  onDeleteNode,
  onMoveNode
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Determina se um nó está visível (se nenhum de seus ancestrais está colapsado)
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

  // Conta total de descendentes para exibir no badge
  const countDescendants = (nodeId: string): number => {
    const node = nodeMap.get(nodeId);
    if (!node || node.childrenIds.length === 0) return 0;
    let count = node.childrenIds.length;
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
      if (node.parentId) {
        onAddSiblingNode(node.id);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCommitEdit();
      onAddChildNode(node.id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  // Iniciar arraste do nó
  const handleMouseDown = (node: MindMapNode, e: React.MouseEvent) => {
    if (editingId === node.id) return;
    if (e.button !== 0) return; // Apenas botão esquerdo
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeId || !dragStartPos.current) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      onMoveNode(draggingNodeId, dx, dy);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
      dragStartPos.current = null;
    };

    if (draggingNodeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, onMoveNode]);

  // Gerar linhas Bézier de conexão
  const renderConnectors = () => {
    const paths: React.ReactElement[] = [];

    nodes.forEach(child => {
      if (!child.parentId || !isNodeVisible(child)) return;
      const parent = nodeMap.get(child.parentId);
      if (!parent || parent.collapsed) return;

      const pWidth = parent.width || (parent.side === 'root' ? 240 : 160);
      const pHeight = parent.height || (parent.side === 'root' ? 56 : 38);
      const cWidth = child.width || 150;
      const cHeight = child.height || 36;

      const isRight = child.x >= parent.x;

      const startX = isRight ? parent.x + pWidth : parent.x;
      const startY = parent.y + pHeight / 2;
      const endX = isRight ? child.x : child.x + cWidth;
      const endY = child.y + cHeight / 2;

      const deltaX = Math.abs(endX - startX);
      const curvature = Math.max(deltaX * 0.45, 40);

      const cp1X = isRight ? startX + curvature : startX - curvature;
      const cp1Y = startY;
      const cp2X = isRight ? endX - curvature : endX + curvature;
      const cp2Y = endY;

      const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
      const strokeColor = child.color || parent.color || 'var(--accent-purple)';

      paths.push(
        <path
          key={`conn-${child.id}`}
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ opacity: 0.85, transition: 'all 0.15s ease' }}
        />
      );
    });

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        {paths}
      </svg>
    );
  };

  return (
    <>
      {renderConnectors()}

      {nodes.map(node => {
        if (!isNodeVisible(node)) return null;

        const isRoot = node.side === 'root';
        const isSelected = selectedNodeId === node.id;
        const isEditing = editingId === node.id;
        const childCount = countDescendants(node.id);
        const hasChildren = node.childrenIds.length > 0;

        return (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              backgroundColor: isRoot ? '#1e293b' : (node.color || '#6366f1'),
              borderLeft: !isRoot ? `4px solid ${node.color || '#818cf8'}` : undefined,
              zIndex: isSelected ? 30 : 20
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node.id);
            }}
            onDoubleClick={(e) => handleStartEdit(node, e)}
            onMouseDown={(e) => handleMouseDown(node, e)}
          >
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleCommitEdit}
                onKeyDown={(e) => handleKeyDown(e, node)}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #ffffff',
                  color: '#ffffff',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: isRoot ? '16px' : '13.5px',
                  fontWeight: isRoot ? 700 : 500,
                  outline: 'none',
                  minWidth: '140px'
                }}
              />
            ) : (
              <span style={{ whiteSpace: 'nowrap', userSelect: 'none' }}>
                {node.text}
              </span>
            )}

            {/* Contador numérico de ramos ocultos (Badge circular idêntico ao Whimsical) */}
            {hasChildren && node.collapsed && (
              <div
                className="branch-counter-badge"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node.id);
                }}
                title={`Expandir ${childCount} ramos`}
              >
                {childCount}
              </div>
            )}

            {/* Botão de recolher quando expandido */}
            {hasChildren && !node.collapsed && !isRoot && (
              <div
                className="branch-counter-badge"
                style={{ width: '18px', height: '18px', fontSize: '11px', opacity: 0.6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node.id);
                }}
                title="Recolher ramos"
              >
                -
              </div>
            )}

            {/* Botão rápido de adicionar ramo filho ao passar o mouse */}
            {isSelected && !isEditing && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChildNode(node.id);
                }}
                style={{
                  position: 'absolute',
                  right: '-14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-purple-light)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  zIndex: 35
                }}
                title="Adicionar ramo filho (Atalho: Tab)"
              >
                <Plus size={15} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
