import React, { useState } from 'react';
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
  Plus
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
  const [docContent, setDocContent] = useState('');
  const [discussionText, setDiscussionText] = useState('');
  const isDark = theme === 'dark';

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
      {/* Barra Superior Autêntica Whimsical Doc (Foto 2) */}
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
            {/* Ícone Azul de Documento */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
            </svg>

            <span>{title || 'untitled'}</span>
            <ChevronDown size={13} color="#94a3b8" style={{ cursor: 'pointer' }} />
          </div>

          <Star size={14} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '4px' }} />
        </div>

        {/* Ações da Direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Indicador de Presença: 8 pontos verdes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '1px',
                  backgroundColor: '#10b981'
                }}
              />
            ))}
          </div>

          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            I 1
          </div>

          {/* Botão Share */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#7c3aed',
              border: 'none',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <Search size={16} color="#64748b" style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* Área Central de Escrita Minimalista (Foto 2) */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px 24px 100px 24px'
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

          {/* Subtítulo Guia (Exato da Foto 2) */}
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
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
            value={docContent}
            onChange={e => setDocContent(e.target.value)}
            placeholder="Comece a digitar seu documento executivo aqui... Use Markdown, tópicos, checklists e tabelas."
            style={{
              width: '100%',
              minHeight: '400px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: isDark ? '#cbd5e1' : '#334155',
              fontSize: '15px',
              lineHeight: 1.7,
              resize: 'none',
              marginTop: '20px',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </main>

      {/* Barra Inferior: Start a discussion (Exato da Foto 2) */}
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

      {/* Barra Flutuante HUD no Canto Inferior Direito (Foto 2) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          backgroundColor: isDark ? '#1b212c' : '#ffffff',
          border: isDark ? '1px solid #2d3748' : '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '3px 4px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)'
        }}
      >
        <button style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Undo2 size={14} />
        </button>
        <button style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Redo2 size={14} />
        </button>
        <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0', margin: '0 3px' }} />
        <button style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={14} />
        </button>
        <button style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={14} />
        </button>
        <button style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Type size={14} />
        </button>
        <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0', margin: '0 3px' }} />
        <button style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={14} />
        </button>
        <button style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HelpCircle size={14} />
        </button>
      </div>
    </div>
  );
};
