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
  ArrowLeft,
  Minus,
  Plus
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
  
  // Estado para Visualização Detalhada / Preview Individual do Template (FOTO 4 DO WHIMSICAL)
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<TemplateItem | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1.0);

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (searchQuery.trim()) return matchesSearch;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'suggested') return t.category === 'suggested' || t.category === 'popular';
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

  // Renderizador SVG profissional de alta fidelidade
  const renderSvgPreview = (template: TemplateItem, isLargePreview = false) => {
    if (template.previewType === 'orgchart') {
      return (
        <svg viewBox="0 0 640 320" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
          {/* Fundo Pontilhado Sutil */}
          <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#e2e8f0" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />

          {/* Top Level: Role Title / Full Name */}
          <rect x="260" y="20" width="120" height="36" rx="4" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="320" y="36" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="320" y="48" textAnchor="middle" fontSize="9" fill="#64748b">Full Name</text>

          {/* Conector Central Saindo do Topo */}
          <line x1="320" y1="56" x2="320" y2="76" stroke="#94a3b8" strokeWidth="2" />
          <line x1="120" y1="76" x2="520" y2="76" stroke="#94a3b8" strokeWidth="2" />

          {/* Ramo 1: Roxo */}
          <path d="M 120 76 L 120 100" fill="none" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="70" y="100" width="100" height="34" rx="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x="120" y="115" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="120" y="126" textAnchor="middle" fontSize="8.5" fill="#64748b">Full Name</text>

          {/* Sub-ramos Ramo 1 */}
          <line x1="120" y1="134" x2="120" y2="150" stroke="#8b5cf6" strokeWidth="2" />
          <line x1="70" y1="150" x2="170" y2="150" stroke="#8b5cf6" strokeWidth="2" />
          <line x1="70" y1="150" x2="70" y2="170" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="25" y="170" width="90" height="32" rx="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
          <text x="70" y="184" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="70" y="194" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          <line x1="170" y1="150" x2="170" y2="170" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="125" y="170" width="90" height="32" rx="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
          <text x="170" y="184" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="170" y="194" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          {/* Sub-filho Ramo 1 */}
          <line x1="170" y1="202" x2="170" y2="230" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="125" y="230" width="90" height="32" rx="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.2" />
          <text x="170" y="244" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="170" y="254" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          {/* Ramo 2: Azul */}
          <path d="M 260 76 L 260 100" fill="none" stroke="#0284c7" strokeWidth="2" />
          <rect x="210" y="100" width="100" height="34" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
          <text x="260" y="115" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="260" y="126" textAnchor="middle" fontSize="8.5" fill="#64748b">Full Name</text>

          <line x1="260" y1="134" x2="260" y2="170" stroke="#0284c7" strokeWidth="2" />
          <rect x="215" y="170" width="90" height="32" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
          <text x="260" y="184" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="260" y="194" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          <line x1="260" y1="202" x2="260" y2="230" stroke="#0284c7" strokeWidth="2" />
          <rect x="215" y="230" width="90" height="32" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
          <text x="260" y="244" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="260" y="254" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          {/* Ramo 3: Teal */}
          <path d="M 380 76 L 380 100" fill="none" stroke="#0d9488" strokeWidth="2" />
          <rect x="330" y="100" width="100" height="34" rx="4" fill="#ffffff" stroke="#0d9488" strokeWidth="1.5" />
          <text x="380" y="115" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="380" y="126" textAnchor="middle" fontSize="8.5" fill="#64748b">Full Name</text>

          <line x1="380" y1="134" x2="380" y2="150" stroke="#0d9488" strokeWidth="2" />
          <line x1="340" y1="150" x2="420" y2="150" stroke="#0d9488" strokeWidth="2" />
          <line x1="340" y1="150" x2="340" y2="170" stroke="#0d9488" strokeWidth="2" />
          <rect x="295" y="170" width="90" height="32" rx="4" fill="#ffffff" stroke="#0d9488" strokeWidth="1.2" />
          <text x="340" y="184" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="340" y="194" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          <line x1="420" y1="150" x2="420" y2="170" stroke="#0d9488" strokeWidth="2" />
          <rect x="375" y="170" width="90" height="32" rx="4" fill="#ffffff" stroke="#0d9488" strokeWidth="1.2" />
          <text x="420" y="184" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="420" y="194" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          {/* Ramo 4: Laranja */}
          <path d="M 520 76 L 520 100" fill="none" stroke="#ea580c" strokeWidth="2" />
          <rect x="470" y="100" width="100" height="34" rx="4" fill="#ffffff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="520" y="115" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="520" y="126" textAnchor="middle" fontSize="8.5" fill="#64748b">Full Name</text>

          <line x1="520" y1="134" x2="520" y2="150" stroke="#ea580c" strokeWidth="2" />
          <line x1="480" y1="150" x2="560" y2="150" stroke="#ea580c" strokeWidth="2" />
          <line x1="480" y1="150" x2="480" y2="170" stroke="#ea580c" strokeWidth="2" />
          <rect x="435" y="170" width="90" height="32" rx="4" fill="#ffffff" stroke="#ea580c" strokeWidth="1.2" />
          <text x="480" y="184" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="480" y="194" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          <line x1="560" y1="150" x2="560" y2="170" stroke="#ea580c" strokeWidth="2" />
          <rect x="515" y="170" width="90" height="32" rx="4" fill="#ffffff" stroke="#ea580c" strokeWidth="1.2" />
          <text x="560" y="184" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="560" y="194" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>

          <line x1="480" y1="202" x2="480" y2="230" stroke="#ea580c" strokeWidth="2" />
          <rect x="435" y="230" width="90" height="32" rx="4" fill="#ffffff" stroke="#ea580c" strokeWidth="1.2" />
          <text x="480" y="244" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Role Title</text>
          <text x="480" y="254" textAnchor="middle" fontSize="8" fill="#64748b">Full Name</text>
        </svg>
      );
    }

    if (template.previewType === 'mindmap') {
      return (
        <svg viewBox="0 0 380 200" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
          <circle cx="190" cy="90" r="14" fill="#7c3aed" />
          <rect x="155" y="78" width="70" height="24" rx="5" fill="#7c3aed" />
          <text x="190" y="94" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">Platform</text>

          <path d="M 155 90 C 110 90, 90 45, 50 45" fill="none" stroke="#ec4899" strokeWidth="2.5" />
          <path d="M 155 90 C 110 90, 90 135, 50 135" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
          <path d="M 225 90 C 270 90, 290 45, 330 45" fill="none" stroke="#10b981" strokeWidth="2.5" />
          <path d="M 225 90 C 270 90, 290 90, 330 90" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M 225 90 C 270 90, 290 135, 330 135" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
          
          <rect x="20" y="34" width="75" height="22" rx="4" fill="#ffffff" stroke="#ec4899" strokeWidth="1.5" />
          <rect x="20" y="124" width="75" height="22" rx="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.5" />
          <rect x="285" y="34" width="75" height="22" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
          <rect x="285" y="79" width="75" height="22" rx="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="285" y="124" width="75" height="22" rx="4" fill="#ffffff" stroke="#06b6d4" strokeWidth="1.5" />
        </svg>
      );
    }

    if (template.previewType === 'flowchart') {
      return (
        <svg viewBox="0 0 380 200" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
          <rect x="140" y="20" width="100" height="28" rx="14" fill="#6366f1" />
          <line x1="190" y1="48" x2="190" y2="75" stroke="#94a3b8" strokeWidth="2" />
          <polygon points="190,75 235,100 190,125 145,100" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
          <line x1="235" y1="100" x2="280" y2="100" stroke="#10b981" strokeWidth="2" />
          <rect x="280" y="86" width="80" height="28" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
          <line x1="190" y1="125" x2="190" y2="155" stroke="#3b82f6" strokeWidth="2" />
          <rect x="140" y="155" width="100" height="28" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
        </svg>
      );
    }

    if (template.previewType === 'stickies') {
      return (
        <svg viewBox="0 0 380 200" style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}>
          <rect x="40" y="30" width="65" height="65" rx="3" fill="#fef08a" stroke="#fde047" strokeWidth="1" />
          <rect x="120" y="30" width="65" height="65" rx="3" fill="#bbf7d0" stroke="#86efac" strokeWidth="1" />
          <rect x="200" y="30" width="65" height="65" rx="3" fill="#fed7aa" stroke="#fdba74" strokeWidth="1" />
          <rect x="280" y="30" width="65" height="65" rx="3" fill="#e9d5ff" stroke="#d8b4fe" strokeWidth="1" />

          <rect x="40" y="110" width="65" height="65" rx="3" fill="#fef08a" stroke="#fde047" strokeWidth="1" />
          <rect x="120" y="110" width="65" height="65" rx="3" fill="#bbf7d0" stroke="#86efac" strokeWidth="1" />
          <rect x="200" y="110" width="65" height="65" rx="3" fill="#fed7aa" stroke="#fdba74" strokeWidth="1" />
          <rect x="280" y="110" width="65" height="65" rx="3" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1" />
        </svg>
      );
    }

    // Default wireframe
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
          width: '1040px',
          maxWidth: '96vw',
          height: '690px',
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
        {/* Barra Lateral de Categorias (Permanente) */}
        <div
          style={{
            width: '230px',
            backgroundColor: '#171b23',
            borderRight: '1px solid #283040',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 12px',
            gap: '12px',
            flexShrink: 0
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
                    setSelectedPreviewTemplate(null);
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

        {/* =====================================================================
            CONTEÚDO PRINCIPAL: MODO DETALHE (FOTO 4) OU MODO GRADE
            ===================================================================== */}
        {selectedPreviewTemplate ? (
          /* MODO PREVIEW DETALHADO (IDÊNTICO À FOTO 4 DO WHIMSICAL) */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: '#13171f' }}>
            {/* Topo do Preview: Voltar e Fechar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: '1px solid #242c3d'
              }}
            >
              <button
                onClick={() => setSelectedPreviewTemplate(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '4px 6px',
                  borderRadius: '4px'
                }}
                title="Voltar para a lista de templates"
              >
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Canvas de Prévia Amplo e Interativo com Controles de Zoom */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `scale(${previewZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease'
                }}
              >
                {renderSvgPreview(selectedPreviewTemplate, true)}
              </div>

              {/* Botões Flutuantes de Zoom no Canto Inferior Direito do Canvas */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  backgroundColor: '#1e2430',
                  borderRadius: '6px',
                  padding: '2px 4px',
                  border: '1px solid #333f52',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <button
                  onClick={() => setPreviewZoom(prev => Math.max(prev - 0.15, 0.6))}
                  style={{ background: 'transparent', border: 'none', color: '#f1f5f9', cursor: 'pointer', padding: '4px' }}
                >
                  <Minus size={13} />
                </button>
                <button
                  onClick={() => setPreviewZoom(prev => Math.min(prev + 0.15, 1.6))}
                  style={{ background: 'transparent', border: 'none', color: '#f1f5f9', cursor: 'pointer', padding: '4px' }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Barra Escura de Detalhes no Rodapé (Exata da Foto 4 do Whimsical) */}
            <div
              style={{
                padding: '20px 24px',
                backgroundColor: '#12161f',
                borderTop: '1px solid #232b3a',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '24px'
              }}
            >
              {/* Informações à Esquerda */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedPreviewTemplate.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
                  <span>◆</span>
                  <span>{selectedPreviewTemplate.subtitle || 'Whimsical template'}</span>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, maxWidth: '600px' }}>
                  {selectedPreviewTemplate.description}
                </p>
              </div>

              {/* Ações e Tags à Direita */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => onSelectTemplate(selectedPreviewTemplate)}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 32px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    transition: 'background-color 0.15s, transform 0.1s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0369a1')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0284c7')}
                >
                  Use template
                </button>

                {/* Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                    TAGS
                  </span>
                  {selectedPreviewTemplate.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11.5px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#1e2634',
                        color: '#cbd5e1',
                        border: '1px solid #2d384b'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODO GRADE (Lista de Templates com Cards e Prévia) */
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
                    onClick={() => setSelectedPreviewTemplate(template)}
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
                      {renderSvgPreview(template)}

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
                              setSelectedPreviewTemplate(template);
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
        )}
      </div>
    </div>
  );
};
