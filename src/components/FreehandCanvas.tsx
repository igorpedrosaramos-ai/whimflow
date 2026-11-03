import React from 'react';
import { DrawingStroke } from '../types';

interface FreehandCanvasProps {
  drawings: DrawingStroke[];
}

export const FreehandCanvas: React.FC<FreehandCanvasProps> = ({ drawings }) => {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      {drawings.map(d => {
        if (d.points.length < 2) return null;
        const pathData = d.points.reduce((acc, point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
        }, '');

        return (
          <path
            key={d.id}
            d={pathData}
            fill="none"
            stroke={d.color || '#f43f5e'}
            strokeWidth={d.strokeWidth || 3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
};
