import {
    SceneGraph,
    SceneNode,
    RootNode,
    RectNode,
    CircleNode,
    PolygonNode,
    LineNode,
    TextNode,
    TextboxNode,
    ImageNode,
    PathNode,
    DecorativeCurveNode,
    Transform,
} from '@/types/sceneGraph';

/**
 * Scene Graph Converter
 * 
 * Converts between JSON template format and hierarchical scene graph structure.
 * The scene graph provides better organization for complex templates with groups,
 * layers, and nested elements.
 */
export class SceneGraphConverter {
    private nodeIdCounter = 0;

    /**
     * Convert JSON template data to Scene Graph
     */
    public jsonToSceneGraph(templateData: any): SceneGraph {
        this.nodeIdCounter = 0;

        // Create root node from canvas data
        const root: RootNode = {
            id: this.generateNodeId('root'),
            type: 'root',
            name: 'Canvas',
            width: templateData.width || 800,
            height: templateData.height || 560,
            backgroundColor: templateData.backgroundColor || '#FFFFFF',
            transform: this.createDefaultTransform(),
            visible: true,
            opacity: 1,
            locked: false,
            selectable: false,
            children: [],
        };

        // Convert each element to a scene node
        if (templateData.elements && Array.isArray(templateData.elements)) {
            root.children = templateData.elements
                .map((el: any) => this.convertElementToNode(el))
                .filter((node): node is SceneNode => node !== null);
        }

        return {
            version: '1.0.0',
            root,
            metadata: {
                createdAt: new Date().toISOString(),
                author: 'Certificate Canvas',
            },
        };
    }

    /**
     * Convert Scene Graph back to JSON template format
     */
    public sceneGraphToJson(sceneGraph: SceneGraph): any {
        const { root } = sceneGraph;
        if (!root) {
            return {
                width: 800,
                height: 560,
                backgroundColor: '#ffffff',
                elements: []
            };
        }

        const templateData: any = {
            width: root.width,
            height: root.height,
            backgroundColor: root.backgroundColor,
            elements: [],
        };

        // Recursively flatten all nodes (including group children) to elements
        const flattenNode = (node: SceneNode): any[] => {
            const elements: any[] = [];

            if (node.type === 'group') {
                // For groups, recursively flatten all children
                if ('children' in node && node.children) {
                    node.children.forEach(child => {
                        elements.push(...flattenNode(child));
                    });
                }
            } else if (node.type !== 'root') {
                // For non-group nodes, convert to element
                const element = this.convertNodeToElement(node);
                if (element) {
                    elements.push(element);
                }
            }

            return elements;
        };

        // Flatten all child nodes
        if (root.children) {
            root.children.forEach((node) => {
                templateData.elements.push(...flattenNode(node));
            });
        }

        return templateData;
    }

    /**
     * Convert a single JSON element to a scene node
     */
    private convertElementToNode(el: any): SceneNode | null {
        if (!el.type) return null;

        const baseNode = {
            id: this.generateNodeId(el.type),
            name: el.name || undefined,
            visible: el.visible !== undefined ? el.visible : true,
            opacity: el.opacity !== undefined ? el.opacity : 1,
            locked: el.locked || false,
            selectable: el.selectable !== undefined ? el.selectable : true,
            role: el.role,
            layoutConstraint: el.layoutConstraint,
        };

        switch (el.type) {
            case 'rect':
                return {
                    ...baseNode,
                    type: 'rect',
                    width: el.width || 100,
                    height: el.height || 100,
                    fill: el.fill || 'transparent',
                    stroke: el.stroke,
                    strokeWidth: el.strokeWidth,
                    cornerRadius: el.cornerRadius,
                    transform: this.createTransformFromElement(el),
                } as RectNode;

            case 'circle':
                return {
                    ...baseNode,
                    type: 'circle',
                    radius: el.radius || 50,
                    fill: el.fill || 'transparent',
                    stroke: el.stroke,
                    strokeWidth: el.strokeWidth,
                    transform: this.createTransformFromElement(el),
                } as CircleNode;

            case 'polygon':
                return {
                    ...baseNode,
                    type: 'polygon',
                    points: el.points || [],
                    fill: el.fill || 'transparent',
                    stroke: el.stroke,
                    strokeWidth: el.strokeWidth,
                    transform: this.createTransformFromElement(el),
                } as PolygonNode;

            case 'line':
                return {
                    ...baseNode,
                    type: 'line',
                    x1: el.x1 || 0,
                    y1: el.y1 || 0,
                    x2: el.x2 || 100,
                    y2: el.y2 || 100,
                    stroke: el.stroke || '#000000',
                    strokeWidth: el.strokeWidth || 1,
                    transform: this.createTransformFromElement(el),
                } as LineNode;

            case 'text':
                return {
                    ...baseNode,
                    type: 'text',
                    text: el.text || '',
                    fontSize: el.fontSize || 16,
                    fontFamily: el.fontFamily || 'Outfit',
                    fontWeight: el.fontWeight,
                    fill: el.fill || '#000000',
                    textAlign: el.textAlign,
                    originX: el.originX,
                    letterSpacing: el.letterSpacing,
                    transform: this.createTransformFromElement(el),
                } as TextNode;

            case 'textbox':
                return {
                    ...baseNode,
                    type: 'textbox',
                    text: el.text || '',
                    width: el.width || 200,
                    fontSize: el.fontSize || 16,
                    fontFamily: el.fontFamily || 'Outfit',
                    fontWeight: el.fontWeight,
                    fill: el.fill || '#000000',
                    textAlign: el.textAlign,
                    originX: el.originX,
                    letterSpacing: el.letterSpacing,
                    transform: this.createTransformFromElement(el),
                } as TextboxNode;

            case 'image':
                return {
                    ...baseNode,
                    type: 'image',
                    src: el.src || '',
                    width: el.width || 100,
                    height: el.height || 100,
                    crossOrigin: el.crossOrigin,
                    transform: this.createTransformFromElement(el),
                } as ImageNode;

            case 'path':
                return {
                    ...baseNode,
                    type: 'path',
                    pathData: el.pathData || el.d || '',
                    fill: el.fill,
                    stroke: el.stroke,
                    strokeWidth: el.strokeWidth,
                    transform: this.createTransformFromElement(el),
                } as PathNode;

            case 'decorativeCurve':
                return {
                    ...baseNode,
                    type: 'decorativeCurve',
                    position: el.position || 'top-left',
                    colors: el.colors || ['#000000'],
                    style: el.style || 'wave',
                    transform: this.createTransformFromElement(el),
                } as DecorativeCurveNode;

            default:
                console.warn(`Unknown element type: ${el.type}`);
                return null;
        }
    }

    /**
     * Convert a scene node back to JSON element format
     */
    private convertNodeToElement(node: SceneNode): any | null {
        if (node.type === 'root' || node.type === 'group') {
            // Skip root and handle groups separately if needed
            return null;
        }

        const baseElement: any = {
            type: node.type,
            name: node.name,
            left: node.transform.x,
            top: node.transform.y,
            scaleX: node.transform.scaleX !== 1 ? node.transform.scaleX : undefined,
            scaleY: node.transform.scaleY !== 1 ? node.transform.scaleY : undefined,
            rotation: node.transform.rotation !== 0 ? node.transform.rotation : undefined,
            visible: node.visible !== true ? node.visible : undefined,
            opacity: node.opacity !== 1 ? node.opacity : undefined,
            locked: node.locked || undefined,
            selectable: node.selectable !== true ? node.selectable : undefined,
            role: node.role,
            layoutConstraint: node.layoutConstraint,
        };

        // Remove undefined properties
        Object.keys(baseElement).forEach(
            (key) => baseElement[key] === undefined && delete baseElement[key]
        );

        switch (node.type) {
            case 'rect': {
                const rectNode = node as RectNode;
                return {
                    ...baseElement,
                    width: rectNode.width,
                    height: rectNode.height,
                    fill: rectNode.fill,
                    stroke: rectNode.stroke,
                    strokeWidth: rectNode.strokeWidth,
                    cornerRadius: rectNode.cornerRadius,
                };
            }

            case 'circle': {
                const circleNode = node as CircleNode;
                return {
                    ...baseElement,
                    radius: circleNode.radius,
                    fill: circleNode.fill,
                    stroke: circleNode.stroke,
                    strokeWidth: circleNode.strokeWidth,
                };
            }

            case 'polygon': {
                const polygonNode = node as PolygonNode;
                return {
                    ...baseElement,
                    points: polygonNode.points,
                    fill: polygonNode.fill,
                    stroke: polygonNode.stroke,
                    strokeWidth: polygonNode.strokeWidth,
                };
            }

            case 'line': {
                const lineNode = node as LineNode;
                return {
                    ...baseElement,
                    x1: lineNode.x1,
                    y1: lineNode.y1,
                    x2: lineNode.x2,
                    y2: lineNode.y2,
                    stroke: lineNode.stroke,
                    strokeWidth: lineNode.strokeWidth,
                };
            }

            case 'text': {
                const textNode = node as TextNode;
                return {
                    ...baseElement,
                    text: textNode.text,
                    fontSize: textNode.fontSize,
                    fontFamily: textNode.fontFamily,
                    fontWeight: textNode.fontWeight,
                    fill: textNode.fill,
                    textAlign: textNode.textAlign,
                    originX: textNode.originX,
                    letterSpacing: textNode.letterSpacing,
                };
            }

            case 'textbox': {
                const textboxNode = node as TextboxNode;
                return {
                    ...baseElement,
                    text: textboxNode.text,
                    width: textboxNode.width,
                    fontSize: textboxNode.fontSize,
                    fontFamily: textboxNode.fontFamily,
                    fontWeight: textboxNode.fontWeight,
                    fill: textboxNode.fill,
                    textAlign: textboxNode.textAlign,
                    originX: textboxNode.originX,
                    letterSpacing: textboxNode.letterSpacing,
                };
            }

            case 'image': {
                const imageNode = node as ImageNode;
                return {
                    ...baseElement,
                    src: imageNode.src,
                    width: imageNode.width,
                    height: imageNode.height,
                    crossOrigin: imageNode.crossOrigin,
                };
            }

            case 'path': {
                const pathNode = node as PathNode;
                return {
                    ...baseElement,
                    pathData: pathNode.pathData,
                    fill: pathNode.fill,
                    stroke: pathNode.stroke,
                    strokeWidth: pathNode.strokeWidth,
                };
            }

            case 'decorativeCurve': {
                const curveNode = node as DecorativeCurveNode;
                return {
                    ...baseElement,
                    position: curveNode.position,
                    colors: curveNode.colors,
                    style: curveNode.style,
                };
            }

            default:
                console.warn(`Unknown node type: ${(node as any).type}`);
                return null;
        }
    }

    /**
     * Create a transform object from element properties
     */
    private createTransformFromElement(el: any): Transform {
        return {
            x: el.left || 0,
            y: el.top || 0,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            rotation: el.rotation || 0,
            skewX: el.skewX,
            skewY: el.skewY,
        };
    }

    /**
     * Create default transform
     */
    private createDefaultTransform(): Transform {
        return {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
        };
    }

    /**
     * Generate unique node ID
     */
    private generateNodeId(type: string): string {
        return `${type}_${++this.nodeIdCounter}_${Date.now()}`;
    }

    /**
     * Traverse the scene graph and apply a function to each node
     */
    public traverseSceneGraph(
        node: SceneNode,
        callback: (node: SceneNode, depth: number) => void,
        depth = 0
    ): void {
        callback(node, depth);

        if ('children' in node && node.children) {
            node.children.forEach((child) => {
                this.traverseSceneGraph(child, callback, depth + 1);
            });
        }
    }

    /**
     * Find a node by ID in the scene graph
     */
    public findNodeById(root: SceneNode, id: string): SceneNode | null {
        if (root.id === id) {
            return root;
        }

        if ('children' in root && root.children) {
            for (const child of root.children) {
                const found = this.findNodeById(child, id);
                if (found) return found;
            }
        }

        return null;
    }

    /**
     * Get all nodes of a specific type
     */
    public getNodesByType(root: SceneNode, type: string): SceneNode[] {
        const results: SceneNode[] = [];

        this.traverseSceneGraph(root, (node) => {
            if (node.type === type) {
                results.push(node);
            }
        });

        return results;
    }

    /**
     * Calculate bounding box for a scene graph
     */
    public calculateBoundingBox(root: SceneNode): {
        x: number;
        y: number;
        width: number;
        height: number;
    } {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        this.traverseSceneGraph(root, (node) => {
            if (node.type === 'root') return;

            const { x, y } = node.transform;

            // Simple bounding box calculation (can be enhanced for specific shapes)
            if ('width' in node && 'height' in node) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + (node as any).width);
                maxY = Math.max(maxY, y + (node as any).height);
            } else if ('radius' in node) {
                const radius = (node as any).radius;
                minX = Math.min(minX, x - radius);
                minY = Math.min(minY, y - radius);
                maxX = Math.max(maxX, x + radius);
                maxY = Math.max(maxY, y + radius);
            } else {
                // For other types, just use the position
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
}

// Export a singleton instance
export const sceneGraphConverter = new SceneGraphConverter();
