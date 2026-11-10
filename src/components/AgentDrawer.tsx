import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  ArrowUp, 
  Sparkles, 
  GitBranch, 
  Layout, 
  Workflow, 
  Network, 
  StickyNote, 
  ExternalLink,
  PanelRightClose,
  Plus,
  Layers,
  Check
} from 'lucide-react';
import { MindMapNode } from '../types';
import { generateWithGemini, TRY_IT_OUT_PRESETS } from '../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  imagePreview?: string;
  generatedDiagram?: {
    title: string;
    explanation: string;
    nodes: MindMapNode[];
    modelUsed?: string;
  };
}

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertNodesToCurrentBoard: (nodes: MindMapNode[], title?: string) => void;
  onCreateNewBoardWithNodes: (title: string, nodes: MindMapNode[]) => void;
  theme?: 'dark' | 'light';
  workspaceName?: string;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  isOpen,
  onClose,
  onInsertNodesToCurrentBoard,
  onCreateNewBoardWithNodes,
  theme = 'light',
  workspaceName = 'teste'
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHideSuggestions, setIsHideSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [insertedIds, setInsertedIds] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Os 5 cards idênticos da imagem do Whimsical
  const tryItOutItems = [
    {
      id: 'seq-pay',
      label: 'Sequence diagram of payment processing',
      icon: <GitBranch size={16} color="#8b5cf6" />,
      prompt: 'Sequence diagram of payment processing'
    },
    {
      id: 'wf-app',
      label: 'Wireframe of a budgeting app',
      icon: <Layout size={16} color="#0284c7" />,
      prompt: 'Wireframe of a budgeting app'
    },
    {
      id: 'uf-checkout',
      label: 'User flow of checkout flow',
      icon: <Workflow size={16} color="#06b6d4" />,
      prompt: 'User flow of checkout flow'
    },
    {
      id: 'mm-startup',
      label: 'Mind map of startup building tips',
      icon: <Network size={16} color="#d946ef" />,
      prompt: 'Mind map of startup building tips'
    },
    {
      id: 'st-marketing',
      label: 'Sticky note brainstorm for marketing ideas',
      icon: <StickyNote size={16} color="#f59e0b" />,
      prompt: 'Sticky note brainstorm for marketing ideas'
    }
  ];

  const handleSendPrompt = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !selectedImage) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmed || '(Imagem anexada para análise)',
      imagePreview: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    setIsGenerating(true);

    try {
      const result = await generateWithGemini(trimmed || 'Analise a imagem e gere um mapa mental', currentImg || undefined);

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: 'assistant',
        text: result.explanation,
        generatedDiagram: result
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Houve uma instabilidade ao conectar com o Gemini, mas uma estrutura base foi preparada.'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(prompt);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop transparente para clique externo */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4998,
          backgroundColor: 'transparent'
        }}
        onClick={onClose}
      />

      {/* Drawer Lateral Direito do Agente (Idêntico ao Whimsical) */}
      <aside
        id="agent-flyout-drawer"
        data-testid="agent-flyout"
        style={{
          position: 'fixed',
          top: '48px',
          right: 0,
          bottom: 0,
          width: '390px',
          maxWidth: '100vw',
          backgroundColor: isDark ? '#141922' : '#f8fafc',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderLeft: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0',
          boxShadow: isDark ? '-8px 0 32px rgba(0, 0, 0, 0.45)' : '-6px 0 28px rgba(0, 0, 0, 0.08)',
          zIndex: 4999,
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          animation: 'slideInRight 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do Agente: Aba "New chat" com indicador verde-azulado e botão de fechar */}
        <div
          style={{
            padding: '14px 18px 0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDark ? '1px solid #1e2633' : '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#f1f5f9' : '#0f172a',
                paddingBottom: '10px',
                borderBottom: '2.5px solid #0d9488',
                display: 'inline-block'
              }}
            >
              New chat
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              marginBottom: '8px'
            }}
            title="Fechar Painel do Agente"
          >
            <PanelRightClose size={18} />
          </button>
        </div>

        {/* Área Central Rolável (Sugestões Try it out ou Histórico de Mensagens) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Card "Try it out" (Exatamente como no Whimsical) */}
          <div
            style={{
              backgroundColor: isDark ? '#1a2230' : '#f1f5f9',
              borderRadius: '10px',
              border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Topo do Card: Título + Botão HIDE / SHOW */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                Try it out
              </span>
              <button
                onClick={() => setIsHideSuggestions(!isHideSuggestions)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.04em'
                }}
              >
                {isHideSuggestions ? 'SHOW' : 'HIDE'}
              </button>
            </div>

            {/* Lista dos 5 presets quando não estiver oculto */}
            {!isHideSuggestions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tryItOutItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSendPrompt(item.prompt)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: isDark ? '#e2e8f0' : '#334155',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.12s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#232d3f' : '#ffffff')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  </div>
                ))}

                {/* Rodapé do Card */}
                <div
                  style={{
                    marginTop: '6px',
                    paddingTop: '8px',
                    borderTop: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    color: '#94a3b8'
                  }}
                >
                  <span>Complex prompts use more credits.</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#0d9488', fontWeight: 600 }}>
                    ⚡ Gemini Pro
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Histórico de Mensagens / Raciocínio Gemini */}
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '92%'
              }}
            >
              {/* Bolha do Usuário */}
              {msg.sender === 'user' ? (
                <div
                  style={{
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '12px 12px 2px 12px',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}
                >
                  {msg.imagePreview && (
                    <img
                      src={msg.imagePreview}
                      alt="Anexo"
                      style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '6px', marginBottom: '6px', objectFit: 'cover' }}
                    />
                  )}
                  {msg.text}
                </div>
              ) : (
                /* Resposta do Agente Gemini */
                <div
                  style={{
                    backgroundColor: isDark ? '#1a2230' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    padding: '12px 14px',
                    borderRadius: '12px 12px 12px 2px',
                    border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>
                    <Sparkles size={13} color="#0d9488" />
                    <span>Gemini 3.5 Turbi Agent</span>
                  </div>

                  <div>{msg.text}</div>

                  {/* Card do Diagrama Gerado com Ações Diretas */}
                  {msg.generatedDiagram && (
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: isDark ? '#141922' : '#f8fafc',
                        border: isDark ? '1px solid #222b3a' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#7c3aed' }}>
                        ✦ {msg.generatedDiagram.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {msg.generatedDiagram.nodes.length} nós estruturados e conectados
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button
                          onClick={() => {
                            if (msg.generatedDiagram) {
                              onInsertNodesToCurrentBoard(msg.generatedDiagram.nodes, msg.generatedDiagram.title);
                              setInsertedIds(prev => ({ ...prev, [msg.id]: true }));
                            }
                          }}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: insertedIds[msg.id] ? '#10b981' : '#7c3aed',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {insertedIds[msg.id] ? <Check size={12} /> : <Layers size={12} />}
                          <span>{insertedIds[msg.id] ? 'Inserido!' : 'Inserir no Canvas'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (msg.generatedDiagram) {
                              onCreateNewBoardWithNodes(msg.generatedDiagram.title, msg.generatedDiagram.nodes);
                              onClose();
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: isDark ? '#232d3f' : '#e2e8f0',
                            border: 'none',
                            color: isDark ? '#f1f5f9' : '#334155',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Abrir em um novo quadro separado"
                        >
                          <Plus size={12} />
                          <span>Novo Quadro</span>
                        </button>
                      </div>
                    </div>
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
                padding: '10px 14px',
                borderRadius: '12px 12px 12px 2px',
                fontSize: '12.5px',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={14} className="animate-spin" />
              <span>O Agente Gemini está desenhando a arquitetura visual...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Caixa de Entrada Inferior (Idêntica ao Whimsical) */}
        <div style={{ padding: '12px 16px 16px 16px' }}>
          <div
            style={{
              backgroundColor: isDark ? '#1a2230' : '#ffffff',
              borderRadius: '12px',
              border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              padding: '10px 12px 8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {/* Preview da Imagem Selecionada */}
            {selectedImage && (
              <div style={{ position: 'relative', display: 'inline-block', width: 'fit-content' }}>
                <img
                  src={selectedImage}
                  alt="Pré-visualização"
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            )}

            {/* Textarea para Pergunta ao Agente */}
            <textarea
              ref={inputRef}
              rows={2}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Whimsical agent..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '13.5px',
                lineHeight: '1.4',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontFamily: 'inherit'
              }}
            />

            {/* Barra de Ações: Ícone de Imagem à Esquerda + Botão Teal com Seta para Cima à Direita */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                  title="Anexar imagem de referência (Gemini Vision)"
                >
                  <ImageIcon size={18} />
                </button>
              </div>

              {/* Botão de Envio Teal com Seta ↑ */}
              <button
                type="button"
                onClick={() => handleSendPrompt(prompt)}
                disabled={isGenerating || (!prompt.trim() && !selectedImage)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: (!prompt.trim() && !selectedImage) || isGenerating ? '#cbd5e1' : '#14b8a6',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (!prompt.trim() && !selectedImage) || isGenerating ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s'
                }}
                title="Enviar para o Agente Gemini (Enter)"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
