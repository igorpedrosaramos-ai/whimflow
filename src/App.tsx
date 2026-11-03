import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_BOARD, INITIAL_WORKSPACES } from './constants/initialData';
import { Board, ToolType, MindMapNode, FlowShape, StickyNote, WireframeItem, DrawingStroke, Point } from './types';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MindMapCanvas } from './components/MindMapCanvas';
import { FlowchartCanvas } from './components/FlowchartCanvas';
import { StickyNotesCanvas } from './components/StickyNotesCanvas';
import { FreehandCanvas } from './components/FreehandCanvas';
import { ZoomControls } from './components/ZoomControls';
import { AIModal } from './components/AIModal';
import { ExportModal } from './components/ExportModal';
import { PresentationView } from './components/PresentationView';

const STORAGE_KEY = 'whimflow_boards_v1';
const THEME_KEY = 'whimflow_theme';

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
      console.warn('Erro ao carregar boards salvos, iniciando com padrão');
    }
    return [INITIAL_BOARD];
  });

  const [activeBoardId, setActiveBoardId] = useState<string>('board-turbine');
  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('ws-main');

  // Estado da Interface & Ferramentas
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>('mindmap');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
  });

  // Canvas Pan & Zoom (112% como no screenshot do Whimsical!)
  const [pan, setPan] = useState({ x: 380, y: 340 });
  const [zoom, setZoom] = useState(1.12);
  const [isPanning, setIsPanning] = useState(false);
  const isSpacePressed = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Seleções
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);

  // Modais
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Desenho livre
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Salvar no localStorage automaticamente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    } catch (e) {
      console.error('Falha ao salvar quadros no localStorage', e);
    }
  }, [boards]);

  // Atualizar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Atualizar quadro ativo
  const updateActiveBoard = useCallback((updater: (board: Board) => Board) => {
    setBoards(prevBoards => prevBoards.map(b => {
      if (b.id === activeBoard.id) {
        const updated = updater(b);
        return { ...updated, updatedAt: new Date().toISOString() };
      }
      return b;
    }));
  }, [activeBoard.id]);

  // Gestão de Nós do Mapa Mental
  const handleUpdateNodeText = (id: string, text: string) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, text } : n)
    }));
  };

  const handleToggleCollapse = (id: string) => {
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n)
    }));
  };

  const handleAddChildNode = (parentId: string) => {
    const parent = activeBoard.mindMapNodes.find(n => n.id === parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const pWidth = parent.width || (parent.side === 'root' ? 240 : 160);
    const childOffset = parent.childrenIds.length * 40;

    const newNode: MindMapNode = {
      id: newId,
      text: 'Novo Tópico',
      x: parent.x + pWidth + 80,
      y: parent.y + childOffset,
      width: 160,
      height: 38,
      parentId: parent.id,
      childrenIds: [],
      collapsed: false,
      color: parent.color || '#818cf8',
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
  };

  const handleAddSiblingNode = (siblingId: string) => {
    const sibling = activeBoard.mindMapNodes.find(n => n.id === siblingId);
    if (!sibling || !sibling.parentId) return;

    const parent = activeBoard.mindMapNodes.find(n => n.id === sibling.parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      text: 'Novo Ramo',
      x: sibling.x,
      y: sibling.y + 45,
      width: sibling.width || 160,
      height: sibling.height || 38,
      parentId: parent.id,
      childrenIds: [],
      collapsed: false,
      color: parent.color || '#818cf8',
      side: sibling.side
    };

    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: [
        ...board.mindMapNodes.map(n => n.id === parent.id ? { 
          ...n, 
          childrenIds: [...n.childrenIds, newId] 
        } : n),
        newNode
      ]
    }));

    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (id: string) => {
    if (id === 'root') return; // Raiz protegida

    updateActiveBoard(board => {
      // Deleta nó e seus filhos recursivamente
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

  // IA: Inserir múltiplos ramos gerados
  const handleAddGeneratedBranches = (parentId: string, branchTexts: string[]) => {
    const parent = activeBoard.mindMapNodes.find(n => n.id === parentId);
    if (!parent) return;

    const pWidth = parent.width || (parent.side === 'root' ? 240 : 160);
    const newNodes: MindMapNode[] = [];
    const newIds: string[] = [];

    branchTexts.forEach((text, idx) => {
      const newId = `node-ai-${Date.now()}-${idx}`;
      newIds.push(newId);
      newNodes.push({
        id: newId,
        text,
        x: parent.x + pWidth + 90,
        y: parent.y + (idx - Math.floor(branchTexts.length / 2)) * 45,
        width: 220,
        height: 38,
        parentId: parent.id,
        childrenIds: [],
        collapsed: false,
        color: parent.color || '#818cf8',
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

  // Inserir Formas & Sticky Notes
  const handleAddSticky = () => {
    const newSticky: StickyNote = {
      id: `sticky-${Date.now()}`,
      x: -pan.x / zoom + window.innerWidth / (2 * zoom) - 90,
      y: -pan.y / zoom + window.innerHeight / (2 * zoom) - 70,
      width: 180,
      height: 140,
      text: 'Nova observação estratégica...',
      color: '#fef08a'
    };
    updateActiveBoard(board => ({ ...board, stickies: [...board.stickies, newSticky] }));
    setSelectedStickyId(newSticky.id);
  };

  const handleAddShape = () => {
    const newShape: FlowShape = {
      id: `shape-${Date.now()}`,
      type: 'rounded',
      x: -pan.x / zoom + window.innerWidth / (2 * zoom) - 100,
      y: -pan.y / zoom + window.innerHeight / (2 * zoom) - 30,
      width: 200,
      height: 60,
      text: 'Novo Processo / Fluxo',
      color: 'var(--bg-surface)'
    };
    updateActiveBoard(board => ({ ...board, shapes: [...board.shapes, newShape] }));
    setSelectedShapeId(newShape.id);
  };

  const handleAddWireframe = () => {
    const newWf: WireframeItem = {
      id: `wf-${Date.now()}`,
      type: 'card',
      x: -pan.x / zoom + window.innerWidth / (2 * zoom) - 120,
      y: -pan.y / zoom + window.innerHeight / (2 * zoom) - 60,
      width: 240,
      height: 120,
      label: 'Interface de Pedidos'
    };
    updateActiveBoard(board => ({ ...board, wireframes: [...board.wireframes, newWf] }));
  };

  // Keyboard Navigation Global (Tab, Enter, Delete, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Não intercepta se o usuário estiver digitando em um input ou textarea
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
      } else if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedNodeId) {
          handleDeleteNode(selectedNodeId);
        } else if (selectedShapeId) {
          updateActiveBoard(b => ({ ...b, shapes: b.shapes.filter(s => s.id !== selectedShapeId) }));
          setSelectedShapeId(null);
        } else if (selectedStickyId) {
          updateActiveBoard(b => ({ ...b, stickies: b.stickies.filter(s => s.id !== selectedStickyId) }));
          setSelectedStickyId(null);
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedShapeId(null);
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
  }, [selectedNodeId, selectedShapeId, selectedStickyId, handleAddChildNode, handleAddSiblingNode, handleDeleteNode]);

  // Manipulação de Pan e Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = -e.deltaY * 0.0015;
      setZoom(prev => Math.min(Math.max(prev + zoomFactor, 0.25), 2.5));
    } else {
      // Pan
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
      // Deselecionar
      setSelectedNodeId(null);
      setSelectedShapeId(null);
      setSelectedStickyId(null);
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
      // Força render
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

  // Contagem total de objetos
  const totalObjects = 
    activeBoard.mindMapNodes.length + 
    activeBoard.shapes.length + 
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
        onSelectWorkspace={setCurrentWorkspaceId}
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
          onSelectWorkspace={setCurrentWorkspaceId}
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
                width: 240,
                height: 56,
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

        {/* Floating Toolbar */}
        <Toolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          onAddSticky={handleAddSticky}
          onAddShape={handleAddShape}
          onAddText={() => handleAddSticky()}
          onAddWireframe={handleAddWireframe}
          onStartPresentation={() => setIsPresentationOpen(true)}
        />

        {/* Main Canvas Area */}
        <div
          id="main-canvas-area"
          className={`canvas-container ${isPanning || currentTool === 'hand' ? 'panning' : currentTool === 'draw' ? 'drawing' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDownCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
        >
          {/* Dot Grid Background */}
          <div className="canvas-background" />

          {/* Canvas Transform Layer */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform'
            }}
          >
            {/* Freehand Strokes */}
            <FreehandCanvas drawings={activeBoard.drawings} />

            {/* Mind Map Canvas (Bézier Curves & Nodes) */}
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

            {/* Flowchart Shapes & Wireframes */}
            <FlowchartCanvas
              shapes={activeBoard.shapes}
              wireframes={activeBoard.wireframes}
              selectedId={selectedShapeId}
              onSelect={setSelectedShapeId}
              onUpdateShapeText={(id, text) => updateActiveBoard(b => ({
                ...b,
                shapes: b.shapes.map(s => s.id === id ? { ...s, text } : s)
              }))}
              onMoveShape={(id, dx, dy) => updateActiveBoard(b => ({
                ...b,
                shapes: b.shapes.map(s => s.id === id ? { ...s, x: s.x + dx / zoom, y: s.y + dy / zoom } : s)
              }))}
              onDeleteShape={(id) => updateActiveBoard(b => ({
                ...b,
                shapes: b.shapes.filter(s => s.id !== id)
              }))}
              onMoveWireframe={(id, dx, dy) => updateActiveBoard(b => ({
                ...b,
                wireframes: b.wireframes.map(w => w.id === id ? { ...w, x: w.x + dx / zoom, y: w.y + dy / zoom } : w)
              }))}
              onDeleteWireframe={(id) => updateActiveBoard(b => ({
                ...b,
                wireframes: b.wireframes.filter(w => w.id !== id)
              }))}
            />

            {/* Sticky Notes Canvas */}
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

        {/* Bottom Zoom & Help Controls */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 2.5))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.25))}
          onResetZoom={() => {
            setZoom(1.12);
            setPan({ x: 380, y: 340 });
          }}
          onOpenAI={() => setIsAIModalOpen(true)}
        />
      </div>

      {/* Modals */}
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
          setBoards([INITIAL_BOARD]);
          setActiveBoardId('board-turbine');
          setZoom(1.12);
          setPan({ x: 380, y: 340 });
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
