import { DemoImageItem } from '../types';

// Crisp SVG data URIs representing demo objects for instantaneous preview
function createSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_IMAGES: DemoImageItem[] = [
  {
    id: 'gaming-chair',
    name: 'Pro Gaming Chair',
    category: 'Furniture',
    label: 'Ergonomic Racing Gaming Chair',
    thumbnail: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="100%" stop-color="#111827" />
          </linearGradient>
          <linearGradient id="chairRed" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="100%" stop-color="#991b1b" />
          </linearGradient>
          <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" rx="24" fill="url(#bg)" />
        <!-- Grid pattern -->
        <circle cx="200" cy="200" r="140" fill="none" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4" />
        <ellipse cx="200" cy="350" rx="100" ry="20" fill="#000" opacity="0.5" />
        
        <!-- Base Star legs -->
        <path d="M 200 330 L 120 350 M 200 330 L 280 350 M 200 330 L 150 360 M 200 330 L 250 360 M 200 330 L 200 365" stroke="#475569" stroke-width="8" stroke-linecap="round" />
        <!-- Hydraulic cylinder -->
        <rect x="194" y="280" width="12" height="50" rx="3" fill="#64748b" />
        <!-- Seat base mechanism -->
        <rect x="175" y="270" width="50" height="12" rx="4" fill="#334155" />
        
        <!-- Seat Cushion -->
        <path d="M 140 260 C 140 250, 160 240, 200 240 C 240 240, 260 250, 260 260 L 255 272 C 255 276, 235 280, 200 280 C 165 280, 145 276, 145 272 Z" fill="url(#leather)" stroke="#334155" stroke-width="2" />
        <!-- Seat Red Accent stripe -->
        <path d="M 155 255 C 170 250, 230 250, 245 255" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" />
        
        <!-- Backrest -->
        <path d="M 160 240 C 150 180, 145 130, 155 90 C 160 70, 175 60, 200 60 C 225 60, 240 70, 245 90 C 255 130, 250 180, 240 240 Z" fill="url(#leather)" stroke="#334155" stroke-width="2" />
        <!-- Backrest Racing Bolsters -->
        <path d="M 160 95 C 168 140, 165 190, 162 230" stroke="url(#chairRed)" stroke-width="6" stroke-linecap="round" fill="none" />
        <path d="M 240 95 C 232 140, 235 190, 238 230" stroke="url(#chairRed)" stroke-width="6" stroke-linecap="round" fill="none" />
        <!-- Headrest / Harness Cutouts -->
        <rect x="180" y="90" width="16" height="8" rx="4" fill="#090d16" stroke="#ef4444" stroke-width="2" />
        <rect x="204" y="90" width="16" height="8" rx="4" fill="#090d16" stroke="#ef4444" stroke-width="2" />
        <!-- Headrest pillow -->
        <rect x="175" y="65" width="50" height="20" rx="8" fill="#ef4444" />
        <text x="200" y="79" font-family="sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">SHAPEX</text>
        
        <!-- Left Armrest -->
        <path d="M 135 240 L 130 210 L 142 210" stroke="#475569" stroke-width="6" stroke-linecap="round" fill="none" />
        <rect x="120" y="200" width="28" height="10" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
        <!-- Right Armrest -->
        <path d="M 265 240 L 270 210 L 258 210" stroke="#475569" stroke-width="6" stroke-linecap="round" fill="none" />
        <rect x="252" y="200" width="28" height="10" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
        
        <text x="200" y="385" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle" letter-spacing="2">DEMO // GAMING_CHAIR_3D</text>
      </svg>
    `),
    analysis: {
      objectName: 'Gaming Chair',
      category: 'Furniture',
      shape: 'Ergonomic racing chair with contoured backrest',
      visibleSurfaces: 'Headrest, racing wings, lumbar cushion, seat pan, 4D armrests, 5-wheel star base',
      approximateDepth: '0.72m',
      materials: ['fabric', 'metal', 'plastic'],
      colors: ['#0f172a', '#ef4444', '#64748b'],
      symmetry: 'mostly symmetrical',
      complexity: 'medium',
      importantDetails: 'Five-wheel caster base, hydraulic central cylinder, adjustable lumbar pad',
      reconstruction: 'primitive + custom geometry',
    },
  },
  {
    id: 'cyber-bottle',
    name: 'Cyber Bottle',
    category: 'Beverage / Container',
    label: 'Insulated Sports Flask',
    thumbnail: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" rx="24" fill="#090d16" />
        <ellipse cx="200" cy="350" rx="80" ry="16" fill="#000" opacity="0.6" />
        <!-- Bottle Body -->
        <defs>
          <linearGradient id="metalCyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="40%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
        </defs>
        <rect x="155" y="140" width="90" height="190" rx="16" fill="url(#metalCyan)" />
        <!-- Grip Ribs -->
        <rect x="150" y="210" width="100" height="40" rx="6" fill="#0f172a" opacity="0.9" />
        <line x1="155" y1="220" x2="245" y2="220" stroke="#00f0ff" stroke-width="2" />
        <line x1="155" y1="230" x2="245" y2="230" stroke="#00f0ff" stroke-width="2" />
        <line x1="155" y1="240" x2="245" y2="240" stroke="#00f0ff" stroke-width="2" />
        <!-- Tapered Neck -->
        <path d="M 155 145 C 160 125, 175 110, 185 105 L 215 105 C 225 110, 240 125, 245 145 Z" fill="#0369a1" />
        <!-- Neck Cylinder -->
        <rect x="185" y="90" width="30" height="20" rx="4" fill="#334155" />
        <!-- Cap with Carabiner Ring -->
        <rect x="178" y="70" width="44" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        <circle cx="200" cy="50" r="14" fill="none" stroke="#64748b" stroke-width="6" />
        <text x="200" y="385" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle" letter-spacing="2">DEMO // CYBER_FLASK_3D</text>
      </svg>
    `),
    analysis: {
      objectName: 'Cyber Sports Bottle',
      category: 'Beverage / Container',
      shape: 'Cylindrical insulated flask with ribbed grip and carabiner cap',
      visibleSurfaces: 'Cylindrical body, silicone grip ring, tapered shoulder, threaded cap',
      approximateDepth: '0.28m',
      materials: ['metal', 'rubber', 'plastic'],
      colors: ['#0284c7', '#0f172a', '#00f0ff'],
      symmetry: 'symmetrical',
      complexity: 'medium',
      importantDetails: 'Beveled shoulder, textured silicon grip band, metallic cap loop',
      reconstruction: 'lathe / stacked cylindrical primitives',
    },
  },
  {
    id: 'modern-desk',
    name: 'Modern Desk',
    category: 'Furniture',
    label: 'Architectural Office Desk',
    thumbnail: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" rx="24" fill="#090d16" />
        <ellipse cx="200" cy="350" rx="120" ry="20" fill="#000" opacity="0.6" />
        <!-- Legs -->
        <rect x="90" y="190" width="12" height="150" rx="4" fill="#334155" />
        <rect x="120" y="180" width="10" height="140" rx="3" fill="#1e293b" />
        <rect x="298" y="190" width="12" height="150" rx="4" fill="#334155" />
        <rect x="270" y="180" width="10" height="140" rx="3" fill="#1e293b" />
        <!-- Crossbeam -->
        <rect x="90" y="240" width="220" height="8" rx="2" fill="#1e293b" />
        <!-- Tabletop -->
        <polygon points="60,190 120,150 340,150 280,190" fill="#b45309" stroke="#78350f" stroke-width="2" />
        <polygon points="60,190 280,190 280,205 60,205" fill="#78350f" />
        <polygon points="280,190 340,150 340,165 280,205" fill="#451a03" />
        <text x="200" y="385" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle" letter-spacing="2">DEMO // MODERN_DESK_3D</text>
      </svg>
    `),
    analysis: {
      objectName: 'Modern Minimalist Desk',
      category: 'Furniture',
      shape: 'Rectangular beveled tabletop with quad tubular steel legs',
      visibleSurfaces: 'Oak wood top, chamfered apron, 4 structural steel legs, stabilizer bar',
      approximateDepth: '0.80m',
      materials: ['wood', 'metal'],
      colors: ['#b45309', '#1e293b', '#78350f'],
      symmetry: 'symmetrical',
      complexity: 'low',
      importantDetails: 'Under-desk reinforcement rail, chamfered corner edges',
      reconstruction: 'modular box + cylinder assembly',
    },
  },
  {
    id: 'cyber-drone',
    name: 'Cyber Drone',
    category: 'Electronics / Vehicle',
    label: 'High-Speed Aerial Quadcopter',
    thumbnail: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" rx="24" fill="#090d16" />
        <ellipse cx="200" cy="350" rx="110" ry="18" fill="#000" opacity="0.6" />
        <!-- 4 Boom Arms -->
        <line x1="200" y1="200" x2="100" y2="130" stroke="#334155" stroke-width="12" stroke-linecap="round" />
        <line x1="200" y1="200" x2="300" y2="130" stroke="#334155" stroke-width="12" stroke-linecap="round" />
        <line x1="200" y1="200" x2="90" y2="270" stroke="#334155" stroke-width="12" stroke-linecap="round" />
        <line x1="200" y1="200" x2="310" y2="270" stroke="#334155" stroke-width="12" stroke-linecap="round" />
        <!-- Rotors -->
        <circle cx="100" cy="130" r="30" fill="none" stroke="#00ffff" stroke-width="3" stroke-dasharray="8 4" opacity="0.8" />
        <circle cx="300" cy="130" r="30" fill="none" stroke="#00ffff" stroke-width="3" stroke-dasharray="8 4" opacity="0.8" />
        <circle cx="90" cy="270" r="30" fill="none" stroke="#00ffff" stroke-width="3" stroke-dasharray="8 4" opacity="0.8" />
        <circle cx="310" cy="270" r="30" fill="none" stroke="#00ffff" stroke-width="3" stroke-dasharray="8 4" opacity="0.8" />
        <!-- Rotor Motors -->
        <circle cx="100" cy="130" r="10" fill="#0f172a" stroke="#00ffff" stroke-width="2" />
        <circle cx="300" cy="130" r="10" fill="#0f172a" stroke="#00ffff" stroke-width="2" />
        <circle cx="90" cy="270" r="10" fill="#0f172a" stroke="#00ffff" stroke-width="2" />
        <circle cx="310" cy="270" r="10" fill="#0f172a" stroke="#00ffff" stroke-width="2" />
        <!-- Center Fuselage -->
        <polygon points="200,160 235,185 230,225 200,240 170,225 165,185" fill="#0f172a" stroke="#38bdf8" stroke-width="3" />
        <circle cx="200" cy="200" r="14" fill="#0284c7" />
        <!-- Gimbal Camera -->
        <circle cx="200" cy="245" r="8" fill="#1e293b" stroke="#00ffff" stroke-width="2" />
        <text x="200" y="385" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle" letter-spacing="2">DEMO // CYBER_DRONE_3D</text>
      </svg>
    `),
    analysis: {
      objectName: 'Cyber Drone',
      category: 'Electronics / Vehicle',
      shape: 'Aerodynamic central fuselage with 4 carbon-fiber rotor booms',
      visibleSurfaces: 'Top canopy, 4 rotor arms, 4 propeller blades, gimbal camera',
      approximateDepth: '0.45m',
      materials: ['plastic', 'metal'],
      colors: ['#0f172a', '#00ffff', '#38bdf8'],
      symmetry: 'quad-symmetrical',
      complexity: 'high',
      importantDetails: 'Underbody 3-axis camera gimbal, LED status rings, landing skids',
      reconstruction: 'multi-part composite geometry',
    },
  },
  {
    id: 'studio-headphones',
    name: 'Studio Headphones',
    category: 'Electronics',
    label: 'Over-Ear Reference Headphones',
    thumbnail: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" rx="24" fill="#090d16" />
        <ellipse cx="200" cy="350" rx="90" ry="16" fill="#000" opacity="0.6" />
        <!-- Headband Arc -->
        <path d="M 120 220 C 110 110, 290 110, 280 220" fill="none" stroke="#1e293b" stroke-width="24" stroke-linecap="round" />
        <path d="M 140 190 C 135 125, 265 125, 260 190" fill="none" stroke="#334155" stroke-width="8" stroke-linecap="round" />
        <!-- Cushion pad -->
        <path d="M 160 145 C 170 140, 230 140, 240 145" fill="none" stroke="#475569" stroke-width="12" stroke-linecap="round" />
        <!-- Left Earcup -->
        <ellipse cx="120" cy="240" rx="22" ry="34" fill="#0f172a" stroke="#38bdf8" stroke-width="3" />
        <ellipse cx="120" cy="240" rx="14" ry="24" fill="#334155" />
        <!-- Right Earcup -->
        <ellipse cx="280" cy="240" rx="22" ry="34" fill="#0f172a" stroke="#38bdf8" stroke-width="3" />
        <ellipse cx="280" cy="240" rx="14" ry="24" fill="#334155" />
        <text x="200" y="385" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle" letter-spacing="2">DEMO // STUDIO_HEADPHONES_3D</text>
      </svg>
    `),
    analysis: {
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
    },
  },
];
