import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Copy, 
  Trash2, 
  Spline, 
  Minus, 
  Square, 
  Check, 
  ChevronDown,
  Bold,
  Italic,
  Smile,
  Link2,
  ExternalLink,
  Type,
  CornerDownRight,
  FolderMinus,
  FolderPlus
} from 'lucide-react';
import { MindMapNode } from '../types';

// Paleta oficial padrão Whimsical (8 cores equilibradas e de alto contraste)
export const WHIMSICAL_PALETTE = [
  { label: 'Cinza Corporativo', hex: '#64748b' },
  { label: 'Vermelho Coral', hex: '#f43f5e' },
  { label: 'Laranja Âmbar', hex: '#f97316' },
  { label: 'Amarelo Ouro', hex: '#eab308' },
  { label: 'Verde Esmeralda', hex: '#10b981' },
  { label: 'Azul Elétrico', hex: '#3b82f6' },
  { label: 'Roxo Violeta', hex: '#8b5cf6' },
  { label: 'Rosa Framboesa', hex: '#ec4899' }
];

export const EXECUTIVE_PALETTE = WHIMSICAL_PALETTE;

const EMOJI_PRESETS = [
  '🎯', '🚀', '💡', '📊', '⚡', '📌', '🏷️', '✅',
  '⭐', '🔍', '📝', '📦', '💰', '🔥', '🍣', '🍱',
  '🍙', '🥟', '🍜', '🍤', '🍙', '🥢', '💼', '🏆'
];

interface NodeContextMenuProps {
  node: MindMapNode;
  position: { x: number; y: number; width: number; height: number };
  pan?: { x: number; y: number };
  zoom?: number;
  onUpdateStyle: (updates: Partial<MindMapNode>) => void;
  onUpdateColor?: (color: string) => void;
  onUpdateBorderStyle?: (style: 'accent' | 'border' | 'fill' | 'text') => void;
  onUpdateLineStyle?: (style: 'bezier' | 'straight' | 'stepped') => void;
  onToggleCollapse?: () => void;
  onAddChild?: () => void;
  onAddSibling?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  hasChildren?: boolean;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  position,
  pan,
  zoom,
  onUpdateStyle,
  onToggleCollapse,
  onAddChild,
  onAddSibling,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp = false,
  canMoveDown = false,
  hasChildren = false
}) => {
  const [activePopover, setActivePopover] = useState<'palette' | 'emoji' | 'link' | null>(null);
  const [linkInput, setLinkInput] = useState(node.link || '');

  const currentColor = node.color || '#6366f1';
  const currentBorderStyle = node.borderStyle || 'accent';
  const currentLineStyle = node.lineStyle || 'bezier';
  const isBold = !!node.bold;
  const isItalic = !!node.italic;
  const currentSize = node.fontSize || 'medium';

  const handleColorChange = (hex: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    onUpdateStyle({ color: hex });
    setActivePopover(null);
  };

  const handleSaveLink = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const clean = linkInput.trim();
    onUpdateStyle({ link: clean || undefined });
    setActivePopover(null);
  };

  const z = zoom || 1;
  const pX = pan?.x || 0;
  const pY = pan?.y || 0;

  const screenCenterX = (position.x + position.width / 2) * z + pX;
  const screenNodeTop = position.y * z + pY;
  const isNearTop = screenNodeTop < 120;
  const screenTop = isNearTop 
    ? (position.y + position.height) * z + pY + 14 
    : screenNodeTop - 52;

  const menu = (
    <div
      className="node-context-menu"
      style={{
        position: 'fixed',
        left: `${screenCenterX}px`,
        top: `${screenTop}px`,
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--bg-elevated, #181d28)',
        border: '1.5px solid var(--border-strong, #333d4e)',
        borderRadius: '8px',
        padding: '3px 6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        zIndex: 150,
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 8 Cores Oficiais Whimsical */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        {WHIMSICAL_PALETTE.map(p => {
          const isSelected = p.hex.toLowerCase() === currentColor.toLowerCase();
          return (
            <button
              key={p.hex}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleColorChange(p.hex, e)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: p.hex,
                cursor: 'pointer',
                border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
                boxShadow: isSelected ? `0 0 0 2px ${p.hex}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'transform 0.1s ease'
              }}
              title={p.label}
            >
              {isSelected && <Check size={10} color="#ffffff" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle, #2d3748)', margin: '0 2px' }} />

      {/* Alternador de Estilo de Linha (Bézier | Reta | Cotovelo) */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          const order: Array<'bezier' | 'straight' | 'stepped'> = ['bezier', 'straight', 'stepped'];
          const next = order[(order.indexOf(currentLineStyle) + 1) % order.length];
          onUpdateStyle({ lineStyle: next });
        }}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary, #cbd5e1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`Linha: ${
          currentLineStyle === 'bezier' ? 'Curva Bézier (Clique para Reta)' :
          currentLineStyle === 'straight' ? 'Reta Direta (Clique para Cotovelo)' :
          'Cotovelo / Stepped (Clique para Curva)'
        }`}
      >
        {currentLineStyle === 'bezier' ? <Spline size={13} /> : currentLineStyle === 'straight' ? <Minus size={13} /> : <CornerDownRight size={13} />}
      </button>

      <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle, #2d3748)', margin: '0 2px' }} />

      {/* Formatação Tipográfica: Negrito (B) */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onUpdateStyle({ bold: !isBold });
        }}
        style={{
          width: '22px',
          height: '24px',
          borderRadius: '4px',
          background: isBold ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
          border: isBold ? '1px solid #6366f1' : 'none',
          color: isBold ? '#818cf8' : 'var(--text-secondary, #cbd5e1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Negrito (Ctrl+B)"
      >
        <Bold size={12} />
      </button>

      {/* Formatação Tipográfica: Itálico (I) */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onUpdateStyle({ italic: !isItalic });
        }}
        style={{
          width: '22px',
          height: '24px',
          borderRadius: '4px',
          background: isItalic ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
          border: isItalic ? '1px solid #6366f1' : 'none',
          color: isItalic ? '#818cf8' : 'var(--text-secondary, #cbd5e1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Itálico (Ctrl+I)"
      >
        <Italic size={12} />
      </button>

      {/* Tamanho de Fonte (S / M / L) */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          const order: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
          const next = order[(order.indexOf(currentSize) + 1) % order.length];
          onUpdateStyle({ fontSize: next });
        }}
        style={{
          height: '24px',
          padding: '0 4px',
          borderRadius: '4px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary, #cbd5e1)',
          cursor: 'pointer',
          fontSize: '10px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`Tamanho do Texto: ${currentSize === 'small' ? 'Pequeno (12px)' : currentSize === 'medium' ? 'Médio (14px)' : 'Grande (16px)'}`}
      >
        {currentSize === 'small' ? 'P' : currentSize === 'medium' ? 'M' : 'G'}
      </button>

      <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle, #2d3748)', margin: '0 2px' }} />

      {/* Botão de Ícone / Emoji */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setActivePopover(activePopover === 'emoji' ? null : 'emoji');
          }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: node.icon || activePopover === 'emoji' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: node.icon ? '1px solid #6366f1' : 'none',
            color: 'var(--text-secondary, #cbd5e1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title={node.icon ? `Ícone Atual: ${node.icon} (Clique para alterar)` : 'Adicionar Ícone / Emoji'}
        >
          {node.icon ? node.icon : <Smile size={13} />}
        </button>

        {activePopover === 'emoji' && (
          <div
            style={{
              position: 'absolute',
              top: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--bg-elevated, #181d28)',
              border: '1.5px solid var(--border-strong, #333d4e)',
              borderRadius: '8px',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              zIndex: 1020,
              width: '180px'
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {EMOJI_PRESETS.map((em, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStyle({ icon: em });
                  setActivePopover(null);
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  background: node.icon === em ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  border: node.icon === em ? '1px solid #6366f1' : 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {em}
              </button>
            ))}
            {node.icon && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStyle({ icon: undefined });
                  setActivePopover(null);
                }}
                style={{
                  gridColumn: 'span 6',
                  marginTop: '4px',
                  padding: '4px',
                  borderRadius: '4px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Remover Ícone
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botão de Hiperlink */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setLinkInput(node.link || '');
            setActivePopover(activePopover === 'link' ? null : 'link');
          }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: node.link || activePopover === 'link' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: node.link ? '1px solid #6366f1' : 'none',
            color: node.link ? '#818cf8' : 'var(--text-secondary, #cbd5e1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={node.link ? `Link: ${node.link}` : 'Adicionar Link Externo'}
        >
          <Link2 size={13} />
        </button>

        {activePopover === 'link' && (
          <div
            style={{
              position: 'absolute',
              top: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--bg-elevated, #181d28)',
              border: '1.5px solid var(--border-strong, #333d4e)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              zIndex: 1020,
              width: '210px'
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="url"
              placeholder="https://exemplo.com"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveLink(e);
              }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '4px 6px',
                fontSize: '11px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
              {node.link && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStyle({ link: undefined });
                    setActivePopover(null);
                  }}
                  style={{
                    padding: '3px 6px',
                    borderRadius: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Remover
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveLink}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'var(--accent-purple, #6366f1)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recolher / Expandir Ramo (se tiver filhos) */}
      {hasChildren && onToggleCollapse && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary, #cbd5e1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={node.collapsed ? 'Expandir Ramo (Ctrl+/)' : 'Recolher Ramo (Ctrl+/)'}
        >
          {node.collapsed ? <FolderPlus size={13} /> : <FolderMinus size={13} />}
        </button>
      )}

      {/* Adicionar Filho (+) */}
      {onAddChild && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary, #cbd5e1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Adicionar Filho (Atalho: Tab)"
        >
          <Plus size={13} />
        </button>
      )}

      {/* Adicionar Irmão Abaixo */}
      {onAddSibling && node.side !== 'root' && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onAddSibling();
          }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary, #cbd5e1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Adicionar Irmão Abaixo (Atalho: Enter)"
        >
          <CornerDownRight size={13} />
        </button>
      )}

      <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle, #2d3748)', margin: '0 2px' }} />

      {/* Duplicar Nó */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary, #cbd5e1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Duplicar Nó (Ctrl+D)"
      >
        <Copy size={13} />
      </button>

      {/* Excluir Nó (se não for raiz) */}
      {node.side !== 'root' && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: '#f87171',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Excluir Nó (Delete)"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(menu, document.body) : null;
};
