# Scene Graph System

## Overview

The **Scene Graph** is a hierarchical data structure that represents certificate templates in a tree-like format. This provides better organization, easier manipulation, and more efficient rendering of complex templates compared to flat JSON structures.

## Why Scene Graphs?

### Benefits

1. **Hierarchical Organization**: Elements can be grouped logically (e.g., header, body, footer)
2. **Easier Tree Traversal**: Navigate and search through elements efficiently
3. **Transform Management**: Centralized position, scale, and rotation handling
4. **Better Performance**: Query and filter elements by type or properties
5. **Layer Support**: Natural parent-child relationships for grouping elements
6. **Extensibility**: Easy to add new node types and features

### Comparison

**Before (Flat JSON)**:
```json
{
  "backgroundColor": "#FFFFFF",
  "elements": [
    { "type": "rect", "left": 40, "top": 40, "width": 720, "height": 480 },
    { "type": "text", "text": "Certificate", "left": 400, "top": 100 }
  ]
}
```

**After (Scene Graph)**:
```typescript
{
  version: "1.0.0",
  root: {
    id: "root_1_1234567890",
    type: "root",
    width: 800,
    height: 560,
    backgroundColor: "#FFFFFF",
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    children: [
      {
        id: "rect_2_1234567891",
        type: "rect",
        width: 720,
        height: 480,
        fill: "transparent",
        transform: { x: 40, y: 40, scaleX: 1, scaleY: 1, rotation: 0 },
        ...
      },
      {
        id: "text_3_1234567892",
        type: "text",
        text: "Certificate",
        fontSize: 42,
        transform: { x: 400, y: 100, scaleX: 1, scaleY: 1, rotation: 0 },
        ...
      }
    ]
  }
}
```

## Architecture

### Type Definitions

Located in `src/types/sceneGraph.ts`:

- **SceneNode**: Base interface for all nodes
- **RootNode**: The canvas/document root
- **GroupNode**: Container for organizing elements
- **RectNode, CircleNode, PolygonNode**: Shape nodes
- **TextNode, TextboxNode**: Text nodes
- **ImageNode**: Image elements
- **PathNode**: SVG path elements
- **DecorativeCurveNode**: Decorative elements

### Converter

Located in `src/utils/sceneGraphConverter.ts`:

```typescript
class SceneGraphConverter {
  // Convert JSON to Scene Graph
  jsonToSceneGraph(templateData: any): SceneGraph
  
  // Convert Scene Graph back to JSON
  sceneGraphToJson(sceneGraph: SceneGraph): any
  
  // Traverse the scene graph
  traverseSceneGraph(node: SceneNode, callback: Function, depth: number): void
  
  // Find a node by ID
  findNodeById(root: SceneNode, id: string): SceneNode | null
  
  // Get all nodes of a specific type
  getNodesByType(root: SceneNode, type: string): SceneNode[]
  
  // Calculate bounding box
  calculateBoundingBox(root: SceneNode): BoundingBox
}
```

## Usage Examples

### 1. Convert Template to Scene Graph

```typescript
import { sceneGraphConverter } from '@/utils/sceneGraphConverter';
import { certificateTemplates } from '@/data/templates';

// Get a template
const template = certificateTemplates[0];

// Convert to scene graph
const sceneGraph = sceneGraphConverter.jsonToSceneGraph(template.canvasData);

console.log('Root ID:', sceneGraph.root.id);
console.log('Children:', sceneGraph.root.children?.length);
```

### 2. Traverse the Scene Graph

```typescript
sceneGraphConverter.traverseSceneGraph(sceneGraph.root, (node, depth) => {
  const indent = '  '.repeat(depth);
  console.log(`${indent}- ${node.type} (${node.id})`);
});
```

Output:
```
- root (root_1_1234567890)
  - rect (rect_2_1234567891)
  - text (text_3_1234567892)
  - text (text_4_1234567893)
  - textbox (textbox_5_1234567894)
```

### 3. Find Specific Nodes

```typescript
// Get all text nodes
const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');
console.log(`Found ${textNodes.length} text nodes`);

// Find a specific node by ID
const node = sceneGraphConverter.findNodeById(sceneGraph.root, 'text_3_1234567892');
if (node) {
  console.log('Found node:', node.type);
}
```

### 4. Calculate Bounding Box

```typescript
const bbox = sceneGraphConverter.calculateBoundingBox(sceneGraph.root);
console.log(`Bounding Box: (${bbox.x}, ${bbox.y}) ${bbox.width}x${bbox.height}`);
```

### 5. Modify and Convert Back

```typescript
// Convert to scene graph
const sceneGraph = sceneGraphConverter.jsonToSceneGraph(template.canvasData);

// Modify a node
const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');
if (textNodes[0]) {
  (textNodes[0] as TextNode).text = 'Modified Text';
  (textNodes[0] as TextNode).fontSize = 50;
}

// Convert back to JSON
const updatedJson = sceneGraphConverter.sceneGraphToJson(sceneGraph);

// Use updated JSON in canvas
// renderTemplate(canvas, updatedJson);
```

## Node Structure

Every scene node has the following base properties:

```typescript
interface SceneNodeBase {
  id: string;              // Unique identifier: "type_counter_timestamp"
  type: SceneNodeType;     // Node type (rect, text, image, etc.)
  name?: string;           // Optional human-readable name
  children?: SceneNode[];  // Child nodes (for groups)
  transform: Transform;     // Position, scale, rotation
  visible: boolean;        // Visibility flag
  opacity: number;         // Opacity (0-1)
  locked: boolean;         // Lock state
  selectable: boolean;     // Whether it can be selected
}
```

### Transform Object

```typescript
interface Transform {
  x: number;        // X position
  y: number;        // Y position
  scaleX: number;   // X scale factor
  scaleY: number;   // Y scale factor
  rotation: number; // Rotation in degrees
  skewX?: number;   // Optional X skew
  skewY?: number;   // Optional Y skew
}
```

## Advanced Features

### 1. Grouping Elements (Future Enhancement)

```typescript
// Create a group for signature section
const signatureGroup: GroupNode = {
  id: 'group_signature',
  type: 'group',
  name: 'Signature Section',
  transform: { x: 0, y: 400, scaleX: 1, scaleY: 1, rotation: 0 },
  visible: true,
  opacity: 1,
  locked: false,
  selectable: true,
  children: [
    // Add signature image, name, title nodes here
  ]
};
```

### 2. Layer Management (Future Enhancement)

```typescript
// Organize by layers
const layers = {
  background: [],  // Background elements
  content: [],     // Main content
  decorations: [], // Decorative elements
  foreground: []   // Top-level elements
};
```

### 3. Animation Support (Future Enhancement)

```typescript
interface AnimatedNode extends SceneNodeBase {
  animations?: {
    property: string;
    from: any;
    to: any;
    duration: number;
    easing: string;
  }[];
}
```

## Demo Utilities

Located in `src/utils/sceneGraphDemo.ts`:

```typescript
import sceneGraphDemo from '@/utils/sceneGraphDemo';

// Convert all templates
const allSceneGraphs = sceneGraphDemo.convertTemplatesToSceneGraphs();

// Inspect a specific template
const sceneGraph = sceneGraphDemo.inspectTemplateSceneGraph('elegant-gold');

// Get all text nodes from a template
const textNodes = sceneGraphDemo.getAllTextNodes('internship-certificate');
```

## Integration with Existing Code

### Template Renderer

The existing `templateRenderer.ts` continues to work with JSON format. To use scene graphs:

```typescript
import { sceneGraphConverter } from '@/utils/sceneGraphConverter';
import { renderTemplateElements } from '@/utils/templateRenderer';

// Convert scene graph to JSON format for rendering
const jsonData = sceneGraphConverter.sceneGraphToJson(sceneGraph);

// Render using existing renderer
renderTemplateElements({
  canvas,
  templateData: jsonData,
  scale: 1,
  interactive: true
});
```

### Editor Integration

```typescript
// When loading a template in the editor
const loadTemplateAsSceneGraph = (templateId: string) => {
  const template = certificateTemplates.find(t => t.id === templateId);
  if (!template) return null;
  
  return sceneGraphConverter.jsonToSceneGraph(template.canvasData);
};

// When saving modifications
const saveSceneGraphAsTemplate = (sceneGraph: SceneGraph) => {
  const jsonData = sceneGraphConverter.sceneGraphToJson(sceneGraph);
  
  // Save to database or local storage
  saveTemplate({
    canvasData: jsonData,
    // ... other template properties
  });
};
```

## Performance Considerations

1. **ID Generation**: Uses timestamp + counter for unique IDs
2. **Traversal**: Depth-first search with callback pattern
3. **Filtering**: Linear search (can be optimized with indexing)
4. **Memory**: Scene graph adds overhead compared to flat JSON

## Future Enhancements

1. **Group Support**: Add proper group node handling
2. **Z-Index/Layers**: Layer management system  
3. **Cloning**: Deep copy nodes with new IDs
4. **Serialization**: Save/load scene graphs from files
5. **Validation**: Schema validation for scene graphs
6. **Diff/Patch**: Track changes between versions
7. **Optimization**: Add indexing for faster lookups
8. **Undo/Redo**: History management using scene graphs

## Summary

The Scene Graph system provides a powerful, hierarchical way to represent and manipulate certificate templates. It maintains backward compatibility with the existing JSON format while enabling more advanced features and better code organization.

Key files:
- `src/types/sceneGraph.ts` - Type definitions
- `src/utils/sceneGraphConverter.ts` - Conversion logic  
- `src/utils/sceneGraphDemo.ts` - Usage examples

For questions or enhancements, refer to the code comments or create an issue.
