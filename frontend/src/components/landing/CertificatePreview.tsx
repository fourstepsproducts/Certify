import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

interface CertificatePreviewProps {
    canvasData: any;
}

export const CertificatePreview = ({ canvasData }: CertificatePreviewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !canvasData) return;

        // Initialize Fabric canvas if not already initialized
        if (!fabricCanvasRef.current) {
            fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
                width: canvasData.width || 800,
                height: canvasData.height || 600,
                backgroundColor: canvasData.backgroundColor || '#FFFFFF',
                selection: false, // Disable selection for preview
            });
        }

        const canvas = fabricCanvasRef.current;

        // Clear existing objects
        canvas.clear();

        // Set background color directly (Fabric v6)
        canvas.backgroundColor = canvasData.backgroundColor || '#FFFFFF';

        // Load the canvas data
        // Load the canvas data
        let loadableData = canvasData;

        // Transform custom scene graph to Fabric JSON if needed
        if (canvasData.root && canvasData.root.children) {
            loadableData = {
                version: '5.3.0',
                objects: canvasData.root.children,
                width: canvasData.root.width,
                height: canvasData.root.height,
                background: canvasData.root.backgroundColor
            };
        }

        if (loadableData.objects && Array.isArray(loadableData.objects)) {
            // Load objects from JSON using Fabric v6 API
            canvas.loadFromJSON({ ...loadableData, version: '6.0.0' }).then(() => {
                // Disable selection and interaction for all objects
                canvas.getObjects().forEach((obj) => {
                    obj.set({
                        selectable: false,
                        evented: false,
                    });
                });

                // Responsive Scale to Fit
                const container = canvasRef.current?.parentElement;
                if (container) {
                    const padding = 20;
                    const availableWidth = container.clientWidth - padding;
                    const scale = availableWidth / (canvasData.width || 2000);

                    canvas.setDimensions({
                        width: (canvasData.width || 2000) * scale,
                        height: (canvasData.height || 1500) * scale,
                    });
                    canvas.setZoom(scale);
                }

                canvas.renderAll();
            });
        }

        // Cleanup function
        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
                fabricCanvasRef.current = null;
            }
        };
    }, [canvasData]);

    return (
        <div className="certificate-preview">
            <canvas ref={canvasRef} />
        </div>
    );
};
