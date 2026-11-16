import { MindMapNode } from '../types';
import { ActionHandle, NodeDirection, TemplateEngine } from './templateEngineTypes';

export class MindMapEngine implements TemplateEngine {
  id = 'mindmap' as const;
  name = 'Motor de Mapa Mental e Arquitetura de Informação';

  getActionHandles(node: MindMapNode, isRoot: boolean): ActionHandle[] {
    const handles: ActionHandle[] = [];
    const nodeColor = node.color || '#8b5cf6';

    if (isRoot) {
      // Nó Raiz: Oferece expansão explícita para Direita e para Esquerda
      handles.push({
        id: `${node.id}-add-right`,
        direction: 'right',
        tooltip: 'Criar ramo à direita (Atalho: Tab)',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '50%',
          right: '-12px',
          transform: 'translateY(-50%)',
          zIndex: 65
        }
      });

      handles.push({
        id: `${node.id}-add-left`,
        direction: 'left',
        tooltip: 'Criar ramo à esquerda',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '50%',
          left: '-12px',
          transform: 'translateY(-50%)',
          zIndex: 65
        }
      });
    } else {
      // Nós de ramos: o botão de adicionar filho fica na extremidade externa de crescimento
      const isLeft = node.side === 'left';
      handles.push({
        id: `${node.id}-add-branch`,
        direction: isLeft ? 'left' : 'right',
        tooltip: isLeft ? 'Adicionar sub-item à esquerda' : 'Adicionar sub-item à direita (Atalho: Tab)',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '50%',
          ...(isLeft ? { left: '-12px' } : { right: '-12px' }),
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
    const isParentRoot = parent.side === 'root' || parent.id === 'root';
    const color = isParentRoot ? paletteColor : (parent.color || paletteColor);
    const side = direction === 'left' ? 'left' : 'right';
    const hDist = side === 'left' ? -220 : 220;
    const vOffset = (existingChildrenCount - 1) * 45;

    return {
      text: 'Novo item',
      x: (parent.x || 0) + hDist,
      y: (parent.y || 0) + vOffset,
      parentId: parent.id,
      color,
      borderStyle: parent.borderStyle || 'accent',
      lineStyle: 'bezier',
      side
    };
  }

  getDefaultLineStyle(): 'bezier' {
    return 'bezier';
  }

  isVerticalHierarchy(): boolean {
    return false;
  }

  supportsFreeRepositioning(): boolean {
    return true;
  }
}

export const mindMapEngine = new MindMapEngine();
