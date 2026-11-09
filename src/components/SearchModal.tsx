import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Layout, ArrowRight, Plus } from 'lucide-react';
import { Board } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  onSelectBoard: (boardId: string) => void;
  onCreateNewBoard: (title: string) => void;
  theme?: 'dark' | 'light';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  boards,
  onSelectBoard,
  onCreateNewBoard,
  theme = 'light'
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBoards = boards.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.mindMapNodes.some(n => n.text?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 6000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '580px',
          maxWidth: '92vw',
          backgroundColor: isDark ? '#1a202c' : '#ffffff',
          borderRadius: '10px',
          border: isDark ? '1px solid #2d3748' : '1px solid #e2e8f0',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Barra de Busca Superior */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderBottom: isDark ? '1px solid #2d3748' : '1px solid #f1f5f9'
          }}
        >
          <Search size={18} color={isDark ? '#94a3b8' : '#64748b'} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar quadros, tópicos ou ideias..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={16} />
            </button>
          )}
          <span
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: isDark ? '#2d3748' : '#f1f5f9',
              color: isDark ? '#94a3b8' : '#64748b',
              fontWeight: 600
            }}
          >
            ESC
          </span>
        </div>

        {/* Lista de Resultados */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filteredBoards.length > 0 ? (
            filteredBoards.map(board => (
              <div
                key={board.id}
                onClick={() => {
                  onSelectBoard(board.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2d3748' : '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      backgroundColor: isDark ? '#252e3e' : '#ede9fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Layout size={15} color="#7c3aed" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {board.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {board.mindMapNodes.length} nós • Atualizado recentemente
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} color={isDark ? '#64748b' : '#94a3b8'} />
              </div>
            ))
          ) : (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                Nenhum quadro encontrado para "{query}"
              </div>
              {query.trim() && (
                <button
                  onClick={() => {
                    onCreateNewBoard(query.trim());
                    onClose();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#7c3aed',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  <span>Criar novo quadro "{query.trim()}"</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
