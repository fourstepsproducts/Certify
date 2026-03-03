import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, Loader2, Plus, ArrowLeft, Save, Type, Calendar, PenTool, LayoutTemplate, FileText, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { Canvas, Textbox, FabricImage } from 'fabric';

interface Template {
    _id: string;
    name: string;
    thumbnail: string;
    createdAt: string;
    status?: string | 'draft' | 'published';
    sceneGraph?: any;
    canvasData?: any;
    baseImage?: string; // Optional helper for editor
}

interface CertificatesProps {
    onLogout: () => void;
}

const DEFAULT_TEMPLATES = [
    {
        name: 'Classic Elegant',
        category: 'participation',
        thumbnail: '/showcase-filled/1.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-1', type: 'image', src: '/uploads/certificates/1.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        name: 'Professional Blue',
        category: 'achievement',
        thumbnail: '/showcase-filled/2.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-2', type: 'image', src: '/uploads/certificates/2.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        name: 'Modern Gold',
        category: 'award',
        thumbnail: '/showcase-filled/3.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-3', type: 'image', src: '/uploads/certificates/3.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        name: 'Corporate Grey',
        category: 'completion',
        thumbnail: '/showcase-filled/4.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-4', type: 'image', src: '/uploads/certificates/4.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    }
];

const CertificatesPage = ({ onLogout }: CertificatesProps) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    // Editor State
    const [isEditorMode, setIsEditorMode] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [saving, setSaving] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [showEditorSidebar, setShowEditorSidebar] = useState(true);

    const navigate = useNavigate();

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/templates`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Failed to fetch templates', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Unified Editor Lifecycle Effect
    useEffect(() => {
        if (!isEditorMode || !editingTemplate || !canvasRef.current) {
            if (canvas) {
                canvas.dispose();
                setCanvas(null);
            }
            return;
        }

        const fabricCanvas = new Canvas(canvasRef.current, {
            backgroundColor: '#ffffff', // Force white background for visibility
            selection: true,
            preserveObjectStacking: true,
            imageSmoothingEnabled: false,
        });

        const resizeCanvas = () => {
            const container = document.getElementById('editor-canvas-container');
            if (container && fabricCanvas) {
                const width = container.clientWidth;
                const height = container.clientHeight;
                const baseWidth = 2000;
                const baseHeight = 1500;

                // 1. Fill the entire container (reduces dead space around canvas)
                fabricCanvas.setDimensions({ width, height });

                // 2. Calculate ideal zoom to focus on the 2000x1500 workspace
                const fitScale = Math.min(width / baseWidth, height / baseHeight);
                const zoom = fitScale * 0.95; // Use 95% of available space for primary focus

                fabricCanvas.setZoom(zoom);

                // 3. Pan to center the workspace precisely
                const vpt = fabricCanvas.viewportTransform;
                if (vpt) {
                    vpt[4] = (width - baseWidth * zoom) / 2;
                    vpt[5] = (height - baseHeight * zoom) / 2;
                }

                fabricCanvas.requestRenderAll();
            }
        };

        const loadLayout = async () => {
            try {
                const content = editingTemplate.sceneGraph || editingTemplate.canvasData;
                if (!content) {
                    console.warn("[FABRIC] No content found for template:", editingTemplate.name);
                    return;
                }

                // 1. Resolve Background Image URL (with absolute fallbacks)
                let baseImageUrl = '';

                // Priority A: Background image in Fabric JSON format
                if (content.backgroundImage?.src) {
                    baseImageUrl = content.backgroundImage.src;
                }
                // Priority B: Scene Graph background node
                else if (content.root?.children) {
                    const bgNode = content.root.children.find((n: any) =>
                        n.role === 'decoration' ||
                        n.type === 'image' ||
                        (n.type === 'rect' && (n.role === 'background' || n.isBackground))
                    );
                    if (bgNode && bgNode.src) baseImageUrl = bgNode.src;
                }

                // Priority C: Explicit baseImage field
                if (!baseImageUrl && editingTemplate.baseImage) {
                    baseImageUrl = editingTemplate.baseImage;
                }

                // Priority D: Thumbnail Fallback (Ensures the editor is never empty)
                if (!baseImageUrl && editingTemplate.thumbnail) {
                    console.log("[FABRIC] No explicit background found, using thumbnail as fallback");
                    baseImageUrl = editingTemplate.thumbnail;
                }

                // Automatic Path Correction for Legacy Data
                if (baseImageUrl.includes('/templates-not-filled/')) {
                    console.log("[FABRIC] Detected legacy path, auto-correcting...");
                    baseImageUrl = baseImageUrl.replace('/templates-not-filled/', '/uploads/certificates/');
                }

                console.log("[FABRIC] Resolved Base Image Path:", baseImageUrl);

                // 2. Load the Background Asset with Origin Pivot
                if (baseImageUrl) {
                    const tryLoad = async (url: string) => {
                        try {
                            const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
                            return img;
                        } catch (err) {
                            return null;
                        }
                    };

                    // Try variations: Original -> Absolute Local -> Absolute Backend
                    let img = await tryLoad(baseImageUrl);

                    if (!img && baseImageUrl.startsWith('/')) {
                        console.log("[FABRIC] Local path failed, trying backend fallback...");
                        img = await tryLoad(`${import.meta.env.VITE_API_BASE_URL}${baseImageUrl}`);
                    }

                    if (img) {
                        const workspaceW = 2000;
                        const workspaceH = 1500;
                        const scale = Math.min(workspaceW / img.width, workspaceH / img.height);

                        img.set({
                            scaleX: scale,
                            scaleY: scale,
                            originX: 'center',
                            originY: 'center',
                            left: workspaceW / 2,
                            top: workspaceH / 2,
                            selectable: false,
                            evented: false,
                            lockMovementX: true,
                            lockMovementY: true,
                            opacity: 1,
                            visible: true
                        });

                        (img as any).role = 'background';
                        // Store it to add AFTER loadFromJSON
                        (fabricCanvas as any).pendingBackground = img;
                        console.log("[FABRIC] Background image resolved and pending placement");
                    }
                }

                // 3. Load UI Elements (Text boxes, etc.)
                if (content.root?.children) {
                    for (const node of content.root.children) {
                        // Skip nodes used as background
                        if (node.role === 'decoration' || node.type === 'image' || (node.type === 'rect' && (node.role === 'background' || node.isBackground))) continue;

                        const text = new Textbox(node.text || '', {
                            left: node.transform?.x || 1000,
                            top: node.transform?.y || 750,
                            fontSize: node.fontSize || 80,
                            fontFamily: node.fontFamily || (node.role === 'recipient' ? 'Pinyon Script' : 'Outfit'),
                            fill: node.fill || '#0a3c6f',
                            textAlign: node.textAlign || 'center',
                            originX: node.originX || 'center',
                            originY: node.originY || 'center',
                            width: node.width || 800,
                            selectable: true
                        });
                        (text as any).role = node.role;
                        fabricCanvas.add(text);
                    }
                } else if (content.objects) {
                    const objectsOnly = { ...content };
                    delete objectsOnly.backgroundImage;
                    await fabricCanvas.loadFromJSON(objectsOnly);
                }

                // 3.5 ADD THE BACKGROUND NOW (Guaranteed bottom layer)
                if ((fabricCanvas as any).pendingBackground) {
                    fabricCanvas.add((fabricCanvas as any).pendingBackground);
                    (fabricCanvas as any).sendObjectToBack((fabricCanvas as any).pendingBackground);
                    console.log("[FABRIC] Background placed and sent to back");
                }

                // 4. Final Field Integrity Check (Ensure Name/Date/Sig always exist)
                const requiredRoles = [
                    { role: 'recipient', text: '[Name]', font: 'Pinyon Script', size: 100, y: 550, width: 800 },
                    { role: 'description', text: '[Description]', font: 'Outfit', size: 45, y: 780, width: 1000 },
                    { role: 'date', text: '[Date]', font: 'Outfit', size: 48, y: 1100, x: 500, width: 500 },
                    { role: 'signature', text: '[Signature]', font: 'Outfit', size: 48, y: 1100, x: 1500, width: 500 }
                ];

                const currentObjects = fabricCanvas.getObjects();
                for (const def of requiredRoles) {
                    const exists = currentObjects.some(obj => (obj as any).role === def.role);
                    if (!exists) {
                        const text = new Textbox(def.text, {
                            left: def.x || 1000,
                            top: def.y,
                            fontSize: def.size,
                            fontFamily: def.font,
                            fill: '#334155',
                            textAlign: 'center',
                            originX: 'center',
                            originY: 'center',
                            width: def.width,
                            selectable: true
                        });
                        (text as any).role = def.role;
                        fabricCanvas.add(text);
                    }
                }

                fabricCanvas.requestRenderAll();
                setTimeout(resizeCanvas, 100);

            } catch (err) {
                console.error("[FABRIC] Layout load error:", err);
                toast.error("Failed to load design layers");
            }
        };

        loadLayout();
        setCanvas(fabricCanvas);
        window.addEventListener('resize', resizeCanvas);

        return () => {
            fabricCanvas.dispose();
            window.removeEventListener('resize', resizeCanvas);
            setCanvas(null);
        };
    }, [isEditorMode, editingTemplate]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !newTemplateName) {
            toast.error('Please provide a name and image');
            return;
        }

        setUploading(true);
        try {
            const mainImageBase64 = await fileToBase64(selectedFile);
            const img = new Image();
            await new Promise((resolve) => { img.onload = resolve; img.src = mainImageBase64; });

            const thumbnailBase64 = thumbnailFile ? await fileToBase64(thumbnailFile) : mainImageBase64;

            const canvasData = {
                version: "5.3.0",
                objects: [],
                backgroundImage: {
                    type: "image",
                    version: "5.3.0",
                    originX: "left",
                    originY: "top",
                    left: 0,
                    top: 0,
                    width: img.width,
                    height: img.height,
                    opacity: 1,
                    src: mainImageBase64,
                    crossOrigin: "anonymous"
                },
                width: img.width,
                height: img.height
            };

            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newTemplateName, thumbnail: thumbnailBase64, canvasData, status: 'draft' })
            });

            if (res.ok) {
                const newT = await res.json();
                toast.success('Draft created!');
                setShowUploadModal(false);
                setEditingTemplate(newT);
                setIsEditorMode(true);
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            toast.error('Error uploading');
        } finally {
            setUploading(false);
        }
    };

    const selectField = (role: string) => {
        if (!canvas) return;
        const objects = canvas.getObjects();
        const target = objects.find(obj => (obj as any).role === role);

        if (target) {
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            toast.info(`Selected ${role} field`);
        } else {
            // Auto-inject if missing
            const requiredRoles = {
                'recipient': { text: '[Name]', font: 'Pinyon Script', size: 100, y: 550, width: 800 },
                'description': { text: '[Description]', font: 'Outfit', size: 45, y: 780, width: 1000 },
                'date': { text: '[Date]', font: 'Outfit', size: 48, y: 1100, x: 500, width: 500 },
                'signature': { text: '[Signature]', font: 'Outfit', size: 48, y: 1100, x: 1500, width: 500 }
            };

            const def = (requiredRoles as any)[role];
            if (def) {
                const text = new Textbox(def.text, {
                    left: def.x || 1000,
                    top: def.y,
                    fontSize: def.size,
                    fontFamily: def.font,
                    fill: '#334155',
                    textAlign: 'center',
                    originX: 'center',
                    originY: 'center',
                    width: def.width,
                    selectable: true
                });
                (text as any).role = role;
                canvas.add(text);
                canvas.setActiveObject(text);
                canvas.requestRenderAll();
                toast.success(`Restored ${role} field to canvas`);
            }
        }
    };

    const removeField = (role: string) => {
        if (!canvas) return;
        const target = canvas.getObjects().find(obj => (obj as any).role === role);
        if (target) {
            canvas.remove(target);
            canvas.requestRenderAll();
            toast.success(`Removed ${role} field`);
        } else {
            toast.error(`Field ${role} not found`);
        }
    };

    const handleSave = async (isPublishing = true) => {
        if (!canvas || !editingTemplate) return;
        setSaving(true);
        const toastId = toast.loading(isPublishing ? "Publishing..." : "Saving draft...");

        try {
            const json = canvas.toObject(['role', 'id', 'selectable', 'evented', 'hasControls', 'backgroundImage']);
            const objects = canvas.getObjects();
            const originalValues = new Map();

            objects.forEach((obj: any) => {
                if (obj.text && (obj as any).role) {
                    originalValues.set(obj, obj.text);
                    if ((obj as any).role === 'recipient') obj.set('text', 'ALEXANDER PIERCE');
                    if ((obj as any).role === 'date') obj.set('text', new Date().toLocaleDateString());
                    if ((obj as any).role === 'signature') obj.set('text', 'William Smith');
                }
            });
            canvas.requestRenderAll();

            const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1, quality: 1 });
            objects.forEach((obj: any) => { if (originalValues.has(obj)) obj.set('text', originalValues.get(obj)); });
            canvas.requestRenderAll();

            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/templates/${editingTemplate._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    sceneGraph: json,
                    canvasData: json,
                    thumbnail: dataUrl,
                    status: isPublishing ? 'published' : 'draft',
                    name: editingTemplate.name
                })
            });

            if (res.ok) {
                toast.success(isPublishing ? "Published successfully!" : "Draft saved", { id: toastId });
                if (isPublishing) {
                    setIsEditorMode(false);
                    setEditingTemplate(null);
                    fetchTemplates(); // Refresh List
                }
            } else {
                toast.error("Failed to save", { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTemplateId) return;
        const toastId = toast.loading('Deleting certificate...');
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/templates/${selectedTemplateId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Certificate deleted', { id: toastId });
                setTemplates(prev => prev.filter(t => t._id !== selectedTemplateId));
                setSelectedTemplateId(null);
            } else {
                toast.error('Failed to delete', { id: toastId });
            }
        } catch (error) {
            toast.error('Error deleting certificate', { id: toastId });
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleRestoreDefaults = async () => {
        if (!confirm('Import default templates?')) return;
        setSeeding(true);
        try {
            const token = localStorage.getItem('adminToken');
            for (const t of DEFAULT_TEMPLATES) {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/templates`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ...t, status: 'published' })
                });
            }
            toast.success(`Restored templates`);
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to restore defaults');
        } finally {
            setSeeding(false);
        }
    };

    if (isEditorMode) {
        return (
            <Layout onLogout={onLogout} title="Template Editor">
                <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-full bg-[#0f0f0f] rounded-2xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-300 min-w-0 relative">
                    {/* Header */}
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#141414] min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <button onClick={() => setIsEditorMode(false)} className="flex-shrink-0 p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="font-bold text-lg leading-tight truncate">{editingTemplate?.name}</h1>
                                <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
                                    <span className="flex-shrink-0 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Inline Editor</span>
                                    <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider truncate ${editingTemplate?.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                        {editingTemplate?.status || 'draft'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <button
                                onClick={() => setShowEditorSidebar(!showEditorSidebar)}
                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                                title="Toggle Sidebar"
                            >
                                <Menu className="w-5 h-5" />
                                <span className="hidden lg:inline text-xs font-medium uppercase tracking-wider">Settings</span>
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1 hidden lg:block" />
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="hidden sm:block text-xs font-medium text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 px-4 sm:px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 text-xs sm:text-sm"
                            >
                                <Save className="w-4 h-4" />
                                <span className="hidden xs:inline">{saving ? 'Publishing...' : 'Lock & Publish'}</span>
                                <span className="xs:hidden">{saving ? '...' : 'Publish'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden min-w-0 relative">
                        {/* Sidebar - Responsive Slide Out */}
                        <div className={`
                            absolute md:relative z-20 h-full w-64 flex-shrink-0 border-r border-white/10 bg-[#111] p-4 flex flex-col gap-4 
                            transition-all duration-300 ease-in-out
                            ${showEditorSidebar ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:w-0 md:p-0 md:border-0'}
                        `}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Configure Layout</p>
                                <button onClick={() => setShowEditorSidebar(false)} className="md:hidden p-1 hover:bg-white/5 rounded text-gray-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                                <button onClick={() => selectField('recipient')} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors group relative">
                                    <Type className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <div className="flex-1">
                                        <span className="block text-sm font-medium text-white">Recipient Name</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Variable Field</span>
                                    </div>
                                </button>

                                <button onClick={() => selectField('date')} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors group relative">
                                    <Calendar className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                                    <div className="flex-1">
                                        <span className="block text-sm font-medium text-white">Date Field</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Auto-filled</span>
                                    </div>
                                </button>

                                <button onClick={() => selectField('signature')} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors group relative">
                                    <PenTool className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                                    <div className="flex-1">
                                        <span className="block text-sm font-medium text-white">Signature</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Static or Variable</span>
                                    </div>
                                </button>

                                <button onClick={() => selectField('description')} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors group relative">
                                    <FileText className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                                    <div className="flex-1">
                                        <span className="block text-sm font-medium text-white">Description</span>
                                        <span className="text-[10px] text-gray-500 uppercase">Certificate Details</span>
                                    </div>
                                </button>
                            </div>

                            {/* Unified Removal Button */}
                            <div className="mt-2">
                                <button
                                    onClick={() => {
                                        if (!canvas) return;
                                        const activeObject = canvas.getActiveObject();
                                        if (activeObject) {
                                            canvas.remove(activeObject);
                                            canvas.requestRenderAll();
                                            toast.success("Field removed");
                                        } else {
                                            toast.error("Please select a field on canvas first");
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 font-bold text-xs uppercase tracking-widest group"
                                >
                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Remove Fields
                                </button>
                            </div>

                            <div className="my-2 border-t border-white/5" />

                            <div className="mt-auto p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-2">
                                    <LayoutTemplate className="w-4 h-4" />
                                    Values Locked
                                </h4>
                                <p className="text-xs text-blue-200/50 leading-relaxed">
                                    Position, size, and fonts you set here will be <strong>locked</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Canvas Area */}
                        <div id="editor-canvas-container" className="flex-1 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden p-4 sm:p-8 min-w-0">
                            <canvas ref={canvasRef} className="max-w-full max-h-full" />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout onLogout={onLogout} title="Certificates Collection">
            <div className="-mt-8">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-extrabold tracking-tight text-white">All Certificates</h2>
                    <div className="flex gap-4">
                        {selectedTemplateId && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-5 py-2.5 rounded-xl transition-all border border-red-600/20 hover:border-red-600 font-semibold"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                            </button>
                        )}
                        <button
                            onClick={handleRestoreDefaults}
                            disabled={seeding}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 border border-white/10 font-medium"
                        >
                            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4" />}
                            Restore Defaults
                        </button>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 font-bold hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5" />
                            Upload Certificate
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 opacity-50" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                        {templates.map(template => (
                            <div
                                key={template._id}
                                onClick={() => {
                                    if (selectedTemplateId === template._id || template.status === 'draft') {
                                        setEditingTemplate(template);
                                        setIsEditorMode(true);
                                    } else {
                                        setSelectedTemplateId(template._id);
                                    }
                                }}
                                className={`bg-[#18181b] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group hover:shadow-2xl hover:shadow-black/50 ${selectedTemplateId === template._id
                                    ? 'border-blue-500 ring-4 ring-blue-500/10'
                                    : 'border-white/5 hover:border-blue-500/30'
                                    }`}
                            >
                                <div className="aspect-[4/3] w-full bg-[#09090b] relative overflow-hidden flex items-center justify-center p-4">
                                    <img
                                        src={template.thumbnail}
                                        alt={template.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out p-2"
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${template.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                            {template.status || 'draft'}
                                        </span>
                                    </div>

                                    {selectedTemplateId === template._id && (
                                        <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                            <div className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-2 transform translate-y-0 active:scale-95 transition-all uppercase text-xs tracking-widest">
                                                Open Editor
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 bg-gradient-to-b from-[#18181b] to-[#121214]">
                                    <h3 className="font-bold text-white truncate text-sm">{template.name}</h3>
                                    <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-2 tracking-wide font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        LAST UPDATED: {new Date((template as any).updatedAt || (template as any).createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {/* ...rest of grid... */}
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 animate-in fade-in duration-300">
                        <div className="bg-[#18181b] border border-white/10 w-full max-w-xl rounded-[2rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse" />

                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Upload Certificate</h3>
                                    <p className="text-gray-400 text-sm mt-1">Add a new base design to your library</p>
                                </div>
                                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Blank Base Design</label>
                                    <div className="border-2 border-dashed border-white/5 rounded-[1.5rem] p-12 text-center hover:bg-blue-600/5 hover:border-blue-500/50 transition-all relative min-h-[220px] flex flex-col items-center justify-center group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                const file = e.target.files?.[0] || null;
                                                setSelectedFile(file);
                                                if (file && !newTemplateName) {
                                                    setNewTemplateName(file.name.replace(/\.[^/.]+$/, ""));
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            required
                                        />
                                        {selectedFile ? (
                                            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                                                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                                    <FileText className="w-8 h-8 text-blue-500" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-white font-bold text-lg truncate max-w-[280px]">
                                                        {selectedFile?.name}
                                                    </div>
                                                    <div className="text-blue-500/60 text-xs font-bold uppercase tracking-widest mt-1">
                                                        Ready to Process
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-gray-500 group-hover:text-blue-400 transition-colors">
                                                <div className="w-16 h-16 bg-white/5 rounded-[1.2rem] flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-white font-bold text-base">Select Certificate File</span>
                                                    <span className="block text-[11px] font-bold uppercase tracking-widest opacity-60">High Resolution PNG or JPEG</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-bold border border-white/5 active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-[2] px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-black shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] active:scale-95 hover:scale-[1.02]"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                CALCULATING...
                                            </>
                                        ) : (
                                            <>
                                                <span>INITIALIZE SETUP</span>
                                                <ArrowLeft className="w-5 h-5 rotate-180" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout >
    );
};

export default CertificatesPage;
