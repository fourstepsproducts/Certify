import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { renderTemplateElements } from '@/utils/templateRenderer';
import { sceneGraphConverter } from '@/utils/sceneGraphConverter';
import type { SceneGraph } from '@/types/sceneGraph';

interface TemplateMiniPreviewProps {
    sceneGraph: SceneGraph;
}

const stripBackgroundRectsFromSceneGraph = (sceneGraph: any) => {
    const clone = JSON.parse(JSON.stringify(sceneGraph));

    // Force transparent root
    if (clone.root) {
        clone.root.backgroundColor = 'transparent';
        clone.root.background = undefined;
    }

    const W = clone.root?.width ?? 0;
    const H = clone.root?.height ?? 0;

    const cleanNode = (node: any): any => {
        if (!node) return node;

        if (node.type === 'rect') {
            const w = node.width ?? 0;
            const h = node.height ?? 0;
            const left = node.left ?? 0;
            const top = node.top ?? 0;

            const isFullBg =
                w >= W * 0.9 &&
                h >= H * 0.9 &&
                left <= 5 &&
                top <= 5;

            if (isFullBg) return null;
        }

        if (Array.isArray(node.children)) {
            node.children = node.children
                .map(cleanNode)
                .filter(Boolean);
        }

        return node;
    };

    clone.root = cleanNode(clone.root);

    // 🔥 CRITICAL: also remove Fabric-level backgrounds in metadata
    delete clone.background;
    delete clone.backgroundImage;

    return clone;
};

export const TemplateMiniPreview = ({ sceneGraph }: TemplateMiniPreviewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<FabricCanvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current || !sceneGraph || !sceneGraph.root) return;

        const container = containerRef.current;
        const dpr = window.devicePixelRatio || 1;

        const render = (width: number, height: number) => {
            if (fabricRef.current) {
                fabricRef.current.dispose();
            }

            // Data-level fix: Use precise background stripping
            const cleanedGraph = stripBackgroundRectsFromSceneGraph(sceneGraph);
            const canvasData = sceneGraphConverter.sceneGraphToJson(cleanedGraph);

            const sourceWidth = cleanedGraph.root.width || 800;
            const sourceHeight = cleanedGraph.root.height || 600;

            const miniCanvas = new FabricCanvas(canvasRef.current, {
                width: width * dpr,
                height: height * dpr,
                backgroundColor: 'transparent',
                selection: false,
                enableRetinaScaling: false,
            });

            fabricRef.current = miniCanvas;

            // Fix the scaling logic to use uniform fill scaling (Cover)
            const scale = Math.max(
                (width * dpr) / sourceWidth,
                (height * dpr) / sourceHeight
            );

            miniCanvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);

            renderTemplateElements({
                canvas: miniCanvas,
                templateData: canvasData,
                scale: 1,
                interactive: false,
                skipResize: true,
            } as any);

            // 🔥 FINAL OVERRIDE: Kill Fabric’s internal background AFTER rendering
            // This prevents renderTemplateElements from putting the black back
            miniCanvas.backgroundColor = 'transparent';
            miniCanvas.backgroundImage = undefined;
            miniCanvas.renderAll();
        };

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    render(width, height);
                }
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (fabricRef.current) {
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
        };
    }, [sceneGraph]);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full bg-white overflow-hidden">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />
        </div>
    );
};
