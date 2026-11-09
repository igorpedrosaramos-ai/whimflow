import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Building2, 
  Diamond, 
  GitFork, 
  FileText, 
  Kanban, 
  Tv, 
  Smartphone, 
  LayoutGrid, 
  FolderClosed,
  Check
} from 'lucide-react';
import { TEMPLATES, TemplateItem } from '../constants/templatesData';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  workspaceName?: string;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  workspaceName = 'teste'
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('suggested');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery.trim()) return matchesSearch;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'suggested') return t.category === 'suggested' || t.category === 'diagrams';
    if (activeCategory === 'workspace') return true;
    return t.category === activeCategory;
  });

  const categories = [
    { id: 'suggested', label: 'Suggested', icon: <Sparkles size={15} color="#c084fc" /> },
    { id: 'workspace', label: workspaceName, icon: <Building2 size={15} color="#94a3b8" /> },
    { id: 'popular', label: 'Popular', icon: <Diamond size={15} color="#94a3b8" /> },
    { id: 'diagrams', label: 'Diagrams', icon: <GitFork size={15} color="#ec4899" /> },
    { id: 'product', label: 'Product docs', icon: <FileText size={15} color="#38bdf8" /> },
    { id: 'project', label: 'Project management', icon: <Kanban size={15} color="#facc15" /> },
    { id: 'whiteboarding', label: 'Whiteboarding', icon: <Tv size={15} color="#4ade80" /> },
    { id: 'wireframes', label: 'Wireframes', icon: <Smartphone size={15} color="#60a5fa" /> },
    { id: 'all', label: 'All', icon: <LayoutGrid size={15} color="#94a3b8" /> },
  ];

  const renderSvgPreview = (type: TemplateItem['previewType']) => {
    switch (type) {
      case 'mindmap':
        return (
          <svg viewBox="0 0 380 200" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
            <circle cx="190" cy="90" r="14" fill="#7c3aed" />
            <rect x="160" y="80" width="60" height="20" rx="4" fill="#7c3aed" />
            <path d="M 160 90 C 120 90, 100 50, 60 50" fill="none" stroke="#ec4899" strokeWidth="2.5" />
            <path d="M 160 90 C 120 90, 100 130, 60 130" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
            <path d="M 220 90 C 260 90, 280 50, 320 50" fill="none" stroke="#10b981" strokeWidth="2.5" />
            <path d="M 220 90 C 260 90, 280 90, 320 90" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M 220 90 C 260 90, 280 130, 320 130" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
            
            <rect x="30" y="40" width="60" height="18" rx="3" fill="#ffffff" stroke="#ec4899" strokeWidth="1.5" />
            <rect x="30" y="120" width="60" height="18" rx="3" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.5" />
            <rect x="290" y="40" width="60" height="18" rx="3" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
            <rect x="290" y="80" width="60" height="18" rx="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="290" y="120" width="60" height="18" rx="3" fill="#ffffff" stroke="#06b6d4" strokeWidth="1.5" />
          </svg>
        );
      case 'flowchart':
        return (
          <svg viewBox="0 0 380 200" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
            <rect x="140" y="20" width="100" height="28" rx="14" fill="#6366f1" />
            <line x1="190" y1="48" x2="190" y2="75" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
            <polygon points="190,75 235,100 190,125 145,100" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
            <line x1="235" y1="100" x2="280" y2="100" stroke="#10b981" strokeWidth="2" />
            <rect x="280" y="86" width="80" height="28" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
            <line x1="190" y1="125" x2="190" y2="155" stroke="#ef4444" strokeWidth="2" />
            <rect x="140" y="155" width="100" height="28" rx="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
          </svg>
        );
      case 'stickies':
        return (
          <svg viewBox="0 0 380 200" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
            <rect x="40" y="30" width="65" height="65" rx="3" fill="#fef08a" stroke="#fde047" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
            <rect x="120" y="30" width="65" height="65" rx="3" fill="#bbf7d0" stroke="#86efac" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
            <rect x="200" y="30" width="65" height="65" rx="3" fill="#fed7aa" stroke="#fdba74" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />
            <rect x="280" y="30" width="65" height="65" rx="3" fill="#e9d5ff" stroke="#d8b4fe" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))" />

            <rect x="40" y="110" width="65" height="65" rx="3" fill="#fef08a" stroke="#fde047" strokeWidth="1" />
            <rect x="120" y="110" width="65" height="65" rx="3" fill="#bbf7d0" stroke="#86efac" strokeWidth="1" />
            <rect x="200" y="110" width="65" height="65" rx="3" fill="#fed7aa" stroke="#fdba74" strokeWidth="1" />
            <rect x="280" y="110" width="65" height="65" rx="3" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1" />
          </svg>
        );
      case 'wireframe':
        return (
          <svg viewBox="0 0 380 200" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
            <rect x="60" y="20" width="80" height="150" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
            <rect x="70" y="35" width="60" height="12" rx="2" fill="#e2e8f0" />
            <rect x="70" y="55" width="60" height="30" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="70" y="95" width="60" height="14" rx="2" fill="#0284c7" />

            <rect x="170" y="20" width="80" height="150" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
            <rect x="180" y="35" width="60" height="12" rx="2" fill="#e2e8f0" />
            <circle cx="210" cy="70" r="16" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="180" y="100" width="60" height="8" rx="2" fill="#e2e8f0" />
            <rect x="180" y="115" width="60" height="14" rx="2" fill="#0284c7" />

            <rect x="280" y="20" width="80" height="150" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
            <rect x="290" y="35" width="60" height="40" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="290" y="85" width="60" height="10" rx="2" fill="#e2e8f0" />
            <rect x="290" y="105" width="60" height="14" rx="2" fill="#10b981" />
          </svg>
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '980px',
          maxWidth: '96vw',
          height: '660px',
          maxHeight: '92vh',
          backgroundColor: '#1b2029',
          border: '1px solid #2d3545',
          borderRadius: '12px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          overflow: 'hidden',
          color: '#e2e8f0'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Barra Lateral de Categorias */}
        <div
          style={{
            width: '230px',
            backgroundColor: '#171b23',
            borderRight: '1px solid #283040',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 12px',
            gap: '12px'
          }}
        >
          {/* Campo de Busca */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#12161c',
              border: '1px solid #2a3242',
              borderRadius: '6px',
              padding: '7px 10px'
            }}
          >
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search templates"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '13px',
                width: '100%'
              }}
            />
          </div>

          {/* Lista de Categorias */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
            {categories.map(cat => {
              const isActive = activeCategory === cat.id && !searchQuery.trim();
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? '#262f3f' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Rodapé da Barra Lateral */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid #283040' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '13px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <FolderClosed size={15} color="#94a3b8" />
              <span>My templates</span>
            </button>
          </div>
        </div>

        {/* Área de Conteúdo dos Templates */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Cabeçalho */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #283040'
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Suggested templates for boards
            </h2>
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
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Grid de Templates */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '18px',
              alignContent: 'start'
            }}
          >
            {filteredTemplates.map(template => {
              const isHovered = hoveredTemplateId === template.id;
              return (
                <div
                  key={template.id}
                  className="template-card-item"
                  data-template-id={template.id}
                  onMouseEnter={() => setHoveredTemplateId(template.id)}
                  onMouseLeave={() => setHoveredTemplateId(null)}
                  style={{
                    border: `1.5px solid ${isHovered ? '#6366f1' : '#283244'}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#161a22',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.35)' : 'none'
                  }}
                  onClick={() => onSelectTemplate(template)}
                >
                  {/* Cabeçalho do Card */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      backgroundColor: '#1b212c',
                      borderBottom: '1px solid #283244'
                    }}
                  >
                    <GitFork size={14} color="#818cf8" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                      {template.title}
                    </span>
                  </div>

                  {/* Prévia SVG Ilustrativa */}
                  <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                    {renderSvgPreview(template.previewType)}

                    {/* Botões de Ação ao Passar o Mouse */}
                    {isHovered && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(15, 23, 42, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                        }}
                      >
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectTemplate(template);
                          }}
                          style={{
                            backgroundColor: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
                          }}
                        >
                          Use
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectTemplate(template);
                          }}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 14px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
