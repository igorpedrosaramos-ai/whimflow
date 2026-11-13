import { useCallback } from 'react';
import { Board, MindMapNode } from '../types';
import { EXECUTIVE_PALETTE } from '../components/NodeContextMenu';

interface UseBoardOperationsProps {
  activeBoard: Board;
  updateActiveBoard: (updater: (board: Board) => Board, pushHistory?: boolean) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;
  setEditingNodeId: (id: string | null) => void;
}

export function useBoardOperations({
  activeBoard,
  updateActiveBoard,
  selectedNodeId,
  setSelectedNodeId,
  selectedNodeIds,
  setSelectedNodeIds,
  setEditingNodeId
}: UseBoardOperationsProps) {

  // Excluir múltiplos nós
  const handleDeleteMultipleNodes = useCallback((ids: string[]) => {
    const rootNode = activeBoard.mindMapNodes.find(n => n.side === 'root');
    const toDeleteInput = ids.filter(id => id !== rootNode?.id);
    if (toDeleteInput.length === 0) return;

    updateActiveBoard(board => {
      const toDelete = new Set<string>();
      const gather = (nodeId: string) => {
        toDelete.add(nodeId);
        const node = board.mindMapNodes.find(n => n.id === nodeId);
        if (node && node.childrenIds) node.childrenIds.forEach(gather);
      };
      toDeleteInput.forEach(gather);

      return {
        ...board,
        mindMapNodes: board.mindMapNodes
          .filter(n => !toDelete.has(n.id))
          .map(n => ({ ...n, childrenIds: n.childrenIds.filter(cid => !toDelete.has(cid)) }))
      };
    });
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
  }, [activeBoard.mindMapNodes, updateActiveBoard, setSelectedNodeId, setSelectedNodeIds]);

  // Excluir nó único
  const handleDeleteNode = useCallback((id: string) => {
    handleDeleteMultipleNodes([id]);
  }, [handleDeleteMultipleNodes]);

  // Atualizar texto do nó - Mantém o nó seguro sem nunca deletar acidentalmente
  const handleUpdateNodeText = useCallback((id: string, text: string) => {
    const trimmed = text.trim();
    const finalVal = trimmed || 'Novo item';
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, text: finalVal } : n)
    }));
  }, [updateActiveBoard]);

  // Recolher / Expandir Ramo Individual
  const handleToggleCollapse = useCallback((id: string) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n)
    }));
  }, [updateActiveBoard]);

  // Minimizar / Recolher Todos os Ramos do Mapa (mantém nós-raiz e tópicos principais visíveis com contadores)
  const handleCollapseAllBranches = useCallback(() => {
    updateActiveBoard(board => {
      // Mapeamento bidirecional infalível de nós que possuem filhos
      const parentIdsWithChildren = new Set<string>();
      board.mindMapNodes.forEach(node => {
        if (node.childrenIds && node.childrenIds.length > 0) {
          parentIdsWithChildren.add(node.id);
        }
        if (node.parentId) {
          parentIdsWithChildren.add(node.parentId);
        }
      });

      return {
        ...board,
        mindMapNodes: board.mindMapNodes.map(node => {
          // Os nós raiz ('root' ou side === 'root' ou sem parentId) NUNCA são recolhidos,
          // garantindo que a estrutura principal do projeto permaneça 100% legível.
          const isRoot = node.id === 'root' || node.side === 'root' || !node.parentId;
          if (isRoot) {
            return { ...node, collapsed: false };
          }
          // Todos os nós que possuem filhos são recolhidos
          if (parentIdsWithChildren.has(node.id)) {
            return { ...node, collapsed: true };
          }
          return node;
        })
      };
    });
  }, [updateActiveBoard]);

  // Maximizar / Expandir Todos os Ramos do Mapa (expande 100% da árvore)
  const handleExpandAllBranches = useCallback(() => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(node => ({
        ...node,
        collapsed: false
      }))
    }));
  }, [updateActiveBoard]);

  // Criar Nó Filho
  const handleAddChildNode = useCallback((parentId: string) => {
    const parent = activeBoard.mindMapNodes.find(n => n.id === parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    let branchColor = parent.color;
    if (parent.side === 'root' || !branchColor) {
      const paletteIndex = parent.childrenIds.length % EXECUTIVE_PALETTE.length;
      branchColor = EXECUTIVE_PALETTE[paletteIndex].hex;
    }

    const newNode: MindMapNode = {
      id: newId,
      text: 'Novo item',
      x: parent.x + 240,
      y: parent.y + parent.childrenIds.length * 45,
      parentId: parent.id,
      childrenIds: [],
      collapsed: false,
      color: branchColor,
      borderStyle: parent.borderStyle || 'accent',
      lineStyle: parent.lineStyle || 'bezier',
      side: parent.side === 'root' ? 'right' : parent.side
    };

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: [
        ...board.mindMapNodes.map(n => n.id === parentId ? { 
          ...n, 
          childrenIds: [...n.childrenIds, newId],
          collapsed: false
        } : n),
        newNode
      ]
    }));

    setSelectedNodeId(newId);
    setSelectedNodeIds([newId]);
    setEditingNodeId(newId);
  }, [activeBoard.mindMapNodes, updateActiveBoard, setSelectedNodeId, setSelectedNodeIds, setEditingNodeId]);

  // Criar Nó Irmão Abaixo
  const handleAddSiblingNode = useCallback((siblingId: string) => {
    const sibling = activeBoard.mindMapNodes.find(n => n.id === siblingId);
    if (!sibling) return;

    if (!sibling.parentId) {
      handleAddChildNode(sibling.id);
      return;
    }

    const parent = activeBoard.mindMapNodes.find(n => n.id === sibling.parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      text: 'Novo item',
      x: sibling.x,
      y: sibling.y + 45,
      parentId: parent.id,
      childrenIds: [],
      collapsed: false,
      color: sibling.color || parent.color || '#6366f1',
      borderStyle: sibling.borderStyle || 'accent',
      lineStyle: sibling.lineStyle || 'bezier',
      side: sibling.side
    };

    updateActiveBoard(board => {
      const curIndex = parent.childrenIds.indexOf(siblingId);
      const newChildren = [...parent.childrenIds];
      if (curIndex >= 0) {
        newChildren.splice(curIndex + 1, 0, newId);
      } else {
        newChildren.push(newId);
      }

      return {
        ...board,
        mindMapNodes: [
          ...board.mindMapNodes.map(n => n.id === parent.id ? { 
            ...n, 
            childrenIds: newChildren 
          } : n),
          newNode
        ]
      };
    });

    setSelectedNodeId(newId);
    setSelectedNodeIds([newId]);
    setEditingNodeId(newId);
  }, [activeBoard.mindMapNodes, updateActiveBoard, handleAddChildNode, setSelectedNodeId, setSelectedNodeIds, setEditingNodeId]);

  // Criar Nó Irmão Acima
  const handleAddSiblingAboveNode = useCallback((siblingId: string) => {
    const sibling = activeBoard.mindMapNodes.find(n => n.id === siblingId);
    if (!sibling || !sibling.parentId) return;

    const parent = activeBoard.mindMapNodes.find(n => n.id === sibling.parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      text: 'Novo item',
      x: sibling.x,
      y: sibling.y - 45,
      parentId: parent.id,
      childrenIds: [],
      collapsed: false,
      color: sibling.color || parent.color || '#6366f1',
      borderStyle: sibling.borderStyle || 'accent',
      lineStyle: sibling.lineStyle || 'bezier',
      side: sibling.side
    };

    updateActiveBoard(board => {
      const curIndex = parent.childrenIds.indexOf(siblingId);
      const newChildren = [...parent.childrenIds];
      if (curIndex >= 0) {
        newChildren.splice(curIndex, 0, newId);
      } else {
        newChildren.unshift(newId);
      }

      return {
        ...board,
        mindMapNodes: [
          ...board.mindMapNodes.map(n => n.id === parent.id ? { 
            ...n, 
            childrenIds: newChildren 
          } : n),
          newNode
        ]
      };
    });

    setSelectedNodeId(newId);
    setSelectedNodeIds([newId]);
    setEditingNodeId(newId);
  }, [activeBoard.mindMapNodes, updateActiveBoard, setSelectedNodeId, setSelectedNodeIds, setEditingNodeId]);

  // Criar Nó Pai Intermediário
  const handleAddParentNode = useCallback((childId: string) => {
    const child = activeBoard.mindMapNodes.find(n => n.id === childId);
    if (!child || !child.parentId) return;

    const grandParent = activeBoard.mindMapNodes.find(n => n.id === child.parentId);
    if (!grandParent) return;

    const newId = `node-${Date.now()}`;
    const newParentNode: MindMapNode = {
      id: newId,
      text: 'Novo item',
      x: (child.x + grandParent.x) / 2,
      y: child.y,
      parentId: grandParent.id,
      childrenIds: [childId],
      collapsed: false,
      color: child.color || grandParent.color || '#6366f1',
      borderStyle: child.borderStyle || 'accent',
      lineStyle: child.lineStyle || 'bezier',
      side: child.side
    };

    updateActiveBoard(board => {
      const childIndex = grandParent.childrenIds.indexOf(childId);
      const newGrandChildren = [...grandParent.childrenIds];
      if (childIndex >= 0) {
        newGrandChildren.splice(childIndex, 1, newId);
      } else {
        newGrandChildren.push(newId);
      }

      return {
        ...board,
        mindMapNodes: [
          ...board.mindMapNodes.map(n => {
            if (n.id === grandParent.id) return { ...n, childrenIds: newGrandChildren };
            if (n.id === childId) return { ...n, parentId: newId };
            return n;
          }),
          newParentNode
        ]
      };
    });

    setSelectedNodeId(newId);
    setSelectedNodeIds([newId]);
    setEditingNodeId(newId);
  }, [activeBoard.mindMapNodes, updateActiveBoard, setSelectedNodeId, setSelectedNodeIds, setEditingNodeId]);

  // Reordenar Irmãos (Subir / Descer)
  const handleReorderNode = useCallback((nodeId: string, direction: 'up' | 'down') => {
    const node = activeBoard.mindMapNodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return;

    const parent = activeBoard.mindMapNodes.find(n => n.id === node.parentId);
    if (!parent) return;

    const curIndex = parent.childrenIds.indexOf(nodeId);
    if (curIndex === -1) return;

    const targetIndex = direction === 'up' ? curIndex - 1 : curIndex + 1;
    if (targetIndex < 0 || targetIndex >= parent.childrenIds.length) return;

    const newChildren = [...parent.childrenIds];
    newChildren[curIndex] = newChildren[targetIndex];
    newChildren[targetIndex] = nodeId;

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === parent.id ? { ...n, childrenIds: newChildren } : n)
    }));
  }, [activeBoard.mindMapNodes, updateActiveBoard]);

  // Reordenar e Inserir Nó via Arraste
  const handleReorderInsertNode = useCallback((
    draggedId: string, 
    targetId: string, 
    position: 'before' | 'after' | 'inside'
  ) => {
    if (draggedId === targetId) return;

    const movingIds = (selectedNodeIds.length > 1 && selectedNodeIds.includes(draggedId))
      ? selectedNodeIds.filter(id => {
          const n = activeBoard.mindMapNodes.find(item => item.id === id);
          return n && n.side !== 'root' && id !== targetId;
        })
      : [draggedId];

    if (movingIds.length === 0) return;

    updateActiveBoard(board => {
      const targetNode = board.mindMapNodes.find(n => n.id === targetId);
      if (!targetNode) return board;

      const isDescendant = (checkId: string, searchTarget: string): boolean => {
        const n = board.mindMapNodes.find(item => item.id === checkId);
        if (!n || !n.childrenIds) return false;
        if (n.childrenIds.includes(searchTarget)) return true;
        return n.childrenIds.some(cid => isDescendant(cid, searchTarget));
      };

      const validMovingIds = movingIds.filter(mid => !isDescendant(mid, targetId));
      if (validMovingIds.length === 0) return board;

      if (position === 'inside') {
        return {
          ...board,
          mindMapNodes: board.mindMapNodes.map(n => {
            if (n.childrenIds && n.childrenIds.some(cid => validMovingIds.includes(cid))) {
              return {
                ...n,
                childrenIds: n.childrenIds.filter(cid => !validMovingIds.includes(cid))
              };
            }
            if (n.id === targetId) {
              const existing = n.childrenIds.filter(cid => !validMovingIds.includes(cid));
              return {
                ...n,
                childrenIds: [...existing, ...validMovingIds],
                collapsed: false
              };
            }
            if (validMovingIds.includes(n.id)) {
              return {
                ...n,
                parentId: targetId,
                color: targetNode.color || n.color,
                offsetX: 0,
                offsetY: 0
              };
            }
            return n;
          })
        };
      }

      const newParentId = targetNode.parentId;
      if (!newParentId) return board;

      const newParent = board.mindMapNodes.find(n => n.id === newParentId);
      if (!newParent) return board;

      let newChildren = newParent.childrenIds.filter(cid => !validMovingIds.includes(cid));
      const targetIndex = newChildren.indexOf(targetId);
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

      if (insertIndex >= 0) {
        newChildren.splice(insertIndex, 0, ...validMovingIds);
      } else {
        newChildren.push(...validMovingIds);
      }

      return {
        ...board,
        mindMapNodes: board.mindMapNodes.map(n => {
          if (n.id !== newParentId && n.childrenIds && n.childrenIds.some(cid => validMovingIds.includes(cid))) {
            return {
              ...n,
              childrenIds: n.childrenIds.filter(cid => !validMovingIds.includes(cid))
            };
          }
          if (n.id === newParentId) {
            return { ...n, childrenIds: newChildren };
          }
          if (validMovingIds.includes(n.id)) {
            return {
              ...n,
              parentId: newParentId,
              color: newParent.color || n.color,
              offsetX: 0,
              offsetY: 0
            };
          }
          return n;
        })
      };
    });

    setSelectedNodeId(draggedId);
  }, [activeBoard.mindMapNodes, selectedNodeIds, updateActiveBoard, setSelectedNodeId]);

  // Reparentalizar nó
  const handleReparentNode = useCallback((childId: string, newParentId: string) => {
    const child = activeBoard.mindMapNodes.find(n => n.id === childId);
    const newParent = activeBoard.mindMapNodes.find(n => n.id === newParentId);
    if (!child || !newParent || child.id === newParent.id) return;

    const isDescendant = (checkId: string, targetId: string): boolean => {
      const n = activeBoard.mindMapNodes.find(item => item.id === checkId);
      if (!n || !n.childrenIds) return false;
      if (n.childrenIds.includes(targetId)) return true;
      return n.childrenIds.some(cid => isDescendant(cid, targetId));
    };

    if (isDescendant(childId, newParentId)) return;

    const oldParentId = child.parentId;
    if (oldParentId === newParentId) return;

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => {
        if (oldParentId && n.id === oldParentId) {
          return { ...n, childrenIds: n.childrenIds.filter(cid => cid !== childId) };
        }
        if (n.id === newParentId) {
          return { ...n, childrenIds: [...n.childrenIds.filter(cid => cid !== childId), childId], collapsed: false };
        }
        if (n.id === childId) {
          return {
            ...n,
            parentId: newParentId,
            color: newParent.color || n.color,
            offsetX: 0,
            offsetY: 0
          };
        }
        return n;
      })
    }));

    setSelectedNodeId(childId);
  }, [activeBoard.mindMapNodes, updateActiveBoard, setSelectedNodeId]);

  // Atualizar estilo
  const handleUpdateNodeStyle = useCallback((nodeId: string, updates: Partial<MindMapNode>) => {
    updateActiveBoard(board => {
      const toUpdate = new Set<string>([nodeId]);
      if (updates.color) {
        const gatherDescendants = (id: string) => {
          const target = board.mindMapNodes.find(n => n.id === id);
          if (target && target.childrenIds) {
            target.childrenIds.forEach(cid => {
              toUpdate.add(cid);
              gatherDescendants(cid);
            });
          }
        };
        gatherDescendants(nodeId);
      }

      return {
        ...board,
        mindMapNodes: board.mindMapNodes.map(n => toUpdate.has(n.id) ? { ...n, ...updates } : n)
      };
    });
  }, [updateActiveBoard]);

  // Duplicar múltiplos nós
  const handleDuplicateMultipleNodes = useCallback((ids: string[]) => {
    const rootNode = activeBoard.mindMapNodes.find(n => n.side === 'root');
    const toDup = ids.filter(id => id !== rootNode?.id);
    if (toDup.length === 0) return;

    const newIds: string[] = [];

    updateActiveBoard(board => {
      const newNodes: MindMapNode[] = [];
      const parentToNewChildren = new Map<string, string[]>();

      toDup.forEach((id, idx) => {
        const node = board.mindMapNodes.find(n => n.id === id);
        if (!node || !node.parentId) return;
        const newId = `node-${Date.now()}-${idx}`;
        newIds.push(newId);

        newNodes.push({
          ...JSON.parse(JSON.stringify(node)),
          id: newId,
          text: node.text ? `${node.text} (Cópia)` : '',
          childrenIds: [],
          offsetX: 0,
          offsetY: 0
        });

        const list = parentToNewChildren.get(node.parentId) || [];
        list.push(newId);
        parentToNewChildren.set(node.parentId, list);
      });

      return {
        ...board,
        mindMapNodes: [
          ...board.mindMapNodes.map(n => {
            const added = parentToNewChildren.get(n.id);
            if (added) {
              return { ...n, childrenIds: [...n.childrenIds, ...added] };
            }
            return n;
          }),
          ...newNodes
        ]
      };
    });

    if (newIds.length > 0) {
      setSelectedNodeId(newIds[0]);
      setSelectedNodeIds(newIds);
    }
  }, [activeBoard.mindMapNodes, updateActiveBoard, setSelectedNodeId, setSelectedNodeIds]);

  // Duplicar nó único
  const handleDuplicateNode = useCallback((nodeId: string) => {
    handleDuplicateMultipleNodes([nodeId]);
  }, [handleDuplicateMultipleNodes]);

  // Adicionar Nó Conectado via Toolbar Principal
  const handleAddConnectedNode = useCallback(() => {
    if (selectedNodeId) {
      handleAddChildNode(selectedNodeId);
    } else {
      const rootNode = activeBoard.mindMapNodes.find(n => n.side === 'root') || activeBoard.mindMapNodes[0];
      if (rootNode) {
        handleAddChildNode(rootNode.id);
      }
    }
  }, [selectedNodeId, activeBoard.mindMapNodes, handleAddChildNode]);

  // Inserir ramos gerados pela IA
  const handleAddGeneratedBranches = useCallback((parentId: string, branchTexts: string[]) => {
    const parent = activeBoard.mindMapNodes.find(n => n.id === parentId);
    if (!parent) return;

    const newNodes: MindMapNode[] = [];
    const newChildrenIds: string[] = [];

    branchTexts.forEach((text, index) => {
      const newId = `node-ai-${Date.now()}-${index}`;
      newChildrenIds.push(newId);
      newNodes.push({
        id: newId,
        text,
        x: parent.x + 240,
        y: parent.y + (index - branchTexts.length / 2) * 50,
        parentId: parent.id,
        childrenIds: [],
        collapsed: false,
        color: parent.color || '#7c3aed',
        borderStyle: 'accent',
        lineStyle: 'bezier',
        side: 'right'
      });
    });

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: [
        ...board.mindMapNodes.map(n => n.id === parentId ? {
          ...n,
          childrenIds: [...(n.childrenIds || []), ...newChildrenIds],
          collapsed: false
        } : n),
        ...newNodes
      ]
    }));
  }, [activeBoard.mindMapNodes, updateActiveBoard]);

  return {
    handleDeleteNode,
    handleDeleteMultipleNodes,
    handleUpdateNodeText,
    handleToggleCollapse,
    handleCollapseAllBranches,
    handleExpandAllBranches,
    handleAddChildNode,
    handleAddSiblingNode,
    handleAddSiblingAboveNode,
    handleAddParentNode,
    handleReorderNode,
    handleReorderInsertNode,
    handleReparentNode,
    handleUpdateNodeStyle,
    handleDuplicateNode,
    handleDuplicateMultipleNodes,
    handleAddConnectedNode,
    handleAddGeneratedBranches
  };
}
