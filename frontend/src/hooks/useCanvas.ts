import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas as FabricCanvas, Rect, Circle, Textbox, Line, FabricImage, Polygon, Point, Group, ActiveSelection, util, Triangle, Path, loadSVGFromString } from 'fabric';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { renderTemplateElements } from '@/utils/templateRenderer';
import { sanitizeObject } from '@/utils/url';

interface CanvasElement {
  id: string;
  type: string;
  object: any;
}

export interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: FabricCanvas | null;
  selectedObject: any;
  addText: (text?: string) => void;
  addShape: (shape: string) => void;
  addImage: (file: File) => Promise<void>;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  setBackgroundColor: (color: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  setZoom: (zoom: number) => void;
  resetViewport: () => void;
  getPNGDataURL: (multiplier?: number) => string | null;
  getPDFBlob: (multiplier?: number) => Blob | null;
  getPDFBlobURL: (multiplier?: number) => string | null;
  exportToPNG: (multiplier?: number) => void;
  exportToPDF: (multiplier?: number) => void;
  loadTemplate: (templateData: any) => void;
  loadFromJSON: (json: any) => Promise<void>;
  groupSelected: () => void;
  ungroupSelected: () => void;
  toggleLock: () => void;
  saveToHistory: (canvas: FabricCanvas) => void;
  toggleSafeZone: () => void;
  showSafeZone: boolean;
  zoomToFit: () => void;
}

export const useCanvas = (): UseCanvasReturn => {





  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [history, setHistory] = useState<string[]>([]);
  const historyIndexRef = useRef(-1); // Use ref to avoid stale closures
  const [historyIndexState, setHistoryIndexState] = useState(-1); // For UI reactivity
  const [zoom, setZoomState] = useState(100);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const isLoadingHistory = useRef(false);
  const nativeWidthRef = useRef(2000);
  const nativeHeightRef = useRef(1500);
  const dprRef = useRef(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  // ResizeObserver for responsive fit
  useEffect(() => {
    if (!canvas) return;

    const workspace = document.getElementById('canvas-workspace');
    if (!workspace) return;

    const resizeObserver = new ResizeObserver(() => {
      // Re-center but don't necessarily re-zoom unless the workspace becomes smaller than current zoom
      // For simplicity, let's just trigger a re-render to ensure centering via CSS
      canvas.renderAll();
    });

    resizeObserver.observe(workspace);
    return () => resizeObserver.disconnect();
  }, [canvas]);

  // Helper function to apply professional selection styles
  const applySelectionStyle = useCallback((obj: any) => {
    if (!obj) return;
    const isLocked = obj.lockMovementX;
    const primaryColor = isLocked ? '#ef4444' : '#3b82f6'; // Bright professional blue
    const isText = obj.type === 'textbox' || obj.type === 'i-text';

    obj.set({
      // Border
      borderColor: primaryColor,
      borderScaleFactor: 2,
      borderDashArray: obj.type === 'group' || isLocked ? [5, 5] : null,
      padding: 4,

      // Corners (Handles)
      cornerStyle: 'circle',
      cornerSize: 12,
      cornerColor: '#ffffff',
      cornerStrokeColor: primaryColor,
      transparentCorners: false,
      cornerColorOver: primaryColor,

      // Controls visibility and functionality
      hasControls: true,
      hasBorders: true,

      // Canvas selection styling
      selectionBackgroundColor: 'rgba(59, 130, 246, 0.05)',

      // Canva-style scaling behavior
      lockScalingX: isLocked,
      lockScalingY: isLocked,
      lockRotation: isLocked,
      lockUniScaling: false,

      // For shapes: uniform scaling on corners (maintains aspect ratio)
      uniformScaling: !isText,
    });

    // Canva-Style Control Visibility
    if (isText) {
      // Text: Only 6 handles (4 corners + 2 sides, NO top/bottom)
      obj.setControlsVisibility({
        tl: true,   // top-left corner (font scaling)
        tr: true,   // top-right corner (font scaling)
        br: true,   // bottom-right corner (font scaling)
        bl: true,   // bottom-left corner (font scaling)
        ml: true,   // middle-left (width resize)
        mr: true,   // middle-right (width resize)
        mt: false,  // DISABLED: no top handle (prevents vertical stretch)
        mb: false,  // DISABLED: no bottom handle (prevents vertical stretch)
        mtr: !isLocked  // rotation handle
      });
    } else {
      // Shapes: All 8 handles enabled
      obj.setControlsVisibility({
        tl: true,  // top-left corner (uniform scale)
        tr: true,  // top-right corner (uniform scale)
        br: true,  // bottom-right corner (uniform scale)
        bl: true,  // bottom-left corner (uniform scale)
        ml: true,  // middle-left (width only)
        mt: true,  // middle-top (height only)
        mr: true,  // middle-right (width only)
        mb: true,  // middle-bottom (height only)
        mtr: !isLocked  // rotation handle
      });
    }
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const el = canvasRef.current;

    // 1. Dispose any existing instance on this DOM element immediately
    // This is the strongest fix for duplicate containers/ghosts
    if ((el as any)._fabricInstance) {
      console.warn("Fabric: Found existing instance on element, disposing before re-init");
      try {
        (el as any)._fabricInstance.dispose();
      } catch (e) {
        console.error("Fabric: Error disposing previous instance", e);
      }
      delete (el as any)._fabricInstance;
    }

    // 2. Clear ANY stale wrapper DIVs in the parent manually
    const parent = el.parentElement;
    if (parent) {
      const orphans = parent.querySelectorAll('.canvas-container');
      if (orphans.length > 0) {
        console.warn(`Fabric: Found ${orphans.length} orphan containers, purging...`);
        orphans.forEach(orph => orph.remove());
      }
    }

    const dpr = dprRef.current;
    const initialWidth = 800;
    const initialHeight = 600;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: initialWidth,
      height: initialHeight,
      backgroundColor: 'transparent',
      selection: true,
      selectionColor: 'rgba(59, 130, 246, 0.08)',
      selectionBorderColor: '#3b82f6',
      selectionLineWidth: 1.5,
      preserveObjectStacking: true,
      perPixelTargetFind: false,
      subTargetCheck: true,
      enableRetinaScaling: true,
    });

    // Apply high-DPI scaling
    fabricCanvas.setDimensions({
      width: initialWidth * dpr,
      height: initialHeight * dpr
    }, { backstoreOnly: true });

    fabricCanvas.setDimensions({
      width: initialWidth,
      height: initialHeight
    }, { cssOnly: true });

    fabricCanvas.setZoom(dpr);


    // Event listeners
    const handleSelection = () => {
      const active = fabricCanvas.getActiveObject();
      applySelectionStyle(active);
      setSelectedObject(active);
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    fabricCanvas.on('object:modified', () => {
      if (!isLoadingHistory.current) {
        saveToHistory(fabricCanvas);
      }
    });

    // Smart Zone Auto-Scaling Logic
    fabricCanvas.on('text:changed', (opt) => {
      const obj = opt.target as any;
      if (obj && obj.role && obj.layoutConstraint?.autoScaleText) {
        const constraint = obj.layoutConstraint;
        const maxWidth = (constraint.maxWidth || obj.width) * (obj.scaleX || 1);

        // If text exceeds max width, scale down font size
        // We use a temporary check against fixed width if provided
        if (constraint.maxWidth && obj.width > constraint.maxWidth) {
          const ratio = constraint.maxWidth / obj.width;
          const newFontSize = Math.floor(obj.fontSize * ratio);
          // Prevent font from becoming too small (e.g., min 8px)
          if (newFontSize >= 8) {
            obj.set('fontSize', newFontSize);
            fabricCanvas.requestRenderAll();
          }
        }
      }
    });

    // Enable panning when zoomed
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    fabricCanvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      // Enable panning on middle mouse button or Alt + left click
      // We removed Shift + Click to allow multi-selection (Canva-like)
      if (evt.button === 1 || (evt.button === 0 && evt.altKey)) {
        isPanning = true;
        fabricCanvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    fabricCanvas.on('mouse:move', (opt) => {
      if (isPanning) {
        const evt = opt.e as MouseEvent;
        const vpt = fabricCanvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - lastPosX;
          vpt[5] += evt.clientY - lastPosY;
          fabricCanvas.requestRenderAll();
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
        }
      }
    });

    fabricCanvas.on('mouse:up', () => {
      if (isPanning) {
        fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform);
        isPanning = false;
        fabricCanvas.selection = true;
      }
    });

    // Optimized Hover Logic (Reuse Object for Smoothness)
    let hoverRect: Rect | null = null;
    let currentTarget: any = null; // Use reference for stability (Fixes flickering)

    const getHoverRect = () => {
      if (!hoverRect) {
        hoverRect = new Rect({
          left: 0, top: 0, width: 0, height: 0,
          fill: 'transparent',
          stroke: '#3b82f6',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          opacity: 0.5,
          visible: false
        });
        (hoverRect as any).excludeFromExport = true;
        fabricCanvas.add(hoverRect);
      }
      return hoverRect;
    };

    const hideHover = () => {
      if (hoverRect && hoverRect.visible) {
        hoverRect.visible = false;
        currentTarget = null;
        fabricCanvas.requestRenderAll();
      }
    };

    // Hybrid Hover Logic with Optimization
    fabricCanvas.on('mouse:move', (e) => {
      if (isPanning) return;

      const pointer = fabricCanvas.getPointer(e.e);
      let target: any = e.target;

      // Enhanced Fallback Search
      if (!target) {
        const objects = fabricCanvas.getObjects();
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          if (obj === hoverRect || !obj.visible || obj === fabricCanvas.getActiveObject()) continue;

          // 1. Groups: Allow selection of container
          if (obj.type === 'group' && obj.containsPoint(pointer)) {
            target = obj;
            break;
          }

          // 2. Text & Shapes: Standard Detection with Transparency Check
          if (obj.containsPoint(pointer)) {
            // For Text: Always accept (Restores functionality)
            // For Shapes: Ignore transparent frames (Fixes glitch for borders)
            if (obj.type.includes('text') || obj.type === 'group' || obj.fill !== 'transparent') {
              target = obj;
              break;
            }
          }
        }
      }

      if (!target || target === hoverRect || target === fabricCanvas.getActiveObject()) {
        hideHover();
        return;
      }

      // Zero Flicker: Check object reference equality
      if (currentTarget === target && hoverRect?.visible) {
        return;
      }

      currentTarget = target;

      const rect = getHoverRect();
      const bound = target.getBoundingRect();
      const isGroup = target.type === 'group';

      rect.set({
        visible: true,
        left: bound.left - 2,
        top: bound.top - 2,
        width: bound.width + 4,
        height: bound.height + 4,
        strokeDashArray: isGroup ? [5, 5] : undefined,
        stroke: '#3b82f6',
      });
      rect.setCoords();

      if (fabricCanvas.bringObjectToFront) {
        fabricCanvas.bringObjectToFront(rect);
      } else {
        // Fallback for older fabric versions or different types
        (rect as any).bringToFront?.();
      }
      fabricCanvas.requestRenderAll();
    });

    if (fabricCanvas.wrapperEl) {
      fabricCanvas.wrapperEl.onmouseleave = () => hideHover();
    }

    // Smart Click: Select if clicking on Hover Fallback
    fabricCanvas.on('mouse:down', (e) => {
      const evt = e.e as MouseEvent;
      if (isPanning) {
        hideHover();
        return;
      }

      if (!e.target && hoverRect && hoverRect.visible && currentTarget) {
        if (evt.shiftKey) {
          // Handle Shift+Click Multi-Selection manually
          const activeObject = fabricCanvas.getActiveObject();
          if (activeObject) {
            if (activeObject.type === 'activeSelection') {
              const selection = activeObject as ActiveSelection;
              const alreadySelected = selection.getObjects().includes(currentTarget);
              if (alreadySelected) {
                (selection as any).removeWithUpdate(currentTarget);
                // If only 1 remains, convert back to single object
                if (selection.getObjects().length === 1) {
                  fabricCanvas.setActiveObject(selection.getObjects()[0]);
                }
              } else {
                (selection as any).addWithUpdate(currentTarget);
              }
            } else {
              // Current selection is single object
              if (activeObject === currentTarget) {
                fabricCanvas.discardActiveObject();
              } else {
                const newSelection = new ActiveSelection([activeObject, currentTarget], {
                  canvas: fabricCanvas
                });
                fabricCanvas.setActiveObject(newSelection);
              }
            }
          } else {
            fabricCanvas.setActiveObject(currentTarget);
          }
          // Force React State Update (Crucial for Properties Panel)
          setSelectedObject(fabricCanvas.getActiveObject());
        } else {
          // Normal Click
          fabricCanvas.setActiveObject(currentTarget);
        }
        fabricCanvas.requestRenderAll();
      }

      hideHover();
    });

    // Mouse wheel zoom - DISABLED to prevent accidental zoom while scrolling
    // Users will use zoom buttons instead
    /*
    fabricCanvas.on('mouse:wheel', (opt) => {
      const evt = opt.e as WheelEvent;
      evt.preventDefault();
      evt.stopPropagation();
  
      let zoom = fabricCanvas.getZoom();
  
      // Smoother zoom increment
      const zoomStep = 0.1;
      if (evt.deltaY < 0) {
        zoom += zoomStep; // Zoom in
      } else {
        zoom -= zoomStep; // Zoom out
      }
  
      // Limit zoom range (50% to 200%)
      if (zoom > 2) zoom = 2;
      if (zoom < 0.5) zoom = 0.5;
  
      // Zoom to mouse pointer location
      const point = new Point(evt.offsetX, evt.offsetY);
      fabricCanvas.zoomToPoint(point, zoom);
  
      // Update zoom state immediately
      setZoomState(Math.round(zoom * 100));
      fabricCanvas.renderAll();
    });
    */

    // Link the instance to the element for future checks
    (el as any)._fabricInstance = fabricCanvas;
    setCanvas(fabricCanvas);
    saveToHistory(fabricCanvas);

    return () => {
      console.log("Fabric: Disposing canvas instance");
      fabricCanvas.dispose();
      if (el) delete (el as any)._fabricInstance;
    };
  }, []);

  const saveToHistory = useCallback((fabricCanvas: FabricCanvas) => {
    // IMPORTANT: Include all custom properties to ensure full fidelity (Groups, Locks, IDs)
    const propertiesToInclude = [
      'id', '_id', 'name', 'visible', 'selectable', 'hasControls', 'locked',
      'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY',
      'borderColor', 'borderDashArray', 'padding', 'backgroundColor', 'opacity'
    ];

    const json = JSON.stringify(fabricCanvas.toObject(propertiesToInclude));

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndexRef.current + 1);
      newHistory.push(json);
      const trimmedHistory = newHistory.slice(-50); // Keep last 50 states

      // Adjust the index based on how much we trimmed
      const trimmedCount = newHistory.length - trimmedHistory.length;
      historyIndexRef.current = newHistory.length - 1 - trimmedCount;
      setHistoryIndexState(historyIndexRef.current);

      return trimmedHistory;
    });
  }, []); // No dependencies - uses ref

  const addText = useCallback((text = 'Double-click to edit') => {
    if (!canvas) return;

    const textbox = new Textbox(text, {
      left: 100,
      top: 100,
      width: 300,
      fontSize: 32,
      fontFamily: 'Outfit',
      fill: '#1a1a1a',
      textAlign: 'center',
      // Ensure controls are enabled
      hasControls: true,
      hasBorders: true,
      // Ensure movement is enabled
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      // Allow selection and interaction
      selectable: true,
      evented: true,
      // Add unique IDs for mapping/persistence
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      _id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    applySelectionStyle(textbox);
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    saveToHistory(canvas);
  }, [canvas, saveToHistory]);

  const addShape = useCallback((shape: string) => {
    if (!canvas) return;

    let object;
    const commonProps = {
      left: 100,
      top: 100,
      fill: '#7C3AED',
      stroke: '#6D28D9',
      strokeWidth: 2,
      // Ensure controls are enabled
      hasControls: true,
      hasBorders: true,
      // Ensure movement is enabled
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      // Allow selection and interaction
      selectable: true,
      evented: true,
      perPixelTargetFind: false,
    };

    switch (shape) {
      case 'rectangle':
        object = new Rect({
          ...commonProps,
          width: 150,
          height: 100,
          rx: 8,
          ry: 8,
        });
        break;
      case 'circle':
        object = new Circle({
          ...commonProps,
          radius: 60,
        });
        break;
      case 'triangle':
        object = new Triangle({
          ...commonProps,
          width: 120,
          height: 120,
        });
        break;
      case 'pentagon':
        {
          const points = [];
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            points.push({ x: 60 * Math.cos(angle), y: 60 * Math.sin(angle) });
          }
          object = new Polygon(points, { ...commonProps });
        }
        break;
      case 'hexagon':
        {
          const points = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            points.push({ x: 60 * Math.cos(angle), y: 60 * Math.sin(angle) });
          }
          object = new Polygon(points, { ...commonProps });
        }
        break;
      case 'star':
        {
          // 5-point star
          const points = [];
          const spikes = 5;
          const outerRadius = 70;
          const innerRadius = 35;
          let rot = Math.PI / 2 * 3;
          let x = 0;
          let y = 0;
          const step = Math.PI / spikes;

          for (let i = 0; i < spikes; i++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            points.push({ x, y });
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            points.push({ x, y });
            rot += step;
          }
          object = new Polygon(points, { ...commonProps });
        }
        break;
      case 'badge':
        {
          // Seal/Badge shape (many spikes)
          const points = [];
          const spikes = 20;
          const outerRadius = 70;
          const innerRadius = 60;
          let rot = 0;
          let x = 0;
          let y = 0;
          const step = Math.PI / spikes;

          for (let i = 0; i < spikes; i++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            points.push({ x, y });
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            points.push({ x, y });
            rot += step;
          }
          object = new Polygon(points, { ...commonProps });
        }
        break;
      case 'shield':
        {
          // Simple Shield Path
          const points = [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 80 },
            { x: 50, y: 120 },
            { x: 0, y: 80 }
          ];
          object = new Polygon(points, { ...commonProps, left: 100, top: 100 });
        }
        break;

      // -- DECORATIONS --
      case 'ribbon':
        // Classic Banner Ribbon
        object = new Path('M 0 0 L 300 0 L 280 40 L 300 80 L 0 80 L 20 40 L 0 0 Z', {
          ...commonProps,
          fill: '#EAB308', // Gold
          stroke: '#CA8A04',
          width: 300,
          height: 80,
          scaleX: 0.5,
          scaleY: 0.5
        });
        break;

      case 'corner':
        // Ornamental Corner (L-shape with flourish)
        object = new Path('M 0 0 L 100 0 L 90 20 L 30 20 L 30 80 L 20 90 L 0 100 Z', {
          ...commonProps,
          left: 100,
          top: 100,
          fill: '#EAB308',
          stroke: '#CA8A04',
          scaleX: 0.5,
          scaleY: 0.5
        });
        break;

      case 'divider':
        // Fancy Divider (Line with diamond center)
        {
          const p1 = new Path('M 0 10 L 100 10 L 110 0 L 120 10 L 220 10 L 220 12 L 120 12 L 110 22 L 100 12 L 0 12 Z', {
            ...commonProps,
            fill: '#1a1a1a',
            stroke: 'transparent',
            left: 100,
            top: 100,
          });
          object = p1;
        }
        break;

      case 'laurel':
        // Simple Abstract Laurel Branch
        object = new Path('M 50 100 Q 50 50 100 20 Q 80 40 80 60 Q 90 40 110 30 Q 100 50 100 70', {
          ...commonProps,
          fill: 'transparent',
          stroke: '#EAB308',
          strokeWidth: 3,
          left: 100,
          top: 100
        });
        break;

      case 'party_popper':
        // Cone with confetti burst
        {
          const cone = new Path('M 0 100 L 20 50 L 50 80 Z', { fill: '#F43F5E', stroke: '#E11D48', strokeWidth: 2 });
          // Simple burst lines
          const burst = new Path('M 20 40 L 10 20 M 35 45 L 30 10 M 45 60 L 60 40', { stroke: '#EAB308', strokeWidth: 3 });

          object = new Group([cone, burst], {
            left: 100, top: 100, scaleX: 1.5, scaleY: 1.5
          });
        }
        break;

      case 'trophy':
        // Trophy Cup Path
        object = new Path('M 10 10 L 90 10 L 80 60 Q 50 90 20 60 L 10 10 M 20 60 L 20 80 L 80 80 L 80 60 M 10 20 L 0 20 L 0 40 L 15 40 M 90 20 L 100 20 L 100 40 L 85 40', {
          ...commonProps,
          fill: '#EAB308',
          stroke: '#CA8A04',
          scaleX: 0.8,
          scaleY: 0.8
        });
        break;

      case 'diploma':
        // Rolled Scroll/Diploma
        object = new Path('M 10 10 L 90 10 L 90 80 L 10 80 Z M 40 40 L 60 40 M 40 50 L 60 50', {
          ...commonProps,
          fill: '#FEF3C7',
          stroke: '#CA8A04',
          width: 100,
          height: 80
        });
        break;

      case 'line':
        object = new Line([50, 100, 250, 100], {
          ...commonProps,
          fill: 'transparent',
          stroke: '#1a1a1a',
        });
        break;
    }

    if (object) {
      // Assign unique IDs to the new shape
      const uniqueId = `${shape}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      object.set({
        id: uniqueId,
        _id: uniqueId,
      });

      applySelectionStyle(object);
      canvas.add(object);
      canvas.setActiveObject(object);
      canvas.renderAll();
      saveToHistory(canvas);
      toast.success(`${shape.charAt(0).toUpperCase() + shape.slice(1)} added`);
    }
  }, [canvas, saveToHistory]);

  const addImage = useCallback(async (file: File) => {
    if (!canvas) return;

    const isSVG = file.type === 'image/svg+xml' || file.name.endsWith('.svg');

    if (isSVG) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const svgText = e.target?.result as string;
        try {
          const { objects, options } = await loadSVGFromString(svgText);

          // Create a background hit area to ensure it's draggable from anywhere
          const hitArea = new Rect({
            left: options.left,
            top: options.top,
            width: options.width,
            height: options.height,
            fill: 'transparent',
            selectable: false,
            evented: false,
          });

          const group = util.groupSVGElements([hitArea, ...objects], options) as Group;

          // Normalize size
          const maxWidth = 200;
          const maxHeight = 200;
          const scale = Math.min(maxWidth / (group.width || 1), maxHeight / (group.height || 1));

          group.set({
            left: 100,
            top: 100,
            scaleX: scale,
            scaleY: scale,
            fill: '#1a1a1a',
            // Disable per-pixel find for icons so they are draggable from any point in their box
            perPixelTargetFind: false,
            evented: true,
            selectable: true,
            // Ensure the entire group acts as one for dragging
            subTargetCheck: false,
          });

          // Recursively set fill for paths that use currentColor or are empty
          group.forEachObject((obj: any) => {
            if (obj === hitArea) return;
            if (obj.fill === 'currentColor' || !obj.fill || obj.fill === 'rgb(0,0,0)') {
              obj.set('fill', '#1a1a1a');
            }
            if (obj.stroke === 'currentColor' || obj.stroke === 'rgb(0,0,0)') {
              obj.set('stroke', '#1a1a1a');
            }
          });

          applySelectionStyle(group);
          canvas.add(group);
          canvas.setActiveObject(group);
          canvas.renderAll();
          saveToHistory(canvas);
          toast.success('Vector icon added');
        } catch (error) {
          console.error('Error loading SVG:', error);
          toast.error('Failed to load vector icon, falling back to image');
          loadAsImage(file);
        }
      };
      reader.readAsText(file);
    } else {
      loadAsImage(file);
    }
  }, [canvas, saveToHistory, applySelectionStyle]);

  const loadAsImage = (file: File) => {
    if (!canvas) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const img = await FabricImage.fromURL(dataUrl);
      const maxWidth = 300;
      const maxHeight = 200;
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
      img.set({
        left: 100,
        top: 100,
        scaleX: scale,
        scaleY: scale,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveToHistory(canvas);
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      saveToHistory(canvas);
    }
  }, [canvas, saveToHistory]);

  const bringForward = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const currentIndex = canvas.getObjects().indexOf(activeObject);
      console.log('Bringing forward - current index:', currentIndex, 'total objects:', canvas.getObjects().length);
      canvas.bringObjectForward(activeObject);
      canvas.requestRenderAll();
      saveToHistory(canvas);
      console.log('New index:', canvas.getObjects().indexOf(activeObject));
    }
  }, [canvas, saveToHistory]);

  const sendBackward = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const currentIndex = canvas.getObjects().indexOf(activeObject);
      console.log('Sending backward - current index:', currentIndex, 'total objects:', canvas.getObjects().length);
      canvas.sendObjectBackwards(activeObject);
      canvas.requestRenderAll();
      saveToHistory(canvas);
      console.log('New index:', canvas.getObjects().indexOf(activeObject));
    }
  }, [canvas, saveToHistory]);

  const setBackgroundColor = useCallback((color: string) => {
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.renderAll();
    saveToHistory(canvas);
  }, [canvas, saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0 || !canvas) return;
    isLoadingHistory.current = true;
    const newIndex = historyIndexRef.current - 1;
    canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      canvas.renderAll();
      historyIndexRef.current = newIndex;
      setHistoryIndexState(newIndex);
      isLoadingHistory.current = false;
    });
  }, [canvas, history]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= history.length - 1 || !canvas) return;
    isLoadingHistory.current = true;
    const newIndex = historyIndexRef.current + 1;
    canvas.loadFromJSON(JSON.parse(history[newIndex])).then(() => {
      canvas.renderAll();
      historyIndexRef.current = newIndex;
      setHistoryIndexState(newIndex);
      isLoadingHistory.current = false;
    });
  }, [canvas, history]);

  const setZoom = useCallback((newZoom: number) => {
    if (!canvas) return;

    const dpr = dprRef.current;
    const scale = (newZoom / 100);

    // Physical buffer dimensions (Retina-sharp)
    canvas.setDimensions({
      width: nativeWidthRef.current * scale * dpr,
      height: nativeHeightRef.current * scale * dpr,
    }, { backstoreOnly: true });

    // Logical CSS dimensions (for layout)
    canvas.setDimensions({
      width: nativeWidthRef.current * scale,
      height: nativeHeightRef.current * scale,
    }, { cssOnly: true });

    // Content zoom: multiply by DPR to fill the high-res buffer
    canvas.setViewportTransform([scale * dpr, 0, 0, scale * dpr, 0, 0] as any);

    setZoomState(newZoom);
    canvas.renderAll();
  }, [canvas]);

  const getPNGDataURL = useCallback((multiplier: number = 3) => {
    if (!canvas) return null;
    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier,
    });
  }, [canvas]);

  const exportToPNG = useCallback((multiplier: number = 3) => {
    const dataUrl = getPNGDataURL(multiplier);
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = 'certificate.png';
    link.href = dataUrl;
    link.click();
  }, [getPNGDataURL]);

  const getPDFBlobURL = useCallback((multiplier: number = 3) => {
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier,
    });

    const width = nativeWidthRef.current;
    const height = nativeHeightRef.current;

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    return pdf.output('bloburl').toString();
  }, [canvas]);

  const getPDFBlob = useCallback((multiplier: number = 3) => {
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier,
    });

    const width = nativeWidthRef.current;
    const height = nativeHeightRef.current;

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    return pdf.output('blob');
  }, [canvas]);

  const exportToPDF = useCallback((multiplier: number = 4) => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier,
    });

    const width = nativeWidthRef.current;
    const height = nativeHeightRef.current;

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    pdf.save('certificate.pdf');
  }, [canvas]);

  const resetViewport = useCallback(() => {
    if (!canvas) return;
    setZoom(100);
  }, [canvas, setZoom]);

  const zoomToFit = useCallback(() => {
    if (!canvas || !canvasRef.current) return;

    // Find the scrollable workspace container
    const workspace = document.getElementById('canvas-workspace');
    if (!workspace) return;

    const padding = 64; // Increased padding for perfect framing
    const availableWidth = workspace.clientWidth - padding;
    const availableHeight = workspace.clientHeight - padding;

    if (availableWidth <= 0 || availableHeight <= 0) return;

    const scaleX = availableWidth / (nativeWidthRef.current || 2000);
    const scaleY = availableHeight / (nativeHeightRef.current || 1500);

    // Scale to fit perfectly. We allow growing past 100% if the workspace is very large, 
    // capped at 200% to avoid extreme pixelation while still maximizing space usage.
    const scale = Math.max(0.1, Math.min(scaleX, scaleY, 2.0));

    setZoom(Math.floor(scale * 100));
  }, [canvas, setZoom]);

  const loadTemplate = useCallback((templateData: any) => {
    if (!canvas) return;

    // Clear existing objects and background DESIGN state
    canvas.clear();
    canvas.backgroundImage = null;
    canvas.backgroundColor = 'transparent';
    canvas.renderAll();

    // Resize canvas if template has custom dimensions
    // Handle both flat structure and Scene Graph structure
    const templateWidth = templateData.width || templateData.root?.width || 2000;
    const templateHeight = templateData.height || templateData.root?.height || 1500;

    nativeWidthRef.current = templateWidth;
    nativeHeightRef.current = templateHeight;

    // Calculate and apply zoom immediately to avoid "native size" flash
    const workspace = document.getElementById('canvas-workspace');
    let initialZoom = 100;
    if (workspace) {
      const padding = 64;
      const scaleX = (workspace.clientWidth - padding) / templateWidth;
      const scaleY = (workspace.clientHeight - padding) / templateHeight;
      const scale = Math.max(0.1, Math.min(scaleX, scaleY, 2.0));
      initialZoom = Math.floor(scale * 100);
    }

    setZoom(initialZoom);

    // Use shared rendering function (interactive mode for editor)
    renderTemplateElements({
      canvas,
      templateData,
      scale: 1, // We render at native scale, zoomToFit will handle display
      interactive: true,
    });

    saveToHistory(canvas);
  }, [canvas, saveToHistory, zoomToFit]);

  const loadFromJSON = useCallback(async (json: any) => {
    if (!canvas) return;

    // Explicitly clear before loading JSON to prevent merge/ghost issues
    canvas.clear();
    canvas.backgroundImage = null;
    canvas.renderAll();

    const toastId = toast.loading("Loading design layout...");
    try {
      const dpr = dprRef.current;
      // Robustly handle stringified JSON
      let data = json;
      if (typeof json === 'string') {
        try {
          data = JSON.parse(json);
        } catch (e) {
          console.error("Failed to parse JSON string in loadFromJSON", e);
        }
      }

      console.log("Loading JSON with keys:", Object.keys(data));

      // Sanitize URLs in the JSON data to handle localhost port mismatches
      data = sanitizeObject(data);

      if (data.backgroundImage) console.log("JSON contains backgroundImage");

      // Resize canvas if JSON contains custom dimensions
      // Proactively look for dimensions in all common JSON locations
      const templateWidth = data.width || data.root?.width || (data.sceneGraph?.root?.width) || 2000;
      const templateHeight = data.height || data.root?.height || (data.sceneGraph?.root?.height) || 1500;

      nativeWidthRef.current = templateWidth;
      nativeHeightRef.current = templateHeight;

      // Calculate and apply zoom immediately to avoid "native size" flash
      const workspace = document.getElementById('canvas-workspace');
      let initialZoom = 100;
      if (workspace) {
        const padding = 64;
        const scaleX = (workspace.clientWidth - padding) / templateWidth;
        const scaleY = (workspace.clientHeight - padding) / templateHeight;
        const scale = Math.max(0.1, Math.min(scaleX, scaleY, 2.0));
        initialZoom = Math.floor(scale * 100);
      }

      setZoom(initialZoom);

      // Step 1: Strictly use data background or transparent
      if (data.backgroundColor) {
        canvas.backgroundColor = data.backgroundColor;
      } else {
        canvas.backgroundColor = 'transparent';
      }

      await canvas.loadFromJSON(data);

      // OPTION 2 ARCHITECTURE: Protect the certificate base
      // 1. Identify all images on the canvas
      const allObjects = canvas.getObjects();
      const images = allObjects.filter((obj: any) => obj.type === 'image');

      if (images.length > 0) {
        // Sort by size (area) - the biggest one is usually the background base
        images.sort((a, b) => (b.width! * b.scaleX!) * (b.height! * b.scaleY!) - (a.width! * a.scaleX!) * (a.height! * a.scaleY!));

        const primaryBg = images[0];

        // 2. Remove ANY image that looks like a full background/certificate
        // This solves the "small certificate behind big one" issue
        images.forEach((img: any) => {
          // If it's a large image (likely a certificate), remove it from interactive objects
          const isLikelyBase = (img.width! * img.scaleX!) > 500 || img.role === 'background' || img.role === 'decoration';
          if (isLikelyBase) {
            canvas.remove(img);
          }
        });

        // 3. Set the best candidate as the official NON-MOVABLE background
        primaryBg.set({
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
          hoverCursor: 'default'
        });

        canvas.backgroundImage = primaryBg;
        console.log("useCanvas: Migrated primary image to Background Architecture and purged ghosts");
      }

      // 4. CRITICAL: Nuke any "Alexander Pierce" ghost text objects
      canvas.getObjects().forEach((obj: any) => {
        if (['text', 'i-text', 'textbox'].includes(obj.type)) {
          const content = obj.text?.toUpperCase() || "";
          if (content.includes("ALEXANDER") || content.includes("PIERCE")) {
            console.warn("useCanvas: Nuking named ghost object", content);
            canvas.remove(obj);
          }
        }
      });

      console.log('Canvas interactive objects count:', canvas.getObjects().length);

      // Force immediate render
      canvas.requestRenderAll();

      // UNLOCK ALL ELEMENTS:
      // Restored full freedom so users can move, scale, and rotate any field.
      canvas.getObjects().forEach((obj: any) => {
        const isText = ['text', 'i-text', 'textbox'].includes(obj.type);

        obj.set({
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          hasControls: true,
          selectable: true,
          evented: true,
          hoverCursor: isText ? 'text' : 'move',
          editable: isText
        });
      });

      canvas.requestRenderAll();

      // Design is ready
      toast.dismiss(toastId);
      toast.success("Design loaded");

      console.log('Canvas loaded from JSON successfully');
    } catch (error) {
      console.error('Error loading canvas from JSON', error);
      toast.dismiss(toastId);
      toast.error("Failed to load design");
    }
  }, [canvas, saveToHistory, zoomToFit]);


  const groupSelected = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();

    // Type validation - only ActiveSelection can be grouped (case-insensitive check)
    if (!activeObject || activeObject.type?.toLowerCase() !== 'activeselection') {
      toast.error('Please select multiple objects to group');
      return;
    }

    const selection = activeObject as ActiveSelection;
    const objects = selection.getObjects();

    // Validate we have objects to group
    if (!objects || objects.length < 2) {
      toast.error('Select at least 2 objects to group');
      return;
    }

    try {
      // Store IDs before grouping to preserve them
      objects.forEach((obj: any) => {
        if (!obj.id && !obj._id) {
          obj._id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
      });

      // Capture the visual bounds of the selection BEFORE grouping
      // This preserves the exact visual position users see
      const selectionLeft = selection.left;
      const selectionTop = selection.top;

      // Discard active selection
      canvas.discardActiveObject();

      // Remove objects from canvas
      objects.forEach((obj: any) => canvas.remove(obj));

      // Create group with preserved properties
      const group = new Group(objects, {
        canvas: canvas,
        interactive: true,
        subTargetCheck: false,
      });

      // Set group properties AND restore visual position
      group.set({
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Group',
        left: selectionLeft,
        top: selectionTop,
        selectable: true,
        hasControls: true,
        evented: true,
      });

      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
      setSelectedObject(group);
      saveToHistory(canvas);
      toast.success('Objects grouped successfully');
    } catch (err) {
      console.error('Grouping failed:', err);
      toast.error('Failed to group objects');
    }
  }, [canvas, saveToHistory]);

  const ungroupSelected = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();

    // Validate it's a group
    if (!activeObject || activeObject.type !== 'group') {
      toast.error('Please select a group to ungroup');
      return;
    }

    try {
      const group = activeObject as Group;
      const objects = group.getObjects().slice(); // Clone array

      if (!objects || objects.length === 0) {
        toast.error('Group is empty');
        return;
      }

      // Calculate absolute transform for each object using Fabric's transformation matrix
      const snapshots = objects.map((obj: any) => {
        // Use Fabric's calcTransformMatrix to get the absolute transformation
        // This automatically handles the group's centered origin and all transformations
        const matrix = obj.calcTransformMatrix();
        const options = util.qrDecompose(matrix);

        return {
          obj,
          left: options.translateX,
          top: options.translateY,
          scaleX: options.scaleX,
          scaleY: options.scaleY,
          angle: options.angle,
          skewX: options.skewX || 0,
          skewY: options.skewY || 0,
          // Preserve visual properties
          strokeWidth: obj.strokeWidth,
          stroke: obj.stroke,
          fill: obj.fill,
          opacity: obj.opacity,
        };
      });

      // Remove group from canvas
      canvas.discardActiveObject();
      canvas.remove(group);

      // Remove all objects from group first
      group.removeAll();

      // Add objects back to canvas with absolute transforms
      snapshots.forEach(({ obj, left, top, scaleX, scaleY, angle, skewX, skewY, strokeWidth, stroke, fill, opacity }) => {
        // Clean up group references
        delete obj.group;
        delete obj.parent;

        // Apply transformations (except position)
        obj.set({
          scaleX,
          scaleY,
          angle,
          skewX,
          skewY,
          strokeWidth,
          stroke,
          fill,
          opacity,
          selectable: true,
          hasControls: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          active: false,
        });
        // Use setPositionByOrigin to correctly place the object using center coordinates
        // qrDecompose returns translateX/Y which represent the CENTER of the object
        obj.setPositionByOrigin(
          new Point(left, top),
          'center',
          'center'
        );

        obj.setCoords();
        canvas.add(obj);
      });

      canvas.requestRenderAll();
      saveToHistory(canvas);
      toast.success('Group ungrouped successfully');
    } catch (err) {
      console.error('Ungrouping failed:', err);
      toast.error('Failed to ungroup');
    }
  }, [canvas, saveToHistory]);

  const toggleLock = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    // Check if currently locked (checking movementX is sufficient)
    const isLocked = activeObject.lockMovementX;
    const newState = !isLocked;

    activeObject.set({
      lockMovementX: newState,
      lockMovementY: newState,
      lockRotation: newState,
      lockScalingX: newState,
      lockScalingY: newState,
      hasControls: !newState, // Hide resize handles when locked
      borderColor: newState ? '#ef4444' : '#3b82f6', // Red border for locked
    });

    canvas.requestRenderAll();
    saveToHistory(canvas);

    // Force UI update by creating a new reference or spreading
    // Note: selectedObject state update triggers re-render of properties panel
    setSelectedObject(activeObject);
    // We also need to trigger the parent update if needed, but usually reference overlap handles it
    // or we can pass a refresh timestamp. For now, this should work.

    // Manually fire selection:updated for consistency
    canvas.fire('selection:updated', {
      selected: [activeObject],
      deselected: [] // Required by Fabric v6 types
    });
  }, [canvas, saveToHistory]);

  const toggleSafeZone = useCallback(() => {
    if (!canvas) return;

    const newState = !showSafeZone;
    setShowSafeZone(newState);

    // Look for existing safe zone
    const objects = canvas.getObjects();
    const existingSafeZone = objects.find((obj: any) => obj.role === 'safezone');

    if (existingSafeZone) {
      existingSafeZone.set('visible', newState);
      canvas.requestRenderAll();
    } else if (newState) {
      // Create new safe zone (e.g. 10% margin)
      const width = canvas.getWidth();
      const height = canvas.getHeight();
      const margin = Math.min(width, height) * 0.05;

      const safeZone = new Rect({
        left: margin,
        top: margin,
        width: width - (margin * 2),
        height: height - (margin * 2),
        fill: 'transparent',
        stroke: '#3b82f6',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        role: 'safezone',
        opacity: 0.5,
      });

      canvas.add(safeZone);
      canvas.bringObjectToFront(safeZone);
      canvas.requestRenderAll();
    }
  }, [canvas, showSafeZone]);

  // Alignment Guides Implementation
  useEffect(() => {
    if (!canvas) return;

    const guidingLines: Line[] = [];

    const clearGuides = () => {
      guidingLines.forEach(line => canvas.remove(line));
      guidingLines.length = 0;
    };

    const showGuide = (x1: number, y1: number, x2: number, y2: number) => {
      const line = new Line([x1, y1, x2, y2], {
        stroke: '#10b981',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        opacity: 0.6,
      });
      canvas.add(line);
      guidingLines.push(line);
    };

    const handleObjectMoving = (e: any) => {
      const obj = e.target;
      if (!obj) return;

      clearGuides();

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const objCenter = obj.getCenterPoint();

      // vertical center guide
      if (Math.abs(objCenter.x - canvasWidth / 2) < 5) {
        obj.set('left', canvasWidth / 2 - (obj.width * obj.scaleX) / 2);
        showGuide(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
      }

      // horizontal center guide
      if (Math.abs(objCenter.y - canvasHeight / 2) < 5) {
        obj.set('top', canvasHeight / 2 - (obj.height * obj.scaleY) / 2);
        showGuide(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
      }
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('mouse:up', clearGuides);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('mouse:up', clearGuides);
    };
  }, [canvas]);

  return {
    canvasRef,
    canvas,
    selectedObject,
    addText,
    addShape,
    addImage,
    deleteSelected,
    bringForward,
    sendBackward,
    setBackgroundColor,
    undo,
    redo,
    canUndo: historyIndexState > 0,
    canRedo: historyIndexState < history.length - 1,
    zoom,
    setZoom,
    resetViewport,
    getPNGDataURL,
    getPDFBlob,
    getPDFBlobURL,
    exportToPNG,
    exportToPDF,
    loadTemplate,
    loadFromJSON,
    groupSelected,
    ungroupSelected,
    toggleLock,
    saveToHistory,
    toggleSafeZone,
    showSafeZone,
    zoomToFit,
  };
};
