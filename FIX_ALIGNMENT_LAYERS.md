# ✅ Fixed Misalignment & Layer Selection

## 1. Fixed Template Misalignment
**The Problem:** The text and elements in the "Professional Achievement" template were jumbled/overlapping.
**The Cause:** The template system was forcing groups to move to position `(0,0)`, dragging all their children (text, lines) with them, even though the children were already observing correct absolute positions.
**The Fix:** Updated the renderer to let Fabric.js **automatically calculate** the group position based on its children.
**Result:** Elements stay exactly where they are supposed to be! "John Anderson" will align perfectly with "Certificate". ✅

## 2. Fixed "Can't Select Lower Layers"
**The Problem:** If a group (like a border) was on top, you couldn't click text underneath it, even if the group was transparent.
**The Fix:** Enabled `perPixelTargetFind: true` on the canvas.
**Result:** You can now **click through** transparent parts of a group/image to select items underneath! 🎯
- **Border on top?** No problem, just click the text in the middle.
- **Group on top?** You can select what's behind it.

## Verification
1. **Reload** the page.
2. Load "Professional Achievement" template.
3. ✅ Check alignment - Text should be correctly positioned.
4. ✅ Test selection - Verify you can select text even if the border group is visually "above" it.
