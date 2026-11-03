import React, { useState } from 'react';
import { 
  FolderPlus, 
  FilePlus, 
  Folder, 
  Network, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Search,
  HardDriveDownload,
  Building2,
  Lock
} from 'lucide-react';
import { Board, Workspace } from '../types';

interface SidebarProps {
  isOpen: boolean;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onAddWorkspace: (name: string) => void;
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  workspaces,
  currentWorkspaceId,
  onSelectWorkspace,
  onAddWorkspace,
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard
}) => {
  const [search, setSearch] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState(true);

  if (!isOpen) return null;

  const currentBoards = boards.filter(b => 
    b.workspaceId === currentWorkspaceId &&
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim());
      setNewBoardName('');
      setShowNewBoardInput(false);
    }
  };

  return (
    <aside className="sidebar-panel">
      {/* Search Bar */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-canvas)',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Pesquisar quadros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              width: '100%'
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {/* Section: RECENT */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            padding: '4px 10px',
            textTransform: 'uppercase'
          }}>
            Recentes
          </div>
          {boards.slice(0, 3).map(board => (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                fontSize: '13.5px',
                cursor: 'pointer',
                color: board.id === activeBoardId ? 'var(--accent-purple-light)' : 'var(--text-secondary)',
                backgroundColor: board.id === activeBoardId ? 'var(--bg-surface-hover)' : 'transparent',
                fontWeight: board.id === activeBoardId ? 600 : 400
              }}
            >
              <Network size={16} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {board.title}
              </span>
            </div>
          ))}
        </div>

        {/* Section: TEAMS / WORKSPACES */}
        <div>
          <div 
            onClick={() => setExpandedTeams(!expandedTeams)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              padding: '6px 10px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {expandedTeams ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Áreas de Trabalho (Equipes)</span>
            </div>
          </div>

          {expandedTeams && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
              {workspaces.map(ws => {
                const isSelected = ws.id === currentWorkspaceId;
                return (
                  <div key={ws.id}>
                    <div
                      onClick={() => onSelectWorkspace(ws.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: isSelected ? 'var(--accent-purple-light)' : 'var(--text-secondary)',
                        backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                        fontWeight: isSelected ? 600 : 500
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {ws.isPrivate ? <Lock size={15} /> : <Building2 size={15} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                          {ws.name}
                        </span>
                      </div>
                    </div>

                    {/* Sub-boards if selected */}
                    {isSelected && (
                      <div style={{ paddingLeft: '22px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {currentBoards.map(board => (
                          <div
                            key={board.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              borderRadius: '4px',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              color: board.id === activeBoardId ? 'var(--accent-purple-light)' : 'var(--text-secondary)',
                              backgroundColor: board.id === activeBoardId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                              borderLeft: board.id === activeBoardId ? '2px solid var(--accent-purple)' : '2px solid transparent'
                            }}
                          >
                            <div 
                              onClick={() => onSelectBoard(board.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}
                            >
                              <Network size={14} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {board.title}
                              </span>
                            </div>
                            {boards.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Excluir quadro "${board.title}"?`)) {
                                    onDeleteBoard(board.id);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex'
                                }}
                                title="Excluir quadro"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}

                        {showNewBoardInput ? (
                          <form onSubmit={handleCreateBoard} style={{ marginTop: '6px' }}>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Nome do quadro..."
                              value={newBoardName}
                              onChange={(e) => setNewBoardName(e.target.value)}
                              onBlur={() => !newBoardName && setShowNewBoardInput(false)}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '12px',
                                background: 'var(--bg-canvas)',
                                border: '1px solid var(--accent-purple)',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                                outline: 'none'
                              }}
                            />
                          </form>
                        ) : (
                          <button
                            onClick={() => setShowNewBoardInput(true)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '12px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              marginTop: '2px'
                            }}
                          >
                            <FilePlus size={13} />
                            <span>Novo Quadro</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11.5px',
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HardDriveDownload size={13} color="var(--accent-teal-light)" />
          <span>Salvamento local contínuo ativo</span>
        </div>
        <div>Uso pessoal corporativo • 100% Livre</div>
      </div>
    </aside>
  );
};
