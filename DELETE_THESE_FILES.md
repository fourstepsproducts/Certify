# 🗑️ Files to Delete Manually

## Current Situation

The following files in `frontend/src/data/` need to be deleted but may be open in your editor:

### ❌ Files to Delete

1. **`templates.ts`** (26,867 bytes)
   - Old JSON template format
   - No longer needed

2. **`convertTemplates.ts`** (1,389 bytes)
   - Conversion helper script
   - No longer needed

3. **`convertAllTemplates.ts`** (3,252 bytes)
   - Batch conversion script
   - No longer needed

4. **`templates.new.ts`** (6,486 bytes)
   - Example template file
   - No longer needed

5. **`exampleComplexTemplate.ts`** (10,786 bytes)
   - Example complex template
   - No longer needed

6. **`generateTemplates.js`** (3,160 bytes)
   - Generation script
   - No longer needed

7. **`templatesSceneGraph.standalone.ts`** (2,990 bytes)
   - Backup/standalone version
   - No longer needed

### ✅ File to Keep

**`templatesSceneGraph.ts`** (36,620 bytes)
- **KEEP THIS!**
- Your main templates file with 2 Scene Graph templates
- This is the only file you need

## How to Delete

### Option 1: Close Editor First
1. Close all files in your editor
2. Run this command:
   ```bash
   cd d:\Projects\Certificate-Creator\certificate-canvas\frontend\src\data
   del templates.ts convertTemplates.ts convertAllTemplates.ts templates.new.ts exampleComplexTemplate.ts generateTemplates.js templatesSceneGraph.standalone.ts
   ```

### Option 2: Delete from File Explorer
1. Navigate to: `d:\Projects\Certificate-Creator\certificate-canvas\frontend\src\data`
2. Select these 7 files:
   - templates.ts
   - convertTemplates.ts
   - convertAllTemplates.ts
   - templates.new.ts
   - exampleComplexTemplate.ts
   - generateTemplates.js
   - templatesSceneGraph.standalone.ts
3. Press `Delete` key
4. Confirm deletion

### Option 3: Delete from VS Code
1. In VS Code Explorer panel
2. Right-click each file
3. Select "Delete"
4. Confirm each deletion

## After Deletion

You should have only ONE file in the data folder:

```
frontend/src/data/
└── templatesSceneGraph.ts  ← ONLY THIS FILE
```

## Verification

After deleting, verify with:
```bash
dir "d:\Projects\Certificate-Creator\certificate-canvas\frontend\src\data"
```

You should see only `templatesSceneGraph.ts` (36,620 bytes)

---

**Note:** The files couldn't be deleted programmatically because they're likely open in your editor. Please close all tabs and delete manually.
