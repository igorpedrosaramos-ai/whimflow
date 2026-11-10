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
  GitBranch,
  Sparkles,
  Frame
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddConnectedNode: () => void;
  onAddShape: () => void;
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
  onAddShape,
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
        top: '20px',
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
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      {/* 1. Criar Nó Conectado */}
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
        title="Criar Nó Conectado (Tab: Filho | Enter: Irmão)"
      >
        <Network size={16} />
      </button>

      {/* 2. Modo Mapa Mental */}
      <button
        onClick={() => onSelectTool('mindmap')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'mindmap' ? '#2e394d' : 'transparent',
          color: currentTool === 'mindmap' ? '#a78bfa' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Modo Mapa Mental (M)"
      >
        <GitBranch size={16} />
      </button>

      {/* Divisor */}
      <div style={{ width: '22px', height: '1px', backgroundColor: '#2d3748', margin: '2px 0' }} />

      {/* 3. Ferramenta de Seleção / Cursor */}
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
        title="Selecionar e Mover (V)"
      >
        <MousePointer size={16} />
      </button>

      {/* 4. Mão / Panorâmica */}
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
        title="Panorâmica / Mover Tela (H ou segurar Espaço)"
      >
        <Hand size={16} />
      </button>

      {/* 5. Forma Geométrica */}
      <button
        onClick={onAddShape}
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
        title="Inserir Forma Geométrica / Card"
      >
        <Square size={16} />
      </button>

      {/* 6. Sticky Note */}
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
        title="Inserir Nota Adesiva / Post-it (S)"
      >
        <StickyIcon size={16} />
      </button>

      {/* 7. Wireframe */}
      <button
        onClick={() => {
          onSelectTool('wireframe');
          onAddWireframe();
        }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'wireframe' ? '#2e394d' : 'transparent',
          color: currentTool === 'wireframe' ? '#38bdf8' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Inserir Componente de Wireframe"
      >
        <Layout size={16} />
      </button>

      {/* 8. Texto Livre */}
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
        title="Inserir Caixa de Texto (T)"
      >
        <Type size={16} />
      </button>

      {/* 9. Caneta / Desenho Livre */}
      <button
        onClick={() => onSelectTool(currentTool === 'draw' ? 'mindmap' : 'draw')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'draw' ? '#2e394d' : 'transparent',
          color: currentTool === 'draw' ? '#f43f5e' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Caneta / Traço Livre (D)"
      >
        <Pencil size={16} />
      </button>

      {/* 10. Seção / Apresentação */}
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
        title="Painel de Seções e Apresentação (F)"
      >
        <Frame size={16} />
      </button>

      {/* Divisor */}
      <div style={{ width: '22px', height: '1px', backgroundColor: '#2d3748', margin: '2px 0' }} />

      {/* 11. Assistente IA Turbi */}
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
        title="Assistente IA (Gerar diagramas e ramificações)"
      >
        <Sparkles size={16} />
      </button>
    </div>
  );
};
