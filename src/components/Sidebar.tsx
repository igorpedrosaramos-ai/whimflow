import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Users, 
  Layout, 
  Trash2, 
  Search, 
  Pencil, 
  Copy, 
  Trash, 
  X, 
  Laptop,
  Network
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
  onNavigateToDashboard?: () => void;
  onOpenTemplates?: () => void;
  workspaceName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDuplicateBoard,
  onDeleteBoard,
  onRenameBoard,
  onNavigateToDashboard,
  onOpenTemplates,
  workspaceName = 'teste'
}) => {
  const [search, setSearch] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isDownloadCardDismissed, setIsDownloadCardDismissed] = useState(false);

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
    <aside
      style={{
        width: '260px',
        backgroundColor: '#161920',
        borderRight: '1px solid #232936',
        display: 'flex',
        flexDirection: 'column',
        color: '#94a3b8',
        userSelect: 'none',
        flexShrink: 0,
        height: '100%',
        zIndex: 40
      }}
    >
      {/* Topo: Workspace Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid #202633'
        }}
      >
        <div
          onClick={onNavigateToDashboard}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          title="Abrir Dashboard do Workspace"
        >
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
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
            {workspaceName}
          </span>
          <ChevronDown size={14} color="#64748b" />
        </div>

        <button
          onClick={() => onCreateBoard()}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#262f3f',
            border: '1px solid #333e52',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Criar novo quadro"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Busca */}
      <div style={{ padding: '8px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#11141a',
            padding: '5px 8px',
            borderRadius: '5px',
            border: '1px solid #242c3b'
          }}
        >
          <Search size={13} color="#64748b" />
          <input
            type="text"
            placeholder="Buscar quadros..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '12px',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Itens do Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 8px', gap: '2px', flex: 1, overflowY: 'auto' }}>
        {/* Recent */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 10px',
            borderRadius: '5px',
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '12.5px',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Clock size={15} color="#64748b" />
          <span>Recent</span>
        </button>

        {/* PRIVATE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px 4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.05em'
          }}
        >
          <ChevronRight size={12} color="#64748b" />
          <span>PRIVATE</span>
        </div>

        {/* TEAMS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px 4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.05em'
          }}
        >
          <ChevronDown size={12} color="#64748b" />
          <span>TEAMS</span>
        </div>

        {/* Everyone at workspace */}
        <button
          onClick={onNavigateToDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px 6px 18px',
            borderRadius: '5px',
            border: 'none',
            background: 'transparent',
            color: '#cbd5e1',
            fontSize: '12.5px',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Users size={14} color="#818cf8" />
          <span>Everyone at {workspaceName}</span>
        </button>

        {/* Lista de Quadros deste Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '16px', marginTop: '4px' }}>
          {filteredBoards.map(board => {
            const isActive = board.id === activeBoardId;
            const isEditing = editingBoardId === board.id;

            return (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '5px',
                  backgroundColor: isActive ? '#242d3d' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8" cy="8" r="1" fill="#7c3aed" />
                    <circle cx="12" cy="8" r="1" fill="#7c3aed" />
                    <circle cx="16" cy="8" r="1" fill="#7c3aed" />
                  </svg>

                  {isEditing ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setEditingTitle(e.target.value)}
                      onBlur={() => saveRename(board.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveRename(board.id);
                        if (e.key === 'Escape') setEditingBoardId(null);
                      }}
                      style={{
                        background: '#11141a',
                        border: '1px solid #6366f1',
                        borderRadius: '3px',
                        color: '#f8fafc',
                        fontSize: '12px',
                        padding: '1px 4px',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}
                    >
                      {board.title || 'untitled'}
                    </span>
                  )}
                </div>

                {/* Ações Rápidas (Duplicar, Renomear, Excluir) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: isActive ? 1 : 0.4 }}>
                  <button
                    onClick={e => startRename(board, e)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                    title="Renomear"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDuplicateBoard(board.id);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                    title="Duplicar"
                  >
                    <Copy size={11} />
                  </button>
                  {boards.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteBoard(board.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      title="Excluir"
                    >
                      <Trash size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé da Barra Lateral */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #202633', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {!isDownloadCardDismissed && (
          <div
            style={{
              position: 'relative',
              padding: '10px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #1e2638 0%, #29344d 100%)',
              border: '1px solid #334155',
              color: '#ffffff'
            }}
          >
            <button
              onClick={() => setIsDownloadCardDismissed(true)}
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={12} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <Laptop size={14} color="#38bdf8" />
              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>Download the app</span>
            </div>
            <p style={{ margin: 0, fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.3 }}>
              Get the best experience with Whimsical for Windows
            </p>
          </div>
        )}

        <button
          onClick={onOpenTemplates}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 6px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '12px',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Layout size={14} color="#64748b" />
          <span>Templates & color themes</span>
        </button>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 6px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '12px',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Trash2 size={14} color="#64748b" />
          <span>Trash</span>
        </button>
      </div>
    </aside>
  );
};
