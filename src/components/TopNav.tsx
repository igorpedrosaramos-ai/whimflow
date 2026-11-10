import React from 'react';
import { 
  Sidebar as SidebarIcon, 
  Share2, 
  Play, 
  Plus, 
  Sun, 
  Moon, 
  ChevronRight, 
  ChevronDown, 
  Star, 
  Search, 
  Command, 
  Users,
  Grid,
  Clock,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { Board } from '../types';

interface TopNavProps {
  boardTitle: string;
  onUpdateTitle: (title: string) => void;
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (id: string) => void;
  onCreateNewBoard: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenShare: () => void;
  onStartPresentation: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalObjects?: number;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onNavigateToDashboard?: () => void;
  onOpenSearch?: () => void;
  onOpenAgent?: () => void;
  onOpenVersionHistory?: () => void;
  onOpenBoardStats?: () => void;
  workspaceName?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  boardTitle,
  onUpdateTitle,
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateNewBoard,
  sidebarOpen,
  onToggleSidebar,
  onOpenShare,
  onStartPresentation,
  theme,
  onToggleTheme,
  onNavigateToDashboard,
  onOpenSearch,
  onOpenAgent,
  onOpenVersionHistory,
  onOpenBoardStats,
  totalObjects = 0,
  workspaceName = 'teste'
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className="top-navbar"
      style={{
        height: '48px',
        backgroundColor: isDark ? '#141922' : '#ffffff',
        borderBottom: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      {/* Esquerda: Breadcrumb Autêntico do Whimsical */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
        {/* Toggle da Barra Lateral */}
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: isDark ? '#94a3b8' : '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px'
          }}
          title={sidebarOpen ? 'Recolher Menu (Ctrl+B)' : 'Expandir Menu (Ctrl+B)'}
        >
          <SidebarIcon size={17} />
        </button>

        {/* Link para o Dashboard / Workspace */}
        <div
          onClick={onNavigateToDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'color 0.15s'
          }}
          title="Voltar ao Painel Principal / Dashboard"
          onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
          onMouseLeave={e => (e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b')}
        >
          <span>Teams</span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <Users size={14} color="#818cf8" />
          <span>Everyone at {workspaceName}</span>
        </div>

        {/* Separador de Navegação */}
        <ChevronRight size={13} color="#94a3b8" style={{ flexShrink: 0 }} />

        {/* Bloco de Título do Quadro Atual */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: 0,
            flex: '0 1 auto',
            backgroundColor: isDark ? '#1a222f' : '#f8fafc',
            padding: '3px 8px 3px 6px',
            borderRadius: '6px',
            border: isDark ? '1px solid #2a3446' : '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          {/* Ícone Roxo do Board */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8" cy="8" r="1" fill="#7c3aed" />
            <circle cx="12" cy="8" r="1" fill="#7c3aed" />
            <circle cx="16" cy="8" r="1" fill="#7c3aed" />
          </svg>

          {/* Campo Editável de Título */}
          <input
            type="text"
            value={boardTitle}
            onChange={e => onUpdateTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontWeight: 600,
              fontSize: '13px',
              padding: '1px 2px',
              outline: 'none',
              minWidth: '60px',
              maxWidth: '220px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
            title="Clique para renomear este quadro"
          />

          {/* Seletor Dropdown Rápido */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <select
              value={activeBoardId}
              onChange={e => {
                if (e.target.value === 'NEW') onCreateNewBoard();
                else onSelectBoard(e.target.value);
              }}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                zIndex: 2
              }}
              title="Trocar para outro quadro"
            >
              <option value="" disabled>Alternar Quadro...</option>
              {boards.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title || 'untitled'}
                </option>
              ))}
              <option value="NEW">+ Novo Quadro em Branco...</option>
            </select>
            <ChevronDown size={12} color="#94a3b8" />
          </div>
        </div>

        {/* Estrela de Favorito */}
        <Star size={14} color="#94a3b8" style={{ cursor: 'pointer', flexShrink: 0 }} />
      </div>

      {/* Direita: Presença, Compartilhar, Apresentar, Atalhos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Contador de Objetos Ilimitados Pro / Estatísticas do Quadro */}
        {onOpenBoardStats && (
          <button
            onClick={onOpenBoardStats}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: isDark ? '1px solid #2a3444' : '1px solid #e2e8f0',
              backgroundColor: isDark ? '#1a222f' : '#f8fafc',
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '11.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Estatísticas e Métricas do Quadro (Objetos Ilimitados Pro)"
          >
            <BarChart2 size={13} color="#818cf8" />
            <span>{totalObjects} objetos</span>
          </button>
        )}

        {/* Histórico de Versões Ilimitado (Time Machine / Milestones) */}
        {onOpenVersionHistory && (
          <button
            onClick={onOpenVersionHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Histórico de Versões e Marcos (Histórico Ilimitado Pro)"
          >
            <Clock size={15} />
          </button>
        )}

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

        {/* Botão de Navegar para o Dashboard */}
        {onNavigateToDashboard && (
          <button
            id="btn-goto-dashboard"
            onClick={onNavigateToDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: isDark ? '#1e2634' : '#f1f5f9',
              border: isDark ? '1px solid #2e3a4e' : '1px solid #e2e8f0',
              color: isDark ? '#f1f5f9' : '#334155',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Ir para o Dashboard de Quadros"
          >
            <Grid size={14} />
            <span>Dashboard</span>
          </button>
        )}

        {/* Botão Compartilhar */}
        <button
          onClick={onOpenShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#7c3aed',
            border: 'none',
            color: '#ffffff',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)'
          }}
          title="Compartilhar Link ou Exportar"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>

        {/* Botão ▷ Present */}
        <button
          onClick={onStartPresentation}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: isDark ? '#232b38' : '#f1f5f9',
            border: isDark ? '1px solid #333f52' : '1px solid #e2e8f0',
            color: isDark ? '#f8fafc' : '#0f172a',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Apresentação em Tela Cheia (F5)"
        >
          <Play size={12} fill="currentColor" />
          <span>Present</span>
        </button>

        {/* Busca */}
        <button
          id="btn-topnav-search"
          onClick={onOpenSearch}
          style={{
            background: 'transparent',
            border: 'none',
            color: isDark ? '#94a3b8' : '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Buscar (Ctrl+K)"
        >
          <Search size={16} />
        </button>

        {/* Agente AI (Sparkles - Conectado ao Gemini) */}
        {onOpenAgent && (
          <button
            id="btn-topnav-agent"
            onClick={onOpenAgent}
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
        )}

        {/* Alternador de Tema */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: isDark ? '#94a3b8' : '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
