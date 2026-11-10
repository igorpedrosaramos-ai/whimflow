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
  // 1. SIMPLE ORG CHART (Foto 4 do Whimsical)
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
      layoutType: 'orgchart',
      mindMapNodes: [
        { id: 'root', text: 'Role Title\nFull Name', x: 0, y: -140, width: 170, height: 52, parentId: null, childrenIds: ['vp-eng', 'vp-prod', 'vp-sales', 'vp-mktg'], collapsed: false, color: '#6366f1', borderStyle: 'border', lineStyle: 'stepped', side: 'root' },
        { id: 'vp-eng', text: 'Role Title\nFull Name', x: -360, y: -10, width: 165, height: 48, parentId: 'root', childrenIds: ['eng-lead-fe', 'eng-lead-be'], collapsed: false, color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-lead-fe', text: 'Role Title\nFull Name', x: -460, y: 90, width: 155, height: 46, parentId: 'vp-eng', childrenIds: ['eng-fe-dev1'], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-fe-dev1', text: 'Role Title\nFull Name', x: -460, y: 175, width: 155, height: 44, parentId: 'eng-lead-fe', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-lead-be', text: 'Role Title\nFull Name', x: -270, y: 90, width: 155, height: 46, parentId: 'vp-eng', childrenIds: ['eng-be-dev1'], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'eng-be-dev1', text: 'Role Title\nFull Name', x: -270, y: 175, width: 155, height: 44, parentId: 'eng-lead-be', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'vp-prod', text: 'Role Title\nFull Name', x: -100, y: -10, width: 165, height: 48, parentId: 'root', childrenIds: ['lead-pm'], collapsed: false, color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'lead-pm', text: 'Role Title\nFull Name', x: -100, y: 90, width: 165, height: 46, parentId: 'vp-prod', childrenIds: ['sr-designer'], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'sr-designer', text: 'Role Title\nFull Name', x: -100, y: 175, width: 165, height: 44, parentId: 'lead-pm', childrenIds: [], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'vp-sales', text: 'Role Title\nFull Name', x: 160, y: -10, width: 165, height: 48, parentId: 'root', childrenIds: ['ops-manager', 'cs-lead'], collapsed: false, color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'ops-manager', text: 'Role Title\nFull Name', x: 80, y: 90, width: 160, height: 46, parentId: 'vp-sales', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'cs-lead', text: 'Role Title\nFull Name', x: 250, y: 90, width: 175, height: 46, parentId: 'vp-sales', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'vp-mktg', text: 'Role Title\nFull Name', x: 460, y: -10, width: 165, height: 48, parentId: 'root', childrenIds: ['growth-lead', 'brand-lead'], collapsed: false, color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'growth-lead', text: 'Role Title\nFull Name', x: 400, y: 90, width: 165, height: 46, parentId: 'vp-mktg', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'brand-lead', text: 'Role Title\nFull Name', x: 580, y: 90, width: 160, height: 46, parentId: 'vp-mktg', childrenIds: ['copywriter'], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'copywriter', text: 'Role Title\nFull Name', x: 580, y: 175, width: 160, height: 44, parentId: 'brand-lead', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 2. SITEMAP WITH MIND MAPS (Whimsical Canonical Sitemap)
  {
    id: 'tpl-sitemap-mindmap',
    title: 'Sitemap with Mind Maps',
    category: 'diagrams',
    tags: ['Sitemaps', 'Information architecture', 'Mind maps'],
    subtitle: 'Whimsical template',
    description: 'Map out the full architecture of your website or app. Clearly visualizes parent categories, sub-navigation, user accounts, and footer hierarchies.',
    previewType: 'mindmap',
    boardData: {
      title: 'Sitemap with Mind Maps',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Platform Sitemap', x: 0, y: 0, width: 180, height: 46, parentId: null, childrenIds: ['mkt-site', 'app-portal'], collapsed: false, color: '#8b5cf6', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
        { id: 'mkt-site', text: 'Marketing Website', x: -280, y: 0, width: 180, height: 44, parentId: 'root', childrenIds: ['page-home', 'page-pricing', 'page-blog'], collapsed: false, color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'page-home', text: 'Homepage & Hero', x: -480, y: -70, width: 160, height: 40, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'page-pricing', text: 'Pricing & Plans Matrix', x: -480, y: 0, width: 170, height: 40, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'page-blog', text: 'Blog & Content Hub', x: -480, y: 70, width: 165, height: 40, parentId: 'mkt-site', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'app-portal', text: 'Web App Console', x: 280, y: 0, width: 175, height: 44, parentId: 'root', childrenIds: ['app-auth', 'app-dash', 'app-billing'], collapsed: false, color: '#0d9488', borderStyle: 'border', side: 'right' },
        { id: 'app-auth', text: 'Auth & SSO Login', x: 480, y: -70, width: 160, height: 40, parentId: 'app-portal', childrenIds: [], color: '#0d9488', borderStyle: 'accent', side: 'right' },
        { id: 'app-dash', text: 'Workspace Dashboard', x: 480, y: 0, width: 175, height: 40, parentId: 'app-portal', childrenIds: [], color: '#0d9488', borderStyle: 'accent', side: 'right' },
        { id: 'app-billing', text: 'Subscription & Invoices', x: 480, y: 70, width: 180, height: 40, parentId: 'app-portal', childrenIds: [], color: '#0d9488', borderStyle: 'accent', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 3. STARTER SITEMAP
  {
    id: 'tpl-starter-sitemap',
    title: 'Starter Sitemap',
    category: 'suggested',
    tags: ['Sitemaps', 'Navigation', 'Website structure'],
    subtitle: 'Whimsical template',
    description: 'A clean, lightweight sitemap baseline to plan your site hierarchy, primary pages, and secondary drop-down menus in minutes.',
    previewType: 'mindmap',
    boardData: {
      title: 'Starter Sitemap',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Website Homepage', x: 0, y: 0, width: 170, height: 46, parentId: null, childrenIds: ['nav-prod', 'nav-sol', 'nav-res', 'nav-comp'], collapsed: false, color: '#8b5cf6', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
        { id: 'nav-prod', text: 'Products', x: 260, y: -100, width: 140, height: 40, parentId: 'root', childrenIds: ['prod-core', 'prod-integrations'], collapsed: false, color: '#0284c7', borderStyle: 'border', side: 'right' },
        { id: 'prod-core', text: 'Core Platform Features', x: 450, y: -120, width: 170, height: 38, parentId: 'nav-prod', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'prod-integrations', text: 'Integrations & API', x: 450, y: -75, width: 160, height: 38, parentId: 'nav-prod', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'right' },
        { id: 'nav-sol', text: 'Solutions', x: 260, y: -20, width: 140, height: 40, parentId: 'root', childrenIds: ['sol-enterprise', 'sol-startups'], collapsed: false, color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'sol-enterprise', text: 'For Enterprise', x: 450, y: -40, width: 150, height: 38, parentId: 'nav-sol', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 'sol-startups', text: 'For Startups & SMBs', x: 450, y: 5, width: 165, height: 38, parentId: 'nav-sol', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' },
        { id: 'nav-res', text: 'Resources', x: 260, y: 65, width: 140, height: 40, parentId: 'root', childrenIds: ['res-docs', 'res-webinars'], collapsed: false, color: '#f59e0b', borderStyle: 'border', side: 'right' },
        { id: 'res-docs', text: 'Documentation & Guides', x: 450, y: 50, width: 175, height: 38, parentId: 'nav-res', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'right' },
        { id: 'res-webinars', text: 'Customer Success Stories', x: 450, y: 95, width: 180, height: 38, parentId: 'nav-res', childrenIds: [], color: '#f59e0b', borderStyle: 'accent', side: 'right' },
        { id: 'nav-comp', text: 'Company', x: -260, y: 0, width: 140, height: 40, parentId: 'root', childrenIds: ['comp-about', 'comp-careers'], collapsed: false, color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'comp-about', text: 'About Us & Mission', x: -450, y: -30, width: 160, height: 38, parentId: 'nav-comp', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' },
        { id: 'comp-careers', text: 'Careers (We are hiring!)', x: -450, y: 30, width: 175, height: 38, parentId: 'nav-comp', childrenIds: [], color: '#ec4899', borderStyle: 'accent', side: 'left' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 4. SITE MAP VARIATIONS (Fiel à Foto 2 do Whimsical)
  {
    id: 'tpl-sitemap-variations',
    title: 'Site Map Variations',
    category: 'diagrams',
    tags: ['Sitemaps', 'IA', 'Architecture'],
    subtitle: 'Whimsical template',
    description: 'Compare three alternative website navigation structures (Flat, Deep, and Hybrid) to choose the best customer experience before coding.',
    previewType: 'mindmap',
    boardData: {
      title: 'Site Map Variations',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Platform', x: 0, y: 0, width: 140, height: 46, parentId: null, childrenIds: ['mkt-site', 'user-dash', 'docs-hub', 'shop-store', 'dev-portal'], collapsed: false, color: '#7c3aed', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
        { id: 'mkt-site', text: 'Marketing Website', x: -280, y: -70, width: 170, height: 42, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'user-dash', text: 'User Dashboard', x: -280, y: 70, width: 165, height: 42, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'left' },
        { id: 'docs-hub', text: 'Documentation Hub', x: 280, y: -90, width: 180, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'shop-store', text: 'E-Commerce Store', x: 280, y: 0, width: 170, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' },
        { id: 'dev-portal', text: 'API & Developer Portal', x: 280, y: 90, width: 195, height: 42, parentId: 'root', childrenIds: [], color: '#06b6d4', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
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
      layoutType: 'orgchart',
      mindMapNodes: [
        { id: 'root', text: 'Start: User Registration Event', x: 0, y: -100, width: 210, height: 46, parentId: null, childrenIds: ['step-verify'], collapsed: false, color: '#6366f1', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
        { id: 'step-verify', text: 'Decision: Business Email Domain?', x: 0, y: 0, width: 240, height: 48, parentId: 'root', childrenIds: ['branch-corp', 'branch-public'], collapsed: false, color: '#f59e0b', borderStyle: 'border', lineStyle: 'stepped', side: 'root' },
        { id: 'branch-corp', text: 'Yes: Route to Enterprise Dedicated CS', x: -240, y: 110, width: 250, height: 46, parentId: 'step-verify', childrenIds: ['done-enterprise'], color: '#10b981', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'done-enterprise', text: 'Schedule 30-min Executive Demo', x: -240, y: 200, width: 230, height: 42, parentId: 'branch-corp', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'left' },
        { id: 'branch-public', text: 'No: Trigger Self-Serve 14-Day Trial', x: 240, y: 110, width: 250, height: 46, parentId: 'step-verify', childrenIds: ['done-selfserve'], color: '#3b82f6', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'done-selfserve', text: 'Send Automated Interactive Product Tour', x: 240, y: 200, width: 260, height: 42, parentId: 'branch-public', childrenIds: [], color: '#3b82f6', borderStyle: 'accent', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 6. PRODUCT TEAM POD STRUCTURE (Fiel à Foto 3 do Whimsical)
  {
    id: 'tpl-product-pod-structure',
    title: 'Product Team Pod Structure',
    category: 'diagrams',
    tags: ['Org charts', 'Product pods', 'Agile'],
    subtitle: 'Whimsical template',
    description: 'Empower cross-functional teams with pod-based structures. Clearly maps the PM, Tech Lead, Designers, and Engineers for each functional pod.',
    previewType: 'orgchart',
    boardData: {
      title: 'Product Team Pod Structure',
      workspaceId: 'ws-default',
      layoutType: 'orgchart',
      mindMapNodes: [
        { id: 'root', text: 'Role Title\nFull Name', x: 0, y: -130, width: 140, height: 48, parentId: null, childrenIds: ['pod-purple', 'pod-blue', 'pod-teal', 'pod-orange'], collapsed: false, color: '#6366f1', borderStyle: 'border', lineStyle: 'stepped', side: 'root' },
        // Pod 1 (Roxo)
        { id: 'pod-purple', text: 'Role Title\nFull Name', x: -360, y: 0, width: 135, height: 46, parentId: 'root', childrenIds: ['purp-sub1', 'purp-sub2'], collapsed: false, color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'purp-sub1', text: 'Role Title\nFull Name', x: -440, y: 90, width: 130, height: 44, parentId: 'pod-purple', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'purp-sub2', text: 'Role Title\nFull Name', x: -280, y: 90, width: 130, height: 44, parentId: 'pod-purple', childrenIds: ['purp-leaf'], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'purp-leaf', text: 'Role Title\nFull Name', x: -280, y: 170, width: 130, height: 44, parentId: 'purp-sub2', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        // Pod 2 (Azul)
        { id: 'pod-blue', text: 'Role Title\nFull Name', x: -120, y: 0, width: 135, height: 46, parentId: 'root', childrenIds: ['blue-sub1'], collapsed: false, color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'blue-sub1', text: 'Role Title\nFull Name', x: -120, y: 90, width: 130, height: 44, parentId: 'pod-blue', childrenIds: ['blue-leaf'], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        { id: 'blue-leaf', text: 'Role Title\nFull Name', x: -120, y: 170, width: 130, height: 44, parentId: 'blue-sub1', childrenIds: [], color: '#0284c7', borderStyle: 'border', lineStyle: 'stepped', side: 'left' },
        // Pod 3 (Teal)
        { id: 'pod-teal', text: 'Role Title\nFull Name', x: 120, y: 0, width: 135, height: 46, parentId: 'root', childrenIds: ['teal-sub1', 'teal-sub2'], collapsed: false, color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'teal-sub1', text: 'Role Title\nFull Name', x: 40, y: 90, width: 130, height: 44, parentId: 'pod-teal', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'teal-sub2', text: 'Role Title\nFull Name', x: 200, y: 90, width: 130, height: 44, parentId: 'pod-teal', childrenIds: [], color: '#0d9488', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        // Pod 4 (Laranja)
        { id: 'pod-orange', text: 'Role Title\nFull Name', x: 360, y: 0, width: 135, height: 46, parentId: 'root', childrenIds: ['org-sub1', 'org-sub2'], collapsed: false, color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'org-sub1', text: 'Role Title\nFull Name', x: 280, y: 90, width: 130, height: 44, parentId: 'pod-orange', childrenIds: ['org-leaf'], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'org-leaf', text: 'Role Title\nFull Name', x: 280, y: 170, width: 130, height: 44, parentId: 'org-sub1', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' },
        { id: 'org-sub2', text: 'Role Title\nFull Name', x: 440, y: 90, width: 130, height: 44, parentId: 'pod-orange', childrenIds: [], color: '#ea580c', borderStyle: 'border', lineStyle: 'stepped', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 7. BRAINSTORMING WORKSHOP
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
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Design Thinking Session\nTheme: Next-Gen Canvas', x: 0, y: 0, width: 220, height: 50, parentId: null, childrenIds: ['cat-pain', 'cat-ideas', 'cat-quick'], color: '#eab308', borderStyle: 'fill', lineStyle: 'bezier', side: 'root' },
        { id: 'cat-pain', text: 'User Pain Points', x: -290, y: -70, width: 185, height: 42, parentId: 'root', childrenIds: [], color: '#ef4444', borderStyle: 'border', side: 'left' },
        { id: 'cat-ideas', text: 'Disruptive Solutions', x: 290, y: -70, width: 185, height: 42, parentId: 'root', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'right' },
        { id: 'cat-quick', text: 'Quick Wins (< 1 Sprint)', x: 290, y: 70, width: 195, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 's1', x: -480, y: -190, width: 145, height: 110, text: 'Users spend 15 min manually rearranging nodes', color: '#fef08a' },
        { id: 's2', x: -320, y: -190, width: 145, height: 110, text: 'Lack of instant 1-click executive PDF export', color: '#fed7aa' },
        { id: 's3', x: 260, y: -190, width: 145, height: 110, text: 'AI agent converts text prompt directly into diagram', color: '#e9d5ff' },
        { id: 's4', x: 420, y: -190, width: 145, height: 110, text: 'Multi-select drag with magnetic alignment guides', color: '#bbf7d0' },
        { id: 's5', x: 260, y: 150, width: 145, height: 110, text: 'Keyboard shortcuts for Tab/Enter brother creation', color: '#bae6fd' },
        { id: 's6', x: 420, y: 150, width: 145, height: 110, text: 'High-contrast typography accessible to all users', color: '#fef08a' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 8. DIGITAL SKETCHBOOK
  {
    id: 'tpl-digital-sketchbook',
    title: 'Digital Sketchbook',
    category: 'whiteboarding',
    tags: ['Whiteboarding', 'Sketches', 'Ideation'],
    subtitle: 'Whimsical template',
    description: 'An open-ended digital sketchbook for rough UI sketches, layout drafts, sticky note thoughts, and freeform brainstorming.',
    previewType: 'sketchbook',
    boardData: {
      title: 'Digital Sketchbook',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Digital Sketchbook\nConcept Explorations', x: 0, y: -120, width: 210, height: 48, parentId: null, childrenIds: ['s-ui', 's-ux'], color: '#6366f1', borderStyle: 'border', side: 'root' },
        { id: 's-ui', text: 'Visual UI Direction', x: -260, y: -120, width: 170, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'accent', side: 'left' },
        { id: 's-ux', text: 'Gesture & Interaction Model', x: 260, y: -120, width: 215, height: 40, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'accent', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'sk-note1', x: -350, y: -20, width: 150, height: 110, text: '💡 Keep the toolbar floating on the left with zero overlap', color: '#fef08a' },
        { id: 'sk-note2', x: 200, y: -20, width: 150, height: 110, text: '✨ Pinch-to-zoom with smooth 60fps pan physics', color: '#e9d5ff' }
      ],
      wireframes: [
        { id: 'sk-wf1', type: 'card', x: -140, y: 10, width: 280, height: 190, label: 'Canvas Layout Prototype' },
        { id: 'sk-wf2', type: 'button', x: -60, y: 140, width: 120, height: 36, label: 'Export PNG' }
      ],
      texts: [],
      drawings: []
    }
  },

  // 9. IOS WIREFRAME KIT
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
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Mobile Application UX\niOS Component Architecture', x: 0, y: -160, width: 220, height: 48, parentId: null, childrenIds: ['screen-auth', 'screen-feed', 'screen-settings'], color: '#0284c7', borderStyle: 'fill', side: 'root' },
        { id: 'screen-auth', text: 'Screen 1: Authentication', x: -320, y: -60, width: 190, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'screen-feed', text: 'Screen 2: Activity Feed', x: 0, y: -60, width: 180, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'root' },
        { id: 'screen-settings', text: 'Screen 3: Profile & Billing', x: 320, y: -60, width: 190, height: 40, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [
        { id: 'wf1', type: 'card', x: -410, y: 20, width: 190, height: 280, label: 'Login & FaceID' },
        { id: 'wf2', type: 'input', x: -385, y: 120, width: 140, height: 34, label: 'user@apple.com' },
        { id: 'wf3', type: 'button', x: -385, y: 200, width: 140, height: 38, label: 'Sign in with Apple' },
        { id: 'wf4', type: 'card', x: -95, y: 20, width: 190, height: 280, label: 'Dashboard Feed' },
        { id: 'wf5', type: 'toggle', x: -70, y: 120, width: 140, height: 32, label: 'Real-time Alerts' },
        { id: 'wf6', type: 'button', x: -70, y: 200, width: 140, height: 38, label: 'Create New Board' },
        { id: 'wf7', type: 'card', x: 225, y: 20, width: 190, height: 280, label: 'Account Settings' },
        { id: 'wf8', type: 'checkbox', x: 250, y: 120, width: 140, height: 32, label: 'Dark Mode Enabled', checked: true },
        { id: 'wf9', type: 'button', x: 250, y: 200, width: 140, height: 38, label: 'Upgrade to Pro' }
      ],
      texts: [],
      drawings: []
    }
  },

  // 10. SIMPLE PRODUCT WIREFLOW
  {
    id: 'tpl-product-wireflow',
    title: 'Simple Product Wireflow',
    category: 'wireframes',
    tags: ['Wireframes', 'User flows', 'Checkout'],
    subtitle: 'Whimsical template',
    description: 'Wireflow diagram combining mobile wireframe screens with user decision logic arrows. Demonstrates the end-to-end checkout funnel.',
    previewType: 'wireflow',
    boardData: {
      title: 'Simple Product Wireflow',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'E-commerce Checkout Wireflow\nStep-by-Step Conversion Funnel', x: 0, y: -160, width: 240, height: 48, parentId: null, childrenIds: ['flow-cart', 'flow-pay', 'flow-success'], color: '#7c3aed', borderStyle: 'fill', lineStyle: 'stepped', side: 'root' },
        { id: 'flow-cart', text: 'Step 1: Shopping Cart Review', x: -320, y: -60, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'flow-pay', text: 'Step 2: 1-Click Payment Sheet', x: 0, y: -60, width: 210, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'root' },
        { id: 'flow-success', text: 'Step 3: Instant Order Confirmed', x: 320, y: -60, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'wf-note', x: -160, y: 310, width: 320, height: 75, text: '⚡ Micro-interaction: Apple Pay authorizes in < 800ms to maximize checkout conversion', color: '#bbf7d0' }
      ],
      wireframes: [
        { id: 'wflow1', type: 'card', x: -410, y: 15, width: 190, height: 260, label: 'Cart Screen' },
        { id: 'wflow2', type: 'button', x: -385, y: 190, width: 140, height: 38, label: 'Proceed to Pay' },
        { id: 'wflow3', type: 'card', x: -95, y: 15, width: 190, height: 260, label: 'Payment Sheet' },
        { id: 'wflow4', type: 'button', x: -70, y: 190, width: 140, height: 38, label: 'Pay with Pix / Card' },
        { id: 'wflow5', type: 'card', x: 225, y: 15, width: 190, height: 260, label: 'Order Confirmed' },
        { id: 'wflow6', type: 'button', x: 250, y: 190, width: 140, height: 38, label: 'Track Order' }
      ],
      texts: [],
      drawings: []
    }
  },

  // 11. USER RESEARCH PROCESS (Whimsical Product Doc)
  {
    id: 'tpl-user-research-process',
    title: 'User Research Process',
    category: 'product',
    tags: ['Product docs', 'User research', 'Interviews'],
    subtitle: 'Whimsical template',
    description: 'Document framework for synthesizing customer discovery calls, user interviews, pain point clustering, and prioritized action items.',
    previewType: 'doc',
    boardData: {
      title: 'User Research Process',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'User Research Synthesis\nQ4 Discovery Findings', x: 0, y: 0, width: 210, height: 48, parentId: null, childrenIds: ['ur-sit', 'ur-goal', 'ur-act'], color: '#0284c7', borderStyle: 'fill', side: 'root' },
        { id: 'ur-sit', text: 'Situation (What we know)', x: -280, y: -50, width: 195, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'ur-goal', text: 'Goals (What we want to achieve)', x: 280, y: -50, width: 220, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'ur-act', text: 'Next Steps & Sprint Actions', x: 0, y: 110, width: 210, height: 42, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'root' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'doc-s1', x: -440, y: 30, width: 190, height: 110, text: '“I need to share mindmaps with my clients as executive PDFs without them looking like children drawings”', color: '#fef08a' },
        { id: 'doc-s2', x: 240, y: 30, width: 190, height: 110, text: '“The drag and drop must feel magnetic and snappy like Whimsical, not clunky”', color: '#fed7aa' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 12. TEAM HEARTBEAT (Whimsical Product Doc)
  {
    id: 'tpl-team-heartbeat',
    title: 'Team Heartbeat',
    category: 'product',
    tags: ['Product docs', 'Team sync', 'Weekly status'],
    subtitle: 'Whimsical template',
    description: 'Weekly alignment doc for engineering and product teams. Highlights cycle summaries, shipped features, active blockers, and upcoming milestones.',
    previewType: 'doc',
    boardData: {
      title: 'Team Heartbeat',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Weekly Team Heartbeat\nSprint 42 Sync', x: 0, y: 0, width: 200, height: 48, parentId: null, childrenIds: ['hb-ship', 'hb-block', 'hb-next'], color: '#8b5cf6', borderStyle: 'fill', side: 'root' },
        { id: 'hb-ship', text: 'What we shipped 🚢', x: -280, y: -50, width: 180, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'left' },
        { id: 'hb-block', text: 'Blockers & Risks 🚧', x: 280, y: -50, width: 180, height: 42, parentId: 'root', childrenIds: [], color: '#ef4444', borderStyle: 'border', side: 'right' },
        { id: 'hb-next', text: 'Focus for Next Sprint 🎯', x: 0, y: 110, width: 200, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'root' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'hb-s1', x: -440, y: 30, width: 180, height: 100, text: '✅ Replicated Whimsical Dashboard, Doc Editor, and Ask Agent UI', color: '#bbf7d0' },
        { id: 'hb-s2', x: 250, y: 30, width: 180, height: 100, text: '⚠️ Zero bug policy: strict automated CDP regression tests required', color: '#fed7aa' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 13. STARTER PROJECT TIMELINE (Fiel à Foto 4 do Whimsical)
  {
    id: 'tpl-project-timeline',
    title: 'Starter Project Timeline',
    category: 'project',
    tags: ['Project management', 'Roadmaps', 'Milestones'],
    subtitle: 'Whimsical template',
    description: 'Quarterly roadmap timeline layout for tracking project phases, deliverables, dependencies, and executive milestones from Q1 through Q4.',
    previewType: 'timeline',
    boardData: {
      title: 'Starter Project Timeline',
      workspaceId: 'ws-default',
      layoutType: 'timeline',
      mindMapNodes: [
        { id: 'root', text: 'Starter Project Timeline', x: 0, y: -120, width: 220, height: 46, parentId: null, childrenIds: ['q1', 'q2', 'q3', 'q4'], color: '#6366f1', borderStyle: 'fill', lineStyle: 'straight', side: 'root' },
        { id: 'q1', text: 'Q1', x: -330, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['proto'], color: '#3b82f6', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'proto', text: 'Prototype', x: -330, y: 76, width: 130, height: 42, parentId: 'q1', childrenIds: [], color: '#3b82f6', borderStyle: 'border', side: 'root' },
        { id: 'q2', text: 'Q2', x: -110, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['beta'], color: '#10b981', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'beta', text: 'MVP Beta', x: -110, y: 76, width: 130, height: 42, parentId: 'q2', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'root' },
        { id: 'q3', text: 'Q3', x: 110, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['ga'], color: '#f59e0b', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'ga', text: 'Public GA', x: 110, y: 76, width: 130, height: 42, parentId: 'q3', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'root' },
        { id: 'q4', text: 'Q4', x: 330, y: 0, width: 64, height: 36, parentId: 'root', childrenIds: ['scale'], color: '#8b5cf6', borderStyle: 'border', bold: true, side: 'root' },
        { id: 'scale', text: 'Scale', x: 330, y: 76, width: 130, height: 42, parentId: 'q4', childrenIds: [], color: '#8b5cf6', borderStyle: 'border', side: 'root' }
      ],
      shapes: [],
      connectors: [],
      stickies: [],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 14. STARTER GANTT CHART TIMELINE
  {
    id: 'tpl-gantt-chart',
    title: 'Starter Gantt Chart Timeline',
    category: 'project',
    tags: ['Project management', 'Gantt', 'Schedules'],
    subtitle: 'Whimsical template',
    description: 'Horizontal bar schedule diagram mapping overlapping team tasks, dependencies, critical paths, and expected release windows.',
    previewType: 'gantt',
    boardData: {
      title: 'Starter Gantt Chart Timeline',
      workspaceId: 'ws-default',
      layoutType: 'free',
      mindMapNodes: [
        { id: 'root', text: 'Release Schedule Gantt\nVersion 2.0 Launch', x: 0, y: -100, width: 200, height: 46, parentId: null, childrenIds: ['g-track1', 'g-track2'], color: '#0d9488', borderStyle: 'fill', side: 'root' },
        { id: 'g-track1', text: 'Track 1: Frontend & Design (Weeks 1-4)', x: -260, y: 0, width: 245, height: 42, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'g-track2', text: 'Track 2: Backend & Database (Weeks 2-6)', x: 260, y: 0, width: 245, height: 42, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'g-s1', x: -350, y: 90, width: 160, height: 95, text: 'Sprint 1: Canvas Layout & Connector math', color: '#bae6fd' },
        { id: 'g-s2', x: -160, y: 90, width: 160, height: 95, text: 'Sprint 2: Template modal preview & detail view', color: '#fed7aa' },
        { id: 'g-s3', x: 50, y: 90, width: 160, height: 95, text: 'Sprint 3: Doc editor & Gemini API agent', color: '#bbf7d0' },
        { id: 'g-s4', x: 240, y: 90, width: 160, height: 95, text: 'Sprint 4: Regression testing & Production deploy', color: '#fef08a' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  },

  // 15. LENNY RACHITSKY'S INITIATIVE STRATEGY ONE-PAGER
  {
    id: 'tpl-lenny-strategy',
    title: 'Lenny Rachitsky’s Initiative Strategy One-Pager',
    category: 'product',
    tags: ['Product docs', 'Strategy', 'Frameworks'],
    subtitle: 'Whimsical template',
    description: 'The iconic 1-page strategy framework used by top tech companies. Answers: What is it, Why does it matter, Goals, Non-goals, and Metrics.',
    previewType: 'doc',
    boardData: {
      title: 'Initiative Strategy One-Pager',
      workspaceId: 'ws-default',
      layoutType: 'bidirectional',
      mindMapNodes: [
        { id: 'root', text: 'Strategy One-Pager\nInitiative Core Brief', x: 0, y: 0, width: 190, height: 48, parentId: null, childrenIds: ['strat-what', 'strat-why', 'strat-goals', 'strat-metrics'], color: '#7c3aed', borderStyle: 'fill', side: 'root' },
        { id: 'strat-what', text: '1. What is it?\nCore 1-sentence product definition', x: -280, y: -60, width: 235, height: 46, parentId: 'root', childrenIds: [], color: '#0284c7', borderStyle: 'border', side: 'left' },
        { id: 'strat-why', text: '2. Why now?\nMarket shift & competitive urgency', x: -280, y: 60, width: 235, height: 46, parentId: 'root', childrenIds: [], color: '#ec4899', borderStyle: 'border', side: 'left' },
        { id: 'strat-goals', text: '3. Goals & Non-goals\nExplicit scope boundaries', x: 280, y: -60, width: 220, height: 46, parentId: 'root', childrenIds: [], color: '#10b981', borderStyle: 'border', side: 'right' },
        { id: 'strat-metrics', text: '4. Success Metrics\nPrimary North Star & Guardrail KPIs', x: 280, y: 60, width: 245, height: 46, parentId: 'root', childrenIds: [], color: '#f59e0b', borderStyle: 'border', side: 'right' }
      ],
      shapes: [],
      connectors: [],
      stickies: [
        { id: 'strat-note1', x: -440, y: 150, width: 190, height: 100, text: '🎯 North Star: Time to First Diagram Created < 30 seconds', color: '#fef08a' },
        { id: 'strat-note2', x: 240, y: 150, width: 190, height: 100, text: '🛡️ Guardrail: Zero UI lag during 1,000+ node pan & zoom', color: '#bbf7d0' }
      ],
      wireframes: [],
      texts: [],
      drawings: []
    }
  }
];
