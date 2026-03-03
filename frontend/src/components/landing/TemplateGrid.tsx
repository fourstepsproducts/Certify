import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { certificateTemplates, templateCategories } from '@/data/templatesSceneGraph';
import { ArrowRight, Award, CheckCircle, GraduationCap, Medal, Trophy, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { TemplateThumbnail } from './TemplateThumbnail';

const categoryIcons = {
  // ... (unchanged)
  participation: GraduationCap,
  achievement: Trophy,
  completion: CheckCircle,
  award: Medal,
};

const categoryColors = {
  // ... (unchanged)
  participation: 'bg-category-participation/10 text-category-participation border-category-participation/20',
  achievement: 'bg-category-achievement/10 text-category-achievement border-category-achievement/20',
  completion: 'bg-category-completion/10 text-category-completion border-category-completion/20',
  award: 'bg-category-award/10 text-category-award border-category-award/20',
};

export const TemplateGrid = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [myTemplates, setMyTemplates] = useState<any[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      // 1. Fetch User Templates
      if (isAuthenticated && user?.token) {
        try {
          const response = await fetch('/api/templates', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setMyTemplates(data);
          }
        } catch (error) {
          console.error("Failed to fetch user templates", error);
        }
      }

      // 2. Fetch Public/System Templates
      try {
        const response = await fetch('/api/templates/public');
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((t: any) => ({
            ...t,
            id: t._id,
            preview: t.thumbnail,
            sceneGraph: t.sceneGraph || t.canvasData
          }));
          setPublicTemplates(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch public templates", error);
      }
    };

    fetchTemplates();
  }, [isAuthenticated, user?.token]);

  // Combined system templates (Hardcoded + DB Uploads)
  const combinedSystemTemplates = [...publicTemplates];

  // If no DB templates, fall back to hardcoded
  if (combinedSystemTemplates.length === 0) {
    combinedSystemTemplates.push(...certificateTemplates);
  }

  // Scroll to my templates section when returning from editor
  useEffect(() => {
    if (myTemplates.length > 0) {
      const timer = setTimeout(() => {
        const templatesSection = document.getElementById('templates');
        if (templatesSection) {
          templatesSection.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [myTemplates.length]);

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        setMyTemplates(prev => prev.filter(t => t._id !== id));
        toast.success("Template deleted");
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Delete error", error);
      toast.error("Error deleting template");
    }
  };

  const filteredTemplates = activeCategory === 'all'
    ? combinedSystemTemplates
    : combinedSystemTemplates.filter(t => t.category === activeCategory);

  // Apply plan limit
  const visibleTemplates = user?.activePlan === 'Free Demo'
    ? filteredTemplates.slice(0, 4) // Show 4 for free demo
    : filteredTemplates;

  return (
    <section id="templates" className="py-20 lg:py-28">
      <div className="container">

        {/* My Templates Section */}
        {isAuthenticated && myTemplates.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/20 text-primary">
                <Award className="h-4 w-4 mr-2" />
                Personal Library
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                My Templates
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myTemplates.map((template, index) => (
                <div
                  key={template._id}
                  className="card-template group animate-fade-up relative"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden border rounded-xl">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-4 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground font-medium">No Preview</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/90 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <Link to={`/editor?userTemplate=${template._id}`}>
                        <Button variant="secondary" size="sm" className="gap-2 w-32 shadow-md">
                          Edit Design
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2 w-32 shadow-md"
                        onClick={(e) => handleDeleteTemplate(e, template._id)}
                      >
                        Delete
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 truncate" title={template.name}>
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Last edited {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-12 border-t" />
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-12">
          {myTemplates.length > 0 ? (
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white/90">
              Your <span className="text-cosmic-gradient">Creations</span>
            </h2>
          ) : (
            <>
              <div className="cosmic-chip mb-4 animate-fade-up">
                <Award className="h-4 w-4 text-cosmic-cyan" />
                <span className="text-white/80">Premium Collection</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white/90">
                Choose Your <span className="text-cosmic-gradient">Certificate Style</span>
              </h2>
              <p className="text-lg text-muted-cosmic max-w-2xl mx-auto">
                Start with a professionally designed template and customize it to match your brand.
              </p>
            </>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {templateCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-5 transition-all duration-300 ${activeCategory === cat.id ? 'btn-cosmic' : 'btn-cosmic-secondary'}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleTemplates.map((template, index) => {
            const Icon = categoryIcons[template.category];
            return (
              <Link
                key={template.id}
                to={`/editor?template=${template.id}`}
                className="cosmic-card group animate-fade-up overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Template Preview */}
                <div className="aspect-[1.414/1] bg-white/5 flex items-center justify-center relative overflow-hidden">
                  {/* Actual canvas thumbnail */}
                  {template.preview ? (
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="absolute inset-0 w-full h-full object-contain p-2"
                    />
                  ) : (
                    <TemplateThumbnail sceneGraph={template.sceneGraph} />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="secondary" size="sm" className="gap-2 shadow-2xl btn-cosmic">
                      Use Template
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white/90 mb-1 truncate">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold tracking-widest border-none p-0 h-auto ${categoryColors[template.category]} bg-transparent opacity-80`}
                    >
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="btn-cosmic-secondary group px-8"
            onClick={() => {
              if (user?.activePlan === 'Free Demo') {
                toast.error('Upgrade to Access', {
                  description: 'Upgrade to Pro or Enterprise to view all 140+ templates.'
                });
              } else {
                toast.success('Browsing all templates...');
              }
            }}
          >
            View All Templates
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
