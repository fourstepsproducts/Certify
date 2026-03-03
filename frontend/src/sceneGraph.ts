/**
 * Scene Graph System - Main Entry Point
 * 
 * This file exports all scene graph utilities for easy importing.
 */

// Core types
export type {
    SceneGraph,
    SceneNode,
    SceneNodeType,
    SceneNodeBase,
    Transform,
    RootNode,
    GroupNode,
    RectNode,
    CircleNode,
    PolygonNode,
    LineNode,
    TextNode,
    TextboxNode,
    ImageNode,
    PathNode,
    DecorativeCurveNode,
} from '@/types/sceneGraph';

// Core converter
export {
    SceneGraphConverter,
    sceneGraphConverter,
} from '@/utils/sceneGraphConverter';

// Visualization tools
export {
    visualizeSceneGraph,
    generateSceneGraphStats,
    exportSceneGraphAsJson,
    generateMarkdownReport,
    compareSceneGraphs,
    printSceneGraph,
} from '@/utils/sceneGraphVisualizer';

// Demo utilities
export { default as sceneGraphDemo } from '@/utils/sceneGraphDemo';

// Example
export { default as runSceneGraphExample } from '@/utils/sceneGraphExample';

/**
 * Quick usage example:
 * 
 * import { sceneGraphConverter, printSceneGraph } from '@/sceneGraph';
 * 
 * const sceneGraph = sceneGraphConverter.jsonToSceneGraph(templateData);
 * printSceneGraph(sceneGraph);
 */
