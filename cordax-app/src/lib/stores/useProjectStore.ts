import { create } from 'zustand';

// --- Domain Types ---
export type MaterialLayer = {
  id: string;
  material: string; // name -> material로 통일
  thickness: number; // Angstroms
  roughness: number; // Angstroms
  density: number; // g/cm3
};

export type SimulationStatus = 'idle' | 'fitting' | 'success' | 'error';

interface ProjectState {
  projectId: string | null;
  
  // The Stack
  layers: MaterialLayer[];
  
  // Data (Mocked as number arrays for now)
  measuredData: { q: number[]; intensity: number[] } | null;
  calculatedData: { q: number[]; intensity: number[] } | null;
  
  // UI State
  status: SimulationStatus;
  
  // Actions
  setProjectId: (id: string) => void;
  addLayer: (layer: Omit<MaterialLayer, 'id'>) => void;
  updateLayer: (id: string, updates: Partial<MaterialLayer>) => void;
  removeLayer: (id: string) => void;
  runSimulation: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectId: null,
  
  // Default: Silicon Substrate + Native Oxide
  layers: [
    { id: 'sub', material: 'Si Substrate', thickness: 0, roughness: 3.2, density: 2.33 },
    { id: 'lay1', material: 'SiO2', thickness: 25.0, roughness: 4.1, density: 2.2 },
  ],
  
  measuredData: null,
  calculatedData: null,
  status: 'idle',

  setProjectId: (id) => set({ projectId: id }),

  addLayer: (layer) => set((state) => ({
    layers: [...state.layers, { ...layer, id: Math.random().toString(36).substr(2, 9) }]
  })),

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l))
  })),

  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter((l) => l.id !== id)
  })),

  runSimulation: async () => {
    set({ status: 'fitting' });
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set({ status: 'success' });
  }
}));