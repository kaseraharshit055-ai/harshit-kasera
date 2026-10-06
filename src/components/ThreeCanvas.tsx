import React, { useRef, useState, useTransition } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SceneDescription, SceneObject, MaterialType, LightingPreset } from '../types';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Grid3X3, 
  Eye, 
  Sun, 
  Layers, 
  Box as BoxIcon 
} from 'lucide-react';

interface ThreeCanvasProps {
  scene: SceneDescription;
  wireframeGlobal?: boolean;
  gridVisible?: boolean;
  materialOverride?: MaterialType | null;
  lightingPreset?: LightingPreset;
  onSelectObject?: (obj: SceneObject | null) => void;
  selectedObjectId?: string | null;
}

// Single Scene Object Component
function RenderObject({ 
  obj, 
  wireframeGlobal, 
  materialOverride, 
  isSelected, 
  onSelect 
}: { 
  obj: SceneObject; 
  wireframeGlobal?: boolean; 
  materialOverride?: MaterialType | null; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const effectiveMaterial = materialOverride || obj.material || 'plastic';
  const effectiveWireframe = wireframeGlobal ?? obj.wireframe ?? false;

  // Material properties computation
  const getMaterialProps = () => {
    const baseColor = isSelected ? '#38bdf8' : (hovered ? brightenColor(obj.color, 20) : obj.color);

    switch (effectiveMaterial) {
      case 'metal':
        return {
          color: baseColor,
          metalness: 0.9,
          roughness: 0.18,
          wireframe: effectiveWireframe,
        };
      case 'glass':
        return {
          color: baseColor,
          metalness: 0.1,
          roughness: 0.05,
          transmission: 0.9,
          transparent: true,
          opacity: 0.45,
          wireframe: effectiveWireframe,
        };
      case 'wood':
        return {
          color: baseColor,
          metalness: 0.0,
          roughness: 0.75,
          wireframe: effectiveWireframe,
        };
      case 'fabric':
        return {
          color: baseColor,
          metalness: 0.02,
          roughness: 0.92,
          wireframe: effectiveWireframe,
        };
      case 'rubber':
        return {
          color: baseColor,
          metalness: 0.0,
          roughness: 0.96,
          wireframe: effectiveWireframe,
        };
      case 'matte':
        return {
          color: baseColor,
          metalness: 0.0,
          roughness: 0.95,
          wireframe: effectiveWireframe,
        };
      case 'glossy':
        return {
          color: baseColor,
          metalness: 0.35,
          roughness: 0.1,
          wireframe: effectiveWireframe,
        };
      case 'emissive':
        return {
          color: baseColor,
          emissive: obj.emissive || baseColor,
          emissiveIntensity: obj.emissiveIntensity || 2.5,
          metalness: 0.2,
          roughness: 0.2,
          wireframe: effectiveWireframe,
        };
      case 'plastic':
      default:
        return {
          color: baseColor,
          metalness: 0.1,
          roughness: 0.35,
          wireframe: effectiveWireframe,
        };
    }
  };

  const matProps = getMaterialProps();

  // Render proper geometry based on type
  const renderGeometry = () => {
    switch (obj.type) {
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.15, 24, 48]} />;
      case 'capsule':
        return <capsuleGeometry args={[0.4, 0.8, 16, 32]} />;
      case 'ring':
        return <ringGeometry args={[0.3, 0.5, 32]} />;
      case 'box':
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={obj.position}
      rotation={obj.rotation || [0, 0, 0]}
      scale={obj.scale}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {renderGeometry()}
      <meshStandardMaterial {...matProps} />
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[meshRef.current?.geometry || new THREE.BoxGeometry()]} />
          <lineBasicMaterial color="#38bdf8" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

// Lighting Setup according to preset
function SceneLights({ preset }: { preset: LightingPreset }) {
  switch (preset) {
    case 'neon':
      return (
        <>
          <ambientLight intensity={0.4} color="#1e1b4b" />
          <directionalLight position={[5, 8, 5]} intensity={1.2} color="#00ffff" castShadow />
          <pointLight position={[-5, 4, -3]} intensity={2.5} color="#ff007f" />
          <pointLight position={[4, 2, 4]} intensity={2.0} color="#38bdf8" />
          <directionalLight position={[0, -5, -2]} intensity={0.5} color="#818cf8" />
        </>
      );
    case 'warm':
      return (
        <>
          <ambientLight intensity={0.6} color="#fed7aa" />
          <directionalLight position={[6, 9, 4]} intensity={1.8} color="#ffedd5" castShadow />
          <directionalLight position={[-4, 3, -4]} intensity={0.7} color="#fb923c" />
          <pointLight position={[0, 4, 3]} intensity={0.9} color="#fef08a" />
        </>
      );
    case 'cool':
      return (
        <>
          <ambientLight intensity={0.5} color="#bae6fd" />
          <directionalLight position={[4, 8, 6]} intensity={1.6} color="#e0f2fe" castShadow />
          <directionalLight position={[-5, 2, -3]} intensity={0.8} color="#0284c7" />
          <pointLight position={[0, 3, 4]} intensity={1.2} color="#38bdf8" />
        </>
      );
    case 'studio':
    default:
      return (
        <>
          <ambientLight intensity={0.7} color="#f8fafc" />
          <directionalLight position={[5, 9, 6]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-6, 4, -4]} intensity={0.9} color="#94a3b8" />
          <directionalLight position={[0, -2, -4]} intensity={0.4} color="#64748b" />
        </>
      );
  }
}

// Helper to brighten hex color on hover
function brightenColor(hex: string, percent: number): string {
  try {
    const color = new THREE.Color(hex);
    color.offsetHSL(0, 0, percent / 100);
    return '#' + color.getHexString();
  } catch {
    return hex;
  }
}

export function ThreeCanvas({
  scene,
  wireframeGlobal = false,
  gridVisible = true,
  materialOverride = null,
  lightingPreset = 'studio',
  onSelectObject,
  selectedObjectId = null,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera reset
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 1.0, 0);
      controlsRef.current.object.position.set(3, 2.5, 3.8);
      controlsRef.current.update();
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
      controlsRef.current.update();
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[460px] bg-gradient-to-b from-[#070a11] to-[#0d121f] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col"
    >
      {/* 3D Canvas */}
      <div className="w-full h-full flex-1">
        <Canvas
          shadows
          camera={{ position: [3, 2.5, 3.8], fov: 45 }}
          onPointerDown={() => {
            // Deselect on empty canvas click
            if (onSelectObject) onSelectObject(null);
          }}
        >
          <color attach="background" args={[scene.backgroundColor || '#080b12']} />
          <fog attach="fog" args={[scene.backgroundColor || '#080b12', 8, 25]} />
          
          <SceneLights preset={lightingPreset || scene.lightingPreset || 'studio'} />

          <group position={[0, 0, 0]}>
            {scene.objects.map((obj) => (
              <RenderObject
                key={obj.id}
                obj={obj}
                wireframeGlobal={wireframeGlobal}
                materialOverride={materialOverride}
                isSelected={selectedObjectId === obj.id}
                onSelect={() => onSelectObject && onSelectObject(obj)}
              />
            ))}
          </group>

          {gridVisible && (
            <Grid
              position={[0, 0.01, 0]}
              args={[12, 12]}
              cellSize={0.5}
              cellThickness={0.8}
              cellColor="#1e293b"
              sectionSize={2}
              sectionThickness={1.2}
              sectionColor="#334155"
              fadeDistance={18}
              fadeStrength={1.5}
            />
          )}

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.7}
            scale={8}
            blur={2.4}
            far={4}
            color="#000000"
          />

          <OrbitControls
            ref={controlsRef}
            target={[0, 1.0, 0]}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={1}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2 + 0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1.8}
          />
        </Canvas>
      </div>

      {/* Floating HUD Viewport Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Left Badge: Status & Object count */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#121212]/90 backdrop-blur-md border border-[#262626] px-3.5 py-1.5 rounded-full shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-[#ededed]">
            {scene.title || '3D Scene'}
          </span>
          <span className="text-[11px] font-mono text-[#00f2ff] bg-[#00f2ff]/10 px-2 py-0.5 rounded border border-[#00f2ff]/30">
            {scene.objects.length} parts
          </span>
          {materialOverride && (
            <span className="text-[11px] font-mono text-[#ededed] bg-[#171717] px-2 py-0.5 rounded border border-[#262626]">
              Mat: {materialOverride}
            </span>
          )}
        </div>

        {/* Right Camera & Viewport Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#121212]/90 backdrop-blur-md border border-[#262626] p-1.5 rounded-xl shadow-lg">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              autoRotate ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30' : 'text-[#888888] hover:text-[#ededed] hover:bg-[#1c1c1c]'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#1c1c1c] transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#1c1c1c] transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="p-2 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#1c1c1c] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-[#262626] mx-0.5" />
          <button
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-lg text-[#888888] hover:text-[#ededed] hover:bg-[#1c1c1c] transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Selected Mesh Part Inspector Overlay (if object clicked) */}
      {selectedObjectId && (
        <div className="absolute bottom-4 left-4 pointer-events-auto bg-[#121212]/95 backdrop-blur-md border border-[#00f2ff]/40 px-3 py-2 rounded-xl text-xs shadow-xl flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff]">
            <BoxIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-[#ededed]">
              {scene.objects.find((o) => o.id === selectedObjectId)?.name || 'Selected Object'}
            </div>
            <div className="text-[11px] font-mono text-[#888888] flex items-center gap-2 mt-0.5">
              <span>Type: {scene.objects.find((o) => o.id === selectedObjectId)?.type}</span>
              <span>•</span>
              <span>Mat: {scene.objects.find((o) => o.id === selectedObjectId)?.material}</span>
            </div>
          </div>
          <button
            onClick={() => onSelectObject && onSelectObject(null)}
            className="text-[#71717a] hover:text-[#ededed] ml-2 text-xs font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Viewport Control Instructions */}
      <div className="absolute bottom-4 right-4 pointer-events-none hidden sm:flex items-center gap-3 text-[11px] font-mono text-[#71717a] bg-[#121212]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#262626]">
        <span>Left Click: Rotate</span>
        <span>•</span>
        <span>Right Click: Pan</span>
        <span>•</span>
        <span>Scroll: Zoom</span>
      </div>
    </div>
  );
}
