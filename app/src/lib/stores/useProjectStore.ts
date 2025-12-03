import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // ✅ 미들웨어 추가
import { arrayMove } from '@dnd-kit/sortable';

// --- Domain Types ---
export type MaterialLayer = {
  id: string;
  material: string;
  thickness: number; 
  roughness: number; 
  density: number;
};

// AnalysisXRR에서 사용하는 상태 타입 정의
export type XYData = { x: number[]; y: number[] };
// EDPData 확장: 개별 레이어 프로파일 포함
export type EDPData = { 
  z: number[]; 
  rho: number[]; 
  layers: { name: string; rho: number[]; color: string }[]; 
};
export type FFTData = { freq: number[]; amp: number[] };
export type Metrics = { chi2: number; fom: number; mae: number };

export type SimulationStatus = 'idle' | 'ai_thinking' | 'optimizing' | 'success' | 'error';
export type XAxisUnit = '2theta' | 'theta' | 'q_nm' | 'q_a';

interface ProjectState {
  projectId: string | null;
  wavelength: number;
  beamWidth: number;
  
  xAxisUnit: XAxisUnit;
  dataColumnMap: { x: number; y: number };

  layers: MaterialLayer[];
  
  measuredData: { x: number[]; y: number[]; originalX: number[] } | null;
  
  aiData: XYData | null;
  fitData: XYData | null;
  residualData: XYData | null;
  edpData: EDPData | null;
  fftData: FFTData | null;
  metrics: Metrics | null;
  fittedLayers: MaterialLayer[] | null;

  status: SimulationStatus;
  
  // Actions
  setProjectId: (id: string) => void;
  setWavelength: (val: number) => void;
  addLayer: () => void;
  addCustomLayer: (layer: MaterialLayer) => void;
  updateLayer: (id: string, field: keyof MaterialLayer, value: any) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (oldIndex: number, newIndex: number) => void;
  
  setMeasuredData: (data: { x: number[], y: number[], originalX: number[] }) => void;
  setDataConfig: (unit: XAxisUnit, colMap: {x: number, y: number}) => void;
  
  runSimulation: () => Promise<void>;
  runAnalysisPipeline: () => Promise<void>;
}

// Error Function Approximation
function erf(x: number) {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  let sign = 1;
  if (x < 0) sign = -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// ✅ persist 미들웨어 적용
export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projectId: null,
      wavelength: 1.5406, 
      beamWidth: 0.2,
      xAxisUnit: '2theta',
      dataColumnMap: { x: 0, y: 1 },

      layers: [
        { id: 'lay1', material: 'SiO2', thickness: 25.0, roughness: 4.1, density: 2.2 },
        { id: 'sub', material: 'Si Substrate', thickness: 0, roughness: 3.2, density: 2.33 },
      ],
      
      measuredData: null,
      
      aiData: null,
      fitData: null,
      residualData: null,
      edpData: null,
      fftData: null,
      metrics: null,
      fittedLayers: null,

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

      addCustomLayer: (layer: MaterialLayer) => set((state) => {
        const newLayers = [...state.layers];
        newLayers.splice(newLayers.length - 1, 0, layer);
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

      setMeasuredData: (data) => set({ measuredData: data }),
      setDataConfig: (unit, colMap) => set({ xAxisUnit: unit, dataColumnMap: colMap }),

      runSimulation: async () => {
        set({ status: 'optimizing' });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        set({ status: 'success' });
      },

      runAnalysisPipeline: async () => {
        const state = get();
        if (!state.measuredData) return;

        set({ status: 'ai_thinking', metrics: null, fittedLayers: null });
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // AI Inference Mock
        const x = state.measuredData.x;
        const aiY = x.map(val => Math.pow(val + 0.02, -4) * 5e7 * (Math.cos(val * 48) * 0.3 + 0.7)); 
        set({ 
            aiData: { x, y: aiY },
            status: 'optimizing' 
        });

        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Fit Mock
        const fitY = x.map(val => Math.pow(val + 0.02, -4) * 1e8 * (Math.cos(val * 50) * 0.2 + 0.8) + 2);
        const residY = x.map((_, i) => (Math.random() - 0.5) * 0.5); 

        // Result Layers Mock
        const resultLayers: MaterialLayer[] = state.layers.map(l => ({
            ...l,
            thickness: l.thickness > 0 ? l.thickness + (Math.random() * 2 - 1) : 0,
            roughness: Math.abs(l.roughness + (Math.random() * 0.5 - 0.25)),
            density: l.density
        }));

        // EDP Calculation
        const maxDepth = resultLayers.reduce((acc, l) => acc + l.thickness, 0) + 50;
        const zStep = 0.5;
        const edpZ: number[] = [];
        const edpRho: number[] = [];
        
        const layerProfiles = resultLayers.map(l => ({
            name: l.material,
            rho: [] as number[],
            color: ''
        }));

        let interfacePositions = [0];
        let currentPos = 0;
        for (let i = 0; i < resultLayers.length - 1; i++) {
            currentPos += resultLayers[i].thickness;
            interfacePositions.push(currentPos);
        }

        for(let z = -20; z <= maxDepth; z += zStep) {
            edpZ.push(z);
            let totalVal = 0;

            for (let i = 0; i < resultLayers.length; i++) {
                const layer = resultLayers[i];
                const density = layer.density;
                const sigmaTop = layer.roughness; 
                
                const zTop = (i === 0) ? 0 : interfacePositions[i];
                const stepUp = 0.5 * (1 + erf((z - zTop) / (Math.sqrt(2) * sigmaTop)));
                
                let val = 0;
                if (i === resultLayers.length - 1) {
                    val = density * stepUp;
                } else {
                    const zBottom = interfacePositions[i+1];
                    const erfTop = erf((z - zTop) / (Math.sqrt(2) * sigmaTop));
                    const erfBot = erf((z - zBottom) / (Math.sqrt(2) * resultLayers[i+1].roughness));
                    val = (density / 2) * (erfBot - erfTop) * -1;
                }
                
                if (val < 0) val = 0;
                layerProfiles[i].rho.push(val);
            }
            
            const sumVal = layerProfiles.reduce((acc, p) => acc + p.rho[p.rho.length-1], 0);
            edpRho.push(sumVal);
        }

        // FFT Data
        const fftFreq = Array.from({length: 50}, (_, i) => i * 2);
        const fftAmp = fftFreq.map(f => Math.exp(-Math.pow(f - 50, 2)/100) * 10);

        set({
            fitData: { x, y: fitY },
            residualData: { x, y: residY },
            edpData: { z: edpZ, rho: edpRho, layers: layerProfiles },
            fftData: { freq: fftFreq, amp: fftAmp },
            metrics: { chi2: 1.24e-3, fom: 98.5, mae: 0.042 },
            fittedLayers: resultLayers,
            status: 'success'
        });
      }
    }),
    {
      name: 'invix-project-storage', // ✅ 로컬 스토리지에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // ✅ 저장소 지정 (localStorage)
    }
  )
);