import React from 'react';
import { 
  Network, 
  MousePointer, 
  Hand, 
  Square, 
  StickyNote as StickyIcon, 
  Layout, 
  Type, 
  Pencil, 
  Play
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddSticky: () => void;
  onAddShape: () => void;
  onAddText: () => void;
  onAddWireframe: () => void;
  onStartPresentation: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  onAddSticky,
  onAddShape,
  onAddText,
  onAddWireframe,
  onStartPresentation
}) => {
  return (
    <div className="floating-toolbar">
      {/* Mindmap Node Tool (Principal) */}
      <button
        className={`tool-button ${currentTool === 'mindmap' ? 'active' : ''}`}
        onClick={() => onSelectTool('mindmap')}
        title="Modo Mapa Mental (Tab: Nó Filho | Enter: Nó Irmão)"
      >
        <Network size={18} />
      </button>

      {/* Select Tool */}
      <button
        className={`tool-button ${currentTool === 'select' ? 'active' : ''}`}
        onClick={() => onSelectTool('select')}
        title="Ferramenta de Seleção (V)"
      >
        <MousePointer size={18} />
      </button>

      {/* Hand / Pan Tool */}
      <button
        className={`tool-button ${currentTool === 'hand' ? 'active' : ''}`}
        onClick={() => onSelectTool('hand')}
        title="Panorâmica / Mão (H ou segure Espaço)"
      >
        <Hand size={18} />
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

      {/* Sticky Note */}
      <button
        className={`tool-button ${currentTool === 'sticky' ? 'active' : ''}`}
        onClick={() => {
          onSelectTool('sticky');
          onAddSticky();
        }}
        title="Adicionar Nota Adesiva / Post-it (N)"
      >
        <StickyIcon size={18} />
      </button>

      {/* Flowchart Shapes */}
      <button
        className={`tool-button ${currentTool === 'flowchart' ? 'active' : ''}`}
        onClick={() => {
          onSelectTool('flowchart');
          onAddShape();
        }}
        title="Adicionar Forma de Fluxograma (F)"
      >
        <Square size={18} />
      </button>

      {/* Wireframe UI */}
      <button
        className={`tool-button ${currentTool === 'wireframe' ? 'active' : ''}`}
        onClick={() => {
          onSelectTool('wireframe');
          onAddWireframe();
        }}
        title="Adicionar Componente Wireframe / UI (W)"
      >
        <Layout size={18} />
      </button>

      {/* Text Block */}
      <button
        className={`tool-button ${currentTool === 'text' ? 'active' : ''}`}
        onClick={() => {
          onSelectTool('text');
          onAddText();
        }}
        title="Adicionar Bloco de Texto (T)"
      >
        <Type size={18} />
      </button>

      {/* Freehand Draw */}
      <button
        className={`tool-button ${currentTool === 'draw' ? 'active' : ''}`}
        onClick={() => onSelectTool(currentTool === 'draw' ? 'select' : 'draw')}
        title="Desenho Livre / Caneta (D)"
      >
        <Pencil size={18} />
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

      {/* Presenter Mode */}
      <button
        className="tool-button"
        onClick={onStartPresentation}
        title="Iniciar Apresentação Executiva"
      >
        <Play size={17} />
      </button>
    </div>
  );
};
