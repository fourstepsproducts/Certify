# ✅ Scene Graph Templates - Final Setup

## Current Status

✅ **`templatesSceneGraph.ts`** - Working and ready!  
✅ **All 10 templates** available in Scene Graph format  
✅ **Groups and hierarchy** fully supported  
✅ **Dynamic conversion** from templates.ts (temporary)  

## Your Two Options

### Option 1: Keep Current Setup (Recommended for now) ✅

**Current structure:**
``

`
templates.ts (1,075 lines) → templatesSceneGraph.ts (converts dynamically)
```

**Benefits:**
- ✅ Works immediately
- ✅ Can add complex Scene Graph templates
- ✅ Easy to maintain
- ✅ Best of both worlds

**Usage:**
```typescript
import { certificateTemplates } from '@/data/templatesSceneGraph';
// All templates in Scene Graph format!
```

### Option 2: Delete templates.ts Later

When you're ready to fully commit to Scene Graph:

1. **Add new complex templates** directly in Scene Graph format (see `exampleComplexTemplate.ts`)
2. **Convert old templates one-by-one** when you need to add groups/hierarchy to them
3. **Eventually delete** `templates.ts` when all old templates are converted

## How to Create Complex Certificates

### Example: Certificate with Groups

See `exampleComplexTemplate.ts` for a complete example with:
- ✅ **Border Group** (outer + inner borders)
- ✅ **Header Group** (title + subtitle)
- ✅ **Content Group** (intro + name + underline)
- ✅ **Signature Group** (image + name + title)

### Adding to Your Templates

```typescript
// In templatesSceneGraph.ts

import { complexCertificateExample } from './exampleComplexTemplate';

export const certificateTemplates: CertificateTemplate[] = [
  // ... existing converted templates
  complexCertificateExample, // Add new complex template
];
```

### Benefits of Groups

```typescript
// Move entire signature section
const signatureGroup = converter.findNodeById(root, 'group_signature');
signatureGroup.transform.y = 450; // All children move together!

// Hide/Show entire header
const headerGroup = converter.findNodeById(root, 'group_header');
headerGroup.visible = false; // Title + subtitle hidden

// Lock border so it can't be edited
const borderGroup = converter.findNodeById(root, 'group_border');
borderGroup.locked = true;
```

## File Cleanup

You can now delete these temporary files:

```bash
# Already deleted:
✅ templates.new.ts
✅ convertTemplates.ts  
✅ convertAllTemplates.ts

# Keep for now (or delete if you want):
⚠️ templates.ts - Still used by templatesSceneGraph.ts
⚠️ generateTemplates.js - Helper script (can delete)
⚠️ templatesSceneGraph.standalone.ts - Backup (can delete)

# Keep these:
✅ templatesSceneGraph.ts - MAIN FILE (use this!)
✅ exampleComplexTemplate.ts - Example for creating complex certs
```

## Next Steps

### 1. Start Using Scene Graph Templates

```typescript
import { certificateTemplates, getTemplateById } from '@/data/templatesSceneGraph';

const template = getTemplateById('elegant-gold');
console.log(template.sceneGraph); // Scene Graph format!
```

### 2. Create Your First Complex Certificate

Copy `exampleComplexTemplate.ts` and create your own:

```typescript
export const myComplexCertificate: CertificateTemplate = {
  id: 'my-complex-cert',
  name: 'My Complex Certificate',
  category: 'achievement',
  preview: '/templates/my-complex.jpg',
  sceneGraph: {
    version: '1.0.0',
    root: {
      // ... your custom groups and hierarchy
      children: [
        {
          id: 'group_background',
          type: 'group',
          name: 'Background Elements',
          children: [
            // Background decorations
          ]
        },
        {
          id: 'group_main_content',
          type: 'group',
          name: 'Main Content',
          children: [
            // Main text and elements
          ]
        },
        // ... more groups
      ]
    }
  }
};
```

### 3. Use Groups in Editor

```typescript
import { useEditor } from '@/context/EditorContext';

const { updateNode } = useEditor();

// Move entire group
updateNode('group_signature', {
  transform: { x: 0, y: 450, scaleX: 1, scaleY: 1, rotation: 0 }
});

// Hide group
updateNode('group_header', { visible: false });
```

## Summary

✅ **Scene Graph templates working**  
✅ **Can create complex certificates with groups**  
✅ **Easy to add new templates**  
✅ **Flexible and powerful**  

**Main file to use:**
```typescript
import { certificateTemplates } from '@/data/templatesSceneGraph';
```

**Example for complex certificates:**
```typescript
import { exampleComplexTemplate } from '@/data/exampleComplexTemplate';
```

You're all set to create complex, hierarchical certificates with groups! 🎉
