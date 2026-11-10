// Serverless Backend Function para Vercel
// Protege a chave de API do Gemini no lado do servidor
import fs from 'fs';
import path from 'path';

// Modelos Gemini validados com suporte ativo a generateContent
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.8-flash',
  'gemini-3.5-flash'
];

export async function handleGenerateDiagram(body: any, apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return { status: 500, data: { error: 'Chave de API do Gemini não configurada no servidor.' } };
  }

  const { prompt, imageBase64 } = body || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return { status: 400, data: { error: 'O parâmetro prompt é obrigatório.' } };
  }

  if (prompt.length > 2500) {
    return { status: 400, data: { error: 'O prompt excede o limite máximo de 2.500 caracteres.' } };
  }

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

  const parts: any[] = [{ text: prompt.trim() }];

  if (imageBase64 && typeof imageBase64 === 'string') {
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const apiRes = await fetch(url, {
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
          if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            return {
              status: 200,
              data: {
                title: parsed.title || prompt.slice(0, 30),
                explanation: parsed.explanation || 'Diagrama gerado com inteligência artificial Gemini.',
                nodes: parsed.nodes,
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
