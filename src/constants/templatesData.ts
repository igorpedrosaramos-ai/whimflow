import { Board, MindMapNode, StickyNote, WireframeItem } from '../types';

export interface TemplateItem {
  id: string;
  title: string;
  category: 'suggested' | 'popular' | 'diagrams' | 'product' | 'project' | 'whiteboarding' | 'wireframes' | 'all';
  tags: string[];
  subtitle?: string;
  description: string;
  previewType: 'orgchart' | 'mindmap' | 'flowchart' | 'stickies' | 'wireframe' | 'wireflow' | 'sketchbook' | 'doc' | 'timeline' | 'gantt';
  boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;
}

export const TEMPLATES: TemplateItem[] = [
  // 1. ORGANOGRAMA SIMPLES
  {
    id: 'tpl-simple-org-chart',
    title: 'Organograma Simples',
    category: 'suggested',
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
    category: 'suggested',
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

  // 4. VARIAÇÕES DE ARQUITETURA DE SITE
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
        { id: 'root', text: 'Ecossistema Digital', x: 0, y: 0, width: 170, height: 46, parentId: null, childrenIds: ['mkt-site', 'user-dash', 'docs-hub', 'shop-store', 'dev-portal'], collapsed: false, color: '#7c3aed', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
        { id: 'mkt-site', text: 'Site Institucional', x: -280, y: -70, width: 175, height: 42, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'user-dash', text: 'Painel do Usuário', x: -280, y: 70, width: 175, height: 42, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'left' },
        { id: 'docs-hub', text: 'Central de Documentação', x: 280, y: -90, width: 195, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'shop-store', text: 'Loja Virtual (E-commerce)', x: 280, y: 0, width: 195, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' },
        { id: 'dev-portal', text: 'Portal de Desenvolvedores & API', x: 280, y: 90, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#06b6d4', borderStyle: 'border', side: 'right' }
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
      layoutType: 'orgchart',
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
  },

  // 7. SESSÃO DE BRAINSTORMING (Fiel 100% à Prévia de 8 Notas Adesivas em Grade 2x4)
  {
    id: 'tpl-brainstorming',
    title: 'Sessão de Brainstorming',
    category: 'whiteboarding',
    tags: ['Design Sprint', 'Notas Adesivas', 'Ideação'],
    subtitle: 'Modelo Whimsical',
    description: 'Matriz de notas adesivas coloridas para ideação colaborativa e sessões de Design Thinking. Agrupe observações, dores de usuários, ganhos rápidos e soluções inovadoras.',
    previewType: 'stickies',
    boardData: {
      title: 'Sessão de Brainstorming',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [],
      shapes: [],
      connectors: [],
      stickies: [
        // Linha Superior (4 Notas: Amarelo, Verde, Laranja, Roxo)
        { id: 's1', x: -330, y: -90, width: 190, height: 140, text: 'Dores dos Usuários\n• Dificuldade em organizar ideias\n• Falta de clareza nas prioridades', color: '#fef08a' },
        { id: 's2', x: -110, y: -90, width: 190, height: 140, text: 'Ganhos Rápidos\n• Atalhos intuitivos de teclado\n• Modelos prontos em 1 clique', color: '#bbf7d0' },
        { id: 's3', x: 110, y: -90, width: 190, height: 140, text: 'Soluções Inovadoras\n• Automação de layout com IA\n• Exportação executiva em PDF', color: '#fed7aa' },
        { id: 's4', x: 330, y: -90, width: 190, height: 140, text: 'Visão de Futuro\n• Colaboração fluida em tempo real\n• Integração com ferramentas externas', color: '#e9d5ff' },

        // Linha Inferior (4 Notas: Amarelo, Verde, Laranja, Azul)
        { id: 's5', x: -330, y: 80, width: 190, height: 140, text: 'Feedback Coletado\n• Interface limpa e sem ruídos\n• Alta legibilidade em apresentações', color: '#fef08a' },
        { id: 's6', x: -110, y: 80, width: 190, height: 140, text: 'Prioridades do Ciclo\n• Finalizar fluxo de onboarding\n• Testes de regressão automatizados', color: '#bbf7d0' },
        { id: 's7', x: 110, y: 80, width: 190, height: 140, text: 'Métricas de Sucesso\n• Tempo de criação < 1 minuto\n• Conversão de clientes superior a 25%', color: '#fed7aa' },
        { id: 's8', x: 330, y: 80, width: 190, height: 140, text: 'Próximos Passos\n• Definir responsáveis e prazos\n• Validar protótipo com clientes reais', color: '#bae6fd' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 8. CADERNO DE ESBOÇOS DIGITAL
  {
    id: 'tpl-digital-sketchbook',
    title: 'Caderno de Esboços Digital',
    category: 'whiteboarding',
    tags: ['Quadro Branco', 'Esboços', 'Ideação'],
    subtitle: 'Modelo Whimsical',
    description: 'Um caderno digital aberto para rascunhos de interface, anotações de ideias em notas adesivas e prototipagem livre sem restrições.',
    previewType: 'sketchbook',
    boardData: {
      title: 'Caderno de Esboços Digital',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Caderno de Esboços Digital\nExploração Conceitual', x: 0, y: -120, width: 220, height: 48, parentId: null, childrenIds: ['s-ui', 's-ux'], color: '#6366f1', borderStyle: 'border', side: 'root' },
        { id: 's-ui', text: 'Direção Visual de Interface', x: -260, y: -120, width: 200, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'left' },
        { id: 's-ux', text: 'Modelo de Interação & Gestos', x: 260, y: -120, width: 220, height: 40, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'sk-note1', x: -350, y: -20, width: 160, height: 110, text: '💡 Manter a barra de ferramentas flutuante sem sobrepor o conteúdo', color: '#fef08a' },
        { id: 'sk-note2', x: 200, y: -20, width: 160, height: 110, text: '✨ Navegação fluida com zoom suave e física responsiva a 60fps', color: '#e9d5ff' }
      ],
      wireframes: [
        { id: 'sk-wf1', type: 'card', x: -140, y: 10, width: 280, height: 190, label: 'Protótipo de Layout do Canvas' },
        { id: 'sk-wf2', type: 'button', x: -60, y: 140, width: 120, height: 36, label: 'Exportar Imagem' }
      ],
      texts: [],
      drawings: []
    }
  },

  // 9. KIT DE WIREFRAMES IOS
  {
    id: 'tpl-ios-wireframe',
    title: 'Kit de Wireframes iOS',
    category: 'wireframes',
    tags: ['UX Mobile', 'iOS', 'Protótipos'],
    subtitle: 'Modelo Whimsical',
    description: 'Layout para aplicativos mobile iOS incluindo tela de login, feed principal de atividades e tela de configurações do usuário.',
    previewType: 'wireframe',
    boardData: {
      title: 'Kit de Wireframes iOS',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Arquitetura de Aplicativo iOS\nEstrutura de Componentes Mobile', x: 0, y: -160, width: 250, height: 48, parentId: null, childrenIds: ['screen-auth', 'screen-feed', 'screen-settings'], color: '#0284c7', borderStyle: 'fill', side: 'root' },
        { id: 'screen-auth', text: 'Tela 1: Autenticação', x: -320, y: -60, width: 190, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'screen-feed', text: 'Tela 2: Feed de Atividades', x: 0, y: -60, width: 200, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'root' },
        { id: 'screen-settings', text: 'Tela 3: Perfil & Conta', x: 320, y: -60, width: 190, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [
        { id: 'wf1', type: 'card', x: -410, y: 20, width: 190, height: 280, label: 'Login & FaceID' },
        { id: 'wf2', type: 'input', x: -385, y: 120, width: 140, height: 34, label: 'usuario@empresa.com' },
        { id: 'wf3', type: 'button', x: -385, y: 200, width: 140, height: 38, label: 'Entrar com Apple' },
        { id: 'wf4', type: 'card', x: -95, y: 20, width: 190, height: 280, label: 'Feed Principal' },
        { id: 'wf5', type: 'toggle', x: -70, y: 120, width: 140, height: 32, label: 'Alertas em Tempo Real' },
        { id: 'wf6', type: 'button', x: -70, y: 200, width: 140, height: 38, label: 'Criar Novo Quadro' },
        { id: 'wf7', type: 'card', x: 225, y: 20, width: 190, height: 280, label: 'Configurações' },
        { id: 'wf8', type: 'checkbox', x: 250, y: 120, width: 140, height: 32, label: 'Modo Escuro Ativado', checked: true },
        { id: 'wf9', type: 'button', x: 250, y: 200, width: 140, height: 38, label: 'Plano Ilimitado Ativo' }
      ],
      texts: [],
      drawings: []
    }
  },

  // 10. FLUXO DE TELAS DE PRODUTO
  {
    id: 'tpl-product-wireflow',
    title: 'Fluxo de Telas de Produto',
    category: 'wireframes',
    tags: ['Wireframes', 'Fluxo de usuário', 'Conversão'],
    subtitle: 'Modelo Whimsical',
    description: 'Diagrama unindo telas de wireframe com setas lógicas de decisão. Ilustra a jornada do carrinho até a confirmação da compra.',
    previewType: 'wireflow',
    boardData: {
      title: 'Fluxo de Telas de Produto',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Fluxo de Conversão e Checkout\nEtapas Ponta a Ponta', x: 0, y: -160, width: 240, height: 48, parentId: null, childrenIds: ['flow-cart', 'flow-pay', 'flow-success'], color: '#7c3aed', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
        { id: 'flow-cart', text: 'Etapa 1: Revisão do Carrinho', x: -320, y: -60, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'flow-pay', text: 'Etapa 2: Pagamento em 1 Clique', x: 0, y: -60, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'root' },
        { id: 'flow-success', text: 'Etapa 3: Pedido Confirmado', x: 320, y: -60, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'wf-note', x: -160, y: 310, width: 320, height: 75, text: '⚡ Micro-interação: Autorização de pagamento em menos de 800ms para maximizar a conversão', color: '#bbf7d0' }
      ],
      wireframes: [
        { id: 'wflow1', type: 'card', x: -410, y: 15, width: 190, height: 260, label: 'Tela do Carrinho' },
        { id: 'wflow2', type: 'button', x: -385, y: 190, width: 140, height: 38, label: 'Ir para o Pagamento' },
        { id: 'wflow3', type: 'card', x: -95, y: 15, width: 190, height: 260, label: 'Tela de Pagamento' },
        { id: 'wflow4', type: 'button', x: -70, y: 190, width: 140, height: 38, label: 'Pagar com Pix ou Cartão' },
        { id: 'wflow5', type: 'card', x: 225, y: 15, width: 190, height: 260, label: 'Pedido Confirmado' },
        { id: 'wflow6', type: 'button', x: 250, y: 190, width: 140, height: 38, label: 'Rastrear Entrega' }
      ],
      texts: [],
      drawings: []
    }
  },

  // 11. PESQUISA E DESCOBERTA DE USUÁRIOS
  {
    id: 'tpl-user-research-process',
    title: 'Pesquisa e Descoberta de Usuários',
    category: 'product',
    tags: ['Documentos de Produto', 'Pesquisa de Usuários', 'Entrevistas'],
    subtitle: 'Modelo Whimsical',
    description: 'Estrutura para documentar entrevistas com clientes, sintetizar descobertas, agrupar dores e priorizar melhorias de produto.',
    previewType: 'doc',
    boardData: {
      title: 'Pesquisa e Descoberta de Usuários',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Síntese de Pesquisa com Usuários\nDescobertas e Oportunidades', x: 0, y: 0, width: 240, height: 48, parentId: null, childrenIds: ['ur-sit', 'ur-goal', 'ur-act'], color: '#0284c7', borderStyle: 'fill', side: 'root' },
        { id: 'ur-sit', text: 'Cenário Atual (O que já sabemos)', x: -280, y: -50, width: 230, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'ur-goal', text: 'Objetivos (O que queremos alcançar)', x: 280, y: -50, width: 240, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'ur-act', text: 'Próximos Passos & Ações do Ciclo', x: 0, y: 110, width: 230, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'root' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'doc-s1', x: -440, y: 30, width: 200, height: 110, text: '“Preciso compartilhar mapas com clientes em formato PDF limpo e executivo”', color: '#fef08a' },
        { id: 'doc-s2', x: 240, y: 30, width: 200, height: 110, text: '“O alinhamento e arraste de nós precisa ser magnético e responsivo”', color: '#fed7aa' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 12. ALINHAMENTO SEMANAL DA EQUIPE
  {
    id: 'tpl-team-heartbeat',
    title: 'Alinhamento Semanal da Equipe',
    category: 'product',
    tags: ['Documentos de Produto', 'Alinhamento', 'Status Semanal'],
    subtitle: 'Modelo Whimsical',
    description: 'Documento de alinhamento semanal para equipes de produto e engenharia. Destaques do ciclo, entregas realizadas, impedimentos e próximos passos.',
    previewType: 'doc',
    boardData: {
      title: 'Alinhamento Semanal da Equipe',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Alinhamento Semanal da Equipe\nSincronização de Entregas', x: 0, y: 0, width: 230, height: 48, parentId: null, childrenIds: ['hb-ship', 'hb-block', 'hb-next'], color: '#8b5cf6', borderStyle: 'fill', side: 'root' },
        { id: 'hb-ship', text: 'O que foi entregue 🚢', x: -280, y: -50, width: 190, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'left' },
        { id: 'hb-block', text: 'Impedimentos & Riscos 🚧', x: 280, y: -50, width: 200, height: 42, parentId: 'root', childrenIds: [], color: '#ef4444', borderStyle: 'border', side: 'right' },
        { id: 'hb-next', text: 'Foco da Próxima Semana 🎯', x: 0, y: 110, width: 210, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'root' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'hb-s1', x: -440, y: 30, width: 190, height: 100, text: '✅ Interface 100% em português com rotas individuais e navegação real', color: '#bbf7d0' },
        { id: 'hb-s2', x: 250, y: 30, width: 190, height: 100, text: '⚠️ Política de tolerância zero a falhas: testes E2E com Puppeteer', color: '#fed7aa' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 13. LINHA DO TEMPO DE PROJETOS
  {
    id: 'tpl-project-timeline',
    title: 'Linha do Tempo de Projetos',
    category: 'project',
    tags: ['Gestão de Projetos', 'Cronogramas', 'Marcos'],
    subtitle: 'Modelo Whimsical',
    description: 'Cronograma trimestral para acompanhar fases do projeto, entregáveis, dependências e marcos executivos de Q1 a Q4.',
    previewType: 'timeline',
    boardData: {
      title: 'Linha do Tempo de Projetos',
      workspaceId: 'ws-default',
      layoutType: 'timeline',
      mindMapNodes: [
        { id: 'root', text: 'Linha do Tempo do Projeto', x: 0, y: -120, width: 220, height: 46, parentId: null, childrenIds: ['q1', 'q2', 'q3', 'q4'], color: '#6366f1', borderStyle: 'fill', lineStyle: 'straight', side: 'root' },
        { id: 'q1', text: 'Q1', x: -330, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['proto'], color: '#3b82f6', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'proto', text: 'Protótipo Inicial', x: -330, y: 76, width: 140, height: 42, parentId: 'q1', childrenIds: [], color: '#3b82f6', borderStyle: 'border', side: 'root' },
        { id: 'q2', text: 'Q2', x: -110, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['beta'], color: '#10b981', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'beta', text: 'Versão Beta MVP', x: -110, y: 76, width: 140, height: 42, parentId: 'q2', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'root' },
        { id: 'q3', text: 'Q3', x: 110, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['ga'], color: '#f59e0b', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'ga', text: 'Lançamento Geral', x: 110, y: 76, width: 140, height: 42, parentId: 'q3', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'root' },
        { id: 'q4', text: 'Q4', x: 330, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['scale'], color: '#8b5cf6', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'scale', text: 'Escala & Otimização', x: 330, y: 76, width: 150, height: 42, parentId: 'q4', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'root' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 14. CRONOGRAMA GANTT DE ENTREGAS
  {
    id: 'tpl-gantt-chart',
    title: 'Cronograma Gantt de Entregas',
    category: 'project',
    tags: ['Gestão de Projetos', 'Gantt', 'Prazos'],
    subtitle: 'Modelo Whimsical',
    description: 'Diagrama de barras horizontais mapeando atividades paralelas da equipe, caminhos críticos e janelas de lançamento.',
    previewType: 'gantt',
    boardData: {
      title: 'Cronograma Gantt de Entregas',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Cronograma de Lançamento\nVersão 2.0 do Produto', x: 0, y: -100, width: 220, height: 46, parentId: null, childrenIds: ['g-track1', 'g-track2'], color: '#0d9488', borderStyle: 'fill', side: 'root' },
        { id: 'g-track1', text: 'Frente 1: Frontend & Design (Semanas 1 a 4)', x: -270, y: 0, width: 260, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'g-track2', text: 'Frente 2: Backend & Banco (Semanas 2 a 6)', x: 270, y: 0, width: 260, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'g-s1', x: -350, y: 90, width: 165, height: 95, text: 'Ciclo 1: Layout do Canvas e Matemática de Conectores', color: '#bae6fd' },
        { id: 'g-s2', x: -160, y: 90, width: 165, height: 95, text: 'Ciclo 2: Prévia dos Modelos e Detalhes Visuais', color: '#fed7aa' },
        { id: 'g-s3', x: 50, y: 90, width: 165, height: 95, text: 'Ciclo 3: Editor de Documentos e Integração com IA', color: '#bbf7d0' },
        { id: 'g-s4', x: 240, y: 90, width: 165, height: 95, text: 'Ciclo 4: Testes de Regressão e Deploy em Produção', color: '#fef08a' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 15. ESTRATÉGIA DE INICIATIVA EM 1 PÁGINA
  {
    id: 'tpl-lenny-strategy',
    title: 'Estratégia de Iniciativa em 1 Página',
    category: 'product',
    tags: ['Documentos de Produto', 'Estratégia', 'Metodologias'],
    subtitle: 'Modelo Whimsical',
    description: 'O consagrado formato de estratégia de 1 página: O que é, Por que agora, Metas, Não-metas e Métricas de sucesso.',
    previewType: 'doc',
    boardData: {
      title: 'Estratégia de Iniciativa em 1 Página',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Estratégia em 1 Página\nBriefing Central da Iniciativa', x: 0, y: 0, width: 210, height: 48, parentId: null, childrenIds: ['strat-what', 'strat-why', 'strat-goals', 'strat-metrics'], color: '#7c3aed', borderStyle: 'fill', side: 'root' },
        { id: 'strat-what', text: '1. O que é a iniciativa?\nDefinição direta em 1 frase', x: -280, y: -60, width: 235, height: 46, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'strat-why', text: '2. Por que agora?\nOportunidade de mercado e urgência', x: -280, y: 60, width: 245, height: 46, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'strat-goals', text: '3. Metas e Não-Metas\nFronteiras explícitas de escopo', x: 280, y: -60, width: 235, height: 46, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'strat-metrics', text: '4. Métricas de Sucesso\nIndicador Norte e KPIs de controle', x: 280, y: 60, width: 245, height: 46, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'strat-note1', x: -440, y: 150, width: 200, height: 100, text: '🎯 Indicador Norte: Tempo para criar o primeiro diagrama < 30 segundos', color: '#fef08a' },
        { id: 'strat-note2', x: 240, y: 150, width: 200, height: 100, text: '🛡️ Proteção: Navegação fluida sem travamentos mesmo com mais de 1.000 nós', color: '#bbf7d0' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  }
];
