# ✅ Templates Now in Scene Graph Format!

## What Changed

The **`templatesSceneGraph.ts`** file is now the **primary templates file** with Scene Graph format.

### File Structure

```
frontend/src/data/
├── templates.ts              ← Old JSON format (still exists for conversion)
└── templatesSceneGraph.ts    ← NEW: Scene Graph format (USE THIS!)
```

## How It Works

### Automatic Conversion
```typescript
// templatesSceneGraph.ts
import { certificateTemplates as oldJSONTemplates } from './templates';

// Converts ALL templates to Scene Graph on import
export const certificateTemplates: CertificateTemplate[] = 
  oldJSONTemplates.map(convertTemplateToSceneGraph);
```

### What You Get
- ✅ All 10 templates in Scene Graph format
- ✅ Hierarchical structure
- ✅ Full type safety
- ✅ Helper functions included

## Usage

### Import the Scene Graph Templates

**❌ OLD WAY (Don't use):**
```typescript
import { certificateTemplates } from '@/data/templates';
// This gives you JSON format
```

**✅ NEW WAY (Use this):**
```typescript
import { certificateTemplates } from '@/data/templatesSceneGraph';
// This gives you Scene Graph format
```

### Complete Example

```typescript
import { 
  certificateTemplates,
  getTemplateById,
  getTemplatesByCategory,
  searchTemplates 
} from '@/data/templatesSceneGraph';

// Get all templates (Scene Graph format)
console.log(certificateTemplates);
// Output: Array of CertificateTemplate with sceneGraph property

// Get by ID
const template = getTemplateById('elegant-gold');
console.log(template.sceneGraph); // Full Scene Graph structure

// Get by category
const achievements = getTemplatesByCategory('achievement');

// Search
const results = searchTemplates('certificate');
```

### Using in Components

```typescript
import { useEffect } from 'react';
import { certificateTemplates } from '@/data/templatesSceneGraph';
import { useEditor } from '@/context/EditorContext';
import { renderSceneGraph } from '@/utils/templateRenderer';

function TemplateGallery() {
  const { loadTemplate } = useEditor();

  const handleTemplateSelect = (templateId: string) => {
    const template = certificateTemplates.find(t => t.id === templateId);
    if (template) {
      // Load Scene Graph into editor
      loadTemplate(template.sceneGraph);
    }
  };

  return (
    <div>
      {certificateTemplates.map((template) => (
        <div key={template.id} onClick={() => handleTemplateSelect(template.id)}>
          <img src={template.preview} alt={template.name} />
          <h3>{template.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

## Helper Functions

### `getTemplateById(id: string)`
```typescript
const template = getTemplateById('elegant-gold');
if (template) {
  console.log(template.sceneGraph);
}
```

### `getTemplatesByCategory(category: string)`
```typescript
const achievements = getTemplatesByCategory('achievement');
const all = getTemplatesByCategory('all');
```

### `getAllTemplateIds()`
```typescript
const ids = getAllTemplateIds();
// ['elegant-gold', 'modern-blue', ...]
```

### `getTemplateCount()`
```typescript
const count = getTemplateCount();
console.log(`Total templates: ${count}`);
```

### `searchTemplates(query: string)`
```typescript
const results = searchTemplates('gold');
// Returns templates matching 'gold' in name or category
```

### `sceneGraphToJson(sceneGraph: SceneGraph)`
```typescript
// Convert back to JSON if needed (backward compatibility)
const jsonData = sceneGraphToJson(template.sceneGraph);
```

## Migration Steps

### Step 1: Update Imports
Replace all:
```typescript
import { certificateTemplates } from '@/data/templates';
```

With:
```typescript
import { certificateTemplates } from '@/data/templatesSceneGraph';
```

### Step 2: Update Usage
Change from:
```typescript
const template = certificateTemplates[0];
// template.canvasData (JSON)
```

To:
```typescript
const template = certificateTemplates[0];
// template.sceneGraph (Scene Graph!)
```

### Step 3: Update Rendering
Change from:
```typescript
renderTemplateElements({
  canvas,
  templateData: template.canvasData,
  ...
});
```

To:
```typescript
renderSceneGraph({
  canvas,
  sceneGraph: template.sceneGraph,
  ...
});
```

Or use the auto-detect version:
```typescript
renderTemplateElements({
  canvas,
  templateData: template.sceneGraph, // Auto-detects format!
  ...
});
```

## Benefits

### Before (JSON)
```typescript
const template = certificateTemplates[0];
template.canvasData.elements; // Flat array
// Hard to find specific elements
// No hierarchy
```

### After (Scene Graph)
```typescript
const template = certificateTemplates[0];
template.sceneGraph.root.children; // Hierarchical tree
// Easy to query nodes
// Full type safety
```

### Example: Find All Text Nodes
```typescript
import { sceneGraphConverter } from '@/sceneGraph';

const template = certificateTemplates[0];
const textNodes = sceneGraphConverter.getNodesByType(
  template.sceneGraph.root,
  'text'
);

console.log(`Found ${textNodes.length} text nodes`);
```

## Type Definitions

```typescript
interface CertificateTemplate {
  id: string;
  name: string;
  category: 'participation' | 'achievement' | 'completion' | 'award';
  preview: string;
  sceneGraph: SceneGraph;  // ← Scene Graph!
}

interface SceneGraph {
  version: string;
  root: RootNode;
  metadata?: {
    templateId?: string;
    templateName?: string;
    category?: string;
    author?: string;
    createdAt?: string;
  };
}
```

## Console Output

When you import `templatesSceneGraph.ts`, you'll see:
```
✅ Loaded 10 templates in Scene Graph format
```

This confirms all templates were converted successfully.

## Old Templates File

The old `templates.ts` file still exists and contains the original JSON data. It's used by `templatesSceneGraph.ts` for automatic conversion.

**You can keep it for:**
- Backward compatibility
- Reference
- Easier manual editing of templates

**Eventually, you can:**
- Delete `templates.ts`
- Store templates directly in Scene Graph format
- Or keep both for dual format support

## Summary

✅ **Use `templatesSceneGraph.ts`** for all new code  
✅ All templates automatically converted to Scene Graph  
✅ Full type safety with TypeScript  
✅ Helper functions included  
✅ Backward compatible with JSON format  
✅ Easy to query and manipulate  

**Next steps:**
1. Update all imports to use `templatesSceneGraph.ts`
2. Test template loading in your app
3. Enjoy the benefits of Scene Graph! 🎉
