/**
 * Editor Context - Scene Graph Based
 * 
 * Manages editor state using Scene Graph as the primary data structure
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SceneGraph, SceneNode } from '@/types/sceneGraph';
import { sceneGraphConverter } from '@/utils/sceneGraphConverter';

export type ToolType = 'select' | 'text' | 'shapes' | 'images' | 'draw';

interface EditorContextType {
    // Scene Graph State
    sceneGraph: SceneGraph | null;
    setSceneGraph: (sceneGraph: SceneGraph | null) => void;

    // Selected Node
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
    selectedNode: SceneNode | null;

    // Tools
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;

    // Zoom & Pan
    zoom: number;
    setZoom: (zoom: number) => void;

    // History
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;

    // Node Operations
    updateNode: (nodeId: string, updates: Partial<SceneNode>) => void;
    deleteNode: (nodeId: string) => void;
    addNode: (node: SceneNode, parentId?: string) => void;

    // Template Operations
    loadTemplate: (sceneGraph: SceneGraph) => void;
    exportSceneGraph: () => SceneGraph | null;
    exportJson: () => any;

    // Bulk Generation
    isBulkMode: boolean;
    setIsBulkMode: (mode: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps {
    children: ReactNode;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
    const [sceneGraph, setSceneGraph] = useState<SceneGraph | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<ToolType>('select');
    const [zoom, setZoom] = useState(1);
    const [isBulkMode, setIsBulkMode] = useState(false);

    // History management
    const [history, setHistory] = useState<SceneGraph[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Get selected node
    const selectedNode = React.useMemo(() => {
        if (!sceneGraph || !selectedNodeId) return null;
        return sceneGraphConverter.findNodeById(sceneGraph.root, selectedNodeId);
    }, [sceneGraph, selectedNodeId]);

    // History operations
    const pushHistory = useCallback(() => {
        if (!sceneGraph) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(sceneGraph))); // Deep clone

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [sceneGraph, history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setSceneGraph(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setSceneGraph(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // Node operations
    const updateNode = useCallback((nodeId: string, updates: Partial<SceneNode>) => {
        if (!sceneGraph) return;

        const node = sceneGraphConverter.findNodeById(sceneGraph.root, nodeId);
        if (!node) return;

        // Deep clone scene graph
        const newSceneGraph = JSON.parse(JSON.stringify(sceneGraph));
        const newNode = sceneGraphConverter.findNodeById(newSceneGraph.root, nodeId);

        if (newNode) {
            Object.assign(newNode, updates);
            setSceneGraph(newSceneGraph);
            pushHistory();
        }
    }, [sceneGraph, pushHistory]);

    const deleteNode = useCallback((nodeId: string) => {
        if (!sceneGraph) return;

        const newSceneGraph = JSON.parse(JSON.stringify(sceneGraph));

        // Remove node from parent's children
        const removeFromParent = (parent: any): boolean => {
            if (parent.children) {
                const index = parent.children.findIndex((child: any) => child.id === nodeId);
                if (index !== -1) {
                    parent.children.splice(index, 1);
                    return true;
                }

                // Recursively search children
                for (const child of parent.children) {
                    if (removeFromParent(child)) return true;
                }
            }
            return false;
        };

        if (removeFromParent(newSceneGraph.root)) {
            setSceneGraph(newSceneGraph);
            setSelectedNodeId(null);
            pushHistory();
        }
    }, [sceneGraph, pushHistory]);

    const addNode = useCallback((node: SceneNode, parentId?: string) => {
        if (!sceneGraph) return;

        const newSceneGraph = JSON.parse(JSON.stringify(sceneGraph));

        if (parentId) {
            const parent = sceneGraphConverter.findNodeById(newSceneGraph.root, parentId);
            if (parent && 'children' in parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
            }
        } else {
            // Add to root
            newSceneGraph.root.children = newSceneGraph.root.children || [];
            newSceneGraph.root.children.push(node);
        }

        setSceneGraph(newSceneGraph);
        pushHistory();
    }, [sceneGraph, pushHistory]);

    // Template operations
    const loadTemplate = useCallback((newSceneGraph: SceneGraph) => {
        setSceneGraph(newSceneGraph);
        setHistory([newSceneGraph]);
        setHistoryIndex(0);
        setSelectedNodeId(null);
    }, []);

    const exportSceneGraph = useCallback(() => {
        return sceneGraph;
    }, [sceneGraph]);

    const exportJson = useCallback(() => {
        if (!sceneGraph) return null;
        return sceneGraphConverter.sceneGraphToJson(sceneGraph);
    }, [sceneGraph]);

    const value: EditorContextType = {
        sceneGraph,
        setSceneGraph,
        selectedNodeId,
        setSelectedNodeId,
        selectedNode,
        activeTool,
        setActiveTool,
        zoom,
        setZoom,
        canUndo,
        canRedo,
        undo,
        redo,
        pushHistory,
        updateNode,
        deleteNode,
        addNode,
        loadTemplate,
        exportSceneGraph,
        exportJson,
        isBulkMode,
        setIsBulkMode,
    };

    return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};
