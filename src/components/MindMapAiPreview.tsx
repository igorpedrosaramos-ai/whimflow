import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Plus, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Brain, 
  ListTree, 
  Eye, 
  ArrowRight,
  Utensils,
  Building2,
  Workflow,
  Target,
  Lightbulb
} from 'lucide-react';
import { GeminiDiagramResult } from '../services/geminiService';
import { MindMapNode } from '../types';

interface MindMapAiPreviewProps {
  diagram: GeminiDiagramResult;
  isDark?: boolean;
  onInsertToCanvas?: (nodes: MindMapNode[], title: string) => void;
  onCreateNewBoard?: (title: string, nodes: MindMapNode[]) => void;
  onAskReflectionQuestion?: (question: string) => void;
}

export const MindMapAiPreview: React.FC<MindMapAiPreviewProps> = ({
  diagram,
  isDark = false,
  onInsertToCanvas,
  onCreateNewBoard,
  onAskReflectionQuestion
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'outline'>('visual');
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const [isInserted, setIsInserted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const nodes = diagram.nodes || [];
  const root = nodes.find(n => n.side === 'root' || !n.parentId) || nodes[0];

  // Helper de ícone baseado no tipo detectado
  const getDomainIcon = () => {
    switch (diagram.diagramType) {
      case 'menu':
        return <Utensils size={14} color="#ea580c" />;
      case 'orgchart':
        return <Building2 size={14} color="#0284c7" />;
      case 'process':
        return <Workflow size={14} color="#10b981" />;
      case 'strategic':
        return <Target size={14} color="#7c3aed" />;
      case 'brainstorm':
        return <Lightbulb size={14} color="#f59e0b" />;
      default:
        return <Brain size={14} color="#7c3aed" />;
    }
  };

  const getDomainLabel = () => {
    if (diagram.detectedDomain) return diagram.detectedDomain;
    switch (diagram.diagramType) {
      case 'menu': return 'Cardápio Comercial & Delivery';
      case 'orgchart': return 'Organograma Corporativo';
      case 'process': return 'Fluxo de Processos & Jornada';
      case 'strategic': return 'Planejamento Estratégico';
      case 'brainstorm': return 'Ideação & Brainstorming';
      default: return 'Mapa Mental Conceitual';
    }
  };

  // Coleta dimensões para a prévia visual SVG
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => {
    nodeMap.set(n.id, n);
    const x = n.x || 0;
    const y = n.y || 0;
    const w = n.width || 180;
    const h = n.height || 42;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  });

  const spanX = Math.max(200, maxX - minX);
  const spanY = Math.max(120, maxY - minY);
  const padX = Math.max(30, spanX * 0.1);
  const padY = Math.max(25, spanY * 0.12);
  const viewBox = `${minX - padX} ${minY - padY} ${spanX + 2 * padX} ${spanY + 2 * padY}`;

  const handleCopyStructure = () => {
    const lines: string[] = [`# ${diagram.title}\n`];
    if (diagram.explanation) lines.push(`> ${diagram.explanation}\n`);

    const childrenMap = new Map<string, MindMapNode[]>();
    nodes.forEach(n => {
      if (n.parentId) {
        const arr = childrenMap.get(n.parentId) || [];
        arr.push(n);
        childrenMap.set(n.parentId, arr);
      }
    });

    const printTree = (nodeId: string, depth = 0) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      const indent = '  '.repeat(depth);
      lines.push(`${indent}- ${node.text}`);
      const children = childrenMap.get(nodeId) || [];
      children.forEach(c => printTree(c.id, depth + 1));
    };

    if (root) printTree(root.id, 0);

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      style={{
        borderRadius: '10px',
        backgroundColor: isDark ? '#161e2b' : '#ffffff',
        border: isDark ? '1px solid #232d3f' : '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 6px 20px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px'
      }}
    >
      {/* 1. CABEÇALHO DO DIAGRAMA COM DOMÍNIO E METADADOS */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: isDark ? '1px solid #20293a' : '1px solid #f1f5f9',
          backgroundColor: isDark ? '#1a2332' : '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '5px',
                backgroundColor: isDark ? '#232d3f' : '#eef2ff',
                color: isDark ? '#c7d2fe' : '#4338ca',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {getDomainIcon()}
              <span>{getDomainLabel()}</span>
            </span>

            <span
              style={{
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: isDark ? '#222d3d' : '#f1f5f9',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              {nodes.length} nós estruturados
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleCopyStructure}
              title="Copiar estrutura em texto"
              style={{
                padding: '4px 7px',
                borderRadius: '5px',
                backgroundColor: 'transparent',
                border: isDark ? '1px solid #283548' : '1px solid #e2e8f0',
                color: isCopied ? '#10b981' : (isDark ? '#94a3b8' : '#64748b'),
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', lineHeight: '1.3' }}>
          ✦ {diagram.title}
        </div>

        {diagram.explanation && (
          <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.45' }}>
            {diagram.explanation}
          </div>
        )}
      </div>

      {/* 2. BLOCO DE RACIOCÍNIO ESTRATÉGICO DA IA ("PENSAMENTO EXECUTIVO") */}
      {diagram.thinking && (
        <div
          style={{
            borderBottom: isDark ? '1px solid #20293a' : '1px solid #f1f5f9',
            backgroundColor: isDark ? '#141c27' : '#fbfcfe'
          }}
        >
          <button
            onClick={() => setIsThinkingOpen(!isThinkingOpen)}
            style={{
              width: '100%',
              padding: '9px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#c7d2fe' : '#4f46e5',
              fontSize: '11.5px',
              fontWeight: 600
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Brain size={13} color="#6366f1" />
              <span>Raciocínio Estratégico da IA (Diagnóstico & Arquitetura)</span>
            </div>
            {isThinkingOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {isThinkingOpen && (
            <div
              style={{
                padding: '0 14px 12px 14px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: isDark ? '#cbd5e1' : '#334155',
                borderLeft: '3px solid #6366f1',
                marginLeft: '14px',
                marginBottom: '10px'
              }}
            >
              {diagram.thinking}
            </div>
          )}
        </div>
      )}

      {/* 3. SELETOR DE ABAS DA PRÉVIA: VISUAL VS LISTA HIERÁRQUICA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          backgroundColor: isDark ? '#18202d' : '#f8fafc',
          borderBottom: isDark ? '1px solid #232d3f' : '1px solid #e2e8f0'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
          Prévia do Mapa Mental:
        </span>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('visual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'visual' ? (isDark ? '#2e3b52' : '#ffffff') : 'transparent',
              color: activeTab === 'visual' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
              boxShadow: activeTab === 'visual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Eye size={12} />
            <span>Visual</span>
          </button>

          <button
            onClick={() => setActiveTab('outline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'outline' ? (isDark ? '#2e3b52' : '#ffffff') : 'transparent',
              color: activeTab === 'outline' ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
              boxShadow: activeTab === 'outline' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ListTree size={12} />
            <span>Estrutura</span>
          </button>
        </div>
      </div>

      {/* 4. CONTEÚDO DA PRÉVIA */}
      {activeTab === 'visual' ? (
        <div
          style={{
            height: '185px',
            backgroundColor: isDark ? '#0f141d' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <svg
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              <pattern id={`ai-grid-${diagram.title.replace(/\s+/g, '')}`} width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.1" fill={isDark ? '#263143' : '#e2e8f0'} />
              </pattern>
            </defs>
            <rect x={minX - padX} y={minY - padY} width={spanX + 2 * padX} height={spanY + 2 * padY} fill={`url(#ai-grid-${diagram.title.replace(/\s+/g, '')})`} />

            {/* Linhas de conexão */}
            {nodes.map(n => {
              if (!n.parentId) return null;
              const p = nodeMap.get(n.parentId);
              if (!p) return null;

              const isRight = (n.x || 0) >= (p.x || 0);
              const startX = isRight ? (p.x || 0) + (p.width || 180) : (p.x || 0);
              const startY = (p.y || 0) + (p.height || 42) / 2;
              const endX = isRight ? (n.x || 0) : (n.x || 0) + (n.width || 180);
              const endY = (n.y || 0) + (n.height || 42) / 2;
              const midX = (startX + endX) / 2;

              return (
                <path
                  key={`link-${n.id}`}
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke={n.color || '#818cf8'}
                  strokeWidth="2.2"
                  strokeOpacity={0.8}
                />
              );
            })}

            {/* Nós renderizados com texto e cor */}
            {nodes.map(n => {
              const isRoot = n.id === root?.id;
              const w = n.width || 180;
              const h = n.height || 42;
              const color = n.color || '#7c3aed';

              return (
                <g key={`preview-node-${n.id}`}>
                  {/* Sombra sutil */}
                  <rect
                    x={n.x + 2}
                    y={n.y + 2}
                    width={w}
                    height={h}
                    rx="6"
                    fill="rgba(0,0,0,0.08)"
                  />
                  {/* Caixa do Nó */}
                  <rect
                    x={n.x}
                    y={n.y}
                    width={w}
                    height={h}
                    rx="6"
                    fill={isRoot ? color : (isDark ? '#1a2332' : '#ffffff')}
                    stroke={color}
                    strokeWidth="1.8"
                  />
                  {/* Texto do Nó */}
                  <text
                    x={n.x + w / 2}
                    y={n.y + h / 2 + 4}
                    textAnchor="middle"
                    fill={isRoot ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a')}
                    fontSize="11.5"
                    fontWeight={isRoot ? 700 : 600}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {n.text.length > 28 ? `${n.text.slice(0, 26)}…` : n.text}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        /* ÁRVORE HIERÁRQUICA ESTRUTURADA EM TEXTO */
        <div
          style={{
            maxHeight: '190px',
            overflowY: 'auto',
            padding: '10px 14px',
            backgroundColor: isDark ? '#0f141d' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          {nodes.map(n => {
            const isRoot = n.id === root?.id;
            let depth = 0;
            let curr = n;
            while (curr && curr.parentId && nodeMap.has(curr.parentId)) {
              depth++;
              curr = nodeMap.get(curr.parentId)!;
            }

            return (
              <div
                key={`outline-${n.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  paddingLeft: `${depth * 18}px`,
                  fontSize: depth === 0 ? '12.5px' : '11.5px',
                  fontWeight: depth === 0 ? 700 : (depth === 1 ? 600 : 500),
                  color: isDark ? '#e2e8f0' : '#1e293b'
                }}
              >
                <span
                  style={{
                    width: depth === 0 ? '9px' : '7px',
                    height: depth === 0 ? '9px' : '7px',
                    borderRadius: '50%',
                    backgroundColor: n.color || '#7c3aed',
                    flexShrink: 0
                  }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.text}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. PERGUNTAS REFLEXIVAS PARA APROFUNDAMENTO */}
      {diagram.reflectionQuestions && diagram.reflectionQuestions.length > 0 && (
        <div
          style={{
            padding: '10px 14px',
            borderTop: isDark ? '1px solid #20293a' : '1px solid #f1f5f9',
            backgroundColor: isDark ? '#141c28' : '#f0fdfa',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={12} color="#0d9488" />
            <span>Perguntas para Aprofundar e Refinar:</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {diagram.reflectionQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onAskReflectionQuestion && onAskReflectionQuestion(q)}
                style={{
                  textAlign: 'left',
                  padding: '5px 8px',
                  borderRadius: '5px',
                  backgroundColor: isDark ? '#1a2535' : '#ffffff',
                  border: isDark ? '1px solid #233547' : '1px solid #ccfbf1',
                  color: isDark ? '#e2e8f0' : '#0f766e',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#223247' : '#e6fffa')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = isDark ? '#1a2535' : '#ffffff')}
              >
                <span>{q}</span>
                <ArrowRight size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. AÇÕES DIRETAS (INSERIR NO CANVAS / NOVO QUADRO) */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: isDark ? '1px solid #20293a' : '1px solid #e2e8f0',
          backgroundColor: isDark ? '#17202e' : '#f8fafc',
          display: 'flex',
          gap: '8px'
        }}
      >
        {onInsertToCanvas && (
          <button
            id="btn-insert-to-canvas"
            data-testid="btn-insert-to-canvas"
            onClick={() => {
              onInsertToCanvas(nodes, diagram.title);
              setIsInserted(true);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: isInserted ? '#10b981' : '#7c3aed',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s, transform 0.1s'
            }}
          >
            {isInserted ? <Check size={14} /> : <Layers size={14} />}
            <span>{isInserted ? 'Inserido no Canvas!' : 'Inserir no Canvas Atual'}</span>
          </button>
        )}

        {onCreateNewBoard && (
          <button
            id="btn-create-new-board-ai"
            data-testid="btn-create-new-board-ai"
            onClick={() => onCreateNewBoard(diagram.title, nodes)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: isDark ? '#253144' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Criar um novo quadro isolado com este mapa mental"
          >
            <Plus size={14} />
            <span>Novo Quadro</span>
          </button>
        )}
      </div>
    </div>
  );
};
