import React, { useState } from 'react';
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
  ChevronDown 
} from 'lucide-react';
import { MindMapNode } from '../types';

export const EXECUTIVE_PALETTE = [
  { label: 'Índigo', hex: '#6366f1' },
  { label: 'Teal', hex: '#0d9488' },
  { label: 'Esmeralda', hex: '#059669' },
  { label: 'Azul', hex: '#2563eb' },
  { label: 'Laranja', hex: '#ea580c' },
  { label: 'Rubi', hex: '#e11d48' },
  { label: 'Âmbar', hex: '#d97706' },
  { label: 'Violeta', hex: '#7c3aed' },
  { label: 'Grafite', hex: '#475569' }
];

interface NodeContextMenuProps {
  node: MindMapNode;
  position: { x: number; y: number; width: number; height: number };
  onUpdateColor: (color: string) => void;
  onUpdateBorderStyle: (style: 'accent' | 'border' | 'fill') => void;
  onUpdateLineStyle: (style: 'bezier' | 'straight') => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddChild?: () => void;
  onAddSibling?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  position,
  onUpdateColor,
  onUpdateBorderStyle,
  onUpdateLineStyle,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  canMoveUp,
  canMoveDown
}) => {
  const [showPalette, setShowPalette] = useState(false);
  const currentColor = node.color || '#6366f1';
  const currentBorderStyle = node.borderStyle || 'accent';
  const currentLineStyle = node.lineStyle || 'bezier';

  // 6 Cores executivas diretas de alta legibilidade
  const QUICK_COLORS = ['#4f46e5', '#0d9488', '#16a34a', '#ea580c', '#e11d48', '#475569'];

  const handleColorChange = (hex: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    onUpdateColor(hex);
    setShowPalette(false);
  };

  const isNearTop = position.y < 55;
  const menuTop = isNearTop ? position.y + position.height + 10 : position.y - 46;

  return (
    <div
      className="node-context-menu"
      style={{
        position: 'absolute',
        left: `${position.x + position.width / 2}px`,
        top: `${menuTop}px`,
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--bg-elevated, #1e232d)',
        border: '1.5px solid var(--border-strong, #3d4556)',
        borderRadius: '8px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 1000,
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botão Seletor de Cores Aprimorado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {QUICK_COLORS.map(hex => {
          const isSelected = hex.toLowerCase() === currentColor.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleColorChange(hex, e)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: hex,
                cursor: 'pointer',
                border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: isSelected ? `0 0 0 2px ${hex}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'transform 0.1s ease'
              }}
              title={`Cor ${hex}`}
            >
              {isSelected && <Check size={11} color="#ffffff" strokeWidth={3} />}
            </button>
          );
        })}

        {/* Botão de Paleta Completa */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setShowPalette(!showPalette);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: showPalette ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: 0
            }}
            title="Mais Cores"
          >
            <ChevronDown size={12} />
          </button>

          {showPalette && (
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: '-20px',
                backgroundColor: 'var(--bg-elevated, #1c2028)',
                border: '1.5px solid var(--border-strong, #3f4758)',
                borderRadius: '8px',
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                zIndex: 1010,
                width: '120px'
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {EXECUTIVE_PALETTE.map(p => (
                <button
                  key={p.hex}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleColorChange(p.hex, e)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: p.hex,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: p.hex.toLowerCase() === currentColor.toLowerCase() ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                    padding: 0
                  }}
                  title={p.label}
                >
                  {p.hex.toLowerCase() === currentColor.toLowerCase() && <Check size={13} color="#ffffff" strokeWidth={3} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle, #333a48)', margin: '0 2px' }} />

      {/* Alternar Estilo de Borda */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          const next = currentBorderStyle === 'accent' ? 'border' : currentBorderStyle === 'border' ? 'fill' : 'accent';
          onUpdateBorderStyle(next);
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
        title={`Estilo do Card: ${currentBorderStyle === 'accent' ? 'Destaque Lateral' : currentBorderStyle === 'border' ? 'Borda Completa' : 'Preenchido'}`}
      >
        <Square size={14} />
      </button>

      {/* Alternar Estilo da Linha (Curva Bézier vs Reta) */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onUpdateLineStyle(currentLineStyle === 'bezier' ? 'straight' : 'bezier');
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
        title={`Estilo da Linha: ${currentLineStyle === 'bezier' ? 'Curva Bézier' : 'Linha Reta'}`}
      >
        {currentLineStyle === 'bezier' ? <Spline size={14} /> : <Minus size={14} />}
      </button>

      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle, #333a48)', margin: '0 2px' }} />

      {/* Reordenar Irmãos: Subir ↑ / Descer ↓ */}
      {(canMoveUp || canMoveDown) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '1px' }}>
          <button
            type="button"
            disabled={!canMoveUp}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '3px',
              background: 'transparent',
              border: 'none',
              color: canMoveUp ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: canMoveUp ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Subir na lista"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '3px',
              background: 'transparent',
              border: 'none',
              color: canMoveDown ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: canMoveDown ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Descer na lista"
          >
            <ArrowDown size={13} />
          </button>
        </div>
      )}

      {/* Duplicar */}
      {node.side !== 'root' && (
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
          title="Duplicar Nó"
        >
          <Copy size={13} />
        </button>
      )}

      {/* Excluir Nó (Trash) */}
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
          title="Excluir (Delete)"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
};
