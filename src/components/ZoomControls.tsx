import React from 'react';
import { 
  Undo2, 
  Redo2, 
  Clock, 
  Minus, 
  Plus, 
  Zap, 
  HelpCircle 
} from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenVersionHistory?: () => void;
  onOpenShortcuts?: () => void;
  onOpenSearch?: () => void;
  onOpenQuickSpark?: () => void;
  theme?: 'dark' | 'light';
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo = true,
  canRedo = false,
  onUndo,
  onRedo,
  onOpenVersionHistory,
  onOpenShortcuts,
  onOpenSearch,
  onOpenQuickSpark,
  theme = 'light'
}) => {
  const zoomPercent = Math.round(zoom * 100);
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        backgroundColor: isDark ? '#1b212c' : '#ffffff',
        border: isDark ? '1px solid #2d3748' : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '3px 4px',
        boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 4px 18px rgba(0, 0, 0, 0.1)',
        userSelect: 'none'
      }}
    >
      {/* Desfazer */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: canUndo ? (isDark ? '#f1f5f9' : '#334155') : '#94a3b8',
          opacity: canUndo ? 1 : 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canUndo ? 'pointer' : 'default'
        }}
        title="Desfazer (Ctrl + Z)"
      >
        <Undo2 size={14} />
      </button>

      {/* Refazer */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: canRedo ? (isDark ? '#f1f5f9' : '#334155') : '#94a3b8',
          opacity: canRedo ? 1 : 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canRedo ? 'pointer' : 'default'
        }}
        title="Refazer (Ctrl + Y)"
      >
        <Redo2 size={14} />
      </button>

      {/* Divisor */}
      <div style={{ width: '1px', height: '18px', backgroundColor: isDark ? '#2e384b' : '#e2e8f0', margin: '0 3px' }} />

      {/* Histórico / Time Machine */}
      <button
        onClick={onOpenVersionHistory}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: isDark ? '#f1f5f9' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Histórico de Versões e Marcos (Time Machine)"
      >
        <Clock size={14} />
      </button>

      {/* Divisor */}
      <div style={{ width: '1px', height: '18px', backgroundColor: isDark ? '#2e384b' : '#e2e8f0', margin: '0 3px' }} />

      {/* Zoom Menos */}
      <button
        onClick={onZoomOut}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: isDark ? '#f1f5f9' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Reduzir Zoom (Ctrl + Wheel)"
      >
        <Minus size={14} />
      </button>

      {/* Percentual de Zoom */}
      <button
        onClick={onResetZoom}
        style={{
          padding: '2px 6px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: 'transparent',
          color: isDark ? '#f1f5f9' : '#334155',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: '40px',
          textAlign: 'center'
        }}
        title="Ajustar e centralizar mapa ao centro da tela"
      >
        {zoomPercent}%
      </button>

      {/* Zoom Mais */}
      <button
        onClick={onZoomIn}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: isDark ? '#f1f5f9' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Aumentar Zoom (Ctrl + Wheel)"
      >
        <Plus size={14} />
      </button>

      {/* Divisor */}
      <div style={{ width: '1px', height: '18px', backgroundColor: isDark ? '#2e384b' : '#e2e8f0', margin: '0 3px' }} />

      {/* Ação Rápida Whimflow Spark */}
      <button
        id="btn-zoom-spark"
        onClick={onOpenQuickSpark || onOpenSearch}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Whimflow Spark: Criador Relâmpago e Text-to-Map (Ctrl+J)"
      >
        <Zap size={14} />
      </button>

      {/* Ajuda */}
      <button
        onClick={onOpenShortcuts}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: 'transparent',
          color: isDark ? '#f1f5f9' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Ajuda e Atalhos do Teclado (?)"
      >
        <HelpCircle size={14} />
      </button>
    </div>
  );
};
