"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import { ScientificChart } from "@/components/analysis/ScientificChart";
import { DataImportModal } from "@/components/analysis/DataImportModal";
import { BentoCard } from "@/components/ui/BentoCard";
import { PRESET_MATERIALS, MaterialPreset } from "@/lib/materials";
import { 
  Upload, Plus, Trash2, GripVertical, BarChart2, Layers, Microscope, 
  ChevronRight, Activity, Hash, Maximize2, MoveHorizontal, 
  Search, ZoomIn, ZoomOut, Download, Settings2, Lock
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Helper: Layer Color ---
function getLayerColor(str: string) {
    const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// --- Components ---

function LayerInput({ label, value, unit, onChange, step=0.1, disabled=false }: { label: string, value?: number, unit?: string, onChange?: (v: number)=>void, step?: number, disabled?: boolean }) {
    return (
        <div className="flex flex-col group/input relative w-full">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 ml-1 group-hover/input:text-blue-500 transition-colors">
                {label}
            </label>
            <div className="relative">
                <input
                    type="number"
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange?.(parseFloat(e.target.value))}
                    className={`w-full border rounded px-2 py-1 text-xs font-mono font-bold text-right outline-none transition-all ${
                        disabled 
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-slate-50/50 border-slate-200 hover:border-blue-300 focus:border-blue-500 text-slate-700"
                    }`}
                />
                {unit && <span className="absolute right-7 top-1.5 text-[9px] text-slate-400 pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity">{unit}</span>}
            </div>
        </div>
    )
}

function FixedLayerRow({ label, material, density, onChangeDensity, color, isTop = false }: { label: string, material: string, density?: number, onChangeDensity?: (v: number)=>void, color: string, isTop?: boolean }) {
    return (
        <div className="relative mb-1 group">
            <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2 ${isTop ? 'rounded-tl-md' : 'rounded-bl-md'}`}
                style={{ backgroundColor: color }}
            ></div>

            <div className={`bg-slate-50/80 border border-slate-200 border-l-0 ${isTop?'rounded-tr-md':'rounded-br-md'} p-2 pl-3 flex items-center gap-3`}>
                <div className="text-slate-300 flex-shrink-0" title="Fixed Layer">
                    <Lock className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">{label}</span>
                    <span className="text-sm font-bold text-slate-700">{material}</span>
                </div>
                <div className="w-[100px]">
                    {typeof density === 'number' ? (
                        <LayerInput 
                            label="Dens (g/cm³)" 
                            value={density} 
                            onChange={onChangeDensity} 
                            step={0.01} 
                        />
                    ) : (
                        <div className="h-full flex items-end justify-end pb-1 pr-2">
                            <span className="text-[10px] font-mono text-slate-400">Fixed</span>
                        </div>
                    )}
                </div>
                <div className="w-6"></div>
            </div>
        </div>
    );
}

function PhysicalLayerRow({ layer, index }: { layer: any, index: number }) {
  const { updateLayer, removeLayer } = useProjectStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const layerColor = getLayerColor(layer.material);

  return (
    <div ref={setNodeRef} style={style} className="relative mb-1 group">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2" style={{ backgroundColor: layerColor }}></div>

      <div className="bg-white border border-slate-200 border-l-0 p-2 pl-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-slate-300 hover:text-slate-500 flex-shrink-0">
            <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-4 h-4 rounded bg-slate-100 text-[9px] font-bold text-slate-500">
                    {index + 1}
                </span>
                <input
                    type="text"
                    value={layer.material}
                    onChange={(e) => updateLayer(layer.id, 'material', e.target.value)}
                    className="bg-transparent font-bold text-slate-800 text-sm focus:outline-none focus:underline w-full truncate"
                />
            </div>
        </div>

        <div className="w-[100px]">
            <LayerInput 
                label="Dens (g/cm³)" 
                value={layer.density} 
                onChange={(v)=>updateLayer(layer.id, 'density', v)} 
                step={0.01} 
            />
        </div>

        <button onClick={() => removeLayer(layer.id)} className="text-slate-200 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors flex-shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ChartToolbar({ yAxisType, setYAxisType }: any) {
    return (
        <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-lg border border-slate-200 backdrop-blur-sm">
            <div className="flex bg-white rounded border border-slate-200 p-0.5">
                <button onClick={() => setYAxisType('linear')} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${yAxisType==='linear'?'bg-slate-100 text-blue-600':'text-slate-400 hover:text-slate-600'}`}>LIN</button>
                <button onClick={() => setYAxisType('log')} className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${yAxisType==='log'?'bg-slate-100 text-blue-600':'text-slate-400 hover:text-slate-600'}`}>LOG</button>
            </div>
            <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
            <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-all"><ZoomIn className="w-3.5 h-3.5"/></button>
            <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-all"><ZoomOut className="w-3.5 h-3.5"/></button>
            <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-all"><Download className="w-3.5 h-3.5"/></button>
            <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
            <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-all"><Settings2 className="w-3.5 h-3.5"/></button>
        </div>
    )
}

// --- Main Setup Component ---
export function SetupXRR() {
  const {
    layers, addLayer: addEmptyLayer, reorderLayers, updateLayer,
    wavelength, setWavelength,
    measuredData, setMeasuredData, addCustomLayer
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
  
  const handleImportConfirm = (config: any) => { 
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

  const handleAddPreset = (preset: MaterialPreset) => {
      const newId = Math.random().toString(36).substr(2, 9);
      addCustomLayer({
          id: newId,
          material: preset.formula,
          thickness: 50.0,
          density: preset.density,
          roughness: preset.roughness
      });
  };

  const substrate = layers[layers.length - 1];
  const draggableLayers = layers.slice(0, -1);

  useEffect(() => {
    if (!measuredData) {
        const q = Array.from({length: 200}, (_, i) => 0.0 + i * 0.004);
        const i = q.map(val => Math.pow(val + 0.02, -4) * 1e8 * (Math.cos(val * 50) * 0.2 + 0.8) + 5);
        setMeasuredData({ x: q, y: i, originalX: q });
    }
  }, []);

  const dataStats = useMemo(() => {
    if (!measuredData || measuredData.x.length === 0) return null;
    const x = measuredData.x;
    const y = measuredData.y;
    return {
        points: x.length,
        xRange: `${Math.min(...x).toFixed(2)} - ${Math.max(...x).toFixed(2)}`,
        noiseFloor: (y[y.length-1]).toExponential(1)
    };
  }, [measuredData]);

  return (
    <div className="grid grid-cols-12 gap-6 h-full relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none -z-10"></div>

      <DataImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} fileContent={fileContent} onConfirm={handleImportConfirm} />

      {/* --- Left Panel: Controls --- */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden h-full">

        <BentoCard className="shrink-0 p-4" noPadding>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-primary"/> Instrument
                </h3>
                <input type="file" ref={fileInputRef} onChange={handleFileRead} className="hidden" accept=".dat,.xy,.csv,.txt"/>
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                    <Upload className="w-3 h-3"/> Import
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Wavelength (Å)</label>
                    <div className="relative">
                        <input type="number" value={wavelength} onChange={(e) => setWavelength(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono font-bold outline-none focus:border-blue-500"/>
                        <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">Cu-Kα</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Beam Width (mm)</label>
                    <input type="number" defaultValue={0.2} className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono font-bold outline-none focus:border-blue-500"/>
                </div>
            </div>
        </BentoCard>

        {/* Sample Model */}
        <BentoCard
            title={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary"/> 
                        <span className="font-bold">Layer Stack</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono ml-2">{layers.length}</span>
                    </div>
                    {/* ❌ 상단 Custom 버튼 삭제됨 */}
                </div>
            }
            className="flex-1 overflow-hidden flex flex-col min-h-0"
            noPadding
        >
            <div className="px-3 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Add Presets</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {PRESET_MATERIALS.map((mat) => (
                        <button key={mat.formula} onClick={() => handleAddPreset(mat)} className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-slate-200 rounded shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95 whitespace-nowrap">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mat.color }}></div>
                            <span className="text-[10px] font-bold text-slate-600 font-mono">{mat.formula}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-50/30">
                <FixedLayerRow 
                    label="Ambience" 
                    material="Air / Vacuum" 
                    color="#38bdf8" 
                    isTop={true} 
                />

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={draggableLayers.map(l => l.id)} strategy={verticalListSortingStrategy}>
                        {draggableLayers.map((layer, idx) => (
                            <PhysicalLayerRow key={layer.id} layer={layer} index={idx} />
                        ))}
                    </SortableContext>
                </DndContext>

                {/* ✅ Custom Layer 추가 버튼을 스택 내부에 배치 */}
                <button
                    onClick={addEmptyLayer}
                    className="w-full py-2 mb-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group"
                >
                    <div className="p-1 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
                        <Plus className="w-3 h-3" />
                    </div>
                    Add Custom Layer
                </button>

                <FixedLayerRow 
                    label="Substrate" 
                    material={substrate.material} 
                    density={substrate.density} 
                    onChangeDensity={(v) => updateLayer(substrate.id, 'density', v)} 
                    color="#94a3b8" 
                />
            </div>
        </BentoCard>
      </div>

      {/* --- Right Panel: Visualization --- */}
      <div className="col-span-12 lg:col-span-8 h-full flex flex-col gap-4">
         <BentoCard className="flex-1 min-h-[400px] flex flex-col" noPadding>
             <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary"/>
                    <span className="text-sm font-bold text-slate-800">Experimental Data</span>
                </div>
                <ChartToolbar yAxisType={yAxisType} setYAxisType={setYAxisType} />
             </div>

             <div className="flex-1 min-h-0 w-full relative bg-white">
                {measuredData ? (
                    <ScientificChart
                        data={[{ x: measuredData.x, y: measuredData.y, name: 'Measured', color: '#2563eb', mode: 'lines+markers' }]}
                        yScale={yAxisType}
                        showLegend={false}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                        <Search className="w-8 h-8 mb-2 opacity-50"/>
                        <span className="text-sm">No data loaded</span>
                        <span className="text-xs">Import a file to visualize</span>
                    </div>
                )}
             </div>

             {dataStats && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200 rounded p-2 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 rounded text-blue-600"><MoveHorizontal className="w-3.5 h-3.5"/></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Q-Range</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700">{dataStats.xRange}</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded p-2 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-50 rounded text-green-600"><Hash className="w-3.5 h-3.5"/></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Data Points</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700">{dataStats.points}</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded p-2 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-orange-50 rounded text-orange-600"><Activity className="w-3.5 h-3.5"/></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Noise Floor</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700">{dataStats.noiseFloor}</span>
                        </div>
                    </div>
                </div>
             )}
         </BentoCard>
      </div>
    </div>
  );
}