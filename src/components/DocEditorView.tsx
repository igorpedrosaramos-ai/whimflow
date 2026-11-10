import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Star, 
  MessageSquare, 
  Zap, 
  Send, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  Table, 
  Minus, 
  Download, 
  Bold, 
  Italic,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layout,
  CornerDownRight,
  Users
} from 'lucide-react';
import { Board, MindMapNode, DocDiscussion } from '../types';
import { generateWithGemini } from '../services/geminiService';

interface DocEditorViewProps {
  board: Board;
  onUpdateTitle: (title: string) => void;
  onUpdateDocContent?: (content: string) => void;
  onUpdateDiscussions?: (discussions: DocDiscussion[]) => void;
  onToggleFavorite?: () => void;
  onConvertToMindMap?: (title: string, nodes: MindMapNode[]) => void;
  onNavigateToDashboard: () => void;
  onOpenTemplates?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  theme?: 'dark' | 'light';
  workspaceName?: string;
}

export const DocEditorView: React.FC<DocEditorViewProps> = ({
  board,
  onUpdateTitle,
  onUpdateDocContent,
  onUpdateDiscussions,
  onToggleFavorite,
  onConvertToMindMap,
  onNavigateToDashboard,
  onOpenTemplates,
  onShowToast,
  theme = 'light',
  workspaceName = 'teste'
}) => {
  const [title, setTitle] = useState(board.title === 'Novo Projeto' || !board.title ? 'untitled' : board.title);
  const [docContent, setDocContent] = useState(() => {
    if (typeof board.docContent === 'string' && board.docContent.trim()) {
      return board.docContent;
    }
    // Inicializa com tópicos do quadro se houver
    if (board.mindMapNodes && board.mindMapNodes.length > 1) {
      const root = board.mindMapNodes.find(n => n.side === 'root') || board.mindMapNodes[0];
      const branches = board.mindMapNodes.filter(n => n.parentId === root.id);
      return branches.map(b => `## ${b.text}\n\n- Descrição e pontos de ação para ${b.text}\n- [ ] Tarefa inicial\n`).join('\n');
    }
    return '';
  });

  const [discussions, setDiscussions] = useState<DocDiscussion[]>(() => board.discussions || []);
  const [discussionText, setDiscussionText] = useState('');
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [isStarred, setIsStarred] = useState(Boolean(board.isStarred));

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  // Sincroniza se o quadro ativo mudar
  useEffect(() => {
    if (typeof board.docContent === 'string') {
      setDocContent(board.docContent);
    }
    setTitle(board.title === 'Novo Projeto' || !board.title ? 'untitled' : board.title);
    setDiscussions(board.discussions || []);
    setIsStarred(Boolean(board.isStarred));
  }, [board.id]);

  // Métricas do Documento
  const words = docContent.trim() ? docContent.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 180));

  // Inserção de blocos ricos
  const insertBlock = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = docContent.substring(start, end);
    const replacement = `${prefix}${selected || 'Texto do bloco'}${suffix}`;

    const newContent = docContent.substring(0, start) + replacement + docContent.substring(end);
    setDocContent(newContent);
    onUpdateDocContent?.(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 14));
    }, 20);
  };

  const handleExportMarkdown = () => {
    const fullDoc = `# ${title}\n\n${docContent}`;
    const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_documento.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onShowToast?.('Documento Markdown exportado com sucesso.', 'success');
  };

  // -------------------------------------------------------------
  // SISTEMA DE DISCUSSÕES ("Start a discussion...")
  // -------------------------------------------------------------
  const handleAddDiscussion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = discussionText.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    const newDisc: DocDiscussion = {
      id: `disc-${Date.now()}`,
      author: 'Igor',
      text,
      createdAt: `${dateStr} às ${timeStr}`,
      resolved: false
    };

    const updated = [newDisc, ...discussions];
    setDiscussions(updated);
    onUpdateDiscussions?.(updated);
    setDiscussionText('');
    setIsDiscussionOpen(true);
    onShowToast?.('Comentário adicionado à discussão.', 'info');
  };

  const handleToggleResolveDiscussion = (id: string) => {
    const updated = discussions.map(d => d.id === id ? { ...d, resolved: !d.resolved } : d);
    setDiscussions(updated);
    onUpdateDiscussions?.(updated);
  };

  const handleDeleteDiscussion = (id: string) => {
    const updated = discussions.filter(d => d.id !== id);
    setDiscussions(updated);
    onUpdateDiscussions?.(updated);
  };

  const handleAiReviewDocument = async () => {
    if (!docContent.trim()) {
      onShowToast?.('Escreva algum conteúdo no documento antes de solicitar a revisão.', 'error');
      return;
    }

    setIsAiReviewing(true);
    try {
      const prompt = `Você é um consultor sênior de produto e estratégia. Analise criticamente o seguinte documento intitulado "${title}":\n\n${docContent}\n\nForneça exatamente 3 pontos de atenção executivos, 2 riscos potenciais e 1 pergunta crítica que o documento ainda não respondeu. Seja direto e conciso.`;
      const result = await generateWithGemini(prompt);
      
      const newDisc: DocDiscussion = {
        id: `ai-review-${Date.now()}`,
        author: '✨ Gemini Reviewer (IA)',
        text: result.explanation || 'Revisão executiva concluída: certifique-se de validar os prazos das entregas e as métricas de sucesso.',
        createdAt: 'Agora mesmo',
        resolved: false
      };

      const updated = [newDisc, ...discussions];
      setDiscussions(updated);
      onUpdateDiscussions?.(updated);
      setIsDiscussionOpen(true);
      onShowToast?.('Análise crítica da IA gerada com sucesso!', 'success');
    } catch (err: any) {
      onShowToast?.('Erro ao solicitar revisão da IA.', 'error');
    } finally {
      setIsAiReviewing(false);
    }
  };

  // -------------------------------------------------------------
  // TEMPLATES EXECUTIVOS DE DOCUMENTOS
  // -------------------------------------------------------------
  const loadDocTemplate = (type: 'prd' | 'meeting' | 'briefing' | 'adr') => {
    setIsTemplateMenuOpen(false);
    let templateTitle = '';
    let templateText = '';

    if (type === 'prd') {
      templateTitle = 'PRD: Especificação de Produto';
      templateText = `## 1. Visão Geral & Problema
Descreva o problema real do usuário e a oportunidade de negócio que esta funcionalidade resolve.
- **Público-Alvo:** Usuários corporativos e líderes de equipe
- **Objetivo Principal:** Reduzir o tempo de tomada de decisão em 40%

## 2. Requisitos Funcionais
- [ ] Autenticação rápida e integração com Single Sign-On
- [ ] Exportação executiva em PDF e Markdown sem marcas d'água
- [ ] Painel colaborativo de discussões em tempo real

## 3. Critérios de Sucesso (Métricas)
| Métrica | Meta Atual | Meta Desejada |
| --- | --- | --- |
| Taxa de Adoção Semanal | 25% | 65% |
| Tempo Médio de Criação | 18 min | < 5 min |

## 4. Fora de Escopo (Non-Goals)
> 💡 **Nota:** Recursos de videoconferência interna não fazem parte desta versão.`;
    } else if (type === 'meeting') {
      templateTitle = 'Ata Executiva de Reunião';
      templateText = `## 1. Dados da Reunião
- **Data e Horário:** ${new Date().toLocaleDateString('pt-BR')}
- **Participantes:** Equipe de Engenharia, Design e Produto
- **Pauta:** Planejamento de Lançamento e Alinhamento de Riscos

## 2. Decisões Tomadas
1. O deploy para produção será realizado após os testes de carga.
2. A documentação técnica será unificada com os diagramas visuais.
3. As discussões de revisão serão resolvidas diretamente no documento.

## 3. Plano de Ação & Prazos
- [ ] Finalizar refatoração da API (/api/generate-diagram) — Responsável: Engenharia (Sexta-feira)
- [ ] Validar fluxo de navegação do usuário — Responsável: Design (Quarta-feira)
- [ ] Comunicar clientes beta sobre a atualização — Responsável: Produto (Segunda-feira)`;
    } else if (type === 'briefing') {
      templateTitle = 'Briefing de Projeto Estratégico';
      templateText = `## 1. Contexto do Projeto
Resumo executivo do projeto, justificativa de investimento e impacto esperado para os clientes da empresa.

## 2. Escopo do Projeto
- **O que será entregue:**
  - Sistema de conversão instantânea de notas para mapa mental
  - Modelos estratégicos pré-formatados (SWOT, OKRs, Eisenhower)
- **O que não será entregue:**
  - Integrações com ferramentas legadas descontinuadas

## 3. Cronograma e Marcos (Milestones)
- **Fase 1 (Semana 1):** Validação técnica e arquitetura de dados
- **Fase 2 (Semana 2):** Interface executiva e testes E2E
- **Fase 3 (Semana 3):** Homologação e publicação em produção`;
    } else if (type === 'adr') {
      templateTitle = 'ADR: Decisão de Arquitetura Técnica';
      templateText = `## 1. Status
**Aprovado** — Data: ${new Date().toLocaleDateString('pt-BR')}

## 2. Contexto
Precisamos unificar o acesso aos modais globais e otimizar a renderização do editor de documentos e canvas.

## 3. Decisão
Adotaremos renderização condicional dentro do container raiz comum, centralizando o estado de navegação e garantindo que todos os modais respondam consistentemente à tecla ESC.

## 4. Consequências
- **Positivas:** Zero duplicação de modais, performance superior e navegação sem transições bruscas.
- **Negativas:** Requer sincronização rigorosa de propriedades entre os componentes de visão.`;
    }

    setTitle(templateTitle);
    onUpdateTitle(templateTitle);
    setDocContent(templateText);
    onUpdateDocContent?.(templateText);
    onShowToast?.(`Template "${templateTitle}" aplicado com sucesso.`, 'success');
  };

  // -------------------------------------------------------------
  // CONVERSÃO DESTE DOCUMENTO EM MAPA MENTAL
  // -------------------------------------------------------------
  const handleConvertDocToMindMap = () => {
    if (!docContent.trim()) {
      onShowToast?.('Adicione conteúdo ao documento para gerar o mapa mental.', 'error');
      return;
    }

    const lines = docContent.split('\n').filter(l => l.trim().length > 0);
    const rootTitle = title || 'Documento Executivo';
    const nodes: MindMapNode[] = [];
    const colors = ['#0284c7', '#7c3aed', '#0d9488', '#f59e0b', '#ec4899', '#10b981'];

    // Raiz
    nodes.push({
      id: 'root',
      text: rootTitle,
      x: 0,
      y: 0,
      width: Math.max(180, rootTitle.length * 9 + 40),
      height: 48,
      parentId: null,
      childrenIds: [],
      color: '#0284c7',
      borderStyle: 'fill',
      lineStyle: 'bezier',
      side: 'root'
    });

    let currentSectionId: string | null = null;
    let sectionCount = 0;

    lines.forEach((line, idx) => {
      const clean = line.trim();
      if (clean.startsWith('# ') || clean.startsWith('## ') || clean.startsWith('### ')) {
        const secText = clean.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');
        currentSectionId = `sec-${idx}`;
        sectionCount++;
        const side: 'left' | 'right' = sectionCount % 2 === 0 ? 'left' : 'right';
        const color = colors[(sectionCount - 1) % colors.length];

        nodes.push({
          id: currentSectionId,
          text: secText,
          x: side === 'right' ? 270 : -270,
          y: 0,
          width: Math.max(160, secText.length * 8 + 32),
          height: 40,
          parentId: 'root',
          childrenIds: [],
          color,
          borderStyle: 'border',
          side
        });

        nodes[0].childrenIds.push(currentSectionId);
      } else if (clean.startsWith('- ') || clean.startsWith('* ') || clean.startsWith('- [ ]') || clean.startsWith('- [x]')) {
        const itemText = clean.replace(/^[-*]\s*(\[[ x]\]\s*)?/, '');
        const parentId = currentSectionId || 'root';
        const pNode = nodes.find(n => n.id === parentId);
        const childId = `item-${idx}`;

        nodes.push({
          id: childId,
          text: itemText,
          x: 0,
          y: 0,
          width: Math.max(140, itemText.length * 8 + 28),
          height: 36,
          parentId,
          childrenIds: [],
          color: pNode ? pNode.color : '#0284c7',
          borderStyle: 'accent'
        });

        if (pNode) {
          pNode.childrenIds.push(childId);
        }
      }
    });

    if (onConvertToMindMap) {
      onConvertToMindMap(rootTitle, nodes);
      onShowToast?.('Documento convertido em mapa mental visual!', 'success');
    }
  };

  const activeDiscussionCount = discussions.filter(d => !d.resolved).length;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#12161f' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
        fontFamily: 'Dinsical, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Barra Superior Autêntica Whimsical Doc */}
      <header
        style={{
          height: '48px',
          borderBottom: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          userSelect: 'none',
          backgroundColor: isDark ? '#141922' : '#ffffff',
          flexShrink: 0
        }}
      >
        {/* Breadcrumb: Everyone at teste / [Doc Icon] untitled ⭐ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <button
            id="btn-doc-nav-dashboard"
            data-nav="dashboard"
            onClick={onNavigateToDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: isDark ? '#94a3b8' : '#64748b',
              cursor: 'pointer',
              fontWeight: 500,
              padding: '4px 6px',
              borderRadius: '4px',
              transition: 'color 0.15s, background 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#0284c7';
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Voltar ao Dashboard de Projetos"
          >
            <Users size={14} color="#0284c7" />
            <span>Everyone at {workspaceName}</span>
          </button>

          <span style={{ color: '#94a3b8' }}>/</span>
          
          <div
            onClick={() => titleInputRef.current?.focus()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'text' }}
            title="Clique para editar o título do documento"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
            </svg>

            <span>{title || 'untitled'}</span>
          </div>

          <button
            id="btn-doc-toggle-favorite"
            type="button"
            onClick={() => {
              const nextVal = !isStarred;
              setIsStarred(nextVal);
              onToggleFavorite?.();
              onShowToast?.(nextVal ? 'Documento favoritado!' : 'Documento removido dos favoritos.', 'info');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
            title={isStarred ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
          >
            <Star
              size={15}
              color={isStarred ? '#f59e0b' : '#94a3b8'}
              fill={isStarred ? '#f59e0b' : 'transparent'}
            />
          </button>
        </div>

        {/* Ações da Direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Métrica de Palavras */}
          <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500, marginRight: '6px' }}>
            {words} palavras • ~{readingTime} min de leitura
          </span>

          {/* Botão Poderoso: Transformar Documento em Mapa Mental */}
          <button
            id="btn-doc-convert-to-mindmap"
            onClick={handleConvertDocToMindMap}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
            }}
            title="Converte os títulos e tópicos deste documento em um Mapa Mental visual no Canvas"
          >
            <Zap size={13} />
            <span>Gerar Mapa Mental</span>
          </button>

          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '5px',
              border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
              backgroundColor: isDark ? '#1a222f' : '#f8fafc',
              color: 'inherit',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500
            }}
            title="Imprimir ou Salvar Documento como PDF"
          >
            <FileText size={13} color="#0284c7" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '5px',
              border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
              backgroundColor: isDark ? '#1a222f' : '#f8fafc',
              color: 'inherit',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500
            }}
            title="Baixar Documento em Markdown (.md)"
          >
            <Download size={13} color="#0284c7" />
            <span>Exportar .md</span>
          </button>
        </div>
      </header>

      {/* Barra de Ferramentas de Blocos Ricos */}
      <div
        style={{
          padding: '6px 20px',
          borderBottom: isDark ? '1px solid #1e2633' : '1px solid #f1f5f9',
          backgroundColor: isDark ? '#141a24' : '#fafafa',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexWrap: 'wrap',
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginRight: '6px' }}>
          Blocos:
        </span>

        <button
          onClick={() => insertBlock('## ')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Título H1"
        >
          <Heading1 size={14} />
          <span>H1</span>
        </button>

        <button
          onClick={() => insertBlock('### ')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Subtítulo H2"
        >
          <Heading2 size={14} />
          <span>H2</span>
        </button>

        <button
          onClick={() => insertBlock('- [ ] ')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Lista de Tarefas / Checklist"
        >
          <CheckSquare size={14} color="#10b981" />
          <span>Checklist</span>
        </button>

        <button
          onClick={() => insertBlock('- ')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Lista de Itens"
        >
          <List size={14} />
          <span>Marcador</span>
        </button>

        <button
          onClick={() => insertBlock('1. ')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Lista Numerada"
        >
          <ListOrdered size={14} />
          <span>Numerado</span>
        </button>

        <button
          onClick={() => insertBlock('> 💡 **Destaque:** ')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Caixa de Destaque / Callout Executivo"
        >
          <Quote size={14} color="#f59e0b" />
          <span>Callout</span>
        </button>

        <button
          onClick={() => insertBlock('```\n', '\n```')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Bloco de Código"
        >
          <Code size={14} />
          <span>Código</span>
        </button>

        <button
          onClick={() => insertBlock('\n| Item | Responsável | Status |\n| --- | --- | --- |\n| Fase 1 | Equipe | Concluído |\n')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Tabela Estruturada"
        >
          <Table size={14} />
          <span>Tabela</span>
        </button>

        <button
          onClick={() => insertBlock('\n---\n')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Divisor de Linha"
        >
          <Minus size={14} />
          <span>Divisor</span>
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: isDark ? '#2d384b' : '#cbd5e1', margin: '0 4px' }} />

        <button
          onClick={() => insertBlock('**', '**')}
          style={{ padding: '4px 6px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer' }}
          title="Negrito"
        >
          <Bold size={13} />
        </button>

        <button
          onClick={() => insertBlock('*', '*')}
          style={{ padding: '4px 6px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer' }}
          title="Itálico"
        >
          <Italic size={13} />
        </button>
      </div>

      {/* Área Central de Escrita Minimalista */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 24px 160px 24px'
        }}
      >
        <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
          {/* Título com Cursor e Placeholder */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              onUpdateTitle(e.target.value);
            }}
            placeholder="untitled"
            style={{
              fontSize: '34px',
              fontWeight: 700,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: isDark ? '#f8fafc' : '#1e293b',
              width: '100%',
              padding: 0
            }}
          />

          {/* Subtítulo Guia e Link de Templates de Documentos */}
          <div style={{ position: 'relative' }}>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
              Press <kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: isDark ? '#1e2430' : '#f1f5f9', fontSize: '12px' }}>Enter</kbd> to continue with an empty page, or{' '}
              <span
                id="link-choose-template"
                onClick={() => setIsTemplateMenuOpen(prev => !prev)}
                style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                choose a template
              </span>
            </p>

            {/* Menu Suspenso de Templates de Documentos Executivos */}
            {isTemplateMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '28px',
                  left: '0',
                  width: '380px',
                  backgroundColor: isDark ? '#18202d' : '#ffffff',
                  border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  padding: '8px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Templates de Documentação Executiva:
                </div>

                <div
                  id="btn-template-prd"
                  onClick={() => loadDocTemplate('prd')}
                  style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#232b38' : '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FileText size={16} color="#0284c7" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>PRD (Product Requirement Doc)</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Problema, requisitos, escopo e métricas</div>
                  </div>
                </div>

                <div
                  id="btn-template-meeting"
                  onClick={() => loadDocTemplate('meeting')}
                  style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#232b38' : '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Users size={16} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Ata de Reunião com Ações</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Pautas, decisões tomadas e prazos definidos</div>
                  </div>
                </div>

                <div
                  id="btn-template-briefing"
                  onClick={() => loadDocTemplate('briefing')}
                  style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#232b38' : '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Layout size={16} color="#7c3aed" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Briefing de Projeto / Feature</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Contexto, entregáveis e cronograma</div>
                  </div>
                </div>

                <div
                  id="btn-template-adr"
                  onClick={() => loadDocTemplate('adr')}
                  style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#232b38' : '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Code size={16} color="#f59e0b" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>ADR (Decisão de Arquitetura)</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Contexto técnico, opções e consequências</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Editor de Texto Livre e Estruturado */}
          <textarea
            ref={textareaRef}
            value={docContent}
            onChange={e => {
              setDocContent(e.target.value);
              onUpdateDocContent?.(e.target.value);
            }}
            placeholder="Comece a digitar seu documento executivo aqui... Use Markdown, tópicos, checklists e tabelas. Blocos ilimitados habilitados."
            style={{
              width: '100%',
              minHeight: '480px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: isDark ? '#cbd5e1' : '#334155',
              fontSize: '15px',
              lineHeight: 1.75,
              resize: 'none',
              marginTop: '16px',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </main>

      {/* Painel Flutuante de Discussões Expandido */}
      {isDiscussionOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '340px',
            backgroundColor: isDark ? '#18202d' : '#ffffff',
            border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000
          }}
        >
          {/* Topo do Painel de Discussões */}
          <div
            style={{
              padding: '12px 18px',
              borderBottom: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isDark ? '#141922' : '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} color="#0284c7" />
              <span style={{ fontSize: '13.5px', fontWeight: 700 }}>
                Discussões e Notas de Revisão ({discussions.length})
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleAiReviewDocument}
                disabled={isAiReviewing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  backgroundColor: 'transparent',
                  color: isDark ? '#cbd5e1' : '#475569',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: isAiReviewing ? 'not-allowed' : 'pointer',
                  opacity: isAiReviewing ? 0.6 : 1
                }}
                title="A IA analisa o documento e adiciona uma revisão executiva com riscos e perguntas críticas"
              >
                <Sparkles size={12} color="#0d9488" />
                <span>{isAiReviewing ? 'Analisando...' : 'Pedir Análise da IA'}</span>
              </button>

              <button
                onClick={() => setIsDiscussionOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                title="Recolher painel"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Lista de Comentários / Discussões */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {discussions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: '13px' }}>
                Nenhuma discussão aberta ainda. Digite uma nota ou pergunta abaixo para alinhar com o time.
              </div>
            ) : (
              discussions.map(disc => (
                <div
                  key={disc.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#1f2737' : '#f8fafc',
                    border: isDark ? '1px solid #2a354a' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    opacity: disc.resolved ? 0.65 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: disc.author.includes('IA') ? '#0d9488' : '#0284c7',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {disc.author.charAt(0)}
                      </div>
                      <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{disc.author}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{disc.createdAt}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleResolveDiscussion(disc.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: disc.resolved ? '#10b981' : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: 500
                        }}
                        title={disc.resolved ? 'Reabrir discussão' : 'Marcar como resolvida'}
                      >
                        <CheckCircle2 size={13} color={disc.resolved ? '#10b981' : '#94a3b8'} />
                        <span>{disc.resolved ? 'Resolvida' : 'Resolver'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDiscussion(disc.id)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                        title="Excluir comentário"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', lineHeight: 1.5, textDecoration: disc.resolved ? 'line-through' : 'none' }}>
                    {disc.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Barra Inferior: Start a discussion (TOTALMENTE FUNCIONAL) */}
      <footer
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '780px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 20px',
          zIndex: 1000
        }}
      >
        <form
          id="form-start-discussion"
          onSubmit={handleAddDiscussion}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isDark ? '#1a222f' : '#ffffff',
            border: isDark ? '1px solid #2d384b' : '1px solid #cbd5e1',
            borderRadius: '24px',
            padding: '8px 16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
          }}
        >
          <MessageSquare size={16} color="#0284c7" />
          <input
            id="input-start-discussion"
            type="text"
            placeholder="Start a discussion... (Digite uma nota e pressione Enter)"
            value={discussionText}
            onChange={e => setDiscussionText(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '13.5px',
              width: '100%'
            }}
          />

          {discussionText.trim() && (
            <button
              id="btn-send-discussion"
              type="submit"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Publicar discussão (Enter)"
            >
              <Send size={13} />
            </button>
          )}

          {/* Botão de Abrir / Recolher Histórico de Discussões */}
          {discussions.length > 0 && (
            <button
              type="button"
              onClick={() => setIsDiscussionOpen(prev => !prev)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isDark ? '#242e3f' : '#f1f5f9',
                color: isDark ? '#93c5fd' : '#0284c7',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
              title="Exibir ou ocultar discussões deste documento"
            >
              <span>{discussions.length}</span>
              <ChevronDown size={13} style={{ transform: isDiscussionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          )}
        </form>
      </footer>
    </div>
  );
};
