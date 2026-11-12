import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Users, 
  Layout, 
  Trash2, 
  Star, 
  Search, 
  Command, 
  FileText, 
  Sparkles, 
  FolderPlus, 
  Grid, 
  List, 
  MoreHorizontal, 
  X,
  Laptop,
  Folder,
  Copy,
  Trash,
  Pencil,
  Tag
} from 'lucide-react';
import { Board, BoardCategory, Workspace } from '../types';
import { CategoryModal } from './CategoryModal';
import { MoveCategoryModal } from './MoveCategoryModal';
import { BoardThumbnailPreview } from './BoardThumbnailPreview';
import { WorkspaceMenuDropdown } from './WorkspaceMenuDropdown';

interface DashboardViewProps {
  boards: Board[];
  categories?: BoardCategory[];
  onOpenBoard: (boardId: string) => void;
  onCreateNewBoard: (title?: string, categoryId?: string) => void;
  onOpenDoc: () => void;
  onOpenAskAgent: () => void;
  onOpenTemplates: () => void;
  onDuplicateBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, newTitle: string) => void;
  onOpenTrash?: () => void;
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
  onOpenQuickSpark?: () => void;
  initialCategoryFilter?: string;
  onSelectRecent?: () => void;
  onSelectAll?: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onSaveCategory?: (category: { id?: string; name: string; color: string }) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onMoveBoardCategory?: (boardId: string, categoryId?: string) => void;
  workspaceName?: string;
  workspaces?: Workspace[];
  activeWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
  onRenameWorkspace?: (id: string, newName: string) => void;
  onCreateWorkspace?: (name: string) => void;
  onExportBackup?: () => void;
  theme?: 'dark' | 'light';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  boards,
  categories = [],
  onOpenBoard,
  onCreateNewBoard,
  onOpenDoc,
  onOpenAskAgent,
  onOpenTemplates,
  onDuplicateBoard,
  onDeleteBoard,
  onRenameBoard,
  onOpenTrash,
  onOpenSearch,
  onOpenShortcuts,
  onOpenQuickSpark,
  initialCategoryFilter = 'all',
  onSelectRecent,
  onSelectAll,
  onSelectCategory,
  onSaveCategory,
  onDeleteCategory,
  onMoveBoardCategory,
  workspaceName = 'teste',
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onRenameWorkspace,
  onCreateWorkspace,
  onExportBackup,
  theme = 'light'
}) => {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [isDownloadCardDismissed, setIsDownloadCardDismissed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeBoardMenuId, setActiveBoardMenuId] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter);
  const [isTeamsOpen, setIsTeamsOpen] = useState(true);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [activeCategoryMenuId, setActiveCategoryMenuId] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<BoardCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [boardToMove, setBoardToMove] = useState<Board | null>(null);
  const [sortOption, setSortOption] = useState<'created-desc' | 'created-asc' | 'alpha' | 'modified'>('created-desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  React.useEffect(() => {
    if (initialCategoryFilter && initialCategoryFilter !== categoryFilter) {
      setCategoryFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  let displayBoards = boards.filter(b => {
    if (searchFilter.trim() && !b.title.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    if (categoryFilter === 'all' || categoryFilter === 'recent') {
      return true;
    }
    return b.categoryId === categoryFilter;
  });

  if (categoryFilter === 'recent') {
    displayBoards = [...displayBoards].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  } else if (sortOption === 'created-desc') {
    displayBoards = [...displayBoards].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortOption === 'created-asc') {
    displayBoards = [...displayBoards].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortOption === 'alpha') {
    displayBoards = [...displayBoards].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'modified') {
    displayBoards = [...displayBoards].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  }

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: isDark ? '#12161c' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#0f172a',
        fontFamily: 'Dinsical, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* =========================================================================
          BARRA LATERAL ESQUERDA (Whimsical Authentic Dark Sidebar)
          ========================================================================= */}
      <aside
        style={{
          width: isSidebarCollapsed ? '0px' : '260px',
          backgroundColor: '#161920',
          borderRight: isSidebarCollapsed ? 'none' : '1px solid #232936',
          display: 'flex',
          flexDirection: 'column',
          color: '#94a3b8',
          userSelect: 'none',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Topo do Menu: Switcher de Espaço de Trabalho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #202633',
            minWidth: '260px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Ícone de Toggle Lateral */}
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="Recolher barra lateral"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>

            {/* Dropdown do Espaço de Trabalho */}
            <div style={{ position: 'relative' }}>
              <div
                id="btn-workspace-switcher"
                data-testid="btn-workspace-switcher"
                onClick={() => setIsWorkspaceMenuOpen(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: isWorkspaceMenuOpen ? '#232d3f' : 'transparent',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={e => {
                  if (!isWorkspaceMenuOpen) e.currentTarget.style.backgroundColor = '#1f2736';
                }}
                onMouseLeave={e => {
                  if (!isWorkspaceMenuOpen) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Gerenciar e alternar espaços de trabalho"
              >
                {/* Badge do Espaço */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px',
                    flexShrink: 0
                  }}
                >
                  {workspaceName.charAt(0).toUpperCase()}
                </div>

                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#f8fafc',
                    maxWidth: '135px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={workspaceName}
                >
                  {workspaceName}
                </span>
                <ChevronDown
                  size={14}
                  color="#64748b"
                  style={{
                    transform: isWorkspaceMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.18s ease'
                  }}
                />
              </div>

              {isWorkspaceMenuOpen && (
                <WorkspaceMenuDropdown
                  workspaces={workspaces || [{ id: 'ws-teste', name: workspaceName }]}
                  activeWorkspaceId={activeWorkspaceId || 'ws-teste'}
                  onSelectWorkspace={(id) => {
                    onSelectWorkspace?.(id);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  onRenameWorkspace={(id, newName) => {
                    onRenameWorkspace?.(id, newName);
                  }}
                  onCreateWorkspace={(name) => {
                    onCreateWorkspace?.(name);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  onClose={() => setIsWorkspaceMenuOpen(false)}
                  onOpenCategories={() => setIsCategoryModalOpen(true)}
                  onOpenTemplates={onOpenTemplates}
                  onOpenTrash={onOpenTrash}
                  onExportBackup={onExportBackup}
                  isDark={true}
                  style={{ left: '-36px', width: '232px' }}
                />
              )}
            </div>
          </div>

          {/* Botão Novo [+] */}
          <button
            onClick={() => onCreateNewBoard()}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#262f3f',
              border: '1px solid #333e52',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            title="Criar novo item"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Itens Principais do Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 10px', gap: '2px', flex: 1, overflowY: 'auto' }}>
          {/* Recent */}
          <button
            id="btn-sidebar-recent"
            onClick={() => {
              setCategoryFilter('recent');
              onSelectRecent?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '7px 12px',
              borderRadius: '6px',
              border: 'none',
              background: categoryFilter === 'recent' ? '#232b38' : 'transparent',
              color: categoryFilter === 'recent' ? '#f8fafc' : '#94a3b8',
              fontSize: '13px',
              fontWeight: categoryFilter === 'recent' ? 600 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={16} color={categoryFilter === 'recent' ? '#818cf8' : '#64748b'} />
            <span>Recentes</span>
          </button>

          {/* TEAMS Header com botão toggle de recolher/abrir */}
          <button
            id="btn-dashboard-toggle-teams"
            type="button"
            onClick={() => setIsTeamsOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 12px 6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              textAlign: 'left',
              width: '100%',
              transition: 'color 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.background = 'transparent';
            }}
            title={isTeamsOpen ? 'Recolher EQUIPES' : 'Expandir EQUIPES'}
          >
            {isTeamsOpen ? (
              <ChevronDown size={13} color="#64748b" />
            ) : (
              <ChevronRight size={13} color="#64748b" />
            )}
            <span>EQUIPES</span>
          </button>

          {/* Everyone at workspace (ITEM ATIVO SELECIONADO - RECOLHÍVEL) */}
          {isTeamsOpen && (
            <button
              id="btn-sidebar-everyone"
              onClick={() => {
                setCategoryFilter('all');
                onSelectAll?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 12px 7px 24px',
                borderRadius: '6px',
                border: 'none',
                background: categoryFilter === 'all' ? '#232b38' : 'transparent',
                color: categoryFilter === 'all' ? '#f8fafc' : '#94a3b8',
                fontSize: '13px',
                fontWeight: categoryFilter === 'all' ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={15} color={categoryFilter === 'all' ? '#818cf8' : '#64748b'} />
              <span>Todos em {workspaceName}</span>
            </button>
          )}

          {/* =========================================================================
              SEÇÃO DE CATEGORIAS (Whimsical Authentic Categories)
              ========================================================================= */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 12px 6px 12px',
              marginTop: '4px'
            }}
          >
            <button
              id="btn-dashboard-toggle-categories"
              type="button"
              onClick={() => setIsCategoriesOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
                textAlign: 'left',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
              title={isCategoriesOpen ? 'Recolher CATEGORIAS' : 'Expandir CATEGORIAS'}
            >
              {isCategoriesOpen ? (
                <ChevronDown size={13} color="#64748b" />
              ) : (
                <ChevronRight size={13} color="#64748b" />
              )}
              <span>CATEGORIAS</span>
            </button>

            {/* Botão rápido + para adicionar categoria */}
            <button
              id="btn-add-category"
              type="button"
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
              title="Nova Categoria"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Lista de Categorias Cadastradas */}
          {isCategoriesOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {categories.map(cat => {
                const count = boards.filter(b => b.categoryId === cat.id).length;
                const isSelected = categoryFilter === cat.id;
                const isCatMenuOpen = activeCategoryMenuId === cat.id;

                return (
                  <div
                    key={cat.id}
                    style={{ position: 'relative' }}
                  >
                    <button
                      id={`btn-cat-${cat.id}`}
                      onClick={() => {
                        setCategoryFilter(cat.id);
                        onSelectCategory?.(cat.id);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px 6px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSelected ? '#232b38' : 'transparent',
                        color: isSelected ? '#f8fafc' : '#94a3b8',
                        fontSize: '13px',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            backgroundColor: cat.color || '#818cf8',
                            flexShrink: 0
                          }}
                        />
                        <span
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {count > 0 && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              backgroundColor: isSelected ? '#334155' : '#232b38',
                              color: isSelected ? '#f8fafc' : '#64748b',
                              fontWeight: 600
                            }}
                          >
                            {count}
                          </span>
                        )}

                        <span
                          onClick={e => {
                            e.stopPropagation();
                            setActiveCategoryMenuId(isCatMenuOpen ? null : cat.id);
                          }}
                          style={{
                            padding: '2px 4px',
                            borderRadius: '4px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                          title="Opções da categoria"
                        >
                          <MoreHorizontal size={13} />
                        </span>
                      </div>
                    </button>

                    {/* Menu Popover da Categoria (Editar / Excluir) */}
                    {isCatMenuOpen && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '28px',
                          backgroundColor: '#1e2634',
                          border: '1px solid #333e50',
                          borderRadius: '6px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                          zIndex: 100,
                          minWidth: '130px',
                          padding: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <button
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setIsCategoryModalOpen(true);
                            setActiveCategoryMenuId(null);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: '#f8fafc',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <Pencil size={12} color="#94a3b8" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir a categoria "${cat.name}"? Os quadros não serão apagados, apenas desvinculados.`)) {
                              onDeleteCategory?.(cat.id);
                              if (categoryFilter === cat.id) setCategoryFilter('all');
                              setActiveCategoryMenuId(null);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: '#f87171',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash size={12} color="#f87171" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Botão + Nova Categoria */}
              <button
                id="btn-sidebar-new-category"
                onClick={() => {
                  setCategoryToEdit(null);
                  setIsCategoryModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px 6px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '2px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
              >
                <Plus size={13} />
                <span>+ Nova Categoria</span>
              </button>
            </div>
          )}
        </div>

        {/* Rodapé da Barra Lateral */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #202633', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Templates e Temas */}
          <button
            id="btn-dashboard-templates"
            onClick={onOpenTemplates}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 8px',
              borderRadius: '5px',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '12.5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Layout size={15} color="#64748b" />
            <span>Templates e Temas</span>
          </button>

          {/* Lixeira */}
          <button
            id="btn-dashboard-trash"
            onClick={onOpenTrash}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 8px',
              borderRadius: '5px',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '12.5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Trash2 size={15} color="#64748b" />
            <span>Lixeira</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          ÁREA PRINCIPAL DO DASHBOARD (Whimsical Teams Workspace View)
          ========================================================================= */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Barra Superior de Navegação / Breadcrumbs */}
        <header
          style={{
            height: '48px',
            borderBottom: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#141922' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0
          }}
        >
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  marginRight: '4px'
                }}
                title="Expandir barra lateral"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </button>
            )}
            <span style={{ color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>Equipes</span>
            <span style={{ color: '#94a3b8' }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
              <Users size={15} color="#818cf8" />
              <span>Todos em {workspaceName}</span>
              <ChevronDown size={14} color="#94a3b8" />
            </div>
            <Star size={14} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '4px' }} />
          </div>

          {/* Ações e Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Busca */}
            <button
              id="btn-dashboard-search"
              onClick={onOpenSearch}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Buscar (Ctrl+K)"
            >
              <Search size={16} />
            </button>

            {/* Agente Turbi AI (Sparkles - Conectado ao Gemini) */}
            <button
              id="btn-dash-agent"
              onClick={onOpenAskAgent}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0d9488',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Ask Turbi Agent (Gemini AI)"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </header>

        {/* Conteúdo Central */}
        <div style={{ padding: '32px 40px', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* =====================================================================
              OS 5 CARDS COLORIDOS DE CRIAÇÃO (Exact Whimsical Styling & Dimensions)
              ===================================================================== */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap'
            }}
          >
            {/* 1. + Novo Quadro (Purple #7c3aed) */}
            <button
              id="btn-dashboard-new-board"
              onClick={() => onCreateNewBoard('Sem título')}
              style={{
                width: '172px',
                height: '100px',
                borderRadius: '8px',
                backgroundColor: '#7c3aed',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8" cy="8" r="1" fill="#ffffff" />
                <circle cx="12" cy="8" r="1" fill="#ffffff" />
                <circle cx="16" cy="8" r="1" fill="#ffffff" />
                <circle cx="8" cy="12" r="1" fill="#ffffff" />
                <circle cx="12" cy="12" r="1" fill="#ffffff" />
                <circle cx="16" cy="12" r="1" fill="#ffffff" />
              </svg>
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ Novo Quadro</span>
            </button>

            {/* 2. + Novo Documento (Blue #0284c7 - Foto 1 e 2) */}
            <button
              id="btn-dashboard-new-doc"
              onClick={onOpenDoc}
              title="Editor de documentos executivos com tabelas e mapas"
              style={{
                width: '172px',
                height: '100px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <FileText size={26} color="#ffffff" />
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ Novo Documento</span>
            </button>

            {/* 3. + Assistente IA (Teal #0d9488 - Foto 1 e 3) */}
            <button
              id="btn-dashboard-action-agent"
              onClick={onOpenAskAgent}
              title="Assistente IA multimodal para pensar e desenhar diagramas"
              style={{
                width: '172px',
                height: '100px',
                borderRadius: '8px',
                backgroundColor: '#0d9488',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Sparkles size={26} color="#ffffff" />
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ Assistente IA</span>
            </button>

            {/* 4. + Criar de Modelo (Slate #475569 - Foto 1 e 4) */}
            <button
              id="btn-dashboard-action-template"
              onClick={onOpenTemplates}
              title="Biblioteca de modelos corporativos pré-estruturados"
              style={{
                width: '172px',
                height: '100px',
                borderRadius: '8px',
                backgroundColor: '#475569',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(71, 85, 105, 0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Layout size={26} color="#ffffff" />
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ Criar de Modelo</span>
            </button>
          </div>

          {/* Barra de Filtros & Modo de Visualização */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderBottom: isDark ? '1px solid #1f2735' : '1px solid #e2e8f0',
              paddingBottom: '12px'
            }}
          >
            {/* Filtros à Esquerda */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
              <button
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isSortMenuOpen ? (isDark ? '#232b38' : '#e2e8f0') : 'transparent',
                  border: 'none',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.15s'
                }}
                title="Ordenar projetos"
              >
                <span>
                  {sortOption === 'created-desc' && 'Data de criação ↓'}
                  {sortOption === 'created-asc' && 'Data de criação ↑'}
                  {sortOption === 'alpha' && 'Título (A - Z)'}
                  {sortOption === 'modified' && 'Última modificação ↓'}
                </span>
                <ChevronDown size={13} color="#94a3b8" />
              </button>

              {/* Menu Dropdown de Ordenação */}
              {isSortMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    backgroundColor: isDark ? '#1a222f' : '#ffffff',
                    border: isDark ? '1px solid #2e394b' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                    zIndex: 50,
                    minWidth: '220px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <button
                    onClick={() => { setSortOption('created-desc'); setIsSortMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: sortOption === 'created-desc' ? (isDark ? '#263143' : '#f1f5f9') : 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>Data de criação (recente)</span>
                    {sortOption === 'created-desc' && <span style={{ color: '#818cf8', fontWeight: 700 }}>✓</span>}
                  </button>
                  <button
                    onClick={() => { setSortOption('created-asc'); setIsSortMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: sortOption === 'created-asc' ? (isDark ? '#263143' : '#f1f5f9') : 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>Data de criação (antigo)</span>
                    {sortOption === 'created-asc' && <span style={{ color: '#818cf8', fontWeight: 700 }}>✓</span>}
                  </button>
                  <button
                    onClick={() => { setSortOption('alpha'); setIsSortMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: sortOption === 'alpha' ? (isDark ? '#263143' : '#f1f5f9') : 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>Ordem alfabética (A - Z)</span>
                    {sortOption === 'alpha' && <span style={{ color: '#818cf8', fontWeight: 700 }}>✓</span>}
                  </button>
                  <button
                    onClick={() => { setSortOption('modified'); setIsSortMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: sortOption === 'modified' ? (isDark ? '#263143' : '#f1f5f9') : 'transparent',
                      border: 'none',
                      borderRadius: '5px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>Última modificação</span>
                    {sortOption === 'modified' && <span style={{ color: '#818cf8', fontWeight: 700 }}>✓</span>}
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Mais opções de ordenação"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Alternância Grid / List à Direita */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isDark ? '#1b222f' : '#f1f5f9',
                borderRadius: '6px',
                padding: '2px',
                border: isDark ? '1px solid #2d3848' : '1px solid #e2e8f0'
              }}
            >
              <button
                onClick={() => setDisplayMode('grid')}
                style={{
                  padding: '4px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  background: displayMode === 'grid' ? (isDark ? '#2e384b' : '#ffffff') : 'transparent',
                  color: displayMode === 'grid' ? (isDark ? '#f8fafc' : '#0f172a') : '#94a3b8',
                  boxShadow: displayMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Modo Grade"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                style={{
                  padding: '4px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  background: displayMode === 'list' ? (isDark ? '#2e384b' : '#ffffff') : 'transparent',
                  color: displayMode === 'list' ? (isDark ? '#f8fafc' : '#0f172a') : '#94a3b8',
                  boxShadow: displayMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Modo Lista"
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Seção Hoje ou Categoria com Grid de Boards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(() => {
              const selectedCat = categories.find(c => c.id === categoryFilter);
              if (selectedCat) {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: selectedCat.color || '#818cf8' }} />
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                        Categoria: {selectedCat.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        ({displayBoards.length} {displayBoards.length === 1 ? 'quadro' : 'quadros'})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        onSelectAll?.();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#818cf8',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ← Ver todos os quadros
                    </button>
                  </div>
                );
              }
              if (categoryFilter === 'recent') {
                return (
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                    Recentes ({displayBoards.length})
                  </h3>
                );
              }
              return (
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                  Hoje ({displayBoards.length})
                </h3>
              );
            })()}

            {/* Estado Vazio de Categoria */}
            {displayBoards.length === 0 && (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: isDark ? '1px dashed #2d3848' : '1px dashed #cbd5e1',
                  backgroundColor: isDark ? '#161d28' : '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Folder size={32} color="#64748b" />
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: isDark ? '#f8fafc' : '#1e293b' }}>
                    Nenhum quadro encontrado
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
                    {categoryFilter !== 'all' && categoryFilter !== 'recent'
                      ? 'Nenhum projeto associado a esta categoria ainda. Mova um quadro existente ou crie um novo.'
                      : 'Nenhum quadro corresponde à sua pesquisa.'}
                  </p>
                </div>
                {categoryFilter !== 'all' && categoryFilter !== 'recent' && (
                  <button
                    onClick={() => onCreateNewBoard('Sem título', categoryFilter)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#818cf8',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} />
                    <span>+ Criar quadro nesta categoria</span>
                  </button>
                )}
              </div>
            )}

            {displayBoards.length > 0 && displayMode === 'grid' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '20px'
                }}
              >
                {displayBoards.map(board => {
                  const isMenuOpen = activeBoardMenuId === board.id;
                  const isEditing = editingBoardId === board.id;

                  return (
                    <a
                      key={board.id}
                      href={`/board/${encodeURIComponent(board.id)}`}
                      className="board-card board-grid-card"
                      data-board-id={board.id}
                      onClick={e => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        onOpenBoard(board.id);
                      }}
                      style={{
                        height: '205px',
                        borderRadius: '10px',
                        border: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
                        backgroundColor: isDark ? '#19202c' : '#ffffff',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = isDark
                          ? '0 12px 28px rgba(0, 0, 0, 0.45)'
                          : '0 12px 26px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0,0,0,0.03)';
                        e.currentTarget.style.borderColor = '#818cf8';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = isDark ? '#232c3d' : '#e2e8f0';
                      }}
                    >
                      {/* Cabeçalho do Card com Ícone Roxo, Título e Categoria */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '11px 14px 10px 14px',
                          borderBottom: isDark ? '1px solid #202735' : '1px solid #f1f5f9',
                          backgroundColor: isDark ? '#1b2331' : '#fafafa',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            {/* Ícone de Board Roxo */}
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <rect x="3" y="3" width="18" height="18" rx="3" />
                              <circle cx="8" cy="8" r="1" fill="#7c3aed" />
                              <circle cx="12" cy="8" r="1" fill="#7c3aed" />
                              <circle cx="16" cy="8" r="1" fill="#7c3aed" />
                            </svg>

                            {isEditing ? (
                              <input
                                autoFocus
                                value={editTitle}
                                onClick={e => e.stopPropagation()}
                                onChange={e => setEditTitle(e.target.value)}
                                onBlur={() => {
                                  if (editTitle.trim()) onRenameBoard(board.id, editTitle.trim());
                                  setEditingBoardId(null);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    if (editTitle.trim()) onRenameBoard(board.id, editTitle.trim());
                                    setEditingBoardId(null);
                                  }
                                }}
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #6366f1',
                                  outline: 'none',
                                  width: '100%'
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  fontSize: '13.5px',
                                  fontWeight: 600,
                                  color: isDark ? '#f8fafc' : '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                title={board.title}
                              >
                                {board.title || 'Sem título'}
                              </span>
                            )}
                          </div>

                          {/* Linha de Categoria e Metadados abaixo do título */}
                          {(() => {
                            const boardCat = categories.find(c => c.id === board.categoryId);
                            if (!boardCat) return null;
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '23px' }}>
                                <span
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setBoardToMove(board);
                                  }}
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: isDark ? '#232c3f' : '#f1f5f9',
                                    color: boardCat.color || '#818cf8',
                                    border: `1px solid ${boardCat.color ? boardCat.color + '44' : '#818cf844'}`,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
                                  }}
                                  title="Clique para mudar a categoria"
                                >
                                  {boardCat.name}
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Menu de Ações (3 Pontinhos) */}
                        <div style={{ position: 'relative' }}>
                          <button
                            id={`btn-board-menu-${board.id}`}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveBoardMenuId(isMenuOpen ? null : board.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              borderRadius: '4px'
                            }}
                          >
                            <MoreHorizontal size={15} />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={e => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '24px',
                                backgroundColor: isDark ? '#1e2634' : '#ffffff',
                                border: isDark ? '1px solid #333e50' : '1px solid #e2e8f0',
                                borderRadius: '6px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                zIndex: 100,
                                width: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '4px',
                                gap: '2px'
                              }}
                            >
                              <button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingBoardId(board.id);
                                  setEditTitle(board.title);
                                  setActiveBoardMenuId(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: isDark ? '#f1f5f9' : '#1e293b',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <Pencil size={13} color="#94a3b8" />
                                <span>Renomear</span>
                              </button>
                              <button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDuplicateBoard(board.id);
                                  setActiveBoardMenuId(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: isDark ? '#f1f5f9' : '#1e293b',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <Copy size={13} color="#94a3b8" />
                                <span>Duplicar</span>
                              </button>
                              <button
                                id={`btn-move-board-${board.id}`}
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setBoardToMove(board);
                                  setActiveBoardMenuId(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: isDark ? '#f1f5f9' : '#1e293b',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <Folder size={13} color="#94a3b8" />
                                <span>Mover Categoria</span>
                              </button>
                              <div style={{ height: '1px', backgroundColor: isDark ? '#2d3748' : '#e2e8f0', margin: '2px 0' }} />
                              <button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDeleteBoard(board.id);
                                  setActiveBoardMenuId(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#ef4444',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <Trash size={13} color="#ef4444" />
                                <span>Excluir</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    {/* Prévia Visual Dinâmica e Real do Conteúdo do Board */}
                    {(() => {
                      const isStickies = (board.stickies?.length || 0) > 0 && (board.mindMapNodes?.length || 0) <= 1;
                      const isWireframe = (board.wireframes?.length || 0) > 0 && (board.mindMapNodes?.length || 0) <= 1;
                      const isDoc = ((board.texts?.length || 0) > 0 || board.title?.toLowerCase().includes('doc')) && (board.mindMapNodes?.length || 0) <= 1 && (board.stickies?.length || 0) === 0;

                      let badgeText = '';
                      if (isStickies) {
                        badgeText = `${board.stickies.length} ${board.stickies.length === 1 ? 'nota' : 'notas'}`;
                      } else if (isWireframe) {
                        badgeText = `${board.wireframes.length} componentes`;
                      } else if (isDoc) {
                        badgeText = 'Documento';
                      } else if ((board.mindMapNodes?.length || 0) > 1) {
                        badgeText = `${board.mindMapNodes.length} tópicos`;
                      }

                      return (
                        <div
                          style={{
                            flex: 1,
                            backgroundColor: isDark ? '#141a24' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <BoardThumbnailPreview board={board} isDark={isDark} />

                          {badgeText && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '10px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: isDark ? 'rgba(20, 26, 36, 0.88)' : 'rgba(255, 255, 255, 0.94)',
                                backdropFilter: 'blur(4px)',
                                border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                                color: isDark ? '#94a3b8' : '#64748b',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '-0.01em',
                                pointerEvents: 'none',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
                              }}
                            >
                              {badgeText}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    </a>
                  );
                })}
              </div>
            ) : displayBoards.length > 0 ? (
              /* Modo Lista */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#19202c' : '#ffffff',
                  overflow: 'hidden'
                }}
              >
                {displayBoards.map(board => {
                  const boardCat = categories.find(c => c.id === board.categoryId);
                  return (
                    <div
                      key={board.id}
                      className="board-card board-list-item"
                      data-board-id={board.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 18px',
                        borderBottom: isDark ? '1px solid #202735' : '1px solid #f1f5f9',
                        transition: 'background-color 0.12s'
                      }}
                    >
                      <a
                        href={`/board/${encodeURIComponent(board.id)}`}
                        onClick={e => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                          e.preventDefault();
                          onOpenBoard(board.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textDecoration: 'none',
                          color: 'inherit',
                          flex: 1,
                          minWidth: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8" cy="8" r="1" fill="#7c3aed" />
                          <circle cx="12" cy="8" r="1" fill="#7c3aed" />
                          <circle cx="16" cy="8" r="1" fill="#7c3aed" />
                        </svg>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {board.title || 'Sem título'}
                        </span>
                      </a>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Badge de Categoria Clicável */}
                        <button
                          type="button"
                          onClick={() => setBoardToMove(board)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: boardCat
                              ? (isDark ? '#232c3f' : '#f1f5f9')
                              : 'transparent',
                            color: boardCat ? (boardCat.color || '#818cf8') : '#64748b',
                            border: boardCat
                              ? `1px solid ${boardCat.color ? boardCat.color + '44' : '#818cf844'}`
                              : '1px dashed #64748b44',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Mudar categoria"
                        >
                          <Tag size={12} />
                          <span>{boardCat ? boardCat.name : 'Sem Categoria'}</span>
                        </button>

                        <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '75px', textAlign: 'right' }}>
                          {new Date(board.updatedAt || Date.now()).toLocaleDateString('pt-BR')}
                        </span>

                        <button
                          type="button"
                          onClick={() => setBoardToMove(board)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Mover para categoria"
                        >
                          <Folder size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Botão de Atalho no Canto Inferior Direito */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000
          }}
        >
          <button
            id="btn-dashboard-spark"
            onClick={onOpenQuickSpark || onOpenSearch}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: isDark ? '#232b38' : '#ffffff',
              border: isDark ? '1px solid #333f52' : '1px solid #e2e8f0',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.15s ease, border-color 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.borderColor = '#f59e0b';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = isDark ? '#333f52' : '#e2e8f0';
            }}
            title="Whimflow Spark: Criação Relâmpago, Text-to-Map e Frameworks (Ctrl+J)"
          >
            ⚡
          </button>
          <button
            onClick={onOpenShortcuts}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: isDark ? '#232b38' : '#ffffff',
              border: isDark ? '1px solid #333f52' : '1px solid #e2e8f0',
              color: isDark ? '#f1f5f9' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            title="Ajuda e Atalhos do Teclado (?)"
          >
            ?
          </button>
        </div>

        {/* Modal de Criação / Edição de Categorias */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setCategoryToEdit(null);
          }}
          categoryToEdit={categoryToEdit}
          onSave={cat => {
            onSaveCategory?.(cat);
            setIsCategoryModalOpen(false);
            setCategoryToEdit(null);
          }}
          onDelete={catId => {
            onDeleteCategory?.(catId);
            setIsCategoryModalOpen(false);
            setCategoryToEdit(null);
          }}
          theme={theme}
        />

        {/* Modal de Mover Projeto para Categoria */}
        <MoveCategoryModal
          isOpen={boardToMove !== null}
          onClose={() => setBoardToMove(null)}
          board={boardToMove}
          categories={categories}
          onSelectCategory={(boardId, catId) => {
            onMoveBoardCategory?.(boardId, catId);
            setBoardToMove(null);
          }}
          onCreateNewCategory={() => {
            setBoardToMove(null);
            setCategoryToEdit(null);
            setIsCategoryModalOpen(true);
          }}
          theme={theme}
        />
      </main>
    </div>
  );
};
