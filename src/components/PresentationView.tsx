import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { Board, MindMapNode } from '../types';

interface PresentationViewProps {
  board: Board;
  onClose: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ board, onClose }) => {
  const rootNode = board.mindMapNodes.find(n => n.side === 'root') || board.mindMapNodes[0];
  const primaryBranches = board.mindMapNodes.filter(n => n.parentId === rootNode?.id);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Slides: 0 é o Slide Raiz / Capa, e os demais são os ramos principais com seus filhos
  const totalSlides = 1 + primaryBranches.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, onClose]);

  const currentBranch = currentSlideIndex > 0 ? primaryBranches[currentSlideIndex - 1] : null;
  const currentSubItems = currentBranch 
    ? board.mindMapNodes.filter(n => n.parentId === currentBranch.id)
    : [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0f1115',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      userSelect: 'none'
    }}>
      {/* Top Header */}
      <div style={{
        height: '60px',
        borderBottom: '1px solid #232730',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#161920'
      }}>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#818cf8' }}>
          {board.title} • Modo Apresentação Executiva
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Slide {currentSlideIndex + 1} de {totalSlides}
          </span>
          <button
            onClick={onClose}
            style={{
              background: '#232730',
              border: 'none',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <X size={16} />
            <span>Encerrar (Esc)</span>
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        {currentSlideIndex === 0 ? (
          // Capa / Nó Central
          <div style={{ textAlign: 'center', maxWidth: '750px' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: '20px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid #6366f1',
              color: '#818cf8',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '24px'
            }}>
              Planejamento Estratégico & Gestão
            </div>
            <h1 style={{ fontSize: '46px', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>
              {rootNode?.text || 'Turbine Gestão de Delivery'}
            </h1>
            <p style={{ fontSize: '19px', color: '#94a3b8', lineHeight: 1.6 }}>
              Apresentação executiva e detalhamento dos {primaryBranches.length} pilares de entrega, eficiência e governança.
            </p>
          </div>
        ) : (
          // Slide de Ramo Específico
          <div style={{ width: '100%', maxWidth: '850px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: currentBranch?.color || '#6366f1',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Tópico {currentSlideIndex}
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '32px' }}>
              {currentBranch?.text}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentSubItems.length > 0 ? (
                currentSubItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#1b1f28',
                      borderLeft: `4px solid ${currentBranch?.color || '#818cf8'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {idx + 1}
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '15px' }}>
                  Este tópico não possui subitens cadastrados.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div style={{
        height: '70px',
        borderTop: '1px solid #232730',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#161920'
      }}>
        <button
          onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: currentSlideIndex === 0 ? '#1f242e' : '#2d3342',
            border: 'none',
            borderRadius: '6px',
            color: currentSlideIndex === 0 ? '#64748b' : '#ffffff',
            cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <ChevronLeft size={18} />
          <span>Anterior (←)</span>
        </button>

        <div style={{ display: 'flex', gap: '6px' }}>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              style={{
                width: idx === currentSlideIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === currentSlideIndex ? '#818cf8' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlideIndex === totalSlides - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: currentSlideIndex === totalSlides - 1 ? '#1f242e' : '#6366f1',
            border: 'none',
            borderRadius: '6px',
            color: currentSlideIndex === totalSlides - 1 ? '#64748b' : '#ffffff',
            cursor: currentSlideIndex === totalSlides - 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <span>Próximo (→ ou Espaço)</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
