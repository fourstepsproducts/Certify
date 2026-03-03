import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { renderTemplateElements } from '@/utils/templateRenderer';
import { sceneGraphConverter } from '@/utils/sceneGraphConverter';
import type { SceneGraph } from '@/types/sceneGraph';

interface TemplateThumbnailProps {
    sceneGraph: SceneGraph;
}

export const TemplateThumbnail = ({ sceneGraph }: TemplateThumbnailProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Convert Scene Graph to JSON
        const canvasData = sceneGraphConverter.sceneGraphToJson(sceneGraph);

        // Target thumbnail size
        const targetWidth = 320;
        const targetHeight = 240;

        // Source canvas dimensions from Scene Graph root
        const sourceWidth = sceneGraph.root.width || 800;
        const sourceHeight = sceneGraph.root.height || 600;

        // Calculate scale to fit within target size while maintaining aspect ratio
        const scaleX = targetWidth / sourceWidth;
        const scaleY = targetHeight / sourceHeight;
        const scale = Math.min(scaleX, scaleY);

        // Create thumbnail canvas
        const thumbCanvas = new FabricCanvas(canvasRef.current, {
            width: targetWidth,
            height: targetHeight,
            selection: false,
            renderOnAddRemove: true,
        });

        // Use shared rendering function with dynamic scale
        renderTemplateElements({
            canvas: thumbCanvas,
            templateData: canvasData,
            scale: scale,
            interactive: false,
        });

        return () => {
            thumbCanvas.dispose();
        };
    }, [sceneGraph]);

    return (
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
    );
};
