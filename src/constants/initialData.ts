import { Board, Workspace, MindMapNode } from '../types';

export const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'ws-main', name: 'Apresentação Turbine Gestão de Delivery' },
  { id: 'ws-onegai', name: 'Onegai Sushi' },
  { id: 'ws-zozoca', name: "Zozoca's Burger" },
  { id: 'ws-amais', name: 'Amais Burger' },
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
      color: '#6366f1',
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
      color: '#0d9488',
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

// Quadro do Cardápio Onegai (conforme imagem enviada pelo usuário!)
export const ONEGAI_BOARD: Board = {
  id: 'board-onegai',
  title: 'Cardapio Onegai',
  workspaceId: 'ws-onegai',
  updatedAt: new Date().toISOString(),
  mindMapNodes: [
    {
      id: 'root',
      text: 'Cardapio Onegai',
      x: 0,
      y: 0,
      width: 200,
      height: 52,
      parentId: null,
      childrenIds: [
        'on-pedidos',
        'on-melhor-hot',
        'on-segundo-temaki',
        'on-combinados',
        'on-yakissoba',
        'on-mini-pokes',
        'on-pokes-grandes',
        'on-ceviche',
        'on-sashimi',
        'on-uramaki',
        'on-hossomaki',
        'on-joe',
        'on-niguiri'
      ],
      collapsed: false,
      color: '#ffffff',
      side: 'root'
    },

    // 1. Os Mais Pedidos no Onegai Sushi (Laranja #f97316)
    {
      id: 'on-pedidos',
      text: 'Os Mais Pedidos no Onegai Sushi',
      x: 280,
      y: -280,
      parentId: 'root',
      childrenIds: ['ped-1', 'ped-2', 'ped-3', 'ped-4', 'ped-5', 'ped-6'],
      collapsed: false,
      color: '#f97316',
      side: 'right'
    },
    {
      id: 'ped-1',
      text: 'Combo Temaki + Coca cola 200ml',
      x: 560,
      y: -360,
      parentId: 'on-pedidos',
      childrenIds: [],
      collapsed: false,
      color: '#fb923c',
      side: 'right'
    },
    {
      id: 'ped-2',
      text: 'Yakissoba de carne',
      x: 560,
      y: -320,
      parentId: 'on-pedidos',
      childrenIds: [],
      collapsed: false,
      color: '#fb923c',
      side: 'right'
    },
    {
      id: 'ped-3',
      text: '2 Temakis Hot Roll + 12 Hot Roll',
      x: 560,
      y: -260,
      parentId: 'on-pedidos',
      childrenIds: ['sub-temaki-1', 'sub-temaki-2', 'sub-temaki-3'],
      collapsed: false,
      color: '#fb923c',
      side: 'right'
    },
    {
      id: 'sub-temaki-1',
      text: 'Por Mais R$ 19,99 Leve 1 Temaki de Salmão Grelhado',
      x: 840,
      y: -290,
      parentId: 'ped-3',
      childrenIds: [],
      collapsed: false,
      color: '#fdba74',
      side: 'right'
    },
    {
      id: 'sub-temaki-2',
      text: 'Por Mais R$ 19,99 leve + 3 Unidades de Hot Roll Salmão Grelhado',
      x: 840,
      y: -260,
      parentId: 'ped-3',
      childrenIds: [],
      collapsed: false,
      color: '#fdba74',
      side: 'right'
    },
    {
      id: 'sub-temaki-3',
      text: 'Não Desejo.',
      x: 840,
      y: -230,
      parentId: 'ped-3',
      childrenIds: [],
      collapsed: false,
      color: '#fdba74',
      side: 'right'
    },
    {
      id: 'ped-4',
      text: 'Combinado 20 peças',
      x: 560,
      y: -200,
      parentId: 'on-pedidos',
      childrenIds: [],
      collapsed: false,
      color: '#fb923c',
      side: 'right'
    },
    {
      id: 'ped-5',
      text: '24 unidades de Hot roll com 20% Off',
      x: 560,
      y: -150,
      parentId: 'on-pedidos',
      childrenIds: ['sub-24-1', 'sub-24-2', 'sub-24-3'],
      collapsed: false,
      color: '#fb923c',
      side: 'right'
    },
    {
      id: 'sub-24-1',
      text: 'Por Mais R$ 19,99 leve + 10 Unidades de Hot Roll Salmão Grelhado',
      x: 860,
      y: -180,
      parentId: 'ped-5',
      childrenIds: [],
      collapsed: false,
      color: '#fdba74',
      side: 'right'
    },
    {
      id: 'sub-24-2',
      text: 'Por Mais R$ 19,99 Leve +1 Temaki de Salmão Grelhado',
      x: 860,
      y: -150,
      parentId: 'ped-5',
      childrenIds: [],
      collapsed: false,
      color: '#fdba74',
      side: 'right'
    },
    {
      id: 'sub-24-3',
      text: 'Não Desejo.',
      x: 860,
      y: -120,
      parentId: 'ped-5',
      childrenIds: [],
      collapsed: false,
      color: '#fdba74',
      side: 'right'
    },
    {
      id: 'ped-6',
      text: 'Combo 75 unidades',
      x: 560,
      y: -90,
      parentId: 'on-pedidos',
      childrenIds: [],
      collapsed: false,
      color: '#fb923c',
      side: 'right'
    },

    // 2. O Melhor Hot Roll, Pode Apostar! (Teal/Emerald #0d9488)
    {
      id: 'on-melhor-hot',
      text: 'O Melhor Hot Roll, Pode Apostar!',
      x: 280,
      y: 60,
      parentId: 'root',
      childrenIds: [
        'hot-1',
        'hot-2',
        'hot-3',
        'hot-4',
        'hot-5',
        'hot-6',
        'hot-7',
        'hot-8',
        'hot-9',
        'hot-10',
        'hot-11',
        'hot-12',
        'hot-13'
      ],
      collapsed: false,
      color: '#0d9488',
      side: 'right'
    },
    {
      id: 'hot-1',
      text: 'Sushi Burguer',
      x: 560,
      y: -40,
      parentId: 'on-melhor-hot',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'hot-2',
      text: 'Hot roll Salmão Grelhado c/ Cream Cheese e Cebolinha (12 unid)',
      x: 560,
      y: 10,
      parentId: 'on-melhor-hot',
      childrenIds: ['sub-hot2-1', 'sub-hot2-2', 'sub-hot2-3', 'sub-hot2-4', 'sub-hot2-5'],
      collapsed: false,
      color: '#f43f5e', // Rosa / Coral
      side: 'right'
    },
    {
      id: 'sub-hot2-1',
      text: 'Hot Roll c/ Cream Cheese',
      x: 960,
      y: -50,
      parentId: 'hot-2',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'sub-hot2-2',
      text: 'Hot Roll c/ Cream Cheese e Couve Crispy',
      x: 960,
      y: -20,
      parentId: 'hot-2',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'sub-hot2-3',
      text: 'Por Mais R$ 19,99 Leve 1 Temaki de Salmão Grelhado',
      x: 960,
      y: 10,
      parentId: 'hot-2',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'sub-hot2-4',
      text: 'Por Mais R$ 19,99 leve + 10 Unidades de Hot Roll Salmão Grelhado',
      x: 960,
      y: 40,
      parentId: 'hot-2',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'sub-hot2-5',
      text: 'Não Desejo.',
      x: 960,
      y: 70,
      parentId: 'hot-2',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'hot-3',
      text: 'Hot Roll Kani Crocante 12un',
      x: 560,
      y: 70,
      parentId: 'on-melhor-hot',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'hot-4',
      text: 'Hot Roll de Salmao c/ Couve Crispy 12un',
      x: 560,
      y: 100,
      parentId: 'on-melhor-hot',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'hot-5',
      text: 'Hot Roll De Salmao c/ Doritos 12un',
      x: 560,
      y: 130,
      parentId: 'on-melhor-hot',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'hot-6',
      text: 'Apaixonados por hot (20 hot + 2 mini temaki)',
      x: 560,
      y: 160,
      parentId: 'on-melhor-hot',
      childrenIds: ['sub-hot6-1'],
      collapsed: false,
      color: '#f43f5e',
      side: 'right'
    },
    {
      id: 'sub-hot6-1',
      text: '10 hot c/ couve crispy + 20 hot salmao grelhado c/ cream cheese',
      x: 880,
      y: 160,
      parentId: 'hot-6',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'hot-7',
      text: 'Especial Hot Roll de Salmão Grelhado 30 pcs',
      x: 560,
      y: 200,
      parentId: 'on-melhor-hot',
      childrenIds: ['sub-hot7-1'],
      collapsed: false,
      color: '#f43f5e',
      side: 'right'
    },
    {
      id: 'sub-hot7-1',
      text: '10 unidades de Hot Roll de Salmão Grelhado com Cebolinha, 10 Hot Roll de Salmão Grelhado com Couve Crispy, 10 Hot Roll de Salmão grelhado com Doritos',
      x: 880,
      y: 200,
      parentId: 'hot-7',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'hot-8',
      text: '40 Hot Roll',
      x: 560,
      y: 240,
      parentId: 'on-melhor-hot',
      childrenIds: ['sub-hot8-1'],
      collapsed: false,
      color: '#f43f5e',
      side: 'right'
    },
    {
      id: 'sub-hot8-1',
      text: '40 Hot Rolls de Salmão Grelhado com Cebolinhas, Finalizado com Tarê e Mix De Gergelim.',
      x: 880,
      y: 240,
      parentId: 'hot-8',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'hot-9',
      text: '50 Hot Roll',
      x: 560,
      y: 280,
      parentId: 'on-melhor-hot',
      childrenIds: ['sub-hot9-1'],
      collapsed: false,
      color: '#f43f5e',
      side: 'right'
    },
    {
      id: 'sub-hot9-1',
      text: '50 Hot Rolls de Salmão Grelhado com Cebolinhas, Finalizado com Tarê e Mix De Gergelim.',
      x: 880,
      y: 280,
      parentId: 'hot-9',
      childrenIds: [],
      collapsed: false,
      color: '#fb7185',
      side: 'right'
    },
    {
      id: 'hot-10',
      text: 'Temaki + 6 Hot roll',
      x: 560,
      y: 315,
      parentId: 'on-melhor-hot',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'hot-11',
      text: 'Hot Roll Especial Premium',
      x: 560,
      y: 345,
      parentId: 'on-melhor-hot',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'hot-12',
      text: 'Hot Roll Especial com camarão',
      x: 560,
      y: 375,
      parentId: 'on-melhor-hot',
      childrenIds: [],
      collapsed: false,
      color: '#14b8a6',
      side: 'right'
    },
    {
      id: 'hot-13',
      text: 'Cros Sell',
      x: 560,
      y: 405,
      parentId: 'on-melhor-hot',
      childrenIds: Array.from({ length: 15 }).map((_, i) => `cross-${i}`),
      collapsed: true,
      color: '#0d9488',
      side: 'right'
    },

    // 3 a 13: Ramos Agrupados abaixo (com badges numéricos como na imagem)
    {
      id: 'on-segundo-temaki',
      text: 'Segundo Temaki c/ Descontão',
      x: 280,
      y: 210,
      parentId: 'root',
      childrenIds: Array.from({ length: 92 }).map((_, i) => `temaki-desc-${i}`),
      collapsed: true,
      color: '#3b82f6', // Blue
      side: 'right'
    },
    {
      id: 'on-combinados',
      text: 'Combinados',
      x: 280,
      y: 245,
      parentId: 'root',
      childrenIds: Array.from({ length: 96 }).map((_, i) => `comb-${i}`),
      collapsed: true,
      color: '#ec4899', // Magenta
      side: 'right'
    },
    {
      id: 'on-yakissoba',
      text: 'Yakissoba',
      x: 280,
      y: 280,
      parentId: 'root',
      childrenIds: Array.from({ length: 4 }).map((_, i) => `yaki-${i}`),
      collapsed: true,
      color: '#059669', // Emerald Dark
      side: 'right'
    },
    {
      id: 'on-mini-pokes',
      text: 'Mini Pokes do Onegai Sushi',
      x: 280,
      y: 315,
      parentId: 'root',
      childrenIds: Array.from({ length: 138 }).map((_, i) => `poke-mini-${i}`),
      collapsed: true,
      color: '#eab308', // Amber / Gold
      side: 'right'
    },
    {
      id: 'on-pokes-grandes',
      text: 'Pokes Grandes do Onegai Sushi',
      x: 280,
      y: 350,
      parentId: 'root',
      childrenIds: Array.from({ length: 139 }).map((_, i) => `poke-gr-${i}`),
      collapsed: true,
      color: '#ef4444', // Red
      side: 'right'
    },
    {
      id: 'on-ceviche',
      text: 'Ceviche & Carpaccio',
      x: 280,
      y: 385,
      parentId: 'root',
      childrenIds: [],
      collapsed: false,
      color: '#8b5cf6', // Violet
      side: 'right'
    },
    {
      id: 'on-sashimi',
      text: 'Sashimi',
      x: 280,
      y: 420,
      parentId: 'root',
      childrenIds: [],
      collapsed: false,
      color: '#64748b', // Slate
      side: 'right'
    },
    {
      id: 'on-uramaki',
      text: 'Uramaki',
      x: 280,
      y: 455,
      parentId: 'root',
      childrenIds: [],
      collapsed: false,
      color: '#64748b',
      side: 'right'
    },
    {
      id: 'on-hossomaki',
      text: 'Hossomaki',
      x: 280,
      y: 490,
      parentId: 'root',
      childrenIds: [],
      collapsed: false,
      color: '#64748b',
      side: 'right'
    },
    {
      id: 'on-joe',
      text: 'Joe',
      x: 280,
      y: 525,
      parentId: 'root',
      childrenIds: [],
      collapsed: false,
      color: '#64748b',
      side: 'right'
    },
    {
      id: 'on-niguiri',
      text: 'Niguiri',
      x: 280,
      y: 560,
      parentId: 'root',
      childrenIds: [],
      collapsed: false,
      color: '#94a3b8',
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

export const INITIAL_BOARDS: Board[] = [INITIAL_BOARD, ONEGAI_BOARD];
