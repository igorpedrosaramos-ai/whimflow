import React from 'react';
import { Minus, Plus, Maximize } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenAI?: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom
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
          fontSize: '12.5px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          minWidth: '44px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        title="Clique para ajustar visualização ao centro"
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
        title="Centralizar e Enquadrar Mapa Mental"
      >
        <Maximize size={15} />
      </button>
    </div>
  );
};
