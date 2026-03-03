import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface FieldMappingDialogProps {
    open: boolean;
    onClose: () => void;
    templateId: string;
    moduleId: string;
    existingMapping?: Record<string, string>;
    customFields: { id: string; label: string; }[];
    onSave: () => void;
}

interface TemplateTextObject {
    id: string; // The object ID in Fabric.js / SceneGraph
    text: string; // The content, e.g., "Student Name"
}

export const FieldMappingDialog = ({
    open,
    onClose,
    templateId,
    moduleId,
    existingMapping = {},
    customFields,
    onSave
}: FieldMappingDialogProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [templateFields, setTemplateFields] = useState<TemplateTextObject[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>(existingMapping);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [thumbnail, setThumbnail] = useState<string | null>(null);

    // Standard available fields for mapping
    const availableSourceFields = [
        { value: 'name', label: 'Full Name' },
        { value: 'email', label: 'Email Address' },
        { value: 'phoneNumber', label: 'Phone Number' },
        { value: 'submittedAt', label: 'Submission Date' },
        { value: 'date', label: 'Current Date' },
        ...customFields.map(f => ({ value: `custom.${f.id}`, label: f.label }))
    ];

    useEffect(() => {
        if (open && templateId) {
            fetchTemplateDetails();
        }
    }, [open, templateId]);

    // Update local mapping state when existingMapping prop changes
    useEffect(() => {
        setMapping(existingMapping || {});
    }, [existingMapping]);

    const fetchTemplateDetails = async () => {
        setLoading(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            const res = await fetch(`http://localhost:5000/api/templates/${templateId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to load template');

            const data = await res.json();
            if (data.thumbnail) {
                setThumbnail(data.thumbnail);
            }

            const texts: TemplateTextObject[] = [];

            // Helper to extract text objects from Scene Graph or Canvas Data
            const extractText = (objects: any[]) => {
                objects.forEach((obj: any) => {
                    if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
                        // Only add if it looks like a placeholder (optional heuristic, or just show all)
                        // For now, show all text objects so user can map anything
                        // Use a unique ID. Fabric objects usually have no ID unless set.
                        // If sceneGraph has generated IDs, use them. Otherwise, we might need a way to identify them.
                        // IMPORTANT: This assumes the template data has IDs via the new editor or we generate stable ones? 
                        // The new Editor should assign UUIDs to objects.

                        // Fallback: If no ID, we can't reliably map. 
                        // Let's assume the editor logic ensures IDs or we use index (risky).
                        // For this implementation, looking at 'id' property.
                        const objectId = obj.id || obj._id;
                        if (objectId) {
                            texts.push({ id: objectId, text: obj.text });
                        }
                    }
                    if (obj.objects) {
                        extractText(obj.objects); // Recursive for groups
                    }
                });
            };

            if (data.sceneGraph && data.sceneGraph.layers) {
                // New format
                data.sceneGraph.layers.forEach((layer: any) => {
                    if (layer.objects) extractText(layer.objects);
                });
            } else if (data.canvasData && data.canvasData.objects) {
                // Legacy format
                extractText(data.canvasData.objects);
            }

            setTemplateFields(texts);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load template fields",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;

            // We need to update the MODULE with this mapping
            const res = await fetch(`http://localhost:5000/api/modules/${moduleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    certificateConfig: {
                        templateId: templateId,
                        fieldMapping: mapping
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to save configuration');

            toast({
                title: "Success",
                description: "Certificate configuration saved"
            });
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save configuration",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configure Certificate Fields</DialogTitle>
                    <DialogDescription>
                        Map text fields from your template to user registration data.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <>
                            {thumbnail && (
                                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Template Preview</p>
                                    <img
                                        src={thumbnail}
                                        alt="Template Preview"
                                        className="w-full rounded-lg shadow-sm border border-slate-200"
                                    />
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium mb-3">Field Mappings</p>
                                {templateFields.length === 0 ? (
                                    <p className="text-center text-slate-500 bg-slate-50 p-4 rounded-lg border border-dashed">
                                        No text fields found in this template that can be mapped.
                                    </p>
                                ) : (
                                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                        {templateFields.map((field) => (
                                            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center p-3 border rounded-lg bg-white shadow-sm">
                                                <div className="text-sm overflow-hidden">
                                                    <span className="text-xs text-slate-500 font-medium mb-1 block">Template Text</span>
                                                    <div className="p-2 bg-slate-50 border rounded text-slate-700 truncate font-mono text-xs" title={field.text}>
                                                        {field.text}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-500 font-medium mb-1 block">Map to Data Field</Label>
                                                    <Select
                                                        value={mapping[field.id] || ''}
                                                        onValueChange={(val) => setMapping(prev => ({ ...prev, [field.id]: val }))}
                                                    >
                                                        <SelectTrigger className="bg-white h-9">
                                                            <SelectValue placeholder="Select data source..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none" className="text-slate-500 italic">-- Do Not Replace --</SelectItem>
                                                            {availableSourceFields.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
