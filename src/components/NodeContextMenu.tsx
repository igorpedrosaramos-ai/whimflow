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

  // Cores de acesso rápido direto
  const QUICK_COLORS = ['#6366f1', '#0d9488', '#059669', '#ea580c', '#e11d48'];

  const handleColorChange = (hex: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    onUpdateColor(hex);
    setShowPalette(false);
  };

  return (
    <div
      className="node-context-menu"
      style={{
        position: 'absolute',
        left: `${position.x + position.width / 2}px`,
        top: `${position.y - 48}px`,
        transform: 'translateX(-50%)',
        backgroundColor: '#1e232d',
        border: '1.5px solid #3d4556',
        borderRadius: '8px',
        padding: '5px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        zIndex: 1000,
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botões Rápidos de Cores (Cores com 1 Toque) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {QUICK_COLORS.map(hex => (
          <button
            key={hex}
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => handleColorChange(hex, e)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: hex,
              cursor: 'pointer',
              border: hex === currentColor ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
              boxShadow: hex === currentColor ? '0 0 6px ' + hex : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            title={`Alterar Cor para ${hex}`}
          >
            {hex === currentColor && <Check size={11} color="#ffffff" />}
          </button>
        ))}

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
              width: '22px',
              height: '22px',
              borderRadius: '4px',
              background: '#282e3b',
              border: '1px solid #3f4758',
              cursor: 'pointer',
              color: '#cbd5e1',
              padding: 0
            }}
            title="Mais Cores"
          >
            <ChevronDown size={13} />
          </button>

          {showPalette && (
            <div
              style={{
                position: 'absolute',
                top: '30px',
                left: '-40px',
                backgroundColor: '#1c2028',
                border: '1.5px solid #3f4758',
                borderRadius: '8px',
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
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
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: p.hex,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: p.hex === currentColor ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                    padding: 0
                  }}
                  title={p.label}
                >
                  {p.hex === currentColor && <Check size={14} color="#ffffff" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '1px', height: '18px', backgroundColor: '#333a48', margin: '0 2px' }} />

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
          width: '26px',
          height: '26px',
          borderRadius: '4px',
          background: 'transparent',
          border: 'none',
          color: '#cbd5e1',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`Estilo do Card: ${currentBorderStyle === 'accent' ? 'Destaque Lateral' : currentBorderStyle === 'border' ? 'Borda Completa' : 'Preenchido'}`}
      >
        <Square size={15} />
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
          width: '26px',
          height: '26px',
          borderRadius: '4px',
          background: 'transparent',
          border: 'none',
          color: '#cbd5e1',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`Estilo da Linha: ${currentLineStyle === 'bezier' ? 'Curva Bézier Suave' : 'Linha Reta'}`}
      >
        {currentLineStyle === 'bezier' ? <Spline size={15} /> : <Minus size={15} />}
      </button>

      <div style={{ width: '1px', height: '18px', backgroundColor: '#333a48', margin: '0 2px' }} />

      {/* Reordenar Irmãos: Subir ↑ */}
      {canMoveUp && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Mover Quadrado para Cima (Reordenar)"
        >
          <ArrowUp size={15} />
        </button>
      )}

      {/* Reordenar Irmãos: Descer ↓ */}
      {canMoveDown && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Mover Quadrado para Baixo (Reordenar)"
        >
          <ArrowDown size={15} />
        </button>
      )}

      <div style={{ width: '1px', height: '18px', backgroundColor: '#333a48', margin: '0 2px' }} />

      {/* Criar Ramo Filho (+) */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onAddChild();
        }}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '4px',
          background: 'transparent',
          border: 'none',
          color: currentColor,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Criar Quadrado Filho com Linha (Tab)"
      >
        <Plus size={16} />
      </button>

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
            width: '26px',
            height: '26px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Duplicar Nó"
        >
          <Copy size={14} />
        </button>
      )}

      {/* Excluir Nó (Trash) com ação garantida */}
      {node.side !== 'root' && (
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '4px',
            background: '#37181f',
            border: '1px solid #5c202b',
            color: '#f87171',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Excluir Quadrado e Linha (Delete)"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};
