import React, { useState, useRef } from 'react';
import { 
  ChevronDown, 
  Star, 
  Search, 
  Image as ImageIcon, 
  ArrowUp, 
  Sparkles, 
  GitBranch, 
  Layout, 
  Workflow, 
  Network, 
  StickyNote, 
  Users,
  FileText,
  X,
  Lightbulb,
  Copy
} from 'lucide-react';
import { MindMapNode } from '../types';
import { generateWithGemini } from '../services/geminiService';

interface AgentChatViewProps {
  onGenerateBoard: (prompt: string, title?: string, nodes?: MindMapNode[]) => void;
  onNavigateToDashboard: () => void;
  theme?: 'dark' | 'light';
  workspaceName?: string;
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  onGenerateBoard,
  onNavigateToDashboard,
  theme = 'light',
  workspaceName = 'teste'
}) => {
  const [prompt, setPrompt] = useState('');
  const [isHideSuggestions, setIsHideSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; isImage: boolean; dataUrl?: string; textContent?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const suggestions = [
    {
      id: 'seq-pay',
      label: 'Diagrama de sequência: fluxo de pagamentos',
      icon: <GitBranch size={15} color="#8b5cf6" />,
      title: 'Arquitetura de Pagamentos Ponta a Ponta',
      prompt: 'Diagrama de sequência: fluxo de pagamentos'
    },
    {
      id: 'wf-app',
      label: 'Wireframe: app de controle financeiro',
      icon: <Layout size={15} color="#0284c7" />,
      title: 'Protótipo de App Financeiro Mobile',
      prompt: 'Wireframe: app de controle financeiro'
    },
    {
      id: 'uf-checkout',
      label: 'Fluxo de usuário: checkout e conversão',
      icon: <Workflow size={15} color="#ec4899" />,
      title: 'Fluxo de Checkout de Alta Conversão',
      prompt: 'Fluxo de usuário: checkout e conversão'
    },
    {
      id: 'mm-startup',
      label: 'Mapa mental: passos para criar uma startup',
      icon: <Network size={15} color="#8b5cf6" />,
      title: 'Manual Prático de Startups: do 0 ao 1',
      prompt: 'Mapa mental: passos para criar uma startup'
    },
    {
      id: 'st-marketing',
      label: 'Brainstorm em notas: ideias de marketing',
      icon: <StickyNote size={15} color="#eab308" />,
      title: 'Matriz de Ideação de Marketing de Crescimento',
      prompt: 'Brainstorm em notas: ideias de marketing'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          isImage: true,
          dataUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          isImage: false,
          textContent: typeof reader.result === 'string' ? reader.result : ''
        });
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || prompt).trim();
    if ((!textToSend && !attachedFile) || isGenerating) return;
    setIsGenerating(true);

    let finalPrompt = textToSend;
    if (attachedFile && !attachedFile.isImage && attachedFile.textContent) {
      finalPrompt = `[Documento Anexado: ${attachedFile.name}]\nConteúdo:\n${attachedFile.textContent}\n\nInstrução: ${textToSend || 'Estruture um mapa mental completo com reflexões estratégicas.'}`;
    }

    try {
      const result = await generateWithGemini(
        finalPrompt || 'Analise a imagem e construa um mapa mental',
        attachedFile?.isImage ? attachedFile.dataUrl : undefined
      );
      setIsGenerating(false);
      onGenerateBoard(textToSend || result.title, result.title, result.nodes);
    } catch {
      setIsGenerating(false);
      onGenerateBoard(textToSend, textToSend.slice(0, 30));
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#12161f' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#0f172a',
        fontFamily: 'Dinsical, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Barra Superior */}
      <header
        style={{
          height: '48px',
          borderBottom: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          backgroundColor: isDark ? '#141922' : '#ffffff',
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span
            data-nav="dashboard"
            onClick={onNavigateToDashboard}
            style={{ color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', fontWeight: 500 }}
          >
            Equipes
          </span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <div
            data-nav="dashboard"
            onClick={onNavigateToDashboard}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Users size={14} color="#818cf8" />
            <span>Todos em {workspaceName}</span>
            <ChevronDown size={13} color="#94a3b8" />
          </div>
          <Star size={14} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '4px' }} />
        </div>

        {/* Presença e Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
          <Search size={16} color="#64748b" style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* Barra de Aba: Assistente IA */}
      <div
        style={{
          borderBottom: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0',
          backgroundColor: isDark ? '#141922' : '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          height: '40px',
          flexShrink: 0
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isDark ? '#f8fafc' : '#0f172a',
            borderBottom: '2.5px solid #0d9488',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          Assistente IA
        </div>
      </div>

      {/* Conteúdo Central */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '20px'
        }}
      >
        {/* Card: Sugestões Prontas */}
        {!isHideSuggestions && (
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: isDark ? '#181e28' : '#ffffff',
              border: isDark ? '1px solid #2a3446' : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#475569' }}>
                Sugestões Prontas
              </span>
              <button
                onClick={() => setIsHideSuggestions(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.05em'
                }}
              >
                OCULTAR
              </button>
            </div>

            {/* Lista dos Prompts Traduzidos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {suggestions.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSend(item.prompt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: isDark ? '#f1f5f9' : '#334155',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#232b38' : '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div style={{ borderTop: isDark ? '1px solid #242c3b' : '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                Gera mapas mentais, analisa arquivos e faz perguntas estratégicas.
              </span>
              <span style={{ fontSize: '11.5px', color: '#0d9488', fontWeight: 600 }}>
                ⚡ Gemini 2.5
              </span>
            </div>
          </div>
        )}

        {/* Input Flutuante Central com Suporte a Arquivo e Modos */}
        <div
          style={{
            width: '100%',
            maxWidth: '540px',
            backgroundColor: isDark ? '#1a222f' : '#ffffff',
            border: isDark ? '1px solid #2d384b' : '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* Pílulas de Modos Rápidos */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <button
              onClick={() => setPrompt('Analise criticamente minha ideia, aponte pontos cegos e me faça 3 perguntas provocativas: ')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '5px',
                border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
                backgroundColor: isDark ? '#141a24' : '#f8fafc',
                color: isDark ? '#e2e8f0' : '#475569',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Lightbulb size={12} color="#f59e0b" />
              <span>Ajudar a Pensar</span>
            </button>

            <button
              onClick={() => {
                setPrompt('Copie exatamente os nós e hierarquias da imagem anexada: ');
                if (!attachedFile) fileInputRef.current?.click();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '5px',
                border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
                backgroundColor: isDark ? '#141a24' : '#f8fafc',
                color: isDark ? '#e2e8f0' : '#475569',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Copy size={12} color="#0284c7" />
              <span>Copiar da Imagem</span>
            </button>
          </div>

          {/* Anexo selecionado */}
          {attachedFile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: isDark ? '#232d3f' : '#f1f5f9',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {attachedFile.isImage ? <ImageIcon size={14} color="#0284c7" /> : <FileText size={14} color="#0284c7" />}
                <span style={{ fontWeight: 600 }}>{attachedFile.name}</span>
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>({(attachedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Pergunte ao Assistente IA, envie uma imagem/documento ou peça para estruturar..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.txt,.md,.pdf,.json,.csv"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: attachedFile ? '#0d9488' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
                title="Anexar imagem ou documento para análise ou cópia"
              >
                <ImageIcon size={17} />
                <span>Anexar</span>
              </button>
            </div>

            <button
              onClick={() => handleSend()}
              disabled={(!prompt.trim() && !attachedFile) || isGenerating}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: (!prompt.trim() && !attachedFile) || isGenerating ? '#cbd5e1' : '#0d9488',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (!prompt.trim() && !attachedFile) || isGenerating ? 'not-allowed' : 'pointer'
              }}
              title="Enviar mensagem"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};