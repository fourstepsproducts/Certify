/**
 * Scene Graph Visualizer
 * 
 * Utilities for visualizing and debugging scene graphs
 */

import type { SceneGraph, SceneNode } from '@/types/sceneGraph';
import { sceneGraphConverter } from './sceneGraphConverter';

/**
 * Generate a text-based tree visualization of a scene graph
 */
export function visualizeSceneGraph(sceneGraph: SceneGraph): string {
    const lines: string[] = [];

    lines.push('╔════════════════════════════════════════════════════════════╗');
    lines.push('║                    SCENE GRAPH STRUCTURE                   ║');
    lines.push('╠════════════════════════════════════════════════════════════╣');
    lines.push(`║ Version: ${sceneGraph.version.padEnd(49)} ║`);
    lines.push(`║ Canvas:  ${sceneGraph.root.width}x${sceneGraph.root.height}`.padEnd(61) + '║');
    lines.push(`║ Background: ${sceneGraph.root.backgroundColor}`.padEnd(61) + '║');
    lines.push('╚════════════════════════════════════════════════════════════╝');
    lines.push('');

    sceneGraphConverter.traverseSceneGraph(sceneGraph.root, (node, depth) => {
        if (depth === 0) {
            lines.push('📦 ROOT');
            return;
        }

        const indent = '   '.repeat(depth - 1);
        const connector = '   ';
        const branch = depth === 1 ? '└──' : '├──';

        let icon = '📄';
        let label = node.type;
        let details = '';

        switch (node.type) {
            case 'text':
            case 'textbox':
                icon = '📝';
                const textNode = node as any;
                details = ` "${textNode.text.substring(0, 30)}${textNode.text.length > 30 ? '...' : ''}"`;
                break;
            case 'rect':
                icon = '▢';
                const rectNode = node as any;
                details = ` ${rectNode.width}×${rectNode.height}`;
                break;
            case 'circle':
                icon = '●';
                const circleNode = node as any;
                details = ` r=${circleNode.radius}`;
                break;
            case 'image':
                icon = '🖼️';
                const imageNode = node as any;
                details = ` ${imageNode.width}×${imageNode.height}`;
                break;
            case 'polygon':
                icon = '▽';
                const polygonNode = node as any;
                details = ` ${polygonNode.points.length} points`;
                break;
            case 'line':
                icon = '─';
                break;
            case 'path':
                icon = '✏️';
                break;
            case 'decorativeCurve':
                icon = '∿';
                break;
        }

        const position = `(${node.transform.x}, ${node.transform.y})`;
        lines.push(`${indent}${branch} ${icon} ${label}${details} @ ${position}`);
    });

    return lines.join('\n');
}

/**
 * Generate statistics about a scene graph
 */
export function generateSceneGraphStats(sceneGraph: SceneGraph) {
    const stats = {
        totalNodes: 0,
        nodesByType: {} as Record<string, number>,
        totalTextCharacters: 0,
        canvasSize: {
            width: sceneGraph.root.width,
            height: sceneGraph.root.height,
        },
        boundingBox: sceneGraphConverter.calculateBoundingBox(sceneGraph.root),
    };

    sceneGraphConverter.traverseSceneGraph(sceneGraph.root, (node) => {
        stats.totalNodes++;

        // Count by type
        if (!stats.nodesByType[node.type]) {
            stats.nodesByType[node.type] = 0;
        }
        stats.nodesByType[node.type]++;

        // Count text characters
        if (node.type === 'text' || node.type === 'textbox') {
            const textNode = node as any;
            stats.totalTextCharacters += textNode.text.length;
        }
    });

    return stats;
}

/**
 * Export scene graph as formatted JSON
 */
export function exportSceneGraphAsJson(sceneGraph: SceneGraph): string {
    return JSON.stringify(sceneGraph, null, 2);
}

/**
 * Generate a markdown report of a scene graph
 */
export function generateMarkdownReport(sceneGraph: SceneGraph): string {
    const stats = generateSceneGraphStats(sceneGraph);
    const lines: string[] = [];

    lines.push('# Scene Graph Report\n');

    lines.push('## Overview\n');
    lines.push(`- **Version**: ${sceneGraph.version}`);
    lines.push(`- **Canvas Size**: ${stats.canvasSize.width}×${stats.canvasSize.height}`);
    lines.push(`- **Background**: ${sceneGraph.root.backgroundColor}`);
    lines.push(`- **Total Nodes**: ${stats.totalNodes}`);
    lines.push('');

    lines.push('## Node Statistics\n');
    lines.push('| Node Type | Count |');
    lines.push('|-----------|-------|');
    Object.entries(stats.nodesByType).forEach(([type, count]) => {
        lines.push(`| ${type} | ${count} |`);
    });
    lines.push('');

    lines.push('## Content Statistics\n');
    lines.push(`- **Total Text Characters**: ${stats.totalTextCharacters}`);
    lines.push(`- **Bounding Box**: (${stats.boundingBox.x}, ${stats.boundingBox.y}) ${stats.boundingBox.width}×${stats.boundingBox.height}`);
    lines.push('');

    lines.push('## Node Tree\n');
    lines.push('```');
    sceneGraphConverter.traverseSceneGraph(sceneGraph.root, (node, depth) => {
        const indent = '  '.repeat(depth);
        if (node.type === 'root') {
            lines.push(`${indent}ROOT`);
        } else if (node.type === 'text' || node.type === 'textbox') {
            const textNode = node as any;
            lines.push(`${indent}- ${node.type}: "${textNode.text.substring(0, 40)}${textNode.text.length > 40 ? '...' : ''}"`);
        } else {
            lines.push(`${indent}- ${node.type}`);
        }
    });
    lines.push('```');
    lines.push('');

    if (sceneGraph.metadata) {
        lines.push('## Metadata\n');
        Object.entries(sceneGraph.metadata).forEach(([key, value]) => {
            lines.push(`- **${key}**: ${value}`);
        });
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Compare two scene graphs and generate a diff report
 */
export function compareSceneGraphs(
    sceneGraphA: SceneGraph,
    sceneGraphB: SceneGraph
): string {
    const statsA = generateSceneGraphStats(sceneGraphA);
    const statsB = generateSceneGraphStats(sceneGraphB);

    const lines: string[] = [];
    lines.push('# Scene Graph Comparison\n');

    lines.push('## Overall Stats\n');
    lines.push('| Metric | Graph A | Graph B | Diff |');
    lines.push('|--------|---------|---------|------|');
    lines.push(`| Total Nodes | ${statsA.totalNodes} | ${statsB.totalNodes} | ${statsB.totalNodes - statsA.totalNodes} |`);
    lines.push(`| Text Characters | ${statsA.totalTextCharacters} | ${statsB.totalTextCharacters} | ${statsB.totalTextCharacters - statsA.totalTextCharacters} |`);
    lines.push('');

    lines.push('## Nodes by Type\n');
    lines.push('| Node Type | Graph A | Graph B | Diff |');
    lines.push('|-----------|---------|---------|------|');

    const allTypes = new Set([
        ...Object.keys(statsA.nodesByType),
        ...Object.keys(statsB.nodesByType),
    ]);

    allTypes.forEach((type) => {
        const countA = statsA.nodesByType[type] || 0;
        const countB = statsB.nodesByType[type] || 0;
        const diff = countB - countA;
        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
        lines.push(`| ${type} | ${countA} | ${countB} | ${diffStr} |`);
    });
    lines.push('');

    return lines.join('\n');
}

/**
 * Print scene graph to console with colors (if supported)
 */
export function printSceneGraph(sceneGraph: SceneGraph): void {
    console.log('\n' + visualizeSceneGraph(sceneGraph));

    const stats = generateSceneGraphStats(sceneGraph);
    console.log('\n📊 Statistics:');
    console.log(`   Total Nodes: ${stats.totalNodes}`);
    console.log(`   Text Characters: ${stats.totalTextCharacters}`);
    console.log(`   Bounding Box: ${stats.boundingBox.width}×${stats.boundingBox.height}`);
    console.log('');
}

export default {
    visualizeSceneGraph,
    generateSceneGraphStats,
    exportSceneGraphAsJson,
    generateMarkdownReport,
    compareSceneGraphs,
    printSceneGraph,
};
