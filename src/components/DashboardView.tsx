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
  Pencil
} from 'lucide-react';
import { Board } from '../types';

interface DashboardViewProps {
  boards: Board[];
  onOpenBoard: (boardId: string) => void;
  onCreateNewBoard: (title?: string) => void;
  onOpenDoc: () => void;
  onOpenAskAgent: () => void;
  onOpenTemplates: () => void;
  onDuplicateBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, newTitle: string) => void;
  onOpenTrash?: () => void;
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
  workspaceName?: string;
  theme?: 'dark' | 'light';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  boards,
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
  workspaceName = 'teste',
  theme = 'light'
}) => {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [isDownloadCardDismissed, setIsDownloadCardDismissed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeBoardMenuId, setActiveBoardMenuId] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'recent' | 'private'>('all');
  const [sortOption, setSortOption] = useState<'created-desc' | 'created-asc' | 'alpha' | 'modified'>('created-desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  let displayBoards = boards.filter(b => {
    if (searchFilter.trim() && !b.title.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    if (categoryFilter === 'private') {
      return !!b.isPrivate;
    }
    return true;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
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
                fontSize: '11px'
              }}
            >
              {workspaceName.charAt(0).toUpperCase()}
            </div>

            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
              {workspaceName}
            </span>
            <ChevronDown size={14} color="#64748b" />
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
            onClick={() => setCategoryFilter('recent')}
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
            <span>Recent</span>
          </button>

          {/* PRIVATE */}
          <div
            onClick={() => setCategoryFilter(categoryFilter === 'private' ? 'all' : 'private')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 12px 4px 12px',
              fontSize: '11px',
              fontWeight: 700,
              color: categoryFilter === 'private' ? '#818cf8' : '#64748b',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            title="Filtrar quadros privados"
          >
            <ChevronRight size={13} color={categoryFilter === 'private' ? '#818cf8' : '#64748b'} />
            <span>PRIVATE</span>
          </div>

          {/* TEAMS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 12px 4px 12px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}
          >
            <ChevronDown size={13} color="#64748b" />
            <span>TEAMS</span>
          </div>

          {/* Everyone at workspace (ITEM ATIVO SELECIONADO) */}
          <button
            onClick={() => setCategoryFilter('all')}
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
            <span>Everyone at {workspaceName}</span>
          </button>
        </div>

        {/* Rodapé da Barra Lateral */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #202633', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Templates & color themes */}
          <button
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
            <span>Templates & color themes</span>
          </button>

          {/* Trash */}
          <button
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
            <span>Trash</span>
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
            <span style={{ color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>Teams</span>
            <span style={{ color: '#94a3b8' }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
              <Users size={15} color="#818cf8" />
              <span>Everyone at {workspaceName}</span>
              <ChevronDown size={14} color="#94a3b8" />
            </div>
            <Star size={14} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '4px' }} />
          </div>

          {/* Ações e Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

            {/* Avatar do Usuário */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px 2px 4px',
                borderRadius: '14px',
                backgroundColor: isDark ? '#232b38' : '#f1f5f9',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}
              >
                I
              </div>
              <span style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>1</span>
            </div>

            {/* Busca */}
            <button
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
            {/* 1. + New Board (Purple #7c3aed) */}
            <button
              onClick={() => onCreateNewBoard('untitled')}
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
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ New Board</span>
            </button>

            {/* 2. + New Doc (Blue #0284c7 - Foto 1 e 2) */}
            <button
              onClick={onOpenDoc}
              title="Text editing with tables and embeds"
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
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ New Doc</span>
            </button>

            {/* 3. + Ask agent (Teal #0d9488 - Foto 1 e 3) */}
            <button
              onClick={onOpenAskAgent}
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
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ Ask agent</span>
            </button>

            {/* 4. + New from template (Slate #475569 - Foto 1 e 4) */}
            <button
              onClick={onOpenTemplates}
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
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ New from template</span>
            </button>

            {/* 5. + New folder (Gray #64748b - Foto 1) */}
            <button
              onClick={() => onCreateNewBoard('Nova Pasta')}
              style={{
                width: '172px',
                height: '100px',
                borderRadius: '8px',
                backgroundColor: '#64748b',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(100, 116, 139, 0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Folder size={26} color="#ffffff" />
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>+ New folder</span>
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
                  {sortOption === 'created-desc' && 'Date created ↓'}
                  {sortOption === 'created-asc' && 'Date created ↑'}
                  {sortOption === 'alpha' && 'Title (A - Z)'}
                  {sortOption === 'modified' && 'Last modified ↓'}
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

          {/* Seção Today com Grid de Boards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
              Today
            </h3>

            {displayMode === 'grid' ? (
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
                    <div
                      key={board.id}
                      onClick={() => onOpenBoard(board.id)}
                      style={{
                        height: '190px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
                        backgroundColor: isDark ? '#19202c' : '#ffffff',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDark
                          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                          : '0 8px 20px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = '#818cf8';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = isDark ? '#232c3d' : '#e2e8f0';
                      }}
                    >
                      {/* Cabeçalho do Card com Ícone Roxo e Título */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderBottom: isDark ? '1px solid #202735' : '1px solid #f1f5f9',
                          backgroundColor: isDark ? '#1b2331' : '#fafafa'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          {/* Ícone de Board Roxo */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: isDark ? '#f8fafc' : '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {board.title || 'untitled'}
                            </span>
                          )}
                        </div>

                        {/* Menu de Ações (3 Pontinhos) */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={e => {
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
                                onClick={() => {
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
                                onClick={() => {
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
                              <div style={{ height: '1px', backgroundColor: isDark ? '#2d3748' : '#e2e8f0', margin: '2px 0' }} />
                              <button
                                onClick={() => {
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

                      {/* Prévia Visual do Conteúdo do Board */}
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: isDark ? '#141a24' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '14px',
                          position: 'relative'
                        }}
                      >
                        {/* Ilustração sutil dos nós */}
                        <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
                          <line x1="40" y1="50" x2="100" y2="30" stroke="#818cf8" strokeWidth="1.5" />
                          <line x1="40" y1="50" x2="100" y2="70" stroke="#818cf8" strokeWidth="1.5" />
                          <line x1="100" y1="30" x2="160" y2="20" stroke="#c084fc" strokeWidth="1.5" />
                          <line x1="100" y1="30" x2="160" y2="45" stroke="#c084fc" strokeWidth="1.5" />

                          <rect x="15" y="40" width="50" height="20" rx="4" fill="#7c3aed" />
                          <rect x="85" y="20" width="45" height="18" rx="3" fill={isDark ? '#263143' : '#f1f5f9'} stroke="#818cf8" strokeWidth="1" />
                          <rect x="85" y="60" width="45" height="18" rx="3" fill={isDark ? '#263143' : '#f1f5f9'} stroke="#818cf8" strokeWidth="1" />
                          <rect x="145" y="12" width="40" height="16" rx="3" fill={isDark ? '#263143' : '#f1f5f9'} stroke="#c084fc" strokeWidth="1" />
                          <rect x="145" y="38" width="40" height="16" rx="3" fill={isDark ? '#263143' : '#f1f5f9'} stroke="#c084fc" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
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
                {displayBoards.map(board => (
                  <div
                    key={board.id}
                    onClick={() => onOpenBoard(board.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 18px',
                      borderBottom: isDark ? '1px solid #202735' : '1px solid #f1f5f9',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8" cy="8" r="1" fill="#7c3aed" />
                        <circle cx="12" cy="8" r="1" fill="#7c3aed" />
                        <circle cx="16" cy="8" r="1" fill="#7c3aed" />
                      </svg>
                      <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{board.title || 'untitled'}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(board.updatedAt || Date.now()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
            onClick={onOpenSearch}
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
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            title="Ações Rápidas e Busca (Ctrl+K)"
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
      </main>
    </div>
  );
};
