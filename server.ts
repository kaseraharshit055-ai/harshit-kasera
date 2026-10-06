import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Image Analysis endpoint
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', demoName } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      // Return high-quality heuristic response if API key is not yet set
      return res.json({
        success: true,
        source: 'fallback',
        analysis: generateHeuristicAnalysis(demoName || 'Object'),
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Strip data URI prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const prompt = `Analyze this object image for 3D reconstruction in ShapeX 3D Studio.
Determine:
1. main object name
2. category (e.g., Furniture, Vehicle, Electronics, Beverage, Architecture, Tool, Prop)
3. general shape description
4. visible surfaces (e.g., front, seat, legs, neck, handle)
5. approximate real-world depth (e.g., "0.75m", "0.25m")
6. materials detected (e.g., plastic, metal, wood, fabric, glass, rubber)
7. primary colors (in hex or color name)
8. symmetry ("symmetrical", "mostly symmetrical", "asymmetrical")
9. complexity ("low", "medium", "high")
10. important geometric details
11. possible 3D reconstruction strategy using 3D geometric primitives (box, cylinder, sphere, cone, torus)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objectName: { type: Type.STRING },
            category: { type: Type.STRING },
            shape: { type: Type.STRING },
            visibleSurfaces: { type: Type.STRING },
            approximateDepth: { type: Type.STRING },
            materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            symmetry: { type: Type.STRING },
            complexity: { type: Type.STRING },
            importantDetails: { type: Type.STRING },
            reconstruction: { type: Type.STRING },
          },
          required: ['objectName', 'category', 'shape', 'materials', 'colors', 'symmetry', 'complexity', 'reconstruction'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      source: 'gemini',
      analysis: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-image:', error);
    // Graceful fallback so user workflow is never interrupted
    const fallback = generateHeuristicAnalysis(req.body.demoName || 'Object');
    return res.json({
      success: true,
      source: 'fallback',
      warning: 'Using intelligent local vision heuristic: ' + (error.message || 'Gemini error'),
      analysis: fallback,
    });
  }
});

// Scene Editing endpoint (Natural Language 3D Editing)
app.post('/api/gemini/edit-scene', async (req, res) => {
  try {
    const { command, currentScene } = req.body;

    if (!command || !currentScene) {
      return res.status(400).json({ error: 'command and currentScene are required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Local rule-based modifier if API key not available
      const modifiedScene = applyLocalCommandModification(command, currentScene);
      return res.json({
        success: true,
        source: 'local',
        scene: modifiedScene,
        summary: `Applied "${command}" via local engine`,
      });
    }

    const prompt = `You are the ShapeX 3D AI assistant. The user wants to modify the current 3D scene using a natural language command.
Current scene JSON:
${JSON.stringify(currentScene, null, 2)}

User command:
"${command}"

Instructions:
1. Update, add, modify, or remove scene objects according to the user command.
2. Supported geometry types: 'box', 'sphere', 'cylinder', 'cone', 'torus', 'capsule', 'ring'.
3. Supported materials: 'plastic', 'metal', 'glass', 'wood', 'fabric', 'rubber', 'matte', 'glossy', 'emissive'.
4. Positions are [x, y, z] in 3D space. Scales are [x, y, z]. Rotations are [x, y, z] in radians.
5. Colors should be valid hex codes (e.g., "#e11d48", "#3b82f6", "#10b981", "#fbbf24", "#0f172a", "#f8fafc", "#00ffcc").
6. If the user asks to "make it red", change colors to a vibrant red hex like "#ef4444" or "#dc2626".
7. If the user asks for "neon lights", add glowing objects with material "emissive" and bright hex color like "#00f0ff" or "#ff007f".
8. If the user asks to "change background", change backgroundColor to a matching hex code.
9. If the user asks to "make it metallic", set material to "metal" and metalness to 0.85+.
10. Return ONLY a valid JSON object matching the SceneDescription schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            backgroundColor: { type: Type.STRING },
            quality: { type: Type.STRING },
            lightingPreset: { type: Type.STRING },
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  position: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                  },
                  rotation: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                  },
                  scale: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                  },
                  color: { type: Type.STRING },
                  material: { type: Type.STRING },
                  metalness: { type: Type.NUMBER },
                  roughness: { type: Type.NUMBER },
                  emissive: { type: Type.STRING },
                  emissiveIntensity: { type: Type.NUMBER },
                  opacity: { type: Type.NUMBER },
                },
                required: ['name', 'type', 'position', 'scale', 'color', 'material'],
              },
            },
          },
          required: ['objects'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    // Validate the parsed scene structure
    if (!parsed.objects || !Array.isArray(parsed.objects) || parsed.objects.length === 0) {
      throw new Error('Invalid scene objects structure from AI');
    }

    // Ensure all objects have required properties and an id
    const validatedScene = {
      ...currentScene,
      ...parsed,
      objects: parsed.objects.map((obj: any, idx: number) => ({
        id: obj.id || `obj_${Date.now()}_${idx}`,
        name: obj.name || `part_${idx + 1}`,
        type: ['box', 'sphere', 'cylinder', 'cone', 'torus', 'capsule', 'ring'].includes(obj.type) ? obj.type : 'box',
        position: Array.isArray(obj.position) && obj.position.length === 3 ? obj.position : [0, 0, 0],
        rotation: Array.isArray(obj.rotation) && obj.rotation.length === 3 ? obj.rotation : [0, 0, 0],
        scale: Array.isArray(obj.scale) && obj.scale.length === 3 ? obj.scale : [1, 1, 1],
        color: typeof obj.color === 'string' ? obj.color : '#6366f1',
        material: ['plastic', 'metal', 'glass', 'wood', 'fabric', 'rubber', 'matte', 'glossy', 'emissive'].includes(obj.material) ? obj.material : 'plastic',
        metalness: typeof obj.metalness === 'number' ? obj.metalness : 0.2,
        roughness: typeof obj.roughness === 'number' ? obj.roughness : 0.4,
        emissive: obj.emissive || (obj.material === 'emissive' ? obj.color : undefined),
        emissiveIntensity: typeof obj.emissiveIntensity === 'number' ? obj.emissiveIntensity : (obj.material === 'emissive' ? 2 : 0),
      })),
    };

    return res.json({
      success: true,
      source: 'gemini',
      scene: validatedScene,
      summary: `Applied "${command}" successfully`,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/edit-scene:', error);
    // Apply robust local modification if Gemini response failed or timed out
    try {
      const fallbackScene = applyLocalCommandModification(req.body.command, req.body.currentScene);
      return res.json({
        success: true,
        source: 'local_fallback',
        scene: fallbackScene,
        summary: `Applied "${req.body.command}" via smart heuristic`,
      });
    } catch (fallbackError) {
      return res.status(400).json({
        error: "ShapeX couldn't understand that change. Try describing the change differently.",
      });
    }
  }
});

// Helper for heuristic analysis
function generateHeuristicAnalysis(objectHint: string) {
  const hintLower = objectHint.toLowerCase();
  if (hintLower.includes('chair') || hintLower.includes('seat')) {
    return {
      objectName: 'Gaming Chair',
      category: 'Furniture',
      shape: 'Ergonomic racing chair with contoured backrest',
      visibleSurfaces: 'Seat cushion, lumbar curve, winged backrest, dual armrests, star base',
      approximateDepth: '0.72m',
      materials: ['fabric', 'metal', 'plastic'],
      colors: ['#0f172a', '#e11d48', '#64748b'],
      symmetry: 'mostly symmetrical',
      complexity: 'medium',
      importantDetails: 'Five-wheel caster base, hydraulic central cylinder, adjustable lumbar pad',
      reconstruction: 'primitive + custom geometry',
    };
  } else if (hintLower.includes('bottle') || hintLower.includes('flask') || hintLower.includes('drink')) {
    return {
      objectName: 'Cyber Sports Bottle',
      category: 'Beverage / Container',
      shape: 'Cylindrical insulated flask with grip ribbed body and threaded cap',
      visibleSurfaces: 'Cylindrical body, tapered neck, screw cap, grip ring',
      approximateDepth: '0.28m',
      materials: ['metal', 'rubber', 'plastic'],
      colors: ['#0284c7', '#0f172a', '#e2e8f0'],
      symmetry: 'symmetrical',
      complexity: 'medium',
      importantDetails: 'Beveled shoulder, textured silicon grip band, metallic cap loop',
      reconstruction: 'lathe / stacked cylindrical primitives',
    };
  } else if (hintLower.includes('table') || hintLower.includes('desk')) {
    return {
      objectName: 'Modern Minimalist Desk',
      category: 'Furniture',
      shape: 'Rectangular beveled tabletop with quad tubular steel legs',
      visibleSurfaces: 'Flat top surface, beveled edges, 4 structural legs, cable grommet',
      approximateDepth: '0.80m',
      materials: ['wood', 'metal'],
      colors: ['#b45309', '#1e293b'],
      symmetry: 'symmetrical',
      complexity: 'low',
      importantDetails: 'Under-desk reinforcement rail, chamfered corner edges',
      reconstruction: 'modular box + cylinder assembly',
    };
  } else if (hintLower.includes('drone') || hintLower.includes('quad')) {
    return {
      objectName: 'Cyber Drone',
      category: 'Electronics / Vehicle',
      shape: 'Aerodynamic central fuselage with 4 carbon-fiber rotor booms',
      visibleSurfaces: 'Top canopy, 4 rotor arms, 4 propeller blades, gimbal camera',
      approximateDepth: '0.45m',
      materials: ['plastic', 'metal'],
      colors: ['#18181b', '#06b6d4', '#f43f5e'],
      symmetry: 'quad-symmetrical',
      complexity: 'high',
      importantDetails: 'Underbody 3-axis camera gimbal, LED status rings, landing skids',
      reconstruction: 'multi-part composite geometry',
    };
  } else if (hintLower.includes('headphone') || hintLower.includes('headset')) {
    return {
      objectName: 'Studio Pro Headphones',
      category: 'Electronics',
      shape: 'Curved cushioned headband with dual articulated over-ear acoustic earcups',
      visibleSurfaces: 'Headband arch, fork yokes, ear cushions, outer driver cups',
      approximateDepth: '0.22m',
      materials: ['plastic', 'metal', 'fabric'],
      colors: ['#0f172a', '#e2e8f0', '#3b82f6'],
      symmetry: 'symmetrical',
      complexity: 'medium',
      importantDetails: 'Memory foam padding, brushed aluminum slider arms, sound port vents',
      reconstruction: 'torus curve + cylinder primitives',
    };
  }

  return {
    objectName: objectHint || 'Industrial Design Object',
    category: 'Product Design',
    shape: 'Geometric volumetric composite object',
    visibleSurfaces: 'Front profile, lateral facets, top surface',
    approximateDepth: '0.50m',
    materials: ['plastic', 'metal'],
    colors: ['#3b82f6', '#1e293b'],
    symmetry: 'mostly symmetrical',
    complexity: 'medium',
    importantDetails: 'Clean chamfered boundaries, balanced proportion',
    reconstruction: 'primitive + custom geometry',
  };
}

// Local smart modifier for editing commands without relying solely on network
function applyLocalCommandModification(command: string, scene: any) {
  const cmd = command.toLowerCase();
  const cloned = JSON.parse(JSON.stringify(scene));

  // Color modification
  if (cmd.includes('red')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#ef4444' }));
  } else if (cmd.includes('blue')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#3b82f6' }));
  } else if (cmd.includes('green')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#10b981' }));
  } else if (cmd.includes('yellow') || cmd.includes('gold')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#f59e0b' }));
  } else if (cmd.includes('black') || cmd.includes('dark')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#09090b' }));
  } else if (cmd.includes('white')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#f8fafc' }));
  } else if (cmd.includes('purple') || cmd.includes('violet')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#a855f7' }));
  } else if (cmd.includes('cyan') || cmd.includes('teal')) {
    cloned.objects = cloned.objects.map((obj: any) => ({ ...obj, color: '#06b6d4' }));
  }

  // Material modifications
  if (cmd.includes('metallic') || cmd.includes('metal')) {
    cloned.objects = cloned.objects.map((obj: any) => ({
      ...obj,
      material: 'metal',
      metalness: 0.88,
      roughness: 0.18,
    }));
  } else if (cmd.includes('glass')) {
    cloned.objects = cloned.objects.map((obj: any) => ({
      ...obj,
      material: 'glass',
      opacity: 0.45,
      metalness: 0.1,
      roughness: 0.05,
    }));
  } else if (cmd.includes('wood')) {
    cloned.objects = cloned.objects.map((obj: any) => ({
      ...obj,
      material: 'wood',
      color: '#78350f',
      metalness: 0.0,
      roughness: 0.8,
    }));
  } else if (cmd.includes('matte')) {
    cloned.objects = cloned.objects.map((obj: any) => ({
      ...obj,
      material: 'matte',
      metalness: 0.0,
      roughness: 0.95,
    }));
  } else if (cmd.includes('glossy')) {
    cloned.objects = cloned.objects.map((obj: any) => ({
      ...obj,
      material: 'glossy',
      metalness: 0.25,
      roughness: 0.08,
    }));
  }

  // Scale modifications
  if (cmd.includes('bigger') || cmd.includes('larger') || cmd.includes('scale up')) {
    cloned.objects = cloned.objects.map((obj: any) => ({
      ...obj,
      scale: [obj.scale[0] * 1.25, obj.scale[1] * 1.25, obj.scale[2] * 1.25],
    }));
  } else if (cmd.includes('smaller') || cmd.includes('scale down')) {
    cloned.objects = cloned.objects.map((obj: any) => ({
      ...obj,
      scale: [obj.scale[0] * 0.8, obj.scale[1] * 0.8, obj.scale[2] * 0.8],
    }));
  }

  // Neon lights
  if (cmd.includes('neon') || cmd.includes('glow') || cmd.includes('light')) {
    const neonId = `neon_${Date.now()}`;
    cloned.objects.push({
      id: neonId,
      name: 'Cyber Neon Accent Ring',
      type: 'torus',
      position: [0, 1.2, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [1.2, 1.2, 0.05],
      color: '#00ffff',
      material: 'emissive',
      emissive: '#00ffff',
      emissiveIntensity: 3.5,
      metalness: 0.1,
      roughness: 0.1,
    });
    cloned.lightingPreset = 'neon';
  }

  // Futuristic
  if (cmd.includes('futuristic')) {
    cloned.backgroundColor = '#030712';
    cloned.lightingPreset = 'neon';
    cloned.objects = cloned.objects.map((obj: any, idx: number) => ({
      ...obj,
      material: idx % 2 === 0 ? 'metal' : 'emissive',
      color: idx % 2 === 0 ? '#1e293b' : '#38bdf8',
      emissive: idx % 2 === 0 ? undefined : '#38bdf8',
      emissiveIntensity: idx % 2 === 0 ? 0 : 2,
    }));
  }

  // Remove backrest
  if (cmd.includes('remove') && cmd.includes('backrest')) {
    cloned.objects = cloned.objects.filter((obj: any) => !obj.name.toLowerCase().includes('backrest'));
  }

  // Add leg
  if (cmd.includes('add') && cmd.includes('leg')) {
    const legCount = cloned.objects.filter((obj: any) => obj.name.toLowerCase().includes('leg')).length;
    cloned.objects.push({
      id: `leg_extra_${Date.now()}`,
      name: `Support Leg ${legCount + 1}`,
      type: 'cylinder',
      position: [0.7, 0.4, 0.7],
      rotation: [0, 0, 0],
      scale: [0.08, 0.8, 0.08],
      color: '#334155',
      material: 'metal',
      metalness: 0.8,
      roughness: 0.2,
    });
  }

  // Background change
  if (cmd.includes('background')) {
    if (cmd.includes('white') || cmd.includes('light')) {
      cloned.backgroundColor = '#f8fafc';
    } else if (cmd.includes('dark') || cmd.includes('black')) {
      cloned.backgroundColor = '#020617';
    } else if (cmd.includes('blue') || cmd.includes('navy')) {
      cloned.backgroundColor = '#0f172a';
    } else {
      cloned.backgroundColor = '#0a0a0c';
    }
  }

  // Detailed object
  if (cmd.includes('detail')) {
    cloned.quality = 'high';
    // Add chamfer and detail rings
    cloned.objects.push({
      id: `detail_accent_${Date.now()}`,
      name: 'High-Precision Bevel Trim',
      type: 'ring',
      position: [0, 0.95, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [0.9, 0.9, 0.04],
      color: '#38bdf8',
      material: 'metal',
      metalness: 0.9,
      roughness: 0.1,
    });
  }

  return cloned;
}

// Vite middleware / production serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShapeX Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
