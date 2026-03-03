import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Lock, Search, Filter, Layers, Layout, Grid3X3 } from 'lucide-react';
import { icons, IconItem } from '@/data/icons';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface IconsPanelProps {
    onAddImage: (file: File) => void;
}

export const IconsPanel = ({ onAddImage }: IconsPanelProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [styleFilter, setStyleFilter] = useState<'all' | 'solid' | 'outline'>('all');
    const [visibleCount, setVisibleCount] = useState(24);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const isEnterprise = user?.activePlan?.toLowerCase() === 'enterprise';

    // Memoized filter logic for performance
    const filteredIcons = useMemo(() => {
        return icons.filter(icon => {
            const matchesSearch = searchTerm === '' ||
                icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                icon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStyle = styleFilter === 'all' || icon.style === styleFilter;

            return matchesSearch && matchesStyle;
        });
    }, [searchTerm, styleFilter]);

    // Grouping logic for the vast library
    const categories = useMemo(() => {
        const grouped = filteredIcons.reduce((acc, item) => {
            const cat = item.category;
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {} as Record<string, IconItem[]>);

        return Object.entries(grouped).map(([category, items]) => ({
            category,
            items: items.slice(0, visibleCount) // Simple lazy loading
        })).sort((a, b) => a.category === 'Simple' ? -1 : 1);
    }, [filteredIcons, visibleCount]);

    const handleIconClick = async (icon: IconItem) => {
        const isLocked = icon.premium && !isEnterprise;

        if (isLocked) {
            toast.error('Enterprise Plan Required', {
                description: `Professional icons like "${icon.name}" are only available on our Enterprise plan.`
            });
            return;
        }

        try {
            const res = await fetch(icon.fabricObject.src);
            const blob = await res.blob();
            const file = new File([blob], `${icon.name}.svg`, { type: 'image/svg+xml' });
            onAddImage(file);
        } catch (error) {
            console.error('Error adding icon:', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Search and Filters Header */}
            <div className="px-5 pt-6 pb-4 border-b border-border/50 sticky top-0 bg-background z-10 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-lg">Icons Library</h3>
                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
                        <Button
                            variant={styleFilter === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2 text-[10px] font-bold uppercase"
                            onClick={() => setStyleFilter('all')}
                        >
                            All
                        </Button>
                        <Button
                            variant={styleFilter === 'outline' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2 text-[10px] font-bold uppercase"
                            onClick={() => setStyleFilter('outline')}
                        >
                            Outline
                        </Button>
                        <Button
                            variant={styleFilter === 'solid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2 text-[10px] font-bold uppercase"
                            onClick={() => setStyleFilter('solid')}
                        >
                            Solid
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search 100+ icons (star, medal, award...)"
                        className="pl-9 h-11 bg-muted/20 border-transparent focus-visible:ring-primary/20 rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable Gallery */}
            <div
                className="flex-1 overflow-y-auto px-5 py-6 space-y-10 custom-scrollbar"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
                        setVisibleCount(prev => prev + 12); // Lazy load on scroll
                    }
                }}
            >
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold">No icons found</p>
                            <p className="text-xs text-muted-foreground">Try a different keyword or style</p>
                        </div>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category.category}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-[11px] text-muted-foreground uppercase tracking-[0.1em] px-1">
                                    {category.category} Icons
                                    {category.category === 'Professional' && (
                                        <span className="ml-2 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-black">ENTERPRISE</span>
                                    )}
                                </h4>
                            </div>

                            {category.category === 'Professional' && !isEnterprise && (
                                <div className="mb-4 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-3 w-3 text-amber-600" />
                                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                                            Enterprise Plan Required
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold bg-amber-500 text-white hover:bg-amber-600 px-2 rounded-lg">
                                        UPGRADE
                                    </Button>
                                </div>
                            )}

                            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                                {category.items.map((icon) => {
                                    const isLocked = icon.premium && !isEnterprise;
                                    return (
                                        <button
                                            key={icon.id}
                                            onClick={() => handleIconClick(icon)}
                                            className={`aspect-square rounded-2xl border transition-all p-3 flex items-center justify-center group relative overflow-hidden ${isLocked
                                                ? 'bg-muted/5 border-transparent grayscale cursor-not-allowed opacity-60'
                                                : 'bg-muted/30 border-transparent hover:border-primary/40 hover:bg-white hover:shadow-xl hover:shadow-primary/5 active:scale-95'
                                                }`}
                                            title={isLocked ? `Locked: ${icon.name} (Enterprise)` : icon.name}
                                        >
                                            <div className={`w-full h-full flex items-center justify-center transition-transform duration-300 ${isLocked ? 'blur-[1.5px]' : 'group-hover:scale-110'}`}>
                                                <img
                                                    src={icon.fabricObject.src}
                                                    alt={icon.name}
                                                    className="w-full h-full object-contain pointer-events-none"
                                                    style={{ filter: isLocked ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
                                                />
                                            </div>

                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[0.5px]">
                                                    <Lock className="h-3 w-3 text-muted-foreground/40" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                <div className="pt-4 pb-8 space-y-4">
                    <Separator className="opacity-50" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed text-center px-4">
                        Search through our library of 50+ professional icons.
                        <strong> Simple</strong> icons are free.
                        <strong> Professional</strong> icons (Solid/Hybrid) require Enterprise.
                    </p>
                </div>
            </div>
        </div>
    );
};
