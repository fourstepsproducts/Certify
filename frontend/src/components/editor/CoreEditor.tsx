import { useState, useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { CanvasWorkspace } from '@/components/editor/CanvasWorkspace';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { certificateTemplates } from '@/data/templatesSceneGraph';
import { Rect } from 'fabric';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { CanvasContext } from '@/context/CanvasContext';

interface CoreEditorProps {
    initialTemplateId?: string | null;
    userTemplateId?: string | null;
    returnTo?: string | null;
    onClose?: () => void;
    onSave?: (canvasData: any, thumbnail: string) => Promise<void>;
    renderHeader?: boolean;
    mappingFields?: string[]; // New prop for available fields
    simplified?: boolean;
}

export const CoreEditor = ({
    initialTemplateId,
    userTemplateId,
    returnTo,
    onClose,
    onSave,
    renderHeader = true,
    mappingFields = [],
    simplified = false
}: CoreEditorProps) => {
    const [title, setTitle] = useState('Untitled Certificate');
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [bulkColumns, setBulkColumns] = useState<string[]>([]);
    const [bulkFileName, setBulkFileName] = useState('');
    const [panelWidth, setPanelWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const { user } = useAuth();

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
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(initialTemplateId || null);

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
        zoomToFit,
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
    } = useCanvas();

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

    const loadedUserTemplateIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Load user template logic
        if (userTemplateId && canvas && user?.token && loadedUserTemplateIdRef.current !== userTemplateId) {
            loadedUserTemplateIdRef.current = userTemplateId;

            const loadUserTemplate = async () => {
                try {
                    const res = await fetch(`/api/templates/${userTemplateId || initialTemplateId}`, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.canvasData) {
                            await loadFromJSON(data.canvasData);
                            setTitle(data.name);
                            toast.success('Design loaded successfully');
                        } else {
                            toast.error('Template data is empty');
                        }
                    } else {
                        toast.error(`Error loading template: ${res.status}`);
                    }
                } catch (err) {
                    console.error('Template load exception:', err);
                    toast.error('Failed to load design');
                }
            };
            loadUserTemplate();
        }
    }, [userTemplateId, initialTemplateId, canvas, user?.token, loadFromJSON]);

    useEffect(() => {
        if (!canvas) return;
        const updateTextElements = () => {
            const objects = canvas.getObjects();
            let textIndex = 0;
            const texts = objects
                .filter((obj: any) => obj.type === 'textbox' || obj.type === 'i-text')
                .map((obj: any) => {
                    const posX = Math.round(obj.left || 0);
                    const posY = Math.round(obj.top || 0);
                    const stableId = `text_${posX}_${posY}_${textIndex}`;
                    textIndex++;
                    if (!obj._id) obj._id = stableId;
                    if (!obj.id) obj.id = stableId;
                    return { id: obj._id || obj.id, text: obj.text || 'Untitled Text' };
                });
            setTextElements(texts);
        };
        updateTextElements();
        canvas.on('object:added', updateTextElements);
        canvas.on('object:removed', updateTextElements);
        return () => {
            canvas.off('object:added', updateTextElements);
            canvas.off('object:removed', updateTextElements);
        };
    }, [canvas]);

    const handleExportPNG = async (multiplier: number = 2) => {
        setIsExportingPNG(true);
        try {
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
            await new Promise(resolve => setTimeout(resolve, 500));
            exportToPDF(multiplier);
            toast.success('Certificate exported as PDF');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handleSaveInternal = async () => {
        if (!canvas) return;
        // Internal save logic for standalone usage, or use passed callback
        if (onSave) {
            const thumbnail = canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 0.5 });
            const canvasData = canvas.toObject(['_id', 'id']);
            canvasData.width = canvas.getWidth();
            canvasData.height = canvas.getHeight();
            canvasData.backgroundColor = canvas.backgroundColor;
            await onSave(canvasData, thumbnail);
        }
    };

    const handleApplyStyle = useCallback((preset: any) => {
        if (!canvas) return;
        canvas.set({ backgroundColor: preset.colors.background });
        // Apply styles logic (simplified for brevity, should copy full logic if needed)
        canvas.requestRenderAll();
        saveToHistory(canvas);
        toast.success(`Applied ${preset.name} style theme`);
    }, [canvas, saveToHistory]);

    const handleFinish = async () => {
        await handleSaveInternal();
        if (onClose) onClose();
    };

    return (
        <div className="h-full flex flex-col bg-background relative">
            {renderHeader && (
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
                    canvas={canvas}
                    showSafeZone={showSafeZone}
                    onToggleSafeZone={toggleSafeZone}
                    returnTo={returnTo}
                    onFinish={simplified ? handleFinish : undefined}
                    finishButtonText="Finish & Map"
                    activeTemplateId={activeTemplateId}
                />
            )}

            <div className="flex-1 overflow-hidden flex relative">
                <EditorSidebar
                    key={canvas ? 'canvas-ready' : 'canvas-loading'}
                    onAddText={(role) => addText(role || 'Title')}
                    onAddShape={addShape}
                    onAddImage={addImage}
                    onSetBackground={setBackgroundColor}
                    onLoadTemplate={(data) => {
                        loadTemplate(data);
                        toast.success("Template applied");
                    }}
                    onSelectTemplate={(templateId) => {
                        console.log('CoreEditor: onSelectTemplate called with ID:', templateId);
                        setActiveTemplateId(templateId);
                    }}
                    onApplyBorder={() => { }}
                    onApplyStyle={handleApplyStyle}
                    // Mapping Props
                    mappingFields={mappingFields}
                    simplified={simplified}
                    onFieldMapping={(objectId, field) => {
                        // Logic to apply mapping to canvas object
                        if (!canvas) return;

                        let targetObj: any = null;

                        if (objectId === 'CURRENT_SELECTION') {
                            targetObj = canvas.getActiveObject();
                        } else {
                            targetObj = canvas.getObjects().find((o: any) => (o.id || o._id) === objectId);
                        }

                        if (targetObj) {
                            // If group is selected, we might need to handle it, but for now assume Text
                            if (targetObj.type === 'textbox' || targetObj.type === 'i-text' || targetObj.type === 'text') {
                                targetObj.set('text', `{{${field}}}`);
                                canvas.requestRenderAll();
                                // Force layer update
                                canvas.fire('object:modified', { target: targetObj });
                                toast.success(`Mapped to ${field}`);
                            } else {
                                toast.error("Please select a text element to map");
                            }
                        } else {
                            toast.error("No text element selected");
                        }
                    }}
                    // Integration Props
                    selectedObject={selectedObject}
                    onDelete={deleteSelected}
                    onBringForward={bringForward}
                    onSendBackward={sendBackward}
                    onGroup={groupSelected}
                    onUngroup={ungroupSelected}
                    onToggleLock={toggleLock}
                    layers={layers}
                    onSelectLayer={(obj) => {
                        if (canvas) {
                            canvas.setActiveObject(obj);
                            canvas.renderAll();
                        }
                    }}
                />

                <div className="flex-1 relative bg-slate-100/50 flex flex-col">
                    <CanvasWorkspace
                        canvasRef={canvasRef}
                        zoom={zoom}
                        onZoomChange={setZoom}
                        onResetViewport={resetViewport}
                        onZoomToFit={zoomToFit}
                    />
                </div>
            </div>

            {/* Custom Save Button for Modal if needed, otherwise EditorHeader handles it */}
        </div>
    );
};
