"use client";

import React, { useState } from "react";
import { BentoCard } from "@/components/ui/BentoCard";
import { Upload, Plus, Trash2, GripVertical, RefreshCw, Settings2 } from "lucide-react";
import dynamic from 'next/dynamic';

// Plotly는 무거운 라이브러리라 dynamic import로 불러옵니다 (SSR 에러 방지)
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// 타입 정의
type MaterialLayer = {
  id: string;
  material: string; // 물질 이름 (예: SiO2)
  thickness: number; // 초기 두께 (Angstrom)
  density: number; // 밀도 (g/cm3)
  roughness: number; // 거칠기 (Angstrom)
};

export function SetupXRR() {
  // --- State 관리 ---
  const [wavelength, setWavelength] = useState(1.5406); // 기본값: Cu Ka
  const [beamWidth, setBeamWidth] = useState(0.2); // mm
  const [layers, setLayers] = useState<MaterialLayer[]>([
    { id: 'sub', material: 'Si Substrate', thickness: 0, density: 2.33, roughness: 3.0 },
    { id: 'l1', material: 'SiO2', thickness: 50, density: 2.2, roughness: 4.0 },
  ]);

  // --- Mock Data (Plot용 더미 데이터) ---
  const qData = Array.from({length: 100}, (_, i) => 0.0 + i * 0.005);
  const iData = qData.map(q => Math.pow(q + 0.02, -4) * 1000 + Math.random() * 10);

  // --- Event Handlers ---
  const addLayer = () => {
    const newLayer: MaterialLayer = {
      id: Math.random().toString(36).substr(2, 9),
      material: "New Layer",
      thickness: 10,
      density: 1.0,
      roughness: 2.0
    };
    // 기판(마지막 요소) 위에 쌓아야 하므로 splice 사용
    const newLayers = [...layers];
    newLayers.splice(layers.length - 1, 0, newLayer);
    setLayers(newLayers);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
  };

  const updateLayer = (id: string, field: keyof MaterialLayer, value: any) => {
    setLayers(layers.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      
      {/* --- LEFT COLUMN: 설정 입력 --- */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-2">
        
        {/* 1. 파일 업로드 */}
        <BentoCard title="1. Experimental Data" className="min-h-[160px]">
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group p-6">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5 text-slate-400 group-hover:text-primary" />
            </div>
            <p className="text-sm font-medium text-slate-600">Click to upload .dat / .xy</p>
            <p className="text-xs text-slate-400 mt-1">Supports Rigaku, Bruker formats</p>
          </div>
        </BentoCard>

        {/* 2. 장비 설정 (Instrument) */}
        <BentoCard title="2. Instrument Settings" action={<Settings2 className="h-4 w-4 text-slate-400"/>}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Wavelength (Å)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.0001"
                  value={wavelength}
                  onChange={(e) => setWavelength(parseFloat(e.target.value))}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">Cu Kα</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Beam Width (mm)</label>
              <input 
                type="number" 
                value={beamWidth}
                onChange={(e) => setBeamWidth(parseFloat(e.target.value))}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <input type="checkbox" id="footprint" className="rounded border-gray-300 text-primary focus:ring-primary" />
             <label htmlFor="footprint" className="text-sm text-slate-600 select-none cursor-pointer">Apply Footprint Correction</label>
          </div>
        </BentoCard>

        {/* 3. 물질 적층 구조 (Material Stack) */}
        <BentoCard 
          title="3. Sample Model" 
          className="flex-1"
          action={
            <button onClick={addLayer} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-blue-700">
              <Plus className="h-3 w-3" /> Add Layer
            </button>
          }
        >
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              <div className="col-span-4">Material</div>
              <div className="col-span-3 text-right">Thick(Å)</div>
              <div className="col-span-2 text-right">Den</div>
              <div className="col-span-2 text-right">Rough</div>
              <div className="col-span-1"></div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {layers.map((layer, index) => {
                const isSubstrate = index === layers.length - 1; // 맨 마지막이 기판이라고 가정
                return (
                  <div key={layer.id} className={`grid grid-cols-12 gap-2 items-center rounded-md border p-2 transition-all ${isSubstrate ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-100 hover:border-primary/50'}`}>
                    
                    {/* Material Name */}
                    <div className="col-span-4 flex items-center gap-2">
                      {!isSubstrate && <GripVertical className="h-3 w-3 text-slate-300 cursor-move" />}
                      <input 
                        type="text" 
                        value={layer.material}
                        onChange={(e) => updateLayer(layer.id, 'material', e.target.value)}
                        className="w-full bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                      />
                    </div>

                    {/* Thickness */}
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={layer.thickness}
                        disabled={isSubstrate}
                        className={`w-full text-right text-sm bg-transparent focus:outline-none ${isSubstrate ? 'text-transparent' : 'text-slate-600'}`}
                        placeholder={isSubstrate ? "-" : "0"}
                      />
                    </div>

                    {/* Density */}
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        step="0.1"
                        value={layer.density}
                        className="w-full text-right text-sm text-slate-600 bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Roughness */}
                    <div className="col-span-2">
                      <input 
                        type="number" 
                        step="0.1"
                        value={layer.roughness}
                        className="w-full text-right text-sm text-slate-600 bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Delete Action */}
                    <div className="col-span-1 flex justify-end">
                      {!isSubstrate && (
                        <button onClick={() => removeLayer(layer.id)} className="text-slate-300 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-2 text-[10px] text-slate-400 text-center">
              Top Layer (Surface) is shown at the top
            </div>
          </div>
        </BentoCard>
      </div>

      {/* --- RIGHT COLUMN: 시각화 & 통계 --- */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 h-full">
        
        {/* 통계 정보 카드 (가로 배치) */}
        <div className="grid grid-cols-3 gap-4">
          <BentoCard title="Data Range (Q)" noPadding className="h-24">
            <div className="flex h-full flex-col justify-center px-6">
              <span className="text-2xl font-bold text-slate-800">0.05 - 0.72</span>
              <span className="text-xs text-slate-500">Å⁻¹</span>
            </div>
          </BentoCard>
          <BentoCard title="Max Intensity" noPadding className="h-24">
            <div className="flex h-full flex-col justify-center px-6">
              <span className="text-2xl font-bold text-blue-600">2.4M</span>
              <span className="text-xs text-slate-500">counts (normalized)</span>
            </div>
          </BentoCard>
          <BentoCard title="Background Level" noPadding className="h-24">
            <div className="flex h-full flex-col justify-center px-6">
              <span className="text-2xl font-bold text-slate-800">12.5</span>
              <span className="text-xs text-slate-500">average counts</span>
            </div>
          </BentoCard>
        </div>

        {/* 메인 차트 */}
        <BentoCard title="Raw Data Visualization" className="flex-1 min-h-[400px]" 
          action={
            <div className="flex gap-2">
              <button className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200">
                <RefreshCw className="h-3 w-3" /> Normalize
              </button>
            </div>
          }
        >
          <div className="h-full w-full relative">
            <Plot
              data={[
                {
                  x: qData,
                  y: iData,
                  type: 'scatter',
                  mode: 'markers',
                  marker: { color: '#3182f6', size: 4 }, // Tailwind Primary Color
                  name: 'Experimental'
                }
              ]}
              layout={{ 
                autosize: true, 
                margin: { l: 60, r: 20, t: 20, b: 60 },
                showlegend: true,
                yaxis: { 
                  type: 'log', 
                  title: 'Intensity (a.u.)',
                  gridcolor: '#f1f5f9',
                  zeroline: false
                },
                xaxis: { 
                  title: 'Q (1/Å)',
                  gridcolor: '#f1f5f9',
                  zeroline: false
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
              }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </BentoCard>

        {/* 데이터 슬라이더 (Data Trimming) */}
        <BentoCard className="h-auto">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-medium text-slate-700">
              <span>Data ROI Selection</span>
              <span className="text-primary">0.02 ~ 0.65 Å⁻¹</span>
            </div>
            {/* 실제 Range Slider 컴포넌트가 들어갈 자리. 일단 표준 input으로 구현 */}
            <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Min: 0.00</span>
              <span>Max: 0.72</span>
            </div>
          </div>
        </BentoCard>

      </div>
    </div>
  );
}