import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Plus, Trash2, Eye, Layout, MoreVertical, FolderPlus, Pencil, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/landing/Header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Module {
    _id: string;
    name: string;
    createdAt: string;
    registrationCount: number;
    feedbackCount: number;
    eligibleCount: number;
    certificateConfig?: {
        templateId?: string;
        fieldMapping?: Record<string, string>;
        serialFormat?: Array<any>;
        serialCounter?: number;
    };
    headingId?: string;
    isPaid?: boolean;
    amount: number;
}

interface Heading {
    _id: string;
    title: string;
    modules: Module[];
    order: number;
}

interface HeadingsResponse {
    headings: Heading[];
    uncategorized: Module[];
}

const Modules = () => {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [uncategorized, setUncategorized] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [createHeadingOpen, setCreateHeadingOpen] = useState(false);
    const [createModuleOpen, setCreateModuleOpen] = useState(false);
    const [editMode, setEditMode] = useState<'heading' | 'module' | null>(null);
    const [editItem, setEditItem] = useState<{ id: string, name: string, isPaid?: boolean } | null>(null);

    // Form States
    const [headingTitle, setHeadingTitle] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [amount, setAmount] = useState<number>(0);
    const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Delete Confirmation State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<{
        type: 'heading' | 'module' | 'selected';
        id?: string;
        title: string;
        description: string;
    } | null>(null);


    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/signin');
        } else if (!authLoading && user) {
            if (user.role !== 'organizer') {
                navigate('/user/dashboard');
            } else {
                fetchData();
            }
        }
    }, [user, authLoading, navigate]);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/headings`, {
                headers: {
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch data');

            const data: HeadingsResponse = await response.json();
            setHeadings(data.headings);
            setUncategorized(data.uncategorized);
        } catch (error) {
            console.error('Error fetching modules:', error);
            toast({
                title: 'Error',
                description: 'Failed to load modules',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHeading = async () => {
        if (!headingTitle.trim()) {
            toast({
                title: "Heading Title Required",
                description: "Please enter a title for your new heading.",
                variant: "destructive"
            });
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/headings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                },
                body: JSON.stringify({ title: headingTitle })
            });

            if (!response.ok) throw new Error('Failed to create heading');

            setHeadingTitle('');
            setCreateHeadingOpen(false);
            toast({ title: 'Success', description: 'Heading created' });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create heading', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateModule = async () => {
        if (!moduleName.trim()) {
            toast({
                title: "Module Name Required",
                description: "Please enter a name for your new module.",
                variant: "destructive"
            });
            return;
        }
        if (!activeHeadingId) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/modules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                },
                body: JSON.stringify({
                    name: moduleName,
                    headingId: activeHeadingId,
                    isPaid: isPaid,
                    amount: isPaid ? amount : 0
                })
            });

            if (!response.ok) throw new Error('Failed to create module');

            setModuleName('');
            setActiveHeadingId(null);
            setCreateModuleOpen(false);
            toast({ title: 'Success', description: 'Module created' });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create module', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editItem || !editItem.name.trim()) {
            toast({
                title: "Name Required",
                description: "Please enter a name to save changes.",
                variant: "destructive"
            });
            return;
        }

        setSubmitting(true);
        try {
            const endpoint = editMode === 'heading'
                ? `${API_URL}/headings/${editItem.id}`
                : `${API_URL}/modules/${editItem.id}`;

            const body = editMode === 'heading'
                ? { title: editItem.name }
                : {
                    name: editItem.name,
                    isPaid: editItem.isPaid,
                    amount: editItem.isPaid ? (editItem as any).amount : 0
                };

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('Failed to update');

            setEditMode(null);
            setEditItem(null);
            toast({ title: 'Success', description: `${editMode === 'heading' ? 'Heading' : 'Module'} updated` });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteHeading = (id: string) => {
        setDeleteAction({
            type: 'heading',
            id,
            title: 'Delete Heading?',
            description: 'This will delete the heading. Modules inside will become uncategorized.'
        });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteModule = (id: string, name: string) => {
        setDeleteAction({
            type: 'module',
            id,
            title: `Delete "${name}"?`,
            description: 'This action cannot be undone. All registrations and data associated with this module will be permanently removed.'
        });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteSelected = () => {
        if (!selectedModules.length) {
            toast({
                title: "Selection Required",
                description: "Please select at least one module to delete.",
                variant: "destructive"
            });
            return;
        }
        setDeleteAction({
            type: 'selected',
            title: `Delete ${selectedModules.length} Modules?`,
            description: `Are you sure you want to delete ${selectedModules.length} selected modules? This action cannot be undone.`
        });
        setDeleteConfirmOpen(true);
    };

    const performDelete = async () => {
        if (!deleteAction) return;

        const { type, id } = deleteAction;
        setSubmitting(true);

        try {
            if (type === 'heading' && id) {
                const res = await fetch(`${API_URL}/headings/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}` }
                });
                if (!res.ok) throw new Error('Failed to delete heading');
                toast({ title: 'Success', description: 'Heading deleted' });
            } else if (type === 'module' && id) {
                const res = await fetch(`${API_URL}/modules/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}` }
                });
                if (!res.ok) throw new Error('Failed to delete module');
                setSelectedModules(prev => prev.filter(mId => mId !== id));
                toast({ title: 'Success', description: 'Module deleted' });
            } else if (type === 'selected') {
                await Promise.all(selectedModules.map(async (modId) => {
                    const res = await fetch(`${API_URL}/modules/${modId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}` }
                    });
                    if (!res.ok) throw new Error(`Failed to delete module ${modId}`);
                }));
                toast({ title: 'Success', description: `${selectedModules.length} modules deleted` });
                setSelectedModules([]);
                setIsSelectionMode(false);
            }
            fetchData();
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Failed to delete. Please try again.', variant: 'destructive' });
        } finally {
            setSubmitting(false);
            setDeleteConfirmOpen(false);
            setDeleteAction(null);
        }
    };

    const toggleModuleSelection = (id: string) => {
        setSelectedModules(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const toggleHeadingModules = (heading: Heading) => {
        const moduleIds = heading.modules.map(m => m._id);
        const allSelected = moduleIds.length > 0 && moduleIds.every(id => selectedModules.includes(id));

        if (allSelected) {
            setSelectedModules(prev => prev.filter(id => !moduleIds.includes(id)));
        } else {
            setSelectedModules(prev => [...new Set([...prev, ...moduleIds])]);
        }
    };

    const openCreateModule = (headingId: string) => {
        setActiveHeadingId(headingId);
        setModuleName('');
        setIsPaid(false);
        setAmount(0); // Reset amount when opening create module dialog
        setCreateModuleOpen(true);
    };

    const openEdit = (type: 'heading' | 'module', id: string, name: string, isPaid?: boolean, amount?: number) => {
        setEditMode(type);
        setEditItem({ id, name, isPaid, ...(type === 'module' ? { amount } : {}) } as any);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col text-slate-900 relative overflow-hidden dashboard-mixed-bg">
            {/* Dark Marketing Header Wrapper to create separation */}
            <div className="relative z-20 w-full bg-[#0A0F1E] shadow-xl border-b-[1px] border-indigo-500/10">
                <Header />
            </div>

            <div className="container mx-auto px-4 py-8 flex-1 max-w-7xl relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Modules</h1>
                        <p className="text-slate-500 mt-1">Organize your modules into logical groups</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isSelectionMode && selectedModules.length > 0 && (
                            <Button
                                variant="destructive"
                                size="lg"
                                className="gap-2 font-bold shadow-md animate-in fade-in slide-in-from-right-4"
                                onClick={handleDeleteSelected}
                                disabled={submitting}
                            >
                                <Trash2 className="h-5 w-5" />
                                Delete ({selectedModules.length})
                            </Button>
                        )}
                        <Button
                            variant={isSelectionMode ? "secondary" : "outline"}
                            size="lg"
                            className={cn(
                                "gap-2 font-bold transition-all",
                                isSelectionMode
                                    ? "bg-slate-900 text-white hover:bg-slate-800"
                                    : "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            )}
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                if (isSelectionMode) setSelectedModules([]);
                            }}
                        >
                            {isSelectionMode ? "Cancel" : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </Button>
                        <Dialog open={createHeadingOpen} onOpenChange={setCreateHeadingOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="btn-premium-indigo shadow-sm hover:shadow-md transition-all gap-2">
                                    <Plus className="h-5 w-5" /> Create New Heading
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Heading</DialogTitle>
                                    <DialogDescription>Create a container to group your modules.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label>Heading Title</Label>
                                    <Input
                                        value={headingTitle}
                                        onChange={e => setHeadingTitle(e.target.value)}
                                        placeholder="e.g. Q1 Workshops"
                                        className="mt-2"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button className="btn-premium-indigo" onClick={handleCreateHeading} disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create Heading'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Headings Grid */}
                <div className="space-y-8">
                    {/* Render Headings */}
                    {headings.map((heading) => (
                        <Card key={heading._id} className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                            <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-5 px-6">
                                <div className="flex items-center gap-3 group/heading">
                                    {isSelectionMode && (
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-black focus:ring-0 cursor-pointer accent-black mr-1"
                                            checked={heading.modules.length > 0 && heading.modules.every(m => selectedModules.includes(m._id))}
                                            onChange={() => toggleHeadingModules(heading)}
                                        />
                                    )}
                                    <div className="h-8 w-1 bg-black rounded-full" />
                                    <CardTitle className="text-lg font-semibold text-slate-800">{heading.title}</CardTitle>
                                    <button
                                        onClick={() => openEdit('heading', heading._id, heading.title)}
                                        className="opacity-0 group-hover/heading:opacity-100 p-1 hover:bg-slate-200 rounded-md transition-all text-slate-400 hover:text-primary"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                                        {heading.modules.length} modules
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleDeleteHeading(heading._id)} className="text-red-600 focus:text-red-700">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete Heading
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {heading.modules.map(module => (
                                        <div
                                            key={module._id}
                                            className={cn(
                                                "group relative bg-[#F5F8FF] border border-[#E4EAF7] rounded-[14px] p-5 hover:bg-[#EDF3FF] hover:-translate-y-[3px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out cursor-pointer flex flex-col justify-between min-h-[170px]",
                                                (isSelectionMode && selectedModules.includes(module._id)) && "border-primary bg-[#EDF3FF] ring-2 ring-primary/20"
                                            )}
                                            onClick={(e) => {
                                                if ((e.target as HTMLElement).closest('.action-btn')) return;
                                                if (isSelectionMode) {
                                                    toggleModuleSelection(module._id);
                                                    return;
                                                }
                                                navigate(`/modules/${module._id}`);
                                            }}
                                        >
                                            {isSelectionMode && (
                                                <div className="absolute top-4 right-10 z-20">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-black focus:ring-0 cursor-pointer accent-black scale-125"
                                                        checked={selectedModules.includes(module._id)}
                                                        readOnly
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex justify-between items-start mb-2 group/module-title">
                                                    <div className="flex items-center gap-2 max-w-[85%]">
                                                        <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors text-sm">
                                                            {module.name}
                                                        </h3>
                                                    </div>
                                                    {/* Status Badge */}
                                                    {module.isPaid ? (
                                                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md shadow-sm" title="Paid Module">
                                                            <span className="text-[10px] font-extrabold uppercase tracking-wide">Paid</span>
                                                            <DollarSign className="h-3 w-3" />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200" title="Free Module">
                                                            <span className="text-[10px] font-bold uppercase tracking-wide">Free</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 action-btn">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEdit('module', module._id, module.name, module.isPaid, module.amount);
                                                        }}
                                                        className="p-1 px-2 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-all text-xs flex items-center gap-1 border border-transparent hover:border-slate-200"
                                                        title="Edit Module"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteModule(module._id, module.name);
                                                        }}
                                                        className="p-1 px-2 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 transition-colors text-xs flex items-center gap-1 border border-transparent hover:border-slate-200"
                                                        title="Delete Module"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Delete
                                                    </button>
                                                </div>

                                                <div className="space-y-1.5 mt-3">
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Registrations</span>
                                                        <span className="font-medium text-slate-700">{module.registrationCount}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Eligible</span>
                                                        <span className="font-medium text-green-600">{module.eligibleCount}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Status</span>
                                                        <div className="flex gap-2">
                                                            {module.certificateConfig?.serialFormat && module.certificateConfig.serialFormat.length > 0 && (
                                                                <span className="font-bold text-slate-700" title="Custom Serial Format Active">#{module.certificateConfig.serialCounter || 0}</span>
                                                            )}
                                                            <span className={`font-medium ${module.certificateConfig?.templateId ? 'text-blue-600' : 'text-amber-600'}`}>
                                                                {module.certificateConfig?.templateId ? 'Active' : 'Draft'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                                                <span>{new Date(module.createdAt).toLocaleDateString()}</span>
                                                <span className="text-black font-bold text-xs">View Details →</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Create Module Button (Inside Heading) */}
                                    <button
                                        onClick={() => openCreateModule(heading._id)}
                                        className="min-h-[170px] rounded-[14px] border-2 border-dashed border-[#E4EAF7] hover:border-primary/50 hover:bg-[#F5F8FF] flex flex-col items-center justify-center gap-2 transition-all duration-300 group"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-white border border-[#E4EAF7] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-primary transition-all">
                                            <Plus className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Create Module</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {headings.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <FolderPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-slate-900">No modules yet</h3>
                            <p className="text-slate-500 mb-6">Create a heading to get started</p>
                            <Button className="btn-premium-indigo" onClick={() => setCreateHeadingOpen(true)}>Create First Heading</Button>
                        </div>
                    )}
                </div>

                {/* Create Module Dialog */}
                <Dialog open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Module</DialogTitle>
                            <DialogDescription>Add a module to your section.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label>Module Name</Label>
                                <Input
                                    value={moduleName}
                                    onChange={e => setModuleName(e.target.value)}
                                    placeholder="e.g. Workshop Session 1"
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label className="block mb-2">Module Type</Label>
                                <RadioGroup value={isPaid ? "paid" : "free"} onValueChange={(val) => setIsPaid(val === "paid")} className="flex gap-4">
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                                        <RadioGroupItem value="free" id="r-free" />
                                        <Label htmlFor="r-free" className="cursor-pointer font-medium">Unpaid / Free</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                                        <RadioGroupItem value="paid" id="r-paid" />
                                        <div className="flex items-center gap-1 cursor-pointer">
                                            <Label htmlFor="r-paid" className="cursor-pointer font-medium">Paid</Label>
                                            <DollarSign className="h-3 w-3 text-green-600" />
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                            {isPaid && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                    <Label htmlFor="amount" className="text-sm font-semibold">Price (INR)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.00"
                                            className="pl-7"
                                            value={amount || ''}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button className="btn-premium-indigo" onClick={handleCreateModule} disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Module'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog (Unified for Heading and Module) */}
                <Dialog open={!!editMode} onOpenChange={(open) => !open && setEditMode(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit {editMode === 'heading' ? 'Heading' : 'Module'}</DialogTitle>
                            <DialogDescription>Update the name of your {editMode}.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={editItem?.name || ''}
                                    onChange={e => setEditItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    placeholder="Enter new name"
                                    className="mt-2"
                                />
                            </div>

                            {editMode === 'module' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="block mb-2">Module Type</Label>
                                        <RadioGroup
                                            value={editItem?.isPaid ? "paid" : "free"}
                                            onValueChange={(val) => setEditItem(prev => prev ? { ...prev, isPaid: val === "paid" } : null)}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                                                <RadioGroupItem value="free" id="edit-free" />
                                                <Label htmlFor="edit-free" className="cursor-pointer font-medium">Unpaid / Free</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                                                <RadioGroupItem value="paid" id="edit-paid" />
                                                <div className="flex items-center gap-1 cursor-pointer">
                                                    <Label htmlFor="edit-paid" className="cursor-pointer font-medium">Paid</Label>
                                                    <DollarSign className="h-3 w-3 text-green-600" />
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {editItem?.isPaid && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                            <Label htmlFor="edit-amount" className="text-sm font-semibold">Price (INR)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                <Input
                                                    id="edit-amount"
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="pl-7"
                                                    value={(editItem as any).amount || ''}
                                                    onChange={(e) => setEditItem({ ...editItem, amount: Number(e.target.value) } as any)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button className="btn-premium-indigo" onClick={handleUpdate} disabled={submitting}>
                                {submitting ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                < AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{deleteAction?.title}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {deleteAction?.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                            <Button
                                variant="destructive"
                                onClick={performDelete}
                                disabled={submitting}
                            >
                                {submitting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog >
            </div >
        </div >
    );
};

export default Modules;
