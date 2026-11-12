import { useState, useRef, useCallback, useEffect } from 'react';
import { MindMapNode, StickyNote, WireframeItem, FlowShape } from '../types';
import { calculateMindMapLayout } from '../utils/treeLayout';

export interface FitViewElements {
  nodes?: MindMapNode[];
  stickies?: StickyNote[];
  wireframes?: WireframeItem[];
  shapes?: FlowShape[];
}

interface UseCanvasNavigationProps {
  nodes: MindMapNode[];
  sidebarOpen: boolean;
  activeBoardId: string;
}

export function useCanvasNavigation({ nodes, sidebarOpen, activeBoardId }: UseCanvasNavigationProps) {
  // Canvas Pan inicial responsivo
  const [pan, setPan] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      x: Math.round(w / 2 - 110),
      y: Math.round(h / 2 - 30)
    };
  });

  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const isSpacePressed = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Enquadramento inteligente e automático (Fit-to-View) para nós, notas, wireframes e formas
  const fitView = useCallback((elementsToFit?: MindMapNode[] | FitViewElements) => {
    let targetNodes: MindMapNode[] = [];
    let targetStickies: StickyNote[] = [];
    let targetWireframes: WireframeItem[] = [];
    let targetShapes: FlowShape[] = [];

    if (Array.isArray(elementsToFit)) {
      targetNodes = elementsToFit;
    } else if (elementsToFit && typeof elementsToFit === 'object') {
      targetNodes = elementsToFit.nodes || [];
      targetStickies = elementsToFit.stickies || [];
      targetWireframes = elementsToFit.wireframes || [];
      targetShapes = elementsToFit.shapes || [];
    } else {
      targetNodes = nodes || [];
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // 1. Processar nós de mapa mental (se existirem)
    if (targetNodes.length > 0) {
      const root = targetNodes.find(n => n.side === 'root') || targetNodes[0];
      const layout = calculateMindMapLayout(targetNodes, root.id, {
        horizontalGap: 100,
        verticalGap: 18,
        rootX: 0,
        rootY: 0
      });

      targetNodes.forEach(node => {
        const computed = layout.get(node.id);
        const x = computed ? computed.x : (node.x || 0);
        const y = computed ? computed.y : (node.y || 0);
        const w = computed ? computed.width : (node.width || 120);
        const h = computed ? computed.height : (node.height || 38);

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + w > maxX) maxX = x + w;
        if (y + h > maxY) maxY = y + h;
      });
    }

    // 2. Processar notas adesivas (se existirem)
    if (targetStickies.length > 0) {
      targetStickies.forEach(s => {
        const x = s.x || 0;
        const y = s.y || 0;
        const w = s.width || 180;
        const h = s.height || 140;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + w > maxX) maxX = x + w;
        if (y + h > maxY) maxY = y + h;
      });
    }

    // 3. Processar wireframes (se existirem)
    if (targetWireframes.length > 0) {
      targetWireframes.forEach(w => {
        const x = w.x || 0;
        const y = w.y || 0;
        const width = w.width || 180;
        const height = w.height || 100;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + width > maxX) maxX = x + width;
        if (y + height > maxY) maxY = y + height;
      });
    }

    // 4. Processar formas geométricas (se existirem)
    if (targetShapes.length > 0) {
      targetShapes.forEach(s => {
        const x = s.x || 0;
        const y = s.y || 0;
        const w = s.width || 120;
        const h = s.height || 80;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + w > maxX) maxX = x + w;
        if (y + h > maxY) maxY = y + h;
      });
    }

    if (!isFinite(minX)) {
      // Fallback para centralização padrão caso não haja elementos
      const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const h = typeof window !== 'undefined' ? window.innerHeight : 800;
      setPan({ x: Math.round(w / 2 - 110), y: Math.round(h / 2 - 30) });
      setZoom(1.0);
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= 768;

    const mapWidth = Math.max(maxX - minX, 260);
    const mapHeight = Math.max(maxY - minY, 160);

    const padLeft = sidebarOpen && !isMobile ? 320 : (isMobile ? 24 : 80);
    const padRight = isMobile ? 24 : 80;
    const padTop = isMobile ? 65 : 90;
    const padBottom = isMobile ? 50 : 70;

    const availWidth = Math.max(160, width - padLeft - padRight);
    const availHeight = Math.max(160, height - padTop - padBottom);

    const scaleX = availWidth / mapWidth;
    const scaleY = availHeight / mapHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.25), 1.0);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPanX = padLeft + availWidth / 2 - centerX * newZoom;
    const newPanY = padTop + availHeight / 2 - centerY * newZoom;

    setZoom(Number(newZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [nodes, sidebarOpen]);

  // Listener de redimensionamento da janela
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fitView(nodes);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [fitView, nodes]);

  // Auto-enquadramento ao alternar quadros
  useEffect(() => {
    fitView(nodes);
  }, [activeBoardId]);

  // Listener de movimentação contínua da janela durante Pan
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        panStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleWindowMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        panStartRef.current = null;
      }
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPanning]);

  // Zoom pelo mouse wheel centrado no cursor
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    if (e.shiftKey) {
      setPan(prev => ({ ...prev, x: prev.x - e.deltaY }));
      return;
    }

    const currentSafeZoom = zoom > 0 && isFinite(zoom) ? zoom : 1.0;
    const zoomFactor = 1.08;
    const isZoomIn = e.deltaY < 0;
    const newZoom = isZoomIn ? currentSafeZoom * zoomFactor : currentSafeZoom / zoomFactor;
    const clampedZoom = Math.min(Math.max(newZoom, 0.2), 2.5);

    const mouseX = isFinite(e.clientX) ? e.clientX : 0;
    const mouseY = isFinite(e.clientY) ? e.clientY : 0;

    const newPanX = mouseX - (mouseX - pan.x) * (clampedZoom / currentSafeZoom);
    const newPanY = mouseY - (mouseY - pan.y) * (clampedZoom / currentSafeZoom);

    setZoom(Number(clampedZoom.toFixed(3)));
    setPan({
      x: isFinite(newPanX) ? Math.round(newPanX) : pan.x,
      y: isFinite(newPanY) ? Math.round(newPanY) : pan.y
    });
  }, [zoom, pan]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(Number((prev + 0.1).toFixed(2)), 2.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(Number((prev - 0.1).toFixed(2)), 0.2));
  }, []);

  const handleResetZoom = useCallback(() => {
    fitView();
  }, [fitView]);

  return {
    pan,
    setPan,
    zoom,
    setZoom,
    isPanning,
    setIsPanning,
    isSpacePressed,
    panStartRef,
    fitView,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom
  };
}
