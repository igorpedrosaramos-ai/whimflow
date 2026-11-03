import React from 'react';
import { 
  Sidebar as SidebarIcon, 
  Share2, 
  Play, 
  Sparkles, 
  Download, 
  Sun, 
  Moon, 
  Check, 
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { Workspace } from '../types';

interface TopNavProps {
  boardTitle: string;
  onUpdateTitle: (title: string) => void;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenAI: () => void;
  onOpenExport: () => void;
  onStartPresentation: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalObjects: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  boardTitle,
  onUpdateTitle,
  workspaces,
  currentWorkspaceId,
  onSelectWorkspace,
  sidebarOpen,
  onToggleSidebar,
  onOpenAI,
  onOpenExport,
  onStartPresentation,
  theme,
  onToggleTheme,
  totalObjects
}) => {
  const currentWs = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];

  return (
    <header className="top-navbar">
      {/* Left: Sidebar toggle, Workspace & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="tool-button"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Ocultar Barra Lateral" : "Exibir Barra Lateral"}
          style={{ width: '32px', height: '32px' }}
        >
          <SidebarIcon size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <FolderOpen size={16} color="var(--accent-purple-light)" />
            <select
              value={currentWorkspaceId}
              onChange={(e) => onSelectWorkspace(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight size={14} color="var(--text-muted)" />

          <input
            type="text"
            value={boardTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px dashed transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '14px',
              padding: '2px 6px',
              borderRadius: '4px',
              outline: 'none',
              maxWidth: '320px'
            }}
            onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent-purple)'}
            onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
            title="Clique para renomear este quadro"
          />
        </div>
      </div>

      {/* Right Controls: Objects counter, AI, Presentation, Export, Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Unlimited objects pill */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-teal-light)'
          }}
          title="Seu sistema pessoal é 100% ilimitado! Sem a trava de 50 objetos do Whimsical comercial."
        >
          <span style={{ fontSize: '14px', fontWeight: 700 }}>∞</span>
          <span>{totalObjects} objetos (Uso Pessoal Ilimitado)</span>
        </div>

        {/* AI Generator Button */}
        <button
          onClick={onOpenAI}
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
            fontWeight: 600,
            transition: 'background-color 0.15s'
          }}
          title="Assistente de Ideias e Desdobramento de Ramos"
        >
          <Sparkles size={15} />
          <span>Expandir com IA</span>
        </button>

        {/* Presentation Button */}
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
          <span>Apresentar</span>
        </button>

        {/* Export / Backup Button */}
        <button
          onClick={onOpenExport}
          className="tool-button"
          title="Exportar / Backup / Importar"
          style={{ width: '34px', height: '34px' }}
        >
          <Download size={17} />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="tool-button"
          title={theme === 'dark' ? "Alternar para Tema Claro" : "Alternar para Tema Escuro"}
          style={{ width: '34px', height: '34px' }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* User avatar indicator */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px'
          }}
          title="Conta Pessoal Offline & Local"
        >
          M
        </div>
      </div>
    </header>
  );
};
