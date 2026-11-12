import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Layout, 
  Lock, 
  Users, 
  GitBranch, 
  PanelRightClose,
  Plus,
  Sparkles
} from 'lucide-react';
import { Board } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  onSelectBoard: (boardId: string) => void;
  onCreateNewBoard?: (title: string) => void;
  onOpenTemplates?: () => void;
  workspaceName?: string;
  theme?: 'dark' | 'light';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  boards,
  onSelectBoard,
  onCreateNewBoard,
  onOpenTemplates,
  workspaceName = 'teste',
  theme = 'light'
}) => {
  const [query, setQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<'workspace' | 'team' | 'private'>('workspace');
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtragem dos projetos REAIS existentes
  const filteredBoards = boards.filter(b => {
    // Filtro por escopo
    if (selectedScope === 'private' && !b.isPrivate) return false;
    if (selectedScope === 'team' && b.isPrivate) return false;

    // Filtro por texto
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = (b.title || '').toLowerCase().includes(q);
    const nodeMatch = (b.mindMapNodes || []).some(n => (n.text || '').toLowerCase().includes(q));
    return titleMatch || nodeMatch;
  });

  return (
    <>
      {/* Backdrop transparente para fechar ao clicar fora */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4999,
          backgroundColor: 'transparent'
        }}
        onClick={onClose}
      />

      {/* Painel Lateral Direito Flutuante de Busca (Idêntico ao Whimsical) */}
      <aside
        id="search-flyout-drawer"
        data-testid="search-flyout"
        style={{
          position: 'fixed',
          top: '48px',
          right: 0,
          bottom: 0,
          width: '390px',
          maxWidth: '100vw',
          backgroundColor: isDark ? '#141922' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderLeft: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0',
          boxShadow: isDark ? '-8px 0 32px rgba(0, 0, 0, 0.45)' : '-6px 0 28px rgba(0, 0, 0, 0.08)',
          zIndex: 5000,
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          animation: 'slideInRight 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 1. Linha do Input de Busca (Search...) */}
        <div
          style={{
            padding: '16px 20px 12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar quadros, notas e documentos..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '15px',
                color: isDark ? '#f8fafc' : '#0f172a',
                padding: 0,
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Fechar busca"
          >
            <PanelRightClose size={18} />
          </button>
        </div>

        {/* 2. Pílulas de Escopo (Workspace / Everyone at teste) */}
        <div
          style={{
            padding: '0 20px 14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: isDark ? '1px solid #1e2633' : '1px solid #f1f5f9'
          }}
        >
          <button
            onClick={() => setSelectedScope('workspace')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: selectedScope === 'workspace' 
                ? (isDark ? '1px solid #3b82f6' : '1px solid #cbd5e1') 
                : '1px solid transparent',
              backgroundColor: selectedScope === 'workspace' 
                ? (isDark ? '#1e293b' : '#ffffff') 
                : 'transparent',
              color: selectedScope === 'workspace' 
                ? (isDark ? '#f8fafc' : '#0f172a') 
                : '#94a3b8',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: selectedScope === 'workspace' && !isDark ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Espaço de Trabalho
          </button>

          <button
            onClick={() => setSelectedScope('team')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: selectedScope === 'team' 
                ? (isDark ? '1px solid #3b82f6' : '1px solid #cbd5e1') 
                : '1px solid transparent',
              backgroundColor: selectedScope === 'team' 
                ? (isDark ? '#1e293b' : '#ffffff') 
                : 'transparent',
              color: selectedScope === 'team' 
                ? (isDark ? '#f8fafc' : '#0f172a') 
                : '#94a3b8',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Todos em {workspaceName}
          </button>
        </div>

        {/* 3. Lista de Projetos Rolável */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px'
          }}
        >
          {/* Cabeçalho da Seção RECENT */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0 12px 10px 12px'
            }}
          >
            {query.trim() ? `RESULTADOS (${filteredBoards.length})` : 'RECENTES'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Opção Rápida de Templates & color themes */}
            {onOpenTemplates && !query.trim() && (
              <div
                onClick={() => {
                  onOpenTemplates();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: isDark ? '#cbd5e1' : '#334155',
                  transition: 'background-color 0.12s'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#1a2230' : '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layout size={16} color="#64748b" />
                  <span style={{ fontSize: '13.5px', fontWeight: 500 }}>
                    Modelos & Temas
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8' }}>
                  <Users size={12} />
                  <span>Todos em {workspaceName}</span>
                </div>
              </div>
            )}

            {/* Projetos REAIS existentes */}
            {filteredBoards.map(board => {
              const isDoc = board.mindMapNodes && board.mindMapNodes.length <= 1 && (board.texts && board.texts.length > 0);
              const isPrivate = Boolean(board.isPrivate);

              return (
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
                    padding: '9px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    transition: 'background-color 0.12s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#1a2230' : '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Lado Esquerdo: Ícone + Título Real do Projeto */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, paddingRight: '12px' }}>
                    {isDoc ? (
                      <FileText size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8" cy="8" r="1" fill="#7c3aed" />
                        <circle cx="16" cy="8" r="1" fill="#7c3aed" />
                        <circle cx="8" cy="16" r="1" fill="#7c3aed" />
                        <circle cx="16" cy="16" r="1" fill="#7c3aed" />
                        <line x1="8" y1="8" x2="16" y2="16" />
                      </svg>
                    )}

                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {board.title}
                    </span>
                  </div>

                  {/* Lado Direito: Escopo do Projeto (Private ou Everyone at teste) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      color: '#94a3b8',
                      flexShrink: 0
                    }}
                  >
                    {isPrivate ? (
                      <>
                        <Lock size={12} color="#94a3b8" />
                        <span>Privado</span>
                      </>
                    ) : (
                      <>
                        <Users size={12} color="#94a3b8" />
                        <span>Todos em {workspaceName}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Estado Vazio de Busca */}
            {filteredBoards.length === 0 && (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>Nenhum projeto encontrado para "{query}"</span>
                {onCreateNewBoard && query.trim() && (
                  <button
                    onClick={() => {
                      onCreateNewBoard(query.trim());
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#7c3aed',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} />
                    <span>Criar "{query.trim()}"</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
