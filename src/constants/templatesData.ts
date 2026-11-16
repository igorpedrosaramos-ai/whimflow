import { Board, MindMapNode } from '../types';

export interface TemplateItem {
  id: string;
  title: string;
  category: 'suggested' | 'popular' | 'diagrams' | 'product' | 'project' | 'whiteboarding' | 'wireframes' | 'all';
  tags: string[];
  subtitle?: string;
  description: string;
  previewType: 'orgchart' | 'mindmap' | 'flowchart' | 'doc' | string;
  boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;
}

export const TEMPLATES: TemplateItem[] = [
  // 1. ORGANOGRAMA SIMPLES
  {
    id: 'tpl-simple-org-chart',
    title: 'Organograma Simples',
    category: 'diagrams',
    tags: ['Operações', 'Organogramas', 'Estrutura'],
    subtitle: 'Modelo Whimsical',
    description: 'Visualize e estruture os níveis hierárquicos e áreas da sua organização com um organograma limpo e intuitivo. Perfeito para empresas de qualquer porte, permitindo fácil atualização à medida que a organização cresce.',
    previewType: 'orgchart',
    boardData: {
      title: 'Organograma Simples',
      workspaceId: 'ws-default',
      layoutType: 'orgchart',
      mindMapNodes: [
        { id: 'root', text: 'Diretor Executivo (CEO)\nNome Completo', x: 0, y: -140, width: 190, height: 52, parentId: null, childrenIds: ['vp-eng', 'vp-prod', 'vp-sales', 'vp-mktg'], collapsed: false, color: '#6366f1', borderStyle: 'border', lineStyle: 'stepped', side: 'root' },
        { id: 'vp-eng', text: 'VP de Engenharia\nNome Completo', x: -360, y: -10, width: 175, height: 48, parentId: 'root', childrenIds: ['eng-lead-fe', 'eng-lead-be'], collapsed: false, color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-lead-fe', text: 'Líder Frontend\nNome Completo', x: -460, y: 90, width: 165, height: 46, parentId: 'vp-eng', childrenIds: ['eng-fe-dev1'], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-fe-dev1', text: 'Desenvolvedor Sênior\nNome Completo', x: -460, y: 175, width: 175, height: 44, parentId: 'eng-lead-fe', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-lead-be', text: 'Líder Backend\nNome Completo', x: -270, y: 90, width: 165, height: 46, parentId: 'vp-eng', childrenIds: ['eng-be-dev1'], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-be-dev1', text: 'Engenheiro de Dados\nNome Completo', x: -270, y: 175, width: 175, height: 44, parentId: 'eng-lead-be', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'vp-prod', text: 'VP de Produto\nNome Completo', x: -100, y: -10, width: 175, height: 48, parentId: 'root', childrenIds: ['lead-pm'], collapsed: false, color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'lead-pm', text: 'Gerente de Produto\nNome Completo', x: -100, y: 90, width: 175, height: 46, parentId: 'vp-prod', childrenIds: ['sr-designer'], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'sr-designer', text: 'Designer de Produto\nNome Completo', x: -100, y: 175, width: 175, height: 44, parentId: 'lead-pm', childrenIds: [], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'vp-sales', text: 'VP Comercial\nNome Completo', x: 160, y: -10, width: 175, height: 48, parentId: 'root', childrenIds: ['ops-manager', 'cs-lead'], collapsed: false, color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'ops-manager', text: 'Gerente de Operações\nNome Completo', x: 80, y: 90, width: 175, height: 46, parentId: 'vp-sales', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'cs-lead', text: 'Líder de Sucesso (CS)\nNome Completo', x: 250, y: 90, width: 180, height: 46, parentId: 'vp-sales', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'vp-mktg', text: 'VP de Marketing\nNome Completo', x: 460, y: -10, width: 175, height: 48, parentId: 'root', childrenIds: ['growth-lead', 'brand-lead'], collapsed: false, color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'growth-lead', text: 'Líder de Crescimento\nNome Completo', x: 400, y: 90, width: 175, height: 46, parentId: 'vp-mktg', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'brand-lead', text: 'Especialista em Marca\nNome Completo', x: 580, y: 90, width: 175, height: 46, parentId: 'vp-mktg', childrenIds: ['copywriter'], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'copywriter', text: 'Redator Criativo\nNome Completo', x: 580, y: 175, width: 170, height: 44, parentId: 'brand-lead', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 2. MAPA DO SITE COM MAPA MENTAL
  {
    id: 'tpl-sitemap-mindmap',
    title: 'Mapa do Site com Mapa Mental',
    category: 'diagrams',
    tags: ['Mapas de site', 'Arquitetura de informação', 'Mapas mentais'],
    subtitle: 'Modelo Whimsical',
    description: 'Planeje toda a arquitetura de páginas e navegação do seu site ou aplicativo. Visualize com clareza categorias principais, submenus, contas de usuários e rodapés.',
    previewType: 'mindmap',
    boardData: {
      title: 'Mapa do Site com Mapa Mental',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Mapa da Plataforma', x: 0, y: 0, width: 180, height: 46, parentId: null, childrenIds: ['mkt-site', 'app-portal'], collapsed: false, color: '#8b5cf6', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
        { id: 'mkt-site', text: 'Site Institucional', x: -280, y: 0, width: 180, height: 44, parentId: 'root', childrenIds: ['page-home', 'page-pricing', 'page-blog'], collapsed: false, color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'page-home', text: 'Página Inicial & Destaques', x: -480, y: -70, width: 185, height: 40, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'page-pricing', text: 'Planos & Tabela de Preços', x: -480, y: 0, width: 185, height: 40, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'page-blog', text: 'Central de Artigos & Blog', x: -480, y: 70, width: 185, height: 40, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'app-portal', text: 'Console da Aplicação', x: 280, y: 0, width: 180, height: 44, parentId: 'root', childrenIds: ['app-auth', 'app-dash', 'app-billing'], collapsed: false, color: '#0d9488', borderStyle: 'border', side: 'right' },
        { id: 'app-auth', text: 'Autenticação & Login Único', x: 480, y: -70, width: 185, height: 40, parentId: 'app-portal', childrenIds: [], color: '#0d9488', borderStyle: 'accent', side: 'right' },
        { id: 'app-dash', text: 'Painel Principal (Dashboard)', x: 480, y: 0, width: 195, height: 40, parentId: 'app-portal', childrenIds: [], color: '#0d9488', borderStyle: 'accent', side: 'right' },
        { id: 'app-billing', text: 'Assinaturas & Faturas', x: 480, y: 70, width: 185, height: 40, parentId: 'app-portal', childrenIds: [], color: '#0d9488', borderStyle: 'accent', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 3. ESTRUTURA INICIAL DE SITE
  {
    id: 'tpl-starter-sitemap',
    title: 'Estrutura Inicial de Site',
    category: 'diagrams',
    tags: ['Mapas de site', 'Navegação', 'Estrutura web'],
    subtitle: 'Modelo Whimsical',
    description: 'Uma base leve e organizada para definir a hierarquia de páginas, menus primários e subpáginas em poucos minutos.',
    previewType: 'mindmap',
    boardData: {
      title: 'Estrutura Inicial de Site',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Página Inicial do Site', x: 0, y: 0, width: 180, height: 46, parentId: null, childrenIds: ['nav-prod', 'nav-sol', 'nav-res', 'nav-comp'], collapsed: false, color: '#8b5cf6', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
        { id: 'nav-prod', text: 'Produtos & Recursos', x: 260, y: -100, width: 170, height: 40, parentId: 'root', childrenIds: ['prod-core', 'prod-integrations'], collapsed: false, color: '#0284c7', borderStyle: 'border', side: 'right' },
        { id: 'prod-core', text: 'Funcionalidades da Plataforma', x: 470, y: -120, width: 200, height: 38, parentId: 'nav-prod', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'prod-integrations', text: 'Integrações & API', x: 470, y: -75, width: 170, height: 38, parentId: 'nav-prod', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'nav-sol', text: 'Soluções por Área', x: 260, y: -20, width: 170, height: 40, parentId: 'root', childrenIds: ['sol-enterprise', 'sol-startups'], collapsed: false, color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'sol-enterprise', text: 'Para Grandes Empresas', x: 470, y: -40, width: 185, height: 38, parentId: 'nav-sol', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 'sol-startups', text: 'Para Startups & PMEs', x: 470, y: 5, width: 185, height: 38, parentId: 'nav-sol', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 'nav-res', text: 'Recursos & Apoio', x: 260, y: 65, width: 170, height: 40, parentId: 'root', childrenIds: ['res-docs', 'res-webinars'], collapsed: false, color: '#f59e0b', borderStyle: 'border', side: 'right' },
        { id: 'res-docs', text: 'Documentação & Guias', x: 470, y: 50, width: 185, height: 38, parentId: 'nav-res', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'right' },
        { id: 'res-webinars', text: 'Casos de Sucesso de Clientes', x: 470, y: 95, width: 210, height: 38, parentId: 'nav-res', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'right' },
        { id: 'nav-comp', text: 'Sobre a Empresa', x: -260, y: 0, width: 160, height: 40, parentId: 'root', childrenIds: ['comp-about', 'comp-careers'], collapsed: false, color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'comp-about', text: 'Quem Somos & Missão', x: -460, y: -30, width: 175, height: 38, parentId: 'nav-comp', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'comp-careers', text: 'Carreiras (Estamos contratando)', x: -460, y: 30, width: 215, height: 38, parentId: 'nav-comp', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 4. VARIAÇÕES DE ARQUITETURA DE SITE (Fiel 100% à Foto 2: "Ecossistema Digital")
  {
    id: 'tpl-sitemap-variations',
    title: 'Variações de Arquitetura de Site',
    category: 'diagrams',
    tags: ['Mapas de site', 'Arquitetura de informação', 'UX'],
    subtitle: 'Modelo Whimsical',
    description: 'Compare estruturas alternativas de navegação (horizontal, profunda ou híbrida) para escolher a melhor experiência do usuário antes do desenvolvimento.',
    previewType: 'mindmap',
    boardData: {
      title: 'Variações de Arquitetura de Site',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Ecossistema Digital', x: 0, y: 0, width: 170, height: 46, parentId: null, childrenIds: ['mkt-site', 'user-dash', 'dev-portal', 'docs-hub', 'shop-store'], collapsed: false, color: '#1e293b', borderStyle: 'accent', lineStyle: 'bezier', side: 'root' },
        { id: 'mkt-site', text: 'Site Institucional', x: -280, y: -40, width: 175, height: 42, parentId: 'root', childrenIds: ['site-sub1', 'site-sub2'], collapsed: false, color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'site-sub1', text: 'Novo item', x: -470, y: -65, width: 130, height: 38, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'site-sub2', text: 'Novo item', x: -470, y: -15, width: 130, height: 38, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'user-dash', text: 'Painel do Usuário', x: -280, y: 50, width: 175, height: 42, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'accent', side: 'left' },
        { id: 'dev-portal', text: 'Portal de Desenvolvedores & API', x: 280, y: -60, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'accent', side: 'right' },
        { id: 'docs-hub', text: 'Central de Documentação', x: 280, y: 0, width: 195, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 'shop-store', text: 'Loja Virtual (E-commerce)', x: 280, y: 60, width: 195, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 5. FLUXOGRAMA SIMPLES DE PROCESSOS
  {
    id: 'tpl-simple-flowchart',
    title: 'Fluxograma Simples de Processos',
    category: 'diagrams',
    tags: ['Fluxogramas', 'Processos', 'Decisões'],
    subtitle: 'Modelo Whimsical',
    description: 'Diagrama de árvore de decisão para fluxos de onboarding, condições lógicas, validações e caminhos alternativos de clientes.',
    previewType: 'flowchart',
    boardData: {
      title: 'Fluxograma Simples de Processos',
      workspaceId: 'ws-default',
      layoutType: 'flowchart',
      mindMapNodes: [
        { id: 'root', text: 'Início: Cadastro de Novo Usuário', x: 0, y: -100, width: 230, height: 46, parentId: null, childrenIds: ['step-verify'], collapsed: false, color: '#6366f1', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
        { id: 'step-verify', text: 'Decisão: É domínio corporativo?', x: 0, y: 0, width: 230, height: 48, parentId: 'root', childrenIds: ['branch-corp', 'branch-public'], collapsed: false, color: '#f59e0b', borderStyle: 'border', lineStyle: 'stepped', side: 'root' },
        { id: 'branch-corp', text: 'Sim: Direcionar para Consultor Dedicado', x: -250, y: 110, width: 260, height: 46, parentId: 'step-verify', childrenIds: ['done-enterprise'], color: '#10b981', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'done-enterprise', text: 'Agendar Demonstração Executiva de 30 min', x: -250, y: 200, width: 270, height: 42, parentId: 'branch-corp', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'left' },
        { id: 'branch-public', text: 'Não: Ativar Teste Gratuito de 14 Dias', x: 250, y: 110, width: 250, height: 46, parentId: 'step-verify', childrenIds: ['done-selfserve'], color: '#3b82f6', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'done-selfserve', text: 'Enviar Tour Interativo da Plataforma', x: 250, y: 200, width: 260, height: 42, parentId: 'branch-public', childrenIds: [], color: '#3b82f6', borderStyle: 'accent', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 6. ESTRUTURA DE PODS DE PRODUTO
  {
    id: 'tpl-product-pod-structure',
    title: 'Estrutura de Pods de Produto',
    category: 'diagrams',
    tags: ['Organogramas', 'Times ágeis', 'Squads'],
    subtitle: 'Modelo Whimsical',
    description: 'Estrutura organizacional por squads e pods multidisciplinares. Mapeia Gerente de Produto, Tech Lead, Designers e Engenheiros de cada frente.',
    previewType: 'orgchart',
    boardData: {
      title: 'Estrutura de Pods de Produto',
      workspaceId: 'ws-default',
      layoutType: 'orgchart',
      mindMapNodes: [
        { id: 'root', text: 'Diretoria de Tecnologia & Produto\nLiderança Executiva', x: 0, y: -130, width: 240, height: 48, parentId: null, childrenIds: ['pod-purple', 'pod-blue', 'pod-teal', 'pod-orange'], collapsed: false, color: '#6366f1', borderStyle: 'border', lineStyle: 'stepped', side: 'root' },
        { id: 'pod-purple', text: 'Pod Mobile (Roxo)\nLíder Técnico', x: -360, y: 0, width: 160, height: 46, parentId: 'root', childrenIds: ['purp-sub1', 'purp-sub2'], collapsed: false, color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'purp-sub1', text: 'Engenheiro iOS\nNome Completo', x: -440, y: 90, width: 155, height: 44, parentId: 'pod-purple', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'purp-sub2', text: 'Engenheiro Android\nNome Completo', x: -280, y: 90, width: 165, height: 44, parentId: 'pod-purple', childrenIds: ['purp-leaf'], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'purp-leaf', text: 'Especialista de QA\nNome Completo', x: -280, y: 170, width: 160, height: 44, parentId: 'purp-sub2', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'pod-blue', text: 'Pod Web Core (Azul)\nGerente de Produto', x: -120, y: 0, width: 170, height: 46, parentId: 'root', childrenIds: ['blue-sub1'], collapsed: false, color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'blue-sub1', text: 'Tech Lead Frontend\nNome Completo', x: -120, y: 90, width: 165, height: 44, parentId: 'pod-blue', childrenIds: ['blue-leaf'], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'blue-leaf', text: 'Desenvolvedor React\nNome Completo', x: -120, y: 170, width: 165, height: 44, parentId: 'blue-sub1', childrenIds: [], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'pod-teal', text: 'Pod Dados & IA (Verde)\nCientista de Dados', x: 120, y: 0, width: 180, height: 46, parentId: 'root', childrenIds: ['teal-sub1', 'teal-sub2'], collapsed: false, color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'teal-sub1', text: 'Engenheiro de ML\nNome Completo', x: 40, y: 90, width: 155, height: 44, parentId: 'pod-teal', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'teal-sub2', text: 'Analista de BI\nNome Completo', x: 200, y: 90, width: 155, height: 44, parentId: 'pod-teal', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'pod-orange', text: 'Pod Crescimento (Laranja)\nLíder de Growth', x: 360, y: 0, width: 185, height: 46, parentId: 'root', childrenIds: ['org-sub1', 'org-sub2'], collapsed: false, color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'org-sub1', text: 'Designer de Produto\nNome Completo', x: 280, y: 90, width: 165, height: 44, parentId: 'pod-orange', childrenIds: ['org-leaf'], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'org-leaf', text: 'Especialista em CRO\nNome Completo', x: 280, y: 170, width: 165, height: 44, parentId: 'org-sub1', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'org-sub2', text: 'Engenheiro Full-Stack\nNome Completo', x: 450, y: 90, width: 170, height: 44, parentId: 'pod-orange', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  }
];
