# Scene Graph System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Certificate Canvas Application                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ▼                         ▼
          ┌──────────────────┐      ┌──────────────────┐
          │   JSON Format    │      │  Scene Graph     │
          │   (Storage)      │◄────►│  (Manipulation)  │
          └──────────────────┘      └──────────────────┘
                   │                         │
                   │                         │
        ┌──────────┴──────────┐   ┌─────────┴─────────┐
        │                     │   │                   │
        ▼                     ▼   ▼                   ▼
┌─────────────┐      ┌─────────────────┐    ┌──────────────┐
│  Templates  │      │ Template        │    │ Visualizer & │
│  Database   │      │ Renderer        │    │ Analytics    │
└─────────────┘      └─────────────────┘    └──────────────┘
```

## Data Flow

```
1. LOAD TEMPLATE
   ┌──────────────┐
   │  templates.ts│
   └──────┬───────┘
          │ JSON
          ▼
   ┌─────────────────────┐
   │  SceneGraphConverter│
   │  .jsonToSceneGraph()│
   └──────┬──────────────┘
          │ SceneGraph
          ▼
   ┌─────────────────┐
   │  Editor State   │
   └─────────────────┘

2. MANIPULATE
   ┌──────────────────┐
   │  Scene Graph     │
   │  - Find nodes    │
   │  - Modify props  │
   │  - Add/remove    │
   └──────┬───────────┘
          │
          ▼
   ┌──────────────────┐
   │  Updated Graph   │
   └──────────────────┘

3. SAVE/RENDER
   ┌──────────────────┐
   │  Scene Graph     │
   └──────┬───────────┘
          │
          ▼
   ┌─────────────────────┐
   │  SceneGraphConverter│
   │  .sceneGraphToJson()│
   └──────┬──────────────┘
          │ JSON
          ▼
   ┌──────────────────┐
   │  Template        │
   │  Renderer /      │
   │  Database        │
   └──────────────────┘
```

## Scene Graph Structure

```
SceneGraph
└── version: "1.0.0"
└── metadata: { ... }
└── root: RootNode
    ├── id: "root_1_..."
    ├── type: "root"
    ├── width: 800
    ├── height: 560
    ├── backgroundColor: "#FFF"
    ├── transform: { x, y, scaleX, scaleY, rotation }
    └── children: SceneNode[]
        ├── RectNode
        │   ├── id: "rect_2_..."
        │   ├── type: "rect"
        │   ├── width: 720
        │   ├── height: 480
        │   ├── fill: "transparent"
        │   └── transform: { ... }
        │
        ├── TextNode
        │   ├── id: "text_3_..."
        │   ├── type: "text"
        │   ├── text: "Certificate"
        │   ├── fontSize: 42
        │   ├── fontFamily: "Outfit"
        │   └── transform: { ... }
        │
        ├── CircleNode
        │   ├── id: "circle_4_..."
        │   ├── type: "circle"
        │   ├── radius: 50
        │   └── transform: { ... }
        │
        └── ImageNode
            ├── id: "image_5_..."
            ├── type: "image"
            ├── src: "/assets/logo.png"
            ├── width: 100
            └── transform: { ... }
```

## Module Architecture

```
┌───────────────────────────────────────────────────────────┐
│                      src/sceneGraph.ts                    │
│                    (Main Entry Point)                     │
└────────────────────────┬──────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌───────────┐ ┌──────────────┐
│ types/         │ │ utils/    │ │ utils/       │
│ sceneGraph.ts  │ │ sceneGraphConverutils/       │
│                │ │           │ │ sceneGraph   │
│ - Interfaces   │ │ - Convert │ │ Visualizer.ts│
│ - Types        │ │ - Query   │ │              │
│ - Enums        │ │ - Traverse│ │ - Visualize  │
│                │ │           │ │ - Stats      │
└────────────────┘ └───────────┘ └──────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌───────────┐ ┌──────────────┐
│ utils/         │ │ utils/    │ │ Docs/        │
│ sceneGraphDemo │ │ sceneGraphExample.ts      │
│ .ts            │ │           │ │ - README     │
│                │ │ - Examples│ │ - Quick Ref  │
│ - Demos        │ │ - Tests   │ │ - Summary    │
└────────────────┘ └───────────┘ └──────────────┘
```

## Node Type Hierarchy

```
SceneNodeBase (Abstract)
│
├── RootNode
│   └── Special: Canvas container
│
├── GroupNode
│   └── Container for organizing elements
│
├── Shape Nodes
│   ├── RectNode
│   ├── CircleNode
│   ├── PolygonNode
│   └── LineNode
│
├── Text Nodes
│   ├── TextNode (single-line)
│   └── TextboxNode (multi-line)
│
├── Content Nodes
│   ├── ImageNode
│   └── PathNode (SVG)
│
└── Special Nodes
    └── DecorativeCurveNode
```

## Conversion Flow

```
INPUT: JSON Template
{
  "backgroundColor": "#FFF",
  "elements": [
    { "type": "rect", "left": 40, "top": 40, ... },
    { "type": "text", "text": "Hello", ... }
  ]
}
        │
        ▼
┌──────────────────────────────┐
│ SceneGraphConverter          │
│ .jsonToSceneGraph()          │
│                              │
│ 1. Create RootNode           │
│ 2. For each element:         │
│    - Generate unique ID      │
│    - Create Transform        │
│    - Convert to SceneNode    │
│ 3. Build children array      │
└──────────────┬───────────────┘
               ▼
OUTPUT: Scene Graph
{
  version: "1.0.0",
  root: {
    id: "root_1_...",
    type: "root",
    backgroundColor: "#FFF",
    children: [
      { id: "rect_2_...", type: "rect", transform: {...}, ... },
      { id: "text_3_...", type: "text", transform: {...}, ... }
    ]
  }
}
        │
        ▼
┌──────────────────────────────┐
│ Manipulation Layer           │
│                              │
│ - Query nodes by type/ID     │
│ - Modify properties          │
│ - Add/remove nodes           │
│ - Calculate bounds           │
│ - Traverse tree              │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ SceneGraphConverter          │
│ .sceneGraphToJson()          │
│                              │
│ 1. Extract root properties   │
│ 2. For each child:           │
│    - Convert to element      │
│    - Extract transform       │
│    - Map properties          │
│ 3. Return JSON               │
└──────────────┬───────────────┘
               ▼
OUTPUT: JSON Template
{
  "backgroundColor": "#FFF",
  "elements": [...]
}
```

## Query Operations

```
              SceneGraph Root
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
  Node 1         Node 2         Node 3
    │
    └─ Children
       ├─ Node 1.1
       └─ Node 1.2

Operations:
─────────────────────────────────────
1. findNodeById(root, "text_3_...")
   → Depth-first search
   → Returns: Node or null

2. getNodesByType(root, "text")
   → Traverses entire tree
   → Returns: Array of matching nodes

3. traverseSceneGraph(root, callback)
   → Visits every node
   → Executes callback(node, depth)
   → Depth-first traversal

4. calculateBoundingBox(root)
   → Traverses all nodes
   → Calculates min/max bounds
   → Returns: { x, y, width, height }
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                 Existing Application                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Templates   │         │   Editor     │            │
│  │  (JSON)      │         │   State      │            │
│  └──────┬───────┘         └──────┬───────┘            │
│         │                        │                     │
│         │  ┌─────────────────────┼──────┐             │
│         │  │ Scene Graph System  │      │             │
│         │  │                     │      │             │
│         ▼  ▼                     ▼      ▼             │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Converter   │◄───────►│ Manipulator  │            │
│  └──────┬───────┘         └──────┬───────┘            │
│         │                        │                     │
│         ▼                        ▼                     │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Renderer    │         │  Visualizer  │            │
│  │  (Fabric.js) │         │  (Console)   │            │
│  └──────────────┘         └──────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Benefits Summary

```
┌──────────────────┐     ┌──────────────────┐
│   Flat JSON      │ VS  │  Scene Graph     │
├──────────────────┤     ├──────────────────┤
│ ❌ Array search  │     │ ✅ Tree queries  │
│ ❌ No hierarchy  │     │ ✅ Parent-child  │
│ ❌ Hard to group │     │ ✅ Easy grouping │
│ ✅ Simple save   │     │ ✅ Converts back │
│ ✅ Direct render │     │ ✅ Still renders │
└──────────────────┘     └──────────────────┘

         Best of Both Worlds
         ──────────────────
         JSON for Storage
         Scene Graph for Logic
```

---

This architecture allows the certificate canvas to:
1. **Store** templates in simple JSON format
2. **Manipulate** templates using powerful scene graph
3. **Render** templates efficiently with Fabric.js
4. **Analyze** templates with visualization tools
5. **Extend** easily with new features (groups, animations, etc.)
