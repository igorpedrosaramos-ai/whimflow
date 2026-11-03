import React, { useState } from 'react';
import { 
  FilePlus, 
  Network, 
  Trash2, 
  Copy, 
  Search,
  HardDriveDownload,
  Pencil,
  Check,
  X
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
  onRenameBoard: (id: string, newTitle: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDuplicateBoard,
  onDeleteBoard,
  onRenameBoard
}) => {
  const [search, setSearch] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const filteredBoards = boards.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const startRename = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBoardId(board.id);
    setEditingTitle(board.title);
  };

  const saveRename = (boardId: string) => {
    if (editingTitle.trim()) {
      onRenameBoard(boardId, editingTitle.trim());
    }
    setEditingBoardId(null);
  };

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
          marginBottom: '6px'
        }}>
          Meus Projetos / Quadros ({filteredBoards.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredBoards.map(board => {
            const isSelected = board.id === activeBoardId;
            const isEditing = editingBoardId === board.id;

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
                {/* Título ou Campo de Edição de Nome */}
                {isEditing ? (
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(board.id);
                        if (e.key === 'Escape') setEditingBoardId(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '3px 6px',
                        fontSize: '12.5px',
                        background: 'var(--bg-canvas)',
                        border: '1.5px solid var(--accent-purple)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => saveRename(board.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-teal-light)', cursor: 'pointer', padding: '2px' }}
                      title="Salvar Nome"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingBoardId(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                      title="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}
                    onDoubleClick={(e) => startRename(board, e)}
                    title="Clique duas vezes para editar o nome"
                  >
                    <Network size={15} color={isSelected ? 'var(--accent-purple-light)' : 'var(--text-muted)'} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSelected ? 600 : 400 }}>
                      {board.title}
                    </span>
                  </div>
                )}

                {/* BOTÕES DE AÇÃO: RENOMEAR, DUPLICAR E EXCLUIR */}
                {!isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    {/* Botão de Editar Nome (Lápis com alta visibilidade) */}
                    <button
                      type="button"
                      onClick={(e) => startRename(board, e)}
                      style={{
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-purple-light)',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}
                      title="Renomear Projeto (Editar Nome)"
                    >
                      <Pencil size={12} />
                      <span style={{ fontSize: '10.5px' }}>Renomear</span>
                    </button>

                    {/* Botão Duplicar */}
                    <button
                      type="button"
                      onClick={() => onDuplicateBoard(board.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Duplicar Projeto"
                    >
                      <Copy size={12} />
                    </button>

                    {/* Botão Excluir */}
                    {boards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Excluir o projeto "${board.title}" permanentemente?`)) {
                            onDeleteBoard(board.id);
                          }
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid #7f1d1d',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Excluir Projeto"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé */}
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
