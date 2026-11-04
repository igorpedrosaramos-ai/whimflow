import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import { Board, MindMapNode } from '../types';
import { generateBoardSVG } from './exportImage';

/**
 * Renderiza o SVG do mapa mental para uma imagem em base64 (Data URL PNG)
 * em escala Retina 2x para inserção de altíssima nitidez em PPTX e PDF.
 */
function renderBoardToDataUrl(board: Board): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const svg = generateBoardSVG(board);
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context não suportado'));
          return;
        }

        ctx.fillStyle = '#0f1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Exporta o Mapa Mental completo para apresentação Microsoft PowerPoint (.pptx)
 * com capa executiva, slide de visão geral visual em alta resolução
 * e slides detalhados por categoria/ramo.
 */
export async function exportBoardAsPPTX(board: Board): Promise<void> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'WhimFlow Pro';
  pres.company = 'WhimFlow Mind Maps';
  pres.title = board.title;

  const rootNode = board.mindMapNodes.find(n => n.side === 'root') || board.mindMapNodes[0];
  const primaryBranches = board.mindMapNodes.filter(n => n.parentId === rootNode?.id);

  // SLIDE 1: Capa Executiva Sóbria (Estilo Corporativo / Alta Legibilidade)
  const slideCover = pres.addSlide();
  slideCover.background = { color: '0F172A' };

  slideCover.addText(board.title.toUpperCase(), {
    x: 0.8,
    y: 2.2,
    w: 8.4,
    h: 1.5,
    fontSize: 32,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    align: 'left'
  });

  slideCover.addText(`MAPA MENTAL ESTRATÉGICO • ${board.mindMapNodes.length} TÓPICOS E ITENS MAPEADOS`, {
    x: 0.8,
    y: 3.7,
    w: 8.4,
    h: 0.5,
    fontSize: 13,
    bold: true,
    color: '38BDF8',
    fontFace: 'Arial',
    align: 'left'
  });

  slideCover.addText(`Gerado em ${new Date().toLocaleDateString('pt-BR')} • WhimFlow Enterprise`, {
    x: 0.8,
    y: 4.8,
    w: 8.4,
    h: 0.4,
    fontSize: 11,
    color: '94A3B8',
    fontFace: 'Arial'
  });

  // SLIDE 2: Visão Geral com o Diagrama Visual do Mapa
  try {
    const dataUrl = await renderBoardToDataUrl(board);
    const slideDiagram = pres.addSlide();
    slideDiagram.background = { color: '0F1117' };

    slideDiagram.addText(`${board.title} — Visão Geral do Diagrama`, {
      x: 0.8,
      y: 0.4,
      w: 8.4,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: 'F8FAFC',
      fontFace: 'Arial'
    });

    slideDiagram.addImage({
      data: dataUrl,
      x: 0.8,
      y: 1.1,
      w: 8.4,
      h: 4.1
    });
  } catch (err) {
    console.warn('Não foi possível renderizar imagem visual no PPTX:', err);
  }

  // SLIDES SUBSEQUENTES: 1 Slide por Ramo Principal / Categoria
  primaryBranches.forEach((branch, idx) => {
    const slide = pres.addSlide();
    slide.background = { color: '0F172A' };

    const branchColor = (branch.color || '#6366f1').replace('#', '');
    const children = board.mindMapNodes.filter(n => n.parentId === branch.id);

    // Barra de destaque colorido
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8,
      y: 0.5,
      w: 0.15,
      h: 0.6,
      fill: { color: branchColor },
      line: { color: branchColor }
    });

    slide.addText(`0${idx + 1}. ${branch.text}`, {
      x: 1.1,
      y: 0.45,
      w: 8.0,
      h: 0.7,
      fontSize: 22,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    slide.addText(`${children.length} itens cadastrados neste pilar`, {
      x: 1.1,
      y: 1.05,
      w: 8.0,
      h: 0.35,
      fontSize: 11,
      color: '94A3B8',
      fontFace: 'Arial'
    });

    // Renderiza itens em cartões corporativos de alta legibilidade (2 colunas)
    const col1 = children.slice(0, Math.ceil(children.length / 2));
    const col2 = children.slice(Math.ceil(children.length / 2));

    const renderColumn = (items: MindMapNode[], colX: number) => {
      let currentY = 1.6;
      items.slice(0, 7).forEach((item, itemIdx) => {
        // Fundo do card sóbrio
        slide.addShape(pres.ShapeType.roundRect, {
          x: colX,
          y: currentY,
          w: 3.9,
          h: 0.48,
          fill: { color: '1E293B' },
          line: { color: '334155', width: 1 },
          rectRadius: 0.08
        });

        // Borda esquerda colorida
        slide.addShape(pres.ShapeType.rect, {
          x: colX,
          y: currentY,
          w: 0.08,
          h: 0.48,
          fill: { color: branchColor },
          line: { color: branchColor }
        });

        // Texto do produto / tópico
        slide.addText(`${itemIdx + 1}. ${item.text}`, {
          x: colX + 0.18,
          y: currentY + 0.04,
          w: 3.65,
          h: 0.4,
          fontSize: 11.5,
          color: 'F1F5F9',
          fontFace: 'Arial',
          bold: false
        });

        currentY += 0.54;
      });

      if (items.length > 7) {
        slide.addText(`+ ${items.length - 7} outros itens adicionais...`, {
          x: colX + 0.2,
          y: currentY,
          w: 3.6,
          h: 0.3,
          fontSize: 10,
          color: '94A3B8',
          italic: true
        });
      }
    };

    renderColumn(col1, 0.8);
    renderColumn(col2, 5.2);
  });

  const fileName = `${board.title.replace(/\s+/g, '_')}_Apresentacao.pptx`;
  await pres.writeFile({ fileName });
}

/**
 * Exporta o Mapa Mental completo para Relatório Executivo PDF (.pdf)
 * com o diagrama em página inteira de alta resolução e detalhamento dos ramos.
 */
export async function exportBoardAsPDF(board: Board): Promise<void> {
  const rootNode = board.mindMapNodes.find(n => n.side === 'root') || board.mindMapNodes[0];
  const primaryBranches = board.mindMapNodes.filter(n => n.parentId === rootNode?.id);

  // Cria documento PDF em modo paisagem (A4 Widescreen 297 x 210 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // PÁGINA 1: Diagrama Completo do Mapa Mental em Alta Definição
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, 297, 210, 'F');

  // Cabeçalho da página 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(board.title, 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Mapa Mental Estratégico • ${board.mindMapNodes.length} Tópicos • Exportado em ${new Date().toLocaleDateString('pt-BR')}`, 15, 22);

  try {
    const dataUrl = await renderBoardToDataUrl(board);
    // Insere imagem centralizada na folha A4
    doc.addImage(dataUrl, 'PNG', 15, 28, 267, 168, undefined, 'FAST');
  } catch (err) {
    console.warn('Erro ao inserir imagem no PDF:', err);
  }

  // PÁGINAS SEGUINTES: Detalhamento por Categoria / Ramos
  primaryBranches.forEach((branch, idx) => {
    doc.addPage('a4', 'landscape');
    
    // Fundo limpo corporativo
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 210, 'F');

    // Faixa colorida do ramo
    const colorHex = branch.color || '#6366f1';
    const r = parseInt(colorHex.slice(1, 3), 16) || 99;
    const g = parseInt(colorHex.slice(3, 5), 16) || 102;
    const b = parseInt(colorHex.slice(5, 7), 16) || 241;

    doc.setFillColor(r, g, b);
    doc.rect(15, 14, 4, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(`${idx + 1}. ${branch.text}`, 24, 22);

    const children = board.mindMapNodes.filter(n => n.parentId === branch.id);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Detalhamento dos ${children.length} itens correspondentes`, 24, 27);

    // Listagem em 2 colunas de cards de alta legibilidade
    const col1 = children.slice(0, Math.ceil(children.length / 2));
    const col2 = children.slice(Math.ceil(children.length / 2));

    const renderPdfColumn = (items: MindMapNode[], colX: number) => {
      let currentY = 38;
      items.slice(0, 10).forEach((item, itemIdx) => {
        // Fundo do card
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(colX, currentY, 126, 12, 1.5, 1.5, 'F');

        // Borda esquerda viva da cor do ramo
        doc.setFillColor(r, g, b);
        doc.rect(colX, currentY, 2.5, 12, 'F');

        // Texto do produto / tópico
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(241, 245, 249);
        const label = `${itemIdx + 1}. ${item.text}`;
        doc.text(label.length > 58 ? label.substring(0, 56) + '...' : label, colX + 6, currentY + 7.8);

        currentY += 15;
      });

      if (items.length > 10) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`+ ${items.length - 10} outros itens no mapa...`, colX + 6, currentY + 6);
      }
    };

    renderPdfColumn(col1, 15);
    renderPdfColumn(col2, 154);
  });

  const fileName = `${board.title.replace(/\s+/g, '_')}_Documento.pdf`;
  doc.save(fileName);
}
