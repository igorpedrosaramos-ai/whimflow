import React from 'react';
import { 
  Network, 
  MousePointer, 
  Hand, 
  PlusSquare, 
  StickyNote as StickyIcon, 
  Layout, 
  Type, 
  Pencil, 
  Play,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddConnectedNode: () => void;
  onAddSticky: () => void;
  onAddWireframe: () => void;
  onAddText: () => void;
  onStartPresentation: () => void;
  onOpenAI: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  onAddConnectedNode,
  onAddSticky,
  onAddWireframe,
  onAddText,
  onStartPresentation,
  onOpenAI
}) => {
  return (
    <div className="floating-toolbar">
      {/* Botão Principal: Criar Quadrado com Linha Embutida */}
      <button
        className="tool-button active"
        onClick={onAddConnectedNode}
        title="Criar Quadrado com Linha Embutida (Conectado ao nó selecionado ou à raiz) - Atalho: Tab ou Enter"
        style={{
          backgroundColor: 'var(--accent-purple)',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
        }}
      >
        <PlusSquare size={19} />
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

      {/* Modo Mapa Mental */}
      <button
        className={`tool-button ${currentTool === 'mindmap' ? 'active' : ''}`}
        onClick={() => onSelectTool('mindmap')}
        title="Modo Mapa Mental Inteligente (Tab: Filho | Enter: Irmão)"
      >
        <Network size={18} />
      </button>

      {/* Ferramenta de Seleção */}
      <button
        className={`tool-button ${currentTool === 'select' ? 'active' : ''}`}
        onClick={() => onSelectTool('select')}
        title="Selecionar / Mover (V)"
      >
        <MousePointer size={18} />
      </button>

      {/* Mão / Panorâmica */}
      <button
        className={`tool-button ${currentTool === 'hand' ? 'active' : ''}`}
        onClick={() => onSelectTool('hand')}
        title="Panorâmica / Mover Canvas (H ou segurar Espaço)"
      >
        <Hand size={18} />
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

      {/* Nota Adesiva (Post-it) */}
      <button
        className={`tool-button ${currentTool === 'sticky' ? 'active' : ''}`}
        onClick={() => {
          onSelectTool('sticky');
          onAddSticky();
        }}
        title="Adicionar Nota Adesiva (Post-it) para Anotações"
      >
        <StickyIcon size={18} />
      </button>

      {/* Wireframe UI */}
      <button
        className={`tool-button ${currentTool === 'wireframe' ? 'active' : ''}`}
        onClick={() => {
          onSelectTool('wireframe');
          onAddWireframe();
        }}
        title="Adicionar Componente Wireframe / Mockup de Interface"
      >
        <Layout size={18} />
      </button>

      {/* Caneta / Desenho Livre */}
      <button
        className={`tool-button ${currentTool === 'draw' ? 'active' : ''}`}
        onClick={() => onSelectTool(currentTool === 'draw' ? 'mindmap' : 'draw')}
        title="Desenho Livre / Caneta (D)"
      >
        <Pencil size={18} />
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

      {/* Assistente IA */}
      <button
        className="tool-button"
        onClick={onOpenAI}
        title="Assistente IA (Gerar ramos e ideias conectadas)"
        style={{ color: 'var(--accent-purple-light)' }}
      >
        <Sparkles size={17} />
      </button>

      {/* Apresentação */}
      <button
        className="tool-button"
        onClick={onStartPresentation}
        title="Apresentar Mapa em Tela Cheia (F5)"
      >
        <Play size={17} />
      </button>
    </div>
  );
};
