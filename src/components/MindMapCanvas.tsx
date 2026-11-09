import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dropTargetNodeId, setDropTargetNodeId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside'>('inside');
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Evita que um clique simples inicie arraste do nó acidentalmente
  const dragPendingRef = useRef<{ id: string; clientX: number; clientY: number } | null>(null);
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

  // ARRASTE SEGURO PARA MUDAR DE SETOR / REPARENTALIZAR
  const handleMouseDown = (node: MindMapNode, e: React.MouseEvent) => {
    if (editingId === node.id) return;
    if (e.button !== 0) return;
    e.stopPropagation();

    // Se o nó já estiver em uma seleção múltipla, preserva o grupo para permitir arrastar em bloco
    const isAlreadySelected = selectedNodeIds && selectedNodeIds.includes(node.id);
    if (!isAlreadySelected && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      onSelectNode(node.id);
    }

    // Se for nó raiz, não arrasta
    if (node.side === 'root') return;

    // Registra clique inicial, mas só ativa drag se o cursor se mover > 4px
    dragPendingRef.current = { id: node.id, clientX: e.clientX, clientY: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Ativa o arraste somente se houve deslocamento real (> 4px)
      if (dragPendingRef.current && !draggingNodeId) {
        const dx = Math.abs(e.clientX - dragPendingRef.current.clientX);
        const dy = Math.abs(e.clientY - dragPendingRef.current.clientY);
        if (dx > 4 || dy > 4) {
          setDraggingNodeId(dragPendingRef.current.id);
        }
      }

      if (!draggingNodeId) return;

      // Coordenadas de tela fixas para ancoragem perfeita sob o cursor do mouse
      setDragCursorPos({ x: e.clientX, y: e.clientY });

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
          } else if (relY < 0.35) {
            // Parte superior do card: Reordenar para ANTES deste irmão
            setDropTargetNodeId(targetId);
            setDropPosition('before');
          } else if (relY > 0.65) {
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
      dragPendingRef.current = null;
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, dropTargetNodeId, dropPosition, onReparentNode, onReorderInsertNode, pan, zoom, nodeMap]);

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
          // accent (estilo clássico corporativo com borda esquerda viva)
          bg = 'var(--bg-surface)';
          borderLeft = `4px solid ${nodeColor}`;
        }

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
              backgroundColor: isDropTarget && dropPosition === 'inside' ? 'rgba(13, 148, 136, 0.2)' : bg,
              border: isMultiSelected ? '1.5px solid var(--accent-purple, #6366f1)' : border,
              borderLeft: isMultiSelected ? undefined : borderLeft,
              outline: isDropTarget && dropPosition === 'inside'
                ? '2.5px solid var(--accent-teal, #0d9488)'
                : isMultiSelected
                ? '2px solid var(--accent-purple, #6366f1)'
                : (isSelected ? `2px solid ${nodeColor}` : undefined),
              outlineOffset: '2px',
              boxShadow: isSelected ? `0 0 12px ${nodeColor}55` : '0 2px 8px rgba(0, 0, 0, 0.2)',
              zIndex: isDropTarget ? 45 : (isSelected ? 35 : 20),
              padding: isRoot ? '12px 24px' : '8px 14px',
              whiteSpace: 'nowrap',
              opacity: draggingNodeId === node.id ? 0.35 : 1,
              cursor: isRoot ? 'default' : (draggingNodeId === node.id ? 'grabbing' : 'grab')
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Se clicar com Ctrl ou Shift, alterna na seleção múltipla
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
            {/* Indicador Visual Limpo e Corporativo de Reordenação (Linha elegante estilo Notion/Whimsical) */}
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

            {/* Botões Externos de Adicionar (+ Filho à direita / + Irmão abaixo) */}
            {(isSelected || isHovered) && !isEditing && !draggingNodeId && (
              <>
                {/* 1. Botão Adicionar Filho à Direita */}
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

                {/* 2. Botão Adicionar Irmão Abaixo */}
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

      {/* Cartão Fantasma Limpo durante o Arraste (Posicionamento Fixo Exato sob o Cursor) */}
      {draggingNodeId && dragCursorPos && nodeMap.get(draggingNodeId) && (
        <div
          style={{
            position: 'fixed',
            left: `${dragCursorPos.x}px`,
            top: `${dragCursorPos.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10000,
            backgroundColor: nodeMap.get(draggingNodeId)?.color || 'var(--accent-purple)',
            color: '#ffffff',
            padding: '7px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            border: '1.5px solid #ffffff',
            opacity: 0.9,
            whiteSpace: 'nowrap',
            minWidth: '60px',
            minHeight: '28px'
          }}
        >
          {nodeMap.get(draggingNodeId)?.text || ''}
        </div>
      )}
    </>
  );
};
