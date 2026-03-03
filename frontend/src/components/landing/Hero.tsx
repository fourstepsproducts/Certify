import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { AIGenerator } from '@/components/landing/AIGenerator';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-32 lg:py-52 min-h-[600px] flex items-center">
      {/* 1. Cinematic Centerpiece Asteroid Backdrop */}
      <img
        src="/asteroid1-removebg-preview.png"
        alt="Cinematic Asteroid"
        className="absolute top-1/2 left-1/2 
                   -translate-x-1/2 -translate-y-1/2 
                   w-[810px] md:w-[990px]
                   opacity-12
                   brightness-65
                   contrast-110
                   pointer-events-none
                   z-0"
      />

      {/* 2. Controlled Cinematic Dark Overlays (Top, Middle) */}
      {/* TOP */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(circle,rgba(0,0,0,0.6),transparent_70%)] blur-3xl z-[1] pointer-events-none"></div>

      {/* MIDDLE */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none">
        <div className="w-[800px] h-[500px] bg-black/50 blur-3xl rounded-full"></div>
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center relative">
          <div className="relative z-10">
            {/* Badge */}
            <div className="cosmic-chip mb-8 animate-fade-up">
              <Sparkles className="h-4 w-4 text-cosmic-cyan" />
              <span className="text-white/80">Create stunning certificates in minutes</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 animate-fade-up text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)]" style={{ animationDelay: '0.1s' }}>
              Design Beautiful{' '}<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Certificates</span>{' '}
              Online
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-cosmic max-w-2xl mx-auto mb-10 animate-fade-up font-medium" style={{ animationDelay: '0.2s' }}>
              Create professional certificates for achievements, participation, and awards.
              Choose from stunning templates and customize every detail.
            </p>

            {/* AI Generator */}
            <AIGenerator />

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/editor">
                <Button
                  size="xl"
                  className="btn-cosmic group rounded-2xl h-14 px-8 text-base"
                >
                  Create Certificate
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/quick-create">
                <Button
                  variant="outline"
                  size="xl"
                  className="btn-cosmic-secondary rounded-2xl h-14 px-8 text-base"
                >
                  Browse Templates
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xs font-medium text-primary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-medium text-foreground">10,000+</span> certificates created
              </div>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
};
