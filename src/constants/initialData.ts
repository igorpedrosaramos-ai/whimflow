import { Board, Workspace } from '../types';

export const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'ws-main', name: 'Apresentação Turbine Gestão de Delivery' },
  { id: 'ws-zozoca', name: "Zozoca's Burger" },
  { id: 'ws-amais', name: 'Amais Burger' },
  { id: 'ws-onegai', name: 'Onegai Sushi' },
  { id: 'ws-private', name: 'Área Privada', isPrivate: true }
];

export const INITIAL_BOARD: Board = {
  id: 'board-turbine',
  title: 'Turbine Gestão de Delivery',
  workspaceId: 'ws-main',
  updatedAt: new Date().toISOString(),
  mindMapNodes: [
    {
      id: 'root',
      text: 'Turbine Gestão de Delivery',
      x: 0,
      y: 0,
      width: 250,
      height: 60,
      parentId: null,
      childrenIds: ['node-intro', 'node-desafios', 'node-diferenciais', 'node-gestao', 'node-invest', 'node-resp'],
      collapsed: false,
      color: '#1e293b',
      side: 'root'
    },
    // Ramo 1: Introdução (3 subitens)
    {
      id: 'node-intro',
      text: 'Introdução',
      x: 320,
      y: -220,
      width: 160,
      height: 42,
      parentId: 'root',
      childrenIds: ['intro-1', 'intro-2', 'intro-3'],
      collapsed: true,
      color: '#6366f1', // Indigo / Purple
      side: 'right'
    },
    {
      id: 'intro-1',
      text: 'Visão Geral da Operação',
      x: 540,
      y: -260,
      parentId: 'node-intro',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'intro-2',
      text: 'Objetivos Estratégicos',
      x: 540,
      y: -220,
      parentId: 'node-intro',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'intro-3',
      text: 'Mapeamento de Gargalos',
      x: 540,
      y: -180,
      parentId: 'node-intro',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },

    // Ramo 2: Desafios do Mercado (4 subitens)
    {
      id: 'node-desafios',
      text: 'Desafios do Mercado',
      x: 320,
      y: -130,
      width: 190,
      height: 42,
      parentId: 'root',
      childrenIds: ['desafio-1', 'desafio-2', 'desafio-3', 'desafio-4'],
      collapsed: true,
      color: '#6366f1',
      side: 'right'
    },
    {
      id: 'desafio-1',
      text: 'Comissões Abusivas em Apps (25-30%)',
      x: 570,
      y: -180,
      parentId: 'node-desafios',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'desafio-2',
      text: 'Taxa Elevada de Cancelamento e Atraso',
      x: 570,
      y: -145,
      parentId: 'node-desafios',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'desafio-3',
      text: 'Falta de Retenção de Clientes Diretos',
      x: 570,
      y: -110,
      parentId: 'node-desafios',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'desafio-4',
      text: 'Margem Operacional Comprimida',
      x: 570,
      y: -75,
      parentId: 'node-desafios',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },

    // Ramo 3: Diferenciais da Turbine (4 subitens)
    {
      id: 'node-diferenciais',
      text: 'Diferenciais da Turbine',
      x: 320,
      y: -40,
      width: 200,
      height: 42,
      parentId: 'root',
      childrenIds: ['dif-1', 'dif-2', 'dif-3', 'dif-4'],
      collapsed: true,
      color: '#6366f1',
      side: 'right'
    },
    {
      id: 'dif-1',
      text: 'Roteirização Inteligente de Frotas',
      x: 580,
      y: -85,
      parentId: 'node-diferenciais',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'dif-2',
      text: 'Painel de Indicadores em Tempo Real',
      x: 580,
      y: -50,
      parentId: 'node-diferenciais',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'dif-3',
      text: 'Redução Média de 28% no Custo por Entrega',
      x: 580,
      y: -15,
      parentId: 'node-diferenciais',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'dif-4',
      text: 'Consultoria Especializada de Cardápio',
      x: 580,
      y: 20,
      parentId: 'node-diferenciais',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },

    // Ramo 4: Gestão Estratégica Turbine Delivery (4 subitens)
    {
      id: 'node-gestao',
      text: 'Gestão Estratégica Turbine Delivery',
      x: 320,
      y: 50,
      width: 270,
      height: 42,
      parentId: 'root',
      childrenIds: ['gest-1', 'gest-2', 'gest-3', 'gest-4'],
      collapsed: true,
      color: '#6366f1',
      side: 'right'
    },
    {
      id: 'gest-1',
      text: 'Auditoria e Otimização do Tempo de KDS/Cozinha',
      x: 650,
      y: 10,
      parentId: 'node-gestao',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'gest-2',
      text: 'Engenharia de Cardápio com Foco em Margem Líquida',
      x: 650,
      y: 45,
      parentId: 'node-gestao',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'gest-3',
      text: 'Capacitação Contínua dos Operadores e Despachantes',
      x: 650,
      y: 80,
      parentId: 'node-gestao',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'gest-4',
      text: 'Centralização de Pedidos e Roteamento Multicanal',
      x: 650,
      y: 115,
      parentId: 'node-gestao',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },

    // Ramo 5: Investimento (5 subitens) - TEAL / CYAN como na imagem!
    {
      id: 'node-invest',
      text: 'Investimento',
      x: 320,
      y: 140,
      width: 160,
      height: 42,
      parentId: 'root',
      childrenIds: ['inv-1', 'inv-2', 'inv-3', 'inv-4', 'inv-5'],
      collapsed: true,
      color: '#0d9488', // Teal
      side: 'right'
    },
    {
      id: 'inv-1',
      text: 'Setup Inicial e Parametrização Técnica',
      x: 540,
      y: 80,
      parentId: 'node-invest',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'inv-2',
      text: 'Mensalidade Fixa por Unidade Produtiva',
      x: 540,
      y: 115,
      parentId: 'node-invest',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'inv-3',
      text: 'Retorno Sobre Investimento (ROI Estimado em 60 dias)',
      x: 540,
      y: 150,
      parentId: 'node-invest',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'inv-4',
      text: 'Plano com Desconto Progressivo para Redes',
      x: 540,
      y: 185,
      parentId: 'node-invest',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'inv-5',
      text: 'Sem Cláusula de Fidelidade Abusiva',
      x: 540,
      y: 220,
      parentId: 'node-invest',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },

    // Ramo 6: Responsabilidade do Cliente (6 subitens)
    {
      id: 'node-resp',
      text: 'Responsabilidade do Cliente',
      x: 320,
      y: 230,
      width: 230,
      height: 42,
      parentId: 'root',
      childrenIds: ['resp-1', 'resp-2', 'resp-3', 'resp-4', 'resp-5', 'resp-6'],
      collapsed: true,
      color: '#6366f1',
      side: 'right'
    },
    {
      id: 'resp-1',
      text: 'Fornecimento dos Dados Históricos de Vendas',
      x: 610,
      y: 150,
      parentId: 'node-resp',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'resp-2',
      text: 'Designação de um Ponto Focal de Operações',
      x: 610,
      y: 185,
      parentId: 'node-resp',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'resp-3',
      text: 'Padronização de Embalagens e Lacres Térmicos',
      x: 610,
      y: 220,
      parentId: 'node-resp',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'resp-4',
      text: 'Cumprimento Rigoroso do Tempo de Liberação de Pedido',
      x: 610,
      y: 255,
      parentId: 'node-resp',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'resp-5',
      text: 'Acompanhamento do Painel Diário de Metas',
      x: 610,
      y: 290,
      parentId: 'node-resp',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    },
    {
      id: 'resp-6',
      text: 'Alinhamento Semanal de SLA com a Equipe de Despacho',
      x: 610,
      y: 325,
      parentId: 'node-resp',
      childrenIds: [],
      collapsed: false,
      color: '#818cf8',
      side: 'right'
    }
  ],
  shapes: [],
  connectors: [],
  stickies: [],
  wireframes: [],
  texts: [],
  drawings: []
};
