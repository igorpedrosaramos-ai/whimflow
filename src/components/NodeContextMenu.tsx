import React, { useState } from 'react';
import { 
  Palette, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Copy, 
  Trash2, 
  Spline, 
  Minus, 
  Square,
  Check
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
  position: { x: number; y: number; width: number };
  onUpdateColor: (color: string) => void;
  onUpdateBorderStyle: (style: 'accent' | 'border' | 'fill') => void;
  onUpdateLineStyle: (style: 'bezier' | 'straight') => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddChild: () => void;
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
  onAddChild,
  onDuplicate,
  onDelete,
  canMoveUp,
  canMoveDown
}) => {
  const [showPalette, setShowPalette] = useState(false);
  const currentColor = node.color || '#6366f1';
  const currentBorderStyle = node.borderStyle || 'accent';
  const currentLineStyle = node.lineStyle || 'bezier';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x + position.width / 2}px`,
        top: `${position.y - 48}px`,
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-strong)',
        borderRadius: '8px',
        padding: '4px 6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        zIndex: 100,
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Seletor de Cores da Borda e Linha */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPalette(!showPalette)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'transparent',
            border: 'none',
            padding: '4px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          title="Alterar Cor da Borda e da Linha"
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: currentColor,
              border: '2px solid rgba(255,255,255,0.4)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          />
        </button>

        {/* Popover da Paleta de Cores */}
        {showPalette && (
          <div
            style={{
              position: 'absolute',
              top: '32px',
              left: '0',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: '8px',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              zIndex: 110,
              width: '110px'
            }}
          >
            {EXECUTIVE_PALETTE.map(p => (
              <div
                key={p.hex}
                onClick={() => {
                  onUpdateColor(p.hex);
                  setShowPalette(false);
                }}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: p.hex,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: p.hex === currentColor ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.2)'
                }}
                title={p.label}
              >
                {p.hex === currentColor && <Check size={14} color="#ffffff" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)', margin: '0 2px' }} />

      {/* Alternar Estilo de Borda (Destaque Lateral, Borda Completa, Preenchido) */}
      <button
        onClick={() => {
          const next = currentBorderStyle === 'accent' ? 'border' : currentBorderStyle === 'border' ? 'fill' : 'accent';
          onUpdateBorderStyle(next);
        }}
        className="tool-button"
        style={{ width: '28px', height: '28px' }}
        title={`Estilo do Card: ${currentBorderStyle === 'accent' ? 'Destaque Lateral' : currentBorderStyle === 'border' ? 'Borda Completa' : 'Preenchido'}`}
      >
        <Square size={15} />
      </button>

      {/* Alternar Estilo da Linha (Curva Bézier vs Linha Reta) */}
      <button
        onClick={() => {
          onUpdateLineStyle(currentLineStyle === 'bezier' ? 'straight' : 'bezier');
        }}
        className="tool-button"
        style={{ width: '28px', height: '28px' }}
        title={`Estilo da Linha: ${currentLineStyle === 'bezier' ? 'Curva Bézier Suave' : 'Linha Reta'}`}
      >
        {currentLineStyle === 'bezier' ? <Spline size={15} /> : <Minus size={15} />}
      </button>

      <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)', margin: '0 2px' }} />

      {/* Reordenar Irmãos: Subir ↑ */}
      {canMoveUp && (
        <button
          onClick={onMoveUp}
          className="tool-button"
          style={{ width: '28px', height: '28px' }}
          title="Mover Quadrado para Cima (Reordenar)"
        >
          <ArrowUp size={15} />
        </button>
      )}

      {/* Reordenar Irmãos: Descer ↓ */}
      {canMoveDown && (
        <button
          onClick={onMoveDown}
          className="tool-button"
          style={{ width: '28px', height: '28px' }}
          title="Mover Quadrado para Baixo (Reordenar)"
        >
          <ArrowDown size={15} />
        </button>
      )}

      <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)', margin: '0 2px' }} />

      {/* Criar Ramo Filho */}
      <button
        onClick={onAddChild}
        className="tool-button"
        style={{ width: '28px', height: '28px', color: currentColor }}
        title="Adicionar Ramo Filho com Linha (Tab)"
      >
        <Plus size={16} />
      </button>

      {/* Duplicar */}
      {node.side !== 'root' && (
        <button
          onClick={onDuplicate}
          className="tool-button"
          style={{ width: '28px', height: '28px' }}
          title="Duplicar Nó"
        >
          <Copy size={14} />
        </button>
      )}

      {/* Excluir */}
      {node.side !== 'root' && (
        <button
          onClick={onDelete}
          className="tool-button"
          style={{ width: '28px', height: '28px', color: 'var(--accent-danger)' }}
          title="Excluir Nó e Linha (Delete)"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};
