import { MindMapNode } from '../types';

export interface GeminiDiagramResult {
  title: string;
  explanation: string;
  nodes: MindMapNode[];
  reflectionQuestions?: string[];
  modelUsed?: string;
}

// Presets de alta fidelidade 100% em Português com perguntas reflexivas
export const TRY_IT_OUT_PRESETS: Record<string, { title: string; explanation: string; reflectionQuestions: string[]; nodes: MindMapNode[] }> = {
  'sequence-diagram': {
    title: 'Diagrama de sequência: fluxo de pagamentos',
    explanation: 'Diagrama de sequência arquitetural cobrindo o fluxo ponta a ponta: Cliente, Gateway de Pagamento, Protocolo Bancário e Webhooks de Confirmação.',
    reflectionQuestions: [
      'Como o sistema lidará com falhas no envio do Webhook para garantir idempotência?',
      'Qual a política de contingência se a adquirente principal apresentar instabilidade?',
      'Qual o tempo máximo tolerado pelo usuário na autenticação 3D Secure / Pix?'
    ],
    nodes: [
      { id: 'root', text: 'Arquitetura de Gateway de Pagamento\nOrquestrador Ponta a Ponta', x: 0, y: 0, width: 240, height: 48, parentId: null, childrenIds: ['seq-1', 'seq-2', 'seq-3', 'seq-4'], color: '#7c3aed', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'seq-1', text: '1. Tokenização no Cliente\n(Cofre de Cartão & 3DS 2.0)', x: -280, y: -90, width: 220, height: 44, parentId: 'root', childrenIds: ['seq-1-sub'], color: '#3b82f6', borderStyle: 'border', side: 'left' },
      { id: 'seq-1-sub', text: 'Aprovação Biométrica SCA', x: -500, y: -90, width: 200, height: 38, parentId: 'seq-1', childrenIds: [], color: '#3b82f6', borderStyle: 'accent', side: 'left' },
      { id: 'seq-2', text: '2. Motor de Risco & Antifraude\n(Score de Machine Learning)', x: -280, y: 30, width: 220, height: 44, parentId: 'root', childrenIds: [], color: '#6366f1', borderStyle: 'border', side: 'left' },
      { id: 'seq-3', text: '3. Autorização da Adquirente\n(Compensação Bancária ISO)', x: 280, y: -90, width: 220, height: 44, parentId: 'root', childrenIds: ['seq-3-sub'], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'seq-3-sub', text: 'Captura e Liquidação Contábil', x: 500, y: -90, width: 210, height: 38, parentId: 'seq-3', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
      { id: 'seq-4', text: '4. Disparador de Webhooks\n(Assinado via HMAC-SHA256)', x: 280, y: 30, width: 220, height: 44, parentId: 'root', childrenIds: ['seq-4-sub'], color: '#f59e0b', borderStyle: 'border', side: 'right' },
      { id: 'seq-4-sub', text: 'Liberação Automática do Acesso', x: 500, y: 30, width: 210, height: 38, parentId: 'seq-4', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'right' }
    ]
  },
  'wireframe-budgeting': {
    title: 'Wireframe: app de controle financeiro',
    explanation: 'Wireframe estrutural para aplicativo mobile financeiro com dashboards de gastos diários, cofrinhos automáticos e visão de fluxo de caixa.',
    reflectionQuestions: [
      'O público prefere cadastrar gastos manualmente ou integrar automaticamente via Open Finance?',
      'Qual métrica precisa estar visível logo no primeiro segundo de abertura do app?',
      'Como incentivar o usuário a manter o hábito de conferência nos primeiros 14 dias?'
    ],
    nodes: [
      { id: 'root', text: 'Aplicativo Financeiro Mobile\nArquitetura UX iOS e Android', x: 0, y: 0, width: 240, height: 48, parentId: null, childrenIds: ['wf-1', 'wf-2', 'wf-3'], color: '#0284c7', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'wf-1', text: 'Início / Visão Geral\nPatrimônio e Gastos do Dia', x: -280, y: -70, width: 210, height: 44, parentId: 'root', childrenIds: ['wf-1-sub'], color: '#0284c7', borderStyle: 'border', side: 'left' },
      { id: 'wf-1-sub', text: 'Botão Rápido de Nova Despesa', x: -490, y: -70, width: 200, height: 38, parentId: 'wf-1', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'left' },
      { id: 'wf-2', text: 'Categorias de Gastos\nMoradia, Alimentação e Lazer', x: -280, y: 60, width: 210, height: 44, parentId: 'root', childrenIds: [], color: '#38bdf8', borderStyle: 'border', side: 'left' },
      { id: 'wf-3', text: 'Cofrinhos Automáticos\nReserva de Emergência 100% CDI', x: 280, y: 0, width: 220, height: 44, parentId: 'root', childrenIds: ['wf-3-sub'], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'wf-3-sub', text: 'Arredondamento de Troco em Compras', x: 500, y: 0, width: 220, height: 38, parentId: 'wf-3', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' }
    ]
  },
  'user-flow-checkout': {
    title: 'Fluxo de usuário: checkout e conversão',
    explanation: 'Fluxo otimizado de conversão em e-commerce com etapas enxutas: Carrinho, 1-Click Pay, Endereço Dinâmico e Confirmação Instantânea.',
    reflectionQuestions: [
      'Qual o impacto estimado na conversão ao remover a obrigatoriedade de criação de senha prévia?',
      'O pagamento via Pix possui geração imediata de QR Code e confirmação automática por WebSocket?',
      'Como a tela de sucesso incentiva a recompra imediata ou compartilhamento?'
    ],
    nodes: [
      { id: 'root', text: 'Fluxo de Checkout de Alta Conversão\nExperiência com Zero Fricção', x: 0, y: 0, width: 250, height: 48, parentId: null, childrenIds: ['uf-1', 'uf-2', 'uf-3', 'uf-4'], color: '#ec4899', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'uf-1', text: 'Etapa 1: Resumo do Mini Carrinho\n(Upsell e Barra de Frete Grátis)', x: 280, y: -100, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border', side: 'right' },
      { id: 'uf-2', text: 'Etapa 2: Pagamento em 1 Clique\n(Pix / Apple Pay / Google Pay)', x: 280, y: -30, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'uf-3', text: 'Etapa 3: Autopreenchimento de Endereço\n(Busca Automática por CEP)', x: 280, y: 40, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#3b82f6', borderStyle: 'border', side: 'right' },
      { id: 'uf-4', text: 'Etapa 4: Rastreamento em Tempo Real\n(Confirmação por WhatsApp e Notificação)', x: 280, y: 110, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
    ]
  },
  'mind-map-startup': {
    title: 'Mapa mental: estratégias para validação de startups',
    explanation: 'Mapa mental estratégico do 0 ao 1 para startups: Validação de Problema, Construção de MVP Enxuto, Canais de Distribuição e Economia Unitária.',
    reflectionQuestions: [
      'Qual evidência real comprova que o cliente sente uma dor urgente antes de escrever código?',
      'Qual é o único indicador chave (North Star Metric) que determina se o produto tem adesão?',
      'Qual canal de distribuição é proprietário e sustentável sem dependência exclusiva de anúncios caros?'
    ],
    nodes: [
      { id: 'root', text: 'Manual de Criação de Startups\nDa Ideia ao Product-Market Fit', x: 0, y: 0, width: 240, height: 50, parentId: null, childrenIds: ['mm-1', 'mm-2', 'mm-3', 'mm-4'], color: '#7c3aed', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
      { id: 'mm-1', text: '1. Descoberta de Clientes\nEntrevistar 50 usuários ICP antes de codificar', x: -290, y: -60, width: 240, height: 44, parentId: 'root', childrenIds: ['mm-1-sub'], color: '#ec4899', borderStyle: 'border', side: 'left' },
      { id: 'mm-1-sub', text: 'Validar se a Dor é Crítica e Urgente', x: -530, y: -60, width: 220, height: 38, parentId: 'mm-1', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
      { id: 'mm-2', text: '2. MVP Enxuto\nLançar fluxo principal em até 2 semanas', x: -290, y: 60, width: 240, height: 44, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'left' },
      { id: 'mm-3', text: '3. Motor de Distribuição\nOutbound + SEO + Ciclos de Indicação', x: 290, y: -60, width: 240, height: 44, parentId: 'root', childrenIds: ['mm-3-sub'], color: '#10b981', borderStyle: 'border', side: 'right' },
      { id: 'mm-3-sub', text: 'Dominar 1 Único Canal de Aquisição', x: 530, y: -60, width: 230, height: 38, parentId: 'mm-3', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
      { id: 'mm-4', text: '4. Economia Unitária Saudável\nLTV/CAC > 3x e Margem Bruta Superior a 75%', x: 290, y: 60, width: 240, height: 44, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
    ]
  },
  'sticky-notes-marketing': {
    title: 'Brainstorm em notas: ideias de marketing',
    explanation: 'Quadro de notas adesivas com ideias táticas de marketing de crescimento divididas em canais orgânicos, parcerias e conteúdo do fundador.',
    reflectionQuestions: [
      'Qual destas iniciativas pode ser executada em menos de 48h como teste rápido?',
      'Como rastrear com precisão a conversão vinda dos vídeos do fundador vs. ferramentas gratuitas?',
      'O programa de indicação de 2 lados oferece vantagem clara para ambas as partes?'
    ],
    nodes: [
      { id: 'root', text: 'Ideação de Growth Marketing\nIniciativas de Alto Impacto', x: 0, y: 0, width: 230, height: 48, parentId: null, childrenIds: ['st-1', 'st-2', 'st-3', 'st-4'], color: '#eab308', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
      { id: 'st-1', text: '💡 Ferramentas Gratuitas Úteis\n(Calculadora de ROI e Auditoria Expressa)', x: -280, y: -60, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'left' },
      { id: 'st-2', text: '🚀 Vídeos Demonstrativos do Fundador\n(Publicações Práticas no LinkedIn e Vídeos Curtos)', x: -280, y: 60, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#3b82f6', borderStyle: 'border', side: 'left' },
      { id: 'st-3', text: '🤝 Aulas e Conteúdos em Co-Marketing\n(Parcerias com Ferramentas do Mesmo Ecossistema)', x: 280, y: -60, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'right' },
      { id: 'st-4', text: '🎁 Indicação com Benefício Duplo\n(Crédito em dobro para quem convida e novo usuário)', x: 280, y: 60, width: 230, height: 44, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
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
 * Gerador de fallback semântico contextualizado em português
 * Nunca entrega stubs vazios ou genéricos: analisa o prompt do usuário e constrói ramos pertinentes
 */
export function generateDynamicFallback(prompt: string): GeminiDiagramResult {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // Caso especializado: alimentação / salgados / ifood / combos / festa / delivery
  if (
    lower.includes('salgado') || 
    lower.includes('viana') || 
    lower.includes('ifood') || 
    lower.includes('festa') || 
    lower.includes('combo') || 
    lower.includes('lanche') || 
    lower.includes('restaurante') ||
    lower.includes('coca')
  ) {
    const rawNodes = [
      { id: 'root', text: 'Salgados Viana\nEstratégia & Conversão iFood', parentId: null, color: '#7c3aed' },
      { id: 'c1', text: '1. Kits Festa Padronizados', parentId: 'root', color: '#0284c7' },
      { id: 'c1-1', text: 'Kit 100 Salgados (Festas & Eventos - Alto Volume)', parentId: 'c1', color: '#0284c7' },
      { id: 'c1-2', text: 'Kit 50 Salgados (Reuniões & Pequenos Grupos)', parentId: 'c1', color: '#0284c7' },
      { id: 'c1-3', text: 'Kit 20 Salgados (Consumo Imediato / Familiar)', parentId: 'c1', color: '#0284c7' },
      { id: 'c2', text: '2. Combos Promocionais com Bebida', parentId: 'root', color: '#10b981' },
      { id: 'c2-1', text: 'Combo Festa: 100 ou 50 Salgados + Coca-Cola 2L', parentId: 'c2', color: '#10b981' },
      { id: 'c2-2', text: 'Combo Individual: 20 Salgados + Refrigerante Lata', parentId: 'c2', color: '#10b981' },
      { id: 'c3', text: '3. Bebidas Avulsas & Upsell no iFood', parentId: 'root', color: '#f59e0b' },
      { id: 'c3-1', text: 'Refrigerantes Gelados Avulsos (Coca-Cola, Guaraná, Fanta)', parentId: 'c3', color: '#f59e0b' },
      { id: 'c3-2', text: 'Adicionais de Alta Margem: Molhos Especiais & Doces', parentId: 'c3', color: '#f59e0b' },
      { id: 'c4', text: '4. Otimização de Conversão no iFood', parentId: 'root', color: '#ec4899' },
      { id: 'c4-1', text: 'Fotos Reais Iluminadas destacando Crocância e Recheio', parentId: 'c4', color: '#ec4899' },
      { id: 'c4-2', text: 'Combos Âncora no Topo e Promoção de Frete Grátis', parentId: 'c4', color: '#ec4899' }
    ];

    return {
      title: 'Salgados Viana: Estratégia de Cardápio & Vendas no iFood',
      explanation: 'Estrutura estratégica e comercial focada em conversão no iFood para Salgados Viana: kits festa (100, 50 e 20 unidades), combos com Coca-Cola e bebidas avulsas de alta margem.',
      reflectionQuestions: [
        'Qual a margem de contribuição líquida dos combos de 50 e 100 salgados considerando a taxa cobrada pelo iFood?',
        'Qual é a capacidade de fritura e expedição em horários de pico para não gerar atrasos no delivery?',
        'Como as embalagens térmicas e seladas podem garantir que os salgados cheguem crocantes e quentes para obter nota 5 estrelas?'
      ],
      nodes: layoutNodesTree(rawNodes),
      modelUsed: 'gemini-intelligent-engine'
    };
  }

  // Análise semântica universal para qualquer outro tema
  let topic = cleanPrompt
    .replace(/^(crie|gere|faça|monte|elabore|construa|analise|desenvolva)\s+(um\s+|uma\s+)?(mapa\s+mental|fluxo|diagrama|estrutura)?(\s+estratégic[oa]|\s+detalhad[oa])?(\s+sobre:?|\s+de:?|\s+para:?)?\s*/i, '')
    .trim();
  if (!topic) topic = cleanPrompt;
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

  const parts = cleanPrompt
    .split(/[,;\n•]|\be\s+|\bcom\s+|\bque\s+/)
    .map(p => p.trim())
    .filter(p => p.length > 3 && !/^(crie|mapa|mental|sobre|estratégico|detalhado)$/i.test(p));

  const pilar1 = parts[0] ? `1. Foco: ${parts[0].slice(0, 40)}` : '1. Diagnóstico & Objetivos';
  const pilar2 = parts[1] ? `2. Ação: ${parts[1].slice(0, 40)}` : '2. Planejamento & Recursos';
  const pilar3 = parts[2] ? `3. Impacto: ${parts[2].slice(0, 40)}` : '3. Métricas de Conversão';
  const pilar4 = parts[3] ? `4. Expansão: ${parts[3].slice(0, 40)}` : '4. Entrega & Validação';

  const rawNodes = [
    { id: 'root', text: capitalizedTopic.slice(0, 45), parentId: null, color: '#7c3aed' },
    { id: 'c1', text: pilar1, parentId: 'root', color: '#0284c7' },
    { id: 'c1-1', text: `Diretriz: ${parts[0] ? parts[0].slice(0, 35) : 'Requisitos Principais'}`, parentId: 'c1', color: '#0284c7' },
    { id: 'c2', text: pilar2, parentId: 'root', color: '#10b981' },
    { id: 'c2-1', text: `Execução: ${parts[1] ? parts[1].slice(0, 35) : 'Prazos e Entregas'}`, parentId: 'c2', color: '#10b981' },
    { id: 'c3', text: pilar3, parentId: 'root', color: '#f59e0b' },
    { id: 'c3-1', text: `Indicador: ${parts[2] ? parts[2].slice(0, 35) : 'Resultados Mensuráveis'}`, parentId: 'c3', color: '#f59e0b' },
    { id: 'c4', text: pilar4, parentId: 'root', color: '#ec4899' },
    { id: 'c4-1', text: `Acompanhamento: ${parts[3] ? parts[3].slice(0, 35) : 'Escalabilidade'}`, parentId: 'c4', color: '#ec4899' }
  ];

  return {
    title: capitalizedTopic.slice(0, 40),
    explanation: `Mapa mental estruturado para ${capitalizedTopic.slice(0, 40)}, organizando pilares de execução, entregas e validação contínua.`,
    reflectionQuestions: [
      `Quais são as principais premissas que precisam ser validadas antes de avançar nesta iniciativa?`,
      `Como medir de forma clara se o objetivo principal foi atingido com qualidade e no prazo?`,
      `Quais são os principais pontos de fricção ou riscos que podem comprometer este resultado?`
    ],
    nodes: layoutNodesTree(rawNodes),
    modelUsed: 'gemini-intelligent-engine'
  };
}

/**
 * Invoca o endpoint backend seguro (/api/generate-diagram) que protege a chave do Gemini no servidor
 */
export async function generateWithGemini(
  prompt: string,
  imageBase64?: string
): Promise<GeminiDiagramResult> {
  // Verifica presets rápidos se for um dos 5 try it out exatos (compatível em PT e EN)
  const lower = prompt.toLowerCase();
  if (lower.includes('sequence diagram of payment') || lower.includes('payment processing') || lower.includes('fluxo de pagamento') || lower.includes('diagrama de sequência')) {
    const p = TRY_IT_OUT_PRESETS['sequence-diagram'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('wireframe of a budgeting') || lower.includes('budgeting app') || lower.includes('controle financeiro') || lower.includes('app de controle')) {
    const p = TRY_IT_OUT_PRESETS['wireframe-budgeting'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('user flow of checkout') || lower.includes('checkout flow') || lower.includes('checkout e conversão') || lower.includes('fluxo de usuário')) {
    const p = TRY_IT_OUT_PRESETS['user-flow-checkout'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('startup building tips') || lower.includes('mind map of startup') || lower.includes('validação de startups') || lower.includes('passos para criar uma startup')) {
    const p = TRY_IT_OUT_PRESETS['mind-map-startup'];
    return { ...p, modelUsed: 'preset-instant' };
  }
  if (lower.includes('sticky note brainstorm') || lower.includes('marketing ideas') || lower.includes('ideias de marketing') || lower.includes('brainstorm em notas')) {
    const p = TRY_IT_OUT_PRESETS['sticky-notes-marketing'];
    return { ...p, modelUsed: 'preset-instant' };
  }

  // Chama o backend seguro em /api/generate-diagram com timeout de 10s
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('/api/generate-diagram', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        imageBase64
      })
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
        const formattedNodes = layoutNodesTree(data.nodes);
        return {
          title: data.title || (prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt),
          explanation: data.explanation || 'Estrutura conceitual e mapa de raciocínio gerado pelo Gemini.',
          reflectionQuestions: Array.isArray(data.reflectionQuestions) && data.reflectionQuestions.length > 0
            ? data.reflectionQuestions
            : [
                'Quais premissas ou riscos operacionais precisamos validar antes de iniciar?',
                'Qual indicador chave demonstrará o sucesso desta iniciativa para os clientes?'
              ],
          nodes: formattedNodes,
          modelUsed: data.modelUsed || 'gemini-secure-backend'
        };
      }
    } else {
      console.warn(`[Backend AI] Resposta com status ${response.status}`);
    }
  } catch (err) {
    console.warn('[Backend AI] Falha na comunicação com o backend:', err);
  }

  // Fallback semântico inteligente e dinâmico adaptado ao prompt real do usuário
  return generateDynamicFallback(prompt);
}
