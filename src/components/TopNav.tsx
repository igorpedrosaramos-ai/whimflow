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
  ChevronDown
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
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
          onClick={onToggleSidebar}
          title="Mapa Mental Turbine • Painel de Projetos"
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
        <ChevronRight size={13} color="var(--text-muted)" className="breadcrumb-chevron" style={{ flexShrink: 0 }} />

        {/* Bloco de Título do Projeto & Dropdown Rápido (Sem duplicação de texto) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          minWidth: 0, 
          flex: '0 1 auto',
          backgroundColor: 'var(--bg-canvas)',
          padding: '2px 8px 2px 6px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}>
          <FolderOpen size={14} color="var(--accent-purple-light)" style={{ flexShrink: 0 }} />
          
          {/* Campo de Edição do Título */}
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '13px',
              padding: '1px 2px',
              outline: 'none',
              minWidth: '50px',
              maxWidth: '180px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
            title="Clique para editar o nome do projeto"
          />

          {/* Seletor dropdown integrado ao lado do título */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <select
              value={activeBoardId}
              onChange={(e) => {
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
              title="Trocar para outro projeto salvo"
            >
              <option value="" disabled>Alternar Projeto...</option>
              {boards.map(b => (
                <option key={b.id} value={b.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  {b.title}
                </option>
              ))}
              <option value="NEW" style={{ background: 'var(--bg-surface)', color: 'var(--accent-purple-light)', fontWeight: 700 }}>
                + Novo Projeto em Branco...
              </option>
            </select>
            <div style={{
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}>
              <ChevronDown size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Centro: Desfazer / Refazer (Ocultado em telas pequenas para economizar espaço) */}
      <div className="undo-redo-group" style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, margin: '0 4px' }}>
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="tool-button"
            style={{ width: '28px', height: '28px', opacity: canUndo ? 1 : 0.3 }}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="tool-button"
            style={{ width: '28px', height: '28px', opacity: canRedo ? 1 : 0.3 }}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        )}
      </div>

      {/* Direita: Ações Principais (Novo Quadro, Compartilhar, Apresentar, Tema) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Botão + Novo Quadro */}
        <button
          onClick={onCreateNewBoard}
          className="nav-action-btn secondary"
          title="Criar um Novo Quadro em Branco"
        >
          <Plus size={14} color="var(--accent-purple-light)" />
          <span className="nav-btn-text">Novo</span>
        </button>

        {/* Compartilhar Link */}
        <button
          onClick={onOpenShare}
          className="nav-action-btn primary"
          title="Compartilhar Link Público ou Exportar (PPTX, PDF, PNG)"
        >
          <Share2 size={14} />
          <span className="nav-btn-text">Compartilhar</span>
        </button>

        {/* Apresentar */}
        <button
          onClick={onStartPresentation}
          className="nav-action-btn presentation"
          title="Modo Apresentação Executiva em Tela Cheia (F5)"
        >
          <Play size={13} fill="currentColor" />
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
