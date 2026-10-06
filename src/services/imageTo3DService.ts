import { ImageAnalysisResult, SceneDescription, SceneObject, ModelQuality, MaterialType } from '../types';

export interface ImageTo3DInput {
  analysis: ImageAnalysisResult;
  quality?: ModelQuality;
}

/**
 * imageTo3DService receives structured analysis and returns a rich 3D scene description
 * containing decomposed Three.js geometries, accurate positioning, and material mappings.
 */
export const imageTo3DService = {
  generateScene(input: ImageTo3DInput): SceneDescription {
    const { analysis, quality = 'medium' } = input;
    const cat = (analysis.category || '').toLowerCase();
    const name = (analysis.objectName || '').toLowerCase();
    const shape = (analysis.shape || '').toLowerCase();
    const colors = analysis.colors && analysis.colors.length > 0 ? analysis.colors : ['#0f172a', '#e11d48', '#64748b'];

    let objects: SceneObject[] = [];
    let lightingPreset: 'studio' | 'neon' | 'warm' | 'cool' = 'studio';
    let backgroundColor = '#0a0d14';

    // Decide primary and secondary colors
    const primaryColor = colors[0] || '#1e293b';
    const accentColor = colors[1] || '#e11d48';
    const detailColor = colors[2] || '#64748b';

    // Check for Chair / Gaming Chair
    if (name.includes('chair') || cat.includes('chair') || cat.includes('seating') || shape.includes('chair')) {
      objects = buildChairScene(primaryColor, accentColor, detailColor, quality);
      lightingPreset = 'studio';
    } 
    // Check for Bottle / Flask / Can
    else if (name.includes('bottle') || name.includes('flask') || cat.includes('beverage') || shape.includes('cylinder') || shape.includes('flask')) {
      objects = buildBottleScene(primaryColor, accentColor, detailColor, quality);
      lightingPreset = 'neon';
    } 
    // Check for Table / Desk
    else if (name.includes('table') || name.includes('desk') || cat.includes('table') || shape.includes('table')) {
      objects = buildTableScene(primaryColor, accentColor, detailColor, quality);
      lightingPreset = 'warm';
    } 
    // Check for Drone / Vehicle / Aircraft
    else if (name.includes('drone') || cat.includes('vehicle') || cat.includes('aerial') || shape.includes('rotor')) {
      objects = buildDroneScene(primaryColor, accentColor, detailColor, quality);
      lightingPreset = 'neon';
    } 
    // Check for Headphones / Headset
    else if (name.includes('headphone') || name.includes('headset') || cat.includes('audio') || shape.includes('headband')) {
      objects = buildHeadphonesScene(primaryColor, accentColor, detailColor, quality);
      lightingPreset = 'cool';
    } 
    // General Composite Object fallback
    else {
      objects = buildGenericObjectScene(analysis, primaryColor, accentColor, detailColor, quality);
      lightingPreset = 'studio';
    }

    return {
      title: `${analysis.objectName} (AI 3D)`,
      category: analysis.category,
      backgroundColor,
      quality,
      lightingPreset,
      objects,
    };
  },
};

// Builder: Gaming Chair / Ergonomic Chair
function buildChairScene(primaryColor: string, accentColor: string, detailColor: string, quality: ModelQuality): SceneObject[] {
  const list: SceneObject[] = [];

  // 1. Central hydraulic piston
  list.push({
    id: 'chair_cylinder',
    name: 'Hydraulic Central Cylinder',
    type: 'cylinder',
    position: [0, 0.45, 0],
    scale: [0.08, 0.5, 0.08],
    color: '#334155',
    material: 'metal',
    metalness: 0.85,
    roughness: 0.2,
  });

  // 2. Base 5-Star Hub
  list.push({
    id: 'chair_base_hub',
    name: 'Star Base Hub',
    type: 'cylinder',
    position: [0, 0.15, 0],
    scale: [0.2, 0.1, 0.2],
    color: '#0f172a',
    material: 'metal',
    metalness: 0.7,
    roughness: 0.3,
  });

  // 3. 5-Star Legs with Caster Wheels
  const legCount = 5;
  for (let i = 0; i < legCount; i++) {
    const angle = (i * 2 * Math.PI) / legCount;
    const legLength = 0.55;
    const x = Math.sin(angle) * (legLength / 2);
    const z = Math.cos(angle) * (legLength / 2);
    const endX = Math.sin(angle) * legLength;
    const endZ = Math.cos(angle) * legLength;

    list.push({
      id: `chair_leg_${i + 1}`,
      name: `Star Leg ${i + 1}`,
      type: 'box',
      position: [x, 0.12, z],
      rotation: [0, angle, 0.05],
      scale: [0.06, 0.05, legLength],
      color: '#1e293b',
      material: 'metal',
      metalness: 0.75,
      roughness: 0.3,
    });

    // Caster wheel
    list.push({
      id: `chair_wheel_${i + 1}`,
      name: `Caster Wheel ${i + 1}`,
      type: 'sphere',
      position: [endX, 0.06, endZ],
      scale: [0.06, 0.06, 0.06],
      color: '#090d16',
      material: 'rubber',
      metalness: 0.1,
      roughness: 0.9,
    });
  }

  // 4. Seat Mechanism
  list.push({
    id: 'chair_seat_bracket',
    name: 'Tilt Mechanism Bracket',
    type: 'box',
    position: [0, 0.72, 0],
    scale: [0.4, 0.08, 0.4],
    color: '#0f172a',
    material: 'metal',
    metalness: 0.8,
    roughness: 0.25,
  });

  // 5. Seat Cushion
  list.push({
    id: 'chair_seat_cushion',
    name: 'Ergonomic Seat Cushion',
    type: 'box',
    position: [0, 0.82, 0],
    scale: [1.1, 0.18, 1.1],
    color: primaryColor,
    material: 'fabric',
    metalness: 0.05,
    roughness: 0.85,
  });

  // Seat racing stripes
  list.push({
    id: 'chair_seat_accent_left',
    name: 'Seat Bolster Left',
    type: 'box',
    position: [-0.5, 0.9, 0],
    rotation: [0, 0, 0.25],
    scale: [0.15, 0.15, 1.05],
    color: accentColor,
    material: 'fabric',
    metalness: 0.1,
    roughness: 0.8,
  });
  list.push({
    id: 'chair_seat_accent_right',
    name: 'Seat Bolster Right',
    type: 'box',
    position: [0.5, 0.9, 0],
    rotation: [0, 0, -0.25],
    scale: [0.15, 0.15, 1.05],
    color: accentColor,
    material: 'fabric',
    metalness: 0.1,
    roughness: 0.8,
  });

  // 6. Backrest
  list.push({
    id: 'chair_backrest',
    name: 'Contoured High Backrest',
    type: 'box',
    position: [0, 1.55, -0.42],
    rotation: [-0.08, 0, 0],
    scale: [0.95, 1.3, 0.14],
    color: primaryColor,
    material: 'fabric',
    metalness: 0.05,
    roughness: 0.85,
  });

  // Backrest Racing Wings
  list.push({
    id: 'chair_wing_left',
    name: 'Backrest Wing Left',
    type: 'box',
    position: [-0.46, 1.55, -0.38],
    rotation: [-0.08, 0.35, 0],
    scale: [0.18, 1.15, 0.1],
    color: accentColor,
    material: 'fabric',
    metalness: 0.1,
    roughness: 0.8,
  });
  list.push({
    id: 'chair_wing_right',
    name: 'Backrest Wing Right',
    type: 'box',
    position: [0.46, 1.55, -0.38],
    rotation: [-0.08, -0.35, 0],
    scale: [0.18, 1.15, 0.1],
    color: accentColor,
    material: 'fabric',
    metalness: 0.1,
    roughness: 0.8,
  });

  // 7. Headrest Cushion
  list.push({
    id: 'chair_headrest',
    name: 'Cushioned Headrest',
    type: 'box',
    position: [0, 2.22, -0.42],
    scale: [0.55, 0.28, 0.16],
    color: accentColor,
    material: 'fabric',
    metalness: 0.05,
    roughness: 0.8,
  });

  // 8. Lumbar Support Pad
  list.push({
    id: 'chair_lumbar',
    name: 'Ergonomic Lumbar Pillow',
    type: 'box',
    position: [0, 1.15, -0.34],
    scale: [0.65, 0.24, 0.12],
    color: accentColor,
    material: 'fabric',
    metalness: 0.05,
    roughness: 0.85,
  });

  // 9. Armrests (Left & Right)
  // Left post
  list.push({
    id: 'chair_armrest_left_post',
    name: 'Armrest Upright Left',
    type: 'cylinder',
    position: [-0.58, 1.05, -0.05],
    scale: [0.05, 0.38, 0.05],
    color: '#1e293b',
    material: 'metal',
    metalness: 0.8,
    roughness: 0.2,
  });
  // Left pad
  list.push({
    id: 'chair_armrest_left_pad',
    name: '4D Armrest Pad Left',
    type: 'box',
    position: [-0.58, 1.25, -0.05],
    scale: [0.16, 0.06, 0.55],
    color: '#0f172a',
    material: 'rubber',
    metalness: 0.05,
    roughness: 0.9,
  });

  // Right post
  list.push({
    id: 'chair_armrest_right_post',
    name: 'Armrest Upright Right',
    type: 'cylinder',
    position: [0.58, 1.05, -0.05],
    scale: [0.05, 0.38, 0.05],
    color: '#1e293b',
    material: 'metal',
    metalness: 0.8,
    roughness: 0.2,
  });
  // Right pad
  list.push({
    id: 'chair_armrest_right_pad',
    name: '4D Armrest Pad Right',
    type: 'box',
    position: [0.58, 1.25, -0.05],
    scale: [0.16, 0.06, 0.55],
    color: '#0f172a',
    material: 'rubber',
    metalness: 0.05,
    roughness: 0.9,
  });

  // High detail accents
  if (quality === 'high') {
    // Harness eyelet cutouts
    list.push({
      id: 'chair_eyelet_left',
      name: 'Harness Port Trim Left',
      type: 'torus',
      position: [-0.18, 2.0, -0.42],
      rotation: [0, 0, 0],
      scale: [0.1, 0.15, 0.04],
      color: '#090d16',
      material: 'plastic',
      metalness: 0.2,
      roughness: 0.4,
    });
    list.push({
      id: 'chair_eyelet_right',
      name: 'Harness Port Trim Right',
      type: 'torus',
      position: [0.18, 2.0, -0.42],
      rotation: [0, 0, 0],
      scale: [0.1, 0.15, 0.04],
      color: '#090d16',
      material: 'plastic',
      metalness: 0.2,
      roughness: 0.4,
    });
    // Accent piping glow
    list.push({
      id: 'chair_glow_strip',
      name: 'Cyber Luminescent Trim',
      type: 'box',
      position: [0, 0.95, -0.46],
      scale: [0.98, 0.03, 0.03],
      color: '#38bdf8',
      material: 'emissive',
      emissive: '#38bdf8',
      emissiveIntensity: 2.2,
    });
  }

  return list;
}

// Builder: Cyber Bottle / Flask
function buildBottleScene(primaryColor: string, accentColor: string, detailColor: string, quality: ModelQuality): SceneObject[] {
  const list: SceneObject[] = [];

  // Base bumper
  list.push({
    id: 'bottle_base_bumper',
    name: 'Silicone Base Guard',
    type: 'cylinder',
    position: [0, 0.1, 0],
    scale: [0.52, 0.2, 0.52],
    color: '#0f172a',
    material: 'rubber',
    roughness: 0.9,
  });

  // Main flask body
  list.push({
    id: 'bottle_main_body',
    name: 'Double-Wall Vacuum Body',
    type: 'cylinder',
    position: [0, 0.95, 0],
    scale: [0.5, 1.5, 0.5],
    color: primaryColor,
    material: 'metal',
    metalness: 0.85,
    roughness: 0.2,
  });

  // Grip texture band
  list.push({
    id: 'bottle_grip_band',
    name: 'Ergonomic Grip Band',
    type: 'cylinder',
    position: [0, 0.95, 0],
    scale: [0.52, 0.5, 0.52],
    color: accentColor,
    material: 'rubber',
    roughness: 0.95,
  });

  // Tapered shoulder
  list.push({
    id: 'bottle_shoulder',
    name: 'Tapered Collar Shoulder',
    type: 'cone',
    position: [0, 1.8, 0],
    scale: [0.5, 0.25, 0.5],
    color: primaryColor,
    material: 'metal',
    metalness: 0.85,
    roughness: 0.2,
  });

  // Spout neck
  list.push({
    id: 'bottle_spout_neck',
    name: 'Threaded Spout Neck',
    type: 'cylinder',
    position: [0, 2.0, 0],
    scale: [0.26, 0.2, 0.26],
    color: '#334155',
    material: 'metal',
    metalness: 0.9,
    roughness: 0.15,
  });

  // Insulated cap
  list.push({
    id: 'bottle_cap',
    name: 'Sealed Twist Cap',
    type: 'cylinder',
    position: [0, 2.18, 0],
    scale: [0.32, 0.18, 0.32],
    color: '#0f172a',
    material: 'plastic',
    metalness: 0.2,
    roughness: 0.3,
  });

  // Carabiner loop / handle
  list.push({
    id: 'bottle_loop',
    name: 'Carry Handle Loop',
    type: 'torus',
    position: [0, 2.38, 0],
    rotation: [0, 0, 0],
    scale: [0.18, 0.18, 0.05],
    color: detailColor,
    material: 'metal',
    metalness: 0.8,
    roughness: 0.2,
  });

  if (quality === 'high') {
    // Neon LED measurement strip
    list.push({
      id: 'bottle_led_strip',
      name: 'Hydration Indicator Bar',
      type: 'box',
      position: [0.51, 0.95, 0],
      scale: [0.02, 1.1, 0.05],
      color: '#00f0ff',
      material: 'emissive',
      emissive: '#00f0ff',
      emissiveIntensity: 2.8,
    });
  }

  return list;
}

// Builder: Modern Desk / Table
function buildTableScene(primaryColor: string, accentColor: string, detailColor: string, quality: ModelQuality): SceneObject[] {
  const list: SceneObject[] = [];

  // Tabletop
  list.push({
    id: 'desk_tabletop',
    name: 'Solid Core Tabletop',
    type: 'box',
    position: [0, 1.4, 0],
    scale: [2.4, 0.08, 1.3],
    color: primaryColor,
    material: 'wood',
    metalness: 0.0,
    roughness: 0.65,
  });

  // Chamfer bevel underside
  list.push({
    id: 'desk_apron',
    name: 'Under-Desk Steel Apron',
    type: 'box',
    position: [0, 1.34, 0],
    scale: [2.2, 0.05, 1.1],
    color: '#1e293b',
    material: 'metal',
    metalness: 0.8,
    roughness: 0.3,
  });

  // 4 Legs
  const legPositions: [number, number, number][] = [
    [-1.05, 0.67, -0.5],
    [1.05, 0.67, -0.5],
    [-1.05, 0.67, 0.5],
    [1.05, 0.67, 0.5],
  ];

  legPositions.forEach((pos, idx) => {
    list.push({
      id: `desk_leg_${idx + 1}`,
      name: `Tubular Leg ${idx + 1}`,
      type: 'cylinder',
      position: pos,
      scale: [0.06, 1.34, 0.06],
      color: '#1e293b',
      material: 'metal',
      metalness: 0.85,
      roughness: 0.2,
    });
    // Adjustable foot leveling glide
    list.push({
      id: `desk_foot_${idx + 1}`,
      name: `Leveling Foot Pad ${idx + 1}`,
      type: 'cylinder',
      position: [pos[0], 0.02, pos[2]],
      scale: [0.09, 0.04, 0.09],
      color: '#0f172a',
      material: 'rubber',
      roughness: 0.9,
    });
  });

  // Cable management tray / crossbeam
  list.push({
    id: 'desk_crossbeam',
    name: 'Torsional Crossbeam Support',
    type: 'box',
    position: [0, 1.25, 0],
    scale: [2.1, 0.04, 0.08],
    color: '#334155',
    material: 'metal',
    metalness: 0.8,
    roughness: 0.3,
  });

  if (quality === 'high') {
    // Grommet cable pass-through
    list.push({
      id: 'desk_grommet',
      name: 'Brushed Aluminum Cable Grommet',
      type: 'cylinder',
      position: [0.8, 1.45, -0.4],
      scale: [0.12, 0.02, 0.12],
      color: '#94a3b8',
      material: 'metal',
      metalness: 0.9,
      roughness: 0.1,
    });
  }

  return list;
}

// Builder: Cyber Drone / Quadcopter
function buildDroneScene(primaryColor: string, accentColor: string, detailColor: string, quality: ModelQuality): SceneObject[] {
  const list: SceneObject[] = [];

  // Fuselage Body
  list.push({
    id: 'drone_fuselage',
    name: 'Aerodynamic Carbon Fuselage',
    type: 'box',
    position: [0, 1.0, 0],
    scale: [0.65, 0.22, 0.8],
    color: primaryColor,
    material: 'metal',
    metalness: 0.7,
    roughness: 0.3,
  });

  // Top Canopy
  list.push({
    id: 'drone_canopy',
    name: 'Composite Avionics Canopy',
    type: 'sphere',
    position: [0, 1.12, 0],
    scale: [0.45, 0.15, 0.55],
    color: accentColor,
    material: 'glossy',
    metalness: 0.3,
    roughness: 0.15,
  });

  // 4 Rotor Boom Arms (angles 45, 135, 225, 315)
  const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  const armLength = 0.9;

  angles.forEach((angle, idx) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = cos * (armLength / 2);
    const z = sin * (armLength / 2);
    const motorX = cos * armLength;
    const motorZ = sin * armLength;

    // Boom arm
    list.push({
      id: `drone_arm_${idx + 1}`,
      name: `Carbon Boom Arm ${idx + 1}`,
      type: 'box',
      position: [x, 1.0, z],
      rotation: [0, -angle, 0],
      scale: [0.08, 0.06, armLength],
      color: '#18181b',
      material: 'matte',
      metalness: 0.4,
      roughness: 0.6,
    });

    // Motor pod
    list.push({
      id: `drone_motor_${idx + 1}`,
      name: `Brushless Motor Hub ${idx + 1}`,
      type: 'cylinder',
      position: [motorX, 1.06, motorZ],
      scale: [0.12, 0.12, 0.12],
      color: '#38bdf8',
      material: 'metal',
      metalness: 0.9,
      roughness: 0.1,
    });

    // Propeller Disc (spinning look)
    list.push({
      id: `drone_prop_${idx + 1}`,
      name: `Tri-Blade Propeller ${idx + 1}`,
      type: 'cylinder',
      position: [motorX, 1.15, motorZ],
      scale: [0.45, 0.01, 0.45],
      color: '#00ffff',
      material: 'glass',
      opacity: 0.45,
      metalness: 0.2,
      roughness: 0.1,
    });
  });

  // Underside 3-Axis Gimbal & Camera
  list.push({
    id: 'drone_gimbal_bracket',
    name: '3-Axis Gimbal Bracket',
    type: 'cylinder',
    position: [0, 0.85, 0.15],
    scale: [0.08, 0.1, 0.08],
    color: '#090d16',
    material: 'metal',
    metalness: 0.85,
  });
  list.push({
    id: 'drone_camera_pod',
    name: '4K Ultra Optical Sensor',
    type: 'sphere',
    position: [0, 0.78, 0.22],
    scale: [0.14, 0.14, 0.16],
    color: '#00f0ff',
    material: 'emissive',
    emissive: '#00f0ff',
    emissiveIntensity: 1.5,
  });

  // Landing Skids (Left & Right)
  list.push({
    id: 'drone_skid_left',
    name: 'Landing Skid Left',
    type: 'cylinder',
    position: [-0.35, 0.65, 0],
    rotation: [Math.PI / 2, 0, 0],
    scale: [0.03, 0.8, 0.03],
    color: '#334155',
    material: 'metal',
  });
  list.push({
    id: 'drone_skid_right',
    name: 'Landing Skid Right',
    type: 'cylinder',
    position: [0.35, 0.65, 0],
    rotation: [Math.PI / 2, 0, 0],
    scale: [0.03, 0.8, 0.03],
    color: '#334155',
    material: 'metal',
  });

  return list;
}

// Builder: Studio Headphones
function buildHeadphonesScene(primaryColor: string, accentColor: string, detailColor: string, quality: ModelQuality): SceneObject[] {
  const list: SceneObject[] = [];

  // Headband arch
  list.push({
    id: 'hp_headband_arch',
    name: 'Spring Steel Headband Arch',
    type: 'torus',
    position: [0, 1.45, 0],
    rotation: [0, 0, 0],
    scale: [0.65, 0.65, 0.08],
    color: primaryColor,
    material: 'metal',
    metalness: 0.85,
    roughness: 0.2,
  });

  // Headband cushion pad
  list.push({
    id: 'hp_headband_cushion',
    name: 'Memory Foam Cushion Pad',
    type: 'box',
    position: [0, 2.05, 0],
    scale: [0.6, 0.1, 0.16],
    color: '#0f172a',
    material: 'fabric',
    roughness: 0.9,
  });

  // Left Earcup Assembly
  list.push({
    id: 'hp_earcup_left_housing',
    name: 'Acoustic Driver Housing Left',
    type: 'cylinder',
    position: [-0.75, 1.25, 0],
    rotation: [0, 0, Math.PI / 2],
    scale: [0.32, 0.18, 0.38],
    color: primaryColor,
    material: 'metal',
    metalness: 0.75,
    roughness: 0.25,
  });
  list.push({
    id: 'hp_earpad_left',
    name: 'Over-Ear Cushion Left',
    type: 'cylinder',
    position: [-0.62, 1.25, 0],
    rotation: [0, 0, Math.PI / 2],
    scale: [0.34, 0.12, 0.4],
    color: '#18181b',
    material: 'fabric',
    roughness: 0.95,
  });

  // Right Earcup Assembly
  list.push({
    id: 'hp_earcup_right_housing',
    name: 'Acoustic Driver Housing Right',
    type: 'cylinder',
    position: [0.75, 1.25, 0],
    rotation: [0, 0, Math.PI / 2],
    scale: [0.32, 0.18, 0.38],
    color: primaryColor,
    material: 'metal',
    metalness: 0.75,
    roughness: 0.25,
  });
  list.push({
    id: 'hp_earpad_right',
    name: 'Over-Ear Cushion Right',
    type: 'cylinder',
    position: [0.62, 1.25, 0],
    rotation: [0, 0, Math.PI / 2],
    scale: [0.34, 0.12, 0.4],
    color: '#18181b',
    material: 'fabric',
    roughness: 0.95,
  });

  // Brushed aluminum accent rings
  list.push({
    id: 'hp_ring_left',
    name: 'Chamfered Bezel Left',
    type: 'torus',
    position: [-0.85, 1.25, 0],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.28, 0.32, 0.02],
    color: accentColor,
    material: 'metal',
    metalness: 0.95,
    roughness: 0.1,
  });
  list.push({
    id: 'hp_ring_right',
    name: 'Chamfered Bezel Right',
    type: 'torus',
    position: [0.85, 1.25, 0],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.28, 0.32, 0.02],
    color: accentColor,
    material: 'metal',
    metalness: 0.95,
    roughness: 0.1,
  });

  return list;
}

// Builder: Generic High-Quality Composite
function buildGenericObjectScene(
  analysis: ImageAnalysisResult,
  primaryColor: string,
  accentColor: string,
  detailColor: string,
  quality: ModelQuality
): SceneObject[] {
  const list: SceneObject[] = [];
  const materials = analysis.materials || ['plastic', 'metal'];
  const primMat: MaterialType = (materials[0]?.toLowerCase() as MaterialType) || 'plastic';
  const secMat: MaterialType = (materials[1]?.toLowerCase() as MaterialType) || 'metal';

  // Base Pedestal
  list.push({
    id: 'gen_pedestal',
    name: 'Foundation Base Anchor',
    type: 'cylinder',
    position: [0, 0.15, 0],
    scale: [0.9, 0.15, 0.9],
    color: '#0f172a',
    material: 'metal',
    metalness: 0.8,
    roughness: 0.3,
  });

  // Core volume
  list.push({
    id: 'gen_core_volume',
    name: `${analysis.objectName} Core Chassis`,
    type: 'box',
    position: [0, 0.95, 0],
    scale: [1.1, 1.3, 0.9],
    color: primaryColor,
    material: primMat,
    metalness: primMat === 'metal' ? 0.85 : 0.2,
    roughness: 0.35,
  });

  // Secondary structural feature
  list.push({
    id: 'gen_upper_structure',
    name: 'Top Chamfer Feature',
    type: 'sphere',
    position: [0, 1.65, 0],
    scale: [0.75, 0.45, 0.65],
    color: accentColor,
    material: secMat,
    metalness: secMat === 'metal' ? 0.85 : 0.15,
    roughness: 0.25,
  });

  // Lateral detail wings
  list.push({
    id: 'gen_flange_left',
    name: 'Lateral Wing Flange Left',
    type: 'box',
    position: [-0.62, 0.95, 0],
    scale: [0.15, 0.95, 0.7],
    color: detailColor,
    material: 'metal',
    metalness: 0.8,
    roughness: 0.2,
  });
  list.push({
    id: 'gen_flange_right',
    name: 'Lateral Wing Flange Right',
    type: 'box',
    position: [0.62, 0.95, 0],
    scale: [0.15, 0.95, 0.7],
    color: detailColor,
    material: 'metal',
    metalness: 0.8,
    roughness: 0.2,
  });

  // Accent detail ring
  list.push({
    id: 'gen_accent_ring',
    name: 'Status Sensor Ring',
    type: 'torus',
    position: [0, 1.0, 0.46],
    scale: [0.24, 0.24, 0.04],
    color: '#00ffff',
    material: 'emissive',
    emissive: '#00ffff',
    emissiveIntensity: 2.2,
  });

  return list;
}
