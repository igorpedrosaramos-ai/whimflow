import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  FileText, 
  Sparkles, 
  X, 
  ArrowRight, 
  Check, 
  Target, 
  Compass, 
  Layers, 
  TrendingUp, 
  HelpCircle,
  Clock,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { MindMapNode } from '../types';
import { generateWithGemini } from '../services/geminiService';

interface QuickSparkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoardWithNodes: (title: string, nodes: MindMapNode[]) => void;
  theme?: 'dark' | 'light';
  workspaceName?: string;
}

type TabType = 'text-to-map' | 'quick-idea' | 'frameworks';

export const QuickSparkModal: React.FC<QuickSparkModalProps> = ({
  isOpen,
  onClose,
  onCreateBoardWithNodes,
  theme = 'light',
  workspaceName = 'teste'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('text-to-map');
  const [rawText, setRawText] = useState('');
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  // -------------------------------------------------------------
  // 1. CONVERSÃO DE TEXTO/NOTAS EM MAPA MENTAL (Algoritmo Determinístico)
  // -------------------------------------------------------------
  const parseTextToMindMap = (text: string): { title: string; nodes: MindMapNode[] } => {
    const lines = text
      .split('\n')
      .map(line => line.replace(/\r$/, ''))
      .filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      throw new Error('Cole ou digite algum texto com tópicos para converter.');
    }

    // Identifica indentação e remove bullets
    interface RawItem {
      level: number;
      text: string;
    }

    const items: RawItem[] = lines.map(line => {
      const matchLeading = line.match(/^(\s*)/);
      const leadingSpaces = matchLeading ? matchLeading[1].length : 0;
      // Trata tabs como 2 espaços
      const tabCount = (line.match(/^\t+/) || [''])[0].length;
      const level = Math.floor((leadingSpaces + tabCount * 2) / 2);
      // Remove marcadores -, *, +, 1., •
      const clean = line.trim().replace(/^[-*+•]|\d+\.\s*/, '').trim();
      return { level, text: clean };
    });

    const rootItem = items[0];
    const boardTitle = rootItem.text || 'Mapa Mental Instantâneo';

    const colors = ['#7c3aed', '#0284c7', '#0d9488', '#f59e0b', '#ec4899', '#6366f1', '#10b981'];
    const nodes: MindMapNode[] = [];

    // Nó Raiz
    const rootId = 'root';
    nodes.push({
      id: rootId,
      text: boardTitle,
      x: 0,
      y: 0,
      width: Math.max(180, boardTitle.length * 9 + 40),
      height: 48,
      parentId: null,
      childrenIds: [],
      color: '#7c3aed',
      borderStyle: 'fill',
      lineStyle: 'bezier',
      side: 'root'
    });

    // Pilha de pais para mapear níveis
    const parentStack: Array<{ level: number; id: string }> = [{ level: rootItem.level, id: rootId }];
    let branchCounter = 0;

    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      if (!item.text) continue;

      // Encontra o pai imediato desempilhando níveis mais profundos
      while (parentStack.length > 1 && parentStack[parentStack.length - 1].level >= item.level) {
        parentStack.pop();
      }

      const parent = parentStack[parentStack.length - 1];
      const isLevelOne = parent.id === rootId;
      const nodeId = `node-${i}`;
      const side: 'left' | 'right' = branchCounter % 2 === 0 ? 'right' : 'left';
      if (isLevelOne) branchCounter++;

      const branchColor = colors[(branchCounter - 1 + colors.length) % colors.length];

      const newNode: MindMapNode = {
        id: nodeId,
        text: item.text,
        x: isLevelOne ? (side === 'right' ? 260 : -260) : 0,
        y: 0,
        width: Math.max(140, item.text.length * 8 + 32),
        height: 38,
        parentId: parent.id,
        childrenIds: [],
        color: branchColor,
        borderStyle: isLevelOne ? 'border' : 'accent',
        lineStyle: 'bezier',
        side: isLevelOne ? side : undefined
      };

      nodes.push(newNode);

      // Adiciona na lista de filhos do pai
      const pNode = nodes.find(n => n.id === parent.id);
      if (pNode) {
        pNode.childrenIds.push(nodeId);
      }

      parentStack.push({ level: item.level, id: nodeId });
    }

    return { title: boardTitle, nodes };
  };

  const handleConvertText = () => {
    setErrorMsg(null);
    try {
      const { title, nodes } = parseTextToMindMap(rawText);
      onCreateBoardWithNodes(title, nodes);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao converter texto.');
    }
  };

  // -------------------------------------------------------------
  // 2. CONVERSÃO INTELIGENTE COM IA GEMINI
  // -------------------------------------------------------------
  const handleAIStructure = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || quickPrompt || rawText;
    if (!finalPrompt.trim()) {
      setErrorMsg('Digite um tema ou cole notas para a IA estruturar.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await generateWithGemini(
        `Gere um mapa mental estruturado, rigoroso e fiel ao tema e domínio solicitado sobre o seguinte conteúdo:\n\n${finalPrompt}`
      );
      if (result.nodes && result.nodes.length > 0) {
        onCreateBoardWithNodes(result.title || finalPrompt.slice(0, 30), result.nodes);
        onClose();
      } else {
        throw new Error('Nenhum nó foi retornado pela IA.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar à API do Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. FRAMEWORKS EXECUTIVOS PRONTOS (1-Click Business Models)
  // -------------------------------------------------------------
  const applyFramework = (type: 'swot' | 'eisenhower' | '5whys' | 'aida' | 'okr' | 'golden-circle') => {
    let title = '';
    let nodes: MindMapNode[] = [];

    if (type === 'swot') {
      title = 'Matriz SWOT Estratégica';
      nodes = [
        { id: 'root', text: 'Matriz SWOT\nAnálise Estratégica 360°', x: 0, y: 0, width: 220, height: 48, parentId: null, childrenIds: ['swot-s', 'swot-w', 'swot-o', 'swot-t'], color: '#7c3aed', borderStyle: 'fill', side: 'root' },
        { id: 'swot-s', text: '💪 FORÇAS (Strengths)\nVantagens Competitivas', x: 260, y: -90, width: 210, height: 42, parentId: 'root', childrenIds: ['s-1', 's-2'], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 's-1', text: 'Tecnologia Proprietária & Patentes', x: 490, y: -110, width: 210, height: 36, parentId: 'swot-s', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 's-2', text: 'Equipe Sênior com Alta Retenção', x: 490, y: -70, width: 200, height: 36, parentId: 'swot-s', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 'swot-o', text: '🚀 OPORTUNIDADES (Opportunities)\nMercado & Tendências', x: 260, y: 60, width: 220, height: 42, parentId: 'root', childrenIds: ['o-1', 'o-2'], color: '#0284c7', borderStyle: 'border', side: 'right' },
        { id: 'o-1', text: 'Adoção Acelerada de IA Generativa', x: 500, y: 40, width: 210, height: 36, parentId: 'swot-o', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'o-2', text: 'Expansão para Mercados B2B Latam', x: 500, y: 80, width: 210, height: 36, parentId: 'swot-o', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'swot-w', text: '⚠️ FRAQUEZAS (Weaknesses)\nGargalos Internos', x: -260, y: -90, width: 210, height: 42, parentId: 'root', childrenIds: ['w-1', 'w-2'], color: '#f59e0b', borderStyle: 'border', side: 'left' },
        { id: 'w-1', text: 'Dependência de Poucos Clientes Enterprise', x: -490, y: -110, width: 230, height: 36, parentId: 'swot-w', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'left' },
        { id: 'w-2', text: 'Onboarding com Processo Manual', x: -490, y: -70, width: 210, height: 36, parentId: 'swot-w', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'left' },
        { id: 'swot-t', text: '🛡️ AMEAÇAS (Threats)\nRiscos Externos', x: -260, y: 60, width: 210, height: 42, parentId: 'root', childrenIds: ['t-1', 't-2'], color: '#ef4444', borderStyle: 'border', side: 'left' },
        { id: 't-1', text: 'Entrada de Concorrentes Globais Capitalizados', x: -510, y: 40, width: 240, height: 36, parentId: 'swot-t', childrenIds: [], color: '#ef4444', borderStyle: 'accent', side: 'left' },
        { id: 't-2', text: 'Alterações Regulatórias de Privacidade', x: -500, y: 80, width: 230, height: 36, parentId: 'swot-t', childrenIds: [], color: '#ef4444', borderStyle: 'accent', side: 'left' }
      ];
    } else if (type === 'eisenhower') {
      title = 'Matriz Eisenhower de Priorização';
      nodes = [
        { id: 'root', text: 'Matriz de Eisenhower\nGestão Estratégica de Tempo', x: 0, y: 0, width: 230, height: 48, parentId: null, childrenIds: ['q1', 'q2', 'q3', 'q4'], color: '#0d9488', borderStyle: 'fill', side: 'root' },
        { id: 'q1', text: '🔥 Q1: FAZER AGORA\nUrgente & Importante', x: 260, y: -80, width: 200, height: 42, parentId: 'root', childrenIds: ['q1-1', 'q1-2'], color: '#ef4444', borderStyle: 'border', side: 'right' },
        { id: 'q1-1', text: 'Correção de Falha de Segurança Crítica', x: 480, y: -100, width: 220, height: 36, parentId: 'q1', childrenIds: [], color: '#ef4444', borderStyle: 'accent', side: 'right' },
        { id: 'q1-2', text: 'Entrega de Proposta ao Cliente Chave', x: 480, y: -60, width: 220, height: 36, parentId: 'q1', childrenIds: [], color: '#ef4444', borderStyle: 'accent', side: 'right' },
        { id: 'q2', text: '🎯 Q2: AGENDAR & PLANEJAR\nNão Urgente & Importante', x: 260, y: 70, width: 210, height: 42, parentId: 'root', childrenIds: ['q2-1', 'q2-2'], color: '#0284c7', borderStyle: 'border', side: 'right' },
        { id: 'q2-1', text: 'Refatoração da Arquitetura Principal', x: 490, y: 50, width: 210, height: 36, parentId: 'q2', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'q2-2', text: 'Treinamento de Liderança da Equipe', x: 490, y: 90, width: 210, height: 36, parentId: 'q2', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'q3', text: '👥 Q3: DELEGAR\nUrgente & Não Importante', x: -260, y: -80, width: 200, height: 42, parentId: 'root', childrenIds: ['q3-1'], color: '#f59e0b', borderStyle: 'border', side: 'left' },
        { id: 'q3-1', text: 'Respostas a E-mails Operacionais Rotineiros', x: -490, y: -80, width: 230, height: 36, parentId: 'q3', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'left' },
        { id: 'q4', text: '🗑️ Q4: ELIMINAR\nNão Urgente & Não Importante', x: -260, y: 70, width: 220, height: 42, parentId: 'root', childrenIds: ['q4-1'], color: '#64748b', borderStyle: 'border', side: 'left' },
        { id: 'q4-1', text: 'Reuniões de Alinhamento sem Pauta Definida', x: -500, y: 70, width: 240, height: 36, parentId: 'q4', childrenIds: [], color: '#64748b', borderStyle: 'accent', side: 'left' }
      ];
    } else if (type === '5whys') {
      title = 'Análise dos 5 Porquês (Causa-Raiz)';
      nodes = [
        { id: 'root', text: '5 Porquês (Ishikawa)\nDescoberta de Causa-Raiz', x: 0, y: 0, width: 220, height: 48, parentId: null, childrenIds: ['w1'], color: '#ef4444', borderStyle: 'fill', side: 'root' },
        { id: 'w1', text: '1º Por quê? O sistema ficou indisponível', x: 260, y: 0, width: 230, height: 40, parentId: 'root', childrenIds: ['w2'], color: '#f59e0b', borderStyle: 'border', side: 'right' },
        { id: 'w2', text: '2º Por quê? O banco de dados atingiu 100% de CPU', x: 510, y: 0, width: 250, height: 40, parentId: 'w1', childrenIds: ['w3'], color: '#0284c7', borderStyle: 'border', side: 'right' },
        { id: 'w3', text: '3º Por quê? Uma query sem índice foi disparada em massa', x: 780, y: 0, width: 270, height: 40, parentId: 'w2', childrenIds: ['w4'], color: '#6366f1', borderStyle: 'border', side: 'right' },
        { id: 'w4', text: '4º Por quê? O deploy foi feito sem revisão do DBA', x: 1070, y: 0, width: 250, height: 40, parentId: 'w3', childrenIds: ['w5'], color: '#7c3aed', borderStyle: 'border', side: 'right' },
        { id: 'w5', text: '🎯 5º CAUSA-RAIZ: Falta de checklist obrigatório no CI/CD', x: 1340, y: 0, width: 290, height: 44, parentId: 'w4', childrenIds: [], color: '#10b981', borderStyle: 'fill', side: 'right' }
      ];
    } else if (type === 'okr') {
      title = 'Framework de OKRs Trimestrais';
      nodes = [
        { id: 'root', text: 'Planejamento de OKRs\nMeta Estratégica Trimestral', x: 0, y: 0, width: 220, height: 48, parentId: null, childrenIds: ['okr-1', 'okr-2'], color: '#7c3aed', borderStyle: 'fill', side: 'root' },
        { id: 'okr-1', text: '🎯 O1: Acelerar Crescimento B2B Sustentável', x: 270, y: -70, width: 240, height: 42, parentId: 'root', childrenIds: ['kr-1-1', 'kr-1-2'], color: '#0284c7', borderStyle: 'border', side: 'right' },
        { id: 'kr-1-1', text: 'KR 1: Atingir R$ 250k de MRR líquido', x: 530, y: -90, width: 210, height: 36, parentId: 'okr-1', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'kr-1-2', text: 'KR 2: Reduzir CAC de R$ 1.800 para R$ 1.200', x: 530, y: -50, width: 240, height: 36, parentId: 'okr-1', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'okr-2', text: '⭐ O2: Excelência de Produto & NPS Elevado', x: 270, y: 70, width: 240, height: 42, parentId: 'root', childrenIds: ['kr-2-1', 'kr-2-2'], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'kr-2-1', text: 'KR 1: Subir NPS de 54 para 72+', x: 530, y: 50, width: 200, height: 36, parentId: 'okr-2', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 'kr-2-2', text: 'KR 2: Reduzir tempo de carregamento para < 800ms', x: 530, y: 90, width: 260, height: 36, parentId: 'okr-2', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' }
      ];
    } else if (type === 'aida') {
      title = 'Funil de Conversão AIDA';
      nodes = [
        { id: 'root', text: 'Funil de Vendas AIDA\nJornada Completa do Cliente', x: 0, y: 0, width: 220, height: 48, parentId: null, childrenIds: ['aida-a', 'aida-i', 'aida-d', 'aida-ac'], color: '#ec4899', borderStyle: 'fill', side: 'root' },
        { id: 'aida-a', text: '👀 1. ATENÇÃO\nAnúncios, SEO e Redes Sociais', x: 270, y: -100, width: 220, height: 40, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border', side: 'right' },
        { id: 'aida-i', text: '💡 2. INTERESSE\nLanding Page, Demonstração e Cases', x: 270, y: -30, width: 240, height: 40, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'right' },
        { id: 'aida-d', text: '🔥 3. DESEJO\nDepoimentos, ROI e Comparativo', x: 270, y: 40, width: 230, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'right' },
        { id: 'aida-ac', text: '🚀 4. AÇÃO\nCheckout Rápido, Garantia e Suporte', x: 270, y: 110, width: 240, height: 40, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' }
      ];
    } else if (type === 'golden-circle') {
      title = 'Golden Circle (Simon Sinek)';
      nodes = [
        { id: 'root', text: 'The Golden Circle\nPropósito e Diferenciação', x: 0, y: 0, width: 210, height: 48, parentId: null, childrenIds: ['gc-why', 'gc-how', 'gc-what'], color: '#f59e0b', borderStyle: 'fill', side: 'root' },
        { id: 'gc-why', text: '❤️ WHY (Por Quê?)\nNosso Propósito & Crença Central', x: 260, y: -70, width: 220, height: 40, parentId: 'root', childrenIds: [], color: '#ef4444', borderStyle: 'border', side: 'right' },
        { id: 'gc-how', text: '⚙️ HOW (Como?)\nNossos Processos e Valores Únicos', x: 260, y: 0, width: 230, height: 40, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' },
        { id: 'gc-what', text: '📦 WHAT (O Quê?)\nNossos Produtos e Serviços Tangíveis', x: 260, y: 70, width: 240, height: 40, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' }
      ];
    }

    onCreateBoardWithNodes(title, nodes);
    onClose();
  };

  const sampleExampleText = `Lançamento de Produto 2026
- Estratégia de Marketing
  - Campanhas de Tráfego Pago
  - Email Marketing e Nutrição
  - Parcerias com Especialistas
- Time de Vendas
  - Treinamento da Equipe Comercial
  - Demonstração Interativa do Sistema
- Produto e Engenharia
  - Testes de Carga e Escalabilidade
  - Documentação da API
- Atendimento e Suporte
  - Central de Ajuda com Vídeos
  - SLA de Resposta em até 15 Minutos`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
        onClick={e => e.stopPropagation()}
        style={{
          width: '740px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundColor: isDark ? '#141a24' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderRadius: '10px',
          border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabeçalho Executivo */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark ? '#18202d' : '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Whimflow Spark: Central de Criação Relâmpago
              </h2>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Transforme ideias, anotações de reunião ou frameworks em mapas mentais instantâneos
              </span>
            </div>
          </div>

          <button
            id="btn-close-spark"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
            title="Fechar (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Abas Executivas */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 22px',
            borderBottom: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#10141d' : '#f1f5f9'
          }}
        >
          <button
            onClick={() => setActiveTab('text-to-map')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'text-to-map' ? (isDark ? '#232b38' : '#ffffff') : 'transparent',
              color: activeTab === 'text-to-map' ? (isDark ? '#f8fafc' : '#0f172a') : '#94a3b8',
              boxShadow: activeTab === 'text-to-map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={15} color="#0284c7" />
            <span>Colar Texto / Notas → Mapa Mental</span>
          </button>

          <button
            onClick={() => setActiveTab('frameworks')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'frameworks' ? (isDark ? '#232b38' : '#ffffff') : 'transparent',
              color: activeTab === 'frameworks' ? (isDark ? '#f8fafc' : '#0f172a') : '#94a3b8',
              boxShadow: activeTab === 'frameworks' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={15} color="#7c3aed" />
            <span>Frameworks Estratégicos</span>
          </button>

          <button
            onClick={() => setActiveTab('quick-idea')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'quick-idea' ? (isDark ? '#232b38' : '#ffffff') : 'transparent',
              color: activeTab === 'quick-idea' ? (isDark ? '#f8fafc' : '#0f172a') : '#94a3b8',
              boxShadow: activeTab === 'quick-idea' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={15} color="#0d9488" />
            <span>Ideia Rápida com IA</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div style={{ padding: '22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#f87171',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ABA 1: TEXTO / NOTAS PARA MAPA MENTAL */}
          {activeTab === 'text-to-map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Cole tópicos com hífens (-), recuos, listas numeradas ou anotações de reunião:
                </span>
                <button
                  onClick={() => setRawText(sampleExampleText)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Carregar Exemplo
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={`Título Principal do Projeto\n- Tópico 1\n  - Subtópico A\n  - Subtópico B\n- Tópico 2\n  - Subtópico C`}
                rows={9}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#0f141d' : '#f8fafc',
                  border: isDark ? '1px solid #283344' : '1px solid #cbd5e1',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  onClick={() => handleAIStructure()}
                  disabled={isLoading || !rawText.trim()}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                    backgroundColor: 'transparent',
                    color: isDark ? '#f8fafc' : '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isLoading || !rawText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isLoading || !rawText.trim() ? 0.5 : 1
                  }}
                >
                  <Sparkles size={14} color="#0d9488" />
                  <span>Estruturar com IA (Gemini)</span>
                </button>

                <button
                  id="btn-spark-convert-text"
                  onClick={handleConvertText}
                  disabled={!rawText.trim()}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: !rawText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: !rawText.trim() ? 0.5 : 1,
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Zap size={14} />
                  <span>Criar Mapa Mental Instantâneo</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: FRAMEWORKS ESTRATÉGICOS PRONTOS */}
          {activeTab === 'frameworks' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {/* 1. SWOT */}
              <div
                onClick={() => applyFramework('swot')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#7c3aed')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? '#283344' : '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={16} color="#7c3aed" />
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Matriz SWOT</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>1 Clique</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                  Forças, Oportunidades, Fraquezas e Ameaças para diagnóstico e planejamento de negócios.
                </p>
              </div>

              {/* 2. Eisenhower */}
              <div
                onClick={() => applyFramework('eisenhower')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d9488')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? '#283344' : '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={16} color="#0d9488" />
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Matriz Eisenhower</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>Produtividade</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                  Urgente vs Importante (Fazer agora, Agendar, Delegar e Eliminar).
                </p>
              </div>

              {/* 3. 5 Porquês */}
              <div
                onClick={() => applyFramework('5whys')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? '#283344' : '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} color="#ef4444" />
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>5 Porquês (Causa-Raiz)</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Resolução</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                  Método Toyota para encontrar a raiz real de um problema operacional ou técnico.
                </p>
              </div>

              {/* 4. OKRs */}
              <div
                onClick={() => applyFramework('okr')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0284c7')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? '#283344' : '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={16} color="#0284c7" />
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>OKRs Trimestrais</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>Metas</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                  Objetivos qualitativos com Resultados-Chave mensuráveis para alinhar times.
                </p>
              </div>

              {/* 5. AIDA */}
              <div
                onClick={() => applyFramework('aida')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#ec4899')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? '#283344' : '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} color="#ec4899" />
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Funil AIDA</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#ec4899', fontWeight: 600 }}>Vendas</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                  Jornada de conversão: Atenção, Interesse, Desejo e Ação para campanhas de vendas.
                </p>
              </div>

              {/* 6. Golden Circle */}
              <div
                onClick={() => applyFramework('golden-circle')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#f59e0b')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? '#283344' : '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} color="#f59e0b" />
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Golden Circle</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Branding</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                  O método Simon Sinek: Por Quê (Why), Como (How) e O Quê (What).
                </p>
              </div>
            </div>
          )}

          {/* ABA 3: IDEIA RÁPIDA COM IA */}
          {activeTab === 'quick-idea' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Digite um objetivo de projeto, plano de negócio ou tema que você deseja desdobrar:
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={quickPrompt}
                  onChange={e => setQuickPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAIStructure();
                  }}
                  placeholder="Ex: Plano de Expansão B2B com Canais de Distribuição e SEO"
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    borderRadius: '6px',
                    backgroundColor: isDark ? '#0f141d' : '#f8fafc',
                    border: isDark ? '1px solid #283344' : '1px solid #cbd5e1',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />

                <button
                  onClick={() => handleAIStructure()}
                  disabled={isLoading || !quickPrompt.trim()}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: isLoading || !quickPrompt.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isLoading || !quickPrompt.trim() ? 0.5 : 1,
                    boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
                  }}
                >
                  <Sparkles size={15} />
                  <span>{isLoading ? 'Gerando...' : 'Gerar'}</span>
                </button>
              </div>

              {/* Sugestões Rápidas */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', width: '100%', fontWeight: 600 }}>
                  Sugestões Prontas para Testar:
                </span>
                {[
                  'Arquitetura de Microsserviços e Event-Driven',
                  'Estratégia de Marketing 360° para SaaS B2B',
                  'Onboarding Completo de Novos Funcionários',
                  'Jornada de Sucesso do Cliente (Customer Journey)'
                ].map(sug => (
                  <button
                    key={sug}
                    onClick={() => {
                      setQuickPrompt(sug);
                      handleAIStructure(sug);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      backgroundColor: isDark ? '#1a2230' : '#f8fafc',
                      color: isDark ? '#cbd5e1' : '#475569',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#0d9488';
                      e.currentTarget.style.color = '#0d9488';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                      e.currentTarget.style.color = isDark ? '#cbd5e1' : '#475569';
                    }}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Informativo */}
        <div
          style={{
            padding: '12px 22px',
            borderTop: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
            backgroundColor: isDark ? '#10141d' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#94a3b8'
          }}
        >
          <span>Pressione <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>ESC</strong> para fechar</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600 }}>
            <Zap size={13} />
            Whimflow Spark Pro
          </span>
        </div>
      </div>
    </div>
  );
};
