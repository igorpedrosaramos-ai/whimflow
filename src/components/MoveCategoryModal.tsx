import React, { useState } from 'react';
import { X, Folder, Check, Plus, Tag } from 'lucide-react';
import { Board, BoardCategory } from '../types';

interface MoveCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board | null;
  categories: BoardCategory[];
  onSelectCategory: (boardId: string, categoryId?: string) => void;
  onCreateNewCategory?: () => void;
  theme?: 'dark' | 'light';
}

export const MoveCategoryModal: React.FC<MoveCategoryModalProps> = ({
  isOpen,
  onClose,
  board,
  categories,
  onSelectCategory,
  onCreateNewCategory,
  theme = 'light'
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(board?.categoryId);

  React.useEffect(() => {
    setSelectedCatId(board?.categoryId);
  }, [board, isOpen]);

  if (!isOpen || !board) return null;

  const isDark = theme === 'dark';

  const handleConfirm = () => {
    onSelectCategory(board.id, selectedCatId);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: isDark ? '#1a222f' : '#ffffff',
          borderRadius: '8px',
          border: isDark ? '1px solid #2d3848' : '1px solid #cbd5e1',
          boxShadow: '0 20px 35px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: isDark ? '1px solid #253041' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#161d28' : '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
              }}
            >
              <Folder size={16} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: isDark ? '#f8fafc' : '#0f172a'
                }}
              >
                Mover para Categoria
              </h2>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '12.5px',
                  color: isDark ? '#94a3b8' : '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '320px'
                }}
              >
                Projeto: <strong style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>{board.title || 'Sem título'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Categorias Selecionáveis */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '340px',
            overflowY: 'auto'
          }}
        >
          {/* Opção: Sem Categoria */}
          <button
            type="button"
            onClick={() => setSelectedCatId(undefined)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              border: selectedCatId === undefined
                ? '1.5px solid #818cf8'
                : isDark ? '1px solid #2d3848' : '1px solid #e2e8f0',
              backgroundColor: selectedCatId === undefined
                ? (isDark ? '#232c3f' : '#eef2ff')
                : (isDark ? '#141a24' : '#ffffff'),
              color: isDark ? '#f8fafc' : '#0f172a',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.12s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: isDark ? '2px solid #64748b' : '2px solid #94a3b8'
                }}
              />
              <span style={{ fontSize: '13.5px', fontWeight: selectedCatId === undefined ? 600 : 500 }}>
                Sem Categoria (Geral)
              </span>
            </div>
            {selectedCatId === undefined && (
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#818cf8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>

          {/* Categorias Cadastradas */}
          {categories.map(cat => {
            const isSelected = selectedCatId === cat.id;
            const isCurrent = board.categoryId === cat.id;

            return (
              <button
                key={cat.id}
                id={`btn-modal-cat-${cat.id}`}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: isSelected
                    ? `1.5px solid ${cat.color || '#818cf8'}`
                    : isDark ? '1px solid #2d3848' : '1px solid #e2e8f0',
                  backgroundColor: isSelected
                    ? (isDark ? '#232c3f' : '#f0fdf4')
                    : (isDark ? '#141a24' : '#ffffff'),
                  color: isDark ? '#f8fafc' : '#0f172a',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: cat.color || '#818cf8'
                    }}
                  />
                  <span style={{ fontSize: '13.5px', fontWeight: isSelected ? 600 : 500 }}>
                    {cat.name}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: isDark ? '#334155' : '#e2e8f0',
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontWeight: 500
                      }}
                    >
                      Atual
                    </span>
                  )}
                </div>

                {isSelected && (
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: cat.color || '#818cf8',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}

          {/* Botão de Atalho para Criar Nova Categoria */}
          {onCreateNewCategory && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateNewCategory();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 14px',
                borderRadius: '6px',
                border: '1px dashed #64748b66',
                backgroundColor: 'transparent',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#818cf8';
                e.currentTarget.style.color = '#818cf8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#64748b66';
                e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
              }}
            >
              <Plus size={14} />
              <span>Criar nova categoria...</span>
            </button>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '14px 20px',
            borderTop: isDark ? '1px solid #253041' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#161d28' : '#f8fafc'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              backgroundColor: 'transparent',
              color: isDark ? '#94a3b8' : '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-move-category"
            type="button"
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#818cf8',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(129, 140, 248, 0.3)'
            }}
          >
            Mover Projeto
          </button>
        </div>
      </div>
    </div>
  );
};
