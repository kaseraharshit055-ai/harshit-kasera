import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { SceneDescription, SceneObject, MaterialType } from '../types';

export type ExportFormat = 'glb' | 'obj' | 'stl' | 'json';

export interface ExportFormatOption {
  id: ExportFormat;
  extension: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  badgeColor: string;
  iconName: string;
  includesMaterials: boolean;
  recommendedUse: string;
}

export const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    id: 'glb',
    extension: '.glb',
    name: 'GLB (Binary glTF 2.0)',
    tagline: 'Standard 3D Web & AR Format',
    description: 'Compact binary bundle containing complete mesh geometry, PBR physical materials, and transforms.',
    badge: 'Recommended',
    badgeColor: 'border-[#00f2ff]/40 bg-[#00f2ff]/10 text-[#00f2ff]',
    iconName: 'Box',
    includesMaterials: true,
    recommendedUse: 'Blender, Three.js, WebGL, Unity, Unreal, AR / VR'
  },
  {
    id: 'obj',
    extension: '.obj',
    name: 'Wavefront OBJ',
    tagline: 'Universal 3D Modeling Mesh',
    description: 'Widely compatible open geometry format supported by virtually every 3D modeling and rendering software.',
    badge: 'Universal',
    badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    iconName: 'Layers',
    includesMaterials: false,
    recommendedUse: 'Maya, Cinema 4D, 3ds Max, Blender, ZBrush'
  },
  {
    id: 'stl',
    extension: '.stl',
    name: 'Stereolithography (STL)',
    tagline: 'Direct 3D Printing & Slicing',
    description: 'High-precision binary triangle tessellation optimized for slicers and additive manufacturing.',
    badge: '3D Printing',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    iconName: 'Printer',
    includesMaterials: false,
    recommendedUse: 'Ultimaker Cura, PrusaSlicer, Bambu Studio, CAD'
  },
  {
    id: 'json',
    extension: '.json',
    name: 'ShapeX Scene Schema',
    tagline: 'Parametric Scene Tree',
    description: 'Full JSON scene graph with parametric components, transform matrices, materials, and lighting presets.',
    badge: 'Parametric',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    iconName: 'FileCode',
    includesMaterials: true,
    recommendedUse: 'ShapeX reload, Web APIs, Custom Procedural Pipelines'
  }
];

/**
 * Builds a THREE.Group from a ShapeX SceneDescription.
 */
export function buildThreeGroupFromScene(
  scene: SceneDescription,
  materialOverride?: MaterialType | null
): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = scene.title || 'ShapeX_Model';

  scene.objects.forEach((obj: SceneObject) => {
    // 1. Geometry
    let geometry: THREE.BufferGeometry;
    switch (obj.type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.5, 0.15, 24, 48);
        break;
      case 'capsule':
        geometry = new THREE.CapsuleGeometry(0.4, 0.8, 16, 32);
        break;
      case 'ring':
        geometry = new THREE.RingGeometry(0.3, 0.5, 32);
        break;
      case 'box':
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
    }

    // 2. Material
    const effectiveMat = materialOverride || obj.material || 'plastic';
    const matColor = new THREE.Color(obj.color || '#cccccc');

    let material: THREE.Material;
    switch (effectiveMat) {
      case 'metal':
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: 0.9,
          roughness: 0.18,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'glass':
        material = new THREE.MeshPhysicalMaterial({
          color: matColor,
          metalness: 0.1,
          roughness: 0.05,
          transmission: 0.9,
          transparent: true,
          opacity: 0.45,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'wood':
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: 0.0,
          roughness: 0.75,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'fabric':
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: 0.02,
          roughness: 0.92,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'rubber':
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: 0.0,
          roughness: 0.96,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'matte':
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: 0.0,
          roughness: 0.95,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'glossy':
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: 0.35,
          roughness: 0.1,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'emissive':
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          emissive: new THREE.Color(obj.emissive || obj.color),
          emissiveIntensity: obj.emissiveIntensity || 2.0,
          metalness: 0.2,
          roughness: 0.2,
          wireframe: !!obj.wireframe,
        });
        break;
      case 'plastic':
      default:
        material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: 0.1,
          roughness: 0.35,
          wireframe: !!obj.wireframe,
        });
        break;
    }

    // 3. Mesh assembly
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = obj.name || obj.id;
    mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
    if (obj.rotation) {
      mesh.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
    }
    mesh.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    rootGroup.add(mesh);
  });

  return rootGroup;
}

/**
 * Helper to download Blob to user's computer
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Sanitizes base filename
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_') || 'shapex_model';
}

export const modelExportService = {
  /**
   * Export to Wavefront .OBJ
   */
  async exportOBJ(
    scene: SceneDescription,
    baseName: string,
    materialOverride?: MaterialType | null
  ): Promise<{ filename: string; sizeBytes: number }> {
    const group = buildThreeGroupFromScene(scene, materialOverride);
    const exporter = new OBJExporter();
    const result = exporter.parse(group);
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const filename = `${sanitizeFilename(baseName)}.obj`;
    downloadBlob(blob, filename);
    return { filename, sizeBytes: blob.size };
  },

  /**
   * Export to Binary glTF 2.0 (.GLB)
   */
  async exportGLB(
    scene: SceneDescription,
    baseName: string,
    materialOverride?: MaterialType | null
  ): Promise<{ filename: string; sizeBytes: number }> {
    const group = buildThreeGroupFromScene(scene, materialOverride);
    const exporter = new GLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        group,
        (gltf) => {
          try {
            const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
            const filename = `${sanitizeFilename(baseName)}.glb`;
            downloadBlob(blob, filename);
            resolve({ filename, sizeBytes: blob.size });
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          reject(error);
        },
        {
          binary: true,
          embedImages: true,
        }
      );
    });
  },

  /**
   * Export to Stereolithography (.STL)
   */
  async exportSTL(
    scene: SceneDescription,
    baseName: string,
    materialOverride?: MaterialType | null
  ): Promise<{ filename: string; sizeBytes: number }> {
    const group = buildThreeGroupFromScene(scene, materialOverride);
    const exporter = new STLExporter();
    const result = exporter.parse(group, { binary: true });
    // result is DataView when binary: true, or string when binary: false
    const blob = new Blob([result instanceof DataView ? result.buffer : result], { type: 'application/octet-stream' });
    const filename = `${sanitizeFilename(baseName)}.stl`;
    downloadBlob(blob, filename);
    return { filename, sizeBytes: blob.size };
  },

  /**
   * Export to ShapeX Scene JSON (.JSON)
   */
  exportJSON(
    scene: SceneDescription,
    baseName: string
  ): { filename: string; sizeBytes: number } {
    const jsonStr = JSON.stringify(scene, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const filename = `${sanitizeFilename(baseName)}_scene.json`;
    downloadBlob(blob, filename);
    return { filename, sizeBytes: blob.size };
  },

  /**
   * Unified export dispatcher by format
   */
  async exportByFormat(
    format: ExportFormat,
    scene: SceneDescription,
    baseName: string,
    materialOverride?: MaterialType | null
  ): Promise<{ filename: string; sizeBytes: number }> {
    switch (format) {
      case 'glb':
        return await this.exportGLB(scene, baseName, materialOverride);
      case 'obj':
        return await this.exportOBJ(scene, baseName, materialOverride);
      case 'stl':
        return await this.exportSTL(scene, baseName, materialOverride);
      case 'json':
        return this.exportJSON(scene, baseName);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
};
