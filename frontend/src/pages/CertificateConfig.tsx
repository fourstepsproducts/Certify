import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificateTemplates } from '@/data/templatesSceneGraph';
import {
    Layout,
    Upload,
    Plus,
    ArrowLeft,
    Check,
    Settings2,
    ChevronRight,
    FileText,
    Edit3,
    Trophy,
    ArrowRight,
    Save,
    Loader2,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCanvas } from '@/hooks/useCanvas';
import { EditorDialog } from '@/components/module/EditorDialog';
import { Header } from '@/components/landing/Header';

interface Module {
    _id: string;
    name: string;
    certificateConfig?: {
        templateId?: string;
        fieldMapping?: Record<string, string>;
    };
}

interface Template {
    _id: string;
    name: string;
    thumbnail?: string;
    category?: string;
    canvasData?: any;
    sceneGraph?: any;
}

const CertificateConfig = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [module, setModule] = useState<Module | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [customFields, setCustomFields] = useState<any[]>([]);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [templateFields, setTemplateFields] = useState<any[]>([]);

    const [showEditor, setShowEditor] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        canvasRef,
        canvas,
        addText,
        loadTemplate,
        loadFromJSON,
        zoomToFit,
        setZoom
    } = useCanvas();

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;

            // Fetch module
            const moduleRes = await fetch(`http://localhost:5000/api/modules/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!moduleRes.ok) throw new Error('Failed to fetch module');
            const moduleData = await moduleRes.json();
            setModule(moduleData);

            if (moduleData.certificateConfig?.templateId) {
                setSelectedTemplateId(moduleData.certificateConfig.templateId);
                setMapping(moduleData.certificateConfig.fieldMapping || {});
            }

            // Fetch registration fields for mapping
            const linkRes = await fetch(`http://localhost:5000/api/registrations/link/module/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (linkRes.ok) {
                const linkData = await linkRes.json();
                setCustomFields(linkData.customFields || []);
            }

            // Fetch available templates
            const templatesRes = await fetch('http://localhost:5000/api/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (templatesRes.ok) {
                const templatesData = await templatesRes.json();

                // Map system templates to match interface
                const systemTemplates = certificateTemplates.map(t => ({
                    _id: t.id,
                    name: t.name,
                    thumbnail: t.preview,
                    category: t.category,
                    canvasData: t.sceneGraph
                }));

                // merge system templates with user templates
                setTemplates([...systemTemplates, ...templatesData]);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load configuration data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Dynamic field extraction from live canvas
    useEffect(() => {
        if (!canvas) return;

        const updateFields = () => {
            const objects = canvas.getObjects();
            const fields: any[] = [];

            const scanObjects = (objs: any[]) => {
                objs.forEach(obj => {
                    // Check for text-like objects
                    if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
                        const id = (obj as any).id || (obj as any)._id;
                        if (id) {
                            fields.push({ id, text: (obj as any).text });
                        }
                    }
                    // Handle groups recursively
                    if ((obj as any).objects) scanObjects((obj as any).objects);
                });
            };

            scanObjects(objects);
            setTemplateFields(fields);
        };

        // Listen for internal canvas changes
        canvas.on('object:added', updateFields);
        canvas.on('object:removed', updateFields);
        canvas.on('text:changed', updateFields);

        // Listen for template loads
        const handleTPLoad = () => {
            setTimeout(updateFields, 500); // Give it a moment to settle
        };
        (canvas as any).on('custom:loaded', handleTPLoad);

        // Initial scan
        updateFields();

        return () => {
            canvas.off('object:added', updateFields);
            canvas.off('object:removed', updateFields);
            canvas.off('text:changed', updateFields);
            (canvas as any).off('custom:loaded', handleTPLoad);
        };
    }, [canvas]);

    const loadSelectedTemplate = async () => {
        const template = templates.find(t => t._id === selectedTemplateId);
        if (!template) {
            try {
                const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
                const res = await fetch(`http://localhost:5000/api/templates/${selectedTemplateId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.canvasData) await loadFromJSON(data.canvasData);
                    (canvas as any)?.fire('custom:loaded');
                }
            } catch (err) {
                console.error(err);
            }
            return;
        }

        if (template.canvasData) {
            await loadFromJSON(template.canvasData);
            (canvas as any)?.fire('custom:loaded');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            const img = new Image();
            img.onload = async () => {
                const maxWidth = 2000;
                const scale = img.width > maxWidth ? maxWidth / img.width : 1;
                const width = img.width * scale;
                const height = img.height * scale;

                try {
                    const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
                    const response = await fetch('http://localhost:5000/api/templates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: `Uploaded Template - ${new Date().toLocaleDateString()}`,
                            category: 'uploaded',
                            thumbnail: dataUrl,
                            canvasData: {
                                version: '5.3.0',
                                objects: [{
                                    type: 'image',
                                    src: dataUrl,
                                    left: 0,
                                    top: 0,
                                    width: width,
                                    height: height,
                                    selectable: false,
                                    evented: false,
                                    role: 'background'
                                }],
                                width: width,
                                height: height,
                                backgroundColor: '#ffffff'
                            }
                        })
                    });

                    if (!response.ok) throw new Error('Failed to upload');
                    const newTemplate = await response.json();
                    setTemplates(prev => [...prev, newTemplate]);
                    setSelectedTemplateId(newTemplate._id);
                    toast({ title: 'Success', description: 'Template uploaded successfully' });
                } catch (error) {
                    toast({ title: 'Upload failed', variant: 'destructive' });
                } finally {
                    setUploading(false);
                }
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            let finalTemplateId = selectedTemplateId;

            // Check if it's a system template (short ID)
            if (selectedTemplateId && selectedTemplateId.length < 24) {
                const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
                if (selectedTemplate) {
                    // Create a copy in DB
                    const createRes = await fetch('http://localhost:5000/api/templates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: `Module Template - ${module?.name || 'Untitled'}`,
                            category: 'module',
                            thumbnail: selectedTemplate.thumbnail,
                            canvasData: selectedTemplate.canvasData
                        })
                    });

                    if (!createRes.ok) throw new Error('Failed to create template copy');
                    const newTemplate = await createRes.json();
                    finalTemplateId = newTemplate._id;

                    // Update state to use new ID to prevent re-creation
                    setTemplates(prev => [...prev, newTemplate]);
                    setSelectedTemplateId(finalTemplateId);
                }
            }

            const res = await fetch(`http://localhost:5000/api/modules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    certificateConfig: {
                        templateId: finalTemplateId,
                        fieldMapping: mapping
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to save');
            toast({ title: 'Success', description: 'Certificate configuration saved' });
            navigate(`/modules/${id}?tab=certificates`);
        } catch (error) {
            toast({ title: 'Failed to save', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const availableSourceFields = [
        { value: 'name', label: 'Full Name' },
        { value: 'email', label: 'Email Address' },
        { value: 'phoneNumber', label: 'Phone Number' },
        { value: 'submittedAt', label: 'Submission Date' },
        { value: 'date', label: 'Current Date' },
        ...customFields.map(f => ({ value: `custom.${f.id}`, label: f.label }))
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Preparing configuration workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col text-slate-900 relative overflow-hidden dashboard-mixed-bg">
            {/* Dark Marketing Header Wrapper to create separation */}
            <div className="relative z-20 w-full bg-[#0A0F1E] shadow-xl border-b-[1px] border-indigo-500/10">
                <Header />
            </div>

            {/* Unified Top Bar */}
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between relative z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(`/modules/${id}`)} size="sm" className="hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-6 w-[1px] bg-slate-200" />
                    <div>
                        <h1 className="text-sm font-extrabold text-slate-900 truncate max-w-[300px] flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-blue-600" />
                            {module?.name}
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unified Certificate Configuration</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                        <Check className="h-3 w-3" />
                        Live Auto-Save Enabled
                    </div>
                    <Button
                        onClick={handleSaveConfig}
                        disabled={saving || !selectedTemplateId}
                        className="btn-premium-indigo px-6 h-10 rounded-xl"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Finish & Save
                    </Button>
                </div>
            </div>

            <main className="flex-1 flex overflow-hidden relative z-10">
                {/* 1. Left Sidebar: Template Selection */}
                <aside className="w-80 border-r bg-white flex flex-col shadow-sm">
                    <div className="p-4 border-b bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Layout className="h-4 w-4 text-blue-600" />
                                Template Library
                            </h3>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4" />
                            </Button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                            <RefreshCw className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Create Custom / Blank Option */}
                            <Card
                                className="p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group text-center"
                                onClick={() => navigate('/editor?returnTo=' + encodeURIComponent(`/modules/${id}/configure-certificate`))}
                            >
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors">
                                    <Plus className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 group-hover:text-blue-700">Design New</span>
                            </Card>

                            {templates
                                .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(t => (
                                    <Card
                                        key={t._id}
                                        className={`overflow-hidden cursor-pointer transition-all rounded-xl border-2 ${selectedTemplateId === t._id ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' : 'border-slate-100 hover:border-blue-200'}`}
                                        onClick={() => setSelectedTemplateId(t._id)}
                                    >
                                        <div className="aspect-[1.414] bg-slate-50 relative overflow-hidden">
                                            {t.thumbnail ? (
                                                <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-200">
                                                    <Trophy className="h-8 w-8" />
                                                </div>
                                            )}
                                            {selectedTemplateId === t._id && (
                                                <div className="absolute top-2 right-2 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2.5 bg-white">
                                            <p className="text-[11px] font-bold truncate text-slate-900">{t.name}</p>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    </div>
                </aside>

                {/* 2. Middle: Design Preview Workspace */}
                <section className="flex-1 flex flex-col bg-slate-100/50 relative overflow-hidden">
                    {!selectedTemplateId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 animate-bounce ring-1 ring-slate-200/50">
                                <Layout className="h-10 w-10 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Welcome to the Designer</h2>
                            <p className="text-slate-500 max-w-sm leading-relaxed">Select a template from the left library to start customizing your module's certificate.</p>
                        </div>
                    ) : (
                        <>
                            <div id="canvas-workspace" className="flex-1 overflow-auto flex items-center justify-center p-12">
                                <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden bg-white ring-1 ring-slate-300 transform-gpu transition-all">
                                    <canvas ref={canvasRef} />
                                </div>
                            </div>

                            {/* Center Float Toolbar */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl z-20 border border-white/10">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addText()}
                                    className="text-white hover:bg-white/10 hover:text-white h-9 px-4 font-bold text-xs"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-2 text-blue-400" />
                                    Add Text
                                </Button>
                                <div className="w-[1px] h-4 bg-white/20" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => zoomToFit()}
                                    className="text-white hover:bg-white/10 hover:text-white h-9 px-4 font-bold text-xs"
                                >
                                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                                    Fit View
                                </Button>
                                <div className="w-[1px] h-4 bg-white/20" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEditor(true)}
                                    className="text-white hover:bg-blue-600 hover:text-white h-9 px-4 font-bold text-xs"
                                >
                                    <Edit3 className="h-3.5 w-3.5 mr-2" />
                                    Advanced Editor
                                </Button>
                            </div>
                        </>
                    )}
                </section>

                {/* 3. Right Sidebar: Field Mapping */}
                <aside className="w-80 border-l bg-white flex flex-col shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-blue-600" />
                            Field Mapping
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-extrabold truncate">Connect sources to placeholders</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!selectedTemplateId ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 italic text-xs">
                                <Settings2 className="h-10 w-10 mb-4 opacity-10" />
                                Select a template to map fields
                            </div>
                        ) : templateFields.length === 0 ? (
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center animate-in fade-in duration-500">
                                <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                                <h4 className="font-bold text-amber-900 text-xs mb-1">No placeholders found</h4>
                                <p className="text-[10px] text-amber-700 leading-relaxed">Add at least one text placeholder using the "Add Text" button below.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-20">
                                {templateFields.map((field) => {
                                    const isMapped = !!mapping[field.id];
                                    return (
                                        <div key={field.id} className={`p-3 rounded-xl border-2 transition-all duration-300 ${isMapped ? 'border-blue-100 bg-blue-50/20' : 'border-slate-100 bg-white'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {field.id.slice(-6)}</span>
                                                {isMapped && <Check className="h-3 w-3 text-blue-600" />}
                                            </div>

                                            <div className="font-bold text-[11px] p-2 bg-slate-50 text-slate-700 rounded-lg mb-3 border border-slate-200/50 truncate" title={field.text}>
                                                "{field.text}"
                                            </div>

                                            <Select
                                                value={mapping[field.id] || "none"}
                                                onValueChange={(val) => setMapping(prev => ({ ...prev, [field.id]: val === "none" ? "" : val }))}
                                            >
                                                <SelectTrigger className="h-8 bg-white rounded-lg border-slate-200 text-[11px] font-medium">
                                                    <SelectValue placeholder="Select source..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none" className="text-slate-400 italic text-xs">-- Static Text --</SelectItem>
                                                    {availableSourceFields.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {selectedTemplateId && (
                        <div className="p-6 border-t bg-slate-50/50">
                            <div className="flex items-center justify-between text-[10px] mb-3 font-bold text-slate-500 uppercase tracking-wider">
                                <span>Progress</span>
                                <span className="text-blue-600">
                                    {Object.values(mapping).filter(v => v).length} / {templateFields.length} Mapped
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                                    style={{ width: `${(Object.values(mapping).filter(v => v).length / (templateFields.length || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </aside>
            </main>

            {/* Editor Dialog for full control */}
            <EditorDialog
                open={showEditor}
                onClose={() => setShowEditor(false)}
                templateId={selectedTemplateId}
                onSave={async (data, thumb) => {
                    // Update current selected template with new data
                    const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
                    await fetch(`http://localhost:5000/api/templates/${selectedTemplateId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ canvasData: data, thumbnail: thumb })
                    });
                    // Refresh data
                    await loadSelectedTemplate();
                    toast({ title: 'Design Updated' });
                }}
                fields={availableSourceFields.map(f => f.label)}
            />
        </div>
    );
};

export default CertificateConfig;
