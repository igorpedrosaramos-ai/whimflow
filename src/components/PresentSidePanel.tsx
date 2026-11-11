import React from 'react';
import { 
  Play, 
  Plus, 
  X, 
  MoreHorizontal, 
  Folder, 
  Layout, 
  Trash2 
} from 'lucide-react';
import { MindMapNode } from '../types';

export interface SlideSection {
  id: string;
  title: string;
  nodeIds: string[];
}

interface PresentSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SlideSection[];
  onAddSection: () => void;
  onSelectSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onStartPresentation: () => void;
  theme?: 'dark' | 'light';
}

export const PresentSidePanel: React.FC<PresentSidePanelProps> = ({
  isOpen,
  onClose,
  sections,
  onAddSection,
  onSelectSection,
  onDeleteSection,
  onStartPresentation,
  theme = 'light'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: isDark ? '#161a22' : '#ffffff',
        borderLeft: isDark ? '1px solid #232a38' : '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        flexShrink: 0,
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Topo do Painel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: isDark ? '1px solid #232a38' : '1px solid #e2e8f0'
        }}
      >
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
          Present
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Botão + Add section */}
          <button
            onClick={onAddSection}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 8px',
              borderRadius: '5px',
              backgroundColor: isDark ? '#232b38' : '#f1f5f9',
              border: isDark ? '1px solid #333f52' : '1px solid #e2e8f0',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Adicionar Seção / Slide"
          >
            <Plus size={13} />
            <span>Adicionar seção</span>
          </button>

          {/* Botão ▷ Apresentar */}
          <button
            onClick={onStartPresentation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '5px',
              backgroundColor: '#7c3aed',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
            }}
            title="Iniciar Apresentação"
          >
            <Play size={12} fill="#ffffff" />
            <span>Apresentar</span>
          </button>

          {/* Fechar */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Lista de Seções / Slides */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8', fontSize: '12.5px' }}>
            Nenhuma seção adicionada.<br />
            Clique em <b>+ Adicionar seção</b> para criar slides de apresentação.
          </div>
        ) : (
          sections.map((section, idx) => (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: isDark ? '#1e2430' : '#f8fafc',
                border: isDark ? '1px solid #2c3545' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'background-color 0.15s, border-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#818cf8')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? '#2c3545' : '#e2e8f0')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Folder size={15} color="#7c3aed" />
                <span style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {section.title || `Seção ${idx + 1}`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                  title="Remover seção"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
