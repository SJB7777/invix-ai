import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';

// --- Domain Types ---
export type MaterialLayer = {
  id: string;
  material: string;
  thickness: number; 
  roughness: number; 
  density: number; 
};

export type SimulationStatus = 'idle' | 'fitting' | 'success' | 'error';

// ✅ 데이터 포맷 설정 타입
export type XAxisUnit = '2theta' | 'theta' | 'q_nm' | 'q_a'; // 2theta(deg), theta(deg), q(nm-1), q(A-1)

interface ProjectState {
  projectId: string | null;
  
  // --- Config State ---
  wavelength: number; 
  beamWidth: number;
  
  // ✅ 데이터 설정 상태
  xAxisUnit: XAxisUnit;
  dataColumnMap: { x: number; y: number }; // CSV의 몇 번째 컬럼이 X/Y인지

  layers: MaterialLayer[];
  
  // ✅ 데이터 저장소
  measuredData: { x: number[]; y: number[]; originalX: number[] } | null; // originalX는 변환 전 값 저장
  calculatedData: { x: number[]; y: number[] } | null;
  
  status: SimulationStatus;
  
  // --- Actions ---
  setProjectId: (id: string) => void;
  setWavelength: (val: number) => void;
  addLayer: () => void;
  updateLayer: (id: string, field: keyof MaterialLayer, value: any) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (oldIndex: number, newIndex: number) => void;
  
  // ✅ 데이터 처리 액션
  setMeasuredData: (data: { x: number[], y: number[], originalX: number[] }) => void;
  setDataConfig: (unit: XAxisUnit, colMap: {x: number, y: number}) => void;
  
  runSimulation: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectId: null,
  wavelength: 1.5406, 
  beamWidth: 0.2,

  // 기본값: X축은 2-Theta, 0번 컬럼 X, 1번 컬럼 Y
  xAxisUnit: '2theta',
  dataColumnMap: { x: 0, y: 1 },

  layers: [
    { id: 'lay1', material: 'SiO2', thickness: 25.0, roughness: 4.1, density: 2.2 },
    { id: 'sub', material: 'Si Substrate', thickness: 0, roughness: 3.2, density: 2.33 },
  ],
  
  measuredData: null,
  calculatedData: null,
  status: 'idle',

  setProjectId: (id) => set({ projectId: id }),
  setWavelength: (val) => set({ wavelength: val }),

  addLayer: () => set((state) => {
    const newLayer: MaterialLayer = {
      id: Math.random().toString(36).substr(2, 9),
      material: "New Material",
      thickness: 50.0,
      roughness: 3.0,
      density: 1.0
    };
    const newLayers = [...state.layers];
    newLayers.splice(newLayers.length - 1, 0, newLayer);
    return { layers: newLayers };
  }),

  updateLayer: (id, field, value) => set((state) => ({
    layers: state.layers.map((l) => (l.id === id ? { ...l, [field]: value } : l))
  })),

  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter((l) => l.id !== id)
  })),

  reorderLayers: (oldIndex, newIndex) => set((state) => {
    const substrateIndex = state.layers.length - 1;
    if (oldIndex === substrateIndex || newIndex === substrateIndex) return state;
    return { layers: arrayMove(state.layers, oldIndex, newIndex) };
  }),

  // ✅ 데이터 설정 및 저장 액션
  setMeasuredData: (data) => set({ measuredData: data }),
  setDataConfig: (unit, colMap) => set({ xAxisUnit: unit, dataColumnMap: colMap }),

  runSimulation: async () => {
    set({ status: 'fitting' });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set({ status: 'success' });
  }
}));