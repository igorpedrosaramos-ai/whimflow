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
  FolderOpen,
  LayoutGrid
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
  totalObjects,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  return (
    <header className="top-navbar">
      {/* Esquerda: Toggle Sidebar, Seletor de Quadros e Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="tool-button"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Ocultar Painel de Projetos" : "Exibir Painel de Projetos"}
          style={{ width: '32px', height: '32px' }}
        >
          <SidebarIcon size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
          {/* Seletor de Quadros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <FolderOpen size={16} color="var(--accent-purple-light)" />
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
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Alternar Projeto"
            >
              {boards.map(b => (
                <option key={b.id} value={b.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  {b.title}
                </option>
              ))}
              <option value="NEW" style={{ background: 'var(--bg-surface)', color: 'var(--accent-purple-light)', fontWeight: 700 }}>
                + Novo Quadro...
              </option>
            </select>
          </div>

          <ChevronRight size={14} color="var(--text-muted)" className="breadcrumb-chevron" />

          {/* Edição Rápida do Título */}
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px dashed transparent',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '14px',
              padding: '2px 6px',
              borderRadius: '4px',
              outline: 'none',
              minWidth: '100px',
              maxWidth: '240px'
            }}
            onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-purple)'}
            onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
            title="Clique para renomear este projeto"
          />
        </div>
      </div>

      {/* Centro: Desfazer / Refazer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="tool-button"
            style={{ width: '30px', height: '30px', opacity: canUndo ? 1 : 0.4 }}
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
            style={{ width: '30px', height: '30px', opacity: canRedo ? 1 : 0.4 }}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
        )}
      </div>

      {/* Direita: Criar Novo, Compartilhar, Apresentar, Tema */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Botão + Novo Quadro */}
        <button
          onClick={onCreateNewBoard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-purple-light)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
          title="Criar um Novo Quadro (Do Zero)"
        >
          <Plus size={15} />
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
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(99, 102, 241, 0.35)'
          }}
          title="Compartilhar Link ou Exportar"
        >
          <Share2 size={15} />
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
            fontSize: '13px',
            fontWeight: 500
          }}
          title="Modo Apresentação Executiva em Tela Cheia"
        >
          <Play size={15} />
          <span className="nav-btn-text">Apresentar</span>
        </button>

        {/* Alternador de Tema */}
        <button
          onClick={onToggleTheme}
          className="tool-button"
          title={theme === 'dark' ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
          style={{ width: '34px', height: '34px' }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
