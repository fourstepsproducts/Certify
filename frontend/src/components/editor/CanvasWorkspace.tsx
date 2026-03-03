import { Button } from '@/components/ui/button';
import { Maximize2, Minus, Plus, Grid3X3 } from 'lucide-react';
import { useState } from 'react';

interface CanvasWorkspaceProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetViewport: () => void;
  onZoomToFit: () => void;
  hasSelection?: boolean;
}

export const CanvasWorkspace = ({
  canvasRef,
  zoom,
  onZoomChange,
  onResetViewport,
  onZoomToFit,
  hasSelection,
}: CanvasWorkspaceProps) => {
  const [showGrid, setShowGrid] = useState(false);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 50);
    onZoomChange(newZoom);
  };

  const handleResetZoom = () => {
    onZoomToFit();
  };

  return (
    <div id="canvas-workspace" className="flex-1 bg-[#e9ecef] overflow-auto relative flex flex-col scrollbar-hide">
      {/* High-visibility Square Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.12) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.12) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }} />

      {/* Canvas Container */}
      <div className="min-h-full min-w-full flex items-center justify-center p-8 lg:p-12">
        <div className="relative">
          {/* Raw Canvas Frame */}
          <div className="relative overflow-visible">
            {/* Canvas */}
            <div className="relative">
              <canvas ref={canvasRef} className="block" />

              {/* Grid Overlay - On top of canvas */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(100, 100, 100, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 100, 100, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 0'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {/* Grid Toggle */}
        <Button
          variant={showGrid ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowGrid(!showGrid)}
          className={`h-8 w-8 rounded-lg shadow-xl border transition-all ${showGrid
            ? 'btn-premium-indigo border-indigo-400 hover:shadow-indigo-500/20'
            : 'bg-[#141824]/80 backdrop-blur-md border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-[#141824]/80 backdrop-blur-md rounded-full shadow-xl border border-white/10 px-1.5 py-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="h-7 w-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={handleResetZoom}
            className="text-[10px] font-bold w-12 text-center text-white/80 hover:text-cosmic-cyan transition-colors tabular-nums uppercase tracking-tighter"
          >
            {zoom}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="h-7 w-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-20"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Fit to View */}
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomToFit}
          className="h-8 w-8 rounded-lg shadow-xl bg-[#141824]/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
          title="Fit to Screen"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
