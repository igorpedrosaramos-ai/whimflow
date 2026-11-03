import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Board } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoard: Board;
  onImportBoard: (board: Board) => void;
  onResetBoard: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeBoard,
  onImportBoard,
  onResetBoard
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Exportar para JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeBoard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeBoard.title.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar de JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.mindMapNodes) {
          onImportBoard(imported);
          alert('Quadro importado com sucesso!');
          onClose();
        } else {
          alert('Arquivo JSON inválido para formato de quadro Whimsical.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Exportar para imagem PNG via SVG render
  const handleExportPNG = () => {
    const container = document.getElementById('main-canvas-area');
    if (!container) return;

    // Notificação rápida
    alert('Para capturar a imagem em resolução total, você pode usar o atalho de captura nativa do Windows (Win + Shift + S) ou imprimir diretamente para PDF via Ctrl + P!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={20} color="var(--accent-purple-light)" />
            <span>Exportação, Backup e Restauração</span>
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Export JSON */}
          <div
            onClick={handleExportJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'border-color 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={20} color="var(--accent-purple-light)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Baixar Backup Completo (JSON)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Exporta todos os nós, formas e notas para restaurar a qualquer momento.</div>
              </div>
            </div>
            <Download size={18} color="var(--text-secondary)" />
          </div>

          {/* Import JSON */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Upload size={20} color="var(--accent-teal-light)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Importar Arquivo de Backup (JSON)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Restaure um quadro salvo anteriormente no computador.</div>
              </div>
            </div>
            <Upload size={18} color="var(--text-secondary)" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>

          {/* Reset Template */}
          <div
            onClick={() => {
              if (confirm('Restaurar o quadro para a versão inicial da "Turbine Gestão de Delivery"? Suas alterações não salvas serão resetadas.')) {
                onResetBoard();
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RotateCcw size={20} color="#f43f5e" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#f43f5e' }}>Restaurar Modelo Padrão da Apresentação</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recarrega a árvore original da imagem (Turbine Delivery com 6 ramos).</div>
              </div>
            </div>
            <RotateCcw size={18} color="#f43f5e" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
