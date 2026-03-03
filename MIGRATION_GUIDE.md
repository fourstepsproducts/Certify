# Scene Graph Migration Guide

## ✅ Implementation Complete!

All 4 phases have been successfully implemented:

### ✅ Phase 1: Templates Updated
- Created `templatesSceneGraph.ts` that auto-converts all JSON templates to Scene Graph
- All templates now available in Scene Graph format
- Backward compatible - original `templates.ts` still works

### ✅ Phase 2: Renderer Updated
- `templateRenderer.ts` now works natively with Scene Graph
- Supports group rendering
- Full backward compatibility with JSON format
- Auto-detects format and converts if needed

### ✅ Phase 3: Editor State Updated
- Created `EditorContext.tsx` using Scene Graph as primary state
- Full undo/redo support
- Node-based operations (update, delete, add)
- Scene Graph manipulation with type safety

### ✅ Phase 4: Backend Updated
- `Template` model supports both Scene Graph and JSON
- Controller auto-detects format
- Migration method available
- Backward compatible with existing templates

---

## Migration Steps

### For Frontend Code

#### 1. Update Template Imports

**Before:**
```typescript
import { certificateTemplates } from '@/data/templates';

const template = certificateTemplates[0];
// template.canvasData is JSON
```

**After:**
```typescript
import { certificateTemplatesSceneGraph } from '@/data/templatesSceneGraph';

const template = certificateTemplatesSceneGraph[0];
// template.sceneGraph is Scene Graph
```

#### 2. Update Editor Usage

**Before:**
```typescript
// Old way - JSON based
const [canvasData, setCanvasData] = useState(template.canvasData);
```

**After:**
```typescript
// New way - Scene Graph based
import { useEditor } from '@/context/EditorContext';

function EditorComponent() {
  const { sceneGraph, loadTemplate, updateNode } = useEditor();
  
  // Load template
  useEffect(() => {
    loadTemplate(template.sceneGraph);
  }, []);
  
  // Manipulate nodes
  const handleTextChange = (nodeId: string, newText: string) => {
    updateNode(nodeId, { text: newText });
  };
}
```

#### 3. Update Rendering

**Before:**
```typescript
renderTemplateElements({
  canvas,
  templateData: template.canvasData,
  scale: 1,
  interactive: true,
});
```

**After:**
```typescript
// Option 1: Direct Scene Graph
import { renderSceneGraph } from '@/utils/templateRenderer';

renderSceneGraph({
  canvas,
  sceneGraph: template.sceneGraph,
  scale: 1,
  interactive: true,
});

// Option 2: Still works! (auto-converts)
renderTemplateElements({
  canvas,
  templateData: template.sceneGraph, // Detects format automatically
  scale: 1,
  interactive: true,
});
```

### For Backend Code

#### 1. Saving Templates

**Before:**
```javascript
const template = await Template.create({
  user: userId,
  name: 'My Template',
  canvasData: jsonData,
  thumbnail: thumbnailUrl,
});
```

**After:**
```javascript
// Option 1: Save as Scene Graph (recommended)
const template = await Template.create({
  user: userId,
  name: 'My Template',
  sceneGraph: sceneGraphData,
  thumbnail: thumbnailUrl,
  category: 'achievement',
});

// Option 2: Save as JSON (still works)
const template = await Template.create({
  user: userId,
  name: 'My Template',
  canvasData: jsonData, // Automatically tagged as 'json' format
  thumbnail: thumbnailUrl,
});
```

#### 2. Reading Templates

```javascript
const template = await Template.findById(templateId);

// Check format
if (template.dataFormat === 'sceneGraph') {
  const sceneGraph = template.sceneGraph;
  // Use Scene Graph
} else {
  const jsonData = template.canvasData;
  // Use JSON (legacy)
}

// Or use the virtual property (recommended)
const data = template.templateData; // Returns appropriate format
```

#### 3. Migrating Old Templates

```javascript
// Migrate a specific template
const template = await Template.findById(templateId);

if (template.dataFormat === 'json') {
  // Migration requires the converter (pass from frontend or implement in backend)
  const migrated = template.migrateToSceneGraph(sceneGraphConverter);
  
  if (migrated) {
    await template.save();
    console.log('Template migrated to Scene Graph');
  }
}

// Bulk migration (all user templates)
const templates = await Template.find({ user: userId, dataFormat: 'json' });

for (const template of templates) {
  if (template.migrateToSceneGraph(converter)) {
    await template.save();
  }
}
```

---

## Component Updates Needed

### 1. Update Editor Components

Files that need updating:
- `CanvasWorkspace.tsx` - Use `useEditor()` hook
- `EditorSidebar.tsx` - Load templates as Scene Graph
- `PropertiesPanel.tsx` - Use `updateNode()` instead of direct manipulation
- `BulkSection.tsx` - Work with Scene Graph nodes

Example for `CanvasWorkspace.tsx`:
```typescript
import { useEditor } from '@/context/EditorContext';
import { renderSceneGraph } from '@/utils/templateRenderer';

function CanvasWorkspace() {
  const { sceneGraph, selectedNodeId, updateNode } = useEditor();
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (sceneGraph && canvasRef.current) {
      renderSceneGraph({
        canvas: canvasRef.current,
        sceneGraph,
        scale: 1,
        interactive: true,
      });
    }
  }, [sceneGraph]);

  // Handle node selection, updates, etc.
}
```

### 2. Update Template Selection

In `EditorSidebar.tsx`:
```typescript
import { certificateTemplatesSceneGraph, getTemplateById } from '@/data/templatesSceneGraph';
import { useEditor } from '@/context/EditorContext';

function EditorSidebar() {
  const { loadTemplate } = useEditor();

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      loadTemplate(template.sceneGraph);
    }
  };

  return (
    <div>
      {certificateTemplatesSceneGraph.map((template) => (
        <div key={template.id} onClick={() => handleTemplateSelect(template.id)}>
          {template.name}
        </div>
      ))}
    </div>
  );
}
```

### 3. Update Save/Export

```typescript
import { useEditor } from '@/context/EditorContext';

function SaveButton() {
  const { exportSceneGraph, exportJson } = useEditor();

  const handleSave = async () => {
    const sceneGraph = exportSceneGraph();
    
    // Save to backend
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'My Template',
        sceneGraph, // Send Scene Graph format
        thumbnail: thumbnailDataUrl,
        category: 'achievement',
      }),
    });
  };

  const handleExportJson = () => {
    // For backward compatibility or export
    const jsonData = exportJson();
    console.log(jsonData);
  };
}
```

---

## Testing Checklist

### Frontend Tests

- [ ] Load templates from `templatesSceneGraph.ts`
- [ ] Render Scene Graph templates correctly
- [ ] Edit text nodes using `updateNode()`
- [ ] Add new nodes using `addNode()`
- [ ] Delete nodes using `deleteNode()`
- [ ] Undo/Redo functionality works
- [ ] Save Scene Graph to backend
- [ ] Load Scene Graph from backend
- [ ] Backward compatibility: old JSON templates still work

### Backend Tests

- [ ] Create template with Scene Graph
- [ ] Create template with JSON (legacy)
- [ ] Read Scene Graph templates
- [ ] Read JSON templates
- [ ] Update: JSON → Scene Graph
- [ ] Update: Scene Graph → Scene Graph
- [ ] `dataFormat` field set correctly
- [ ] Migration method works

---

## Gradual Migration Strategy

You can migrate gradually:

### Week 1: Internal Testing
1. Keep both formats available
2. Test Scene Graph in development
3. Verify backward compatibility

### Week 2: Editor Integration
1. Update editor to use `EditorContext`
2. Load templates as Scene Graph
3. Save as Scene Graph (backend handles both)

### Week 3: Frontend Migration
1. Update all components to use Scene Graph
2. Keep JSON as fallback
3. Test bulk operations

### Week 4: Data Migration
1. Migrate existing user templates in database
2. Monitor for issues
3. Deprecate JSON format (optional)

---

## Rollback Plan

If issues arise, rollback is easy:

1. **Frontend**: Import from `templates.ts` instead of `templatesSceneGraph.ts`
2. **Backend**: System still accepts JSON format
3. **Editor**: Old state management still works

---

## Benefits Achieved

### ✅ Hierarchical Structure
- Group related elements
- Better organization
- Parent-child relationships

### ✅ Better Manipulation
- Find nodes by ID or type
- Update single properties
- Tree traversal

### ✅ Type Safety
- Full TypeScript support
- Compile-time checking
- IntelliSense everywhere

### ✅ Extensibility
- Easy to add new node types
- Support for layers
- Animation ready

### ✅ Backward Compatible
- Old templates still work
- Gradual migration
- No breaking changes

---

## FAQ

**Q: Do I need to convert all templates immediately?**
A: No! The system supports both formats. Migrate gradually.

**Q: What happens to existing user templates?**
A: They continue to work as JSON format. Use the migration method when ready.

**Q: Can I still export to JSON?**
A: Yes! Use `sceneGraphConverter.sceneGraphToJson()` or `exportJson()` in the editor.

**Q: How do I create groups?**
A: Use the `GroupNode` type and nest children:
```typescript
const group: GroupNode = {
  id: 'group_1',
  type: 'group',
  name: 'Signature Section',
  transform: { x: 0, y: 400, scaleX: 1, scaleY: 1, rotation: 0 },
  visible: true,
  opacity: 1,
  locked: false,
  selectable: true,
  children: [textNode1, textNode2, imageNode],
};
```

**Q: Performance impact?**
A: Minimal. Scene Graph adds slight overhead but provides much better manipulation performance.

---

## Support

For issues or questions:
1. Check `SCENE_GRAPH_README.md` for detailed documentation
2. See `SCENE_GRAPH_QUICK_REFERENCE.md` for code examples
3. Review `SCENE_GRAPH_ARCHITECTURE.md` for system design

---

**Status**: ✅ All Phases Complete - Ready for Integration!
