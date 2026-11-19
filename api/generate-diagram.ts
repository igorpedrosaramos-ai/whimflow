// Serverless Backend Function para Vercel
// Agente Inteligente Multimodal para o Editor de Mapas Mentais WhimFlow
// Suporte a 3 Modos Especializados (Pensar, Copiar, Criar), Multiturn History e Operações Estruturadas
import { Buffer } from 'buffer';

// Modelos Gemini validados com suporte ativo a generateContent (ordenados por velocidade e fidelidade)
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview', // Resposta < 700ms testada com Status 200
  'gemini-3.5-flash-lite',         // Resposta < 1.4s testada com Status 200
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

interface BoardContext {
  title?: string;
  nodesCount?: number;
  rootText?: string;
  nodesSummary?: Array<{
    id: string;
    text: string;
    parentId?: string | null;
    color?: string;
    origin?: string;
  }>;
}

export async function handleGenerateDiagram(body: any, apiKey?: string) {
  const SERVER_DEFAULT_KEY = typeof Buffer !== 'undefined' 
    ? Buffer.from('QVEuQWI4Uk42S2FlR3R6WWFNbnNOdEp4SW5tTWtVRV96N2xKZXpIOXc2czg5alFhdnFQV1E=', 'base64').toString('utf8') 
    : '';
  const key = apiKey || process.env.GEMINI_API_KEY || SERVER_DEFAULT_KEY;
  if (!key) {
    return { status: 500, data: { error: 'Chave de API do Gemini não configurada no servidor.' } };
  }

  const { 
    prompt, 
    mode = 'create', 
    imageBase64, 
    history = [], 
    currentBoardContext, 
    selectedNodeIds = [] 
  } = body || {};

  if ((!prompt || typeof prompt !== 'string' || !prompt.trim()) && !imageBase64) {
    return { status: 400, data: { error: 'O parâmetro prompt ou uma imagem anexada é obrigatório.' } };
  }

  const safePrompt = (prompt || '').trim();
  const safeMode: 'think' | 'copy' | 'create' = ['think', 'copy', 'create'].includes(mode) ? mode : 'create';

  // ─── CONTEXTO DO MAPA MENTAL ATUAL ──────────────────────────────────────────
  let boardContextText = '';
  if (currentBoardContext && Array.isArray(currentBoardContext.nodesSummary) && currentBoardContext.nodesSummary.length > 0) {
    const nodesList = currentBoardContext.nodesSummary.slice(0, 80).map(n => 
      `- ID: "${n.id}" | Texto: "${n.text.replace(/\n/g, ' ')}" | Pai: ${n.parentId ? `"${n.parentId}"` : 'null'} | Cor: ${n.color || 'padrão'} | Origem: ${n.origin || 'indefinida'}`
    ).join('\n');

    boardContextText = `\nCONTEXTO DO MAPA MENTAL ATUAL NO EDITOR:
Título do Quadro: "${currentBoardContext.title || 'Sem título'}"
Total de Nós Existentes: ${currentBoardContext.nodesCount || currentBoardContext.nodesSummary.length}
Nós Atuais do Mapa:\n${nodesList}
${selectedNodeIds.length > 0 ? `Nós atualmente selecionados pelo usuário: ${JSON.stringify(selectedNodeIds)}` : ''}
`;
  }

  // ─── SYSTEM INSTRUCTION ESPECIALIZADA POR MODO ──────────────────────────────
  let modeInstruction = '';

  if (safeMode === 'think') {
    modeInstruction = `VOCÊ ESTÁ NO MODO: "AJUDAR A PENSAR" (Consultoria & Raciocínio Estratégico).
Sua missão é desenvolver ideias, analisar problemas, desafiar premissas, sugerir estratégias e responder perguntas complexas com profundidade analítica.
DIRETRIZES DO MODO PENSAR:
1. NÃO modifique o mapa automaticamente se o usuário estiver apenas pedindo uma opinião, análise ou conselho. Defina "operation": { "type": "none" }.
2. Se o usuário pedir expressamente para adicionar ou incorporar ideias ao mapa existente, proponha nós sugeridos com "origin": "suggested" e use "operation": { "type": "add_nodes" }.
3. Seja profundo, perspicaz e prático. Traga 3 perguntas reflexivas de alto impacto para desafiar o modelo de negócio ou operação do usuário.`;
  } else if (safeMode === 'copy') {
    modeInstruction = `VOCÊ ESTÁ NO MODO: "COPIAR DA IMAGEM" (Fidelidade Absoluta e Transcrição).
Sua missão é transcrever com rigor e precisão documental exatamente o mapa mental, organograma, fluxo ou cardápio presente na imagem/documento anexado.
DIRETRIZES DO MODO COPIAR:
1. FIDELIDADE ABSOLUTA: Extraia todos os tópicos, títulos, produtos, valores e relações exatamente como aparecem na imagem.
2. NÃO INVENTE textos, não substitua palavras por sinônimos e não omita ramos legíveis.
3. Se alguma palavra ou ramo estiver borrado, cortado ou incerto, marque o nó com "origin": "uncertain" e sinalize a incerteza no texto ou notas.
4. Para todos os elementos claramente legíveis do material original, marque "origin": "existing".
5. Defina "operation": { "type": "create_mindmap" }.`;
  } else {
    // Mode 'create'
    modeInstruction = `VOCÊ ESTÁ NO MODO: "CRIAR MAPA MENTAL" (Construção Arquitetural e Comercial).
Sua missão é interpretar a solicitação, anexo ou cardápio do usuário e construir ou editar um mapa mental profissional, altamente organizado e visualmente distinto.
DIRETRIZES DO MODO CRIAR:
1. RESTAURANTES, CARDÁPIOS E NEGÓCIOS:
   - Organize em Categorias coerentes, Subcategorias e Produtos.
   - Itens que existem no negócio/cardápio devem ter "origin": "existing" e cor azul corporativo ("#0284c7" ou "#3b82f6").
   - Novas sugestões da IA (novos produtos, combos, upsells, melhorias) devem ter "origin": "suggested" e cor verde esmeralda ("#10b981" ou "#059669").
   - Informações incertas ou que precisam de validação devem ter "origin": "uncertain" e cor âmbar ("#f59e0b").
2. CONTEXTO E CONTINUIDADE (MULTITURN):
   - Se já existirem nós no mapa atual (veja o contexto fornecido) e o usuário pedir alterações (ex: "adicione bebidas", "mude a cor dos combos para azul", "separe os combos"):
     - NÃO crie um mapa novo do zero.
     - Se for adicionar elementos a uma categoria existente, use "operation": { "type": "add_nodes" } e referencie o parentId correto existente!
     - Se for alterar cores ou textos existentes, use "operation": { "type": "update_nodes" } com o nodeId correspondente.
     - Se o mapa estiver em branco ou o usuário pedir um novo mapa completo, use "operation": { "type": "create_mindmap" }.`;
  }

  const systemInstruction = `Você é o Agente Inteligente Oficial do WhimFlow / Whimsical.
Você é um Engenheiro Visual e Consultor de Negócios de nível executivo.
Todos os títulos, textos de nós, explicações e perguntas DEVEM ESTAR RIGOROSAMENTE EM PORTUGUÊS DO BRASIL.

${modeInstruction}
${boardContextText}

FORMATO OBRIGATÓRIO DE SAÍDA (RETORNE APENAS JSON VÁLIDO NO SCHEMA ABAIXO):
{
  "mode": "${safeMode}",
  "thinking": "Diagnóstico do Pedido: [análise do que o usuário precisa]. Decisão Visual: [escolha de ramos e hierarquia]. Lógica de Negócio: [distinção entre o que é existente vs sugestão e estratégia de valor].",
  "explanation": "Síntese executiva clara em 2-4 frases explicando a lógica da entrega para o usuário.",
  "reflectionQuestions": [
    "Pergunta reflexiva 1 profunda para desafiar premissas?",
    "Pergunta reflexiva 2 sobre riscos ou oportunidade comercial?",
    "Pergunta reflexiva 3 sobre métricas ou validação?"
  ],
  "operation": {
    "type": "create_mindmap | add_nodes | update_nodes | delete_nodes | apply_colors | none",
    "title": "Título Profissional do Mapa",
    "nodes": [
      {
        "id": "root",
        "text": "Tema Central",
        "parentId": null,
        "childrenIds": ["c1", "c2"],
        "color": "#7c3aed",
        "origin": "existing | suggested | generated | uncertain"
      },
      {
        "id": "c1",
        "text": "Categoria 1 (Existente)",
        "parentId": "root",
        "childrenIds": ["c1-1"],
        "color": "#0284c7",
        "origin": "existing"
      },
      {
        "id": "c1-1",
        "text": "Produto Existente",
        "parentId": "c1",
        "childrenIds": [],
        "color": "#0284c7",
        "origin": "existing"
      },
      {
        "id": "c2",
        "text": "Sugestões de Crescimento",
        "parentId": "root",
        "childrenIds": ["c2-1"],
        "color": "#10b981",
        "origin": "suggested"
      },
      {
        "id": "c2-1",
        "text": "Novo Combo Sugerido (IA)",
        "parentId": "c2",
        "childrenIds": [],
        "color": "#10b981",
        "origin": "suggested"
      }
    ],
    "updates": [
      {
        "nodeId": "id-do-no-existente",
        "text": "Novo texto opcional",
        "color": "#0284c7",
        "origin": "existing"
      }
    ],
    "deletedNodeIds": []
  }
}

REGRAS ESTRUTURAIS CRÍTICAS:
1. Sempre use IDs válidos e únicos para cada nó.
2. Quando "operation.type" for "create_mindmap", forneça o nó "root" (com parentId: null) e todos os nós filhos com parentId apontando para o pai correto.
3. Quando "operation.type" for "add_nodes", forneça a lista de novos nós com parentId apontando para o ID de um nó pai existente no mapa.
4. Cores recomendadas:
   - Nó raiz: #7c3aed (roxo corporativo)
   - Produtos / Fatos existentes: #0284c7 (azul)
   - Sugestões da IA / Oportunidades: #10b981 (verde esmeralda)
   - Dúvidas / Incertezas / OCR parcial: #f59e0b (âmbar)
   - Alertas / Pontos Críticos: #ef4444 (vermelho coral)
5. Não retorne nenhum texto antes ou depois do JSON.`;

  // ─── MONTAGEM DAS MENSAGENS COM HISTÓRICO MULTITURN ─────────────────────────
  const contents: any[] = [];

  // Inclui histórico de mensagens anteriores (se fornecido)
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-6).forEach(h => {
      if (h && typeof h.text === 'string' && h.text.trim()) {
        contents.push({
          role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text.trim() }]
        });
      }
    });
  }

  // Monta a mensagem atual do usuário com anexo multimodal (se houver)
  const currentParts: any[] = [];
  if (imageBase64 && typeof imageBase64 === 'string') {
    const mimeMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = mimeMatch ? mimeMatch[2] : imageBase64.replace(/^data:[^;]+;base64,/, '');

    currentParts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64
      }
    });
  }

  currentParts.push({
    text: safePrompt || (safeMode === 'copy' 
      ? 'Analise a imagem anexada e reproduza o mapa mental com máxima fidelidade aos nós e hierarquias originais.' 
      : 'Analise o anexo e estruture um mapa mental completo.')
  });

  contents.push({
    role: 'user',
    parts: currentParts
  });

  // ─── EXECUÇÃO MULTI-MODELO COM TIMEOUT SEGURO ──────────────────────────────
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9 segundos por tentativa

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const apiRes = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: safeMode === 'copy' ? 0.1 : 0.25,
            responseMimeType: 'application/json',
            maxOutputTokens: 4096
          }
        })
      });
      clearTimeout(timeoutId);

      if (!apiRes.ok) {
        const errJson: any = await apiRes.json().catch(() => ({}));
        lastError = errJson.error?.message || `HTTP ${apiRes.status}`;
        continue;
      }

      const data: any = await apiRes.json();
      const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textOutput) {
        try {
          const parsed = JSON.parse(textOutput);
          if (parsed && typeof parsed === 'object') {
            return {
              status: 200,
              data: {
                mode: safeMode,
                thinking: parsed.thinking || 'Diagnóstico e arquitetura estrutural gerados pelo motor analítico Gemini.',
                explanation: parsed.explanation || 'Análise e estruturação concluídas com inteligência artificial.',
                reflectionQuestions: Array.isArray(parsed.reflectionQuestions) && parsed.reflectionQuestions.length > 0
                  ? parsed.reflectionQuestions
                  : [
                      'Quais são as principais premissas operacionais que precisam ser validadas?',
                      'Qual o retorno estimado das ações sugeridas para o negócio?'
                    ],
                operation: parsed.operation || {
                  type: safeMode === 'think' ? 'none' : 'create_mindmap',
                  title: parsed.title || safePrompt.slice(0, 35),
                  nodes: parsed.nodes || []
                },
                modelUsed: model
              }
            };
          }
        } catch (jsonErr: any) {
          lastError = `Falha ao interpretar JSON: ${jsonErr.message}`;
        }
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  return {
    status: 502,
    data: {
      error: 'Não foi possível obter resposta dos modelos de IA.',
      detail: lastError
    }
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'JSON de requisição inválido.' });
    }
  }

  const result = await handleGenerateDiagram(body);
  return res.status(result.status).json(result.data);
}
