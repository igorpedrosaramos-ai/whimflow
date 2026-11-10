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
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Board } from '../types';
import { exportBoardAsPNG, exportBoardAsSVG, exportBoardAsMarkdown } from '../utils/exportImage';
import { exportBoardAsPPTX, exportBoardAsPDF } from '../utils/exportDocument';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoard: Board;
  theme?: 'dark' | 'light';
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  activeBoard,
  theme = 'light',
  onShowToast
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [pngScale, setPngScale] = useState<number>(2);
  const [pngTransparent, setPngTransparent] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://whimflow.vercel.app';

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onShowToast) {
      onShowToast(msg, type);
    } else {
      setExportFeedback(msg);
      setTimeout(() => setExportFeedback(null), 3000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    notify('Link copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePPTX = async () => {
    try {
      setIsExportingPPTX(true);
      await exportBoardAsPPTX(activeBoard);
      notify('Apresentação PowerPoint (.pptx) gerada com sucesso!', 'success');
    } catch (e) {
      console.error('Erro ao exportar PPTX:', e);
      notify('Falha ao gerar PowerPoint. Tente novamente.', 'error');
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handlePDF = async () => {
    try {
      setIsExportingPDF(true);
      await exportBoardAsPDF(activeBoard);
      notify('Documento PDF gerado com sucesso!', 'success');
    } catch (e) {
      console.error('Erro ao exportar PDF:', e);
      notify('Falha ao gerar PDF. Tente novamente.', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePNG = async () => {
    try {
      setIsExportingPNG(true);
      await exportBoardAsPNG(activeBoard, {
        scale: pngScale,
        transparent: pngTransparent,
        theme: isDark ? 'dark' : 'light'
      });
      notify('Imagem PNG em alta resolução exportada com sucesso!', 'success');
    } catch (e) {
      console.error('Erro ao exportar PNG:', e);
      notify('Falha ao gerar imagem PNG.', 'error');
    } finally {
      setIsExportingPNG(false);
    }
  };

  const handleSVG = () => {
    exportBoardAsSVG(activeBoard);
  };

  const handleMarkdown = () => {
    exportBoardAsMarkdown(activeBoard);
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '680px',
          maxWidth: '95vw',
          maxHeight: '90vh',
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
            <Share2 size={20} color="#818cf8" />
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Exportação Executiva & Compartilhamento
              </h2>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Formatos profissionais de alta resolução sem marcas d'água
              </span>
            </div>
          </div>

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

        {/* Conteúdo */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Badge Pro: 100% Sem Marca D'Água */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: isDark ? '#1a2233' : '#f0fdf4',
              border: isDark ? '1px solid #27374d' : '1px solid #bbf7d0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" />
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: isDark ? '#f8fafc' : '#14532d' }}>
                Recurso Pro Desbloqueado: Exportações 100% livres de marcas d'água
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              Ilimitado
            </span>
          </div>

          {/* Link Público de Acesso */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Link de Acesso Direto ao Projeto:
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isDark ? '#18202d' : '#f8fafc',
                border: isDark ? '1px solid #283344' : '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 10px',
                gap: '8px'
              }}
            >
              <Globe size={16} color="#818cf8" />
              <input
                type="text"
                readOnly
                value={currentUrl}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
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
                  backgroundColor: copiedLink ? '#10b981' : '#7c3aed',
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

          {/* Formatos de Exportação */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
              Selecione o Formato para Download:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Opção 1: PNG Alta Resolução */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #273142' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ImageIcon size={18} color="#06b6d4" />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700 }}>
                        Imagem PNG de Alta Resolução (Sem Marca D'Água)
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        Ideal para apresentações, relatórios e postagens
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={!isExportingPNG ? handlePNG : undefined}
                    disabled={isExportingPNG}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '5px',
                      border: 'none',
                      backgroundColor: '#7c3aed',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: isExportingPNG ? 'wait' : 'pointer'
                    }}
                  >
                    {isExportingPNG ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Baixar PNG</span>
                  </button>
                </div>

                {/* Controles de Qualidade PNG */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8', paddingTop: '6px', borderTop: isDark ? '1px solid #232c3d' : '1px solid #eef2f6' }}>
                  <span style={{ fontWeight: 600 }}>Qualidade:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="scale" checked={pngScale === 1} onChange={() => setPngScale(1)} />
                    1x (Padrão)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="scale" checked={pngScale === 2} onChange={() => setPngScale(2)} />
                    2x (Retina HD)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="scale" checked={pngScale === 3} onChange={() => setPngScale(3)} />
                    3x (Ultra 4K)
                  </label>

                  <span style={{ width: '1px', height: '14px', backgroundColor: '#cbd5e1' }} />

                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={pngTransparent} onChange={e => setPngTransparent(e.target.checked)} />
                    Fundo Transparente
                  </label>
                </div>
              </div>

              {/* Opção 2: Vetor SVG (.svg) */}
              <div
                onClick={handleSVG}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #273142' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={18} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                      Vetor Escalável SVG (.svg)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Resolução infinita, editável no Figma, Illustrator e Inkscape sem perda de qualidade
                    </div>
                  </div>
                </div>
                <Download size={15} color="#94a3b8" />
              </div>

              {/* Opção 3: PDF Executivo (.pdf) */}
              <div
                onClick={!isExportingPDF ? handlePDF : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #273142' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: isExportingPDF ? 'wait' : 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="#ef4444" />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                      Documento PDF Executivo (.pdf)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Relatório elegante em formato A4 com capa sóbria, diagrama vetorizado e sumário
                    </div>
                  </div>
                </div>
                {isExportingPDF ? <Loader2 size={16} className="animate-spin" color="#ef4444" /> : <Download size={15} color="#94a3b8" />}
              </div>

              {/* Opção 4: PowerPoint (.pptx) */}
              <div
                onClick={!isExportingPPTX ? handlePPTX : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #273142' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: isExportingPPTX ? 'wait' : 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PresentationIcon size={18} color="#ea580c" />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                      Apresentação PowerPoint (.pptx)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Slides 16:9 profissionais com visão panorâmica e cartões detalhados por ramo
                    </div>
                  </div>
                </div>
                {isExportingPPTX ? <Loader2 size={16} className="animate-spin" color="#ea580c" /> : <Download size={15} color="#94a3b8" />}
              </div>

              {/* Opção 5: Markdown Outline (.md) */}
              <div
                onClick={handleMarkdown}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #273142' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileCode size={18} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                      Outline Estruturado em Markdown (.md)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Lista hierárquica indentada para importar no Notion, Obsidian ou prompts de IA
                    </div>
                  </div>
                </div>
                <Download size={15} color="#94a3b8" />
              </div>

              {/* Opção 6: Backup Completo JSON (.json) */}
              <div
                onClick={handleExportJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #273142' : '1px solid #e2e8f0',
                  backgroundColor: isDark ? '#18202d' : '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={18} color="#6366f1" />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                      Backup de Dados Brutos (.json)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Arquivo JSON completo com todos os nós, posições, seções e configurações para restauração
                    </div>
                  </div>
                </div>
                <Download size={15} color="#94a3b8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
