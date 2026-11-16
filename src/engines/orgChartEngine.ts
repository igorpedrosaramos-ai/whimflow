import { MindMapNode } from '../types';
import { ActionHandle, NodeDirection, TemplateEngine } from './templateEngineTypes';

export class OrgChartEngine implements TemplateEngine {
  id = 'orgchart' as const;
  name = 'Motor de Organograma e Pods de Produto';

  getActionHandles(node: MindMapNode, isRoot: boolean): ActionHandle[] {
    const handles: ActionHandle[] = [];
    const nodeColor = node.color || '#6366f1';

    // 1. Alça Principal: Adicionar Subordinado (Direção Sul / Abaixo)
    handles.push({
      id: `${node.id}-add-subordinate`,
      direction: 'bottom',
      tooltip: 'Adicionar subordinado abaixo (Atalho: Tab)',
      color: nodeColor,
      style: {
        position: 'absolute',
        bottom: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 65
      }
    });

    // 2. Alça Lateral Direita: Adicionar Par / Colega à Direita (apenas para não-raiz)
    if (!isRoot) {
      handles.push({
        id: `${node.id}-add-peer-right`,
        direction: 'right',
        tooltip: 'Adicionar par / colega no mesmo nível (Atalho: Enter)',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '50%',
          right: '-12px',
          transform: 'translateY(-50%)',
          zIndex: 65
        }
      });

      // 3. Alça Lateral Esquerda: Adicionar Par / Colega à Esquerda
      handles.push({
        id: `${node.id}-add-peer-left`,
        direction: 'left',
        tooltip: 'Adicionar par / colega à esquerda',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '50%',
          left: '-12px',
          transform: 'translateY(-50%)',
          zIndex: 65
        }
      });
    }

    return handles;
  }

  computeNewNode(
    parent: MindMapNode,
    direction: NodeDirection,
    paletteColor: string,
    existingChildrenCount: number
  ): Partial<MindMapNode> {
    const color = parent.side === 'root' ? paletteColor : (parent.color || paletteColor);
    
    // Se for para baixo (subordinado): desce no eixo Y
    if (direction === 'bottom') {
      const offsetX = (existingChildrenCount - 1) * 160;
      return {
        text: 'Novo cargo',
        x: (parent.x || 0) + offsetX,
        y: (parent.y || 0) + 120,
        parentId: parent.id,
        color,
        borderStyle: 'border',
        lineStyle: 'stepped',
        side: parent.side === 'root' ? 'root' : parent.side
      };
    }

    // Se for para a direita (par / colega): desloca no eixo X mantendo a mesma altura
    if (direction === 'right') {
      return {
        text: 'Novo cargo',
        x: (parent.x || 0) + (parent.width || 175) + 40,
        y: parent.y || 0,
        parentId: parent.parentId || parent.id,
        color,
        borderStyle: 'border',
        lineStyle: 'stepped',
        side: parent.side
      };
    }

    // Se for para a esquerda (par à esquerda)
    return {
      text: 'Novo cargo',
      x: (parent.x || 0) - (parent.width || 175) - 40,
      y: parent.y || 0,
      parentId: parent.parentId || parent.id,
      color,
      borderStyle: 'border',
      lineStyle: 'stepped',
      side: parent.side
    };
  }

  getDefaultLineStyle(): 'stepped' {
    return 'stepped';
  }

  isVerticalHierarchy(): boolean {
    return true;
  }

  supportsFreeRepositioning(): boolean {
    return true;
  }
}

export const orgChartEngine = new OrgChartEngine();
