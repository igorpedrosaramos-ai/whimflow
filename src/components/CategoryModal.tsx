import React, { useState, useEffect } from 'react';
import { X, Tag, Check, Trash2 } from 'lucide-react';
import { BoardCategory } from '../types';

export const CATEGORY_COLORS = [
  { hex: '#818cf8', name: 'Índigo' },
  { hex: '#3b82f6', name: 'Azul' },
  { hex: '#0d9488', name: 'Teal' },
  { hex: '#10b981', name: 'Esmeralda' },
  { hex: '#f59e0b', name: 'Âmbar' },
  { hex: '#ec4899', name: 'Rosa' },
  { hex: '#8b5cf6', name: 'Roxo' },
  { hex: '#64748b', name: 'Grafite' }
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { id?: string; name: string; color: string }) => void;
  onDelete?: (categoryId: string) => void;
  categoryToEdit?: BoardCategory | null;
  theme?: 'dark' | 'light';
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  categoryToEdit,
  theme = 'light'
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0].hex);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color || CATEGORY_COLORS[0].hex);
    } else {
      setName('');
      setColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)].hex);
    }
    setError('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }
    onSave({
      id: categoryToEdit?.id,
      name: name.trim(),
      color
    });
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
          maxWidth: '440px',
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
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <Tag size={16} />
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
                {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '12px',
                  color: isDark ? '#94a3b8' : '#64748b'
                }}
              >
                Organize seus quadros e documentos por equipes e temas
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="category-name-input"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#e2e8f0' : '#1e293b',
                marginBottom: '6px'
              }}
            >
              Nome da Categoria
            </label>
            <input
              id="category-name-input"
              type="text"
              autoFocus
              placeholder="Ex: Marketing & Vendas, Sprint Q1, Clientes..."
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: error
                  ? '1px solid #ef4444'
                  : isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {error && (
              <span style={{ display: 'block', fontSize: '11.5px', color: '#ef4444', marginTop: '4px' }}>
                {error}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#e2e8f0' : '#1e293b',
                marginBottom: '8px'
              }}
            >
              Cor de Identificação
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORY_COLORS.map(item => {
                const isSelected = color === item.hex;
                return (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => setColor(item.hex)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: item.hex,
                      border: isSelected ? '2px solid #ffffff' : '2px solid transparent',
                      outline: isSelected ? `2px solid ${item.hex}` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s'
                    }}
                    title={item.name}
                  >
                    {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: categoryToEdit && onDelete ? 'space-between' : 'flex-end',
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: isDark ? '1px solid #253041' : '1px solid #f1f5f9'
            }}
          >
            {categoryToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir a categoria "${categoryToEdit.name}"? Os quadros não serão apagados, apenas desvinculados.`)) {
                    onDelete(categoryToEdit.id);
                    onClose();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ef444433',
                  backgroundColor: isDark ? '#ef444415' : '#fef2f2',
                  color: '#ef4444',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
                <span>Excluir</span>
              </button>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
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
                id="btn-save-category"
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: color,
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                {categoryToEdit ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
