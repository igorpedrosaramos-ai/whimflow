import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  theme = 'light'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const shortcutGroups = [
    {
      category: 'Edição de Mapas Mentais',
      shortcuts: [
        { key: 'Tab', desc: 'Criar nó filho conectado' },
        { key: 'Enter', desc: 'Criar nó irmão no mesmo nível' },
        { key: 'Shift + Enter', desc: 'Criar nó irmão acima' },
        { key: 'F2 ou Duplo Clique', desc: 'Editar texto do nó' },
        { key: 'Delete / Backspace', desc: 'Excluir nó selecionado e seus ramos' },
        { key: 'Ctrl + C / Ctrl + V', desc: 'Copiar e colar nós com conexões' },
        { key: 'Ctrl + /', desc: 'Recolher ou expandir ramo do nó selecionado' },
        { key: 'Ctrl + Shift + [', desc: 'Minimizar / Recolher todos os ramos do mapa' },
        { key: 'Ctrl + Shift + ]', desc: 'Maximizar / Expandir todos os ramos do mapa' },
        { key: 'Ctrl + Z / Ctrl + Y', desc: 'Desfazer e refazer ações' }
      ]
    },
    {
      category: 'Navegação no Canvas',
      shortcuts: [
        { key: 'Espaço + Arraste', desc: 'Mover e navegar livremente pelo canvas (Pan)' },
        { key: 'Ctrl + Scroll', desc: 'Aumentar ou diminuir zoom' },
        { key: 'Clique no % de Zoom', desc: 'Ajustar e centralizar mapa na tela (Fit View)' },
        { key: 'F5', desc: 'Iniciar modo Apresentação em Tela Cheia' },
        { key: 'Ctrl + K', desc: 'Abrir Busca Rápida de Projetos e Comandos' },
        { key: 'Esc', desc: 'Fechar modais ou desmarcar seleções' }
      ]
    },
    {
      category: 'Ferramentas de Criação',
      shortcuts: [
        { key: 'V', desc: 'Ferramenta de Seleção e Mover' },
        { key: 'H', desc: 'Ferramenta Mão (Pan)' },
        { key: 'M', desc: 'Modo Mapa Mental' },
        { key: 'S', desc: 'Inserir Nota Adesiva (Sticky Note)' },
        { key: 'T', desc: 'Inserir Texto Livre' },
        { key: 'D', desc: 'Caneta de Desenho Livre' },
        { key: 'F', desc: 'Painel de Seções de Apresentação' }
      ]
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '680px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          backgroundColor: isDark ? '#141922' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderRadius: '12px',
          border: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#232b38' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed'
              }}
            >
              <Keyboard size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Atalhos do Teclado & Guia Rápido
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Todos os comandos para máxima produtividade no Whimflow
              </p>
            </div>
          </div>

          <button
            id="btn-close-shortcuts"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px'
            }}
            title="Fechar atalhos (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com Grid de Atalhos */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#7c3aed',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {group.category}
              </span>

              <div
                style={{
                  backgroundColor: isDark ? '#1a2230' : '#f8fafc',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #232d3f' : '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                {group.shortcuts.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 14px',
                      borderBottom: sIdx < group.shortcuts.length - 1 ? (isDark ? '1px solid #232d3f' : '1px solid #f1f5f9') : 'none'
                    }}
                  >
                    <span style={{ fontSize: '13px', color: isDark ? '#e2e8f0' : '#334155' }}>
                      {s.desc}
                    </span>

                    <kbd
                      style={{
                        padding: '3px 8px',
                        borderRadius: '5px',
                        backgroundColor: isDark ? '#263143' : '#ffffff',
                        border: isDark ? '1px solid #374457' : '1px solid #cbd5e1',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                      }}
                    >
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé com Dica Executiva */}
        <div
          style={{
            padding: '12px 22px',
            backgroundColor: isDark ? '#18202c' : '#f1f5f9',
            borderTop: isDark ? '1px solid #232c3d' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#94a3b8'
          }}
        >
          <span>Pressione <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>ESC</strong> a qualquer momento para fechar</span>
          <span style={{ color: '#0d9488', fontWeight: 600 }}>⚡ Whimflow Pro</span>
        </div>
      </div>
    </div>
  );
};
