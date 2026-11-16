import { MindMapNode } from '../types';

export type NodeDirection = 'top' | 'bottom' | 'left' | 'right';

export interface ActionHandle {
  id: string;
  direction: NodeDirection;
  label?: string;
  tooltip: string;
  style: React.CSSProperties;
  color?: string;
}

export interface TemplateEngine {
  id: 'orgchart' | 'flowchart' | 'mindmap' | 'default';
  name: string;
  
  // Retorna quais alças de adição rápida devem aparecer no nó
  getActionHandles(node: MindMapNode, isRoot: boolean): ActionHandle[];
  
  // Calcula as propriedades do novo nó ao ser criado em uma direção específica
  computeNewNode(
    parent: MindMapNode,
    direction: NodeDirection,
    paletteColor: string,
    existingChildrenCount: number
  ): Partial<MindMapNode>;

  // Retorna o estilo da linha para conexões
  getDefaultLineStyle(): 'stepped' | 'bezier' | 'straight';

  // Configurações de layout
  isVerticalHierarchy(): boolean;
  supportsFreeRepositioning(): boolean;
}
