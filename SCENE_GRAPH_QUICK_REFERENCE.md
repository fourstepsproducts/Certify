# Scene Graph Quick Reference

## Installation & Import

```typescript
// Import the converter
import { sceneGraphConverter } from '@/utils/sceneGraphConverter';

// Import types
import type { SceneGraph, SceneNode, TextNode } from '@/types/sceneGraph';

// Import visualizer (optional)
import { visualizeSceneGraph, printSceneGraph } from '@/utils/sceneGraphVisualizer';

// Import demo utilities (optional)
import sceneGraphDemo from '@/utils/sceneGraphDemo';
```

## Core Operations

### 1. Convert JSON → Scene Graph

```typescript
const sceneGraph = sceneGraphConverter.jsonToSceneGraph(templateData);
```

### 2. Convert Scene Graph → JSON

```typescript
const jsonData = sceneGraphConverter.sceneGraphToJson(sceneGraph);
```

### 3. Traverse All Nodes

```typescript
sceneGraphConverter.traverseSceneGraph(sceneGraph.root, (node, depth) => {
  console.log(`${'  '.repeat(depth)}- ${node.type}`);
});
```

### 4. Find Node by ID

```typescript
const node = sceneGraphConverter.findNodeById(sceneGraph.root, 'text_1_1234567890');
```

### 5. Get Nodes by Type

```typescript
const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');
const rectNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'rect');
```

### 6. Calculate Bounding Box

```typescript
const bbox = sceneGraphConverter.calculateBoundingBox(sceneGraph.root);
// Returns: { x, y, width, height }
```

## Common Patterns

### Pattern 1: Load Template as Scene Graph

```typescript
import { certificateTemplates } from '@/data/templates';

const template = certificateTemplates.find(t => t.id === 'elegant-gold');
const sceneGraph = sceneGraphConverter.jsonToSceneGraph(template.canvasData);
```

### Pattern 2: Modify Text Nodes

```typescript
const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');

textNodes.forEach((node) => {
  const textNode = node as TextNode;
  if (textNode.text.includes('John Doe')) {
    textNode.text = 'Jane Smith';
    textNode.fontSize = 50;
  }
});

// Convert back to JSON to save/render
const updatedJson = sceneGraphConverter.sceneGraphToJson(sceneGraph);
```

### Pattern 3: Filter and Transform

```typescript
// Get all text nodes with specific font
const textNodes = sceneGraphConverter.getNodesByType(sceneGraph.root, 'text');
const outfitTexts = textNodes.filter((node) => {
  return (node as TextNode).fontFamily === 'Outfit';
});

// Update them
outfitTexts.forEach((node) => {
  (node as TextNode).fill = '#FF0000'; // Change color to red
});
```

### Pattern 4: Count Elements

```typescript
const stats = {
  texts: sceneGraphConverter.getNodesByType(sceneGraph.root, 'text').length,
  textboxes: sceneGraphConverter.getNodesByType(sceneGraph.root, 'textbox').length,
  images: sceneGraphConverter.getNodesByType(sceneGraph.root, 'image').length,
  shapes: [
    ...sceneGraphConverter.getNodesByType(sceneGraph.root, 'rect'),
    ...sceneGraphConverter.getNodesByType(sceneGraph.root, 'circle'),
    ...sceneGraphConverter.getNodesByType(sceneGraph.root, 'polygon'),
  ].length,
};
```

### Pattern 5: Inspect and Debug

```typescript
import { printSceneGraph, generateMarkdownReport } from '@/utils/sceneGraphVisualizer';

// Print to console
printSceneGraph(sceneGraph);

// Generate markdown report
const report = generateMarkdownReport(sceneGraph);
console.log(report);
```

## Node Types Reference

| Type | Description | Properties |
|------|-------------|------------|
| `root` | Canvas root | `width`, `height`, `backgroundColor` |
| `text` | Single-line text | `text`, `fontSize`, `fontFamily`, `fill` |
| `textbox` | Multi-line text | `text`, `width`, `fontSize`, `fontFamily` |
| `rect` | Rectangle | `width`, `height`, `fill`, `stroke` |
| `circle` | Circle | `radius`, `fill`, `stroke` |
| `polygon` | Polygon | `points[]`, `fill`, `stroke` |
| `line` | Line | `x1`, `y1`, `x2`, `y2`, `stroke` |
| `image` | Image | `src`, `width`, `height` |
| `path` | SVG Path | `pathData`, `fill`, `stroke` |
| `decorativeCurve` | Decoration | `position`, `colors[]`, `style` |

## Transform Properties

Every node has a `transform` object:

```typescript
{
  x: number;        // Position X
  y: number;        // Position Y
  scaleX: number;   // Scale X (default: 1)
  scaleY: number;   // Scale Y (default: 1)
  rotation: number; // Rotation in degrees (default: 0)
}
```

## Demo Scripts

### Convert All Templates

```typescript
const allSceneGraphs = sceneGraphDemo.convertTemplatesToSceneGraphs();
```

### Inspect Template

```typescript
const sceneGraph = sceneGraphDemo.inspectTemplateSceneGraph('elegant-gold');
```

### Get All Text Nodes

```typescript
const textNodes = sceneGraphDemo.getAllTextNodes('internship-certificate');
```

### Run Example

```typescript
import runSceneGraphExample from '@/utils/sceneGraphExample';

const sceneGraph = runSceneGraphExample();
```

## Integration Examples

### With Template Renderer

```typescript
import { renderTemplateElements } from '@/utils/templateRenderer';

// Convert scene graph to JSON
const jsonData = sceneGraphConverter.sceneGraphToJson(sceneGraph);

// Render
renderTemplateElements({
  canvas,
  templateData: jsonData,
  scale: 1,
  interactive: true,
});
```

### With Editor

```typescript
// Load template into editor
const loadTemplate = (templateId: string) => {
  const template = certificateTemplates.find(t => t.id === templateId);
  const sceneGraph = sceneGraphConverter.jsonToSceneGraph(template.canvasData);
  
  // Use scene graph in your editor state
  setEditorSceneGraph(sceneGraph);
};

// Save modifications
const saveTemplate = () => {
  const jsonData = sceneGraphConverter.sceneGraphToJson(editorSceneGraph);
  
  // Save to backend/database
  saveToDatabase({
    ...template,
    canvasData: jsonData,
  });
};
```

## Tips & Best Practices

1. **Always traverse, don't mutate during traversal**
   ```typescript
   // ❌ Bad: Modifying during traversal
   sceneGraphConverter.traverseSceneGraph(root, (node) => {
     if (node.type === 'text') {
       sceneGraph.root.children.push(newNode); // Don't do this!
     }
   });

   // ✓ Good: Collect first, then mutate
   const nodesToModify: SceneNode[] = [];
   sceneGraphConverter.traverseSceneGraph(root, (node) => {
     if (node.type === 'text') {
       nodesToModify.push(node);
     }
   });
   nodesToModify.forEach(node => {
     // Modify now
   });
   ```

2. **Use type assertions for specific node types**
   ```typescript
   const textNode = node as TextNode;
   const rectNode = node as RectNode;
   ```

3. **Check node type before accessing properties**
   ```typescript
   if (node.type === 'text') {
     const textNode = node as TextNode;
     console.log(textNode.text); // Safe
   }
   ```

4. **Preserve backward compatibility**
   - Always convert scene graph back to JSON for saving
   - JSON format is the source of truth for storage

5. **Use visualizer for debugging**
   ```typescript
   import { printSceneGraph } from '@/utils/sceneGraphVisualizer';
   printSceneGraph(sceneGraph); // Beautiful console output
   ```

## Cheat Sheet

```typescript
// Convert
const sg = sceneGraphConverter.jsonToSceneGraph(json);
const json = sceneGraphConverter.sceneGraphToJson(sg);

// Query
const node = sceneGraphConverter.findNodeById(sg.root, id);
const nodes = sceneGraphConverter.getNodesByType(sg.root, 'text');

// Traverse
sceneGraphConverter.traverseSceneGraph(sg.root, (node, depth) => {
  /* ... */
});

// Analyze
const bbox = sceneGraphConverter.calculateBoundingBox(sg.root);

// Debug
import { printSceneGraph } from '@/utils/sceneGraphVisualizer';
printSceneGraph(sg);
```

## Files

- `src/types/sceneGraph.ts` — Type definitions
- `src/utils/sceneGraphConverter.ts` — Core converter
- `src/utils/sceneGraphVisualizer.ts` — Visualization tools
- `src/utils/sceneGraphDemo.ts` — Demo utilities
- `src/utils/sceneGraphExample.ts` — Example script
- `SCENE_GRAPH_README.md` — Full documentation
- `SCENE_GRAPH_QUICK_REFERENCE.md` — This file

---

**Need Help?** Check the full documentation in `SCENE_GRAPH_README.md`
