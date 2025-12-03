"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import { ScientificChart } from "@/components/analysis/ScientificChart";
import { DataImportModal } from "@/components/analysis/DataImportModal";
import { BentoCard } from "@/components/ui/BentoCard";
// Material Data Import
import { PRESET_MATERIALS, MaterialPreset } from "@/lib/materials";
import { Upload, Plus, Trash2, GripVertical, BarChart3, Layers, Microscope, ChevronRight, Activity, Hash, Maximize2, MoveHorizontal } from "lucide-react";

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Components ---

function LayerInput({ label, value, onChange, step=0.1 }: { label: string, value: number, onChange: (v: number)=>void, step?: number }) {
    return (
        <div className="flex flex-col gap-1 min-w-[80px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right px-1">{label}</span>
            <input
                type="number"
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-sm font-mono font-bold text-slate-800 text-right focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all hover:border-slate-300 hover:bg-white"
            />
        </div>
    )
}

function PhysicalLayerRow({ layer, index, color }: { layer: any, index: number, color: string }) {
  const { updateLayer, removeLayer } = useProjectStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative pl-3 mb-3 group">
      {/* Indicator Line */}
      <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full transition-colors group-hover:bg-blue-500" style={{ backgroundColor: color }}></div>

      {/* Clean White Card Style */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3">

        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab text-slate-300 hover:text-slate-500 p-1 flex-shrink-0">
            <GripVertical className="h-4 w-4" />
        </div>

        {/* Material Name (Left Side) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Layer {index + 1}</span>
            <input
                type="text"
                value={layer.material}
                onChange={(e) => updateLayer(layer.id, 'material', e.target.value)}
                className="bg-transparent font-bold text-slate-900 text-base focus:outline-none focus:underline w-full placeholder:text-slate-300 truncate"
                placeholder="Material Name"
            />
        </div>

        {/* Inputs (Right Side) - Only Density as requested */}
        <div className="flex gap-2 items-end">
            <LayerInput label="Density (g/cm³)" value={layer.density} onChange={(v)=>updateLayer(layer.id, 'density', v)} step={0.01} />
        </div>

        {/* Delete Button */}
        <button onClick={() => removeLayer(layer.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 ml-1 self-center">
            <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// [NEW] Material Quick Add Component
function MaterialQuickBar({ onAdd }: { onAdd: (m: MaterialPreset) => void }) {
    return (
        <div className="w-full border-b border-slate-100 bg-slate-50/50 py-2 px-3 overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mr-1">QUICK ADD:</span>

                {PRESET_MATERIALS.map((mat) => (
                    <button
                        key={mat.formula}
                        onClick={() => onAdd(mat)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all group whitespace-nowrap active:scale-95"
                        title={`Density: ${mat.density} g/cm³`}
                    >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mat.color }}></div>
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600 font-mono">
                            {mat.formula}
                        </span>
                    </button>
                ))}

                {/* More Button (Optional) */}
                <button className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 flex items-center">
                    <ChevronRight className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}

// --- Main Setup Component ---
export function SetupXRR() {
  const {
    layers, addLayer: addEmptyLayer, reorderLayers, updateLayer,
    wavelength, setWavelength,
    measuredData, setMeasuredData, setDataConfig
  } = useProjectStore();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const [yAxisType, setYAxisType] = useState<'linear' | 'log'>('log');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState("");

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { setFileContent(ev.target?.result as string); setIsModalOpen(true); };
      reader.readAsText(file);
      e.target.value = '';
  };

  const handleImportConfirm = (config: { unit: any, xCol: number, yCol: number }) => {
      const lines = fileContent.split('\n');
      const rows = lines.map(l => l.trim().split(/[\s,;]+/).map(Number)).filter(r => r.length>=2 && !r.some(isNaN));

      const originalX = rows.map(r => r[config.xCol]);
      const y = rows.map(r => r[config.yCol]);
      let finalX = [...originalX];

      if (config.unit === '2theta') {
        finalX = originalX.map(val => (4 * Math.PI * Math.sin((val / 2) * (Math.PI / 180))) / wavelength);
      } else if (config.unit === 'q_nm') {
        finalX = originalX.map(val => val / 10);
      }

      setMeasuredData({ x: finalX, y, originalX });
      setDataConfig(config.unit, { x: config.xCol, y: config.yCol });
      setIsModalOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);
      reorderLayers(oldIndex, newIndex);
    }
  };

  // [NEW] Preset 추가 핸들러
  const handleAddPreset = (preset: MaterialPreset) => {
      const newId = Math.random().toString(36).substr(2, 9);
      // Store에 addCustomLayer 액션을 호출
      useProjectStore.getState().addCustomLayer({
          id: newId,
          material: preset.formula,
          thickness: 50.0,
          density: preset.density,
          roughness: preset.roughness
      });
  };

  const substrate = layers[layers.length - 1];
  const draggableLayers = layers.slice(0, -1);

  // Auto-load mock data
  useEffect(() => {
    if (!measuredData) {
        const q = Array.from({length: 200}, (_, i) => 0.0 + i * 0.004);
        const i = q.map(val => Math.pow(val + 0.02, -4) * 1e8 * (Math.cos(val * 50) * 0.2 + 0.8) + 5);
        setMeasuredData({ x: q, y: i, originalX: q });
    }
  }, []);

  // ✅ 데이터 통계 자동 계산 (Memoized)
  const dataStats = useMemo(() => {
    if (!measuredData || measuredData.x.length === 0) return null;

    const x = measuredData.x;
    const y = measuredData.y;

    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMax = Math.max(...y);
    
    // 배경 신호 추정 (마지막 5% 데이터의 평균)
    const tailCount = Math.max(5, Math.floor(y.length * 0.05));
    const tailY = y.slice(-tailCount);
    const bgNoise = tailY.reduce((a, b) => a + b, 0) / tailCount;
    
    // 다이내믹 레인지 계산 (Log10 차이)
    const dynamicRange = Math.log10(yMax) - Math.log10(bgNoise > 0 ? bgNoise : 1e-10);

    return {
        points: x.length,
        xRange: `${xMin.toFixed(3)} - ${xMax.toFixed(3)}`,
        dynamicRange: dynamicRange.toFixed(1),
        noiseFloor: bgNoise.toExponential(1)
    };
  }, [measuredData]);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <DataImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} fileContent={fileContent} onConfirm={handleImportConfirm} />

      {/* --- Left Panel: Controls (4 Cols) --- */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden h-full">

        {/* 1. Instrument & Import Card */}
        <BentoCard
            title={<><Microscope className="w-4 h-4 text-primary"/> Instrument Config</>}
            className="shrink-0"
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileRead} className="hidden" accept=".dat,.xy,.csv,.txt"/>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-all group"
                    >
                        <Upload className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors"/>
                        Import Measured Data
                    </button>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Wavelength (Å)</label>
                    <input
                        type="number" value={wavelength}
                        onChange={(e) => setWavelength(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm font-mono font-medium focus:ring-1 focus:ring-primary outline-none transition-shadow"
                    />
                </div>
                <div className="space-y-1.5">
                     <label className="text-[11px] font-bold text-slate-400 uppercase">Beam Width (mm)</label>
                     <input type="number" defaultValue={0.2} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm font-mono font-medium focus:ring-1 focus:ring-primary outline-none transition-shadow"/>
                </div>
            </div>
        </BentoCard>

        {/* 2. Stack Builder Card (Scrollable) */}
        <BentoCard
            title={<><Layers className="w-4 h-4 text-primary"/> Sample Model</>}
            className="flex-1 overflow-hidden flex flex-col"
            noPadding
            action={
                <button onClick={addEmptyLayer} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-sm transition-all active:scale-95">
                    <Plus className="h-3.5 w-3.5"/> Add Layer
                </button>
            }
        >
            {/* ✅ Quick Add Bar */}
            <MaterialQuickBar onAdd={handleAddPreset} />

            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent bg-slate-50/30">
                <div className="relative">
                     {/* Ambience Marker */}
                     <div className="flex items-center gap-2 mb-4 px-2 opacity-70">
                        <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"></div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ambience (Air)</span>
                        <div className="flex-1 border-t border-dashed border-slate-300"></div>
                     </div>

                     {/* Fix: Added unique ID to DndContext to prevent hydration error */}
                     <DndContext id="layer-dnd-context" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={draggableLayers.map(l => l.id)} strategy={verticalListSortingStrategy}>
                            {draggableLayers.map((layer, idx) => (
                                <PhysicalLayerRow key={layer.id} layer={layer} index={idx} color="#3b82f6" />
                            ))}
                        </SortableContext>
                     </DndContext>

                     {/* Substrate (Fixed) */}
                     <div className="relative pl-3 mt-2">
                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-slate-300"></div>
                        <div className="bg-slate-100/50 border border-slate-300 border-dashed rounded-xl p-3 flex items-center gap-3">
                             <div className="w-5"></div> {/* Spacer for drag handle alignment */}

                             <div className="flex-1 min-w-0 flex flex-col justify-center opacity-80">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Substrate</span>
                                 <span className="font-bold text-base text-slate-700">{substrate.material}</span>
                             </div>

                             <div className="flex gap-2 items-end opacity-90">
                                 <div className="w-[70px] flex items-center justify-end text-xs text-slate-400 font-mono italic pr-2 h-[34px]">Infinite</div>
                                 {/* Only Density here as well */}
                                 <LayerInput label="Density" value={substrate.density} onChange={(v)=>updateLayer(substrate.id,'density', v)} step={0.01} />
                             </div>
                             <div className="w-7"></div> {/* Spacer for delete button alignment */}
                        </div>
                     </div>
                </div>
            </div>
        </BentoCard>
      </div>

      {/* --- Right Panel: Visualization (8 Cols) --- */}
      <div className="col-span-12 lg:col-span-8 h-full flex flex-col gap-4">
         <BentoCard
            title={
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary"/> Data Visualization</span>
                    <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                        <button onClick={() => setYAxisType('linear')} className={`px-3 py-0.5 text-[10px] font-bold rounded-md transition-all ${yAxisType==='linear'?'bg-white text-primary shadow-sm':'text-slate-400 hover:text-slate-600'}`}>LIN</button>
                        <button onClick={() => setYAxisType('log')} className={`px-3 py-0.5 text-[10px] font-bold rounded-md transition-all ${yAxisType==='log'?'bg-white text-primary shadow-sm':'text-slate-400 hover:text-slate-600'}`}>LOG</button>
                    </div>
                </div>
            }
            className="flex-1 min-h-[400px]"
            noPadding
         >
             {/* ✅ Flex-col Layout for Chart and Stats */}
             <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0 w-full p-2 relative">
                    {measuredData ? (
                        <ScientificChart
                            data={[{ x: measuredData.x, y: measuredData.y, name: 'Measured', color: '#2563eb', mode: 'lines+markers' }]}
                            yScale={yAxisType}
                            showLegend={false}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">No Data</div>
                    )}
                </div>

                {/* ✅ Compact Data Stats Bar */}
                {dataStats && (
                    <div className="h-10 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between px-4 text-xs text-slate-500 divide-x divide-slate-200 flex-shrink-0">
                        <div className="flex items-center gap-2 px-4 w-full justify-center">
                            <MoveHorizontal className="h-3.5 w-3.5 text-slate-400"/>
                            <span>Scan: <strong className="text-slate-700 font-mono">{dataStats.xRange} Å⁻¹</strong></span>
                        </div>
                        <div className="flex items-center gap-2 px-4 w-full justify-center">
                            <Hash className="h-3.5 w-3.5 text-slate-400"/>
                            <span>Points: <strong className="text-slate-700 font-mono">{dataStats.points}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 px-4 w-full justify-center">
                            <Maximize2 className="h-3.5 w-3.5 text-slate-400"/>
                            <span>Dynamic Range: <strong className="text-blue-600 font-mono">{dataStats.dynamicRange} Orders</strong></span>
                        </div>
                        <div className="flex items-center gap-2 px-4 w-full justify-center">
                            <Activity className="h-3.5 w-3.5 text-slate-400"/>
                            <span>Noise Floor: <strong className="text-slate-700 font-mono">{dataStats.noiseFloor}</strong></span>
                        </div>
                    </div>
                )}
            </div>
         </BentoCard>
      </div>
    </div>
  );
}