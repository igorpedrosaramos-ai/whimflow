import React from 'react';
import { Minus, Plus, Maximize, Sparkles, HelpCircle } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenAI: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenAI
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="bottom-controls">
      <button
        onClick={onZoomOut}
        className="tool-button"
        style={{ width: '28px', height: '28px' }}
        title="Reduzir Zoom (Ctrl + Wheel)"
      >
        <Minus size={15} />
      </button>

      <span
        onClick={onResetZoom}
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          minWidth: '48px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        title="Clique para redefinir zoom para 100%"
      >
        {zoomPercent}%
      </span>

      <button
        onClick={onZoomIn}
        className="tool-button"
        style={{ width: '28px', height: '28px' }}
        title="Aumentar Zoom (Ctrl + Wheel)"
      >
        <Plus size={15} />
      </button>

      <button
        onClick={onResetZoom}
        className="tool-button"
        style={{ width: '28px', height: '28px' }}
        title="Ajustar ao Centro da Tela"
      >
        <Maximize size={15} />
      </button>

      <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)', margin: '0 2px' }} />

      <button
        onClick={onOpenAI}
        className="tool-button"
        style={{ width: '28px', height: '28px', color: 'var(--accent-purple-light)' }}
        title="Assistente de Ideias IA"
      >
        <Sparkles size={16} />
      </button>
    </div>
  );
};
