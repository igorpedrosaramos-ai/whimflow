export type ToolType = 
  | 'select' 
  | 'hand' 
  | 'mindmap' 
  | 'flowchart' 
  | 'sticky' 
  | 'wireframe' 
  | 'text' 
  | 'draw' 
  | 'present';

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string | null;
  childrenIds: string[];
  collapsed?: boolean;
  color?: string; // hex or color class
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
  color: string; // yellow, cyan, pink, green, dark, purple
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

export interface Board {
  id: string;
  title: string;
  workspaceId: string;
  updatedAt: string;
  mindMapNodes: MindMapNode[];
  shapes: FlowShape[];
  connectors: Connector[];
  stickies: StickyNote[];
  wireframes: WireframeItem[];
  texts: TextItem[];
  drawings: DrawingStroke[];
}

export interface Workspace {
  id: string;
  name: string;
  isPrivate?: boolean;
}
