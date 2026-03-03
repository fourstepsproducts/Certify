import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Check, Search, LayoutTemplate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Template {
    _id: string;
    name: string;
    thumbnail?: string;
    category?: string;
    updatedAt: string;
}

interface TemplateSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    templates: Template[];
    selectedId: string | undefined;
    onSelect: (id: string) => void;
    onCreateNew: () => void;
}

export const TemplateSelectionDialog = ({
    open,
    onClose,
    templates,
    selectedId,
    onSelect,
    onCreateNew
}: TemplateSelectionDialogProps) => {
    const [search, setSearch] = useState("");

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Choose a Template</DialogTitle>
                            <DialogDescription className="mt-1">
                                Select a template for your certificates
                            </DialogDescription>
                        </div>
                        <Button onClick={onCreateNew} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create New
                        </Button>
                    </div>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search templates..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 bg-slate-50/30">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <LayoutTemplate className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="font-medium text-slate-900">No templates found</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-4">
                                {templates.length === 0
                                    ? "You haven't created any templates yet."
                                    : "No templates match your search."}
                            </p>
                            {templates.length === 0 && (
                                <Button onClick={onCreateNew} variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create your first template
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => {
                                const isSelected = selectedId === template._id;
                                return (
                                    <div
                                        key={template._id}
                                        onClick={() => onSelect(template._id)}
                                        className={`
                                            group relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden bg-white
                                            ${isSelected
                                                ? 'border-primary ring-2 ring-primary/20 shadow-md'
                                                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className="aspect-[1.414] w-full bg-slate-100 relative">
                                            {template.thumbnail ? (
                                                <img
                                                    src={template.thumbnail}
                                                    alt={template.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <LayoutTemplate className="h-12 w-12" />
                                                </div>
                                            )}

                                            {/* Selection Overlay */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                    <div className="bg-primary text-white rounded-full p-2 shadow-lg scale-100 transition-transform">
                                                        <Check className="h-6 w-6" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-sm truncate flex-1" title={template.name}>
                                                    {template.name}
                                                </h4>
                                                {template.category && (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                                        {template.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                Edited {new Date(template.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t bg-white">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onClose} disabled={!selectedId}>
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
