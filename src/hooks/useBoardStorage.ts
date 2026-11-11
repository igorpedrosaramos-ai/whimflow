import { useState, useEffect, useCallback, useMemo } from 'react';
import { Board, BoardVersionSnapshot } from '../types';
import { INITIAL_BOARDS, BLANK_BOARD, ONEGAI_BOARD, ORION_SUSHI_BOARD } from '../constants/initialData';
import { parseRoute } from '../router';
import {
  loadBoards,
  loadBoardsSync,
  debouncedSaveBoards,
  saveActiveBoardId,
  loadActiveBoardId,
  cleanAndNormalizeMindMap
} from '../services/storageService';

export function useBoardStorage(onBoardOpened?: (board: Board) => void) {
  // Estado inicial dos quadros com recuperação em camadas (IndexedDB + LocalStorage)
  const [boards, setBoards] = useState<Board[]>(() => {
    const loaded = loadBoardsSync();
    if (loaded && loaded.length > 0) {
      const hasOnegai = loaded.some((b: Board) => b.id === 'board-onegai');
      const hasOrion = loaded.some((b: Board) => b.id === 'board-orion-sushi');
      const list = [...loaded];
      if (!hasOnegai) list.push({ ...ONEGAI_BOARD, mindMapNodes: cleanAndNormalizeMindMap(ONEGAI_BOARD.mindMapNodes) });
      if (!hasOrion) list.push({ ...ORION_SUSHI_BOARD, mindMapNodes: cleanAndNormalizeMindMap(ORION_SUSHI_BOARD.mindMapNodes) });
      return list;
    }
    return INITIAL_BOARDS.map(b => ({
      ...b,
      mindMapNodes: cleanAndNormalizeMindMap(b.mindMapNodes)
    }));
  });

  // Sincronização inicial assíncrona com IndexedDB
  useEffect(() => {
    loadBoards().then(dbBoards => {
      if (dbBoards && dbBoards.length > 0) {
        setBoards(dbBoards);
      }
    });
  }, []);

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const initRoute = parseRoute(window.location.pathname, window.location.search);
      if (initRoute.boardId) {
        return initRoute.boardId;
      }
    }
    const savedActiveId = loadActiveBoardId();
    if (savedActiveId && boards.some(b => b.id === savedActiveId)) {
      return savedActiveId;
    }
    return boards[0]?.id || BLANK_BOARD.id;
  });

  useEffect(() => {
    saveActiveBoardId(activeBoardId);
  }, [activeBoardId]);

  // Salvar no IndexedDB e localStorage continuamente com debounce
  useEffect(() => {
    debouncedSaveBoards(boards, 300);
  }, [boards]);

  // Quadro ativo
  const activeBoard = useMemo(() => {
    return boards.find(b => b.id === activeBoardId) || boards[0] || BLANK_BOARD;
  }, [boards, activeBoardId]);

  // Histórico Undo/Redo particionado por quadro
  const [boardHistories, setBoardHistories] = useState<Record<string, { past: Board[]; future: Board[] }>>({});

  const updateActiveBoard = useCallback((updater: (board: Board) => Board, pushHistory: boolean = true) => {
    setBoards(prevBoards => {
      const current = prevBoards.find(b => b.id === activeBoardId) || prevBoards[0];
      if (!current) return prevBoards;

      if (pushHistory) {
        const snapshot = JSON.parse(JSON.stringify(current));
        setBoardHistories(prev => {
          const currentHist = prev[activeBoardId] || { past: [], future: [] };
          return {
            ...prev,
            [activeBoardId]: {
              past: [...currentHist.past, snapshot].slice(-40),
              future: []
            }
          };
        });
      }

      const updated = updater(current);
      return prevBoards.map(b => b.id === current.id ? { ...updated, updatedAt: new Date().toISOString() } : b);
    });
  }, [activeBoardId]);

  // Desfazer (Undo)
  const handleUndo = useCallback(() => {
    setBoardHistories(prev => {
      const currentHist = prev[activeBoardId];
      if (!currentHist || currentHist.past.length === 0) return prev;

      const previousState = currentHist.past[currentHist.past.length - 1];
      const newPast = currentHist.past.slice(0, -1);

      setBoards(prevBoards => {
        const current = prevBoards.find(b => b.id === activeBoardId);
        if (!current) return prevBoards;
        return prevBoards.map(b => b.id === activeBoardId ? { ...previousState, updatedAt: new Date().toISOString() } : b);
      });

      const currentBoard = boards.find(b => b.id === activeBoardId) || previousState;
      return {
        ...prev,
        [activeBoardId]: {
          past: newPast,
          future: [JSON.parse(JSON.stringify(currentBoard)), ...currentHist.future].slice(0, 40)
        }
      };
    });
  }, [activeBoardId, boards]);

  // Refazer (Redo)
  const handleRedo = useCallback(() => {
    setBoardHistories(prev => {
      const currentHist = prev[activeBoardId];
      if (!currentHist || currentHist.future.length === 0) return prev;

      const nextState = currentHist.future[0];
      const newFuture = currentHist.future.slice(1);

      setBoards(prevBoards => {
        const current = prevBoards.find(b => b.id === activeBoardId);
        if (!current) return prevBoards;
        return prevBoards.map(b => b.id === activeBoardId ? { ...nextState, updatedAt: new Date().toISOString() } : b);
      });

      const currentBoard = boards.find(b => b.id === activeBoardId) || nextState;
      return {
        ...prev,
        [activeBoardId]: {
          past: [...currentHist.past, JSON.parse(JSON.stringify(currentBoard))].slice(-40),
          future: newFuture
        }
      };
    });
  }, [activeBoardId, boards]);

  const canUndo = (boardHistories[activeBoardId]?.past?.length || 0) > 0;
  const canRedo = (boardHistories[activeBoardId]?.future?.length || 0) > 0;

  // Criar novo quadro limpo
  const handleCreateNewBoard = useCallback((title: string = 'Quadro sem título'): Board => {
    const newBoardId = `board-${Date.now()}`;
    const newBoard: Board = {
      id: newBoardId,
      title: title,
      workspaceId: 'ws-default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mindMapNodes: [
        {
          id: 'root',
          text: 'Ideia Central',
          x: 0,
          y: 0,
          width: 220,
          height: 52,
          parentId: null,
          childrenIds: [],
          collapsed: false,
          color: '#7c3aed',
          borderStyle: 'accent',
          lineStyle: 'bezier',
          side: 'root'
        }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: [],
      sections: []
    };

    setBoards(prev => [newBoard, ...prev]);
    setActiveBoardId(newBoardId);
    return newBoard;
  }, []);

  // Abrir quadro
  const handleOpenBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
    const target = boards.find(b => b.id === boardId);
    if (target && onBoardOpened) {
      onBoardOpened(target);
    }
  }, [boards, onBoardOpened]);

  // Duplicar quadro
  const handleDuplicateBoard = useCallback((id: string) => {
    const target = boards.find(b => b.id === id);
    if (!target) return;
    const duplicated: Board = {
      ...JSON.parse(JSON.stringify(target)),
      id: `board-${Date.now()}`,
      title: `${target.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBoards(prev => [duplicated, ...prev]);
  }, [boards]);

  // Excluir quadro
  const handleDeleteBoard = useCallback((id: string) => {
    setBoards(prev => {
      const filtered = prev.filter(b => b.id !== id);
      if (filtered.length === 0) {
        return [BLANK_BOARD];
      }
      return filtered;
    });
    if (activeBoardId === id) {
      const remaining = boards.filter(b => b.id !== id);
      setActiveBoardId(remaining[0]?.id || BLANK_BOARD.id);
    }
  }, [activeBoardId, boards]);

  // Snapshots de histórico (Time Machine)
  const handleRestoreSnapshot = useCallback((snapshotId: string, totalObjects: number) => {
    const snapshots = activeBoard.historySnapshots || [];
    const snap = snapshots.find(s => s.id === snapshotId);
    if (!snap) return;

    const autoBackup: BoardVersionSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: activeBoard.title,
      name: `Backup anterior à restauração de ${new Date(snap.timestamp).toLocaleTimeString('pt-BR')}`,
      nodeCount: activeBoard.mindMapNodes.length,
      objectCount: totalObjects,
      boardData: JSON.parse(JSON.stringify(activeBoard))
    };

    const restoredBoardData = JSON.parse(JSON.stringify(snap.boardData));
    updateActiveBoard(b => ({
      ...restoredBoardData,
      id: b.id,
      historySnapshots: [autoBackup, ...snapshots]
    }));
  }, [activeBoard, updateActiveBoard]);

  const handleForkSnapshot = useCallback((snapshotId: string): Board | null => {
    const snapshots = activeBoard.historySnapshots || [];
    const snap = snapshots.find(s => s.id === snapshotId);
    if (!snap) return null;

    const forkedBoard: Board = {
      ...JSON.parse(JSON.stringify(snap.boardData)),
      id: `board-${Date.now()}`,
      title: `${snap.boardData.title} (Bifurcado ${new Date(snap.timestamp).toLocaleDateString('pt-BR')})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      historySnapshots: []
    };

    setBoards(prev => [forkedBoard, ...prev]);
    setActiveBoardId(forkedBoard.id);
    return forkedBoard;
  }, [activeBoard]);

  const handleCreateMilestone = useCallback((name: string, totalObjects: number, description?: string) => {
    const newSnapshot: BoardVersionSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      name,
      description,
      title: activeBoard.title,
      nodeCount: activeBoard.mindMapNodes.length,
      objectCount: totalObjects,
      boardData: JSON.parse(JSON.stringify(activeBoard))
    };
    updateActiveBoard(b => ({
      ...b,
      historySnapshots: [newSnapshot, ...(b.historySnapshots || [])]
    }), false);
  }, [activeBoard, updateActiveBoard]);

  const handleDeleteSnapshot = useCallback((snapshotId: string) => {
    updateActiveBoard(b => ({
      ...b,
      historySnapshots: (b.historySnapshots || []).filter(s => s.id !== snapshotId)
    }), false);
  }, [updateActiveBoard]);

  return {
    boards,
    setBoards,
    activeBoardId,
    setActiveBoardId,
    activeBoard,
    boardHistories,
    updateActiveBoard,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleCreateNewBoard,
    handleOpenBoard,
    handleDuplicateBoard,
    handleDeleteBoard,
    handleRestoreSnapshot,
    handleForkSnapshot,
    handleCreateMilestone,
    handleDeleteSnapshot
  };
}
