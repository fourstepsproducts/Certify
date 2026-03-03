import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { certificateTemplates, templateCategories } from '@/data/templatesSceneGraph';
import { TemplateThumbnail } from '@/components/landing/TemplateThumbnail';
import { Trophy, CheckCircle, GraduationCap, Medal, ArrowRight, X } from 'lucide-react';

const categoryIcons: Record<string, any> = {
    participation: GraduationCap,
    achievement: Trophy,
    completion: CheckCircle,
    award: Medal,
};

const categoryColors: Record<string, string> = {
    participation: 'bg-blue-100 text-blue-700 border-blue-200',
    achievement: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completion: 'bg-green-100 text-green-700 border-green-200',
    award: 'bg-purple-100 text-purple-700 border-purple-200',
};

interface TemplateSelectorProps {
    onSelect: (templateId: string) => void;
    onClose?: () => void;
}

export const TemplateSelector = ({ onSelect, onClose }: TemplateSelectorProps) => {
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const filteredTemplates = activeCategory === 'all'
        ? certificateTemplates
        : certificateTemplates.filter(t => t.category === activeCategory);

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Select a Template</h2>
                        <p className="text-muted-foreground">Choose a professional starting point for your certificate</p>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="p-4 border-b bg-muted/30 flex flex-wrap gap-2">
                    <Button
                        variant={activeCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory('all')}
                        className="rounded-full"
                    >
                        All Templates
                    </Button>
                    {templateCategories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveCategory(cat.id)}
                            className="rounded-full"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template, index) => {
                            const Icon = categoryIcons[template.category] || Trophy;
                            return (
                                <div
                                    key={template.id}
                                    className="group relative border-none rounded-lg overflow-hidden cursor-pointer bg-[#F3E8FF] hover:bg-[#A855F7] transition-all duration-300 shadow-md hover:shadow-xl"
                                    onClick={() => onSelect(template.id)}
                                >
                                    <div className="aspect-[1.414/1] bg-white rounded-lg m-3 border border-border group-hover:border-white/20 transition-all overflow-hidden relative shadow-sm">
                                        {template.preview ? (
                                            <img
                                                src={template.preview}
                                                alt={template.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <TemplateThumbnail sceneGraph={template.sceneGraph} />
                                        )}
                                        <div className="absolute inset-0 bg-[#9333EA]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="secondary" className="gap-2 pointer-events-none bg-white text-[#9333EA] hover:bg-white">
                                                Use Template
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-4 bg-transparent">
                                        <h3 className="font-bold mb-2 text-[#9333EA] group-hover:text-white transition-colors">{template.name}</h3>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] uppercase font-bold border-none ${categoryColors[template.category] || 'bg-white/50 text-[#9333EA]'
                                                } group-hover:bg-white group-hover:text-[#A855F7] transition-colors`}
                                        >
                                            <Icon className="h-3 w-3 mr-1" />
                                            {template.category === 'achievement' ? 'Acheivement' : template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                        All templates feature <b>Smart Zones</b> to ensure perfect alignment and professional results.
                    </p>
                </div>
            </div>
        </div>
    );
};
