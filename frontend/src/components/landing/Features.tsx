import { Badge } from '@/components/ui/badge';
import {
  Download,
  Layers,
  MousePointer2,
  Palette,
  Share2,
  Type,
  Upload,
  Wand2,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: MousePointer2,
    title: 'Drag & Drop Editor',
    description: 'Intuitive canvas editor with easy-to-use drag and drop functionality.',
  },
  {
    icon: Type,
    title: 'Rich Text Editing',
    description: 'Beautiful typography with custom fonts, sizes, and formatting options.',
  },
  {
    icon: Palette,
    title: 'Custom Colors',
    description: 'Full color customization for backgrounds, text, and design elements.',
  },
  {
    icon: Layers,
    title: 'Layer Management',
    description: 'Organize elements with bring forward, send backward, and layer controls.',
  },
  {
    icon: Upload,
    title: 'Image Uploads',
    description: 'Add logos, signatures, and images to personalize your certificates.',
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Download as high-quality PDF or PNG for print or digital use.',
  },
  {
    icon: Wand2,
    title: 'Smart Templates',
    description: 'Start with professionally designed templates and customize easily.',
  },
  {
    icon: Share2,
    title: 'Share & Collaborate',
    description: 'Share designs with your team or generate shareable links.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-28 lg:py-40">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="cosmic-chip mb-4 animate-fade-up">
            <Zap className="h-4 w-4 text-cosmic-cyan" />
            <span className="text-white/80">Everything You Need</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white/90">
            Design Without <span className="text-cosmic-gradient">Boundaries</span>
          </h2>
          <p className="text-lg text-muted-cosmic max-w-2xl mx-auto">
            Powerful tools designed for simplicity. Create professional certificates without any design experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="cosmic-card p-6 group animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-5 cosmic-icon">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white/90">{feature.title}</h3>
              <p className="text-sm text-muted-cosmic leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
