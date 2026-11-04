import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  X, 
  Globe, 
  Image as ImageIcon, 
  Presentation as PresentationIcon,
  FileCode,
  Loader2
} from 'lucide-react';
import { Board } from '../types';
import { exportBoardAsPNG, exportBoardAsSVG } from '../utils/exportImage';
import { exportBoardAsPPTX, exportBoardAsPDF } from '../utils/exportDocument';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoard: Board;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  activeBoard
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePPTX = async () => {
    try {
      setIsExportingPPTX(true);
      await exportBoardAsPPTX(activeBoard);
    } catch (e) {
      console.error('Erro ao exportar PPTX:', e);
      alert('Falha ao gerar PowerPoint. Tente novamente.');
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handlePDF = async () => {
    try {
      setIsExportingPDF(true);
      await exportBoardAsPDF(activeBoard);
    } catch (e) {
      console.error('Erro ao exportar PDF:', e);
      alert('Falha ao gerar PDF. Tente novamente.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePNG = async () => {
    try {
      setIsExportingPNG(true);
      await exportBoardAsPNG(activeBoard);
    } catch (e) {
      console.error('Erro ao exportar PNG:', e);
      alert('Falha ao gerar imagem PNG.');
    } finally {
      setIsExportingPNG(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeBoard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeBoard.title.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '580px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="var(--accent-purple-light)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Compartilhar e Exportar Projeto</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Link Público de Acesso */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
            Link Público do Sistema (Acesso de Qualquer Dispositivo):
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            padding: '6px 10px',
            gap: '8px'
          }}>
            <Globe size={16} color="var(--accent-teal-light)" />
            <input
              type="text"
              readOnly
              value={currentUrl}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                flex: 1,
                outline: 'none'
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: copiedLink ? 'var(--accent-teal)' : 'var(--accent-purple)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

        {/* Formatos Executivos de Exportação */}
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
          Formatos de Exportação para Apresentação e Impressão
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {/* Opção 1: PowerPoint (.pptx) */}
          <div
            onClick={!isExportingPPTX ? handlePPTX : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid #c2410c',
              borderRadius: '6px',
              cursor: isExportingPPTX ? 'wait' : 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <PresentationIcon size={20} color="#ea580c" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
                  Baixar Apresentação PowerPoint (.pptx)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Gera slides 16:9 profissionais com capa, diagrama completo em alta definição e cartões de cada ramo.
                </div>
              </div>
            </div>
            {isExportingPPTX ? (
              <Loader2 size={18} color="#ea580c" className="animate-spin" />
            ) : (
              <Download size={16} color="var(--text-secondary)" />
            )}
          </div>

          {/* Opção 2: Documento PDF (.pdf) */}
          <div
            onClick={!isExportingPDF ? handlePDF : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              cursor: isExportingPDF ? 'wait' : 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={20} color="#ef4444" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
                  Baixar Documento PDF (.pdf)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Relatório executivo em modo paisagem (A4) com o mapa mental visual e detalhamento pronto para impressão.
                </div>
              </div>
            </div>
            {isExportingPDF ? (
              <Loader2 size={18} color="#ef4444" className="animate-spin" />
            ) : (
              <Download size={16} color="var(--text-secondary)" />
            )}
          </div>

          {/* Opção 3: Imagem PNG Alta Resolução */}
          <div
            onClick={!isExportingPNG ? handlePNG : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              cursor: isExportingPNG ? 'wait' : 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ImageIcon size={20} color="var(--accent-teal-light)" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
                  Exportar Imagem PNG em Alta Resolução (.png)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Renderiza todo o mapa visual com curvas Bézier e nós nítidos em escala Retina 2x.
                </div>
              </div>
            </div>
            {isExportingPNG ? (
              <Loader2 size={18} color="var(--accent-teal-light)" className="animate-spin" />
            ) : (
              <Download size={16} color="var(--text-secondary)" />
            )}
          </div>

          {/* Opção 4: Backup de Dados JSON */}
          <div
            onClick={handleExportJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileCode size={20} color="var(--accent-purple-light)" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
                  Baixar Arquivo Completo do Projeto (.json)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Backup estruturado com todos os nós, posições, offsets e cores para restauração futura.
                </div>
              </div>
            </div>
            <Download size={16} color="var(--text-secondary)" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-strong)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
