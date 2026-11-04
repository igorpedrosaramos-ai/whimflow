import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, X, CornerDownRight } from 'lucide-react';
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
  onMoveNodeOffset?: (id: string, dx: number, dy: number) => void;
  onReorderNode: (nodeId: string, direction: 'up' | 'down') => void;
  onReparentNode: (childId: string, newParentId: string) => void;
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
  onReorderNode,
  onReparentNode,
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
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

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

      // Detecta sobre qual nó o cursor está passando para mudar de setor
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const targetCard = elements.find(el => 
        el.classList.contains('mindmap-node-card') && el.id !== `node-${draggingNodeId}`
      );
      if (targetCard) {
        const targetId = targetCard.id.replace('node-', '');
        setDropTargetNodeId(targetId);
      } else {
        setDropTargetNodeId(null);
      }
    };

    const handleMouseUp = () => {
      if (draggingNodeId && dropTargetNodeId && draggingNodeId !== dropTargetNodeId) {
        // Soltou sobre outro nó -> Reparentaliza e formata a árvore responsivamente!
        onReparentNode(draggingNodeId, dropTargetNodeId);
      }
      setDraggingNodeId(null);
      setDropTargetNodeId(null);
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
  }, [draggingNodeId, dropTargetNodeId, onReparentNode, pan, zoom]);

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
          onAddChild={() => onAddChildNode(selectedNode.id)}
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
        const isSelected = selectedNodeId === node.id;
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
            className={`mindmap-node-card ${isRoot ? 'root' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              minWidth: `${pos.width}px`,
              minHeight: `${pos.height}px`,
              backgroundColor: isDropTarget ? 'rgba(13, 148, 136, 0.25)' : bg,
              border: border,
              borderLeft: borderLeft,
              outline: isDropTarget ? '3px dashed var(--accent-teal)' : (isSelected ? `2.5px solid ${nodeColor}` : undefined),
              outlineOffset: isDropTarget ? '4px' : '2px',
              boxShadow: isSelected ? `0 0 16px ${nodeColor}66` : '0 4px 12px rgba(0, 0, 0, 0.25)',
              zIndex: isDropTarget ? 45 : (isSelected ? 35 : 20),
              padding: isRoot ? '12px 24px' : '8px 16px',
              whiteSpace: 'nowrap',
              opacity: draggingNodeId === node.id ? 0.35 : 1,
              cursor: isRoot ? 'default' : (draggingNodeId === node.id ? 'grabbing' : 'grab')
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
            {/* Indicador de Setor de Destino */}
            {isDropTarget && (
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
                Mudar para este setor
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

            {/* Botão Lateral Rápido + para criar filho conectado com linha */}
            {(isSelected || isHovered) && !isEditing && (
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
                  zIndex: 40
                }}
                title="Criar Quadrado Filho com Linha Conectada (Tab)"
              >
                <Plus size={16} />
              </button>
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
