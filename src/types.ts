export type GeometryType = 
  | 'box' 
  | 'sphere' 
  | 'cylinder' 
  | 'cone' 
  | 'torus' 
  | 'capsule' 
  | 'ring';

export type MaterialType = 
  | 'plastic' 
  | 'metal' 
  | 'glass' 
  | 'wood' 
  | 'fabric' 
  | 'rubber' 
  | 'matte' 
  | 'glossy' 
  | 'emissive';

export type ModelQuality = 'low' | 'medium' | 'high';
export type LightingPreset = 'studio' | 'neon' | 'warm' | 'cool';

export interface SceneObject {
  id: string;
  name: string;
  type: GeometryType;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  color: string;
  material: MaterialType;
  metalness?: number;
  roughness?: number;
  transmission?: number;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  wireframe?: boolean;
}

export interface SceneDescription {
  title: string;
  category: string;
  backgroundColor: string;
  quality: ModelQuality;
  lightingPreset: LightingPreset;
  objects: SceneObject[];
}

export interface ImageAnalysisResult {
  objectName: string;
  category: string;
  shape: string;
  visibleSurfaces?: string;
  approximateDepth?: string;
  materials: string[];
  colors: string[];
  symmetry: string;
  complexity: 'low' | 'medium' | 'high' | string;
  importantDetails?: string;
  reconstruction: string;
}

export interface UploadedImageInfo {
  dataUrl: string;
  name: string;
  size: number;
  width: number;
  height: number;
  type: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  status?: 'applied' | 'failed' | 'processing';
}

export interface DemoImageItem {
  id: string;
  name: string;
  category: string;
  label: string;
  thumbnail: string;
  analysis: ImageAnalysisResult;
}
