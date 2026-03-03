/**
 * Scene Graph Demo
 * 
 * This file demonstrates how to use the Scene Graph Converter
 * to convert JSON templates into scene graphs and vice versa.
 */

import { sceneGraphConverter } from './sceneGraphConverter';
import { certificateTemplates } from '@/data/templatesSceneGraph';
import type { SceneGraph } from '@/types/sceneGraph';

/**
 * Convert all templates to scene graphs
 */
export const convertTemplatesToSceneGraphs = (): Record<string, SceneGraph> => {
    const sceneGraphs: Record<string, SceneGraph> = {};

    certificateTemplates.forEach((template) => {
        try {
            const sceneGraph = sceneGraphConverter.jsonToSceneGraph(template.canvasData);
            sceneGraphs[template.id] = sceneGraph;

            console.log(`✓ Converted template: ${template.name}`);
            console.log(`  - Root node ID: ${sceneGraph.root.id}`);
            console.log(`  - Children count: ${sceneGraph.root.children?.length || 0}`);
            console.log(`  - Canvas size: ${sceneGraph.root.width}x${sceneGraph.root.height}`);
        } catch (error) {
            console.error(`✗ Failed to convert template: ${template.name}`, error);
        }
    });

    return sceneGraphs;
};

/**
 * Example: Convert a specific template and inspect it
 */
export const inspectTemplateSceneGraph = (templateId: string) => {
    const template = certificateTemplates.find((t) => t.id === templateId);

    if (!template) {
        console.error(`Template not found: ${templateId}`);
        return null;
    }

    console.log(`\n=== Inspecting: ${template.name} ===`);

    // Convert to scene graph
    const sceneGraph = sceneGraphConverter.jsonToSceneGraph(template.canvasData);

    // Display scene graph info
    console.log('\nScene Graph Structure:');
    console.log(`Version: ${sceneGraph.version}`);
    console.log(`Root: ${sceneGraph.root.type} (${sceneGraph.root.width}x${sceneGraph.root.height})`);
    console.log(`Background: ${sceneGraph.root.backgroundColor}`);

    // Traverse and display all nodes
    console.log('\nNodes:');
    sceneGraphConverter.traverseSceneGraph(sceneGraph.root, (node, depth) => {
        const indent = '  '.repeat(depth);
        const nodeInfo = `${indent}- ${node.type} (${node.id})`;

        if (node.type === 'text' || node.type === 'textbox') {
            console.log(`${nodeInfo}: "${(node as any).text.substring(0, 30)}..."`);
        } else if (node.type === 'rect' || node.type === 'circle') {
            console.log(`${nodeInfo}: fill=${(node as any).fill}`);
        } else {
            console.log(nodeInfo);
        }
    });

    // Get node statistics
    const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');
    const rectNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'rect');
    const imageNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'image');

    console.log('\nNode Statistics:');
    console.log(`Text nodes: ${textNodes.length}`);
    console.log(`Rectangle nodes: ${rectNodes.length}`);
    console.log(`Image nodes: ${imageNodes.length}`);

    // Calculate bounding box
    const bbox = sceneGraphConverter.calculateBoundingBox(sceneGraph.root);
    console.log('\nBounding Box:');
    console.log(`Position: (${bbox.x}, ${bbox.y})`);
    console.log(`Size: ${bbox.width}x${bbox.height}`);

    // Convert back to JSON
    const reconstructedJson = sceneGraphConverter.sceneGraphToJson(sceneGraph);
    console.log('\nReconstructed JSON:');
    console.log(`Elements count: ${reconstructedJson.elements.length}`);
    console.log(`Match original: ${reconstructedJson.elements.length === (template.canvasData as any).elements?.length}`);

    return sceneGraph;
};

/**
 * Example: Find a specific node by ID
 */
export const findNodeExample = (sceneGraph: SceneGraph, searchId: string) => {
    const node = sceneGraphConverter.findNodeById(sceneGraph.root, searchId);

    if (node) {
        console.log(`\nFound node: ${node.id}`);
        console.log(`Type: ${node.type}`);
        console.log(`Position: (${node.transform.x}, ${node.transform.y})`);
    } else {
        console.log(`\nNode not found: ${searchId}`);
    }

    return node;
};

/**
 * Example: Get all text nodes from a template
 */
export const getAllTextNodes = (templateId: string) => {
    const template = certificateTemplates.find((t) => t.id === templateId);

    if (!template) {
        console.error(`Template not found: ${templateId}`);
        return [];
    }

    const sceneGraph = sceneGraphConverter.jsonToSceneGraph(template.canvasData);
    const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');
    const textboxNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'textbox');

    console.log(`\n=== Text Nodes in: ${template.name} ===`);

    [...textNodes, ...textboxNodes].forEach((node, index) => {
        const textNode = node as any;
        console.log(`${index + 1}. "${textNode.text}"`);
        console.log(`   Font: ${textNode.fontFamily} ${textNode.fontSize}px`);
        console.log(`   Position: (${node.transform.x}, ${node.transform.y})`);
    });

    return [...textNodes, ...textboxNodes];
};

// Example usage (commented out to prevent auto-execution):
// 
// // Convert all templates
// const allSceneGraphs = convertTemplatesToSceneGraphs();
//
// // Inspect a specific template
// const sceneGraph = inspectTemplateSceneGraph('elegant-gold');
//
// // Get all text nodes from a template
// const textNodes = getAllTextNodes('internship-certificate');
//
// // Find a specific node (you'd need to know the ID from inspection)
// if (sceneGraph) {
//   const node = findNodeExample(sceneGraph, 'text_1_1234567890');
// }

export default {
    convertTemplatesToSceneGraphs,
    inspectTemplateSceneGraph,
    findNodeExample,
    getAllTextNodes,
};
