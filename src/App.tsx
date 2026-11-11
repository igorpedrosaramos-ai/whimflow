import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignStartVertical, 
  AlignVerticalDistributeCenter,
  Copy, 
  Trash2 
} from 'lucide-react';
import { 
  Board, 
  ToolType, 
  MindMapNode, 
  StickyNote, 
  WireframeItem, 
  DrawingStroke, 
  SlideSection, 
  FlowShape, 
  ShapeType, 
  TextItem,
  Connector 
} from './types';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MindMapCanvas } from './components/MindMapCanvas';
import { StickyNotesCanvas } from './components/StickyNotesCanvas';
import { FreehandCanvas } from './components/FreehandCanvas';
import { FlowchartCanvas } from './components/FlowchartCanvas';
import { ZoomControls } from './components/ZoomControls';
import { ShareModal } from './components/ShareModal';
import { PresentationView } from './components/PresentationView';
import { DashboardView } from './components/DashboardView';
import { DocEditorView } from './components/DocEditorView';
import { AgentChatView } from './components/AgentChatView';
import { TemplateModal } from './components/TemplateModal';
import { PresentSidePanel } from './components/PresentSidePanel';
import { SearchModal } from './components/SearchModal';
import { AgentDrawer } from './components/AgentDrawer';
import { TrashModal } from './components/TrashModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { BoardStatsModal } from './components/BoardStatsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { QuickSparkModal } from './components/QuickSparkModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { TemplateItem } from './constants/templatesData';
import { calculateMindMapLayout } from './utils/treeLayout';
import { useCanvasNavigation } from './hooks/useCanvasNavigation';
import { useBoardStorage } from './hooks/useBoardStorage';
import { useBoardOperations } from './hooks/useBoardOperations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { saveCurrentView, loadCurrentView, THEME_KEY } from './services/storageService';

export const App: React.FC = () => {
  useEffect(() => {
    document.title = 'Mapa Mental Turbine';
  }, []);

  // Roteamento de Visualização: 'dashboard' | 'editor' | 'doc' | 'agent'
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'doc' | 'agent'>(() => {
    const saved = loadCurrentView();
    if (saved === 'dashboard' || saved === 'editor' || saved === 'doc' || saved === 'agent') {
      return saved as 'dashboard' | 'editor' | 'doc' | 'agent';
    }
    return 'dashboard';
  });

  useEffect(() => {
    saveCurrentView(currentView);
  }, [currentView]);

  // Tema
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Ferramentas e Interface
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Seleções
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(['root']);
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Modais e Painéis
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPresentSidePanelOpen, setIsPresentSidePanelOpen] = useState(false);
  const [trashBoards, setTrashBoards] = useState<Board[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isBoardStatsOpen, setIsBoardStatsOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQuickSparkOpen, setIsQuickSparkOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 1. Hook de Armazenamento e Histórico Particionado
  const {
    boards,
    setBoards,
    activeBoardId,
    setActiveBoardId,
    activeBoard,
    updateActiveBoard,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleCreateNewBoard: createBoardInStorage,
    handleOpenBoard: openBoardInStorage,
    handleDuplicateBoard,
    handleDeleteBoard,
    handleRestoreSnapshot,
    handleForkSnapshot,
    handleCreateMilestone,
    handleDeleteSnapshot
  } = useBoardStorage((target) => {
    setCurrentView('editor');
    setTimeout(() => fitView(target.mindMapNodes), 80);
  });

  // 2. Hook de Navegação Espacial no Canvas (Pan, Zoom, Fit)
  const {
    pan,
    setPan,
    zoom,
    setZoom,
    isPanning,
    setIsPanning,
    isSpacePressed,
    panStartRef,
    fitView,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom
  } = useCanvasNavigation({
    nodes: activeBoard.mindMapNodes,
    sidebarOpen,
    activeBoardId
  });

  // 3. Hook de Operações na Árvore do Mapa Mental
  const {
    handleDeleteNode,
    handleDeleteMultipleNodes,
    handleUpdateNodeText,
    handleToggleCollapse,
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
  } = useBoardOperations({
    activeBoard,
    updateActiveBoard,
    selectedNodeId,
    setSelectedNodeId,
    selectedNodeIds,
    setSelectedNodeIds,
    setEditingNodeId
  });

  // 4. Hook de Atalhos de Teclado
  useKeyboardShortcuts({
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
    handleDeleteNode,
    handleDeleteMultipleNodes,
    handleDuplicateNode,
    handleDuplicateMultipleNodes,
    updateActiveBoard,
    onToggleSearch: () => setIsSearchModalOpen(prev => !prev),
    onToggleShortcuts: () => setIsShortcutsModalOpen(prev => !prev),
    onToggleQuickSpark: () => setIsQuickSparkOpen(prev => !prev)
  });

  // Abertura de Quadro
  const handleOpenBoard = useCallback((boardId: string) => {
    openBoardInStorage(boardId);
    setCurrentView('editor');
  }, [openBoardInStorage]);

  // Criação de Quadro
  const handleCreateNewBoard = useCallback((title: string = 'Sem título') => {
    createBoardInStorage(title);
    setSelectedNodeId('root');
    setSelectedNodeIds(['root']);
    setPan({ x: 300, y: 350 });
    setZoom(1.0);
    setCurrentView('editor');
  }, [createBoardInStorage, setPan, setZoom]);

  // Criação a partir de Template
  const handleCreateFromTemplate = useCallback((template: TemplateItem) => {
    const newId = `board-${Date.now()}`;
    const newBoard: Board = {
      ...template.boardData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBoards(prev => [newBoard, ...prev]);
    setActiveBoardId(newId);
    setIsTemplateModalOpen(false);
    if (template.previewType === 'doc') {
      setCurrentView('doc');
    } else {
      setCurrentView('editor');
    }
    setTimeout(() => fitView(newBoard.mindMapNodes), 100);
  }, [fitView, setBoards, setActiveBoardId]);

  // Gestão de Seções de Apresentação
  const handleAddSection = useCallback(() => {
    const sectionId = `sec-${Date.now()}`;
    const title = selectedNodeId 
      ? (activeBoard.mindMapNodes.find(n => n.id === selectedNodeId)?.text || 'Sem título') 
      : `Seção ${(activeBoard.sections?.length || 0) + 1}`;
    const newSection: SlideSection = {
      id: sectionId,
      title,
      nodeIds: selectedNodeIds.length > 0 ? [...selectedNodeIds] : (selectedNodeId ? [selectedNodeId] : ['root'])
    };
    updateActiveBoard(b => ({
      ...b,
      sections: [...(b.sections || []), newSection]
    }));
  }, [activeBoard, selectedNodeId, selectedNodeIds, updateActiveBoard]);

  const handleDeleteSection = useCallback((secId: string) => {
    updateActiveBoard(b => ({
      ...b,
      sections: (b.sections || []).filter(s => s.id !== secId)
    }));
  }, [updateActiveBoard]);

  // Lixeira
  const handleRestoreBoard = useCallback((boardId: string) => {
    const board = trashBoards.find(b => b.id === boardId);
    if (board) {
      setBoards(prev => [board, ...prev]);
      setTrashBoards(prev => prev.filter(b => b.id !== boardId));
      showToast(`Quadro "${board.title}" restaurado com sucesso!`);
    }
  }, [trashBoards, setBoards, showToast]);

  const handlePermanentlyDeleteBoard = useCallback((boardId: string) => {
    setTrashBoards(prev => prev.filter(b => b.id !== boardId));
    showToast('Quadro excluído permanentemente.');
  }, [showToast]);

  // ─── FERRAMENTAS DO MAPA MENTAL E CANVAS ─────────────────────────────────────
  // 1. Conexão Transversal entre Ramos (Cross-Link)
  const handleConnectNode = useCallback((nodeId: string) => {
    if (!connectingSourceId) {
      setConnectingSourceId(nodeId);
      showToast('Tópico de origem selecionado. Clique no tópico de destino para ligar.', 'info');
    } else if (connectingSourceId === nodeId) {
      setConnectingSourceId(null);
      showToast('Conexão cancelada.', 'info');
    } else {
      const sourceId = connectingSourceId;
      const targetId = nodeId;
      const newConnector: Connector = {
        id: `conn-${Date.now()}`,
        fromId: sourceId,
        toId: targetId,
        label: 'relação',
        color: '#6366f1',
        style: 'curve'
      };
      updateActiveBoard(b => ({
        ...b,
        connectors: [...(b.connectors || []), newConnector]
      }));
      setConnectingSourceId(null);
      setCurrentTool('select');
      showToast('Conexão transversal criada entre os tópicos!', 'success');
    }
  }, [connectingSourceId, updateActiveBoard, showToast]);

  const handleDeleteConnector = useCallback((id: string) => {
    updateActiveBoard(b => ({
      ...b,
      connectors: (b.connectors || []).filter(c => c.id !== id)
    }));
    showToast('Conexão excluída.');
  }, [updateActiveBoard, showToast]);

  const handleUpdateConnectorLabel = useCallback((id: string, label: string) => {
    updateActiveBoard(b => ({
      ...b,
      connectors: (b.connectors || []).map(c => c.id === id ? { ...c, label } : c)
    }));
  }, [updateActiveBoard]);

  // 2. Novo Tópico Independente no Mapa Mental (Substitui o antigo 'Novo Bloco' desconectado)
  const handleAddFloatingTopic = useCallback((customX?: number, customY?: number) => {
    let targetX = customX;
    let targetY = customY;

    if (targetX === undefined || targetY === undefined) {
      let maxX = 0;
      activeBoard.mindMapNodes.forEach(n => {
        if ((n.x || 0) > maxX) maxX = n.x || 0;
      });
      targetX = maxX > 0 ? maxX + 280 : 350;
      targetY = 0;
    }

    const newId = `topic-${Date.now()}`;
    const newFloatingNode: MindMapNode = {
      id: newId,
      text: 'Novo Tópico',
      x: targetX,
      y: targetY,
      offsetX: 0,
      offsetY: 0,
      parentId: null,
      childrenIds: [],
      collapsed: false,
      color: '#7c3aed',
      borderStyle: 'fill',
      lineStyle: 'bezier',
      side: 'root'
    };

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: [...board.mindMapNodes, newFloatingNode]
    }));
    setSelectedNodeId(newId);
    setSelectedNodeIds([newId]);
    setEditingNodeId(newId);
    showToast('Novo tópico independente criado com sucesso.');
  }, [activeBoard.mindMapNodes, updateActiveBoard, setSelectedNodeId, setSelectedNodeIds, setEditingNodeId, showToast]);

  // 3. Nota Adesiva (Post-it) com Posicionamento Inteligente sem Sobreposição
  const handleAddSticky = useCallback((customX?: number, customY?: number) => {
    let targetX = customX;
    let targetY = customY;

    if (targetX === undefined || targetY === undefined) {
      let maxX = 50;
      activeBoard.mindMapNodes.forEach(n => {
        if ((n.x || 0) > maxX) maxX = n.x || 0;
      });
      targetX = maxX > 100 ? maxX + 260 : 300;
      targetY = 120;
    }

    const newSticky: StickyNote = {
      id: `sticky-${Date.now()}`,
      x: targetX,
      y: targetY,
      width: 180,
      height: 140,
      text: 'Nota de apoio...',
      color: '#fef08a'
    };
    updateActiveBoard(board => ({ ...board, stickies: [...(board.stickies || []), newSticky] }));
    setSelectedStickyId(newSticky.id);
    showToast('Nota adesiva posicionada.');
  }, [activeBoard.mindMapNodes, updateActiveBoard, showToast]);

  // 4. Caixa de Texto Livre com Posicionamento Inteligente
  const handleAddText = useCallback((customX?: number, customY?: number) => {
    let targetX = customX;
    let targetY = customY;

    if (targetX === undefined || targetY === undefined) {
      let maxX = 50;
      activeBoard.mindMapNodes.forEach(n => {
        if ((n.x || 0) > maxX) maxX = n.x || 0;
      });
      targetX = maxX > 100 ? maxX + 260 : 300;
      targetY = 40;
    }

    const newText: TextItem = {
      id: `text-${Date.now()}`,
      x: targetX,
      y: targetY,
      width: 160,
      height: 36,
      text: 'Texto livre...',
      fontSize: 16,
      color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
    };
    updateActiveBoard(board => ({ ...board, texts: [...(board.texts || []), newText] }));
    setSelectedShapeId(newText.id);
    showToast('Caixa de texto criada.');
  }, [activeBoard.mindMapNodes, theme, updateActiveBoard, showToast]);

  // Compatibilidade legada para testes e fluxogramas
  const handleAddShape = useCallback((type: ShapeType = 'rounded', customX?: number, customY?: number) => {
    handleAddFloatingTopic(customX, customY);
  }, [handleAddFloatingTopic]);

  const handleAddWireframe = useCallback((type: any = 'card', customX?: number, customY?: number) => {
    const newWf: WireframeItem = {
      id: `wf-${Date.now()}`,
      type,
      x: customX !== undefined ? customX : 300,
      y: customY !== undefined ? customY : 180,
      width: 240,
      height: 120,
      label: 'Bloco de Interface'
    };
    updateActiveBoard(board => ({ ...board, wireframes: [...(board.wireframes || []), newWf] }));
    setSelectedShapeId(newWf.id);
    showToast('Wireframe adicionado');
  }, [updateActiveBoard, showToast]);

  // Caneta / Desenho Livre
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);

  // Retângulo de Seleção Múltipla (Lasso / Marquee)
  const [marqueeRect, setMarqueeRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const isMarqueeActiveRef = useRef(false);

  useEffect(() => {
    let rAFId: number | null = null;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isMarqueeActiveRef.current || !marqueeStartRef.current) return;

      const startX = marqueeStartRef.current.x;
      const startY = marqueeStartRef.current.y;
      const curX = e.clientX;
      const curY = e.clientY;

      const dx = Math.abs(curX - startX);
      const dy = Math.abs(curY - startY);
      if (dx <= 4 && dy <= 4) return;

      const x1 = Math.min(startX, curX);
      const y1 = Math.min(startY, curY);
      const x2 = Math.max(startX, curX);
      const y2 = Math.max(startY, curY);

      setMarqueeRect({ x1, y1, x2, y2 });

      // Otimização de Performance: Cálculo matemático direto no espaço do canvas
      // Zero Layout Thrashing (zero getBoundingClientRect) com throttle via requestAnimationFrame
      if (rAFId !== null) cancelAnimationFrame(rAFId);

      rAFId = requestAnimationFrame(() => {
        const canvasX1 = (x1 - pan.x) / zoom;
        const canvasY1 = (y1 - pan.y) / zoom;
        const canvasX2 = (x2 - pan.x) / zoom;
        const canvasY2 = (y2 - pan.y) / zoom;

        const hitIds: string[] = [];
        activeBoard.mindMapNodes.forEach(node => {
          const nw = node.width || 180;
          const nh = node.height || 42;
          const nx = (node.x || 0) + (node.offsetX || 0);
          const ny = (node.y || 0) + (node.offsetY || 0);

          if (nx + nw >= canvasX1 && nx <= canvasX2 && ny + nh >= canvasY1 && ny <= canvasY2) {
            hitIds.push(node.id);
          }
        });

        setSelectedNodeIds(hitIds);
        if (hitIds.length === 1) {
          setSelectedNodeId(hitIds[0]);
        } else if (hitIds.length === 0) {
          setSelectedNodeId(null);
        }
      });
    };

    const handleWindowMouseUp = () => {
      if (rAFId !== null) {
        cancelAnimationFrame(rAFId);
        rAFId = null;
      }
      if (isMarqueeActiveRef.current) {
        if (!marqueeRect) {
          setSelectedNodeId(null);
          setSelectedNodeIds([]);
          setSelectedStickyId(null);
          setSelectedShapeId(null);
        }
        isMarqueeActiveRef.current = false;
        marqueeStartRef.current = null;
        setMarqueeRect(null);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      if (rAFId !== null) cancelAnimationFrame(rAFId);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [marqueeRect, activeBoard.mindMapNodes, pan, zoom]);

  // Eventos de Mouse no Canvas
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      '.mindmap-node-card, .sticky-note, .flowchart-shape, .node-context-menu, .toolbar-container, .top-nav, button, input, textarea, a'
    );
    const isCanvasBg = !isInteractive;

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
    } else if (currentTool === 'sticky' && isCanvasBg) {
      const canvasX = (e.clientX - pan.x) / zoom;
      const canvasY = (e.clientY - pan.y) / zoom;
      handleAddSticky(canvasX - 90, canvasY - 70);
      setCurrentTool('select');
    } else if (currentTool === 'text' && isCanvasBg) {
      const canvasX = (e.clientX - pan.x) / zoom;
      const canvasY = (e.clientY - pan.y) / zoom;
      handleAddText(canvasX - 60, canvasY - 15);
      setCurrentTool('select');
    } else if (currentTool === 'connect' && isCanvasBg) {
      if (connectingSourceId) {
        setConnectingSourceId(null);
        showToast('Conexão cancelada.', 'info');
      }
    } else if (currentTool === 'wireframe' && isCanvasBg) {
      const canvasX = (e.clientX - pan.x) / zoom;
      const canvasY = (e.clientY - pan.y) / zoom;
      handleAddWireframe('card', canvasX - 120, canvasY - 60);
      setCurrentTool('select');
    } else if (e.button === 0 && isCanvasBg) {
      isMarqueeActiveRef.current = true;
      marqueeStartRef.current = { x: e.clientX, y: e.clientY };
      setMarqueeRect(null);
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isDrawing && currentStrokeRef.current) {
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
    setIsDrawing(false);
    currentStrokeRef.current = null;
  };

  // Criação a partir do Agente IA
  const handleGenerateFromAgent = (prompt: string, title?: string, nodes?: MindMapNode[]) => {
    const newBoardId = `board-agent-${Date.now()}`;
    const boardTitle = title || (prompt.length > 25 ? prompt.slice(0, 25) + '...' : prompt) || 'Sem título';
    const newBoard: Board = {
      id: newBoardId,
      title: boardTitle,
      workspaceId: 'ws-default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mindMapNodes: nodes && nodes.length > 0 ? nodes : [
        {
          id: 'root',
          text: boardTitle,
          x: 0,
          y: 0,
          width: 220,
          height: 48,
          parentId: null,
          childrenIds: [],
          color: '#7c3aed',
          borderStyle: 'fill',
          lineStyle: 'stepped',
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
    setCurrentView('editor');
    setTimeout(() => fitView(newBoard.mindMapNodes), 100);
  };

  // Alinhamento em Lote dos Nós com Cálculo Geométrico e Fixação de Coordenadas Visuais
  const handleBatchAlignNodes = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-v' | 'distribute-h') => {
    if (selectedNodeIds.length <= 1) return;
    updateActiveBoard(board => {
      // 1. Obter posições visuais REAIS de todos os nós na tela no momento do clique
      const layoutMap = calculateMindMapLayout(board.mindMapNodes, 'root', {
        layoutType: board.layoutType,
        horizontalGap: 100,
        verticalGap: board.layoutType === 'orgchart' ? 56 : 18,
        rootX: 0,
        rootY: 0
      });

      // Mapeamento das posições visuais atuais de cada nó
      const visualPositions = new Map<string, { x: number; y: number; width: number; height: number }>();
      board.mindMapNodes.forEach(n => {
        const computed = layoutMap.get(n.id);
        const curX = (computed ? computed.x : (n.x || 0)) + (n.offsetX || 0);
        const curY = (computed ? computed.y : (n.y || 0)) + (n.offsetY || 0);
        const curW = computed ? computed.width : (n.width || 140);
        const curH = computed ? computed.height : (n.height || 40);
        visualPositions.set(n.id, { x: curX, y: curY, width: curW, height: curH });
      });

      const selectedNodes = board.mindMapNodes.filter(n => selectedNodeIds.includes(n.id) && n.side !== 'root');
      if (selectedNodes.length <= 1) return board;

      const selectedPosList = selectedNodes.map(n => ({
        id: n.id,
        node: n,
        ...visualPositions.get(n.id)!
      }));

      const targetPosMap = new Map<string, { x?: number; y?: number }>();

      if (alignment === 'left') {
        const minX = Math.min(...selectedPosList.map(p => p.x));
        selectedPosList.forEach(p => {
          targetPosMap.set(p.id, { x: Math.round(minX) });
        });
      } else if (alignment === 'center') {
        const minX = Math.min(...selectedPosList.map(p => p.x));
        const maxX = Math.max(...selectedPosList.map(p => p.x + p.width));
        const centerX = (minX + maxX) / 2;
        selectedPosList.forEach(p => {
          targetPosMap.set(p.id, { x: Math.round(centerX - p.width / 2) });
        });
      } else if (alignment === 'right') {
        const maxX = Math.max(...selectedPosList.map(p => p.x + p.width));
        selectedPosList.forEach(p => {
          targetPosMap.set(p.id, { x: Math.round(maxX - p.width) });
        });
      } else if (alignment === 'top') {
        const minY = Math.min(...selectedPosList.map(p => p.y));
        selectedPosList.forEach(p => {
          targetPosMap.set(p.id, { y: Math.round(minY) });
        });
      } else if (alignment === 'middle') {
        const minY = Math.min(...selectedPosList.map(p => p.y));
        const maxY = Math.max(...selectedPosList.map(p => p.y + p.height));
        const centerY = (minY + maxY) / 2;
        selectedPosList.forEach(p => {
          targetPosMap.set(p.id, { y: Math.round(centerY - p.height / 2) });
        });
      } else if (alignment === 'bottom') {
        const maxY = Math.max(...selectedPosList.map(p => p.y + p.height));
        selectedPosList.forEach(p => {
          targetPosMap.set(p.id, { y: Math.round(maxY - p.height) });
        });
      } else if (alignment === 'distribute-v') {
        const sorted = [...selectedPosList].sort((a, b) => a.y - b.y);
        const firstY = sorted[0].y;
        const lastY = sorted[sorted.length - 1].y;
        const totalSpan = lastY - firstY;
        const step = sorted.length > 1 ? totalSpan / (sorted.length - 1) : 0;
        sorted.forEach((p, idx) => {
          targetPosMap.set(p.id, { y: Math.round(firstY + idx * step) });
        });
      } else if (alignment === 'distribute-h') {
        const sorted = [...selectedPosList].sort((a, b) => a.x - b.x);
        const firstX = sorted[0].x;
        const lastX = sorted[sorted.length - 1].x;
        const totalSpan = lastX - firstX;
        const step = sorted.length > 1 ? totalSpan / (sorted.length - 1) : 0;
        sorted.forEach((p, idx) => {
          targetPosMap.set(p.id, { x: Math.round(firstX + idx * step) });
        });
      }

      // 2. Aplica as novas posições e fixa as posições visuais de todos os nós existentes
      const newMindMapNodes = board.mindMapNodes.map(n => {
        const cur = visualPositions.get(n.id) || { x: n.x || 0, y: n.y || 0, width: n.width || 140, height: n.height || 40 };
        const target = targetPosMap.get(n.id);
        const finalX = target && target.x !== undefined ? target.x : cur.x;
        const finalY = target && target.y !== undefined ? target.y : cur.y;

        return {
          ...n,
          x: finalX,
          y: finalY,
          width: cur.width,
          height: cur.height,
          offsetX: 0,
          offsetY: 0
        };
      });

      return {
        ...board,
        layoutType: 'free', // Muda para layout livre para que o alinhamento manual persista com fidelidade
        mindMapNodes: newMindMapNodes
      };
    });

    const alignLabels: Record<string, string> = {
      'left': 'à esquerda',
      'center': 'ao centro',
      'right': 'à direita',
      'top': 'ao topo',
      'middle': 'ao meio',
      'bottom': 'à base',
      'distribute-v': 'com distribuição vertical uniforme',
      'distribute-h': 'com distribuição horizontal uniforme'
    };
    showToast(`Nós alinhados ${alignLabels[alignment] || ''} com sucesso.`);
  };

  const totalObjects = (activeBoard.mindMapNodes?.length || 0) + 
    (activeBoard.shapes?.length || 0) + 
    (activeBoard.stickies?.length || 0) + 
    (activeBoard.wireframes?.length || 0) + 
    (activeBoard.texts?.length || 0) + 
    (activeBoard.drawings?.length || 0);

  const currentBoardSnapshots = activeBoard.historySnapshots || [];

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 1. Visão de Dashboard */}
      {currentView === 'dashboard' && (
        <DashboardView
          boards={boards}
          onOpenBoard={handleOpenBoard}
          onCreateNewBoard={(title) => handleCreateNewBoard(title || 'Sem título')}
          onOpenDoc={() => setCurrentView('doc')}
          onOpenAskAgent={() => setIsAgentDrawerOpen(true)}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onDuplicateBoard={handleDuplicateBoard}
          onDeleteBoard={(id) => {
            const boardToTrash = boards.find(b => b.id === id);
            if (boardToTrash) {
              setTrashBoards(prev => [boardToTrash, ...prev]);
              handleDeleteBoard(id);
              showToast(`"${boardToTrash.title}" movido para a lixeira.`);
            }
          }}
          onRenameBoard={(id, newTitle) => {
            setBoards(prev => prev.map(b => b.id === id ? { ...b, title: newTitle, updatedAt: new Date().toISOString() } : b));
          }}
          onOpenTrash={() => setIsTrashModalOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onOpenQuickSpark={() => setIsQuickSparkOpen(true)}
          theme={theme}
          workspaceName="teste"
        />
      )}

      {/* 2. Visão de Documentos (Doc Editor) */}
      {currentView === 'doc' && (
        <DocEditorView
          board={activeBoard}
          onUpdateTitle={(title) => updateActiveBoard(b => ({ ...b, title }))}
          onUpdateDocContent={(docContent) => updateActiveBoard(b => ({ ...b, docContent }), false)}
          onUpdateDiscussions={(discussions) => updateActiveBoard(b => ({ ...b, discussions }))}
          onToggleFavorite={() => {
            const next = !activeBoard.isStarred;
            updateActiveBoard(b => ({ ...b, isStarred: next }));
            showToast(next ? 'Documento favoritado!' : 'Documento removido dos favoritos.', 'info');
          }}
          onConvertToMindMap={(title, nodes) => {
            handleGenerateFromAgent(title, title, nodes);
          }}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onShowToast={showToast}
          theme={theme}
          workspaceName="teste"
        />
      )}

      {/* 3. Visão do Agente IA em Tela Cheia */}
      {currentView === 'agent' && (
        <AgentChatView
          onGenerateBoard={handleGenerateFromAgent}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
          theme={theme}
          workspaceName="teste"
        />
      )}

      {/* 4. Modo de Apresentação */}
      {isPresentationOpen && (
        <PresentationView
          board={activeBoard}
          initialSelectedNodeId={selectedNodeId}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}

      {/* 5. Visão Principal de Editor Canvas */}
      {currentView === 'editor' && !isPresentationOpen && (
        <>
          <TopNav
            boardTitle={activeBoard.title}
            onUpdateTitle={(title) => updateActiveBoard(b => ({ ...b, title }))}
            boards={boards}
            activeBoardId={activeBoard.id}
            onSelectBoard={handleOpenBoard}
            onCreateNewBoard={() => handleCreateNewBoard('Sem título')}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenShare={() => setIsShareModalOpen(true)}
            onStartPresentation={() => setIsPresentationOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            totalObjects={totalObjects}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenAgent={() => setIsAgentDrawerOpen(true)}
            onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            onOpenBoardStats={() => setIsBoardStatsOpen(true)}
            isStarred={!!activeBoard.isStarred}
            onToggleFavorite={() => {
              const nextVal = !activeBoard.isStarred;
              updateActiveBoard(b => ({ ...b, isStarred: nextVal }));
              showToast(nextVal ? 'Quadro adicionado aos favoritos!' : 'Quadro removido dos favoritos.', 'info');
            }}
            workspaceName="teste"
          />

          <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <Sidebar
          isOpen={sidebarOpen}
          boards={boards}
          activeBoardId={activeBoard.id}
          onSelectBoard={handleOpenBoard}
          onCreateBoard={handleCreateNewBoard}
          onDuplicateBoard={handleDuplicateBoard}
          onDeleteBoard={(id) => {
            const boardToTrash = boards.find(b => b.id === id);
            if (boardToTrash) {
              setTrashBoards(prev => [boardToTrash, ...prev]);
              handleDeleteBoard(id);
              showToast(`"${boardToTrash.title}" movido para a lixeira.`);
            }
          }}
          onRenameBoard={(id, newTitle) => {
            setBoards(prev => prev.map(b => b.id === id ? { ...b, title: newTitle, updatedAt: new Date().toISOString() } : b));
          }}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onOpenTrash={() => setIsTrashModalOpen(true)}
          workspaceName="teste"
        />

        {/* Canvas Principal com Toolbar Flutuante Embutida */}
        <div
          id="main-canvas-area"
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          className={`canvas-container ${isPanning || currentTool === 'hand' ? 'panning' : currentTool === 'draw' ? 'drawing' : currentTool === 'connect' ? 'connecting' : currentTool === 'sticky' ? 'sticky-mode' : currentTool === 'text' ? 'text-mode' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDownCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
        >
          <Toolbar
            currentTool={currentTool}
            onSelectTool={setCurrentTool}
            onAddConnectedNode={handleAddConnectedNode}
            onAddFloatingTopic={() => handleAddFloatingTopic()}
            onAddSticky={() => handleAddSticky()}
            onAddWireframe={() => handleAddWireframe()}
            onAddText={() => handleAddText()}
            onStartPresentation={() => setIsPresentationOpen(true)}
            onOpenAI={() => setIsAgentDrawerOpen(true)}
            onTogglePresentPanel={() => setIsPresentSidePanelOpen(prev => !prev)}
            onAddShape={() => handleAddFloatingTopic()}
          />

          <div className="canvas-background" />

          {/* Camada Espacial Transformada do Canvas */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform'
            }}
          >
            <FreehandCanvas drawings={activeBoard.drawings} />

            <MindMapCanvas
              nodes={activeBoard.mindMapNodes}
              connectors={activeBoard.connectors || []}
              currentTool={currentTool}
              connectingSourceId={connectingSourceId}
              onConnectNode={handleConnectNode}
              onDeleteConnector={handleDeleteConnector}
              onUpdateConnectorLabel={handleUpdateConnectorLabel}
              selectedNodeId={selectedNodeId}
              selectedNodeIds={selectedNodeIds}
              editingNodeId={editingNodeId}
              layoutType={activeBoard.layoutType}
              onClearEditingNodeId={() => setEditingNodeId(null)}
              onSelectNode={(id) => {
                setSelectedNodeId(id);
                setSelectedNodeIds(id ? [id] : []);
              }}
              onSelectMultipleNodes={(ids) => {
                setSelectedNodeIds(ids);
                setSelectedNodeId(ids.length === 1 ? ids[0] : null);
              }}
              onUpdateNodeText={handleUpdateNodeText}
              onToggleCollapse={handleToggleCollapse}
              onAddChildNode={handleAddChildNode}
              onAddSiblingNode={handleAddSiblingNode}
              onAddSiblingAboveNode={handleAddSiblingAboveNode}
              onAddParentNode={handleAddParentNode}
              onDeleteNode={handleDeleteNode}
              onDeleteMultipleNodes={handleDeleteMultipleNodes}
              onDuplicateMultipleNodes={handleDuplicateMultipleNodes}
              onReorderNode={handleReorderNode}
              onReparentNode={handleReparentNode}
              onReorderInsertNode={handleReorderInsertNode}
              onUpdateNodeStyle={handleUpdateNodeStyle}
              onDuplicateNode={handleDuplicateNode}
              pan={pan}
              zoom={zoom}
            />

            <StickyNotesCanvas
              stickies={activeBoard.stickies || []}
              selectedId={selectedStickyId}
              onSelect={setSelectedStickyId}
              onUpdateText={(id, text) => updateActiveBoard(b => ({
                ...b,
                stickies: (b.stickies || []).map(s => s.id === id ? { ...s, text } : s)
              }))}
              onMove={(id, dx, dy) => updateActiveBoard(b => ({
                ...b,
                stickies: (b.stickies || []).map(s => s.id === id ? { ...s, x: s.x + dx / zoom, y: s.y + dy / zoom } : s)
              }))}
              onDelete={(id) => updateActiveBoard(b => ({
                ...b,
                stickies: (b.stickies || []).filter(s => s.id !== id)
              }))}
            />

            <FlowchartCanvas
              shapes={activeBoard.shapes || []}
              wireframes={activeBoard.wireframes || []}
              texts={activeBoard.texts || []}
              selectedId={selectedShapeId}
              onSelect={setSelectedShapeId}
              onUpdateShapeText={(id, text) => updateActiveBoard(b => ({
                ...b,
                shapes: (b.shapes || []).map(s => s.id === id ? { ...s, text } : s)
              }))}
              onMoveShape={(id, dx, dy) => updateActiveBoard(b => ({
                ...b,
                shapes: (b.shapes || []).map(s => s.id === id ? { ...s, x: s.x + dx / zoom, y: s.y + dy / zoom } : s)
              }))}
              onDeleteShape={(id) => updateActiveBoard(b => ({
                ...b,
                shapes: (b.shapes || []).filter(s => s.id !== id)
              }))}
              onMoveWireframe={(id, dx, dy) => updateActiveBoard(b => ({
                ...b,
                wireframes: (b.wireframes || []).map(w => w.id === id ? { ...w, x: w.x + dx / zoom, y: w.y + dy / zoom } : w)
              }))}
              onDeleteWireframe={(id) => updateActiveBoard(b => ({
                ...b,
                wireframes: (b.wireframes || []).filter(w => w.id !== id)
              }))}
              onUpdateText={(id, text) => updateActiveBoard(b => ({
                ...b,
                texts: (b.texts || []).map(t => t.id === id ? { ...t, text } : t)
              }))}
              onMoveText={(id, dx, dy) => updateActiveBoard(b => ({
                ...b,
                texts: (b.texts || []).map(t => t.id === id ? { ...t, x: t.x + dx / zoom, y: t.y + dy / zoom } : t)
              }))}
              onDeleteText={(id) => updateActiveBoard(b => ({
                ...b,
                texts: (b.texts || []).filter(t => t.id !== id)
              }))}
            />
          </div>
        </div>

        {/* Retângulo de Seleção Múltipla Lasso */}
        {marqueeRect && (
          <div
            style={{
              position: 'fixed',
              left: `${marqueeRect.x1}px`,
              top: `${marqueeRect.y1}px`,
              width: `${marqueeRect.x2 - marqueeRect.x1}px`,
              height: `${marqueeRect.y2 - marqueeRect.y1}px`,
              border: '1.5px solid var(--accent-purple, #6366f1)',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              borderRadius: '3px',
              pointerEvents: 'none',
              zIndex: 1000
            }}
          />
        )}

        {/* Barra Flutuante de Ações para Seleção Múltipla */}
        {selectedNodeIds.length > 1 && (
          <div className="batch-actions-toolbar" id="batch-actions-toolbar">
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '13px', padding: '0 4px', userSelect: 'none' }}>
              {selectedNodeIds.length} nós selecionados
            </span>

            <div className="batch-divider" />

            <button
              id="btn-batch-duplicate"
              className="batch-action-btn duplicate"
              onClick={() => handleDuplicateMultipleNodes(selectedNodeIds)}
              title="Duplicar nós selecionados (Ctrl+D)"
            >
              <Copy size={14} />
              <span>Duplicar (Ctrl+D)</span>
            </button>

            <div className="batch-divider" />

            {/* Alinhamento Horizontal */}
            <button
              id="btn-batch-align-left"
              className="batch-action-btn"
              onClick={() => handleBatchAlignNodes('left')}
              title="Alinhar nós selecionados à esquerda"
            >
              <AlignLeft size={15} />
              <span>Alinhar à Esquerda</span>
            </button>

            <button
              id="btn-batch-align-center"
              className="batch-action-btn"
              onClick={() => handleBatchAlignNodes('center')}
              title="Centralizar nós selecionados horizontalmente"
            >
              <AlignCenter size={15} />
              <span>Centralizar</span>
            </button>

            <button
              id="btn-batch-align-right"
              className="batch-action-btn"
              onClick={() => handleBatchAlignNodes('right')}
              title="Alinhar nós selecionados à direita"
            >
              <AlignRight size={15} />
              <span>Alinhar à Direita</span>
            </button>

            <div className="batch-divider" />

            {/* Alinhamento Vertical e Distribuição */}
            <button
              id="btn-batch-align-top"
              className="batch-action-btn"
              onClick={() => handleBatchAlignNodes('top')}
              title="Alinhar nós selecionados ao topo"
            >
              <AlignStartVertical size={15} />
              <span>Ao Topo</span>
            </button>

            <button
              id="btn-batch-distribute-v"
              className="batch-action-btn"
              onClick={() => handleBatchAlignNodes('distribute-v')}
              title="Distribuir nós com espaçamento vertical uniforme"
            >
              <AlignVerticalDistributeCenter size={15} />
              <span>Distribuir Vertical</span>
            </button>

            <div className="batch-divider" />

            <button
              id="btn-batch-delete"
              className="batch-action-btn danger"
              onClick={() => handleDeleteMultipleNodes(selectedNodeIds)}
              title="Excluir nós selecionados"
            >
              <Trash2 size={14} />
              <span>Excluir</span>
            </button>
          </div>
        )}

        {/* Painel Lateral de Apresentação (Seções / Slides) */}
        <PresentSidePanel
          isOpen={isPresentSidePanelOpen}
          onClose={() => setIsPresentSidePanelOpen(false)}
          sections={activeBoard.sections || []}
          onAddSection={handleAddSection}
          onSelectSection={(secId) => {
            const sec = (activeBoard.sections || []).find(s => s.id === secId);
            if (sec && sec.nodeIds.length > 0) {
              setSelectedNodeId(sec.nodeIds[0]);
              setSelectedNodeIds(sec.nodeIds);
            }
          }}
          onDeleteSection={handleDeleteSection}
          onStartPresentation={() => setIsPresentationOpen(true)}
          theme={theme}
        />

          <ZoomControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenQuickSpark={() => setIsQuickSparkOpen(true)}
            theme={theme}
          />
        </div>
      </>
    )}

  {/* Drawer do Agente IA Turbi */}
      {/* Drawer do Agente IA Turbi */}
      <AgentDrawer
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
        onInsertNodesToCurrentBoard={(newNodes, diagramTitle) => {
          if (!newNodes || newNodes.length === 0) return;

          let targetNodesToFit = newNodes;

          updateActiveBoard(b => {
            // Verifica se o quadro atual está vazio ou tem apenas o nó raiz em branco/padrão
            const isBoardEffectivelyEmpty = b.mindMapNodes.length <= 1 && (
              !b.mindMapNodes[0] ||
              !b.mindMapNodes[0].text ||
              !b.mindMapNodes[0].text.trim() ||
              b.mindMapNodes[0].text === 'Central Idea' ||
              b.mindMapNodes[0].text === 'Sem título' ||
              b.mindMapNodes[0].text === 'untitled'
            );

            if (isBoardEffectivelyEmpty) {
              // Substituição limpa e completa: o mapa mental da IA assume o quadro perfeitamente
              targetNodesToFit = newNodes;
              const shouldUpdateTitle = !b.title || b.title === 'Sem título' || b.title === 'untitled' || b.title === 'Quadro sem título';
              return {
                ...b,
                title: shouldUpdateTitle ? (diagramTitle || b.title) : b.title,
                mindMapNodes: newNodes
              };
            }

            // Se o quadro já possui outros nós de trabalho, adiciona como nova árvore sem colisão de IDs
            const prefix = `ai-${Date.now()}`;
            const idMap = new Map<string, string>();
            newNodes.forEach(n => idMap.set(n.id, `${prefix}-${n.id}`));

            // Calcula deslocamento horizontal para posicionar ao lado da estrutura existente
            const maxX = Math.max(...b.mindMapNodes.map(n => (n.x || 0) + (n.width || 200)), 350);
            const offsetX = maxX + 280;

            const adjustedNewNodes: MindMapNode[] = newNodes.map(n => ({
              ...n,
              id: idMap.get(n.id) || `${prefix}-${n.id}`,
              parentId: n.parentId ? (idMap.get(n.parentId) || `${prefix}-${n.parentId}`) : null,
              childrenIds: (n.childrenIds || []).map(cid => idMap.get(cid) || `${prefix}-${cid}`),
              x: (n.x || 0) + offsetX,
              side: (n.side === 'left' || n.side === 'right' || n.side === 'root') ? n.side : undefined
            }));

            targetNodesToFit = [...b.mindMapNodes, ...adjustedNewNodes];

            return {
              ...b,
              mindMapNodes: targetNodesToFit
            };
          });

          // Ajusta a câmera do canvas com visualização imediata da nova estrutura
          setTimeout(() => {
            fitView(targetNodesToFit);
          }, 100);
          showToast('Estrutura da IA inserida no canvas com sucesso!', 'success');
        }}
        onCreateNewBoardWithNodes={(title, nodes) => {
          handleGenerateFromAgent(title, title, nodes);
          showToast(`Novo quadro "${title}" criado com sucesso!`, 'success');
        }}
        theme={theme}
        workspaceName="teste"
      />

      {/* Modal de Busca Global (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        boards={boards}
        onSelectBoard={handleOpenBoard}
        theme={theme}
        workspaceName="teste"
      />

      {/* Modal de Atalhos de Teclado (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        theme={theme}
      />

      {/* Modal Whimflow Spark: Central de Criação Relâmpago e Text-to-Map */}
      <QuickSparkModal
        isOpen={isQuickSparkOpen}
        onClose={() => setIsQuickSparkOpen(false)}
        onCreateBoardWithNodes={(title, nodes) => {
          handleGenerateFromAgent(title, title, nodes);
        }}
        theme={theme}
        workspaceName="teste"
      />

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeBoard={activeBoard}
        theme={theme}
        onShowToast={showToast}
      />

      {/* Modal de Templates */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleCreateFromTemplate}
        workspaceName="teste"
      />

      {/* Modal de Histórico de Versões */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        activeBoard={activeBoard}
        snapshots={currentBoardSnapshots}
        onRestoreSnapshot={(id) => handleRestoreSnapshot(id, totalObjects)}
        onForkSnapshot={handleForkSnapshot}
        onCreateMilestone={(name, desc) => handleCreateMilestone(name, totalObjects, desc)}
        onDeleteSnapshot={handleDeleteSnapshot}
        theme={theme}
      />

      {/* Modal de Estatísticas do Quadro */}
      <BoardStatsModal
        isOpen={isBoardStatsOpen}
        onClose={() => setIsBoardStatsOpen(false)}
        board={activeBoard}
        theme={theme}
      />

      {/* Modal de Lixeira */}
      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        trashBoards={trashBoards}
        onRestoreBoard={handleRestoreBoard}
        onPermanentlyDeleteBoard={handlePermanentlyDeleteBoard}
        onEmptyTrash={() => setTrashBoards([])}
        theme={theme}
      />

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};
