import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_BOARDS, BLANK_BOARD } from './constants/initialData';
import { Board, ToolType, MindMapNode, StickyNote, WireframeItem, DrawingStroke } from './types';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MindMapCanvas } from './components/MindMapCanvas';
import { StickyNotesCanvas } from './components/StickyNotesCanvas';
import { FreehandCanvas } from './components/FreehandCanvas';
import { ZoomControls } from './components/ZoomControls';
import { AIModal } from './components/AIModal';
import { ShareModal } from './components/ShareModal';
import { PresentationView } from './components/PresentationView';
import { EXECUTIVE_PALETTE } from './components/NodeContextMenu';

const STORAGE_KEY = 'whimflow_boards_v5';
const THEME_KEY = 'whimflow_theme';

export const App: React.FC = () => {
  // Estado dos Quadros
  const [boards, setBoards] = useState<Board[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Iniciando com quadro limpo');
    }
    return INITIAL_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    return boards[0]?.id || BLANK_BOARD.id;
  });

  // Pilha de Histórico para Desfazer / Refazer
  const [history, setHistory] = useState<Board[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Interface & Ferramentas
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>('mindmap');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
  });

  // Canvas Pan & Zoom
  const [pan, setPan] = useState({ x: 300, y: 350 });
  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const isSpacePressed = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Seleções
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);

  // Modais
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Desenho livre
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Salvar no localStorage continuamente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    } catch (e) {
      console.error('Falha ao salvar quadros', e);
    }
  }, [boards]);

  // Tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Atualizar quadro ativo de forma robusta e imediata
  const updateActiveBoard = useCallback((updater: (board: Board) => Board, _pushHistory: boolean = true) => {
    setBoards(prevBoards => {
      const current = prevBoards.find(b => b.id === activeBoardId) || prevBoards[0];
      if (!current) return prevBoards;

      const updated = updater(current);
      return prevBoards.map(b => b.id === current.id ? { ...updated, updatedAt: new Date().toISOString() } : b);
    });
  }, [activeBoardId]);

  // Desfazer / Refazer
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const previousState = history[historyIndex];
      setBoards(prev => prev.map(b => b.id === previousState.id ? previousState : b));
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setBoards(prev => prev.map(b => b.id === nextState.id ? nextState : b));
      setHistoryIndex(nextIndex);
    }
  };

  // CRIAR NOVO QUADRO 100% LIMPO
  const handleCreateNewBoard = (title: string = 'Novo Projeto') => {
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
          color: '#6366f1',
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
      drawings: []
    };

    setBoards(prev => [newBoard, ...prev]);
    setActiveBoardId(newBoardId);
    setSelectedNodeId('root');
    setPan({ x: 300, y: 350 });
    setZoom(1.0);
  };

  // DUPLICAR QUADRO
  const handleDuplicateBoard = (id: string) => {
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
    setActiveBoardId(duplicated.id);
  };

  // EXCLUIR QUADRO
  const handleDeleteBoard = (id: string) => {
    if (boards.length <= 1) {
      alert('Você precisa manter pelo menos um quadro ativo.');
      return;
    }
    const remaining = boards.filter(b => b.id !== id);
    setBoards(remaining);
    if (activeBoardId === id) {
      setActiveBoardId(remaining[0].id);
    }
  };

  // GESTÃO DE TEXTO DO NÓ
  const handleUpdateNodeText = (id: string, text: string) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, text } : n)
    }));
  };

  // RECOLHER / EXPANDIR RAMO
  const handleToggleCollapse = (id: string) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n)
    }));
  };

  // CRIAÇÃO DE QUADRADO COM LINHA EMBUTIDA (FILHO)
  const handleAddChildNode = (parentId: string) => {
    const parent = activeBoard.mindMapNodes.find(n => n.id === parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    
    // Determina a cor do ramo
    let branchColor = parent.color;
    if (parent.side === 'root' || !branchColor) {
      const paletteIndex = parent.childrenIds.length % EXECUTIVE_PALETTE.length;
      branchColor = EXECUTIVE_PALETTE[paletteIndex].hex;
    }

    const newNode: MindMapNode = {
      id: newId,
      text: 'Novo Quadrado',
      x: parent.x + 240,
      y: parent.y + parent.childrenIds.length * 45,
      parentId: parent.id,
      childrenIds: [],
      collapsed: false,
      color: branchColor,
      borderStyle: parent.borderStyle || 'accent',
      lineStyle: parent.lineStyle || 'bezier',
      side: 'right'
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
  };

  // CRIAÇÃO DE QUADRADO COM LINHA EMBUTIDA (IRMÃO NO MESMO NÍVEL)
  const handleAddSiblingNode = (siblingId: string) => {
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
      text: 'Novo Quadrado',
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
  };

  // REORDENAR NÓS IRMÃOS (SUBIR ↑ / DESCER ↓)
  const handleReorderNode = (nodeId: string, direction: 'up' | 'down') => {
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
  };

  // REPARENTALIZAR NÓ (MUDAR DE NÓ-PAI VIA ARRASTE)
  const handleReparentNode = (childId: string, newParentId: string) => {
    const child = activeBoard.mindMapNodes.find(n => n.id === childId);
    const newParent = activeBoard.mindMapNodes.find(n => n.id === newParentId);
    if (!child || !newParent || child.id === newParent.id) return;

    // Evita ciclos (não pode reparentalizar para um de seus próprios descendentes)
    const isDescendant = (checkId: string, targetId: string): boolean => {
      const n = activeBoard.mindMapNodes.find(item => item.id === checkId);
      if (!n || !n.childrenIds) return false;
      if (n.childrenIds.includes(targetId)) return true;
      return n.childrenIds.some(cid => isDescendant(cid, targetId));
    };

    if (isDescendant(childId, newParentId)) {
      return; // Ciclo proibido
    }

    const oldParentId = child.parentId;

    updateActiveBoard(board => {
      return {
        ...board,
        mindMapNodes: board.mindMapNodes.map(n => {
          if (oldParentId && n.id === oldParentId) {
            return { ...n, childrenIds: n.childrenIds.filter(cid => cid !== childId) };
          }
          if (n.id === newParentId) {
            return { ...n, childrenIds: [...n.childrenIds, childId], collapsed: false };
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
      };
    });

    setSelectedNodeId(childId);
  };

  // ARRASTE LIVRE DE QUADRADO (OFFSET MANUAL)
  const handleMoveNodeOffset = (nodeId: string, dx: number, dy: number) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === nodeId ? {
        ...n,
        offsetX: (n.offsetX || 0) + dx / zoom,
        offsetY: (n.offsetY || 0) + dy / zoom
      } : n)
    }), false); // Não polui histórico durante arraste contínuo
  };

  // ATUALIZAR ESTILO (COR, BORDA, LINHA)
  const handleUpdateNodeStyle = (nodeId: string, updates: Partial<MindMapNode>) => {
    updateActiveBoard(board => {
      // Se mudou a cor, propaga harmoniosamente para os nós descendentes
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
  };

  // DUPLICAR NÓ
  const handleDuplicateNode = (nodeId: string) => {
    const node = activeBoard.mindMapNodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return;

    const parent = activeBoard.mindMapNodes.find(n => n.id === node.parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const duplicated: MindMapNode = {
      ...JSON.parse(JSON.stringify(node)),
      id: newId,
      text: `${node.text} (Cópia)`,
      childrenIds: [],
      offsetX: (node.offsetX || 0) + 20,
      offsetY: (node.offsetY || 0) + 40
    };

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: [
        ...board.mindMapNodes.map(n => n.id === parent.id ? {
          ...n,
          childrenIds: [...n.childrenIds, newId]
        } : n),
        duplicated
      ]
    }));

    setSelectedNodeId(newId);
  };

  // EXCLUIR NÓ E SUB-RAMOS
  const handleDeleteNode = (id: string) => {
    const rootNode = activeBoard.mindMapNodes.find(n => n.side === 'root');
    if (rootNode && id === rootNode.id) return;

    updateActiveBoard(board => {
      const toDelete = new Set<string>();
      const gather = (nodeId: string) => {
        toDelete.add(nodeId);
        const node = board.mindMapNodes.find(n => n.id === nodeId);
        if (node) {
          node.childrenIds.forEach(gather);
        }
      };
      gather(id);

      return {
        ...board,
        mindMapNodes: board.mindMapNodes
          .filter(n => !toDelete.has(n.id))
          .map(n => ({
            ...n,
            childrenIds: n.childrenIds.filter(cid => !toDelete.has(cid))
          }))
      };
    });

    setSelectedNodeId(null);
  };

  // BOTÃO PRINCIPAL DA TOOLBAR (+ Quadrado com Linha)
  const handleAddConnectedNode = () => {
    if (selectedNodeId) {
      handleAddChildNode(selectedNodeId);
    } else {
      const rootNode = activeBoard.mindMapNodes.find(n => n.side === 'root') || activeBoard.mindMapNodes[0];
      if (rootNode) {
        handleAddChildNode(rootNode.id);
      }
    }
  };

  // IA: Inserir ramos gerados
  const handleAddGeneratedBranches = (parentId: string, branchTexts: string[]) => {
    const parent = activeBoard.mindMapNodes.find(n => n.id === parentId);
    if (!parent) return;

    let branchColor = parent.color;
    if (parent.side === 'root' || !branchColor) {
      branchColor = EXECUTIVE_PALETTE[parent.childrenIds.length % EXECUTIVE_PALETTE.length].hex;
    }

    const newNodes: MindMapNode[] = [];
    const newIds: string[] = [];

    branchTexts.forEach((text, idx) => {
      const newId = `node-ai-${Date.now()}-${idx}`;
      newIds.push(newId);
      newNodes.push({
        id: newId,
        text,
        x: parent.x + 240,
        y: parent.y + (idx - Math.floor(branchTexts.length / 2)) * 45,
        parentId: parent.id,
        childrenIds: [],
        collapsed: false,
        color: branchColor,
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
          childrenIds: [...n.childrenIds, ...newIds],
          collapsed: false 
        } : n),
        ...newNodes
      ]
    }));
  };

  // Notas Adesivas
  const handleAddSticky = () => {
    const newSticky: StickyNote = {
      id: `sticky-${Date.now()}`,
      x: -pan.x / zoom + window.innerWidth / (2 * zoom) - 90,
      y: -pan.y / zoom + window.innerHeight / (2 * zoom) - 70,
      width: 180,
      height: 140,
      text: 'Nota de apoio...',
      color: '#fef08a'
    };
    updateActiveBoard(board => ({ ...board, stickies: [...board.stickies, newSticky] }));
    setSelectedStickyId(newSticky.id);
  };

  const handleAddWireframe = () => {
    const newWf: WireframeItem = {
      id: `wf-${Date.now()}`,
      type: 'card',
      x: -pan.x / zoom + window.innerWidth / (2 * zoom) - 120,
      y: -pan.y / zoom + window.innerHeight / (2 * zoom) - 60,
      width: 240,
      height: 120,
      label: 'Bloco de Interface'
    };
    updateActiveBoard(board => ({ ...board, wireframes: [...board.wireframes, newWf] }));
  };

  // Atalhos de Teclado (Tab, Enter, Delete, Ctrl+Z, Ctrl+Y, Espaço)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.code === 'Space' && !isInput && !isSpacePressed.current) {
        isSpacePressed.current = true;
        document.body.style.cursor = 'grab';
      }

      if (isInput) return;

      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        handleAddChildNode(selectedNodeId);
      } else if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        handleAddSiblingNode(selectedNodeId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          handleDeleteNode(selectedNodeId);
        } else if (selectedStickyId) {
          updateActiveBoard(b => ({ ...b, stickies: b.stickies.filter(s => s.id !== selectedStickyId) }));
          setSelectedStickyId(null);
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedStickyId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressed.current = false;
        document.body.style.cursor = 'default';
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeId, selectedStickyId, historyIndex, history]);

  // Pan e Zoom no Canvas
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = -e.deltaY * 0.0015;
      setZoom(prev => Math.min(Math.max(prev + zoomFactor, 0.2), 2.5));
    } else {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressed.current || currentTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (currentTool === 'draw') {
      setIsDrawing(true);
      const canvasX = (e.clientX - pan.x) / zoom;
      const canvasY = (e.clientY - pan.y) / zoom;
      currentStrokeRef.current = {
        id: `stroke-${Date.now()}`,
        points: [{ x: canvasX, y: canvasY }],
        color: '#f43f5e',
        strokeWidth: 3
      };
    } else {
      setSelectedNodeId(null);
      setSelectedStickyId(null);
    }
  };

  const handleDoubleClickCanvas = (e: React.MouseEvent) => {
    const rootNode = activeBoard.mindMapNodes.find(n => n.side === 'root') || activeBoard.mindMapNodes[0];
    if (rootNode) {
      const targetParent = selectedNodeId || rootNode.id;
      handleAddChildNode(targetParent);
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
    } else if (isDrawing && currentStrokeRef.current) {
      const canvasX = (e.clientX - pan.x) / zoom;
      const canvasY = (e.clientY - pan.y) / zoom;
      currentStrokeRef.current.points.push({ x: canvasX, y: canvasY });
      updateActiveBoard(b => ({
        ...b,
        drawings: [...b.drawings.filter(d => d.id !== currentStrokeRef.current?.id), { ...currentStrokeRef.current! }]
      }), false);
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
    setIsDrawing(false);
    currentStrokeRef.current = null;
    panStartRef.current = null;
  };

  const totalObjects = 
    activeBoard.mindMapNodes.length + 
    activeBoard.stickies.length + 
    activeBoard.wireframes.length + 
    activeBoard.drawings.length;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Navigation com Seletor de Quadros e Ações */}
      <TopNav
        boardTitle={activeBoard.title}
        onUpdateTitle={(title) => updateActiveBoard(b => ({ ...b, title }))}
        boards={boards}
        activeBoardId={activeBoard.id}
        onSelectBoard={setActiveBoardId}
        onCreateNewBoard={() => handleCreateNewBoard()}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onStartPresentation={() => setIsPresentationOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalObjects={totalObjects}
        canUndo={historyIndex >= 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Painel Lateral com Lista de Projetos */}
        <Sidebar
          isOpen={sidebarOpen}
          boards={boards}
          activeBoardId={activeBoard.id}
          onSelectBoard={setActiveBoardId}
          onCreateBoard={handleCreateNewBoard}
          onDuplicateBoard={handleDuplicateBoard}
          onDeleteBoard={handleDeleteBoard}
          onRenameBoard={(id, newTitle) => {
            setBoards(prev => prev.map(b => b.id === id ? { ...b, title: newTitle, updatedAt: new Date().toISOString() } : b));
          }}
        />

        {/* Toolbar Flutuante */}
        <Toolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          onAddConnectedNode={handleAddConnectedNode}
          onAddSticky={handleAddSticky}
          onAddWireframe={handleAddWireframe}
          onAddText={() => handleAddSticky()}
          onStartPresentation={() => setIsPresentationOpen(true)}
          onOpenAI={() => setIsAIModalOpen(true)}
        />

        {/* Canvas Principal */}
        <div
          id="main-canvas-area"
          className={`canvas-container ${isPanning || currentTool === 'hand' ? 'panning' : currentTool === 'draw' ? 'drawing' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDownCanvas}
          onDoubleClick={handleDoubleClickCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
        >
          {/* Fundo Pontilhado */}
          <div className="canvas-background" />

          {/* Camada Espacial do Canvas */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform'
            }}
          >
            {/* Traços Livres */}
            <FreehandCanvas drawings={activeBoard.drawings} />

            {/* Mapa Mental com Layout Responsivo Automático e Arraste para Mudar de Setor */}
            <MindMapCanvas
              nodes={activeBoard.mindMapNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onUpdateNodeText={handleUpdateNodeText}
              onToggleCollapse={handleToggleCollapse}
              onAddChildNode={handleAddChildNode}
              onAddSiblingNode={handleAddSiblingNode}
              onDeleteNode={handleDeleteNode}
              onReorderNode={handleReorderNode}
              onReparentNode={handleReparentNode}
              onUpdateNodeStyle={handleUpdateNodeStyle}
              onDuplicateNode={handleDuplicateNode}
              pan={pan}
              zoom={zoom}
            />

            {/* Notas Adesivas */}
            <StickyNotesCanvas
              stickies={activeBoard.stickies}
              selectedId={selectedStickyId}
              onSelect={setSelectedStickyId}
              onUpdateText={(id, text) => updateActiveBoard(b => ({
                ...b,
                stickies: b.stickies.map(s => s.id === id ? { ...s, text } : s)
              }))}
              onMove={(id, dx, dy) => updateActiveBoard(b => ({
                ...b,
                stickies: b.stickies.map(s => s.id === id ? { ...s, x: s.x + dx / zoom, y: s.y + dy / zoom } : s)
              }))}
              onDelete={(id) => updateActiveBoard(b => ({
                ...b,
                stickies: b.stickies.filter(s => s.id !== id)
              }))}
            />
          </div>
        </div>

        {/* Controles de Zoom */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 2.5))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.2))}
          onResetZoom={() => {
            setZoom(1.0);
            setPan({ x: 300, y: 350 });
          }}
          onOpenAI={() => setIsAIModalOpen(true)}
        />
      </div>

      {/* Modal IA */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        selectedNode={activeBoard.mindMapNodes.find(n => n.id === selectedNodeId) || null}
        onAddGeneratedBranches={handleAddGeneratedBranches}
      />

      {/* Modal Compartilhar e Exportar */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeBoard={activeBoard}
      />

      {/* Modo Apresentação */}
      {isPresentationOpen && (
        <PresentationView
          board={activeBoard}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
    </div>
  );
};
