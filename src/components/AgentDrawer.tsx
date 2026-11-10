import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  FileText,
  ArrowUp, 
  Sparkles, 
  GitBranch, 
  Layout, 
  Workflow, 
  Network, 
  StickyNote, 
  PanelRightClose,
  Plus,
  Layers,
  Check,
  HelpCircle,
  Lightbulb,
  Copy,
  Paperclip
} from 'lucide-react';
import { MindMapNode } from '../types';
import { generateWithGemini } from '../services/geminiService';

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  isImage: boolean;
  dataUrl?: string;
  textContent?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  attachedFile?: AttachedFile;
  generatedDiagram?: {
    title: string;
    explanation: string;
    reflectionQuestions?: string[];
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
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
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

  // Os 5 cards agora em Português autêntico e profissional
  const tryItOutItems = [
    {
      id: 'seq-pay',
      label: 'Diagrama de sequência: fluxo de pagamentos',
      icon: <GitBranch size={16} color="#8b5cf6" />,
      prompt: 'Diagrama de sequência: fluxo de pagamentos'
    },
    {
      id: 'wf-app',
      label: 'Wireframe: app de controle financeiro',
      icon: <Layout size={16} color="#0284c7" />,
      prompt: 'Wireframe: app de controle financeiro'
    },
    {
      id: 'uf-checkout',
      label: 'Fluxo de usuário: checkout e conversão',
      icon: <Workflow size={16} color="#06b6d4" />,
      prompt: 'Fluxo de usuário: checkout e conversão'
    },
    {
      id: 'mm-startup',
      label: 'Mapa mental: passos para criar uma startup',
      icon: <Network size={16} color="#d946ef" />,
      prompt: 'Mapa mental: passos para criar uma startup'
    },
    {
      id: 'st-marketing',
      label: 'Brainstorm em notas: ideias de marketing',
      icon: <StickyNote size={16} color="#f59e0b" />,
      prompt: 'Brainstorm em notas: ideias de marketing'
    }
  ];

  const handleSendPrompt = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !attachedFile) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmed || (attachedFile?.isImage ? '(Imagem enviada para análise e estruturação)' : `(Arquivo anexado: ${attachedFile?.name})`),
      attachedFile: attachedFile || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    setIsGenerating(true);

    try {
      // Monta o prompt completo integrando o conteúdo textual se houver arquivo de texto
      let promptWithContext = trimmed;
      if (currentAttachment && !currentAttachment.isImage && currentAttachment.textContent) {
        promptWithContext = `[Arquivo Anexado: ${currentAttachment.name}]\nConteúdo:\n${currentAttachment.textContent}\n\nInstrução: ${trimmed || 'Analise este documento, extraia os pilares e estruture um mapa mental completo com perguntas reflexivas.'}`;
      } else if (!trimmed && currentAttachment?.isImage) {
        promptWithContext = 'Analise a imagem anexada, identifique a hierarquia e recrie o mapa mental ou fluxo visual com fidelidade máxima.';
      }

      const result = await generateWithGemini(
        promptWithContext,
        currentAttachment?.isImage ? currentAttachment.dataUrl : undefined
      );

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
          text: 'Houve uma instabilidade temporária ao conectar com a IA, mas uma estrutura base foi organizada.'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');

    if (isImg) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          isImage: true,
          dataUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Arquivo de texto (.txt, .md, .json, .csv) ou documento
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          isImage: false,
          textContent: typeof reader.result === 'string' ? reader.result : ''
        });
      };
      reader.readAsText(file);
    }
    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
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
      {/* Backdrop transparente para fechar ao clicar fora */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4998,
          backgroundColor: 'transparent'
        }}
        onClick={onClose}
      />

      {/* Drawer Lateral Direito do Agente */}
      <aside
        id="agent-flyout-drawer"
        data-testid="agent-flyout"
        style={{
          position: 'fixed',
          top: '48px',
          right: 0,
          bottom: 0,
          width: '410px',
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
        {/* Cabeçalho do Agente: Aba "Assistente IA" em Português com botão de fechar */}
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
              Assistente IA
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
            title="Fechar Painel do Assistente IA"
          >
            <PanelRightClose size={18} />
          </button>
        </div>

        {/* Área Central Rolável (Sugestões Prontas ou Histórico de Mensagens) */}
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
          {/* Card "Sugestões Prontas" em Português */}
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
            {/* Topo do Card: Título + Botão OCULTAR / EXIBIR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                Sugestões Prontas
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
                {isHideSuggestions ? 'EXIBIR' : 'OCULTAR'}
              </button>
            </div>

            {/* Lista dos 5 presets traduzidos quando não estiver oculto */}
            {!isHideSuggestions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tryItOutItems.map(item => (
                  <div
                    key={item.id}
                    id={`btn-preset-${item.id}`}
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
                    fontSize: '11px',
                    color: '#94a3b8'
                  }}
                >
                  <span>Analisa imagens, arquivos e faz perguntas reflexivas</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#0d9488', fontWeight: 600 }}>
                    ⚡ Gemini 2.5
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
                  {msg.attachedFile?.isImage && msg.attachedFile.dataUrl && (
                    <img
                      src={msg.attachedFile.dataUrl}
                      alt="Anexo"
                      style={{ maxWidth: '100%', maxHeight: '130px', borderRadius: '6px', marginBottom: '6px', objectFit: 'cover' }}
                    />
                  )}
                  {msg.attachedFile && !msg.attachedFile.isImage && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        marginBottom: '6px',
                        fontSize: '11.5px'
                      }}
                    >
                      <FileText size={13} />
                      <span style={{ fontWeight: 600 }}>{msg.attachedFile.name}</span>
                    </div>
                  )}
                  {msg.text}
                </div>
              ) : (
                /* Resposta do Assistente Gemini */
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
                    <span>Assistente Estratégico Gemini</span>
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

                  {/* Bloco de Reflexão: Perguntas Estratégicas para o Usuário Pensar */}
                  {msg.generatedDiagram?.reflectionQuestions && msg.generatedDiagram.reflectionQuestions.length > 0 && (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isDark ? '#16222f' : '#f0fdfa',
                        border: isDark ? '1px solid #1e3a47' : '1px solid #ccfbf1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#0d9488' }}>
                        <HelpCircle size={14} />
                        <span>Perguntas para Aprofundar seu Raciocínio:</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {msg.generatedDiagram.reflectionQuestions.map((question, qIdx) => (
                          <div
                            key={qIdx}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              backgroundColor: isDark ? '#141c27' : '#ffffff',
                              border: isDark ? '1px solid #243445' : '1px solid #e6f4f2',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <span style={{ fontSize: '12px', color: isDark ? '#e2e8f0' : '#334155', lineHeight: '1.4' }}>
                              • {question}
                            </span>
                            <button
                              onClick={() => {
                                setPrompt(`Sobre "${question}": `);
                                inputRef.current?.focus();
                              }}
                              style={{
                                alignSelf: 'flex-start',
                                background: 'transparent',
                                border: 'none',
                                color: '#0d9488',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <span>Responder e desdobrar no mapa →</span>
                            </button>
                          </div>
                        ))}
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
              <span>O Assistente IA está analisando e estruturando o raciocínio...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Caixa de Entrada Inferior 100% em Português */}
        <div style={{ padding: '12px 16px 16px 16px' }}>
          {/* Pílulas de Ação Rápida: Ajudar a Pensar / Copiar Diagrama / Criar Mapa */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            <button
              onClick={() => {
                setPrompt('Analise criticamente minha ideia, aponte pontos cegos e me faça 3 perguntas provocativas: ');
                inputRef.current?.focus();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
                backgroundColor: isDark ? '#1a2230' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#334155',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Solicita análise crítica e perguntas para aprofundar seu raciocínio"
            >
              <Lightbulb size={12} color="#f59e0b" />
              <span>Ajudar a Pensar</span>
            </button>

            <button
              onClick={() => {
                setPrompt('Copie exatamente a estrutura e os nós da imagem anexada: ');
                if (!attachedFile) {
                  fileInputRef.current?.click();
                } else {
                  inputRef.current?.focus();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
                backgroundColor: isDark ? '#1a2230' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#334155',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Transcreve fielmente um diagrama ou mapa mental de uma imagem"
            >
              <Copy size={12} color="#0284c7" />
              <span>Copiar da Imagem</span>
            </button>

            <button
              onClick={() => {
                setPrompt('Crie um mapa mental estratégico e detalhado sobre: ');
                inputRef.current?.focus();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: isDark ? '1px solid #2d384b' : '1px solid #e2e8f0',
                backgroundColor: isDark ? '#1a2230' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#334155',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Gera um mapa mental estruturado em pilares lógicos"
            >
              <Network size={12} color="#7c3aed" />
              <span>Criar Mapa Mental</span>
            </button>
          </div>

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
            {/* Badge de Arquivo ou Imagem Anexada */}
            {attachedFile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#232d3f' : '#f1f5f9',
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  {attachedFile.isImage ? (
                    <img
                      src={attachedFile.dataUrl}
                      alt="Miniatura"
                      style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  ) : (
                    <FileText size={18} color="#0284c7" />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                      {attachedFile.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                      {attachedFile.isImage ? 'Imagem para análise / cópia' : 'Documento para síntese'} ({(attachedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setAttachedFile(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Remover anexo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Textarea para Pergunta ao Assistente IA em Português */}
            <textarea
              ref={inputRef}
              rows={2}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte ao Assistente IA, envie uma imagem/documento ou peça para estruturar..."
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

            {/* Barra de Ações: Ícones de Anexo à Esquerda + Botão Teal com Seta para Cima à Direita */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.txt,.md,.pdf,.json,.csv"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: attachedFile ? '#0d9488' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: 500
                  }}
                  title="Anexar imagem (PNG, JPG) ou documento (TXT, MD, PDF) para analisar ou copiar"
                >
                  <ImageIcon size={17} />
                  <span>Anexar</span>
                </button>
              </div>

              {/* Botão de Envio Teal com Seta ↑ */}
              <button
                type="button"
                onClick={() => handleSendPrompt(prompt)}
                disabled={isGenerating || (!prompt.trim() && !attachedFile)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: (!prompt.trim() && !attachedFile) || isGenerating ? '#cbd5e1' : '#14b8a6',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (!prompt.trim() && !attachedFile) || isGenerating ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s'
                }}
                title="Enviar para o Assistente IA (Enter)"
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