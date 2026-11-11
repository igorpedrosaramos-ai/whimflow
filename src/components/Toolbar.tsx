import React from 'react';
import { 
  Network, 
  MousePointer, 
  Hand, 
  PlusCircle, 
  StickyNote as StickyIcon, 
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
  onAddFloatingTopic: () => void;
  onAddSticky: () => void;
  onAddText: () => void;
  onStartPresentation: () => void;
  onOpenAI: () => void;
  onTogglePresentPanel?: () => void;
  // Compatibilidade legada opcional
  onAddShape?: () => void;
  onAddWireframe?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  onAddConnectedNode,
  onAddFloatingTopic,
  onAddSticky,
  onAddText,
  onOpenAI,
  onTogglePresentPanel
}) => {
  return (
    <div
      className="canvas-vertical-toolbar"
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
      {/* 1. Criar Nó Conectado (Filho ou Irmão) */}
      <button
        id="btn-toolbar-add-node"
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
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
          transition: 'transform 0.1s, background-color 0.15s'
        }}
        title="Adicionar Subtópico Conectado (Atalho: Tab no nó selecionado)"
      >
        <Network size={16} />
      </button>

      {/* 2. Conexão Transversal entre Ramos (Cross-Link) */}
      <button
        id="btn-toolbar-connect"
        onClick={() => onSelectTool(currentTool === 'connect' ? 'select' : 'connect')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'connect' ? '#3b82f6' : 'transparent',
          color: currentTool === 'connect' ? '#ffffff' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Conectar 2 Tópicos (Cross-Link: clique na origem e no destino)"
      >
        <GitBranch size={16} />
      </button>

      {/* Divisor */}
      <div style={{ width: '22px', height: '1px', backgroundColor: '#2d3748', margin: '2px 0' }} />

      {/* 3. Ferramenta de Seleção / Mover */}
      <button
        id="btn-toolbar-select"
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
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Selecionar e Mover Nós (V)"
      >
        <MousePointer size={16} />
      </button>

      {/* 4. Mão / Panorâmica */}
      <button
        id="btn-toolbar-hand"
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
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Panorâmica / Mover Tela (H ou segurar Espaço)"
      >
        <Hand size={16} />
      </button>

      {/* 5. Novo Tópico Independente (Substitui o antigo 'Novo Bloco' desconectado) */}
      <button
        id="btn-toolbar-floating-topic"
        onClick={onAddFloatingTopic}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#a78bfa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Novo Tópico Independente no Canvas (Ideia Raiz com ramos próprios)"
      >
        <PlusCircle size={16} />
      </button>

      {/* 6. Nota Adesiva (Post-it) */}
      <button
        id="btn-toolbar-sticky"
        onClick={() => {
          onSelectTool(currentTool === 'sticky' ? 'select' : 'sticky');
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
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Inserir Nota Adesiva / Post-it de Apoio (S)"
      >
        <StickyIcon size={16} />
      </button>

      {/* 7. Caixa de Texto Livre */}
      <button
        id="btn-toolbar-text"
        onClick={() => {
          onSelectTool(currentTool === 'text' ? 'select' : 'text');
          onAddText();
        }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: currentTool === 'text' ? '#2e394d' : 'transparent',
          color: currentTool === 'text' ? '#38bdf8' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Inserir Caixa de Texto / Anotação (T)"
      >
        <Type size={16} />
      </button>

      {/* 8. Caneta / Desenho Livre */}
      <button
        id="btn-toolbar-draw"
        onClick={() => onSelectTool(currentTool === 'draw' ? 'select' : 'draw')}
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
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Caneta / Marcador Livre (D)"
      >
        <Pencil size={16} />
      </button>

      {/* 9. Seção / Slide de Apresentação */}
      <button
        id="btn-toolbar-present-panel"
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
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Painel de Seções e Apresentação (F)"
      >
        <Frame size={16} />
      </button>

      {/* Divisor */}
      <div style={{ width: '22px', height: '1px', backgroundColor: '#2d3748', margin: '2px 0' }} />

      {/* 10. Assistente IA Turbi */}
      <button
        id="btn-toolbar-ai"
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
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title="Assistente IA (Gerar ramos, sugerir perguntas e ideias)"
      >
        <Sparkles size={16} />
      </button>
    </div>
  );
};
