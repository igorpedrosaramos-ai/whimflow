import { Board, MindMapNode, AgentOperation, AgentResponse, AgentNodeData, AgentNodeUpdate } from '../types';
import { calculateMindMapLayout } from '../utils/treeLayout';

export interface OperationExecutionResult {
  success: boolean;
  board: Board;
  summary: string;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  error?: string;
}

/**
 * Valida e sanitiza nós recebidos da IA
 */
export function sanitizeAgentNodes(rawNodes: AgentNodeData[] | undefined): MindMapNode[] {
  if (!rawNodes || !Array.isArray(rawNodes) || rawNodes.length === 0) return [];

  const validNodes: MindMapNode[] = [];
  const existingIds = new Set<string>();

  rawNodes.forEach((n, idx) => {
    if (!n || !n.text || !n.text.trim()) return;

    let id = n.id && typeof n.id === 'string' ? n.id.trim() : `node-${idx}`;
    if (existingIds.has(id)) {
      id = `${id}-${idx}-${Date.now().toString(36).slice(-4)}`;
    }
    existingIds.add(id);

    // Cores padronizadas por origem se não fornecidas
    let color = n.color;
    if (!color) {
      if (n.origin === 'existing') color = '#0284c7'; // Azul corporativo
      else if (n.origin === 'suggested') color = '#10b981'; // Verde esmeralda
      else if (n.origin === 'uncertain') color = '#f59e0b'; // Âmbar
      else color = '#7c3aed';
    }

    validNodes.push({
      id,
      text: n.text.trim(),
      x: 0,
      y: 0,
      parentId: n.parentId || null,
      childrenIds: Array.isArray(n.childrenIds) ? n.childrenIds.filter(Boolean) : [],
      color,
      origin: n.origin || 'generated',
      borderStyle: n.borderStyle || (n.origin === 'uncertain' ? 'border' : 'accent'),
      notes: n.notes
    });
  });

  return validNodes;
}

/**
 * Aplica layout harmônico aos nós utilizando o motor matemático do editor
 */
export function layoutNodes(nodes: MindMapNode[], layoutType?: string): MindMapNode[] {
  if (!nodes || nodes.length === 0) return [];

  const root = nodes.find(n => !n.parentId || n.side === 'root') || nodes[0];
  if (!root) return nodes;

  const layout = calculateMindMapLayout(nodes, root.id, {
    horizontalGap: 160,
    verticalGap: 18,
    rootX: 0,
    rootY: 0,
    layoutType: layoutType as any
  });

  return nodes.map(n => {
    const computed = layout.get(n.id);
    const isRoot = n.id === root.id;
    return {
      ...n,
      x: computed ? computed.x : (n.x || 0),
      y: computed ? computed.y : (n.y || 0),
      width: computed ? computed.width : (n.width || 180),
      height: computed ? computed.height : (n.height || 42),
      side: isRoot ? 'root' : (computed?.x && computed.x < 0 ? 'left' : 'right')
    };
  });
}

/**
 * Executa a operação do agente sobre o quadro atual com integridade referencial
 */
export function applyAgentOperation(
  board: Board,
  operation: AgentOperation
): OperationExecutionResult {
  if (!operation || operation.type === 'none') {
    return {
      success: true,
      board,
      summary: 'Nenhuma alteração necessária no mapa mental.',
      createdCount: 0,
      updatedCount: 0,
      deletedCount: 0
    };
  }

  const currentNodes = [...(board.mindMapNodes || [])];

  // ─── 1. CRIAÇÃO DE MAPA MENTAL COMPLETO ─────────────────────────────────────
  if (operation.type === 'create_mindmap') {
    const rawNodes = operation.nodes || [];
    if (rawNodes.length === 0) {
      return {
        success: false,
        board,
        summary: 'A IA não forneceu nós válidos para criar o mapa.',
        createdCount: 0,
        updatedCount: 0,
        deletedCount: 0,
        error: 'Nenhum nó retornado pela IA'
      };
    }

    const sanitized = sanitizeAgentNodes(rawNodes);
    
    // Garante que o nó raiz tenha parentId null
    const rootNode = sanitized.find(n => !n.parentId) || sanitized[0];
    if (rootNode) rootNode.parentId = null;

    // Sincroniza childrenIds com os parentIds
    const childrenMap = new Map<string, string[]>();
    sanitized.forEach(n => {
      if (n.parentId) {
        const arr = childrenMap.get(n.parentId) || [];
        arr.push(n.id);
        childrenMap.set(n.parentId, arr);
      }
    });
    sanitized.forEach(n => {
      n.childrenIds = childrenMap.get(n.id) || [];
    });

    const positionedNodes = layoutNodes(sanitized, board.layoutType);

    const existingCount = positionedNodes.filter(n => n.origin === 'existing').length;
    const suggestedCount = positionedNodes.filter(n => n.origin === 'suggested').length;
    const uncertainCount = positionedNodes.filter(n => n.origin === 'uncertain').length;

    let breakdown = `${positionedNodes.length} tópicos criados`;
    if (existingCount > 0 || suggestedCount > 0) {
      breakdown += ` (${existingCount} existentes em azul, ${suggestedCount} sugestões em verde${uncertainCount > 0 ? `, ${uncertainCount} incertos` : ''})`;
    }

    return {
      success: true,
      board: {
        ...board,
        title: operation.title || board.title,
        mindMapNodes: positionedNodes,
        updatedAt: new Date().toISOString()
      },
      summary: breakdown,
      createdCount: positionedNodes.length,
      updatedCount: 0,
      deletedCount: 0
    };
  }

  // ─── 2. ADIÇÃO DE NÓS A UMA ESTRUTURA EXISTENTE ─────────────────────────────
  if (operation.type === 'add_nodes') {
    const rawNodes = operation.nodes || [];
    if (rawNodes.length === 0) {
      return {
        success: true,
        board,
        summary: 'Nenhum nó novo a adicionar.',
        createdCount: 0,
        updatedCount: 0,
        deletedCount: 0
      };
    }

    const sanitized = sanitizeAgentNodes(rawNodes);
    const nodeMap = new Map<string, MindMapNode>();
    currentNodes.forEach(n => nodeMap.set(n.id, { ...n }));

    // Identifica o nó raiz atual caso o parentId não seja encontrado
    const rootNode = currentNodes.find(n => !n.parentId || n.side === 'root') || currentNodes[0];

    const newNodesToAdd: MindMapNode[] = [];

    sanitized.forEach(newNode => {
      // Verifica se o pai existe
      let parentId = newNode.parentId;
      if (!parentId || !nodeMap.has(parentId)) {
        // Tenta encontrar por texto de categoria similar
        const parentCandidate = currentNodes.find(n => 
          n.text.toLowerCase().includes((parentId || '').toLowerCase()) ||
          (parentId || '').toLowerCase().includes(n.text.toLowerCase())
        );
        parentId = parentCandidate ? parentCandidate.id : (rootNode ? rootNode.id : null);
      }

      newNode.parentId = parentId;

      if (parentId && nodeMap.has(parentId)) {
        const parent = nodeMap.get(parentId)!;
        if (!parent.childrenIds) parent.childrenIds = [];
        if (!parent.childrenIds.includes(newNode.id)) {
          parent.childrenIds.push(newNode.id);
        }
      }

      nodeMap.set(newNode.id, newNode);
      newNodesToAdd.push(newNode);
    });

    const combinedNodes = Array.from(nodeMap.values());
    const positionedNodes = layoutNodes(combinedNodes, board.layoutType);

    return {
      success: true,
      board: {
        ...board,
        mindMapNodes: positionedNodes,
        updatedAt: new Date().toISOString()
      },
      summary: `${newNodesToAdd.length} novos tópicos adicionados ao mapa existente.`,
      createdCount: newNodesToAdd.length,
      updatedCount: 0,
      deletedCount: 0
    };
  }

  // ─── 3. ATUALIZAÇÃO / EDIÇÃO DE NÓS EXISTENTES ──────────────────────────────
  if (operation.type === 'update_nodes') {
    const updates = operation.updates || [];
    const newNodes = operation.nodes || []; // Se a operação tiver novos nós para adicionar além de updates

    let updatedCount = 0;
    let createdCount = 0;

    const nodeMap = new Map<string, MindMapNode>();
    currentNodes.forEach(n => nodeMap.set(n.id, { ...n }));

    // Aplica atualizações de propriedades em nós existentes
    updates.forEach(u => {
      // Procura por ID ou por texto parcial se ID for nominal
      let target = nodeMap.get(u.nodeId);
      if (!target) {
        target = Array.from(nodeMap.values()).find(n => 
          n.text.toLowerCase() === u.nodeId.toLowerCase() ||
          n.text.toLowerCase().includes(u.nodeId.toLowerCase())
        );
      }

      if (target) {
        if (u.text) target.text = u.text;
        if (u.color) target.color = u.color;
        if (u.origin) target.origin = u.origin;
        if (u.borderStyle) target.borderStyle = u.borderStyle;
        if (u.collapsed !== undefined) target.collapsed = u.collapsed;
        updatedCount++;
      }
    });

    // Se houver novos nós para adicionar na mesma operação
    if (newNodes.length > 0) {
      const sanitized = sanitizeAgentNodes(newNodes);
      sanitized.forEach(nn => {
        let parentId = nn.parentId;
        if (parentId && !nodeMap.has(parentId)) {
          const parentCandidate = Array.from(nodeMap.values()).find(n => 
            n.text.toLowerCase().includes((parentId || '').toLowerCase())
          );
          if (parentCandidate) parentId = parentCandidate.id;
        }
        nn.parentId = parentId;
        if (parentId && nodeMap.has(parentId)) {
          const p = nodeMap.get(parentId)!;
          if (!p.childrenIds.includes(nn.id)) p.childrenIds.push(nn.id);
        }
        nodeMap.set(nn.id, nn);
        createdCount++;
      });
    }

    const combinedNodes = Array.from(nodeMap.values());
    const positionedNodes = layoutNodes(combinedNodes, board.layoutType);

    return {
      success: true,
      board: {
        ...board,
        mindMapNodes: positionedNodes,
        updatedAt: new Date().toISOString()
      },
      summary: `${updatedCount} nós modificados${createdCount > 0 ? ` e ${createdCount} novos nós adicionados` : ''}.`,
      createdCount,
      updatedCount,
      deletedCount: 0
    };
  }

  // ─── 4. EXCLUSÃO DE NÓS ─────────────────────────────────────────────────────
  if (operation.type === 'delete_nodes') {
    const toDeleteIds = new Set(operation.deletedNodeIds || []);
    if (toDeleteIds.size === 0) {
      return {
        success: true,
        board,
        summary: 'Nenhum nó para excluir.',
        createdCount: 0,
        updatedCount: 0,
        deletedCount: 0
      };
    }

    // Cascata de exclusão para descendentes
    const stack = Array.from(toDeleteIds);
    while (stack.length > 0) {
      const curId = stack.pop()!;
      currentNodes.forEach(n => {
        if (n.parentId === curId && !toDeleteIds.has(n.id)) {
          toDeleteIds.add(n.id);
          stack.push(n.id);
        }
      });
    }

    const remainingNodes = currentNodes
      .filter(n => !toDeleteIds.has(n.id))
      .map(n => ({
        ...n,
        childrenIds: (n.childrenIds || []).filter(cid => !toDeleteIds.has(cid))
      }));

    const positionedNodes = layoutNodes(remainingNodes, board.layoutType);

    return {
      success: true,
      board: {
        ...board,
        mindMapNodes: positionedNodes,
        updatedAt: new Date().toISOString()
      },
      summary: `${toDeleteIds.size} tópicos excluídos do mapa mental.`,
      createdCount: 0,
      updatedCount: 0,
      deletedCount: toDeleteIds.size
    };
  }

  // ─── 5. APLICAÇÃO DE CORES POR ORIGEM ────────────────────────────────────────
  if (operation.type === 'apply_colors') {
    const { existing = '#0284c7', suggested = '#10b981', uncertain = '#f59e0b' } = operation.colorsByOrigin || {};
    let updatedCount = 0;

    const coloredNodes = currentNodes.map(n => {
      let color = n.color;
      if (n.origin === 'existing') { color = existing; updatedCount++; }
      else if (n.origin === 'suggested') { color = suggested; updatedCount++; }
      else if (n.origin === 'uncertain') { color = uncertain; updatedCount++; }
      return { ...n, color };
    });

    return {
      success: true,
      board: {
        ...board,
        mindMapNodes: coloredNodes,
        updatedAt: new Date().toISOString()
      },
      summary: `Cores padronizadas por origem (${updatedCount} nós atualizados: existentes em azul, sugestões em verde).`,
      createdCount: 0,
      updatedCount,
      deletedCount: 0
    };
  }

  // ─── 6. REORGANIZAÇÃO DE LAYOUT ─────────────────────────────────────────────
  if (operation.type === 'reorganize_layout') {
    const positionedNodes = layoutNodes(currentNodes, board.layoutType);
    return {
      success: true,
      board: {
        ...board,
        mindMapNodes: positionedNodes,
        updatedAt: new Date().toISOString()
      },
      summary: 'Layout do mapa mental reorganizado e alinhado.',
      createdCount: 0,
      updatedCount: currentNodes.length,
      deletedCount: 0
    };
  }

  return {
    success: false,
    board,
    summary: 'Tipo de operação não reconhecido.',
    createdCount: 0,
    updatedCount: 0,
    deletedCount: 0,
    error: `Operação desconhecida: ${operation.type}`
  };
}
