export type MaterialPreset = {
  name: string;
  formula: string;
  density: number;
  roughness: number;
  color: string;
};

export const PRESET_MATERIALS: MaterialPreset[] = [
  { name: "Silicon", formula: "Si", density: 2.33, roughness: 3.0, color: "#94a3b8" },
  { name: "Silica", formula: "SiO2", density: 2.20, roughness: 4.0, color: "#3b82f6" },
  { name: "Alumina", formula: "Al2O3", density: 3.95, roughness: 3.5, color: "#ef4444" },
  { name: "Gold", formula: "Au", density: 19.32, roughness: 5.0, color: "#eab308" },
  { name: "Chromium", formula: "Cr", density: 7.19, roughness: 4.5, color: "#6366f1" },
  { name: "Titanium", formula: "Ti", density: 4.50, roughness: 3.8, color: "#8b5cf6" },
  { name: "Copper", formula: "Cu", density: 8.96, roughness: 4.2, color: "#f97316" },
  { name: "Nickel", formula: "Ni", density: 8.90, roughness: 4.0, color: "#14b8a6" },
];