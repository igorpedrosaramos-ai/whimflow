import { MindMapNode } from '../types';

// Cache em memória para evitar medições redundantes (alta performance)
const measurementCache = new Map<string, number>();

export function clearMeasurementCache(): void {
  measurementCache.clear();
}

let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  if (!offscreenCtx) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');
  }
  return offscreenCtx;
}

/**
 * Constrói a string de fonte CSS exata correspondente ao estilo do nó no DOM
 */
export function getNodeFontCss(node: MindMapNode): string {
  const isRoot = node.side === 'root';
  const isBold = Boolean(node.bold || isRoot);
  const isItalic = Boolean(node.italic);

  const fontSize = node.fontSize === 'small' 
    ? '12px' 
    : node.fontSize === 'large' 
    ? '15.5px' 
    : (isRoot ? '16px' : '13.5px');

  const fontWeight = isBold ? '700' : '500';
  const fontStyle = isItalic ? 'italic' : 'normal';
  const fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
}

/**
 * Mede com precisão subpixel o texto exato de uma linha usando a Canvas API real do navegador
 */
export function measureSingleLine(text: string, fontCss: string): number {
  if (!text) return 0;

  const cacheKey = `${fontCss}:::${text}`;
  const cached = measurementCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const ctx = getCanvasContext();
  let measuredWidth = 0;

  if (ctx) {
    ctx.font = fontCss;
    measuredWidth = ctx.measureText(text).width;
  } else {
    // Fallback matemático ponderado para ambientes sem Canvas (SSR/Node)
    // Atribui pesos reais para maiúsculas, minúsculas e pontuação
    const isLarge = fontCss.includes('15.5px') || fontCss.includes('16px');
    const isSmall = fontCss.includes('12px');
    const baseUnit = isLarge ? 9.5 : (isSmall ? 7.2 : 8.1);

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/[A-Z]/.test(ch)) {
        measuredWidth += baseUnit * 1.25; // Maiúsculas são 25% mais largas
      } else if (/[mwWM]/.test(ch)) {
        measuredWidth += baseUnit * 1.35; // Caracteres largos
      } else if (/[ijlI1.,;:'!]/.test(ch)) {
        measuredWidth += baseUnit * 0.55; // Caracteres estreitos
      } else if (/\s/.test(ch)) {
        measuredWidth += baseUnit * 0.45; // Espaços
      } else {
        measuredWidth += baseUnit * 0.95; // Letras comuns
      }
    }
  }

  // Margem de segurança de renderização de glifo (+1px subpixel rounding)
  const finalWidth = Math.ceil(measuredWidth);
  measurementCache.set(cacheKey, finalWidth);
  return finalWidth;
}

/**
 * Mede as dimensões completas e precisas de um nó para cálculo da árvore e dos conectores
 */
export function measureNodeText(node: MindMapNode): { width: number; height: number; maxLineWidth: number } {
  const rawText = (node.text || '').trim();
  const fontCss = getNodeFontCss(node);
  const isRoot = node.side === 'root';

  if (!rawText) {
    return {
      width: isRoot ? 110 : 48,
      height: isRoot ? 32 : 24,
      maxLineWidth: 0
    };
  }

  const lines = rawText.split('\n');
  const isMultiline = lines.length > 1;

  let maxLineWidth = 0;
  for (const line of lines) {
    const lineWidth = measureSingleLine(line, fontCss);
    if (lineWidth > maxLineWidth) {
      maxLineWidth = lineWidth;
    }
  }

  // Respiro horizontal generoso de segurança (12px à esquerda + 12px à direita = 24px)
  // Garante uma barreira inquebrável para que linhas e botões nunca toquem nas letras
  const horizontalPadding = 24;
  const iconPadding = node.icon ? 22 : 0;
  const linkPadding = node.link ? 20 : 0;

  // Largura total: o texto real medido + respiro interno + ícone/link
  const totalWidth = Math.max(
    isRoot ? 90 : 44,
    maxLineWidth + horizontalPadding + iconPadding + linkPadding
  );

  // Altura total: linha única vs parágrafo
  const baseLineHeight = node.fontSize === 'large' ? 22 : (node.fontSize === 'small' ? 18 : 20);
  const totalHeight = isMultiline
    ? Math.max(30, lines.length * baseLineHeight + 8)
    : (isRoot ? 32 : (node.fontSize === 'large' ? 28 : (node.fontSize === 'small' ? 20 : 24)));

  return {
    width: totalWidth,
    height: totalHeight,
    maxLineWidth
  };
}
