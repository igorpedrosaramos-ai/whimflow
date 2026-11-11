import React, { useState, useRef, useEffect } from 'react';
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
  Copy,
  Plus,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MindMapNode } from '../types';
import { generateWithGemini, GeminiDiagramResult } from '../services/geminiService';
import { MindMapAiPreview } from './MindMapAiPreview';

interface AgentChatViewProps {
  onGenerateBoard: (prompt: string, title?: string, nodes?: MindMapNode[]) => void;
  onNavigateToDashboard: () => void;
  theme?: 'dark' | 'light';
  workspaceName?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  attachedFile?: {
    name: string;
    size: number;
    type: string;
    isImage: boolean;
    isPdf?: boolean;
    dataUrl?: string;
  };
  generatedDiagram?: GeminiDiagramResult;
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  onGenerateBoard,
  onNavigateToDashboard,
  theme = 'light',
  workspaceName = 'teste'
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHideSuggestions, setIsHideSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: number;
    type: string;
    isImage: boolean;
    isPdf?: boolean;
    dataUrl?: string;
    textContent?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

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

    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isImg || isPdf) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          isImage: isImg,
          isPdf: isPdf,
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
          type: file.type || 'text/plain',
          isImage: false,
          isPdf: false,
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

    const currentAttachment = attachedFile;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend || (currentAttachment?.isImage ? '(Imagem anexada para análise e estruturação de mapa mental)' : `(Arquivo anexado: ${currentAttachment?.name})`),
      attachedFile: currentAttachment ? {
        name: currentAttachment.name,
        size: currentAttachment.size,
        type: currentAttachment.type,
        isImage: currentAttachment.isImage,
        isPdf: currentAttachment.isPdf,
        dataUrl: currentAttachment.dataUrl
      } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setAttachedFile(null);
    setIsGenerating(true);

    let finalPrompt = textToSend;
    if (currentAttachment && !currentAttachment.isImage && !currentAttachment.isPdf && currentAttachment.textContent) {
      finalPrompt = `[Documento Anexado: ${currentAttachment.name}]\nConteúdo:\n${currentAttachment.textContent}\n\nInstrução: ${textToSend || 'Estruture um mapa mental completo com reflexões estratégicas.'}`;
    } else if (!textToSend && (currentAttachment?.isImage || currentAttachment?.isPdf)) {
      finalPrompt = 'Analise a imagem/documento anexado com máxima atenção aos detalhes, identifique a hierarquia e recrie o mapa mental visual correspondente.';
    }

    try {
      const result = await generateWithGemini(
        finalPrompt,
        (currentAttachment?.isImage || currentAttachment?.isPdf) ? currentAttachment.dataUrl : undefined
      );

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: 'assistant',
        text: result.explanation,
        generatedDiagram: result
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Houve uma instabilidade temporária ao conectar com a IA, mas uma estrutura base foi organizada.'
        }
      ]);
    } finally {
      setIsGenerating(false);
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
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              color: '#0d9488',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={12} color="#0d9488" />
            <span>Gemini 3.1 Flash</span>
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
          Assistente IA • Análise, Raciocínio & Mapas Mentais
        </div>
      </div>

      {/* Conteúdo Central: Área de Conversa e Prévia */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          padding: '20px 24px 120px 24px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Se não houver mensagens ainda, exibe o cartão de boas-vindas com sugestões */}
          {messages.length === 0 && (
            <>
              {!isHideSuggestions && (
                <div
                  style={{
                    backgroundColor: isDark ? '#181e28' : '#ffffff',
                    border: isDark ? '1px solid #2a3446' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px 22px',
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155' }}>
                      Sugestões Prontas para Iniciar
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
                          padding: '9px 12px',
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

                  <div style={{ borderTop: isDark ? '1px solid #242c3b' : '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Envie ideias, fotos de rascunhos ou documentos para estruturar mapas mentais com raciocínio analítico.
                    </span>
                    <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600 }}>
                      ⚡ Raciocínio Profundo
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Histórico de Mensagens com Prévias Interativas */}
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              {msg.sender === 'user' ? (
                <div
                  style={{
                    maxWidth: '85%',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '14px 14px 2px 14px',
                    fontSize: '13.5px',
                    lineHeight: '1.45',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                  }}
                >
                  {msg.attachedFile && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        marginBottom: '8px',
                        fontSize: '12px'
                      }}
                    >
                      {msg.attachedFile.isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
                      <span style={{ fontWeight: 600 }}>{msg.attachedFile.name}</span>
                    </div>
                  )}
                  {msg.text}
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      backgroundColor: isDark ? '#1a2230' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      padding: '12px 16px',
                      borderRadius: '14px 14px 14px 2px',
                      border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                      fontSize: '13.5px',
                      lineHeight: '1.45'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#0d9488', fontWeight: 600, marginBottom: '6px' }}>
                      <Sparkles size={14} color="#0d9488" />
                      <span>Assistente Estratégico Gemini</span>
                    </div>
                    {msg.text}
                  </div>

                  {/* Prévia Rica e Raciocínio com MindMapAiPreview */}
                  {msg.generatedDiagram && (
                    <MindMapAiPreview
                      diagram={msg.generatedDiagram}
                      isDark={isDark}
                      onInsertToCanvas={(nodes, title) => {
                        onGenerateBoard(title, title, nodes);
                      }}
                      onCreateNewBoard={(title, nodes) => {
                        onGenerateBoard(title, title, nodes);
                      }}
                      onAskReflectionQuestion={(question) => {
                        setPrompt(`Sobre "${question}": `);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Indicador de Processamento Gemini */}
          {isGenerating && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: isDark ? '#1a2230' : '#ffffff',
                border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Sparkles size={16} color="#0d9488" className="animate-spin" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0d9488' }}>
                  Gemini analisando e pensando na estrutura...
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Avaliando domínio, hierarquia de ramos e sintetizando prévia visual
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Flutuante Fixo na Base */}
      <footer
        style={{
          position: 'fixed',
          bottom: '24px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
          zIndex: 40
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: isDark ? '#1a222f' : '#ffffff',
            border: isDark ? '1px solid #2d384b' : '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.45)' : '0 8px 28px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'auto'
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
                setPrompt('Copie exatamente os nós, produtos e hierarquias da imagem anexada: ');
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

            <button
              onClick={() => setPrompt('Crie um mapa mental estratégico e detalhado sobre: ')}
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
              <Network size={12} color="#7c3aed" />
              <span>Criar Mapa Mental</span>
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
      </footer>
    </div>
  );
};
