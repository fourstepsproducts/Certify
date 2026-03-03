/**
 * Scene Graph Conversion Example
 * 
 * This example demonstrates converting a JSON template to a scene graph
 * and shows the hierarchical structure.
 */

import { sceneGraphConverter } from './sceneGraphConverter';

// Example JSON template (simplified)
const exampleTemplate = {
    width: 800,
    height: 560,
    backgroundColor: '#F7F7F7',
    elements: [
        {
            type: 'rect',
            left: 32,
            top: 32,
            width: 736,
            height: 496,
            fill: 'transparent',
            stroke: '#C9A24D',
            strokeWidth: 3,
        },
        {
            type: 'text',
            text: 'CERTIFICATE',
            left: 400,
            top: 96,
            fontSize: 51,
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            fill: '#1F2F44',
            originX: 'center',
        },
        {
            type: 'text',
            text: 'Of Excellence',
            left: 400,
            top: 152,
            fontSize: 22,
            fontFamily: 'Playfair Display',
            fill: '#1F2F44',
            originX: 'center',
        },
        {
            type: 'circle',
            left: 650,
            top: 60,
            radius: 42,
            fill: '#0E5E6F',
            stroke: '#C9A227',
            strokeWidth: 4,
        },
        {
            type: 'image',
            src: '/assets/signature.png',
            left: 344,
            top: 376,
            width: 112,
            height: 56,
        },
    ],
};

// Convert to scene graph
export function runSceneGraphExample() {
    console.log('=== Scene Graph Conversion Example ===\n');

    console.log('Original JSON Template:');
    console.log(JSON.stringify(exampleTemplate, null, 2));
    console.log('\n');

    // Convert to scene graph
    const sceneGraph = sceneGraphConverter.jsonToSceneGraph(exampleTemplate);

    console.log('Converted Scene Graph:');
    console.log(`Version: ${sceneGraph.version}`);
    console.log(`Root ID: ${sceneGraph.root.id}`);
    console.log(`Canvas Size: ${sceneGraph.root.width}x${sceneGraph.root.height}`);
    console.log(`Background: ${sceneGraph.root.backgroundColor}`);
    console.log(`Children Count: ${sceneGraph.root.children?.length || 0}`);
    console.log('\n');

    // Display tree structure
    console.log('Scene Graph Tree Structure:');
    sceneGraphConverter.traverseSceneGraph(sceneGraph.root, (node, depth) => {
        const indent = '  '.repeat(depth);
        const nodeType = node.type.toUpperCase();

        if (node.type === 'root') {
            console.log(`${indent}ROOT [${node.id}]`);
            console.log(`${indent}  └─ Canvas: ${(node as any).width}x${(node as any).height}`);
        } else if (node.type === 'text') {
            const textNode = node as any;
            console.log(`${indent}├─ TEXT [${node.id}]`);
            console.log(`${indent}│  ├─ Content: "${textNode.text}"`);
            console.log(`${indent}│  ├─ Font: ${textNode.fontFamily} ${textNode.fontSize}px`);
            console.log(`${indent}│  └─ Position: (${node.transform.x}, ${node.transform.y})`);
        } else if (node.type === 'rect') {
            const rectNode = node as any;
            console.log(`${indent}├─ RECT [${node.id}]`);
            console.log(`${indent}│  ├─ Size: ${rectNode.width}x${rectNode.height}`);
            console.log(`${indent}│  ├─ Fill: ${rectNode.fill}`);
            console.log(`${indent}│  └─ Position: (${node.transform.x}, ${node.transform.y})`);
        } else if (node.type === 'circle') {
            const circleNode = node as any;
            console.log(`${indent}├─ CIRCLE [${node.id}]`);
            console.log(`${indent}│  ├─ Radius: ${circleNode.radius}`);
            console.log(`${indent}│  ├─ Fill: ${circleNode.fill}`);
            console.log(`${indent}│  └─ Position: (${node.transform.x}, ${node.transform.y})`);
        } else if (node.type === 'image') {
            const imageNode = node as any;
            console.log(`${indent}├─ IMAGE [${node.id}]`);
            console.log(`${indent}│  ├─ Source: ${imageNode.src}`);
            console.log(`${indent}│  ├─ Size: ${imageNode.width}x${imageNode.height}`);
            console.log(`${indent}│  └─ Position: (${node.transform.x}, ${node.transform.y})`);
        } else {
            console.log(`${indent}├─ ${nodeType} [${node.id}]`);
            console.log(`${indent}│  └─ Position: (${node.transform.x}, ${node.transform.y})`);
        }
    });
    console.log('\n');

    // Query examples
    console.log('Query Examples:');

    const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');
    console.log(`Found ${textNodes.length} text nodes`);

    const rectNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'rect');
    console.log(`Found ${rectNodes.length} rectangle nodes`);

    const imageNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'image');
    console.log(`Found ${imageNodes.length} image nodes`);

    const circleNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'circle');
    console.log(`Found ${circleNodes.length} circle nodes`);
    console.log('\n');

    // Bounding box calculation
    const bbox = sceneGraphConverter.calculateBoundingBox(sceneGraph.root);
    console.log('Content Bounding Box:');
    console.log(`  Position: (${bbox.x}, ${bbox.y})`);
    console.log(`  Size: ${bbox.width}x${bbox.height}`);
    console.log('\n');

    // Convert back to JSON
    const reconstructedJson = sceneGraphConverter.sceneGraphToJson(sceneGraph);
    console.log('Conversion Verification:');
    console.log(`  Original elements: ${exampleTemplate.elements.length}`);
    console.log(`  Reconstructed elements: ${reconstructedJson.elements.length}`);
    console.log(`  Match: ${exampleTemplate.elements.length === reconstructedJson.elements.length ? '✓' : '✗'}`);
    console.log('\n');

    console.log('Reconstructed JSON:');
    console.log(JSON.stringify(reconstructedJson, null, 2));

    return sceneGraph;
}

// Uncomment to run the example:
// runSceneGraphExample();

export default runSceneGraphExample;
