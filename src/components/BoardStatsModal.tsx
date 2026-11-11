import React, { useEffect } from 'react';
import { 
  BarChart2, 
  X, 
  Layers, 
  GitBranch, 
  Share2,
  Type
} from 'lucide-react';
import { Board, MindMapNode } from '../types';

interface BoardStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  theme?: 'dark' | 'light';
}

export const BoardStatsModal: React.FC<BoardStatsModalProps> = ({
  isOpen,
  onClose,
  board,
  theme = 'light'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const nodes = board.mindMapNodes || [];
  const stickies = board.stickies || [];
  const wireframes = board.wireframes || [];
  const drawings = board.drawings || [];

  const totalObjects = nodes.length + stickies.length + wireframes.length + drawings.length;

  // Cálculo de profundidade máxima da árvore
  const nodeMap = new Map<string, MindMapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const root = nodes.find(n => n.side === 'root') || nodes[0];
  const primaryBranches = root ? nodes.filter(n => n.parentId === root.id) : [];

  let maxDepth = 0;
  nodes.forEach(n => {
    let depth = 0;
    let curr: MindMapNode | undefined = n;
    while (curr && curr.parentId && nodeMap.has(curr.parentId)) {
      depth++;
      curr = nodeMap.get(curr.parentId);
      if (depth > 50) break; // Trava contra ciclos
    }
    if (depth > maxDepth) maxDepth = depth;
  });

  // Nós folhas (sem filhos)
  const leafNodes = nodes.filter(n => !n.childrenIds || n.childrenIds.length === 0);

  // Contagem de palavras e caracteres
  let totalWords = 0;
  let totalChars = 0;
  nodes.forEach(n => {
    const text = (n.text || '').trim();
    if (text) {
      totalChars += text.length;
      totalWords += text.split(/\s+/).filter(Boolean).length;
    }
  });

  // Estimativas de tempo
  const readingTimeMin = Math.max(1, Math.ceil(totalWords / 180));
  const presentationTimeMin = Math.max(2, Math.round(primaryBranches.length * 2.5));

  // Itens concluídos
  const checkedWireframes = wireframes.filter(w => w.checked).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 6000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '680px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          backgroundColor: isDark ? '#141a24' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderRadius: '10px',
          border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark ? '#18202d' : '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={20} color="#818cf8" />
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Métricas e Estatísticas do Quadro
              </h2>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Visão estrutural e densidade do mapa • {totalObjects} objetos ativos
              </span>
            </div>
          </div>

          <button
            id="btn-close-stats"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Grid de Métricas Principais */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}
          >
            <div style={{ padding: '14px', borderRadius: '6px', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0', backgroundColor: isDark ? '#18202d' : '#f8fafc' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Tópicos / Nós</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{nodes.length}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{leafNodes.length} nós terminais</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '6px', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0', backgroundColor: isDark ? '#18202d' : '#f8fafc' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Profundidade</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{maxDepth}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>níveis de hierarquia</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '6px', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0', backgroundColor: isDark ? '#18202d' : '#f8fafc' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Palavras</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{totalWords}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{totalChars} caracteres</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '6px', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0', backgroundColor: isDark ? '#18202d' : '#f8fafc' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Tempo Leitura</div>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>~{readingTimeMin} min</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>~{presentationTimeMin} min apresentação</div>
            </div>
          </div>

          {/* Detalhamento por Categoria de Objeto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#94a3b8' }}>
              Composição de Elementos no Canvas:
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: isDark ? '#18202d' : '#f8fafc', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitBranch size={15} color="#818cf8" />
                  Ramos Primários da Raiz
                </span>
                <strong style={{ fontSize: '14px' }}>{primaryBranches.length}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: isDark ? '#18202d' : '#f8fafc', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Share2 size={15} color="#6366f1" />
                  Conexões Transversais
                </span>
                <strong style={{ fontSize: '14px' }}>{(board.connectors || []).length}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: isDark ? '#18202d' : '#f8fafc', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={15} color="#f59e0b" />
                  Notas Adesivas (Stickies)
                </span>
                <strong style={{ fontSize: '14px' }}>{stickies.length}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: isDark ? '#18202d' : '#f8fafc', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Type size={15} color="#06b6d4" />
                  Textos e Rascunhos Livres
                </span>
                <strong style={{ fontSize: '14px' }}>{(board.texts?.length || 0) + (drawings?.length || 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
