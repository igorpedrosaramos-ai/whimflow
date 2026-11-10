import React, { useState } from 'react';
import { 
  ChevronDown, 
  Star, 
  Search, 
  Image, 
  ArrowUp, 
  Sparkles, 
  GitBranch, 
  Smartphone, 
  Network, 
  StickyNote, 
  ExternalLink,
  Users
} from 'lucide-react';
import { Board, MindMapNode } from '../types';
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
  const isDark = theme === 'dark';

  const suggestions = [
    {
      id: 'seq-pay',
      label: 'Sequence diagram of payment processing',
      icon: <GitBranch size={15} color="#8b5cf6" />,
      title: 'Payment Processing Architecture',
      generate: () => ([
        { id: 'root', text: 'Payment Gateway Flow\nStripe & Webhook Orchestrator', x: 0, y: 0, width: 220, height: 48, parentId: null, childrenIds: ['c1', 'c2', 'c3'], color: '#7c3aed', borderStyle: 'fill' as const, lineStyle: 'stepped' as const, side: 'root' as const },
        { id: 'c1', text: '1. Client Initiates Checkout\n(Tokenized Card Data)', x: -280, y: -60, width: 200, height: 44, parentId: 'root', childrenIds: ['c1-sub'], color: '#3b82f6', borderStyle: 'border' as const, side: 'left' as const },
        { id: 'c1-sub', text: '3D Secure 2.0 Biometric Verification', x: -490, y: -60, width: 210, height: 40, parentId: 'c1', childrenIds: [], color: '#3b82f6', borderStyle: 'accent' as const, side: 'left' as const },
        { id: 'c2', text: '2. Acquire Bank Authorization\n(ISO 8583 Protocol)', x: 0, y: 120, width: 205, height: 44, parentId: 'root', childrenIds: ['c2-sub'], color: '#10b981', borderStyle: 'border' as const, side: 'root' as const },
        { id: 'c2-sub', text: 'Idempotent Ledger Settlement', x: 0, y: 200, width: 190, height: 40, parentId: 'c2', childrenIds: [], color: '#10b981', borderStyle: 'accent' as const, side: 'root' as const },
        { id: 'c3', text: '3. Webhook Event Dispatcher\n(Signed SHA-256 HMAC)', x: 280, y: -60, width: 205, height: 44, parentId: 'root', childrenIds: ['c3-sub'], color: '#f59e0b', borderStyle: 'border' as const, side: 'right' as const },
        { id: 'c3-sub', text: 'Auto-provision SaaS Subscription', x: 490, y: -60, width: 200, height: 40, parentId: 'c3', childrenIds: [], color: '#f59e0b', borderStyle: 'accent' as const, side: 'right' as const }
      ])
    },
    {
      id: 'wf-app',
      label: 'Wireframe of a budgeting app',
      icon: <Smartphone size={15} color="#0284c7" />,
      title: 'Budgeting Mobile App Prototype',
      generate: () => ([
        { id: 'root', text: 'Budgeting & Wealth App\niOS Prototype Architecture', x: 0, y: 0, width: 210, height: 48, parentId: null, childrenIds: ['b1', 'b2'], color: '#0284c7', borderStyle: 'fill' as const, side: 'root' as const },
        { id: 'b1', text: 'Expense Tracking Dashboard\nDaily & Monthly Categories', x: -280, y: 0, width: 200, height: 44, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border' as const, side: 'left' as const },
        { id: 'b2', text: 'Auto-Save Vaults & Investments\nHigh-Yield Savings Engine', x: 280, y: 0, width: 210, height: 44, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border' as const, side: 'right' as const }
      ])
    },
    {
      id: 'uf-checkout',
      label: 'User flow of checkout flow',
      icon: <GitBranch size={15} color="#ec4899" />,
      title: 'E-commerce Checkout User Flow',
      generate: () => ([
        { id: 'root', text: 'High-Converting Checkout Flow\nZero Friction Journey', x: 0, y: 0, width: 220, height: 48, parentId: null, childrenIds: ['u1', 'u2', 'u3'], color: '#ec4899', borderStyle: 'fill' as const, lineStyle: 'stepped' as const, side: 'root' as const },
        { id: 'u1', text: 'Step 1: 1-Click Apple Pay / Google Pay', x: 270, y: -70, width: 225, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border' as const, side: 'right' as const },
        { id: 'u2', text: 'Step 2: Dynamic Address Autocomplete', x: 270, y: 0, width: 225, height: 42, parentId: 'root', childrenIds: [], color: '#3b82f6', borderStyle: 'border' as const, side: 'right' as const },
        { id: 'u3', text: 'Step 3: Instant Order Confirmation & Pix', x: 270, y: 70, width: 235, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border' as const, side: 'right' as const }
      ])
    },
    {
      id: 'mm-startup',
      label: 'Mind map of startup building tips',
      icon: <Network size={15} color="#8b5cf6" />,
      title: 'Startup Execution Playbook',
      generate: () => ([
        { id: 'root', text: '0 to 1 Startup Playbook\nFrom Idea to Product-Market Fit', x: 0, y: 0, width: 220, height: 50, parentId: null, childrenIds: ['m1', 'm2', 'm3', 'm4'], color: '#7c3aed', borderStyle: 'fill' as const, lineStyle: 'bezier' as const, side: 'root' as const },
        { id: 'm1', text: '1. Customer Discovery\nTalk to 50 ICP users before coding', x: -290, y: -60, width: 230, height: 46, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border' as const, side: 'left' as const },
        { id: 'm2', text: '2. Scrappy MVP\nLaunch in 2 weeks with core loop', x: -290, y: 60, width: 220, height: 46, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border' as const, side: 'left' as const },
        { id: 'm3', text: '3. Distribution Engine\nOutbound + SEO + Word of mouth', x: 290, y: -60, width: 225, height: 46, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border' as const, side: 'right' as const },
        { id: 'm4', text: '4. Unit Economics\nLTV/CAC > 3x & 80%+ Gross Margin', x: 290, y: 60, width: 225, height: 46, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border' as const, side: 'right' as const }
      ])
    },
    {
      id: 'st-marketing',
      label: 'Sticky note brainstorm for marketing ideas',
      icon: <StickyNote size={15} color="#eab308" />,
      title: 'Growth Marketing Ideation Matrix',
      generate: () => ([
        { id: 'root', text: 'Growth Marketing Sprint\nHigh Leverage Channels', x: 0, y: 0, width: 210, height: 48, parentId: null, childrenIds: ['g1', 'g2'], color: '#eab308', borderStyle: 'fill' as const, side: 'root' as const },
        { id: 'g1', text: 'Viral Organic Loops & Referrals', x: -270, y: 0, width: 215, height: 44, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border' as const, side: 'left' as const },
        { id: 'g2', text: 'Founder-led Video Content', x: 270, y: 0, width: 200, height: 44, parentId: 'root', childrenIds: [], color: '#3b82f6', borderStyle: 'border' as const, side: 'right' as const }
      ])
    }
  ];

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const result = await generateWithGemini(prompt);
      setIsGenerating(false);
      onGenerateBoard(prompt, result.title, result.nodes);
    } catch {
      setIsGenerating(false);
      onGenerateBoard(prompt, prompt.slice(0, 30));
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
      {/* Barra Superior Autêntica Whimsical Ask Agent (Foto 3) */}
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
            Teams
          </span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <div
            data-nav="dashboard"
            onClick={onNavigateToDashboard}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            <Users size={14} color="#818cf8" />
            <span>Everyone at {workspaceName}</span>
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

      {/* Barra de Aba: New chat (Foto 3) */}
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
            borderBottom: '2px solid #0d9488',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          New chat
        </div>
      </div>

      {/* Conteúdo Central do Whimsical Ask Agent (Foto 3) */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '24px'
        }}
      >
        {/* Card: Try it out (Foto 3) */}
        {!isHideSuggestions && (
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
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
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#475569' }}>
                Try it out
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
                HIDE
              </button>
            </div>

            {/* Lista dos 5 Prompts Oficiais do Whimsical (Foto 3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {suggestions.map(item => (
                <button
                  key={item.id}
                  onClick={() => onGenerateBoard(item.label, item.title, item.generate())}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: isDark ? '#f1f5f9' : '#334155',
                    fontSize: '12.5px',
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

            <div style={{ borderTop: isDark ? '1px solid #242c3b' : '1px solid #f1f5f9', paddingTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Complex prompts use more credits.{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn more ↗</span>
              </span>
            </div>
          </div>
        )}

        {/* Input Flutuante Central do Ask Agent (Foto 3) */}
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
            gap: '12px'
          }}
        >
          <input
            type="text"
            placeholder="Ask Whimsical agent..."
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Anexar imagem de referência"
            >
              <Image size={18} />
            </button>

            <button
              onClick={handleSend}
              disabled={!prompt.trim() || isGenerating}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0d9488',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: prompt.trim() ? 'pointer' : 'default',
                opacity: prompt.trim() ? 1 : 0.5,
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.4)'
              }}
              title="Enviar prompt ao Whimsical Agent"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>

      {/* Rodapé Flutuante: Ação e Ajuda */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000
        }}
      >
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: isDark ? '#232b38' : '#ffffff',
            border: isDark ? '1px solid #333f52' : '1px solid #e2e8f0',
            color: isDark ? '#f1f5f9' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          ⚡
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: isDark ? '#232b38' : '#ffffff',
            border: isDark ? '1px solid #333f52' : '1px solid #e2e8f0',
            color: isDark ? '#f1f5f9' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          ?
        </button>
      </div>
    </div>
  );
};
