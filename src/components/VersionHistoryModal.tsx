import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  RotateCcw, 
  GitFork, 
  Bookmark, 
  Plus, 
  X, 
  Check, 
  Trash2, 
  Calendar, 
  Layers, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Board, BoardVersionSnapshot } from '../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoard: Board;
  snapshots: BoardVersionSnapshot[];
  onRestoreSnapshot: (snapshotId: string) => void;
  onForkSnapshot: (snapshotId: string) => void;
  onCreateMilestone: (name: string, description?: string) => void;
  onDeleteSnapshot?: (snapshotId: string) => void;
  theme?: 'dark' | 'light';
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  activeBoard,
  snapshots,
  onRestoreSnapshot,
  onForkSnapshot,
  onCreateMilestone,
  onDeleteSnapshot,
  theme = 'light'
}) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(() => {
    return snapshots[0]?.id || null;
  });
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

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
  const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId) || snapshots[0];

  const handleCreateNewMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;
    onCreateMilestone(newMilestoneName.trim());
    setNewMilestoneName('');
    setIsCreatingMilestone(false);
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Hoje às ${timeStr}`;
      }
      return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às ${timeStr}`;
    } catch {
      return iso;
    }
  };

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
          width: '840px',
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
            <Clock size={20} color="#818cf8" />
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Histórico de Versões e Marcos (Time Machine)
              </h2>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Histórico ilimitado com marcos salvos e restauração não-destrutiva
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsCreatingMilestone(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Bookmark size={13} />
              <span>Criar Marco Nomeado</span>
            </button>

            <button
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
        </div>

        {/* Formulário de Criação de Marco */}
        {isCreatingMilestone && (
          <form
            onSubmit={handleCreateNewMilestone}
            style={{
              padding: '12px 24px',
              backgroundColor: isDark ? '#1e2636' : '#f1f5f9',
              borderBottom: isDark ? '1px solid #2a3547' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Bookmark size={15} color="#818cf8" />
            <input
              type="text"
              autoFocus
              placeholder="Nome do marco (ex: Versão Final Aprovada, Revisão de Preços...)"
              value={newMilestoneName}
              onChange={e => setNewMilestoneName(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '5px',
                border: isDark ? '1px solid #374459' : '1px solid #cbd5e1',
                backgroundColor: isDark ? '#141a24' : '#ffffff',
                color: 'inherit',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!newMilestoneName.trim()}
              style={{
                padding: '6px 14px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: newMilestoneName.trim() ? 'pointer' : 'default',
                opacity: newMilestoneName.trim() ? 1 : 0.5
              }}
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingMilestone(false)}
              style={{
                padding: '6px 10px',
                borderRadius: '5px',
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Corpo: Lista de Versões à Esquerda e Detalhes à Direita */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Painel Esquerdo: Linha do Tempo */}
          <div
            style={{
              width: '320px',
              borderRight: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
              overflowY: 'auto',
              padding: '12px'
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', paddingLeft: '4px' }}>
              Linha do Tempo ({snapshots.length} versões salvas)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {snapshots.map((snap, idx) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                const isLatest = idx === 0;

                return (
                  <div
                    key={snap.id}
                    onClick={() => {
                      setSelectedSnapshotId(snap.id);
                      setConfirmRestoreId(null);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? (isDark ? '#222c3d' : '#eef2ff') : 'transparent',
                      border: isSelected ? '1px solid #818cf8' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'background-color 0.12s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: snap.name || isLatest ? 700 : 500, color: isSelected ? '#818cf8' : 'inherit' }}>
                        {snap.name || (isLatest ? 'Estado Atual' : `Versão ${snapshots.length - idx}`)}
                      </span>
                      {isLatest && (
                        <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#10b981', color: '#ffffff' }}>
                          Atual
                        </span>
                      )}
                      {snap.name && !isLatest && (
                        <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#7c3aed', color: '#ffffff' }}>
                          Marco
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
                      <Calendar size={11} />
                      <span>{formatTimestamp(snap.timestamp)}</span>
                      <span>•</span>
                      <span>{snap.nodeCount} nós</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painel Direito: Inspeção e Ações da Versão Selecionada */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedSnapshot ? (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                      {selectedSnapshot.name || `Versão de ${formatTimestamp(selectedSnapshot.timestamp)}`}
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                    Quadro: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{selectedSnapshot.boardData.title}</strong> • Gravado em {new Date(selectedSnapshot.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Resumo de Métricas do Ponto no Tempo */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}
                >
                  <div style={{ padding: '12px', borderRadius: '6px', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0', backgroundColor: isDark ? '#18202d' : '#f8fafc' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Tópicos / Nós</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>{selectedSnapshot.nodeCount}</div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '6px', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0', backgroundColor: isDark ? '#18202d' : '#f8fafc' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Objetos Totais</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>{selectedSnapshot.objectCount}</div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '6px', border: isDark ? '1px solid #273142' : '1px solid #e2e8f0', backgroundColor: isDark ? '#18202d' : '#f8fafc' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Ramos Principais</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>
                      {selectedSnapshot.boardData.mindMapNodes.filter(n => n.parentId === (selectedSnapshot.boardData.mindMapNodes.find(x => x.side === 'root')?.id || 'root')).length}
                    </div>
                  </div>
                </div>

                {/* Prévia dos Tópicos */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#94a3b8' }}>
                    Prévia dos ramos desta versão:
                  </span>
                  <div
                    style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: isDark ? '#18202d' : '#f8fafc',
                      border: isDark ? '1px solid #273142' : '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {selectedSnapshot.boardData.mindMapNodes.slice(0, 15).map(node => (
                      <div key={node.id} style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: node.color || '#818cf8', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {node.text || 'Sem texto'}
                        </span>
                      </div>
                    ))}
                    {selectedSnapshot.boardData.mindMapNodes.length > 15 && (
                      <span style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>
                        + {selectedSnapshot.boardData.mindMapNodes.length - 15} outros tópicos arquivados
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações: Restaurar e Bifurcar */}
                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => onForkSnapshot(selectedSnapshot.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                        backgroundColor: isDark ? '#1e2636' : '#ffffff',
                        color: 'inherit',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Cria um novo quadro separado com o conteúdo desta versão sem alterar o quadro atual"
                    >
                      <GitFork size={14} color="#818cf8" />
                      <span>Bifurcar (Criar Cópia Nova)</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {confirmRestoreId === selectedSnapshot.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => {
                            onRestoreSnapshot(selectedSnapshot.id);
                            setConfirmRestoreId(null);
                            onClose();
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Confirmar Restauração
                        </button>
                        <button
                          onClick={() => setConfirmRestoreId(null)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: '#94a3b8',
                            fontSize: '12.5px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRestoreId(selectedSnapshot.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#7c3aed',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Restaura o quadro atual para esta versão histórica"
                      >
                        <RotateCcw size={14} />
                        <span>Restaurar Esta Versão</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                Selecione uma versão na linha do tempo para ver detalhes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
