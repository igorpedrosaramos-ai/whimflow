import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, X, ChevronRight, CornerDownRight } from 'lucide-react';
import { MindMapNode } from '../types';
import { calculateMindMapLayout, getBezierPath, estimateNodeDimensions } from '../utils/treeLayout';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const nodeMap = useMemo(() => {
    const map = new Map<string, MindMapNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Calcula layout tidy da árvore (sem sobreposição, linhas perfeitas)
  const layoutMap = useMemo(() => {
    const root = nodes.find(n => n.side === 'root') || nodes[0];
    if (!root) return new Map();
    return calculateMindMapLayout(nodes, root.id, {
      horizontalGap: 72,
      verticalGap: 16,
      rootX: root.x || 0,
      rootY: root.y || 0
    });
  }, [nodes]);

  // Determina se o nó está visível (nenhum ancestral colapsado)
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

  // Conta total de descendentes recursivamente para o badge
  const countDescendants = (nodeId: string): number => {
    const node = nodeMap.get(nodeId);
    if (!node || node.childrenIds.length === 0) return 0;
    let count = 0;
    const stack = [...node.childrenIds];
    while (stack.length > 0) {
      const cid = stack.pop()!;
      count++;
      const child = nodeMap.get(cid);
      if (child && child.childrenIds.length > 0) {
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

  // Arraste manual de nós
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

  // RENDERIZAÇÃO DAS LINHAS EMBUTIDAS (SPLINES / BÉZIER)
  const renderConnectors = () => {
    const paths: React.ReactElement[] = [];

    nodes.forEach(child => {
      if (!child.parentId || !isNodeVisible(child)) return;
      const parent = nodeMap.get(child.parentId);
      if (!parent || parent.collapsed) return;

      const pLayout = layoutMap.get(parent.id);
      const cLayout = layoutMap.get(child.id);

      // Coordenadas calculadas pelo motor Tidy Tree
      const startX = pLayout ? pLayout.x + pLayout.width : parent.x + (parent.width || 180);
      const startY = pLayout ? pLayout.y + pLayout.height / 2 : parent.y + 20;
      const endX = cLayout ? cLayout.x : child.x;
      const endY = cLayout ? cLayout.y + cLayout.height / 2 : child.y + 20;

      const pathData = getBezierPath(startX, startY, endX, endY);
      const strokeColor = child.color || parent.color || 'var(--accent-purple)';

      paths.push(
        <g key={`conn-group-${child.id}`}>
          {/* Sombra de destaque no hover do nó conectado */}
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth={selectedNodeId === child.id ? "3.5" : "2.2"}
            strokeLinecap="round"
            style={{
              opacity: selectedNodeId === child.id ? 1 : 0.85,
              transition: 'stroke-width 0.15s ease, opacity 0.15s ease'
            }}
          />
          {/* Ponto de ancoragem na junção do nó filho */}
          <circle
            cx={endX}
            cy={endY}
            r={selectedNodeId === child.id ? 3.5 : 2.5}
            fill={strokeColor}
          />
        </g>
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
          overflow: 'visible',
          zIndex: 10
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

        // Posição calculada com precisão pelo Tidy Tree
        const computed = layoutMap.get(node.id);
        const posX = computed ? computed.x : node.x;
        const posY = computed ? computed.y : node.y;
        const width = computed ? computed.width : (node.width || 160);
        const height = computed ? computed.height : (node.height || 38);

        const nodeColor = node.color || '#6366f1';

        return (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${posX}px`,
              top: `${posY}px`,
              minWidth: `${width}px`,
              minHeight: `${height}px`,
              backgroundColor: isRoot ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: isRoot 
                ? '2px solid var(--border-strong)' 
                : `1.5px solid ${isSelected ? nodeColor : 'var(--border-subtle)'}`,
              borderLeft: !isRoot ? `5px solid ${nodeColor}` : '2px solid var(--border-strong)',
              zIndex: isSelected ? 35 : 20,
              padding: isRoot ? '12px 22px' : '8px 14px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node.id);
            }}
            onDoubleClick={(e) => handleStartEdit(node, e)}
            onMouseDown={(e) => handleMouseDown(node, e)}
          >
            {/* Texto do Nó ou Campo de Edição */}
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
                  width: '100%'
                }}
              />
            ) : (
              <span style={{ 
                whiteSpace: 'normal', 
                wordBreak: 'break-word',
                userSelect: 'none',
                color: 'var(--text-primary)',
                fontSize: isRoot ? '16px' : '13.5px',
                fontWeight: isRoot ? 700 : 500,
                lineHeight: 1.35
              }}>
                {node.text}
              </span>
            )}

            {/* Badge Contador de Ramos Recolhidos (exatamente como Whimsical) */}
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

            {/* Indicador de Recolhimento quando expandido */}
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

            {/* BOTÕES DE CRIAÇÃO RÁPIDA EMBUTIDOS NO NÓ (Aparecem quando selecionado) */}
            {isSelected && !isEditing && (
              <>
                {/* Botão + Filho: Cria um quadrado com linha embutida na hora! */}
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
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: nodeColor,
                    color: '#ffffff',
                    border: '2px solid var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    zIndex: 40
                  }}
                  title="Criar Quadrado Filho com Linha Embutida (Atalho: Tab)"
                >
                  <Plus size={15} />
                </button>

                {/* Botão + Irmão: Cria um quadrado irmão no mesmo nível com linha embutida */}
                {!isRoot && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSiblingNode(node.id);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '-24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-elevated)',
                      color: nodeColor,
                      border: `1.5px solid ${nodeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                      zIndex: 40
                    }}
                    title="Criar Quadrado Irmão no Mesmo Nível (Atalho: Enter)"
                  >
                    <CornerDownRight size={12} />
                  </button>
                )}

                {/* Botão Excluir */}
                {!isRoot && (
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
                    title="Excluir Nó e Sub-ramos (Delete)"
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
