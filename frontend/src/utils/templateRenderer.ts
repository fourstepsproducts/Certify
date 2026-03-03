import { Canvas as FabricCanvas, Rect, Circle, Textbox, Polygon, Line, FabricImage, Path, Group } from 'fabric';
import type { SceneGraph, SceneNode, RectNode, CircleNode, TextNode, TextboxNode, PolygonNode, LineNode, ImageNode, PathNode, DecorativeCurveNode, GroupNode } from '@/types/sceneGraph';
import { sanitizeUrl } from './url';

interface RenderSceneGraphOptions {
    canvas: FabricCanvas;
    sceneGraph: SceneGraph;
    scale?: number;
    interactive?: boolean;
}

/**
 * Render a Scene Graph to Fabric.js Canvas
 * 
 * This replaces the old renderTemplateElements function and works
 * directly with Scene Graph structure.
 */
export const renderSceneGraph = ({
    canvas,
    sceneGraph,
    scale = 1,
    interactive = true,
    skipResize = false
}: RenderSceneGraphOptions & { skipResize?: boolean }) => {
    const { root } = sceneGraph;

    // 1. Set canvas dimensions first
    if (!skipResize && root.width && root.height) {
        canvas.setDimensions({
            width: root.width * scale,
            height: root.height * scale,
        });
    }

    // 2. Clear previous state and set background color
    canvas.backgroundImage = null;
    if (root.backgroundColor && root.backgroundColor !== 'transparent') {
        canvas.backgroundColor = root.backgroundColor;
    } else {
        canvas.backgroundColor = 'transparent';
    }

    // Common properties for all objects
    const commonProps = {
        selectable: interactive,
        evented: interactive,
        hasControls: interactive,
        hasBorders: interactive,
        lockMovementX: !interactive,
        lockMovementY: !interactive,
    };

    // Render all children
    if (root.children) {
        root.children.forEach((node) => {
            const fabricObject = renderNode(node, scale, commonProps, canvas);
            if (fabricObject) {
                canvas.add(fabricObject);
            }
        });
    }

    canvas.renderAll();
};

/**
 * Render a single scene node to a Fabric.js object
 */
function renderNode(node: SceneNode, scale: number, commonProps: any, canvas: FabricCanvas | null): any {
    if (!node.visible) return null;

    let object: any = null;

    switch (node.type) {
        case 'group':
            object = renderGroupNode(node as GroupNode, scale, commonProps, canvas);
            break;

        case 'rect':
            object = renderRectNode(node as RectNode, scale, commonProps);
            break;

        case 'circle':
            object = renderCircleNode(node as CircleNode, scale, commonProps);
            break;

        case 'polygon':
            object = renderPolygonNode(node as PolygonNode, scale, commonProps);
            break;

        case 'line':
            object = renderLineNode(node as LineNode, scale, commonProps);
            break;

        case 'text':
        case 'textbox':
            object = renderTextNode(node as TextNode | TextboxNode, scale, commonProps);
            break;

        case 'image':
            // Images are handled asynchronously
            if (canvas) {
                renderImageNode(node as ImageNode, scale, commonProps, canvas);
            }
            return null;

        case 'path':
            object = renderPathNode(node as PathNode, scale, commonProps);
            break;

        case 'decorativeCurve':
            object = renderDecorativeCurveNode(node as DecorativeCurveNode, scale, commonProps);
            break;

        default:
            console.warn(`Unknown node type: ${(node as any).type}`);
            return null;
    }

    if (object) {
        // Apply common node properties
        object.set({
            opacity: node.opacity,
            selectable: node.selectable && commonProps.selectable,
            evented: node.selectable && commonProps.evented,
            perPixelTargetFind: false,
        });

        // Apply Smart Zone Constraints
        if (node.role) {
            object.set('role', node.role);

            // Even if it's a Smart Zone, we now allow movement in the editor
            object.set({
                lockMovementX: false,
                lockMovementY: false,
                lockRotation: false,
                lockScalingX: false,
                lockScalingY: false,
                hasControls: true
            });

            // Store constraints for reference only
            if (node.layoutConstraint) {
                object.set('layoutConstraint', node.layoutConstraint);
            }
        }

        // Store node ID for reference
        object.set({
            nodeId: node.id,
            id: node.id,
            _id: node.id
        });

        if (node.name) {
            object.set('name', node.name);
        }
    }

    return object;
}

/**
 * Render Group Node
 */
function renderGroupNode(node: GroupNode, scale: number, commonProps: any, canvas: FabricCanvas | null): Group | null {
    if (!node.children || node.children.length === 0) return null;

    const groupObjects: any[] = [];

    // Render all children
    node.children.forEach((childNode) => {
        const obj = renderNode(childNode, scale, commonProps, canvas);
        if (obj) {
            groupObjects.push(obj);
        }
    });

    if (groupObjects.length === 0) return null;

    const group = new Group(groupObjects, {
        ...commonProps,
        // Do not force left/top! Fabric calculates group position based on children.
        // If we set left: 0 (from node.transform), we might shift the group if children are not at 0,0.
        // left: node.transform.x * scale, - REMOVED
        // top: node.transform.y * scale, - REMOVED
        scaleX: node.transform.scaleX * scale,
        scaleY: node.transform.scaleY * scale,
        angle: node.transform.rotation,
        subTargetCheck: true, // CRITICAL: Allow selecting individual elements inside the group (Figma-style)
        interactive: true, // Allow interaction with group children
    });

    return group;
}

// ... (renderRectNode, renderCircleNode etc remain unchanged)

// We need to fetch renderImageNode down here
/**
 * Render Image Node (async)
 */
function renderImageNode(node: ImageNode, scale: number, commonProps: any, canvas: FabricCanvas): void {
    if (!node.src) return;

    const sanitizedSrc = sanitizeUrl(node.src);
    const loadId = (canvas as any).currentLoadId;

    FabricImage.fromURL(sanitizedSrc, {
        crossOrigin: (node as any).crossOrigin || 'anonymous',
    }).then((img) => {
        // Race condition check: Only add if this is still the active load
        if (loadId !== undefined && (canvas as any).currentLoadId !== loadId) {
            return;
        }

        // Calculate scale to fit the intended logical dimensions
        const scaleX = (node.width / (img.width || 1)) * node.transform.scaleX * scale;
        const scaleY = (node.height / (img.height || 1)) * node.transform.scaleY * scale;

        // Is this a background-type object? (Option 2 Architecture)
        const isBackground = node.role === 'decoration' || node.role === 'border' || (node.role as string) === 'background' || (node.role as string) === 'certificate_base';

        if (isBackground) {
            img.set({
                left: node.transform.x * scale,
                top: node.transform.y * scale,
                scaleX: scaleX,
                scaleY: scaleY,
                angle: node.transform.rotation,
                opacity: node.opacity,
                selectable: false,
                evented: false,
                name: node.name || 'Background Image'
            });

            canvas.backgroundImage = img;
            canvas.requestRenderAll();
        } else {
            // Normal interactive image object
            img.set({
                ...commonProps,
                left: node.transform.x * scale,
                top: node.transform.y * scale,
                scaleX: scaleX,
                scaleY: scaleY,
                angle: node.transform.rotation,
                opacity: node.opacity,
                selectable: node.selectable && commonProps.selectable,
                evented: node.selectable && commonProps.evented,
                lockMovementX: node.locked,
                lockMovementY: node.locked,
                lockRotation: node.locked,
                lockScalingX: node.locked,
                lockScalingY: node.locked,
                imageSmoothing: true,
            });

            img.set({
                nodeId: node.id,
                id: node.id,
                _id: node.id,
                name: node.name || 'Image'
            });

            canvas.add(img);
            canvas.requestRenderAll();
        }
    }).catch((err) => {
        console.warn(`Failed to load image: ${node.src}`, err);
    });
}
/**
 * Render Rectangle Node
 */
function renderRectNode(node: RectNode, scale: number, commonProps: any): Rect {
    return new Rect({
        ...commonProps,
        left: node.transform.x * scale,
        top: node.transform.y * scale,
        width: node.width * scale,
        height: node.height * scale,
        fill: node.fill,
        stroke: node.stroke,
        strokeWidth: node.strokeWidth ? node.strokeWidth * scale : 0,
        rx: node.cornerRadius ? node.cornerRadius * scale : 0,
        ry: node.cornerRadius ? node.cornerRadius * scale : 0,
        scaleX: node.transform.scaleX,
        scaleY: node.transform.scaleY,
        angle: node.transform.rotation,
    });
}

/**
 * Render Circle Node
 */
function renderCircleNode(node: CircleNode, scale: number, commonProps: any): Circle {
    return new Circle({
        ...commonProps,
        left: node.transform.x * scale,
        top: node.transform.y * scale,
        radius: node.radius * scale,
        fill: node.fill,
        stroke: node.stroke,
        strokeWidth: node.strokeWidth ? node.strokeWidth * scale : 0,
        scaleX: node.transform.scaleX,
        scaleY: node.transform.scaleY,
        angle: node.transform.rotation,
    });
}

/**
 * Render Polygon Node
 */
function renderPolygonNode(node: PolygonNode, scale: number, commonProps: any): Polygon {
    const scaledPoints = node.points.map((p) => ({
        x: p.x * scale,
        y: p.y * scale,
    }));

    return new Polygon(scaledPoints, {
        ...commonProps,
        left: node.transform.x * scale,
        top: node.transform.y * scale,
        fill: node.fill,
        stroke: node.stroke,
        strokeWidth: node.strokeWidth ? node.strokeWidth * scale : 0,
        scaleX: node.transform.scaleX,
        scaleY: node.transform.scaleY,
        angle: node.transform.rotation,
    });
}

/**
 * Render Line Node
 */
function renderLineNode(node: LineNode, scale: number, commonProps: any): Line {
    return new Line(
        [
            node.x1 * scale,
            node.y1 * scale,
            node.x2 * scale,
            node.y2 * scale,
        ],
        {
            ...commonProps,
            left: node.transform.x * scale,
            top: node.transform.y * scale,
            stroke: node.stroke,
            strokeWidth: node.strokeWidth ? node.strokeWidth * scale : 1,
            scaleX: node.transform.scaleX,
            scaleY: node.transform.scaleY,
            angle: node.transform.rotation,
        }
    );
}

/**
 * Render Text/Textbox Node
 */
function renderTextNode(node: TextNode | TextboxNode, scale: number, commonProps: any): Textbox {
    const width = node.type === 'textbox' ? (node as TextboxNode).width * scale : undefined;

    return new Textbox(node.text, {
        ...commonProps,
        left: node.transform.x * scale,
        top: node.transform.y * scale,
        fontSize: node.fontSize * scale,
        fontFamily: node.fontFamily || 'Outfit',
        fontWeight: node.fontWeight,
        fill: node.fill,
        originX: node.originX || 'left',
        textAlign: node.textAlign || 'center',
        width: width || 600 * scale,
        letterSpacing: node.letterSpacing,
        scaleX: node.transform.scaleX,
        scaleY: node.transform.scaleY,
        angle: node.transform.rotation,
    });
}

/**
 * Render Image Node (async)
 */


/**
 * Render Path Node
 */
function renderPathNode(node: PathNode, scale: number, commonProps: any): Path | null {
    if (!node.pathData) return null;

    return new Path(node.pathData, {
        ...commonProps,
        left: node.transform.x * scale,
        top: node.transform.y * scale,
        fill: node.fill,
        stroke: node.stroke,
        strokeWidth: node.strokeWidth ? node.strokeWidth * scale : 0,
        scaleX: node.transform.scaleX * scale,
        scaleY: node.transform.scaleY * scale,
        angle: node.transform.rotation,
    });
}

/**
 * Render Decorative Curve Node
 */
function renderDecorativeCurveNode(node: DecorativeCurveNode, scale: number, commonProps: any): Path | null {
    let pathString = '';

    // Generate path based on position
    if (node.position === 'top-right') {
        pathString = `M ${720 * scale} ${0} Q ${680 * scale} ${40 * scale} ${720 * scale} ${80 * scale} L ${800 * scale} ${80 * scale} L ${800 * scale} ${0} Z`;
    } else if (node.position === 'bottom-left') {
        pathString = `M ${0} ${480 * scale} Q ${40 * scale} ${520 * scale} ${0} ${560 * scale} L ${0} ${560 * scale} L ${80 * scale} ${560 * scale} Z`;
    } else if (node.position === 'top-left') {
        pathString = `M ${0} ${0} Q ${40 * scale} ${40 * scale} ${0} ${80 * scale} L ${0} ${0} Z`;
    } else if (node.position === 'bottom-right') {
        pathString = `M ${800 * scale} ${560 * scale} Q ${760 * scale} ${520 * scale} ${800 * scale} ${480 * scale} L ${800 * scale} ${560 * scale} Z`;
    }

    if (!pathString) return null;

    return new Path(pathString, {
        ...commonProps,
        left: node.transform.x * scale,
        top: node.transform.y * scale,
        fill: node.colors?.[0] || '#0b3c6f',
        opacity: 0.3,
        scaleX: node.transform.scaleX,
        scaleY: node.transform.scaleY,
        angle: node.transform.rotation,
    });
}

/**
 * Backward compatibility: Render from old JSON format
 * This converts JSON to Scene Graph then renders
 */
import { sceneGraphConverter } from './sceneGraphConverter';

interface RenderTemplateOptions {
    canvas: FabricCanvas;
    templateData: any;
    scale?: number;
    interactive?: boolean;
}

export const renderTemplateElements = ({
    canvas,
    templateData,
    scale = 1,
    interactive = true
}: RenderTemplateOptions) => {
    // Check if it's already a scene graph
    if (templateData.version && templateData.root) {
        renderSceneGraph({
            canvas,
            sceneGraph: templateData,
            scale,
            interactive,
        });
    } else {
        // Convert JSON to Scene Graph first
        const sceneGraph = sceneGraphConverter.jsonToSceneGraph(templateData);
        renderSceneGraph({
            canvas,
            sceneGraph,
            scale,
            interactive,
        });
    }
};
