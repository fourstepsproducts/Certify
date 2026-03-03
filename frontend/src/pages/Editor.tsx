import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useCanvas } from '@/hooks/useCanvas';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { CanvasWorkspace } from '@/components/editor/CanvasWorkspace';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { certificateTemplates } from '@/data/templatesSceneGraph';
import { borderPresets } from '@/data/borderPresets';
import { stylePresets } from '@/data/stylePresets';
import { Rect, Textbox } from 'fabric';
import { toast } from 'sonner';
import { Award, Loader2, Flame } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CanvasContext } from '@/context/CanvasContext';
import { applyOverridesToSceneGraph } from '@/utils/templateOverrides';

const Editor = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTemplateId = searchParams.get('template') || searchParams.get('userTemplate');
  const location = useLocation();
  const returnTo = searchParams.get('returnTo');
  const [title, setTitle] = useState('');
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [bulkColumns, setBulkColumns] = useState<string[]>([]);
  const [bulkFileName, setBulkFileName] = useState('');
  const [columnsMetadata, setColumnsMetadata] = useState<Record<string, any>>({});
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [isModuleMode, setIsModuleMode] = useState(false);
  const [loadingModuleData, setLoadingModuleData] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('editorPanelWidth');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Resize handlers
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      // 72px is the fixed icon bar width
      const newWidth = e.clientX - 72;
      if (newWidth > 200 && newWidth < 600) {
        setPanelWidth(newWidth);
        localStorage.setItem('editorPanelWidth', newWidth.toString());
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'default';
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'default';
    };
  }, [isResizing, resize, stopResizing]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [textElements, setTextElements] = useState<Array<{ id: string; text: string }>>([]);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [layers, setLayers] = useState<any[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewRecordIndex, setPreviewRecordIndex] = useState(-1);




  const canvasHook = useCanvas();
  const {
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
    canUndo,
    canRedo,
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
    saveToHistory,
    groupSelected,
    ungroupSelected,
    toggleLock,
    toggleSafeZone,
    showSafeZone,
    zoomToFit,
  } = canvasHook;

  const [directoryHandle, setDirectoryHandle] = useState<any>(null);

  const handlePickDirectory = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        toast.error('Browser Not Supported', {
          description: 'Your browser does not support the Folder Picker API. Try Chrome or Edge.'
        });
        return;
      }
      const handle = await (window as any).showDirectoryPicker();
      setDirectoryHandle(handle);
      toast.success(`Export folder selected: ${handle.name}`);
    } catch (err) {
      console.error('Directory selection failed:', err);
    }
  };

  // Sync layers list
  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      const allObjects = canvas.getObjects();
      // Reverse to show top layers at top of list
      const reversed = [...allObjects].reverse().map((obj: any) => ({
        id: obj.id || obj._id || `obj_${Math.random().toString(36).substr(2, 9)}`,
        type: obj.type,
        name: (obj as any).name || (obj.type === 'textbox' || obj.type === 'i-text' ? (obj as any).text : obj.type),
        object: obj,
      }));
      setLayers(reversed);
    };

    updateLayers();
    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  const currentTemplateIdRef = useRef<string | null>(null);
  const loadedUserTemplateIdRef = useRef<string | null>(null);

  // Load template from URL params
  // Load template from URL params OR restore from temporary state
  // Load template from URL params OR restore from temporary state
  useEffect(() => {
    // 1. Check for User Template (My Templates)
    const userTemplateId = searchParams.get('userTemplate');
    const regularTemplateId = searchParams.get('template');

    // Debug logs to help diagnose issues
    if (userTemplateId) {
      // Logic for user template loading
    }

    // Only load if we haven't loaded this exact template yet
    if (userTemplateId && canvas && user?.token && loadedUserTemplateIdRef.current !== userTemplateId) {
      // Mark as loading to prevent duplicate loads
      loadedUserTemplateIdRef.current = userTemplateId;
      // Clear regular template ref
      currentTemplateIdRef.current = null;

      const loadUserTemplate = async () => {
        toast.info("Loading design...");
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates/${userTemplateId}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });

          if (res.ok) {
            const data = await res.json();

            if (data && data.canvasData) {
              await loadFromJSON(data.canvasData);
              canvas.requestRenderAll();
              canvasHook.zoomToFit();
              setTitle(data.name);
              toast.success('Design loaded successfully');
            } else {
              console.error('Template data is empty or missing canvasData');
              toast.error('Template data is empty');
              loadedUserTemplateIdRef.current = null;
            }
          } else {
            console.error('Template fetch failed:', res.status);
            toast.error(`Error loading template (${userTemplateId}): ${res.status}`);
            loadedUserTemplateIdRef.current = null;
          }
        } catch (err) {
          console.error('Template load exception:', err);
          toast.error('Failed to load design');
          loadedUserTemplateIdRef.current = null;
        }
      };

      loadUserTemplate();
      return;
    }

    // Reset user template ref if we're not on a user template page
    if (!userTemplateId) {
      loadedUserTemplateIdRef.current = null;
    }

    // Check for temporary state first (auth redirect flow)
    const tempState = localStorage.getItem('temp_canvas_state');
    const tempTitle = localStorage.getItem('temp_canvas_title');
    const tempBulkData = localStorage.getItem('temp_bulk_data');
    const tempFieldMappings = localStorage.getItem('temp_field_mappings');

    if (tempState && canvas) {
      // Restore from temp state
      try {
        const parsedState = JSON.parse(tempState);
        loadFromJSON(parsedState);
        if (tempTitle) setTitle(tempTitle);

        if (tempBulkData) {
          const data = JSON.parse(tempBulkData);
          setBulkData(data);
          if (data.length > 0) {
            setBulkColumns(Object.keys(data[0]));
            setBulkFileName('Restored Data');
          }
        }

        if (tempFieldMappings) {
          setFieldMappings(JSON.parse(tempFieldMappings));
        }

        toast.success('Restored your previous session');

        // Clear temp storage
        localStorage.removeItem('temp_canvas_state');
        localStorage.removeItem('temp_canvas_title');
        localStorage.removeItem('temp_bulk_data');
        localStorage.removeItem('temp_field_mappings');

        return; // Skip loading from URL if we restored state
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }

    // Fallback to URL template loading
    const templateId = searchParams.get('template');
    if (templateId && canvas && currentTemplateIdRef.current !== templateId) {
      const template = certificateTemplates.find(t => t.id === templateId);
      if (template) {
        // Prevent immediate re-triggering
        currentTemplateIdRef.current = templateId;
        // Reset user template ref since we're loading a default template
        loadedUserTemplateIdRef.current = null;
        setShowTemplateSelector(false);

        const loadWithOverrides = async () => {
          let graphToLoad = template.sceneGraph;

          if (user?.token) {
            try {
              const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates/layout-overrides`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
              });
              if (res.ok) {
                const overrides = await res.json();
                graphToLoad = applyOverridesToSceneGraph(template.sceneGraph, overrides, template.id);
                console.log('Applied layout overrides for template', template.id);
              }
            } catch (err) {
              console.error('Failed to load overrides', err);
            }
          }

          // Pass Scene Graph directly to preserve grouping structure
          loadTemplate(graphToLoad);
          setTitle(template.name);
          toast.success(`Loaded ${template.name} template`);
        };

        loadWithOverrides();
      } else {
        // Dynamic Template Loading (System or User)
        const fetchDynamicTemplate = async () => {
          try {
            let res;
            // Try fetching as private template first if logged in
            if (user?.token) {
              try {
                const privateRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates/${templateId}`, {
                  headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (privateRes.ok) res = privateRes;
              } catch (e) { /* ignore */ }
            }

            // If not found or not logged in, try public endpoint
            if (!res || !res.ok) {
              try {
                const publicRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates/public/${templateId}`);
                if (publicRes.ok) res = publicRes;
              } catch (e) { /* ignore */ }
            }

            if (res && res.ok) {
              const data = await res.json();
              currentTemplateIdRef.current = templateId;
              setShowTemplateSelector(false);
              setTitle(data.name);

              if (data.sceneGraph && data.sceneGraph.root) {
                // TRUE System Scene Graph
                setTimeout(() => {
                  loadTemplate(data.sceneGraph);
                  toast.success(`Loaded ${data.name}`);
                }, 100);
              } else {
                // Flat JSON (Admin Upload or Legacy)
                // Admin uploads might be in .sceneGraph OR .canvasData
                const jsonData = data.canvasData || data.sceneGraph;

                if (jsonData) {
                  loadFromJSON(jsonData);
                  toast.success(`Loaded ${data.name}`);
                }
              }
            } else {
              toast.error("Template not found");
            }
          } catch (err) {
            console.error("Failed to load dynamic template", err);
            toast.error("Failed to load template");
          }
        };
        fetchDynamicTemplate();
      }
    } else if (!templateId && !userTemplateId && !tempState && canvas && !currentTemplateIdRef.current) {
      // No template, no user template, no temp state - start with blank canvas
      // setShowTemplateSelector(true); // Disabled: Users can start with blank canvas
    }
  }, [searchParams, canvas, loadTemplate, loadFromJSON, user?.token]);

  // Load field mappings from localStorage on mount
  useEffect(() => {
    const savedMappings = localStorage.getItem('certificateFieldMappings');
    if (savedMappings) {
      try {
        setFieldMappings(JSON.parse(savedMappings));
      } catch (error) {
        console.error('Error loading saved mappings:', error);
      }
    }
  }, []);

  // Clear mappings when template changes
  useEffect(() => {
    const templateId = searchParams.get('template');
    const savedTemplateId = localStorage.getItem('currentTemplateId');

    if (templateId && templateId !== savedTemplateId) {
      // Different template loaded - clear old mappings
      setFieldMappings({});
      localStorage.removeItem('certificateFieldMappings');
      localStorage.setItem('currentTemplateId', templateId);
    }
  }, [searchParams]);

  // Save field mappings to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(fieldMappings).length > 0) {
      localStorage.setItem('certificateFieldMappings', JSON.stringify(fieldMappings));
    }
  }, [fieldMappings]);

  // Extract text elements from canvas
  useEffect(() => {
    if (!canvas) return;

    const updateTextElements = () => {
      const objects = canvas.getObjects();
      let textIndex = 0;

      const texts = objects
        .filter((obj: any) => obj.type === 'textbox' || obj.type === 'i-text')
        .map((obj: any) => {
          // Generate stable ID based on position and index (NOT text content!)
          // This way the ID won't change when we edit the text
          const posX = Math.round(obj.left || 0);
          const posY = Math.round(obj.top || 0);
          const stableId = `text_${posX}_${posY}_${textIndex}`;
          textIndex++;

          // Assign stable ID to object if it doesn't have one
          if (!obj._id) {
            obj._id = stableId;
          }

          return {
            id: obj._id,
            text: obj.text || 'Untitled Text',
          };
        });

      setTextElements(texts);
    };

    // Update initially
    updateTextElements();

    // Update when objects are added/removed (DON'T update on modification!)
    canvas.on('object:added', updateTextElements);
    canvas.on('object:removed', updateTextElements);

    return () => {
      canvas.off('object:added', updateTextElements);
      canvas.off('object:removed', updateTextElements);
    };
  }, [canvas]);

  // Clean up stale mappings - remove mappings for text elements that don't exist anymore
  useEffect(() => {
    if (textElements.length === 0) return;

    const currentTextIds = new Set(textElements.map(el => el.id));
    const staleMappings = Object.keys(fieldMappings).filter(id => !currentTextIds.has(id));

    if (staleMappings.length > 0) {
      setFieldMappings(prev => {
        const updated = { ...prev };
        staleMappings.forEach(id => delete updated[id]);
        return updated;
      });

      // Update localStorage
      if (Object.keys(fieldMappings).length - staleMappings.length > 0) {
        const updated = { ...fieldMappings };
        staleMappings.forEach(id => delete updated[id]);
        localStorage.setItem('certificateFieldMappings', JSON.stringify(updated));
      } else {
        localStorage.removeItem('certificateFieldMappings');
      }
    }
  }, [textElements, fieldMappings]);

  // Handle bulk data upload
  const handleBulkDataUpload = (data: any[], columns: string[]) => {
    if (data.length === 0) {
      // Clear bulk data and mappings
      setBulkData([]);
      setBulkColumns([]);
      setBulkFileName('');
      setFieldMappings({});
      // Clear from localStorage
      localStorage.removeItem('certificateFieldMappings');
      toast.info('Bulk data cleared');
    } else {
      setBulkData(data);
      setBulkColumns(columns);
      // Extract filename from the first upload
      setBulkFileName('data.xlsx');
      toast.success(`Loaded ${data.length} records with ${columns.length} columns`);
    }
  };

  // Handle field mapping
  const handleFieldMapping = (objectId: string, column: string) => {
    setFieldMappings(prev => {
      if (column === '') {
        const { [objectId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [objectId]: column };
    });
    toast.success(`Mapped to column: ${column}`);
  };

  // Handle manual value changes
  const handleManualValueChange = (objectId: string, value: string) => {
    setManualValues(prev => {
      if (value === '') {
        const { [objectId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [objectId]: value };
    });
  };

  // Auto-load bulk data from navigation state (for module certificate generation)
  useEffect(() => {
    const state = location.state as any;
    if (state?.autoLoadBulk && state?.bulkData && state?.bulkColumns) {
      setBulkData(state.bulkData);
      setBulkColumns(state.bulkColumns);
      setBulkFileName(state.moduleName ? `${state.moduleName} - Eligible Students` : 'Eligible Students');
      if (state?.columnsMetadata) {
        setColumnsMetadata(state.columnsMetadata);
      }
      toast.success(`Loaded ${state.bulkData.length} eligible students for certificate generation`);

      // Clear the state to prevent re-loading on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-load bulk data from query parameters (for module-driven mode)
  useEffect(() => {
    const mode = searchParams.get('mode');
    const moduleId = searchParams.get('moduleId');

    if (mode === 'module' && moduleId) {
      setIsModuleMode(true);

      const fetchModuleEligibleData = async () => {
        setLoadingModuleData(true);
        try {
          const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/certificates/eligible/${moduleId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error('Failed to fetch eligible students');

          const eligibleData = await response.json();

          if (eligibleData.count > 0) {
            setBulkData(eligibleData.data);
            setBulkColumns(eligibleData.columns);
            setBulkFileName(`Module ${moduleId} - Eligible Students`);
            if (eligibleData.columnsMetadata) {
              setColumnsMetadata(eligibleData.columnsMetadata);
            }
            toast.success(`Loaded ${eligibleData.count} eligible students for certificate generation`);
          } else {
            toast.info('No eligible students found for this module');
          }
        } catch (error) {
          console.error('Error fetching module eligible data:', error);
          toast.error('Failed to load eligible students data');
        } finally {
          setLoadingModuleData(false);
        }
      };

      fetchModuleEligibleData();
    } else {
      setIsModuleMode(false);
    }
  }, [searchParams, user?.token]);

  // Handle URL data injection (for certificate generation)
  useEffect(() => {
    if (!canvas) return;

    let appliedCount = 0;
    searchParams.forEach((value, key) => {
      if (key.startsWith('data_')) {
        const objectId = key.replace('data_', '');

        // Find and update object
        const findAndSet = (objs: any[]) => {
          objs.forEach(obj => {
            // Handle both _id (fabric default sometimes) and id (custom)
            const currentId = obj.id || obj._id;
            if (currentId === objectId) {
              obj.set('text', value);
              appliedCount++;
            }
            if (obj.type === 'group' && obj.getObjects) {
              findAndSet(obj.getObjects());
            }
          });
        };

        findAndSet(canvas.getObjects());
      }
    });

    if (appliedCount > 0) {
      canvas.requestRenderAll();
      toast.success(`Personalized certificate loaded`);
    }

  }, [canvas, searchParams, layers]); // Depend on layers to retry if objects load late

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            // Copy handled by fabric.js
            break;
          case 'v':
            // Paste handled by fabric.js
            break;
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
          deleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected]);

  // Pre-flight check for download permission
  const authorizeDownload = async (format: 'PNG' | 'PDF', count: number = 1): Promise<boolean> => {
    if (!user?.token) return true; // Allow guest/dev mode if needed, or force auth

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ templateName: title, format, count })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          toast.error('Limit Reached', {
            description: data.message || `You have reached your limit. ${data.remaining || 0} remaining.`
          });
          return false;
        }
        throw new Error(data.message || 'Server error');
      }

      console.log(`Download authorized for ${count} copies`);
      return true;
    } catch (err) {
      console.error('Download authorization failed:', err);
      toast.error('Could not verify download permission');
      return false;
    }
  };

  const handleExportPNG = async (multiplier: number = 2) => {
    setIsExportingPNG(true);
    try {
      // 1. Authorize first
      const authorized = await authorizeDownload('PNG');
      if (!authorized) return;

      // 2. Export if authorized
      await new Promise(resolve => setTimeout(resolve, 500));
      exportToPNG(multiplier);

      toast.success('Certificate exported as PNG');
    } finally {
      setIsExportingPNG(false);
    }
  };

  const handleExportPDF = async (multiplier: number = 2) => {
    setIsExportingPDF(true);
    try {
      // 1. Authorize first
      const authorized = await authorizeDownload('PDF');
      if (!authorized) return;

      // 2. Export if authorized
      await new Promise(resolve => setTimeout(resolve, 500));
      exportToPDF(multiplier);

      toast.success('Certificate exported as PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleBulkExport = async (count: number, format: 'PNG' | 'PDF', multiplier: number = 2) => {
    if (count <= 0) return;

    const isPNG = format === 'PNG';
    if (isPNG) setIsExportingPNG(true);
    else setIsExportingPDF(true);

    try {
      // 1. Authorize total count FIRST
      const authorized = await authorizeDownload(format, count);
      if (!authorized) return;

      toast.info(`Preparing ${count} downloads...`);

      // 2. Loop and download
      for (let i = 0; i < count; i++) {
        const fileName = `certificate_${i + 1}.${format.toLowerCase()}`;

        // Use directory handle if available (Chrome/Edge only)
        if (directoryHandle) {
          try {
            const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();

            if (format === 'PNG') {
              const dataUrl = getPNGDataURL(multiplier);
              if (dataUrl) {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                await writable.write(blob);
              }
            } else {
              const blob = getPDFBlob(multiplier);
              if (blob) await writable.write(blob);
            }

            await writable.close();
          } catch (err) {
            console.error('Direct write failed, falling back to browser download:', err);
            // Fallback for single file error
            if (format === 'PNG') exportToPNG(multiplier);
            else exportToPDF(multiplier);
          }
        } else {
          // Fallback to standard staggered browser download
          await new Promise(resolve => setTimeout(resolve, 800));
          if (format === 'PNG') exportToPNG(multiplier);
          else exportToPDF(multiplier);
        }
      }

      toast.success(directoryHandle ? `Saved ${count} files to ${directoryHandle.name}` : `Started downloading ${count} copies`);
    } finally {
      if (isPNG) setIsExportingPNG(false);
      else setIsExportingPDF(false);
    }
  };

  const handleApplyFontPairing = useCallback((fonts: { title: string; recipient: string; body: string }) => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    let appliedCount = 0;

    objects.forEach((obj: any) => {
      // Apply the main font (title font) to ALL text elements per user feedback
      if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
        obj.set('fontFamily', fonts.title);
        appliedCount++;
      }
    });

    if (appliedCount > 0) {
      canvas.requestRenderAll();
      saveToHistory(canvas);
      toast.success(`Applied ${fonts.title} font to all elements`);
    } else {
      toast.info("No text elements found on canvas");
    }
  }, [canvas, saveToHistory]);

  const handleApplyBorder = useCallback((preset: any) => {
    if (!canvas) return;

    // Look for existing border element
    const objects = canvas.getObjects();
    const existingBorder = objects.find((obj: any) => obj.role === 'border' || obj.name === 'Border');

    if (existingBorder) {
      existingBorder.set({
        stroke: preset.stroke,
        strokeWidth: preset.strokeWidth,
        rx: preset.cornerRadius || 0,
        ry: preset.cornerRadius || 0,
        strokeDashArray: preset.dashArray,
      });

      // Recalculate dimensions based on padding
      const width = canvas.getWidth();
      const height = canvas.getHeight();
      const padding = preset.padding;

      existingBorder.set({
        left: padding,
        top: padding,
        width: width - (padding * 2),
        height: height - (padding * 2),
      });

      canvas.requestRenderAll();
      saveToHistory(canvas);
      toast.success(`Updated ${preset.name} border`);
    } else {
      // Create new border
      const width = canvas.getWidth();
      const height = canvas.getHeight();
      const padding = preset.padding;

      const border = new Rect({
        left: padding,
        top: padding,
        width: width - (padding * 2),
        height: height - (padding * 2),
        fill: 'transparent',
        stroke: preset.stroke,
        strokeWidth: preset.strokeWidth,
        rx: preset.cornerRadius || 0,
        ry: preset.cornerRadius || 0,
        strokeDashArray: preset.dashArray,
        selectable: true,
        hasControls: true,
        role: 'border',
        name: 'Border',
      });

      canvas.add(border);
      canvas.sendObjectToBack(border);
      canvas.requestRenderAll();
      saveToHistory(canvas);
      toast.success(`Applied ${preset.name} border`);
    }
  }, [canvas, saveToHistory]);

  const handleApplyStyle = useCallback((preset: any) => {
    if (!canvas) return;

    // Apply background color to canvas
    canvas.set({ backgroundColor: preset.colors.background });

    const applyToObjects = (objs: any[]) => {
      objs.forEach((obj: any) => {
        // Handle Groups recursively
        if (obj.type === 'group' && obj.getObjects) {
          applyToObjects(obj.getObjects());
        }

        // 1. Text elements based on role
        if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
          const role = obj.role;
          if (role === 'title') {
            obj.set('fill', preset.colors.title);
          } else if (role === 'recipient') {
            obj.set('fill', preset.colors.recipient);
          } else if (['description', 'date', 'issuer', 'signature', 'body'].includes(role) || !role) {
            obj.set('fill', preset.colors.body);
          }
        }

        // 2. Borders and Frames
        if (obj.role === 'border' || obj.name?.includes('Border') || obj.name?.includes('Frame')) {
          if (obj.stroke && obj.stroke !== 'transparent') {
            obj.set('stroke', preset.colors.primary);
          }
          // If the border is a filled shape (like a decorative frame element)
          if (obj.fill && obj.fill !== 'transparent' && obj.fill !== 'rgba(0,0,0,0)') {
            obj.set('fill', preset.colors.primary);
          }
        }

        // 3. Generic shapes and decorative paths
        if (['rect', 'circle', 'triangle', 'polygon', 'path'].includes(obj.type)) {
          if (!obj.role) { // Only if it's not a special role object
            // If it has a stroke, apply primary color
            if (obj.stroke && obj.stroke !== 'transparent' && obj.stroke !== 'rgba(0,0,0,0)') {
              obj.set('stroke', preset.colors.primary);
            }
            // If it has a fill, apply secondary color
            if (obj.fill && obj.fill !== 'transparent' && obj.fill !== 'rgba(0,0,0,0)') {
              obj.set('fill', preset.colors.secondary);
            }
          }
        }
      });
    };

    applyToObjects(canvas.getObjects());

    canvas.requestRenderAll();
    saveToHistory(canvas);
    toast.success(`Applied ${preset.name} style theme`);
  }, [canvas, saveToHistory]);

  useEffect(() => {
    // We are initialized when auth is finished AND we have a canvas object ready
    if (!authLoading && canvas && !isInitialized) {
      // Small timeout to ensure initial canvas sizing and layout is settled without making the user wait 2 seconds
      const timer = setTimeout(() => setIsInitialized(true), 150);
      return () => clearTimeout(timer);
    }
  }, [authLoading, canvas, isInitialized]);

  return (
    <CanvasContext.Provider value={canvasHook}>
      <div className="h-screen flex flex-col bg-[#0b0f1a] overflow-hidden relative">
        {/* Subtle static fog for depth */}
        <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,124,255,0.05)_0%,transparent_70%)]" />
        </div>

        {/* Professional Splash Screen Overlay */}
        {(authLoading || !isInitialized) && (
          <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-black gap-6 animate-in fade-in duration-500">
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <Flame className="h-16 w-16 text-[#38BDF8] animate-pulse drop-shadow-[0_0_20px_rgba(56,189,248,0.7)]" />
                <div className="absolute inset-0 rounded-full animate-spin border-y-[3px] border-[#38BDF8] border-x-transparent opacity-70 w-24 h-24 -m-4" style={{ animationDuration: '1.5s' }} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 mt-4 relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white">Certify<span className="text-[#38BDF8]">Pro</span> <span className="text-lg">Editor</span></h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                <p className="text-[#94A3B8] text-xs font-medium uppercase tracking-widest leading-none">Initializing your creative workspace...</p>
              </div>
            </div>
          </div>
        )}

        <EditorHeader
          title={title}
          onTitleChange={setTitle}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onExportPNG={handleExportPNG}
          onExportPDF={handleExportPDF}
          isExportingPNG={isExportingPNG}
          isExportingPDF={isExportingPDF}
          onBulkExport={handleBulkExport}
          onPickDirectory={handlePickDirectory}
          directoryName={directoryHandle?.name}
          isBulkMode={bulkData.length > 0}
          bulkRecordCount={bulkData.length}
          fieldMappings={fieldMappings}
          canvas={canvas}
          bulkData={bulkData}
          manualValues={manualValues}
          onToggleSafeZone={toggleSafeZone}
          showSafeZone={showSafeZone}
          moduleId={searchParams.get('moduleId')}
          activeTemplateId={activeTemplateId}
        />

        <div className="flex-1 flex overflow-hidden">
          <EditorSidebar
            onAddText={addText}
            onAddShape={addShape}
            onAddImage={addImage}
            onSetBackground={setBackgroundColor}
            onLoadTemplate={loadTemplate}
            activeTemplateId={activeTemplateId}
            onSelectTemplate={(id) => {
              // Update URL so activeTemplateId is maintained
              setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('template', id);
                return newParams;
              }, { replace: true });

              // Also update ref to prevent auto-reloading loop since it's already loaded by Sidebar
              currentTemplateIdRef.current = id;
            }}
            onLoadFromJSON={loadFromJSON}
            onBulkDataUpload={handleBulkDataUpload}
            bulkFileName={bulkFileName}
            bulkRecordCount={bulkData.length}
            bulkColumns={bulkColumns}
            textElements={textElements}
            fieldMappings={fieldMappings}
            onFieldMapping={handleFieldMapping}
            onApplyFontPairing={handleApplyFontPairing}
            onApplyBorder={handleApplyBorder}
            onApplyStyle={handleApplyStyle}
            bulkData={bulkData}
            columnsMetadata={columnsMetadata}
            manualValues={manualValues}
            onManualValueChange={handleManualValueChange}
            isModuleMode={isModuleMode}
            loadingModuleData={loadingModuleData}
            previewRecordIndex={previewRecordIndex}
            panelWidth={panelWidth}
            onPreviewRecordChange={(index) => {
              setPreviewRecordIndex(index);
              if (index >= 0 && index < bulkData.length) {
                const record = bulkData[index];
                const objects = canvas?.getObjects() || [];
                objects.forEach((obj: any) => {
                  if (obj.role && fieldMappings[obj.role]) {
                    const columnName = fieldMappings[obj.role];
                    if (record[columnName]) {
                      obj.set('text', String(record[columnName]));
                    }
                  }
                });
                canvas?.requestRenderAll();
              }
            }}
          />

          {/* Resize Handle */}
          <div
            className={`w-1.5 h-full cursor-col-resize z-50 transition-colors duration-200 hover:bg-primary/40 active:bg-primary ${isResizing ? 'bg-primary' : 'bg-transparent'
              }`}
            onMouseDown={startResizing}
          >
            <div className="h-full w-[1px] bg-border mx-auto" />
          </div>

          <CanvasWorkspace
            canvasRef={canvasRef}
            zoom={zoom}
            onZoomChange={setZoom}
            onResetViewport={resetViewport}
            onZoomToFit={zoomToFit}
            hasSelection={!!selectedObject}
          />

          <PropertiesPanel
            selectedObject={selectedObject}
            onDelete={deleteSelected}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onGroup={groupSelected}
            onUngroup={ungroupSelected}
            onToggleLock={toggleLock}
            layers={layers}
            onSelectLayer={(obj: any) => {
              if (canvas) {
                canvas.setActiveObject(obj);
                canvas.requestRenderAll();
              }
            }}
            bulkColumns={bulkColumns}
            onFieldMapping={handleFieldMapping}
            fieldMappings={fieldMappings}
          />
        </div>

        {showTemplateSelector && (
          <TemplateSelector
            onSelect={(id) => {
              const params = new URLSearchParams(window.location.search);
              params.set('template', id);
              window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
              setShowTemplateSelector(false);
            }}
            onClose={canvas?.getObjects().length ? () => setShowTemplateSelector(false) : undefined}
          />
        )}
      </div>
    </CanvasContext.Provider>
  );
};

export default Editor;
