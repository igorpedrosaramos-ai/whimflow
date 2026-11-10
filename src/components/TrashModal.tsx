import React, { useEffect } from 'react';
import { Trash2, RotateCcw, X, AlertCircle } from 'lucide-react';
import { Board } from '../types';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashBoards: Board[];
  onRestoreBoard: (boardId: string) => void;
  onPermanentlyDeleteBoard: (boardId: string) => void;
  onEmptyTrash: () => void;
  theme?: 'dark' | 'light';
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  trashBoards,
  onRestoreBoard,
  onPermanentlyDeleteBoard,
  onEmptyTrash,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 6000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '560px',
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
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: isDark ? '1px solid #2d3748' : '1px solid #f1f5f9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} color="#f87171" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Lixeira de Quadros ({trashBoards.length})
            </h3>
          </div>
          <button
            id="btn-close-trash"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Itens */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '12px' }}>
          {trashBoards.length > 0 ? (
            trashBoards.map(board => (
              <div
                key={board.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#232b38' : '#f8fafc',
                  marginBottom: '8px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {board.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    {board.mindMapNodes.length} nós • Excluído recentemente
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => onRestoreBoard(board.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      border: '1px solid #3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                    title="Restaurar para a lista ativa"
                  >
                    <RotateCcw size={12} />
                    <span>Restaurar</span>
                  </button>
                  <button
                    onClick={() => onPermanentlyDeleteBoard(board.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Excluir definitivamente"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8' }}>
              <Trash2 size={32} color="#64748b" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '14px', fontWeight: 500 }}>Sua lixeira está vazia</div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#64748b' }}>
                Quadros excluídos ficam salvos aqui caso precise restaurá-los.
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        {trashBoards.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: isDark ? '1px solid #2d3748' : '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button
              onClick={onEmptyTrash}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Esvaziar lixeira definitivamente
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: isDark ? '#2d3748' : '#e2e8f0',
                border: 'none',
                color: isDark ? '#f8fafc' : '#334155',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
