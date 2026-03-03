import type { SceneGraph } from './sceneGraph';

export interface CertificateTemplate {
  id: string;
  name: string;
  category: 'participation' | 'achievement' | 'completion' | 'award' | 'sports';
  preview: string;
  sceneGraph: SceneGraph;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties: Record<string, unknown>;
}

export interface Design {
  id: string;
  title: string;
  canvasData: object;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ToolType = 'select' | 'text' | 'shapes' | 'images' | 'draw';

export interface EditorState {
  activeTool: ToolType;
  selectedElement: string | null;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
}
