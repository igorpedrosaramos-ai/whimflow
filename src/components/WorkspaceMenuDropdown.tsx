import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Edit3, 
  FolderKanban, 
  Tags, 
  LayoutTemplate, 
  Trash2, 
  Download, 
  CheckCircle2,
  X
} from 'lucide-react';
import { Workspace } from '../types';

interface WorkspaceMenuDropdownProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  onCreateWorkspace: (name: string) => void;
  onClose: () => void;
  onOpenCategories?: () => void;
  onOpenTemplates?: () => void;
  onOpenTrash?: () => void;
  onExportBackup?: () => void;
  isDark?: boolean;
  style?: React.CSSProperties;
}

export const WorkspaceMenuDropdown: React.FC<WorkspaceMenuDropdownProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onRenameWorkspace,
  onCreateWorkspace,
  onClose,
  onOpenCategories,
  onOpenTemplates,
  onOpenTrash,
  onExportBackup,
  isDark = true,
  style
}) => {
  const activeWs = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || { id: 'ws-teste', name: 'teste' };
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(activeWs.name);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameWorkspace(activeWs.id, renameValue.trim());
      setIsRenaming(false);
    }
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWsName.trim()) {
      onCreateWorkspace(newWsName.trim());
      setNewWsName('');
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Backdrop transparente para capturar clique fora */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'transparent'
        }}
        onClick={onClose}
      />

      {/* Menu Dropdown Flutuante */}
      <div
        id="dropdown-workspace-menu"
        data-testid="dropdown-workspace-menu"
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: '0px',
          width: '236px',
          borderRadius: '10px',
          backgroundColor: isDark ? '#1a2230' : '#ffffff',
          border: isDark ? '1px solid #283344' : '1px solid #e2e8f0',
          boxShadow: isDark 
            ? '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0,0,0,0.2)' 
            : '0 12px 30px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0,0,0,0.04)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '13px',
          color: isDark ? '#f8fafc' : '#0f172a',
          ...style
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 1. ESPAÇO ATUAL E AÇÃO DE RENOMEAR */}
        <div
          style={{
            padding: '10px 12px',
            borderBottom: isDark ? '1px solid #232c3d' : '1px solid #f1f5f9',
            backgroundColor: isDark ? '#161e2b' : '#fafafa'
          }}
        >
          {isRenaming ? (
            <form onSubmit={handleSaveRename} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
                Renomear Espaço de Trabalho:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  id="input-rename-workspace"
                  type="text"
                  autoFocus
                  onFocus={e => e.target.select()}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsRenaming(false);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '5px',
                    border: isDark ? '1px solid #3b4961' : '1px solid #cbd5e1',
                    backgroundColor: isDark ? '#232d3f' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />
                <button
                  id="btn-save-workspace-rename"
                  type="submit"
                  style={{
                    padding: '5px 9px',
                    borderRadius: '5px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  style={{
                    padding: '5px 7px',
                    borderRadius: '5px',
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    flexShrink: 0
                  }}
                >
                  {activeWs.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={activeWs.name}
                  >
                    {activeWs.name}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle2 size={10} />
                    <span>Ativo</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-rename-workspace"
                onClick={() => {
                  setRenameValue(activeWs.name);
                  setIsRenaming(true);
                }}
                title="Renomear este espaço de trabalho"
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  backgroundColor: isDark ? '#232d3f' : '#f1f5f9',
                  border: isDark ? '1px solid #334055' : '1px solid #e2e8f0',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  flexShrink: 0
                }}
              >
                <Edit3 size={11} />
                <span>Renomear</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. LISTA DE ESPAÇOS DE TRABALHO */}
        <div style={{ padding: '8px 6px', borderBottom: isDark ? '1px solid #232c3d' : '1px solid #f1f5f9' }}>
          <div style={{ padding: '4px 8px 6px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.04em', color: '#94a3b8', textTransform: 'uppercase' }}>
            Meus Espaços de Trabalho
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '140px', overflowY: 'auto' }}>
            {workspaces.map(ws => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? (isDark ? '#232c3d' : '#f1f5f9') : 'transparent',
                    color: isActive ? '#7c3aed' : (isDark ? '#cbd5e1' : '#334155'),
                    border: 'none',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = isDark ? '#1f2736' : '#f8fafc';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#7c3aed' : (isDark ? '#334155' : '#cbd5e1'),
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ws.name}
                    </span>
                  </div>

                  {isActive && <Check size={14} color="#7c3aed" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Criar Novo Espaço */}
          {isCreating ? (
            <form onSubmit={handleSaveCreate} style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                id="input-new-workspace-name"
                type="text"
                autoFocus
                placeholder="Nome do novo espaço..."
                value={newWsName}
                onChange={e => setNewWsName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsCreating(false);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: '5px',
                  border: isDark ? '1px solid #3b4961' : '1px solid #cbd5e1',
                  backgroundColor: isDark ? '#232d3f' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-create-workspace"
                  type="submit"
                  style={{
                    padding: '3px 9px',
                    borderRadius: '4px',
                    backgroundColor: '#7c3aed',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Criar
                </button>
              </div>
            </form>
          ) : (
            <button
              id="btn-toggle-create-workspace"
              onClick={() => setIsCreating(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                marginTop: '4px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.15s, background-color 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = isDark ? '#1f2736' : '#f8fafc';
                e.currentTarget.style.color = '#7c3aed';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
              }}
            >
              <Plus size={14} />
              <span>Novo Espaço de Trabalho</span>
            </button>
          )}
        </div>

        {/* 3. AÇÕES RÁPIDAS DO ESPAÇO */}
        <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {onOpenCategories && (
            <button
              onClick={() => {
                onOpenCategories();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDark ? '#cbd5e1' : '#334155',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#1f2736' : '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Tags size={14} color="#8b5cf6" />
              <span>Gerenciar Categorias</span>
            </button>
          )}

          {onOpenTemplates && (
            <button
              onClick={() => {
                onOpenTemplates();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDark ? '#cbd5e1' : '#334155',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#1f2736' : '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LayoutTemplate size={14} color="#0284c7" />
              <span>Biblioteca de Modelos</span>
            </button>
          )}

          {onOpenTrash && (
            <button
              onClick={() => {
                onOpenTrash();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDark ? '#cbd5e1' : '#334155',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#1f2736' : '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Trash2 size={14} color="#ef4444" />
              <span>Lixeira e Excluídos</span>
            </button>
          )}

          {onExportBackup && (
            <button
              onClick={() => {
                onExportBackup();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDark ? '#cbd5e1' : '#334155',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? '#1f2736' : '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Download size={14} color="#10b981" />
              <span>Exportar Backup (JSON)</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
