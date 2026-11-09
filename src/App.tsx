import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_BOARDS, BLANK_BOARD, ONEGAI_BOARD, ORION_SUSHI_BOARD } from './constants/initialData';
import { Board, ToolType, MindMapNode, StickyNote, WireframeItem, DrawingStroke, SlideSection } from './types';
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
import { DashboardView } from './components/DashboardView';
import { DocEditorView } from './components/DocEditorView';
import { AgentChatView } from './components/AgentChatView';
import { TemplateModal } from './components/TemplateModal';
import { PresentSidePanel } from './components/PresentSidePanel';
import { TemplateItem } from './constants/templatesData';
import { EXECUTIVE_PALETTE } from './components/NodeContextMenu';
import { calculateMindMapLayout } from './utils/treeLayout';
import { parseOutlineText, createNodesFromOutline } from './utils/mindMapImport';

const STORAGE_KEY = 'whimflow_boards_v5';
const THEME_KEY = 'whimflow_theme';

export const App: React.FC = () => {
  // Garante que a aba do navegador sempre exiba estritamente "Mapa Mental Turbine"
  useEffect(() => {
    document.title = 'Mapa Mental Turbine';
  }, []);

  // Estado dos Quadros com Purga Total de Nós Fantasmas / Espaços em Branco
  const [boards, setBoards] = useState<Board[]>(() => {
    const purgeEmptyNodes = (nodeList: MindMapNode[]): MindMapNode[] => {
      const emptyIds = new Set<string>();
      (nodeList || []).forEach(n => {
        const isRoot = n.side === 'root' || n.id === 'root';
        const clean = (n.text || '').trim();
        if (!isRoot && (!clean || clean === 'Novo Quadrado' || clean === 'Novo nó')) {
          emptyIds.add(n.id);
        }
      });

      return (nodeList || [])
        .filter(n => !emptyIds.has(n.id))
        .map(n => ({
          ...n,
          childrenIds: (n.childrenIds || []).filter(cid => !emptyIds.has(cid))
        }));
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((b: Board) => ({
            ...b,
            mindMapNodes: purgeEmptyNodes(b.mindMapNodes)
          }));
          const hasOnegai = sanitized.some((b: Board) => b.id === 'board-onegai');
          const hasOrion = sanitized.some((b: Board) => b.id === 'board-orion-sushi');
          const list = [...sanitized];
          if (!hasOnegai) list.push(ONEGAI_BOARD);
          if (!hasOrion) list.push(ORION_SUSHI_BOARD);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          } catch (e) {}
          return list;
        }
      }
    } catch (e) {
      console.warn('Iniciando com quadros padrão');
    }
    return INITIAL_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    return boards[0]?.id || BLANK_BOARD.id;
  });

  // Pilha de Histórico para Desfazer / Refazer
  const [history, setHistory] = useState<Board[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Edição imediata de novos nós
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Interface & Ferramentas
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>('mindmap');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'light';
  });

  // Canvas Pan & Zoom dinâmico e responsivo desde o primeiro frame
  const [pan, setPan] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      x: Math.round(w / 2 - 110),
      y: Math.round(h / 2 - 30)
    };
  });
  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const isSpacePressed = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Seleções
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(['root']);
  const [selectedStickyId, setSelectedStickyId] = useState<string | null>(null);

  // Seleção por Retângulo (Marquee / Lasso) no Canvas
  const [marqueeRect, setMarqueeRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const isMarqueeActiveRef = useRef(false);

  // Visualização Principal: 'dashboard' | 'editor' | 'doc' | 'agent'
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'doc' | 'agent'>('dashboard');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPresentSidePanelOpen, setIsPresentSidePanelOpen] = useState(false);

  // Modais
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Desenho livre
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  // Ajuste inteligente e automático do Canvas ao centro da tela (Fit-to-View)
  const fitView = useCallback((nodesToFit?: MindMapNode[]) => {
    const targetNodes = nodesToFit || activeBoard.mindMapNodes;
    if (!targetNodes || targetNodes.length === 0) return;

    const root = targetNodes.find(n => n.side === 'root') || targetNodes[0];
    const layout = calculateMindMapLayout(targetNodes, root.id, {
      horizontalGap: 100,
      verticalGap: 18,
      rootX: 0,
      rootY: 0
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    targetNodes.forEach(node => {
      const computed = layout.get(node.id);
      const x = computed ? computed.x : (node.x || 0);
      const y = computed ? computed.y : (node.y || 0);
      const w = computed ? computed.width : 120;
      const h = computed ? computed.height : 38;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    if (!isFinite(minX)) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= 768;

    const mapWidth = Math.max(maxX - minX, 260);
    const mapHeight = Math.max(maxY - minY, 160);

    const padLeft = sidebarOpen && !isMobile ? 320 : (isMobile ? 24 : 80);
    const padRight = isMobile ? 24 : 80;
    const padTop = isMobile ? 65 : 90;
    const padBottom = isMobile ? 50 : 70;

    const availWidth = Math.max(160, width - padLeft - padRight);
    const availHeight = Math.max(160, height - padTop - padBottom);

    const scaleX = availWidth / mapWidth;
    const scaleY = availHeight / mapHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.22), 1.05);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPanX = padLeft + availWidth / 2 - centerX * newZoom;
    const newPanY = padTop + availHeight / 2 - centerY * newZoom;

    setZoom(Number(newZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [activeBoard.mindMapNodes, sidebarOpen]);

  // Listener de Redimensionamento Dinâmico da Janela
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fitView(activeBoard.mindMapNodes);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [fitView, activeBoard.mindMapNodes]);

  // Auto-enquadramento ao alternar quadros
  useEffect(() => {
    fitView(activeBoard.mindMapNodes);
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

  // Atualizar quadro ativo de forma robusta e com gravação de histórico
  const updateActiveBoard = useCallback((updater: (board: Board) => Board, pushHistory: boolean = true) => {
    setBoards(prevBoards => {
      const current = prevBoards.find(b => b.id === activeBoardId) || prevBoards[0];
      if (!current) return prevBoards;

      if (pushHistory) {
        const snapshot = JSON.parse(JSON.stringify(current));
        setHistory(prev => [...prev.slice(0, historyIndex + 1), snapshot].slice(-40));
        setHistoryIndex(prev => Math.min(prev + 1, 39));
      }

      const updated = updater(current);
      return prevBoards.map(b => b.id === current.id ? { ...updated, updatedAt: new Date().toISOString() } : b);
    });
  }, [activeBoardId, historyIndex]);

  // Desfazer / Refazer
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const previousState = history[historyIndex];
      setBoards(prev => prev.map(b => b.id === previousState.id ? previousState : b));
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setBoards(prev => prev.map(b => b.id === nextState.id ? nextState : b));
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex]);

  // Atalhos Globais de Teclado (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
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
  }, [handleUndo, handleRedo]);

  // CRIAR NOVO QUADRO 100% LIMPO
  const handleCreateNewBoard = (title: string = 'untitled') => {
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
          text: 'Central Idea',
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
    setSelectedNodeId('root');
    setPan({ x: 300, y: 350 });
    setZoom(1.0);
    setCurrentView('editor');
  };

  // ABERTURA DE QUADRO PELO DASHBOARD
  const handleOpenBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
    setCurrentView('editor');
    const target = boards.find(b => b.id === boardId);
    if (target) {
      setTimeout(() => fitView(target.mindMapNodes), 80);
    }
  }, [boards, fitView]);

  // CRIAÇÃO A PARTIR DE TEMPLATES DO WHIMSICAL
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
  }, [fitView]);

  // SEÇÕES DE APRESENTAÇÃO (PRESENT SIDE PANEL)
  const handleAddSection = useCallback(() => {
    const sectionId = `sec-${Date.now()}`;
    const title = selectedNodeId 
      ? (activeBoard.mindMapNodes.find(n => n.id === selectedNodeId)?.text || 'untitled') 
      : `untitled ${(activeBoard.sections?.length || 0) + 1}`;
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
    const trimmed = text.trim();
    if (!trimmed) {
      const target = activeBoard.mindMapNodes.find(n => n.id === id);
      if (target && target.side !== 'root' && target.id !== 'root') {
        handleDeleteNode(id);
        return;
      }
    }
    updateActiveBoard(board => ({
      ...board,
      mindMapNodes: board.mindMapNodes.map(n => n.id === id ? { ...n, text: trimmed } : n)
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
      text: '',
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
    setSelectedNodeIds([newId]);
    setEditingNodeId(newId);
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
      text: '',
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
  };

  // CRIAÇÃO DE QUADRADO IRMÃO ACIMA (Atalho Whimsical: Ctrl + Enter)
  const handleAddSiblingAboveNode = (siblingId: string) => {
    const sibling = activeBoard.mindMapNodes.find(n => n.id === siblingId);
    if (!sibling || !sibling.parentId) return;

    const parent = activeBoard.mindMapNodes.find(n => n.id === sibling.parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      text: '',
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
  };

  // CRIAÇÃO DE NÓ PAI INTERMEDIÁRIO (Atalho Whimsical: Alt + Enter)
  const handleAddParentNode = (childId: string) => {
    const child = activeBoard.mindMapNodes.find(n => n.id === childId);
    if (!child || !child.parentId) return;

    const grandParent = activeBoard.mindMapNodes.find(n => n.id === child.parentId);
    if (!grandParent) return;

    const newId = `node-${Date.now()}`;
    const newParentNode: MindMapNode = {
      id: newId,
      text: '',
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

  // REORDENAR E INSERIR NÓS VIA ARRASTE (ANTES, DEPOIS OU DENTRO DE OUTRO NÓ)
  const handleReorderInsertNode = (
    draggedId: string, 
    targetId: string, 
    position: 'before' | 'after' | 'inside'
  ) => {
    if (draggedId === targetId) return;

    // Se o nó arrastado fizer parte de uma seleção múltipla, move todos os nós selecionados juntos
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

      // Impede ciclos (não pode soltar dentro de seus próprios descendentes)
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
            // Remove dos pais antigos
            if (n.childrenIds && n.childrenIds.some(cid => validMovingIds.includes(cid))) {
              return {
                ...n,
                childrenIds: n.childrenIds.filter(cid => !validMovingIds.includes(cid))
              };
            }
            // Adiciona ao novo pai
            if (n.id === targetId) {
              const existing = n.childrenIds.filter(cid => !validMovingIds.includes(cid));
              return {
                ...n,
                childrenIds: [...existing, ...validMovingIds],
                collapsed: false
              };
            }
            // Atualiza propriedades dos nós movidos
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

      // Reordenação 'before' ou 'after'
      const newParentId = targetNode.parentId;
      if (!newParentId) return board; // Não pode reordenar nó raiz

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
          // Remove dos pais antigos se não for o novo pai
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
  };

  // REPARENTALIZAR NÓ (MUDAR DE NÓ-PAI VIA ARRASTE)
  const handleReparentNode = (childId: string, newParentId: string) => {
    const child = activeBoard.mindMapNodes.find(n => n.id === childId);
    const newParent = activeBoard.mindMapNodes.find(n => n.id === newParentId);
    if (!child || !newParent || child.id === newParent.id) return;

    // Evita ciclos
    const isDescendant = (checkId: string, targetId: string): boolean => {
      const n = activeBoard.mindMapNodes.find(item => item.id === checkId);
      if (!n || !n.childrenIds) return false;
      if (n.childrenIds.includes(targetId)) return true;
      return n.childrenIds.some(cid => isDescendant(cid, targetId));
    };

    if (isDescendant(childId, newParentId)) {
      return;
    }

    const oldParentId = child.parentId;
    if (oldParentId === newParentId) return;

    updateActiveBoard(board => {
      return {
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

  // EXCLUIR MÚLTIPLOS NÓS
  const handleDeleteMultipleNodes = (ids: string[]) => {
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
  };

  // DUPLICAR MÚLTIPLOS NÓS
  const handleDuplicateMultipleNodes = (ids: string[]) => {
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
  };

  // EXCLUIR NÓ E SUB-RAMOS
  const handleDeleteNode = (id: string) => {
    handleDeleteMultipleNodes([id]);
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

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          handleDuplicateMultipleNodes(selectedNodeIds);
        } else if (selectedNodeId) {
          handleDuplicateNode(selectedNodeId);
        }
        return;
      }

      // Whimsical Shortcut: Ctrl + / (Recolher / Expandir Ramo)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        if (selectedNodeId) {
          e.preventDefault();
          handleToggleCollapse(selectedNodeId);
          return;
        }
      }

      // Whimsical Shortcut: Alt + Enter (Criar nó Pai intermediário)
      if (e.altKey && e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        handleAddParentNode(selectedNodeId);
        return;
      }

      // Whimsical Shortcut: Ctrl + Enter (Criar nó Irmão Acima)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        handleAddSiblingAboveNode(selectedNodeId);
        return;
      }

      // Whimsical Shortcut: Tab (Criar Filho)
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        handleAddChildNode(selectedNodeId);
        return;
      }

      // Whimsical Shortcut: Enter (Criar Irmão Abaixo)
      if (e.key === 'Enter' && selectedNodeId) {
        e.preventDefault();
        handleAddSiblingNode(selectedNodeId);
        return;
      }

      // Whimsical Shortcut: Navegação com Setas (↑ ↓ ← →)
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

      // Whimsical Shortcut: Copiar Ramo como Texto Hierárquico (Ctrl + C)
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

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          handleDeleteMultipleNodes(selectedNodeIds);
        } else if (selectedNodeId) {
          handleDeleteNode(selectedNodeId);
        } else if (selectedStickyId) {
          updateActiveBoard(b => ({ ...b, stickies: b.stickies.filter(s => s.id !== selectedStickyId) }));
          setSelectedStickyId(null);
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedNodeIds([]);
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

    // Whimsical Feature: Colar Lista / Markdown para gerar árvore instantânea (Ctrl + V)
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
  }, [selectedNodeId, selectedNodeIds, selectedStickyId, historyIndex, history]);

  // Scroll do Mouse direto para ZOOM IN / ZOOM OUT centrado no cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Se Shift estiver pressionado, faz rolagem horizontal
    if (e.shiftKey) {
      setPan(prev => ({ ...prev, x: prev.x - e.deltaY }));
      return;
    }

    // Zoom direto com o scroll do mouse (roda para cima = zoom in, roda para baixo = zoom out)
    const zoomIntensity = 0.0018;
    const factor = Math.exp(-e.deltaY * zoomIntensity);
    const newZoom = Math.min(Math.max(zoom * factor, 0.15), 3.0);

    // Mantém o ponto focal sob o cursor do mouse
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;

    const newPanX = mouseX - canvasX * newZoom;
    const newPanY = mouseY - canvasY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Listeners globais de janela para arraste fluido de Marquee e Pan
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        panStartRef.current = { x: e.clientX, y: e.clientY };
      } else if (isMarqueeActiveRef.current && marqueeStartRef.current) {
        const dx = Math.abs(e.clientX - marqueeStartRef.current.x);
        const dy = Math.abs(e.clientY - marqueeStartRef.current.y);
        if (dx > 4 || dy > 4) {
          const x1 = Math.min(marqueeStartRef.current.x, e.clientX);
          const y1 = Math.min(marqueeStartRef.current.y, e.clientY);
          const x2 = Math.max(marqueeStartRef.current.x, e.clientX);
          const y2 = Math.max(marqueeStartRef.current.y, e.clientY);
          setMarqueeRect({ x1, y1, x2, y2 });

          // Identifica nós que intersectam a área de seleção em tela
          const hitIds: string[] = [];
          activeBoard.mindMapNodes.forEach(node => {
            const el = document.getElementById(`node-${node.id}`);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            if (rect.right >= x1 && rect.left <= x2 && rect.bottom >= y1 && rect.top <= y2) {
              hitIds.push(node.id);
            }
          });

          setSelectedNodeIds(hitIds);
          if (hitIds.length === 1) {
            setSelectedNodeId(hitIds[0]);
          } else if (hitIds.length === 0) {
            setSelectedNodeId(null);
          }
        }
      }
    };

    const handleWindowMouseUp = () => {
      if (isMarqueeActiveRef.current) {
        if (!marqueeRect) {
          // Clique simples no fundo vazio sem deslocamento: desmarca seleção
          setSelectedNodeId(null);
          setSelectedNodeIds([]);
          setSelectedStickyId(null);
        }
        isMarqueeActiveRef.current = false;
        marqueeStartRef.current = null;
        setMarqueeRect(null);
      }
      setIsPanning(false);
      panStartRef.current = null;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPanning, marqueeRect, activeBoard.mindMapNodes]);

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      '.mindmap-node-card, .sticky-note, .node-context-menu, .toolbar-container, .top-nav, button, input, textarea, a'
    );
    const isCanvasBg = !isInteractive;

    // Pan do canvas preservado: Botão do meio, Barra de Espaço pressionada, ou ferramenta Mão
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
    } else if (e.button === 0 && isCanvasBg) {
      // Arrastar sobre fundo vazio inicia retângulo de seleção múltipla (Lasso)
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

  const handleGenerateFromAgent = (prompt: string, title?: string, nodes?: MindMapNode[]) => {
    const newBoardId = `board-agent-${Date.now()}`;
    const boardTitle = title || (prompt.length > 25 ? prompt.slice(0, 25) + '...' : prompt) || 'untitled';
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
    setTimeout(() => {
      fitView(newBoard.mindMapNodes);
    }, 100);
  };

  const totalObjects = 
    activeBoard.mindMapNodes.length + 
    activeBoard.stickies.length + 
    activeBoard.wireframes.length + 
    activeBoard.drawings.length;

  // Renderização do Dashboard Whimsical
  if (currentView === 'dashboard') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', position: 'relative' }}>
        <DashboardView
          boards={boards}
          onOpenBoard={handleOpenBoard}
          onCreateNewBoard={(title) => handleCreateNewBoard(title || 'untitled')}
          onOpenDoc={() => setCurrentView('doc')}
          onOpenAskAgent={() => setCurrentView('agent')}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onOpenAI={() => setIsAIModalOpen(true)}
          onDuplicateBoard={handleDuplicateBoard}
          onDeleteBoard={handleDeleteBoard}
          onRenameBoard={(id, newTitle) => {
            setBoards(prev => prev.map(b => b.id === id ? { ...b, title: newTitle, updatedAt: new Date().toISOString() } : b));
          }}
          workspaceName="teste"
          theme={theme}
        />

        {/* Modal de Templates do Whimsical */}
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={handleCreateFromTemplate}
          workspaceName="teste"
        />

        {/* Modal IA */}
        <AIModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          selectedNode={activeBoard.mindMapNodes.find(n => n.id === selectedNodeId) || null}
          onAddGeneratedBranches={handleAddGeneratedBranches}
        />
      </div>
    );
  }

  // Renderização do Doc Editor Whimsical (Visão de Documentos)
  if (currentView === 'doc') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', position: 'relative' }}>
        <DocEditorView
          board={activeBoard}
          onUpdateTitle={(title) => updateActiveBoard(b => ({ ...b, title }))}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          theme={theme}
          workspaceName="teste"
        />

        {/* Modal de Templates do Whimsical */}
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={handleCreateFromTemplate}
          workspaceName="teste"
        />
      </div>
    );
  }

  // Renderização do Ask Agent Whimsical (Gemini AI Workspace)
  if (currentView === 'agent') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', position: 'relative' }}>
        <AgentChatView
          onGenerateBoard={handleGenerateFromAgent}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
          theme={theme}
          workspaceName="teste"
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Navigation com Seletor de Quadros e Ações */}
      <TopNav
        boardTitle={activeBoard.title}
        onUpdateTitle={(title) => updateActiveBoard(b => ({ ...b, title }))}
        boards={boards}
        activeBoardId={activeBoard.id}
        onSelectBoard={handleOpenBoard}
        onCreateNewBoard={() => handleCreateNewBoard('untitled')}
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
        onNavigateToDashboard={() => setCurrentView('dashboard')}
        workspaceName="teste"
      />

      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Painel Lateral com Lista de Projetos */}
        <Sidebar
          isOpen={sidebarOpen}
          boards={boards}
          activeBoardId={activeBoard.id}
          onSelectBoard={handleOpenBoard}
          onCreateBoard={handleCreateNewBoard}
          onDuplicateBoard={handleDuplicateBoard}
          onDeleteBoard={handleDeleteBoard}
          onRenameBoard={(id, newTitle) => {
            setBoards(prev => prev.map(b => b.id === id ? { ...b, title: newTitle, updatedAt: new Date().toISOString() } : b));
          }}
          onNavigateToDashboard={() => setCurrentView('dashboard')}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          workspaceName="teste"
        />

        {/* Canvas Principal com Toolbar Flutuante Embutida */}
        <div
          id="main-canvas-area"
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          className={`canvas-container ${isPanning || currentTool === 'hand' ? 'panning' : currentTool === 'draw' ? 'drawing' : ''}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDownCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
        >
          {/* Toolbar Flutuante Autêntica Whimsical (Sempre dentro do Canvas, NUNCA sobrepõe a barra lateral) */}
          <Toolbar
            currentTool={currentTool}
            onSelectTool={setCurrentTool}
            onAddConnectedNode={handleAddConnectedNode}
            onAddSticky={handleAddSticky}
            onAddWireframe={handleAddWireframe}
            onAddText={() => handleAddSticky()}
            onStartPresentation={() => setIsPresentationOpen(true)}
            onOpenAI={() => setIsAIModalOpen(true)}
            onTogglePresentPanel={() => setIsPresentSidePanelOpen(prev => !prev)}
          />

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
              selectedNodeIds={selectedNodeIds}
              editingNodeId={editingNodeId}
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

        {/* Retângulo de Seleção Múltipla com o Mouse (Marquee / Lasso) */}
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

        {/* Barra de Ações para Seleção Múltipla */}
        {selectedNodeIds.length > 1 && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-elevated, #1e232d)',
              border: '1px solid var(--border-strong, #3f4758)',
              borderRadius: '8px',
              padding: '6px 14px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              userSelect: 'none'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginRight: '6px' }}>
              {selectedNodeIds.length} selecionados
            </span>
            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle, #333a48)', margin: '0 4px' }} />
            <button
              onClick={() => handleDuplicateMultipleNodes(selectedNodeIds)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', borderRadius: '5px',
                border: '1px solid var(--border-subtle, #3f4758)',
                backgroundColor: 'var(--bg-surface, #282e3b)',
                color: 'var(--text-primary)', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer'
              }}
              title="Copiar/Duplicar selecionados"
            >
              Copiar
            </button>
            <button
              onClick={() => handleDeleteMultipleNodes(selectedNodeIds)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', borderRadius: '5px',
                border: '1px solid #7f1d1d',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer'
              }}
              title="Excluir selecionados"
            >
              Excluir
            </button>
            <button
              onClick={() => {
                setSelectedNodeId(null);
                setSelectedNodeIds([]);
              }}
              style={{
                padding: '5px 8px', borderRadius: '5px',
                border: 'none', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer'
              }}
              title="Desmarcar seleção"
            >
              ✕
            </button>
          </div>
        )}

        {/* Painel Lateral de Apresentação (Whimsical Present Panel) */}
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

        {/* Controles de Zoom & Barra Inferior Whimsical */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 2.5))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.2))}
          onResetZoom={() => fitView()}
          canUndo={historyIndex >= 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          theme={theme}
        />
      </div>

      {/* Modal de Templates do Whimsical */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleCreateFromTemplate}
        workspaceName="teste"
      />

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
          initialSelectedNodeId={selectedNodeId}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
    </div>
  );
};
