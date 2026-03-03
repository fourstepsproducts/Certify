/**
 * Scene Graph Type Definitions
 * 
 * A scene graph is a hierarchical data structure that represents
 * visual elements in a tree-like format, enabling easier manipulation,
 * traversal, and rendering.
 */

export type SceneNodeType =
    | 'root'
    | 'group'
    | 'rect'
    | 'circle'
    | 'polygon'
    | 'line'
    | 'text'
    | 'textbox'
    | 'image'
    | 'path'
    | 'decorativeCurve';

export interface Transform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    skewX?: number;
    skewY?: number;
}

export interface SceneNodeBase {
    id: string;
    type: SceneNodeType;
    name?: string;
    children?: SceneNode[];
    transform: Transform;
    visible: boolean;
    opacity: number;
    locked: boolean;
    selectable: boolean;
    role?: 'title' | 'recipient' | 'description' | 'date' | 'issuer' | 'signature' | 'decoration' | 'border';
    layoutConstraint?: {
        lockedPosition?: boolean;
        lockedSize?: boolean;
        autoScaleText?: boolean;
        maxWidth?: number;
        maxHeight?: number;
    };
}

/**
 * Root node - represents the canvas/document
 */
export interface RootNode extends SceneNodeBase {
    type: 'root';
    width: number;
    height: number;
    backgroundColor: string;
}

/**
 * Group node - container for other elements
 */
export interface GroupNode extends SceneNodeBase {
    type: 'group';
}

/**
 * Rectangle node
 */
export interface RectNode extends SceneNodeBase {
    type: 'rect';
    width: number;
    height: number;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
}

/**
 * Circle node
 */
export interface CircleNode extends SceneNodeBase {
    type: 'circle';
    radius: number;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * Polygon node
 */
export interface PolygonNode extends SceneNodeBase {
    type: 'polygon';
    points: Array<{ x: number; y: number }>;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * Line node
 */
export interface LineNode extends SceneNodeBase {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    strokeWidth?: number;
}

/**
 * Text node
 */
export interface TextNode extends SceneNodeBase {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight?: number | string;
    fill: string;
    textAlign?: 'left' | 'center' | 'right';
    originX?: 'left' | 'center' | 'right';
    letterSpacing?: number;
}

/**
 * Textbox node (multi-line text)
 */
export interface TextboxNode extends SceneNodeBase {
    type: 'textbox';
    text: string;
    width: number;
    fontSize: number;
    fontFamily: string;
    fontWeight?: number | string;
    fill: string;
    textAlign?: 'left' | 'center' | 'right';
    originX?: 'left' | 'center' | 'right';
    letterSpacing?: number;
}

/**
 * Image node
 */
export interface ImageNode extends SceneNodeBase {
    type: 'image';
    src: string;
    width: number;
    height: number;
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

/**
 * SVG Path node
 */
export interface PathNode extends SceneNodeBase {
    type: 'path';
    pathData: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * Decorative Curve node
 */
export interface DecorativeCurveNode extends SceneNodeBase {
    type: 'decorativeCurve';
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    colors: string[];
    style: 'wave' | 'geometric' | 'floral';
}

/**
 * Union type of all scene nodes
 */
export type SceneNode =
    | RootNode
    | GroupNode
    | RectNode
    | CircleNode
    | PolygonNode
    | LineNode
    | TextNode
    | TextboxNode
    | ImageNode
    | PathNode
    | DecorativeCurveNode;

/**
 * Scene Graph - the complete structure
 */
export interface SceneGraph {
    version: string;
    root: RootNode;
    metadata?: {
        createdAt?: string;
        updatedAt?: string;
        author?: string;
        templateId?: string;
        templateName?: string;
        category?: string;
    };
}
