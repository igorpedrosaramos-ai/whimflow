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
  Play,
  GitBranch,
  Sparkles,
  ArrowUpRight,
  Smile,
  Link,
  Frame,
  Table,
  Plus
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
  onTogglePresentPanel?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  onAddConnectedNode,
  onAddSticky,
  onAddWireframe,
  onAddText,
  onStartPresentation,
  onOpenAI,
  onTogglePresentPanel
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        top: '70px',
        zIndex: 100,
        backgroundColor: '#1b212c',
        border: '1px solid #2c3647',
        borderRadius: '12px',
        padding: '6px 4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        userSelect: 'none'
      }}
    >
      {/* Grupo Superior de Modos de Diagrama */}
      <button
        onClick={onAddConnectedNode}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: '#7c3aed',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)'
        }}
        title="Criar Quadrado com Linha Conectada (Tab: Filho | Enter: Irmão)"
      >
        <Network size={16} />
      </button>

      <button
        onClick={() => onSelectTool('wireframe')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'wireframe' ? '#2e394d' : 'transparent',
          color: currentTool === 'wireframe' ? '#ffffff' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Modo Wireframe / Componentes"
      >
        <Layout size={16} />
      </button>

      {/* Divisor */}
      <div style={{ width: '22px', height: '1px', backgroundColor: '#2d3748', margin: '2px 0' }} />

      {/* Ferramenta de Seleção / Cursor */}
      <button
        onClick={() => onSelectTool('select')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'select' ? '#2e394d' : 'transparent',
          color: currentTool === 'select' ? '#ffffff' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Selecionar / Mover Nós (V)"
      >
        <MousePointer size={16} />
      </button>

      {/* Mão / Pan */}
      <button
        onClick={() => onSelectTool('hand')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'hand' ? '#2e394d' : 'transparent',
          color: currentTool === 'hand' ? '#ffffff' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Panorâmica / Mover Canvas (H ou segurar Espaço)"
      >
        <Hand size={16} />
      </button>

      {/* Formas Geométricas */}
      <button
        onClick={onAddConnectedNode}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Formas Geométricas"
      >
        <Square size={16} />
      </button>

      {/* Sticky Note */}
      <button
        onClick={() => {
          onSelectTool('sticky');
          onAddSticky();
        }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'sticky' ? '#2e394d' : 'transparent',
          color: currentTool === 'sticky' ? '#fde047' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Nota Adesiva / Post-it (S)"
      >
        <StickyIcon size={16} />
      </button>

      {/* Mind Map Mode */}
      <button
        onClick={() => onSelectTool('mindmap')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'mindmap' ? '#7c3aed' : 'transparent',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Mapa Mental (M)"
      >
        <GitBranch size={16} />
      </button>

      {/* Conector */}
      <button
        onClick={onAddConnectedNode}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Conector / Linha (C)"
      >
        <ArrowUpRight size={16} />
      </button>

      {/* Texto */}
      <button
        onClick={onAddText}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Texto Livre (T)"
      >
        <Type size={16} />
      </button>

      {/* Ícone / Emoji */}
      <button
        onClick={onAddConnectedNode}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Ícones e Emojis"
      >
        <Smile size={16} />
      </button>

      {/* Link */}
      <button
        onClick={onAddConnectedNode}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Link Externo (K)"
      >
        <Link size={16} />
      </button>

      {/* Desenho Livre / Caneta */}
      <button
        onClick={() => onSelectTool(currentTool === 'draw' ? 'mindmap' : 'draw')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'draw' ? '#2e394d' : 'transparent',
          color: currentTool === 'draw' ? '#ffffff' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Caneta / Desenho Livre (D)"
      >
        <Pencil size={16} />
      </button>

      {/* Moldura / Seção de Apresentação */}
      <button
        onClick={onTogglePresentPanel}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Seção / Painel de Apresentação (F)"
      >
        <Frame size={16} />
      </button>

      {/* Tabela */}
      <button
        onClick={onAddConnectedNode}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Tabela"
      >
        <Table size={16} />
      </button>

      {/* Divisor */}
      <div style={{ width: '22px', height: '1px', backgroundColor: '#2d3748', margin: '2px 0' }} />

      {/* Assistente IA */}
      <button
        onClick={onOpenAI}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#c084fc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Assistente IA (Gerar ramos e estruturas)"
      >
        <Sparkles size={16} />
      </button>
    </div>
  );
};
