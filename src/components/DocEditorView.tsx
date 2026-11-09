import React, { useState, useRef } from 'react';
import { 
  FileText, 
  ChevronDown, 
  Star, 
  Share2, 
  Search, 
  MessageSquare, 
  Undo2, 
  Redo2, 
  Clock, 
  Type, 
  Zap, 
  HelpCircle, 
  BookOpen,
  Send,
  Plus,
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
  Italic
} from 'lucide-react';
import { Board } from '../types';

interface DocEditorViewProps {
  board: Board;
  onUpdateTitle: (title: string) => void;
  onNavigateToDashboard: () => void;
  onOpenTemplates: () => void;
  theme?: 'dark' | 'light';
  workspaceName?: string;
}

export const DocEditorView: React.FC<DocEditorViewProps> = ({
  board,
  onUpdateTitle,
  onNavigateToDashboard,
  onOpenTemplates,
  theme = 'light',
  workspaceName = 'teste'
}) => {
  const [title, setTitle] = useState(board.title === 'Novo Projeto' || !board.title ? 'untitled' : board.title);
  const [docContent, setDocContent] = useState(() => {
    // Inicializa com tópicos do quadro se houver
    if (board.mindMapNodes && board.mindMapNodes.length > 1) {
      const root = board.mindMapNodes.find(n => n.side === 'root') || board.mindMapNodes[0];
      const branches = board.mindMapNodes.filter(n => n.parentId === root.id);
      return branches.map(b => `## ${b.text}\n\n- Descrição e pontos de ação para ${b.text}\n- [ ] Tarefa inicial\n`).join('\n');
    }
    return '';
  });
  const [discussionText, setDiscussionText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === 'dark';

  // Métricas do Documento (Blocos Ilimitados Pro)
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
  };

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
        {/* Breadcrumb: Everyone at teste / [Doc Icon] untitled */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span
            data-nav="dashboard"
            onClick={onNavigateToDashboard}
            style={{ color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', fontWeight: 500 }}
            title="Voltar ao Dashboard"
          >
            Everyone at {workspaceName}
          </span>
          <span style={{ color: '#94a3b8' }}>/</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
            </svg>

            <span>{title || 'untitled'}</span>
          </div>

          <Star size={14} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '4px' }} />
        </div>

        {/* Ações da Direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Métrica de Palavras (Capacidade Ilimitada Pro) */}
          <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>
            {words} palavras • ~{readingTime} min
          </span>

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
            title="Baixar Documento em Markdown (.md) sem marca d'água"
          >
            <Download size={13} color="#0284c7" />
            <span>Exportar .md</span>
          </button>
        </div>
      </header>

      {/* Barra de Ferramentas de Blocos Ricos (Whimsical Pro Rich Blocks) */}
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
          title="Título H2"
        >
          <Heading1 size={14} />
          <span>H1</span>
        </button>

        <button
          onClick={() => insertBlock('### ')}
          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="Subtítulo H3"
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
          padding: '40px 24px 100px 24px'
        }}
      >
        <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Título com Cursor e Placeholder */}
          <input
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

          {/* Subtítulo Guia */}
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8' }}>
            Press <kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: isDark ? '#1e2430' : '#f1f5f9', fontSize: '12px' }}>Enter</kbd> to continue with an empty page, or{' '}
            <span
              onClick={onOpenTemplates}
              style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}
            >
              choose a template
            </span>
          </p>

          {/* Editor de Texto Livre e Estruturado */}
          <textarea
            ref={textareaRef}
            value={docContent}
            onChange={e => setDocContent(e.target.value)}
            placeholder="Comece a digitar seu documento executivo aqui... Use Markdown, tópicos, checklists e tabelas. Blocos ilimitados habilitados."
            style={{
              width: '100%',
              minHeight: '520px',
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

      {/* Barra Inferior: Start a discussion */}
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
          padding: '0 20px'
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isDark ? '#1a222f' : '#ffffff',
            border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '8px 16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <MessageSquare size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Start a discussion..."
            value={discussionText}
            onChange={e => setDiscussionText(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '13px',
              width: '100%'
            }}
          />
        </div>
      </footer>
    </div>
  );
};
