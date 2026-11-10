export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'mindmap' 
  | 'sticky' 
  | 'wireframe' 
  | 'draw' 
  | 'present';

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  offsetX?: number; // Deslocamento manual livre via arraste
  offsetY?: number; // Deslocamento manual livre via arraste
  width?: number;
  height?: number;
  parentId?: string | null;
  childrenIds: string[];
  collapsed?: boolean;
  color?: string; // Cor principal da linha e do nó
  borderColor?: string;
  borderStyle?: 'accent' | 'border' | 'fill' | 'text';
  lineStyle?: 'bezier' | 'straight' | 'stepped';
  fontSize?: 'small' | 'medium' | 'large';
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  icon?: string; // Emoji ou ícone corporativo associado
  link?: string; // URL externa associada
  notes?: string; // Notas ou descrição complementar
  side?: 'left' | 'right' | 'root';
}

export type ShapeType = 'rectangle' | 'rounded' | 'diamond' | 'pill' | 'circle' | 'card';

export interface FlowShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  borderColor?: string;
  textColor?: string;
}

export interface Connector {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  style?: 'curve' | 'straight' | 'orthogonal';
}

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  author?: string;
}

export type WireframeType = 'button' | 'input' | 'toggle' | 'checkbox' | 'card';

export interface WireframeItem {
  id: string;
  type: WireframeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  checked?: boolean;
}

export interface TextItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  color?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
}

export interface SlideSection {
  id: string;
  title: string;
  nodeIds: string[];
}

export interface BoardVersionSnapshot {
  id: string;
  timestamp: string;
  title?: string;
  name?: string;
  description?: string;
  nodeCount: number;
  objectCount: number;
  boardData: Board;
}

export interface DocDiscussion {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface Board {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  isPrivate?: boolean;
  isStarred?: boolean;
  docContent?: string;
  discussions?: DocDiscussion[];
  historySnapshots?: BoardVersionSnapshot[];
  mindMapNodes: MindMapNode[];
  shapes: FlowShape[];
  connectors: Connector[];
  stickies: StickyNote[];
  wireframes: WireframeItem[];
  texts: TextItem[];
  drawings: DrawingStroke[];
  sections?: SlideSection[];
}

export interface Workspace {
  id: string;
  name: string;
  isPrivate?: boolean;
}
