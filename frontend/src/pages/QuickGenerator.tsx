import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificateTemplates, templateCategories } from '@/data/templatesSceneGraph';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, GraduationCap, Trophy, CheckCircle, Medal } from 'lucide-react';
import { TemplateThumbnail } from '@/components/landing/TemplateThumbnail';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

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

export default function QuickGenerator() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [allTemplates, setAllTemplates] = useState<any[]>(certificateTemplates);

    useEffect(() => {
        const fetchPublicTemplates = async () => {
            try {
                const res = await fetch('/api/templates/public');
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map((t: any) => ({
                        ...t,
                        id: t._id,
                        preview: t.thumbnail || t.preview, // Map thumbnail to preview if needed
                        // Ensure sceneGraph or canvasData is present if needed for Thumbnail component
                    }));

                    // If we have system templates in DB, use ONLY them (allows Admin to manage/delete)
                    // If DB is empty, fall back to hardcoded templates
                    if (mapped.length > 0) {
                        setAllTemplates(mapped);
                    } else {
                        setAllTemplates(certificateTemplates);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch public templates", err);
            }
        };
        fetchPublicTemplates();
    }, []);

    const filteredTemplates = activeCategory === 'all'
        ? allTemplates
        : allTemplates.filter(t => t.category === activeCategory);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 container py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-fade-up">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/20 text-primary">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Quick Create
                            </Badge>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                                Select a Template
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Choose a design to get started. You can customize the details in the next step.
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap justify-center gap-2 mb-10">
                            <Button
                                variant={activeCategory === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveCategory('all')}
                                className="rounded-full"
                            >
                                All
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => {
                                const Icon = categoryIcons[template.category] || Trophy;
                                return (
                                    <div
                                        key={template.id}
                                        className="group relative border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-all hover:shadow-xl bg-white"
                                        onClick={() => navigate(`/editor?template=${template.id}`)}
                                    >
                                        <div className="aspect-[1.414/1] bg-white relative">
                                            {template.preview ? (
                                                <img src={template.preview} alt={template.name} className="object-contain w-full h-full" />
                                            ) : (
                                                <TemplateThumbnail sceneGraph={template.sceneGraph} />
                                            )}
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="secondary" className="gap-2 pointer-events-none">
                                                    Select
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold mb-1">{template.name}</h3>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] uppercase font-bold ${categoryColors[template.category] || ''}`}
                                            >
                                                <Icon className="h-3 w-3 mr-1" />
                                                {template.category}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
