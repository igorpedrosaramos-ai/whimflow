import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, X, CornerDownRight } from 'lucide-react';
import { MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath } from '../utils/treeLayout';

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
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const nodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Calcula layout tidy da árvore
  const layoutMap = useMemo(() => {
    const root = nodes.find(n => n.side === 'root') || nodes[0];
    if (!root) return new Map();
    return calculateMindMapLayout(nodes, root.id, {
      horizontalGap: 80,
      verticalGap: 18,
      rootX: root.x || 0,
      rootY: root.y || 0
    });
  }, [nodes]);

  // Verifica se o nó está visível (se nenhum pai está colapsado)
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

  // Contagem recursiva de filhos recolhidos
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

  // Arraste manual
  const handleMouseDown = (node: MindMapNode, e: React.MouseEvent) => {
    if (editingId === node.id) return;
    if (e.button !== 0) return;
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

  // RENDERIZAÇÃO DAS LINHAS (BÉZIER CÚBICA NO VIEWBOX GLOBAL)
  const renderConnectors = () => {
    const paths: React.ReactElement[] = [];

    nodes.forEach(child => {
      if (!child.parentId || !isNodeVisible(child)) return;
      const parent = nodeMap.get(child.parentId);
      if (!parent || parent.collapsed) return;

      const pLayout = layoutMap.get(parent.id);
      const cLayout = layoutMap.get(child.id);

      const startX = pLayout ? pLayout.x + pLayout.width : parent.x + 200;
      const startY = pLayout ? pLayout.y + pLayout.height / 2 : parent.y + 20;
      const endX = cLayout ? cLayout.x : child.x;
      const endY = cLayout ? cLayout.y + cLayout.height / 2 : child.y + 20;

      const pathData = getBezierPath(startX, startY, endX, endY);
      const strokeColor = child.color || parent.color || '#6366f1';
      const isSelected = selectedNodeId === child.id || selectedNodeId === parent.id;

      paths.push(
        <g key={`conn-${child.id}`}>
          {/* Linha principal com alta visibilidade e contraste */}
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth={isSelected ? "3.5" : "2.5"}
            strokeLinecap="round"
            style={{
              opacity: isSelected ? 1 : 0.88,
              transition: 'stroke-width 0.15s ease, opacity 0.15s ease'
            }}
          />
          {/* Ponto de junção elegante na entrada do filho */}
          <circle
            cx={endX}
            cy={endY}
            r={isSelected ? 4 : 3}
            fill={strokeColor}
          />
        </g>
      );
    });

    return (
      <svg
        width="60000"
        height="60000"
        viewBox="-30000 -30000 60000 60000"
        style={{
          position: 'absolute',
          top: -30000,
          left: -30000,
          width: 60000,
          height: 60000,
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
    <>
      {/* Camada Vetorial Global de Linhas */}
      {renderConnectors()}

      {/* Camada de Nós / Quadrados */}
      {nodes.map(node => {
        if (!isNodeVisible(node)) return null;

        const isRoot = node.side === 'root';
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isEditing = editingId === node.id;
        const childCount = countDescendants(node.id);
        const hasChildren = node.childrenIds && node.childrenIds.length > 0;

        const computed = layoutMap.get(node.id);
        const posX = computed ? computed.x : node.x;
        const posY = computed ? computed.y : node.y;
        const nodeWidth = computed ? computed.width : 160;
        const nodeHeight = computed ? computed.height : 40;

        const nodeColor = node.color || '#6366f1';

        return (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${posX}px`,
              top: `${posY}px`,
              minWidth: `${nodeWidth}px`,
              minHeight: `${nodeHeight}px`,
              backgroundColor: isRoot ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: isRoot 
                ? '2px solid var(--border-strong)' 
                : `1.5px solid ${isSelected ? nodeColor : 'var(--border-subtle)'}`,
              borderLeft: !isRoot ? `5px solid ${nodeColor}` : '2px solid var(--border-strong)',
              zIndex: isSelected ? 35 : 20,
              padding: isRoot ? '12px 24px' : '8px 16px',
              whiteSpace: 'nowrap'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node.id);
            }}
            onDoubleClick={(e) => handleStartEdit(node, e)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onMouseDown={(e) => handleMouseDown(node, e)}
          >
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
                color: 'var(--text-primary)',
                fontSize: isRoot ? '16px' : '13.5px',
                fontWeight: isRoot ? 700 : 500,
                letterSpacing: '-0.01em'
              }}>
                {node.text}
              </span>
            )}

            {/* Badge de Ramos Recolhidos (Idêntico ao Whimsical com número exato) */}
            {hasChildren && node.collapsed && (
              <div
                className="branch-counter-badge"
                style={{ backgroundColor: nodeColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node.id);
                }}
                title={`Expandir ${childCount} ramos conectados com linha`}
              >
                {childCount}
              </div>
            )}

            {/* Botão de Recolher quando expandido */}
            {hasChildren && !node.collapsed && !isRoot && (
              <div
                className="branch-counter-badge"
                style={{
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  backgroundColor: 'var(--border-strong)',
                  color: 'var(--text-secondary)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(node.id);
                }}
                title="Recolher ramos deste nó"
              >
                −
              </div>
            )}

            {/* BOTÃO + LATERAL VISÍVEL NO HOVER OU SELEÇÃO: CRIA QUADRADO COM LINHA INSTANTÂNEA */}
            {(isSelected || isHovered) && !isEditing && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChildNode(node.id);
                  }}
                  style={{
                    position: 'absolute',
                    right: '-28px',
                    top: '50%',
                    transform: 'translateY(-50%)',
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
                    boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
                    zIndex: 40,
                    transition: 'transform 0.15s ease'
                  }}
                  title="Criar Quadrado Filho com Linha Conectada (Tab)"
                >
                  <Plus size={16} />
                </button>

                {/* Botão + Irmão no mesmo nível */}
                {!isRoot && isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSiblingNode(node.id);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '-26px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-elevated)',
                      color: nodeColor,
                      border: `1.5px solid ${nodeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      zIndex: 40
                    }}
                    title="Criar Quadrado Irmão no Mesmo Nível (Enter)"
                  >
                    <CornerDownRight size={13} />
                  </button>
                )}

                {/* Botão Excluir */}
                {!isRoot && isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNode(node.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-danger)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      zIndex: 40
                    }}
                    title="Excluir Nó e Linha (Delete)"
                  >
                    <X size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </>
  );
};
