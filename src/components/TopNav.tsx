import React from 'react';
import { 
  Sidebar as SidebarIcon, 
  Share2, 
  Play, 
  Plus, 
  Undo2, 
  Redo2, 
  Sun, 
  Moon, 
  ChevronRight,
  FolderOpen
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
  totalObjects: number;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
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
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  return (
    <header className="top-navbar">
      {/* Esquerda: Logo / Marca Mapa Mental Turbine + Seletor de Projetos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 1 }}>
        <button
          className="tool-button"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Ocultar Painel de Projetos (Ctrl+B)" : "Exibir Painel de Projetos (Ctrl+B)"}
          style={{ width: '32px', height: '32px', flexShrink: 0 }}
        >
          <SidebarIcon size={18} />
        </button>

        {/* Brand Badge Oficial: Mapa Mental Turbine */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0
          }}
          onClick={() => {
            if (!sidebarOpen) onToggleSidebar();
          }}
          title="Mapa Mental Turbine"
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="4" fill="#6366f1" />
              <path d="M16 5v6M16 21v6M5 16h6M21 16h6M8.2 8.2l4.3 4.3M19.5 19.5l4.3 4.3M8.2 23.8l4.3-4.3M19.5 12.5l4.3-4.3" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="brand-logo-text" style={{ 
            fontWeight: 800, 
            fontSize: '13.5px', 
            letterSpacing: '-0.02em', 
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap'
          }}>
            Mapa Mental Turbine
          </span>
        </div>

        {/* Separador de Navegação */}
        <ChevronRight size={14} color="var(--text-muted)" className="breadcrumb-chevron" style={{ flexShrink: 0 }} />

        {/* Seletor Rápido de Projetos & Edição de Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
          <FolderOpen size={15} color="var(--accent-purple-light)" style={{ flexShrink: 0 }} />
          
          <select
            value={activeBoardId}
            onChange={(e) => {
              if (e.target.value === 'NEW') {
                onCreateNewBoard();
              } else {
                onSelectBoard(e.target.value);
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '160px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
            title="Alternar entre Projetos Salvos"
          >
            {boards.map(b => (
              <option key={b.id} value={b.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {b.title}
              </option>
            ))}
            <option value="NEW" style={{ background: 'var(--bg-surface)', color: 'var(--accent-purple-light)', fontWeight: 700 }}>
              + Novo Projeto...
            </option>
          </select>

          {/* Campo de Edição do Nome do Projeto Ativo */}
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px dashed var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '13px',
              padding: '2px 4px',
              borderRadius: '3px',
              outline: 'none',
              minWidth: '80px',
              maxWidth: '180px',
              textOverflow: 'ellipsis'
            }}
            onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-purple)'}
            onBlur={(e) => e.target.style.borderBottomColor = 'var(--border-subtle)'}
            title="Clique para renomear este projeto"
          />
        </div>
      </div>

      {/* Centro: Desfazer / Refazer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="tool-button"
            style={{ width: '30px', height: '30px', opacity: canUndo ? 1 : 0.35 }}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="tool-button"
            style={{ width: '30px', height: '30px', opacity: canRedo ? 1 : 0.35 }}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
        )}
      </div>

      {/* Direita: Ações Principais (Novo Quadro, Compartilhar, Apresentar, Tema) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Botão + Novo Quadro */}
        <button
          onClick={onCreateNewBoard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '6px 11px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 600
          }}
          title="Criar um Novo Quadro em Branco"
        >
          <Plus size={14} color="var(--accent-purple-light)" />
          <span className="nav-btn-text">Novo Quadro</span>
        </button>

        {/* Compartilhar Link */}
        <button
          onClick={onOpenShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            padding: '6px 13px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)'
          }}
          title="Compartilhar Link Público ou Exportar (PPTX, PDF, PNG)"
        >
          <Share2 size={14} />
          <span className="nav-btn-text">Compartilhar</span>
        </button>

        {/* Apresentar */}
        <button
          onClick={onStartPresentation}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 600
          }}
          title="Modo Apresentação Executiva em Tela Cheia (F5)"
        >
          <Play size={14} />
          <span className="nav-btn-text">Apresentar</span>
        </button>

        {/* Alternador de Tema */}
        <button
          onClick={onToggleTheme}
          className="tool-button"
          title={theme === 'dark' ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
          style={{ width: '32px', height: '32px' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
