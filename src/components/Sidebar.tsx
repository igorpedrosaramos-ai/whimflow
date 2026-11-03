import React, { useState } from 'react';
import { 
  FilePlus, 
  Network, 
  Trash2, 
  Copy, 
  Search,
  HardDriveDownload,
  Folder,
  Layers
} from 'lucide-react';
import { Board } from '../types';

interface SidebarProps {
  isOpen: boolean;
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title?: string) => void;
  onDuplicateBoard: (id: string) => void;
  onDeleteBoard: (id: string) => void;
  onLoadTemplate?: (templateName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDuplicateBoard,
  onDeleteBoard,
  onLoadTemplate
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredBoards = boards.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar-panel">
      {/* Botão Principal: Criar Novo Quadro do Zero */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => onCreateBoard()}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            padding: '9px 14px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
          }}
        >
          <FilePlus size={16} />
          <span>+ Novo Quadro em Branco</span>
        </button>
      </div>

      {/* Busca */}
      <div style={{ padding: '8px 14px' }}>
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
            placeholder="Buscar projetos..."
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

      {/* Lista de Quadros do Usuário */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          padding: '4px 6px',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
          Meus Quadros ({filteredBoards.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {filteredBoards.map(board => {
            const isSelected = board.id === activeBoardId;
            return (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: isSelected ? 'var(--accent-purple-light)' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent-purple)' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                  <Network size={15} color={isSelected ? 'var(--accent-purple-light)' : 'var(--text-muted)'} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {board.title}
                  </span>
                </div>

                {/* Ações: Duplicar e Excluir */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onDuplicateBoard(board.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex'
                    }}
                    title="Duplicar quadro"
                  >
                    <Copy size={13} />
                  </button>
                  {boards.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Excluir quadro "${board.title}" permanentemente?`)) {
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
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé com Status e Persistência */}
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
          <span>Salvamento local ativo e contínuo</span>
        </div>
        <div>WhimFlow Pro • Alta Fidelidade</div>
      </div>
    </aside>
  );
};
