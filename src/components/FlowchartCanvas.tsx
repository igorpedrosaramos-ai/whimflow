import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { FlowShape, WireframeItem } from '../types';

interface FlowchartCanvasProps {
  shapes: FlowShape[];
  wireframes: WireframeItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateShapeText: (id: string, text: string) => void;
  onMoveShape: (id: string, dx: number, dy: number) => void;
  onDeleteShape: (id: string) => void;
  onMoveWireframe: (id: string, dx: number, dy: number) => void;
  onDeleteWireframe: (id: string) => void;
}

export const FlowchartCanvas: React.FC<FlowchartCanvasProps> = ({
  shapes,
  wireframes,
  selectedId,
  onSelect,
  onUpdateShapeText,
  onMoveShape,
  onDeleteShape,
  onMoveWireframe,
  onDeleteWireframe
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'shape' | 'wireframe' | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (id: string, type: 'shape' | 'wireframe', e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(id);
    setDraggingId(id);
    setDragType(type);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !dragStart.current || !dragType) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (dragType === 'shape') {
        onMoveShape(draggingId, dx, dy);
      } else {
        onMoveWireframe(draggingId, dx, dy);
      }
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setDragType(null);
      dragStart.current = null;
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragType, onMoveShape, onMoveWireframe]);

  return (
    <>
      {/* Flowchart Shapes */}
      {shapes.map(shape => {
        const isSelected = selectedId === shape.id;
        const isPill = shape.type === 'pill';
        const isRounded = shape.type === 'rounded';
        const isDiamond = shape.type === 'diamond';

        return (
          <div
            key={shape.id}
            className={`flowchart-shape ${isDiamond ? 'diamond' : ''}`}
            style={{
              left: `${shape.x}px`,
              top: `${shape.y}px`,
              width: `${shape.width}px`,
              height: `${shape.height}px`,
              borderRadius: isPill ? '9999px' : isRounded ? '12px' : '4px',
              backgroundColor: shape.color || 'var(--bg-surface)',
              borderColor: isSelected ? 'var(--accent-purple)' : (shape.borderColor || 'var(--border-strong)'),
              zIndex: isSelected ? 25 : 15
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(shape.id);
            }}
            onMouseDown={(e) => handleMouseDown(shape.id, 'shape', e)}
          >
            <input
              type="text"
              value={shape.text}
              onChange={(e) => onUpdateShapeText(shape.id, e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                textAlign: 'center',
                width: '90%',
                fontWeight: 600,
                fontSize: '13.5px',
                outline: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteShape(shape.id);
                }}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-danger)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      {/* Wireframe UI Elements */}
      {wireframes.map(wf => {
        const isSelected = selectedId === wf.id;

        return (
          <div
            key={wf.id}
            style={{
              position: 'absolute',
              left: `${wf.x}px`,
              top: `${wf.y}px`,
              width: `${wf.width}px`,
              cursor: 'move',
              zIndex: isSelected ? 25 : 15,
              outline: isSelected ? '2px dashed var(--accent-purple)' : 'none',
              outlineOffset: '4px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(wf.id);
            }}
            onMouseDown={(e) => handleMouseDown(wf.id, 'wireframe', e)}
          >
            {wf.type === 'button' && (
              <button
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-purple)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                {wf.label || 'Botão de Ação'}
              </button>
            )}

            {wf.type === 'input' && (
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {wf.label || 'Campo de Entrada'}
                </label>
                <input
                  type="text"
                  placeholder="Digite aqui..."
                  readOnly
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            {wf.type === 'card' && (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{wf.label || 'Container Card'}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Bloco de conteúdo de alta fidelidade para prototipagem rápida.</div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
