import { MindMapNode } from '../types';
import { ActionHandle, NodeDirection, TemplateEngine } from './templateEngineTypes';

export class FlowchartEngine implements TemplateEngine {
  id = 'flowchart' as const;
  name = 'Motor de Fluxograma e Árvore de Decisão';

  getActionHandles(node: MindMapNode): ActionHandle[] {
    const nodeColor = node.color || '#f59e0b';

    return [
      // 1. Sul: Próximo passo / fluxo principal abaixo
      {
        id: `${node.id}-flow-bottom`,
        direction: 'bottom',
        tooltip: 'Adicionar próxima etapa abaixo',
        color: nodeColor,
        style: {
          position: 'absolute',
          bottom: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 65
        }
      },
      // 2. Leste: Ramificação de decisão à direita (ex: Não / Condição B)
      {
        id: `${node.id}-flow-right`,
        direction: 'right',
        tooltip: 'Adicionar ramificação à direita (ex: Não / Caminho alternativo)',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '50%',
          right: '-12px',
          transform: 'translateY(-50%)',
          zIndex: 65
        }
      },
      // 3. Oeste: Ramificação de decisão à esquerda (ex: Sim / Condição A)
      {
        id: `${node.id}-flow-left`,
        direction: 'left',
        tooltip: 'Adicionar ramificação à esquerda (ex: Sim / Aprovação)',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '50%',
          left: '-12px',
          transform: 'translateY(-50%)',
          zIndex: 65
        }
      },
      // 4. Norte: Etapa anterior / entrada acima
      {
        id: `${node.id}-flow-top`,
        direction: 'top',
        tooltip: 'Adicionar etapa anterior acima',
        color: nodeColor,
        style: {
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 65
        }
      }
    ];
  }

  computeNewNode(
    parent: MindMapNode,
    direction: NodeDirection,
    paletteColor: string
  ): Partial<MindMapNode> {
    const color = parent.color || paletteColor;
    const parentW = parent.width || 220;
    const parentH = parent.height || 48;
    const px = parent.x || 0;
    const py = parent.y || 0;

    switch (direction) {
      case 'bottom':
        return {
          text: 'Próxima etapa',
          x: px,
          y: py + parentH + 70,
          parentId: parent.id,
          color,
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'bottom'
        };
      case 'right':
        return {
          text: 'Novo caminho',
          x: px + parentW + 80,
          y: py,
          parentId: parent.id,
          color,
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'right'
        };
      case 'left':
        return {
          text: 'Novo caminho',
          x: px - parentW - 80,
          y: py,
          parentId: parent.id,
          color,
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'left'
        };
      case 'top':
        return {
          text: 'Etapa anterior',
          x: px,
          y: py - parentH - 70,
          parentId: parent.id,
          color,
          borderStyle: 'border',
          lineStyle: 'stepped',
          side: 'top'
        };
    }
  }

  getDefaultLineStyle(): 'stepped' {
    return 'stepped';
  }

  isVerticalHierarchy(): boolean {
    return false; // Permite ramificação livre em qualquer eixo
  }

  supportsFreeRepositioning(): boolean {
    return true; // Total liberdade de posicionamento no canvas
  }
}

export const flowchartEngine = new FlowchartEngine();
