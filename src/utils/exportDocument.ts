import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import { Board, MindMapNode } from '../types';
import { generateBoardSVG } from './exportImage';

/**
 * Renderiza o SVG do quadro para uma imagem em base64 (Data URL PNG)
 * em escala Retina 2x para inserção com proporção exata em PPTX e PDF.
 */
function renderBoardToDataUrl(board: Board, theme: 'light' | 'dark' = 'light'): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    try {
      const svg = generateBoardSVG(board, theme);
      if (!svg) {
        reject(new Error('SVG vazio gerado para o quadro'));
        return;
      }
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const scale = 2;
        const w = img.width || 1200;
        const h = img.height || 800;
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context não suportado'));
          return;
        }

        ctx.fillStyle = theme === 'light' ? '#f8fafc' : '#0f1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve({ dataUrl, width: w, height: h });
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
 * Exporta o Quadro completo para apresentação Microsoft PowerPoint (.pptx)
 * com capa executiva, slide de visão geral visual em alta resolução
 * e slides detalhados por categoria/ramo, notas adesivas e fluxogramas.
 */
export async function exportBoardAsPPTX(board: Board): Promise<void> {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Whimflow Professional';
  pres.company = 'Whimflow';
  pres.title = board.title;

  const nodes = board.mindMapNodes || [];
  const stickies = board.stickies || [];
  const shapes = board.shapes || [];
  const wireframes = board.wireframes || [];
  const rootNode = nodes.find(n => n.side === 'root') || nodes[0];
  const primaryBranches = rootNode ? nodes.filter(n => n.parentId === rootNode.id) : [];

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

  const totalElements = nodes.length + stickies.length + shapes.length + wireframes.length;
  slideCover.addText(`DOCUMENTO ESTRATÉGICO • ${totalElements} ELEMENTOS E ITENS MAPEADOS`, {
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

  slideCover.addText(`Gerado em ${new Date().toLocaleDateString('pt-BR')} • Whimflow Exportação Executiva`, {
    x: 0.8,
    y: 4.8,
    w: 8.4,
    h: 0.4,
    fontSize: 11,
    color: '94A3B8',
    fontFace: 'Arial'
  });

  // SLIDE 2: Visão Geral com o Diagrama Visual Completo (Nós, Stickies, Formas, Conectores)
  try {
    const currentTheme = (localStorage.getItem('whimflow_theme') as 'light' | 'dark') || 'light';
    const { dataUrl, width: imgW, height: imgH } = await renderBoardToDataUrl(board, currentTheme);
    const slideDiagram = pres.addSlide();
    slideDiagram.background = { color: currentTheme === 'light' ? 'F8FAFC' : '0F1117' };

    slideDiagram.addText(`${board.title} — Visão Geral do Quadro`, {
      x: 0.8,
      y: 0.4,
      w: 8.4,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: currentTheme === 'light' ? '0F172A' : 'F8FAFC',
      fontFace: 'Arial'
    });

    // Proporção matemática perfeita sem distorção
    const maxW = 8.4;
    const maxH = 4.3;
    const ratio = (imgW && imgH) ? (imgW / imgH) : (16 / 9);
    let fitW = maxW;
    let fitH = maxW / ratio;
    if (fitH > maxH) {
      fitH = maxH;
      fitW = maxH * ratio;
    }
    const posX = 0.8 + (maxW - fitW) / 2;
    const posY = 1.1 + (maxH - fitH) / 2;

    slideDiagram.addImage({
      data: dataUrl,
      x: posX,
      y: posY,
      w: fitW,
      h: fitH
    });
  } catch (err) {
    console.warn('Não foi possível renderizar imagem visual no PPTX:', err);
  }

  // SLIDES SUBSEQUENTES: 1 Slide por Ramo Principal / Categoria do Mapa Mental
  primaryBranches.forEach((branch, idx) => {
    const slide = pres.addSlide();
    slide.background = { color: '0F172A' };

    const branchColor = (branch.color || '#6366f1').replace('#', '');
    const children = nodes.filter(n => n.parentId === branch.id);

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
        slide.addShape(pres.ShapeType.roundRect, {
          x: colX,
          y: currentY,
          w: 3.9,
          h: 0.48,
          fill: { color: '1E293B' },
          line: { color: '334155', width: 1 },
          rectRadius: 0.08
        });

        slide.addShape(pres.ShapeType.rect, {
          x: colX,
          y: currentY,
          w: 0.08,
          h: 0.48,
          fill: { color: branchColor },
          line: { color: branchColor }
        });

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

  // SLIDE ADICIONAL: Notas Adesivas & Brainstorming (se houver)
  if (stickies.length > 0) {
    const slideStickies = pres.addSlide();
    slideStickies.background = { color: '0F172A' };

    slideStickies.addText('Notas Adesivas & Brainstorming', {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    slideStickies.addText(`${stickies.length} notas adesivas registradas no quadro`, {
      x: 0.8,
      y: 1.05,
      w: 8.4,
      h: 0.35,
      fontSize: 11,
      color: '94A3B8',
      fontFace: 'Arial'
    });

    // Exibe até 6 notas em grid corporativo 3x2
    stickies.slice(0, 6).forEach((s, sIdx) => {
      const row = Math.floor(sIdx / 3);
      const col = sIdx % 3;
      const sX = 0.8 + col * 2.85;
      const sY = 1.6 + row * 1.7;

      slideStickies.addShape(pres.ShapeType.roundRect, {
        x: sX,
        y: sY,
        w: 2.7,
        h: 1.5,
        fill: { color: 'FEF08A' },
        line: { color: 'FDE047', width: 1 },
        rectRadius: 0.08
      });

      slideStickies.addText(s.text || 'Nota em branco', {
        x: sX + 0.15,
        y: sY + 0.15,
        w: 2.4,
        h: 1.0,
        fontSize: 11,
        color: '1E293B',
        fontFace: 'Arial'
      });

      if (s.author) {
        slideStickies.addText(`— ${s.author}`, {
          x: sX + 0.15,
          y: sY + 1.15,
          w: 2.4,
          h: 0.25,
          fontSize: 9.5,
          color: '64748B',
          fontFace: 'Arial',
          italic: true,
          align: 'right'
        });
      }
    });
  }

  // SLIDE ADICIONAL: Fluxogramas e Formas (se houver)
  if (shapes.length > 0) {
    const slideShapes = pres.addSlide();
    slideShapes.background = { color: '0F172A' };

    slideShapes.addText('Estrutura de Fluxograma & Processos', {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    slideShapes.addText(`${shapes.length} blocos e etapas de fluxo mapeados`, {
      x: 0.8,
      y: 1.05,
      w: 8.4,
      h: 0.35,
      fontSize: 11,
      color: '94A3B8',
      fontFace: 'Arial'
    });

    shapes.slice(0, 8).forEach((sh, shIdx) => {
      const row = Math.floor(shIdx / 2);
      const col = shIdx % 2;
      const shX = col === 0 ? 0.8 : 5.2;
      const shY = 1.6 + row * 0.7;

      slideShapes.addShape(pres.ShapeType.roundRect, {
        x: shX,
        y: shY,
        w: 3.9,
        h: 0.55,
        fill: { color: '1E293B' },
        line: { color: '38BDF8', width: 1.2 },
        rectRadius: 0.08
      });

      slideShapes.addText(`[${sh.type.toUpperCase()}] ${sh.text || 'Etapa sem rótulo'}`, {
        x: shX + 0.2,
        y: shY + 0.06,
        w: 3.5,
        h: 0.42,
        fontSize: 12,
        color: 'F8FAFC',
        fontFace: 'Arial',
        bold: true
      });
    });
  }

  const fileName = `${board.title.replace(/\s+/g, '_')}_Apresentacao.pptx`;
  await pres.writeFile({ fileName });
}

/**
 * Exporta o Quadro completo para Relatório Executivo PDF (.pdf)
 * com o diagrama em página inteira de alta resolução e detalhamento dos ramos,
 * notas adesivas e blocos de processos em padrão corporativo elegante.
 */
export async function exportBoardAsPDF(board: Board): Promise<void> {
  const nodes = board.mindMapNodes || [];
  const stickies = board.stickies || [];
  const shapes = board.shapes || [];
  const rootNode = nodes.find(n => n.side === 'root') || nodes[0];
  const primaryBranches = rootNode ? nodes.filter(n => n.parentId === rootNode.id) : [];

  // Cria documento PDF em modo paisagem (A4 Widescreen 297 x 210 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const currentTheme = (localStorage.getItem('whimflow_theme') as 'light' | 'dark') || 'light';
  const isLight = currentTheme === 'light';

  // PÁGINA 1: Diagrama Completo do Quadro em Alta Definição
  doc.setFillColor(isLight ? 248 : 15, isLight ? 250 : 17, isLight ? 252 : 23);
  doc.rect(0, 0, 297, 210, 'F');

  // Cabeçalho da página 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(isLight ? 15 : 255, isLight ? 23 : 255, isLight ? 42 : 255);
  doc.text(board.title, 15, 16);

  const totalItems = nodes.length + stickies.length + shapes.length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Quadro Estratégico Completo • ${totalItems} Itens • Exportado em ${new Date().toLocaleDateString('pt-BR')}`, 15, 22);

  try {
    const { dataUrl, width: imgW, height: imgH } = await renderBoardToDataUrl(board, currentTheme);
    
    // Calcula dimensões com proporção 100% matemática preservada (nunca estica nem achata)
    const maxW = 267; // 297mm - 30mm de margens
    const maxH = 165; // 210mm - 45mm de cabeçalho e margem inferior
    const ratio = (imgW && imgH) ? (imgW / imgH) : (16 / 9);

    let fitW = maxW;
    let fitH = maxW / ratio;
    if (fitH > maxH) {
      fitH = maxH;
      fitW = maxH * ratio;
    }

    const posX = 15 + (maxW - fitW) / 2;
    const posY = 28 + (maxH - fitH) / 2;

    doc.addImage(dataUrl, 'PNG', posX, posY, fitW, fitH, undefined, 'FAST');
  } catch (err) {
    console.warn('Erro ao inserir imagem no PDF:', err);
  }

  // PÁGINAS SEGUINTES: Detalhamento por Ramos do Mapa Mental (Papel Timbrado Executivo)
  primaryBranches.forEach((branch, idx) => {
    doc.addPage('a4', 'landscape');
    
    // Fundo papel timbrado executivo limpo (branco absoluto)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Faixa colorida do ramo
    const colorHex = branch.color || '#6366f1';
    const r = parseInt(colorHex.slice(1, 3), 16) || 99;
    const g = parseInt(colorHex.slice(3, 5), 16) || 102;
    const b = parseInt(colorHex.slice(5, 7), 16) || 241;

    // Linha de cabeçalho sutil
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 32, 282, 32);

    // Indicador visual do ramo
    doc.setFillColor(r, g, b);
    doc.rect(15, 14, 4, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Texto escuro de alto contraste
    doc.text(`${idx + 1}. ${branch.text}`, 24, 22);

    const children = nodes.filter(n => n.parentId === branch.id);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Detalhamento dos ${children.length} tópicos do ramo • ${board.title}`, 24, 28);

    // Listagem em 2 colunas de cards de alta legibilidade
    const col1 = children.slice(0, Math.ceil(children.length / 2));
    const col2 = children.slice(Math.ceil(children.length / 2));

    const renderPdfColumn = (items: MindMapNode[], colX: number) => {
      let currentY = 38;
      items.slice(0, 10).forEach((item, itemIdx) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(colX, currentY, 126, 12, 1.5, 1.5, 'F');

        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(colX, currentY, 126, 12, 1.5, 1.5, 'S');

        doc.setFillColor(r, g, b);
        doc.rect(colX, currentY, 2.5, 12, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        const label = `${itemIdx + 1}. ${item.text}`;
        doc.text(label.length > 56 ? label.substring(0, 54) + '...' : label, colX + 6, currentY + 8);

        currentY += 15;
      });

      if (items.length > 10) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`+ ${items.length - 10} outros itens no mapa...`, colX + 6, currentY + 6);
      }
    };

    renderPdfColumn(col1, 15);
    renderPdfColumn(col2, 154);
  });

  // PÁGINA ADICIONAL: Notas Adesivas (se houver)
  if (stickies.length > 0) {
    doc.addPage('a4', 'landscape');
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 32, 282, 32);

    doc.setFillColor(234, 179, 8); // Amarelo executivo
    doc.rect(15, 14, 4, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Notas Adesivas & Brainstorming', 24, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${stickies.length} anotações capturadas no projeto`, 24, 28);

    stickies.slice(0, 6).forEach((s, sIdx) => {
      const row = Math.floor(sIdx / 3);
      const col = sIdx % 3;
      const sX = 15 + col * 90;
      const sY = 40 + row * 65;

      doc.setFillColor(254, 249, 195);
      doc.roundedRect(sX, sY, 84, 55, 2, 2, 'F');
      doc.setDrawColor(250, 204, 21);
      doc.roundedRect(sX, sY, 84, 55, 2, 2, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);

      const splitText = doc.splitTextToSize(s.text || 'Nota em branco', 76);
      doc.text(splitText.slice(0, 6), sX + 5, sY + 10);

      if (s.author) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`— ${s.author}`, sX + 79, sY + 50, { align: 'right' });
      }
    });
  }

  const fileName = `${board.title.replace(/\s+/g, '_')}_Documento.pdf`;
  doc.save(fileName);
}
