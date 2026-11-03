import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { StickyNote } from '../types';

interface StickyNotesCanvasProps {
  stickies: StickyNote[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateText: (id: string, text: string) => void;
  onMove: (id: string, dx: number, dy: number) => void;
  onDelete: (id: string) => void;
}

const STICKY_COLORS = [
  '#fef08a', // Yellow
  '#a5f3fc', // Cyan
  '#fbcfe8', // Pink
  '#bbf7d0', // Green
  '#e9d5ff', // Purple
  '#f1f5f9'  // Light Slate
];

export const StickyNotesCanvas: React.FC<StickyNotesCanvasProps> = ({
  stickies,
  selectedId,
  onSelect,
  onUpdateText,
  onMove,
  onDelete
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(id);
    setDraggingId(id);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      onMove(draggingId, dx, dy);
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setDraggingId(null);
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
  }, [draggingId, onMove]);

  return (
    <>
      {stickies.map(s => {
        const isSelected = selectedId === s.id;
        return (
          <div
            key={s.id}
            className="sticky-note-card"
            style={{
              left: `${s.x}px`,
              top: `${s.y}px`,
              width: `${s.width}px`,
              minHeight: `${s.height}px`,
              backgroundColor: s.color || '#fef08a',
              outline: isSelected ? '2px solid var(--accent-purple)' : 'none',
              zIndex: isSelected ? 25 : 15
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(s.id);
            }}
            onMouseDown={(e) => handleMouseDown(s.id, e)}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="Excluir nota"
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              value={s.text}
              onChange={(e) => onUpdateText(s.id, e.target.value)}
              placeholder="Escreva sua nota aqui..."
              style={{
                width: '100%',
                flex: 1,
                minHeight: '80px',
                background: 'transparent',
                border: 'none',
                resize: 'none',
                outline: 'none',
                color: '#1e293b',
                fontSize: '13.5px',
                lineHeight: '1.45',
                fontFamily: 'inherit'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      })}
    </>
  );
};
