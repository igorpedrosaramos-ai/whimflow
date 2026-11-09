import { Board } from '../types';

export interface TemplateItem {
  id: string;
  title: string;
  category: 'suggested' | 'popular' | 'diagrams' | 'product' | 'project' | 'whiteboarding' | 'wireframes' | 'all';
  tags: string[];
  subtitle?: string;
  description: string;
  previewType: 'orgchart' | 'mindmap' | 'flowchart' | 'stickies' | 'wireframe' | 'sequence';
  boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;
}

export const TEMPLATES: TemplateItem[] = [
  // 1. SIMPLE ORG CHART (Exatamente o da foto 4 do Whimsical!)
  {
    id: 'tpl-simple-org-chart',
    title: 'Simple Org Chart',
    category: 'suggested',
    tags: ['Operations', 'Org charts'],
    subtitle: 'Whimsical template',
    description: "Easily visualize and streamline your org's structure with our simple and intuitive org chart template. Perfect for businesses of any size, this template can be easily modified and updated as your company grows and evolves.",
    previewType: 'orgchart',
    boardData: {
      title: 'Simple Org Chart',
      workspaceId: 'ws-default',
      mindMapNodes: [
        // Nível 0: CEO / Top
        {
          id: 'root',
          text: 'Role Title\nFull Name',
          x: 0,
          y: -140,
          width: 170,
          height: 52,
          parentId: null,
          childrenIds: ['vp-eng', 'vp-prod', 'vp-sales', 'vp-mktg'],
          collapsed: false,
          color: '#6366f1',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'root'
        },
        // Ramo 1: VP Engineering (Roxo)
        {
          id: 'vp-eng',
          text: 'Role Title\nFull Name',
          x: -360,
          y: -10,
          width: 165,
          height: 48,
          parentId: 'root',
          childrenIds: ['eng-lead-fe', 'eng-lead-be'],
          collapsed: false,
          color: '#8b5cf6',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'eng-lead-fe',
          text: 'Role Title\nFull Name',
          x: -460,
          y: 90,
          width: 155,
          height: 46,
          parentId: 'vp-eng',
          childrenIds: ['eng-fe-dev1'],
          color: '#8b5cf6',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'eng-fe-dev1',
          text: 'Role Title\nFull Name',
          x: -460,
          y: 175,
          width: 155,
          height: 44,
          parentId: 'eng-lead-fe',
          childrenIds: [],
          color: '#8b5cf6',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'eng-lead-be',
          text: 'Role Title\nFull Name',
          x: -270,
          y: 90,
          width: 155,
          height: 46,
          parentId: 'vp-eng',
          childrenIds: ['eng-be-dev1'],
          color: '#8b5cf6',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'eng-be-dev1',
          text: 'Role Title\nFull Name',
          x: -270,
          y: 175,
          width: 155,
          height: 44,
          parentId: 'eng-lead-be',
          childrenIds: [],
          color: '#8b5cf6',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },

        // Ramo 2: VP Product (Azul)
        {
          id: 'vp-prod',
          text: 'Role Title\nFull Name',
          x: -100,
          y: -10,
          width: 165,
          height: 48,
          parentId: 'root',
          childrenIds: ['lead-pm'],
          collapsed: false,
          color: '#0284c7',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'lead-pm',
          text: 'Role Title\nFull Name',
          x: -100,
          y: 90,
          width: 165,
          height: 46,
          parentId: 'vp-prod',
          childrenIds: ['sr-designer'],
          color: '#0284c7',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'sr-designer',
          text: 'Role Title\nFull Name',
          x: -100,
          y: 175,
          width: 165,
          height: 44,
          parentId: 'lead-pm',
          childrenIds: [],
          color: '#0284c7',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },

        // Ramo 3: VP Sales & Ops (Teal)
        {
          id: 'vp-sales',
          text: 'Role Title\nFull Name',
          x: 160,
          y: -10,
          width: 165,
          height: 48,
          parentId: 'root',
          childrenIds: ['ops-manager', 'cs-lead'],
          collapsed: false,
          color: '#0d9488',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },
        {
          id: 'ops-manager',
          text: 'Role Title\nFull Name',
          x: 80,
          y: 90,
          width: 160,
          height: 46,
          parentId: 'vp-sales',
          childrenIds: [],
          color: '#0d9488',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },
        {
          id: 'cs-lead',
          text: 'Role Title\nFull Name',
          x: 250,
          y: 90,
          width: 175,
          height: 46,
          parentId: 'vp-sales',
          childrenIds: [],
          color: '#0d9488',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },

        // Ramo 4: VP Marketing (Laranja)
        {
          id: 'vp-mktg',
          text: 'Role Title\nFull Name',
          x: 460,
          y: -10,
          width: 165,
          height: 48,
          parentId: 'root',
          childrenIds: ['growth-lead', 'brand-lead'],
          collapsed: false,
          color: '#ea580c',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },
        {
          id: 'growth-lead',
          text: 'Role Title\nFull Name',
          x: 400,
          y: 90,
          width: 165,
          height: 46,
          parentId: 'vp-mktg',
          childrenIds: [],
          color: '#ea580c',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },
        {
          id: 'brand-lead',
          text: 'Role Title\nFull Name',
          x: 580,
          y: 90,
          width: 160,
          height: 46,
          parentId: 'vp-mktg',
          childrenIds: ['copywriter'],
          color: '#ea580c',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },
        {
          id: 'copywriter',
          text: 'Role Title\nFull Name',
          x: 580,
          y: 175,
          width: 155,
          height: 44,
          parentId: 'brand-lead',
          childrenIds: [],
          color: '#ea580c',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 2. SITEMAP WITH MIND MAPS
  {
    id: 'tpl-sitemap-mindmap',
    title: 'Sitemap with Mind Maps',
    category: 'suggested',
    tags: ['Web Architecture', 'Sitemaps'],
    subtitle: 'Whimsical template',
    description: 'Structure complex web applications or marketing sites with ease. Organize parent sections, nested subsections, and dynamic pages in a visual color-coded tree.',
    previewType: 'mindmap',
    boardData: {
      title: 'Sitemap with Mind Maps',
      workspaceId: 'ws-default',
      mindMapNodes: [
        {
          id: 'root',
          text: 'Role Title\nFull Name',
          x: 0,
          y: 0,
          width: 170,
          height: 48,
          parentId: null,
          childrenIds: ['s1', 's2', 's3', 's4', 's5'],
          collapsed: false,
          color: '#6366f1',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'root'
        },
        {
          id: 's1',
          text: 'Product Platform',
          x: -260,
          y: -100,
          width: 145,
          height: 40,
          parentId: 'root',
          childrenIds: ['s1-1', 's1-2'],
          collapsed: false,
          color: '#ec4899',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'left'
        },
        {
          id: 's1-1',
          text: 'Core Features & SDK',
          x: -460,
          y: -125,
          width: 150,
          height: 36,
          parentId: 's1',
          childrenIds: [],
          color: '#ec4899',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'left'
        },
        {
          id: 's1-2',
          text: 'API Integrations',
          x: -460,
          y: -75,
          width: 145,
          height: 36,
          parentId: 's1',
          childrenIds: [],
          color: '#ec4899',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'left'
        },
        {
          id: 's2',
          text: 'Solutions & Verticals',
          x: -260,
          y: 100,
          width: 155,
          height: 40,
          parentId: 'root',
          childrenIds: ['s2-1'],
          collapsed: false,
          color: '#8b5cf6',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'left'
        },
        {
          id: 's2-1',
          text: 'Enterprise Architecture',
          x: -470,
          y: 100,
          width: 165,
          height: 36,
          parentId: 's2',
          childrenIds: [],
          color: '#8b5cf6',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'left'
        },
        {
          id: 's3',
          text: 'Pricing & Plans',
          x: 260,
          y: -100,
          width: 145,
          height: 40,
          parentId: 'root',
          childrenIds: ['s3-1', 's3-2'],
          collapsed: false,
          color: '#10b981',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'right'
        },
        {
          id: 's3-1',
          text: 'Tier Calculator',
          x: 460,
          y: -125,
          width: 140,
          height: 36,
          parentId: 's3',
          childrenIds: [],
          color: '#10b981',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'right'
        },
        {
          id: 's3-2',
          text: 'Custom Quote Portal',
          x: 460,
          y: -75,
          width: 155,
          height: 36,
          parentId: 's3',
          childrenIds: [],
          color: '#10b981',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'right'
        },
        {
          id: 's4',
          text: 'Documentation & Guides',
          x: 260,
          y: 0,
          width: 175,
          height: 40,
          parentId: 'root',
          childrenIds: ['s4-1'],
          collapsed: false,
          color: '#f59e0b',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'right'
        },
        {
          id: 's4-1',
          text: 'Interactive Code Walkthroughs',
          x: 490,
          y: 0,
          width: 195,
          height: 36,
          parentId: 's4',
          childrenIds: [],
          color: '#f59e0b',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'right'
        },
        {
          id: 's5',
          text: 'Company & Press',
          x: 260,
          y: 100,
          width: 145,
          height: 40,
          parentId: 'root',
          childrenIds: ['s5-1'],
          collapsed: false,
          color: '#06b6d4',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'right'
        },
        {
          id: 's5-1',
          text: 'Investor Relations',
          x: 460,
          y: 100,
          width: 145,
          height: 36,
          parentId: 's5',
          childrenIds: [],
          color: '#06b6d4',
          borderStyle: 'border',
          lineStyle: 'bezier',
          side: 'right'
        }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 3. PRODUCT TEAM POD STRUCTURE
  {
    id: 'tpl-product-pod-structure',
    title: 'Product Team Pod Structure',
    category: 'popular',
    tags: ['Agile', 'Product Management', 'Pods'],
    subtitle: 'Whimsical template',
    description: 'Cross-functional agile pod model mapping Product Managers, Tech Leads, Product Designers, QA, and Engineers into autonomous delivery squads.',
    previewType: 'orgchart',
    boardData: {
      title: 'Product Team Pod Structure',
      workspaceId: 'ws-default',
      mindMapNodes: [
        {
          id: 'root',
          text: 'Role Title\nFull Name',
          x: 0,
          y: -120,
          width: 210,
          height: 52,
          parentId: null,
          childrenIds: ['pod-activation', 'pod-monetization', 'pod-retention'],
          collapsed: false,
          color: '#7c3aed',
          borderStyle: 'fill',
          lineStyle: 'stepped',
          side: 'root'
        },
        // Pod 1: Activation
        {
          id: 'pod-activation',
          text: 'Role Title\nFull Name',
          x: -360,
          y: 10,
          width: 240,
          height: 50,
          parentId: 'root',
          childrenIds: ['pod1-pm', 'pod1-tl', 'pod1-ux'],
          collapsed: false,
          color: '#3b82f6',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'pod1-pm',
          text: 'Product Manager (Onboarding)',
          x: -470,
          y: 100,
          width: 195,
          height: 40,
          parentId: 'pod-activation',
          childrenIds: [],
          color: '#3b82f6',
          borderStyle: 'border',
          side: 'left'
        },
        {
          id: 'pod1-tl',
          text: 'Tech Lead (Full Stack)',
          x: -470,
          y: 155,
          width: 175,
          height: 40,
          parentId: 'pod-activation',
          childrenIds: [],
          color: '#3b82f6',
          borderStyle: 'border',
          side: 'left'
        },
        {
          id: 'pod1-ux',
          text: 'Product Designer (Figma)',
          x: -470,
          y: 210,
          width: 180,
          height: 40,
          parentId: 'pod-activation',
          childrenIds: [],
          color: '#3b82f6',
          borderStyle: 'border',
          side: 'left'
        },

        // Pod 2: Monetization
        {
          id: 'pod-monetization',
          text: 'Role Title\nFull Name',
          x: 0,
          y: 20,
          width: 230,
          height: 50,
          parentId: 'root',
          childrenIds: ['pod2-pm', 'pod2-tl', 'pod2-data'],
          collapsed: false,
          color: '#10b981',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'root'
        },
        {
          id: 'pod2-pm',
          text: 'Lead Monetization PM',
          x: -110,
          y: 110,
          width: 170,
          height: 40,
          parentId: 'pod-monetization',
          childrenIds: [],
          color: '#10b981',
          borderStyle: 'border',
          side: 'root'
        },
        {
          id: 'pod2-tl',
          text: 'Staff Payments Engineer',
          x: 80,
          y: 110,
          width: 175,
          height: 40,
          parentId: 'pod-monetization',
          childrenIds: [],
          color: '#10b981',
          borderStyle: 'border',
          side: 'root'
        },
        {
          id: 'pod2-data',
          text: 'Data Scientist (Experimentation)',
          x: 0,
          y: 170,
          width: 210,
          height: 40,
          parentId: 'pod-monetization',
          childrenIds: [],
          color: '#10b981',
          borderStyle: 'border',
          side: 'root'
        },

        // Pod 3: Retention
        {
          id: 'pod-retention',
          text: 'Role Title\nFull Name',
          x: 360,
          y: 10,
          width: 235,
          height: 50,
          parentId: 'root',
          childrenIds: ['pod3-pm', 'pod3-eng'],
          collapsed: false,
          color: '#f59e0b',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },
        {
          id: 'pod3-pm',
          text: 'Growth Product Manager',
          x: 470,
          y: 100,
          width: 175,
          height: 40,
          parentId: 'pod-retention',
          childrenIds: [],
          color: '#f59e0b',
          borderStyle: 'border',
          side: 'right'
        },
        {
          id: 'pod3-eng',
          text: 'Mobile Engineers (iOS/Android)',
          x: 470,
          y: 155,
          width: 200,
          height: 40,
          parentId: 'pod-retention',
          childrenIds: [],
          color: '#f59e0b',
          borderStyle: 'border',
          side: 'right'
        }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 4. BRAINSTORMING WORKSHOP & DESIGN SPRINT
  {
    id: 'tpl-brainstorming',
    title: 'Brainstorming Workshop',
    category: 'whiteboarding',
    tags: ['Design Sprint', 'Sticky Notes', 'Ideation'],
    subtitle: 'Whimsical template',
    description: 'Post-it session matrix for collaborative design thinking workshops. Group observations, user pain points, low-hanging fruit, and high-impact ideas.',
    previewType: 'stickies',
    boardData: {
      title: 'Brainstorming Workshop',
      workspaceId: 'ws-default',
      mindMapNodes: [
        {
          id: 'root',
          text: 'Role Title\nFull Name',
          x: 0,
          y: 0,
          width: 230,
          height: 52,
          parentId: null,
          childrenIds: ['cat-pain', 'cat-ideas', 'cat-quick'],
          color: '#eab308',
          borderStyle: 'fill',
          lineStyle: 'bezier',
          side: 'root'
        },
        {
          id: 'cat-pain',
          text: '🚨 Dores Críticas dos Clientes',
          x: -280,
          y: -80,
          width: 195,
          height: 42,
          parentId: 'root',
          childrenIds: [],
          color: '#ef4444',
          borderStyle: 'border',
          side: 'left'
        },
        {
          id: 'cat-ideas',
          text: '💡 Soluções Disruptivas',
          x: 280,
          y: -80,
          width: 180,
          height: 42,
          parentId: 'root',
          childrenIds: [],
          color: '#8b5cf6',
          borderStyle: 'border',
          side: 'right'
        },
        {
          id: 'cat-quick',
          text: '⚡ Ganhos Rápidos (Quick Wins)',
          x: 280,
          y: 80,
          width: 205,
          height: 42,
          parentId: 'root',
          childrenIds: [],
          color: '#10b981',
          borderStyle: 'border',
          side: 'right'
        }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 's1', x: -440, y: -200, width: 140, height: 120, text: 'Usuários demoram 4 dias para configurar integrações', color: '#fef08a' },
        { id: 's2', x: -280, y: -200, width: 140, height: 120, text: 'Falta de relatórios executivos em PDF vetorizado', color: '#fed7aa' },
        { id: 's3', x: 260, y: -200, width: 140, height: 120, text: 'Assistente IA nativo gerador de árvore com 1 clique', color: '#e9d5ff' },
        { id: 's4', x: 420, y: -200, width: 140, height: 120, text: 'Modo apresentação com transições suaves de slide', color: '#bbf7d0' },
        { id: 's5', x: 260, y: 150, width: 140, height: 120, text: 'Atalhos de teclado: Tab (filho) e Enter (irmão)', color: '#bae6fd' },
        { id: 's6', x: 420, y: 150, width: 140, height: 120, text: 'Paleta corporativa sóbria sem sombras toscas', color: '#bbf7d0' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 5. SIMPLE FLOWCHART
  {
    id: 'tpl-simple-flowchart',
    title: 'Simple Flowchart',
    category: 'diagrams',
    tags: ['Flowcharts', 'Processes', 'Decisions'],
    subtitle: 'Whimsical template',
    description: 'Crisp workflow decision tree diagram illustrating customer onboarding flow with conditional branches, validation steps, and fallbacks.',
    previewType: 'flowchart',
    boardData: {
      title: 'Simple Flowchart',
      workspaceId: 'ws-default',
      mindMapNodes: [
        {
          id: 'root',
          text: 'Start: User Registration Event',
          x: 0,
          y: -100,
          width: 200,
          height: 46,
          parentId: null,
          childrenIds: ['step-verify'],
          collapsed: false,
          color: '#6366f1',
          borderStyle: 'fill',
          lineStyle: 'stepped',
          side: 'root'
        },
        {
          id: 'step-verify',
          text: 'Role Title\nFull Name',
          x: 0,
          y: 0,
          width: 220,
          height: 52,
          parentId: 'root',
          childrenIds: ['branch-corp', 'branch-public'],
          collapsed: false,
          color: '#f59e0b',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'root'
        },
        {
          id: 'branch-corp',
          text: 'Role Title\nFull Name',
          x: -240,
          y: 110,
          width: 235,
          height: 52,
          parentId: 'step-verify',
          childrenIds: ['done-enterprise'],
          color: '#10b981',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        },
        {
          id: 'done-enterprise',
          text: 'Route to Dedicated CS Rep',
          x: -240,
          y: 200,
          width: 195,
          height: 42,
          parentId: 'branch-corp',
          childrenIds: [],
          color: '#10b981',
          borderStyle: 'border',
          side: 'left'
        },
        {
          id: 'branch-public',
          text: 'Role Title\nFull Name',
          x: 240,
          y: 110,
          width: 250,
          height: 52,
          parentId: 'step-verify',
          childrenIds: ['done-selfserve'],
          color: '#3b82f6',
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        },
        {
          id: 'done-selfserve',
          text: 'Trigger 14-Day Free Trial',
          x: 240,
          y: 200,
          width: 195,
          height: 42,
          parentId: 'branch-public',
          childrenIds: [],
          color: '#3b82f6',
          borderStyle: 'border',
          side: 'right'
        }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 6. IOS WIREFRAME KIT
  {
    id: 'tpl-ios-wireframe',
    title: 'iOS Wireframe Kit',
    category: 'wireframes',
    tags: ['Mobile UX', 'iOS', 'Prototypes'],
    subtitle: 'Whimsical template',
    description: 'Pixel-perfect mobile application wireframe layout including Auth splash screen, Home dashboard feed, and Settings modal.',
    previewType: 'wireframe',
    boardData: {
      title: 'iOS Wireframe Kit',
      workspaceId: 'ws-default',
      mindMapNodes: [
        {
          id: 'root',
          text: 'Role Title\nFull Name',
          x: 0,
          y: -140,
          width: 210,
          height: 50,
          parentId: null,
          childrenIds: ['screen-auth', 'screen-feed', 'screen-settings'],
          color: '#0284c7',
          borderStyle: 'fill',
          side: 'root'
        },
        {
          id: 'screen-auth',
          text: 'Screen 1: Login & FaceID',
          x: -280,
          y: -30,
          width: 185,
          height: 40,
          parentId: 'root',
          childrenIds: [],
          color: '#0284c7',
          borderStyle: 'border',
          side: 'left'
        },
        {
          id: 'screen-feed',
          text: 'Screen 2: Activity Feed',
          x: 0,
          y: -30,
          width: 175,
          height: 40,
          parentId: 'root',
          childrenIds: [],
          color: '#0284c7',
          borderStyle: 'border',
          side: 'root'
        },
        {
          id: 'screen-settings',
          text: 'Screen 3: Profile & Billing',
          x: 280,
          y: -30,
          width: 185,
          height: 40,
          parentId: 'root',
          childrenIds: [],
          color: '#0284c7',
          borderStyle: 'border',
          side: 'right'
        }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [
        { id: 'wf1', type: 'card', x: -370, y: 40, width: 190, height: 280, label: 'Splash Screen' },
        { id: 'wf2', type: 'button', x: -345, y: 220, width: 140, height: 38, label: 'Sign in with Apple' },
        { id: 'wf3', type: 'input', x: -345, y: 150, width: 140, height: 34, label: 'name@company.com' },

        { id: 'wf4', type: 'card', x: -95, y: 40, width: 190, height: 280, label: 'Dashboard Feed' },
        { id: 'wf5', type: 'toggle', x: -70, y: 150, width: 140, height: 32, label: 'Real-time Alerts' },
        { id: 'wf6', type: 'button', x: -70, y: 220, width: 140, height: 38, label: 'Create New MindMap' },

        { id: 'wf7', type: 'card', x: 185, y: 40, width: 190, height: 280, label: 'Account Settings' },
        { id: 'wf8', type: 'checkbox', x: 210, y: 150, width: 140, height: 32, label: 'Dark Mode Enabled', checked: true },
        { id: 'wf9', type: 'button', x: 210, y: 220, width: 140, height: 38, label: 'Upgrade to Pro Plan' }
      ],
      texts: [],
      drawings: []
    }
  }
];
