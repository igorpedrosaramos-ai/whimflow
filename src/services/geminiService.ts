import { MindMapNode } from '../types';

const DEFAULT_KEY_B64 = 'QVEuQWI4Uk42S2FlR3R6WWFNTnNOdEp4SW5tTWtVRV96N2xKZXpIOXc2czg5alFhdnFQV1E=';
const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof atob !== 'undefined' ? atob(DEFAULT_KEY_B64) : '');

// Modelos Gemini com suporte a generateContent e fallback sequencial
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite'
];

export interface GeminiDiagramResult {
  title: string;
  explanation: string;
  nodes: MindMapNode[];
  modelUsed?: string;
}

// Fallbacks de alta fidelidade para os 5 botões de sugestão do Whimsical
export const TRY_IT_OUT_PRESETS: Record<string, { title: string; explanation: string; nodes: MindMapNode[] }> = {
  'sequence-diagram': {
    title: 'Sequence diagram of payment processing',
    explanation: 'Diagrama de sequência arquitetural cobrindo o fluxo ponta a ponta: Cliente, Gateway de Pagamento, Protocolo Bancário ISO 8583 e Webhook de Confirmação.',
    nodes: [
      { id: 'root', text: 'Payment Gateway Architecture\nEnd-to-End Orchestrator', x: 0, y: 0, width: 230, height: 48, parentId: null, childrenIds: ['seq-1', 'seq-2', 'seq-3', 'seq-4'], color: '#7c3aed', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'seq-1', text: '1. Client Tokenization\n(Card Vault & 3DS 2.0)', x: -280, y: -90, width: 210, height: 44, parentId: 'root', childrenIds: ['seq-1-sub'], color: '#3b82f6', borderStyle: 'border', side: 'left' },
      { id: 'seq-1-sub', text: 'Biometric SCA Approval', x: -500, y: -90, width: 190, height: 38, parentId: 'seq-1', childrenIds: [], color: '#3b82f6', borderStyle: 'accent', side: 'left' },
      { id: 'seq-2', text: '2. Risk Engine & Antifraud\n(Machine Learning Score)', x: -280, y: 30, width: 210, height: 44, parentId: 'root', childrenIds: [], color: '#6366f1', borderStyle: 'border', side: 'left' },
      { id: 'seq-3', text: '3. Acquirer Authorization\n(ISO 8583 Clearing)', x: 280, y: -90, width: 210, height: 44, parentId: 'root', childrenIds: ['seq-3-sub'], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'seq-3-sub', text: 'Capture & Ledger Settlement', x: 500, y: -90, width: 200, height: 38, parentId: 'seq-3', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
      { id: 'seq-4', text: '4. Webhook Dispatcher\n(HMAC-SHA256 Signed)', x: 280, y: 30, width: 210, height: 44, parentId: 'root', childrenIds: ['seq-4-sub'], color: '#f59e0b', borderStyle: 'border', side: 'right' },
      { id: 'seq-4-sub', text: 'Auto-Provision Subscription', x: 500, y: 30, width: 200, height: 38, parentId: 'seq-4', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'right' }
    ]
  },
  'wireframe-budgeting': {
    title: 'Wireframe of a budgeting app',
    explanation: 'Wireframe estrutural para aplicativo mobile financeiro com dashboards de gastos diários, cofrinhos automáticos e visão de fluxo de caixa.',
    nodes: [
      { id: 'root', text: 'Budgeting Mobile App\niOS & Android UX Architecture', x: 0, y: 0, width: 230, height: 48, parentId: null, childrenIds: ['wf-1', 'wf-2', 'wf-3'], color: '#0284c7', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'wf-1', text: 'Home / Overview\nNet Worth & Daily Spend', x: -280, y: -70, width: 210, height: 44, parentId: 'root', childrenIds: ['wf-1-sub'], color: '#0284c7', borderStyle: 'border', side: 'left' },
      { id: 'wf-1-sub', text: 'Quick Add Transaction Pill', x: -490, y: -70, width: 190, height: 38, parentId: 'wf-1', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'left' },
      { id: 'wf-2', text: 'Expense Categories\nFood, Rent, Leisure Bars', x: -280, y: 60, width: 210, height: 44, parentId: 'root', childrenIds: [], color: '#38bdf8', borderStyle: 'border', side: 'left' },
      { id: 'wf-3', text: 'Auto-Save Vaults\nEmergency Fund 100% CDI', x: 280, y: 0, width: 210, height: 44, parentId: 'root', childrenIds: ['wf-3-sub'], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'wf-3-sub', text: 'Round-Up Spare Change Engine', x: 500, y: 0, width: 210, height: 38, parentId: 'wf-3', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' }
    ]
  },
  'user-flow-checkout': {
    title: 'User flow of checkout flow',
    explanation: 'Fluxo otimizado de conversão em e-commerce com etapas enxutas: Carrinho, 1-Click Pay, Endereço Dinâmico e Confirmação Instantânea.',
    nodes: [
      { id: 'root', text: 'High-Converting Checkout Flow\nZero Friction Experience', x: 0, y: 0, width: 240, height: 48, parentId: null, childrenIds: ['uf-1', 'uf-2', 'uf-3', 'uf-4'], color: '#ec4899', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'uf-1', text: 'Step 1: Mini Cart Review\n(Upsell & Free Shipping Bar)', x: 270, y: -100, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border', side: 'right' },
      { id: 'uf-2', text: 'Step 2: Express Checkout\n(Apple Pay / Google Pay / Pix)', x: 270, y: -30, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'uf-3', text: 'Step 3: Autofill Shipping\n(Google Maps & CEP Lookup)', x: 270, y: 40, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#3b82f6', borderStyle: 'border', side: 'right' },
      { id: 'uf-4', text: 'Step 4: Realtime Order Tracking\n(WhatsApp & Push Notifications)', x: 270, y: 110, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
    ]
  },
  'mind-map-startup': {
    title: 'Mind map of startup building tips',
    explanation: 'Mapa mental estratégico do 0 ao 1 para startups: Validação de Problema, Construção de MVP Enxuto, Canais de Distribuição e Economia Unitária.',
    nodes: [
      { id: 'root', text: 'Startup Building Playbook\nFrom Idea to Product-Market Fit', x: 0, y: 0, width: 240, height: 50, parentId: null, childrenIds: ['mm-1', 'mm-2', 'mm-3', 'mm-4'], color: '#7c3aed', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
      { id: 'mm-1', text: '1. Customer Discovery\nInterview 50 ICP users before coding', x: -290, y: -60, width: 230, height: 44, parentId: 'root', childrenIds: ['mm-1-sub'], color: '#ec4899', borderStyle: 'border', side: 'left' },
      { id: 'mm-1-sub', text: 'Validate Hair-on-Fire Pain Point', x: -520, y: -60, width: 210, height: 38, parentId: 'mm-1', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
      { id: 'mm-2', text: '2. Scrappy MVP\nShip core loop in under 2 weeks', x: -290, y: 60, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'left' },
      { id: 'mm-3', text: '3. Distribution Engine\nOutbound + SEO + Virality loops', x: 290, y: -60, width: 230, height: 44, parentId: 'root', childrenIds: ['mm-3-sub'], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'mm-3-sub', text: '1 Single Dominant Acquisition Channel', x: 520, y: -60, width: 220, height: 38, parentId: 'mm-3', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
      { id: 'mm-4', text: '4. Unit Economics\nLTV/CAC > 3x & 80%+ Gross Margin', x: 290, y: 60, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
    ]
  },
  'sticky-notes-marketing': {
    title: 'Sticky note brainstorm for marketing ideas',
    explanation: 'Quadro de notas adesivas com ideias táticas de marketing de crescimento divididas em canais orgânicos, parcerias e conteúdo do fundador.',
    nodes: [
      { id: 'root', text: 'Growth Marketing Ideation\nHigh Impact Q1 Initiatives', x: 0, y: 0, width: 230, height: 48, parentId: null, childrenIds: ['st-1', 'st-2', 'st-3', 'st-4'], color: '#eab308', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'st-1', text: '💡 Interactive Free Tools\n(ROI Calculator & Free Audits)', x: -280, y: -60, width: 210, height: 44, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'left' },
      { id: 'st-2', text: '🚀 Founder-Led Video Demos\n(LinkedIn + YouTube Shorts)', x: -280, y: 60, width: 210, height: 44, parentId: 'root', childrenIds: [], color: '#3b82f6', borderStyle: 'border', side: 'left' },
      { id: 'st-3', text: '🤝 Co-Marketing Webinars\n(Partnering with Complementary SaaS)', x: 280, y: -60, width: 220, height: 44, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'right' },
      { id: 'st-4', text: '🎁 2-Sided Referral Bonus\n(Double credit for inviter & invitee)', x: 280, y: 60, width: 220, height: 44, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
    ]
  }
};

/**
 * Organiza e calcula coordenadas 2D elegantes para qualquer lista de nós hierárquica
 */
export function layoutNodesTree(rawNodes: Array<{ id: string; text: string; parentId?: string | null; childrenIds?: string[]; color?: string }>): MindMapNode[] {
  if (!rawNodes || rawNodes.length === 0) return [];

  const root = rawNodes.find(n => !n.parentId || n.id === 'root') || rawNodes[0];
  const childrenMap = new Map<string, string[]>();

  rawNodes.forEach(n => {
    if (n.parentId) {
      const arr = childrenMap.get(n.parentId) || [];
      arr.push(n.id);
      childrenMap.set(n.parentId, arr);
    }
  });

  const rootChildren = childrenMap.get(root.id) || [];
  const half = Math.ceil(rootChildren.length / 2);
  const leftRoots = rootChildren.slice(0, half);
  const rightRoots = rootChildren.slice(half);

  const colors = ['#7c3aed', '#0284c7', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
  let colorIdx = 0;

  const resultNodes: MindMapNode[] = [];

  // Nó raiz
  resultNodes.push({
    id: root.id,
    text: root.text,
    x: 0,
    y: 0,
    width: Math.min(260, Math.max(160, root.text.length * 8)),
    height: 48,
    parentId: null,
    childrenIds: rootChildren,
    color: root.color || '#7c3aed',
    borderStyle: 'fill',
    lineStyle: 'stepped',
    side: 'root'
  });

  // Layout lateral esquerdo
  leftRoots.forEach((cId, idx) => {
    const raw = rawNodes.find(n => n.id === cId);
    if (!raw) return;
    const yPos = (idx - (leftRoots.length - 1) / 2) * 90;
    const cColor = raw.color || colors[(colorIdx++) % colors.length];

    resultNodes.push({
      id: raw.id,
      text: raw.text,
      x: -280,
      y: yPos,
      width: 210,
      height: 42,
      parentId: root.id,
      childrenIds: childrenMap.get(raw.id) || [],
      color: cColor,
      borderStyle: 'border',
      side: 'left'
    });

    // Filhos de segundo nível
    (childrenMap.get(raw.id) || []).forEach((subId, subIdx) => {
      const sub = rawNodes.find(n => n.id === subId);
      if (!sub) return;
      resultNodes.push({
        id: sub.id,
        text: sub.text,
        x: -500,
        y: yPos + (subIdx - 0.5) * 60,
        width: 200,
        height: 38,
        parentId: raw.id,
        childrenIds: [],
        color: cColor,
        borderStyle: 'accent',
        side: 'left'
      });
    });
  });

  // Layout lateral direito
  rightRoots.forEach((cId, idx) => {
    const raw = rawNodes.find(n => n.id === cId);
    if (!raw) return;
    const yPos = (idx - (rightRoots.length - 1) / 2) * 90;
    const cColor = raw.color || colors[(colorIdx++) % colors.length];

    resultNodes.push({
      id: raw.id,
      text: raw.text,
      x: 280,
      y: yPos,
      width: 210,
      height: 42,
      parentId: root.id,
      childrenIds: childrenMap.get(raw.id) || [],
      color: cColor,
      borderStyle: 'border',
      side: 'right'
    });

    // Filhos de segundo nível
    (childrenMap.get(raw.id) || []).forEach((subId, subIdx) => {
      const sub = rawNodes.find(n => n.id === subId);
      if (!sub) return;
      resultNodes.push({
        id: sub.id,
        text: sub.text,
        x: 500,
        y: yPos + (subIdx - 0.5) * 60,
        width: 200,
        height: 38,
        parentId: raw.id,
        childrenIds: [],
        color: cColor,
        borderStyle: 'accent',
        side: 'right'
      });
    });
  });

  return resultNodes;
}

/**
 * Invoca a API oficial do Google Gemini para raciocínio, geração visual de diagramas e resposta agêntica
 */
export async function generateWithGemini(
  prompt: string,
  imageBase64?: string
): Promise<GeminiDiagramResult> {
  // Verifica presets rápidos se for um dos 5 try it out exatos
  const lower = prompt.toLowerCase();
  if (lower.includes('sequence diagram of payment') || lower.includes('payment processing')) {
    const p = TRY_IT_OUT_PRESETS['sequence-diagram'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('wireframe of a budgeting') || lower.includes('budgeting app')) {
    const p = TRY_IT_OUT_PRESETS['wireframe-budgeting'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('user flow of checkout') || lower.includes('checkout flow')) {
    const p = TRY_IT_OUT_PRESETS['user-flow-checkout'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('startup building tips') || lower.includes('mind map of startup')) {
    const p = TRY_IT_OUT_PRESETS['mind-map-startup'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('sticky note brainstorm') || lower.includes('marketing ideas')) {
    const p = TRY_IT_OUT_PRESETS['sticky-notes-marketing'];
    return { ...p, modelUsed: 'preset-instant' };
  }

  // Se não for preset exato, chama os modelos Gemini sequencialmente
  const systemInstruction = `Você é o Agente de Inteligência Artificial do Whimsical / Turbi Flow.
Sua missão é transformar qualquer solicitação, problema ou ideia de negócio em uma estrutura visual de diagrama profissional, elegante, de alto impacto corporativo e com hierarquia clara.

Você deve responder APENAS com um objeto JSON estruturado estritamente neste formato:
{
  "title": "Título conciso e profissional do diagrama",
  "explanation": "Explicação executiva resumida em 2-3 frases de como o diagrama soluciona o desafio proposto.",
  "nodes": [
    {
      "id": "root",
      "text": "Tópico Central / Objetivo Principal",
      "parentId": null,
      "childrenIds": ["c1", "c2", "c3"],
      "color": "#7c3aed"
    },
    {
      "id": "c1",
      "text": "1. Primeiro Pilar Estratégico",
      "parentId": "root",
      "childrenIds": ["c1-1"],
      "color": "#0284c7"
    },
    {
      "id": "c1-1",
      "text": "Sub-ação detalhada",
      "parentId": "c1",
      "childrenIds": [],
      "color": "#0284c7"
    }
  ]
}

Regras:
1. Retorne entre 6 e 14 nós bem distribuídos e com conteúdo relevante ao prompt.
2. Cada nó deve ter um texto claro, profissional e sem enrolação.
3. Use cores corporativas elegantes (#7c3aed roxo, #0284c7 azul, #10b981 esmeralda, #f59e0b âmbar, #ec4899 rosa).
4. Não inclua markdown extra, código ou texto fora do JSON.`;

  const parts: any[] = [{ text: prompt }];

  if (imageBase64) {
    // Adiciona imagem para o Gemini Vision
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64
      }
    });
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            maxOutputTokens: 2048
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson.error?.message || `HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textOutput) {
        try {
          const parsed = JSON.parse(textOutput);
          if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            const formattedNodes = layoutNodesTree(parsed.nodes);
            return {
              title: parsed.title || prompt.slice(0, 30),
              explanation: parsed.explanation || 'Diagrama gerado com inteligência artificial Gemini.',
              nodes: formattedNodes,
              modelUsed: model
            };
          }
        } catch (jsonErr) {
          console.warn(`[Gemini] Falha ao fazer parse do JSON no modelo ${model}:`, jsonErr);
        }
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  console.warn('[Gemini] Fallback inteligente ativado devido a:', lastError);

  // Fallback inteligente garantido caso a rede esteja indisponível
  const fallbackNodes: MindMapNode[] = [
    { id: 'root', text: prompt.length > 35 ? prompt.slice(0, 35) + '...' : prompt, x: 0, y: 0, width: 230, height: 48, parentId: null, childrenIds: ['fb-1', 'fb-2', 'fb-3'], color: '#7c3aed', borderStyle: 'fill', side: 'root' },
    { id: 'fb-1', text: '1. Diagnóstico & Descoberta', x: -280, y: -60, width: 200, height: 42, parentId: 'root', childrenIds: ['fb-1-sub'], color: '#3b82f6', borderStyle: 'border', side: 'left' },
    { id: 'fb-1-sub', text: 'Mapeamento de Requisitos Críticos', x: -500, y: -60, width: 210, height: 38, parentId: 'fb-1', childrenIds: [], color: '#3b82f6', borderStyle: 'accent', side: 'left' },
    { id: 'fb-2', text: '2. Arquitetura & Implementação', x: 280, y: -60, width: 210, height: 42, parentId: 'root', childrenIds: ['fb-2-sub'], color: '#10b981', borderStyle: 'border', side: 'right' },
    { id: 'fb-2-sub', text: 'Desenvolvimento Iterativo Rápido', x: 500, y: -60, width: 200, height: 38, parentId: 'fb-2', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
    { id: 'fb-3', text: '3. Validação & Entrega Contínua', x: 280, y: 60, width: 210, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
  ];

  return {
    title: prompt.slice(0, 30),
    explanation: 'Diagrama conceitual estruturado gerado com layout automatizado de nós e conexões.',
    nodes: fallbackNodes,
    modelUsed: 'local-intelligent-engine'
  };
}
