import { useEffect } from 'react';
import { Board } from '../types';
import { parseOutlineText, createNodesFromOutline } from '../utils/mindMapImport';

interface UseKeyboardShortcutsProps {
  activeBoard: Board;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedNodeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;
  selectedStickyId: string | null;
  setSelectedStickyId: (id: string | null) => void;
  selectedShapeId?: string | null;
  setSelectedShapeId?: (id: string | null) => void;
  isSpacePressed: React.MutableRefObject<boolean>;
  setIsPanning: (panning: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleAddChildNode: (id: string) => void;
  handleAddSiblingNode: (id: string) => void;
  handleAddSiblingAboveNode: (id: string) => void;
  handleAddParentNode: (id: string) => void;
  handleToggleCollapse: (id: string) => void;
  handleCollapseAllBranches?: () => void;
  handleExpandAllBranches?: () => void;
  handleDeleteNode: (id: string) => void;
  handleDeleteMultipleNodes: (ids: string[]) => void;
  handleDuplicateNode: (id: string) => void;
  handleDuplicateMultipleNodes: (ids: string[]) => void;
  updateActiveBoard: (updater: (board: Board) => Board, pushHistory?: boolean) => void;
  onToggleSearch: () => void;
  onToggleShortcuts: () => void;
  onToggleQuickSpark?: () => void;
}

export function useKeyboardShortcuts({
  activeBoard,
  selectedNodeId,
  setSelectedNodeId,
  selectedNodeIds,
  setSelectedNodeIds,
  selectedStickyId,
  setSelectedStickyId,
  selectedShapeId,
  setSelectedShapeId,
  isSpacePressed,
  setIsPanning,
  handleUndo,
  handleRedo,
  handleAddChildNode,
  handleAddSiblingNode,
  handleAddSiblingAboveNode,
  handleAddParentNode,
  handleToggleCollapse,
  handleCollapseAllBranches,
  handleExpandAllBranches,
  handleDeleteNode,
  handleDeleteMultipleNodes,
  handleDuplicateNode,
  handleDuplicateMultipleNodes,
  updateActiveBoard,
  onToggleSearch,
  onToggleShortcuts,
  onToggleQuickSpark
}: UseKeyboardShortcutsProps) {

  // Atalhos Globais: Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Ctrl+K, ?
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleSearch();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        onToggleQuickSpark?.();
        return;
      }

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo, onToggleSearch, onToggleShortcuts]);

  // Atalhos do Canvas e Árvore (Tab, Enter, Alt+Enter, Ctrl+Enter, Setas, Ctrl+D, Ctrl+C, Ctrl+V, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (e.code === 'Space' && !isInput && !isSpacePressed.current) {
        isSpacePressed.current = true;
        document.body.style.cursor = 'grab';
      }

      if (isInput) return;

      // Duplicar nós selecionados (Ctrl + D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          handleDuplicateMultipleNodes(selectedNodeIds);
        } else if (selectedNodeId) {
          handleDuplicateNode(selectedNodeId);
        }
        return;
      }

      // Minimizar Todos os Ramos do Mapa (Ctrl + Shift + [ ou Ctrl + Shift + -)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '[' || e.key === '{' || e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleCollapseAllBranches?.();
        return;
      }

      // Maximizar / Expandir Todos os Ramos do Mapa (Ctrl + Shift + ] ou Ctrl + Shift + +)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === ']' || e.key === '}' || e.key === '+' || e.key === '=')) {
        e.preventDefault();
        handleExpandAllBranches?.();
        return;
      }

      // Recolher / Expandir Ramo (Ctrl + /)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        if (selectedNodeId) {
          e.preventDefault();
          handleToggleCollapse(selectedNodeId);
          return;
        } else {
          // Se nenhum nó estiver selecionado, alterna entre expandir e recolher todos
          e.preventDefault();
          handleCollapseAllBranches?.();
          return;
        }
      }

      // Criar nó Pai Intermediário (Alt + Enter)
      if (e.altKey && e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        handleAddParentNode(selectedNodeId);
        return;
      }

      // Criar nó Irmão Acima (Ctrl + Enter)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        handleAddSiblingAboveNode(selectedNodeId);
        return;
      }

      // Criar Filho (Tab)
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        handleAddChildNode(selectedNodeId);
        return;
      }

      // Criar Irmão Abaixo (Enter)
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        handleAddSiblingNode(selectedNodeId);
        return;
      }

      // Navegação por Setas (↑ ↓ ← →)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedNodeId) {
        const cur = activeBoard.mindMapNodes.find(n => n.id === selectedNodeId);
        if (cur) {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (cur.parentId) {
              const parent = activeBoard.mindMapNodes.find(n => n.id === cur.parentId);
              if (parent && parent.childrenIds.length > 1) {
                const idx = parent.childrenIds.indexOf(cur.id);
                if (idx >= 0) {
                  const targetIdx = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(parent.childrenIds.length - 1, idx + 1);
                  const targetId = parent.childrenIds[targetIdx];
                  if (targetId && targetId !== cur.id) {
                    e.preventDefault();
                    setSelectedNodeId(targetId);
                    setSelectedNodeIds([targetId]);
                    return;
                  }
                }
              }
            }
          } else if (e.key === 'ArrowRight') {
            if (cur.childrenIds && cur.childrenIds.length > 0 && !cur.collapsed) {
              e.preventDefault();
              const firstChild = cur.childrenIds[0];
              setSelectedNodeId(firstChild);
              setSelectedNodeIds([firstChild]);
              return;
            }
          } else if (e.key === 'ArrowLeft') {
            if (cur.parentId) {
              e.preventDefault();
              setSelectedNodeId(cur.parentId);
              setSelectedNodeIds([cur.parentId]);
              return;
            }
          }
        }
      }

      // Copiar ramo como texto hierárquico (Ctrl + C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedNodeId) {
        const root = activeBoard.mindMapNodes.find(n => n.id === selectedNodeId);
        if (root) {
          const lines: string[] = [];
          const collect = (nodeId: string, depth: number) => {
            const n = activeBoard.mindMapNodes.find(item => item.id === nodeId);
            if (!n) return;
            lines.push(`${'  '.repeat(depth)}- ${n.text}`);
            if (n.childrenIds && n.childrenIds.length > 0) {
              n.childrenIds.forEach(cid => collect(cid, depth + 1));
            }
          };
          collect(root.id, 0);
          if (lines.length > 0) {
            navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
          }
        }
      }

      // Exclusão (Delete / Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          handleDeleteMultipleNodes(selectedNodeIds);
        } else if (selectedNodeId) {
          handleDeleteNode(selectedNodeId);
        } else if (selectedStickyId) {
          updateActiveBoard(b => ({ ...b, stickies: (b.stickies || []).filter(s => s.id !== selectedStickyId) }));
          setSelectedStickyId(null);
        } else if (selectedShapeId) {
          updateActiveBoard(b => ({
            ...b,
            shapes: (b.shapes || []).filter(s => s.id !== selectedShapeId),
            wireframes: (b.wireframes || []).filter(w => w.id !== selectedShapeId),
            texts: (b.texts || []).filter(t => t.id !== selectedShapeId)
          }));
          setSelectedShapeId?.(null);
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedNodeIds([]);
        setSelectedStickyId(null);
        setSelectedShapeId?.(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressed.current = false;
        document.body.style.cursor = 'default';
        setIsPanning(false);
      }
    };

    // Colar Lista/Markdown hierárquico (Ctrl + V)
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || (activeEl as HTMLElement)?.isContentEditable;
      if (isInput) return;

      const clipboardData = e.clipboardData?.getData('text');
      if (!clipboardData) return;

      const lines = parseOutlineText(clipboardData);
      if (lines.length >= 2 || (lines.length === 1 && lines[0].text.length > 0)) {
        e.preventDefault();
        const targetParentId = selectedNodeId || 'root';
        const targetParent = activeBoard.mindMapNodes.find(n => n.id === targetParentId) || activeBoard.mindMapNodes[0];
        if (targetParent) {
          const newNodes = createNodesFromOutline(lines, targetParent, activeBoard.mindMapNodes);
          if (newNodes.length > 0) {
            const firstLevelIds = newNodes.filter(n => n.parentId === targetParent.id).map(n => n.id);
            updateActiveBoard(board => ({
              ...board,
              mindMapNodes: [
                ...board.mindMapNodes.map(n => n.id === targetParent.id ? {
                  ...n,
                  childrenIds: [...(n.childrenIds || []), ...firstLevelIds],
                  collapsed: false
                } : n),
                ...newNodes
              ]
            }));
            if (firstLevelIds[0]) {
              setSelectedNodeId(firstLevelIds[0]);
              setSelectedNodeIds(firstLevelIds);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [
    activeBoard,
    selectedNodeId,
    selectedNodeIds,
    selectedStickyId,
    isSpacePressed,
    setIsPanning,
    handleAddChildNode,
    handleAddSiblingNode,
    handleAddSiblingAboveNode,
    handleAddParentNode,
    handleToggleCollapse,
  handleCollapseAllBranches,
  handleExpandAllBranches,
    handleDeleteNode,
    handleDeleteMultipleNodes,
    handleDuplicateNode,
    handleDuplicateMultipleNodes,
    updateActiveBoard,
    setSelectedNodeId,
    setSelectedNodeIds,
    setSelectedStickyId
  ]);
}
