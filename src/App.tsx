import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_BOARDS, INITIAL_WORKSPACES, INITIAL_BOARD, ONEGAI_BOARD } from './constants/initialData';
import { Board, ToolType, MindMapNode, StickyNote, WireframeItem, DrawingStroke } from './types';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MindMapCanvas } from './components/MindMapCanvas';
import { StickyNotesCanvas } from './components/StickyNotesCanvas';
import { FreehandCanvas } from './components/FreehandCanvas';
import { ZoomControls } from './components/ZoomControls';
import { AIModal } from './components/AIModal';
import { ExportModal } from './components/ExportModal';
import { PresentationView } from './components/PresentationView';

const STORAGE_KEY = 'whimflow_boards_v3';
const THEME_KEY = 'whimflow_theme';

const BRANCH_PALETTE = [
  '#f97316', // Laranja (como Os Mais Pedidos Onegai)
  '#0d9488', // Teal (como O Melhor Hot Roll)
  '#3b82f6', // Azul (como Segundo Temaki)
  '#ec4899', // Magenta (como Combinados)
  '#059669', // Verde Esmeralda (como Yakissoba)
  '#eab308', // Âmbar / Dourado (como Mini Pokes)
  '#ef4444', // Vermelho (como Pokes Grandes)
  '#8b5cf6', // Violeta
  '#6366f1'  // Índigo
];

export const App: React.FC = () => {
  // Estado dos Quadros & Áreas de Trabalho
  const [boards, setBoards] = useState<Board[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Iniciando com quadros padrões');
    }
    return INITIAL_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>('board-turbine');
  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('ws-main');

  // Interface & Ferramentas
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>('mindmap');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
  });

  // Canvas Pan & Zoom
  const [pan, setPan] = useState({ x: 260, y: 340 });
  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const isSpacePressed = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Seleções
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);

  // Modais
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Desenho livre
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Sincronizar workspace selecionado com o board ativo
  useEffect(() => {
    if (activeBoard && activeBoard.workspaceId !== currentWorkspaceId) {
      setCurrentWorkspaceId(activeBoard.workspaceId);
    }
  }, [activeBoardId]);

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

  const updateActiveBoard = useCallback((updater: (board: Board) => Board) => {
    setBoards(prevBoards => prevBoards.map(b => {
      if (b.id === activeBoard.id) {
        const updated = updater(b);
        return { ...updated, updatedAt: new Date().toISOString() };
      }
      return b;
    }));
  }, [activeBoard.id]);

  // Gestão de Texto dos Nós
  const handleUpdateNodeText = (id: string, text: string) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, text } : n)
    }));
  };

  // Recolher / Expandir Ramo
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
    if (parent.side === 'root' || !branchColor || branchColor === '#ffffff' || branchColor === '#1e293b') {
      const paletteIndex = parent.childrenIds.length % BRANCH_PALETTE.length;
      branchColor = BRANCH_PALETTE[paletteIndex];
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
      side: 'right'
    };

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: [
        ...board.mindMapNodes.map(n => n.id === parentId ? { 
          ...n, 
          childrenIds: [...n.childrenIds, newId],
          collapsed: false // Força expansão para que o novo nó e a linha fiquem visíveis imediatamente!
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

  // AÇÃO DO BOTÃO PRINCIPAL DA TOOLBAR (+ Quadrado com Linha)
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

  // Excluir Nó e toda a sua subárvore
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

  const handleMoveNode = (id: string, dx: number, dy: number) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom } : n)
    }));
  };

  // Expansão com IA
  const handleAddGeneratedBranches = (parentId: string, branchTexts: string[]) => {
    const parent = activeBoard.mindMapNodes.find(n => n.id === parentId);
    if (!parent) return;

    let branchColor = parent.color;
    if (parent.side === 'root' || !branchColor || branchColor === '#ffffff' || branchColor === '#1e293b') {
      branchColor = BRANCH_PALETTE[parent.childrenIds.length % BRANCH_PALETTE.length];
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
      text: 'Observação operacional...',
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
      label: 'Card de Interface de Pedidos'
    };
    updateActiveBoard(board => ({ ...board, wireframes: [...board.wireframes, newWf] }));
  };

  // Atalhos Globais de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

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
  }, [selectedNodeId, selectedStickyId]);

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
      // Se clicou no fundo, desseleciona para permitir visualização limpa
      setSelectedNodeId(null);
      setSelectedStickyId(null);
    }
  };

  // Duplo clique no canvas vazio cria um novo nó filho conectado por linha
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
      }));
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
      {/* Top Navigation */}
      <TopNav
        boardTitle={activeBoard.title}
        onUpdateTitle={(title) => updateActiveBoard(b => ({ ...b, title }))}
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
        onSelectWorkspace={(wsId) => {
          setCurrentWorkspaceId(wsId);
          const boardInWs = boards.find(b => b.workspaceId === wsId);
          if (boardInWs) setActiveBoardId(boardInWs.id);
        }}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenAI={() => setIsAIModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onStartPresentation={() => setIsPresentationOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalObjects={totalObjects}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onSelectWorkspace={(wsId) => {
            setCurrentWorkspaceId(wsId);
            const boardInWs = boards.find(b => b.workspaceId === wsId);
            if (boardInWs) setActiveBoardId(boardInWs.id);
          }}
          onAddWorkspace={(name) => setWorkspaces(prev => [...prev, { id: `ws-${Date.now()}`, name }])}
          boards={boards}
          activeBoardId={activeBoard.id}
          onSelectBoard={setActiveBoardId}
          onCreateBoard={(title) => {
            const newBoard: Board = {
              id: `board-${Date.now()}`,
              title,
              workspaceId: currentWorkspaceId,
              updatedAt: new Date().toISOString(),
              mindMapNodes: [{
                id: 'root',
                text: title,
                x: 0,
                y: 0,
                width: 200,
                height: 52,
                parentId: null,
                childrenIds: [],
                collapsed: false,
                color: '#1e293b',
                side: 'root'
              }],
              shapes: [],
              connectors: [],
              stickies: [],
              wireframes: [],
              texts: [],
              drawings: []
            };
            setBoards(prev => [...prev, newBoard]);
            setActiveBoardId(newBoard.id);
          }}
          onDeleteBoard={(id) => {
            setBoards(prev => prev.filter(b => b.id !== id));
            if (activeBoardId === id) {
              const remaining = boards.filter(b => b.id !== id);
              if (remaining.length > 0) setActiveBoardId(remaining[0].id);
            }
          }}
        />

        {/* Toolbar com botão de Criação de Quadrado com Linha */}
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
          {/* Fundo com Grade de Pontos Corporativa */}
          <div className="canvas-background" />

          {/* Camada de Transformação do Canvas (Pan e Zoom) */}
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

            {/* Mapa Mental com Linhas Automáticas e Organização Tidy Tree */}
            <MindMapCanvas
              nodes={activeBoard.mindMapNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onUpdateNodeText={handleUpdateNodeText}
              onToggleCollapse={handleToggleCollapse}
              onAddChildNode={handleAddChildNode}
              onAddSiblingNode={handleAddSiblingNode}
              onDeleteNode={handleDeleteNode}
              onMoveNode={handleMoveNode}
            />

            {/* Post-its / Notas Adesivas */}
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

        {/* Controles de Zoom no Canto Inferior Direito */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 2.5))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.2))}
          onResetZoom={() => {
            setZoom(1.0);
            setPan({ x: 260, y: 340 });
          }}
          onOpenAI={() => setIsAIModalOpen(true)}
        />
      </div>

      {/* Modais */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        selectedNode={activeBoard.mindMapNodes.find(n => n.id === selectedNodeId) || null}
        onAddGeneratedBranches={handleAddGeneratedBranches}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeBoard={activeBoard}
        onImportBoard={(board) => {
          setBoards(prev => [board, ...prev.filter(b => b.id !== board.id)]);
          setActiveBoardId(board.id);
        }}
        onResetBoard={() => {
          setBoards(INITIAL_BOARDS);
          setActiveBoardId('board-turbine');
          setZoom(1.0);
          setPan({ x: 260, y: 340 });
        }}
      />

      {isPresentationOpen && (
        <PresentationView
          board={activeBoard}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
    </div>
  );
};
