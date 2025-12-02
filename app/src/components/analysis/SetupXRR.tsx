"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import { ScientificChart } from "@/components/analysis/ScientificChart";
import { DataImportModal } from "@/components/analysis/DataImportModal";
import { BentoCard } from "@/components/ui/BentoCard";
import { Upload, Plus, Trash2, GripVertical, RefreshCw, Settings, AlignJustify, Info } from "lucide-react";

// DnD Kit Imports
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Layer Row: "Physical Stack" Design (복구된 디자인) ---
function PhysicalLayerRow({ layer, index, color }: { layer: any, index: number, color: string }) {
  const { updateLayer, removeLayer } = useProjectStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative pl-4 mb-3 group">
      {/* Color Coding Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-sm transition-all group-hover:w-2" style={{ backgroundColor: color }}></div>
      
      {/* Main Card */}
      <div className="bg-slate-50 border border-slate-300 rounded-r-md shadow-sm p-3 flex flex-col gap-3 transition-all hover:shadow-md hover:bg-white">
        
        {/* Header: Layer Name & Grip */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 w-full">
                <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded">
                    <GripVertical className="h-4 w-4" />
                </div>
                <input 
                    type="text" 
                    value={layer.material}
                    onChange={(e) => updateLayer(layer.id, 'material', e.target.value)}
                    className="bg-transparent font-bold text-slate-900 text-sm focus:outline-none focus:underline w-full"
                    placeholder="Material Name"
                />
            </div>
            <button onClick={() => removeLayer(layer.id)} className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>

        {/* Parameters Grid - High Contrast Inputs */}
        <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Thick (Å)</label>
                <input 
                    type="number" value={layer.thickness}
                    onChange={(e) => updateLayer(layer.id, 'thickness', parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-right transition-colors hover:border-blue-300"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Density</label>
                <input 
                    type="number" step="0.01" value={layer.density}
                    onChange={(e) => updateLayer(layer.id, 'density', parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-right transition-colors hover:border-blue-300"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Rough (Å)</label>
                <input 
                    type="number" step="0.1" value={layer.roughness}
                    onChange={(e) => updateLayer(layer.id, 'roughness', parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-right transition-colors hover:border-blue-300"
                />
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Data Quality Bar Component ---
function DataQualityBar({ data }: { data: { x: number[], y: number[] } | null }) {
    if (!data || data.x.length === 0) return (
        <div className="h-16 border-t border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-sm italic">
            Upload data to see quality metrics
        </div>
    );

    const minQ = Math.min(...data.x).toFixed(3);
    const maxQ = Math.max(...data.x).toFixed(3);
    const maxInt = Math.max(...data.y);
    const minInt = Math.min(...data.y);
    const dynamicRange = Math.log10(maxInt) - Math.log10(minInt);
    const points = data.x.length;

    return (
        <div className="h-16 border-t border-slate-200 bg-white grid grid-cols-4 divide-x divide-slate-100">
            <div className="px-6 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scan Range</span>
                <span className="text-sm font-mono font-bold text-slate-900">{minQ} - {maxQ} Å⁻¹</span>
            </div>
            <div className="px-6 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dynamic Range</span>
                <span className="text-sm font-mono font-bold text-blue-700">~ {dynamicRange.toFixed(1)} Orders</span>
            </div>
            <div className="px-6 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data Points</span>
                <span className="text-sm font-mono font-bold text-slate-900">{points.toLocaleString()} pts</span>
            </div>
             <div className="px-6 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Est. Noise Floor</span>
                <span className="text-sm font-mono font-bold text-slate-900">~ {minInt.toFixed(1)} cps</span>
            </div>
        </div>
    );
}

// --- Main Component ---
export function SetupXRR() {
  const { 
    layers, addLayer, reorderLayers, updateLayer,
    wavelength, setWavelength,
    measuredData, setMeasuredData, setDataConfig, xAxisUnit
  } = useProjectStore();

  // Sensors
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  
  // Local UI State
  const [yAxisType, setYAxisType] = useState<'linear' | 'log'>('log');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState("");

  // --- Handlers ---
  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
          setFileContent(ev.target?.result as string);
          setIsModalOpen(true);
      };
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

  const substrate = layers[layers.length - 1];
  const draggableLayers = layers.slice(0, -1);

  // Initial Mock Data
  useEffect(() => {
    if (!measuredData) {
        const q = Array.from({length: 200}, (_, i) => 0.0 + i * 0.004);
        const i = q.map(val => Math.pow(val + 0.02, -4) * 1e8 * (Math.cos(val * 50) * 0.2 + 0.8) + 5);
        setMeasuredData({ x: q, y: i, originalX: q });
    }
  }, []);

  return (
    <div className="grid grid-cols-12 h-full bg-slate-100">
      
      <DataImportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        fileContent={fileContent}
        onConfirm={handleImportConfirm}
      />

      {/* --- LEFT PANEL: INSTRUMENT & STACK (30%) --- */}
      <div className="col-span-12 lg:col-span-4 flex flex-col border-r border-slate-300 bg-white h-full overflow-hidden">
        
        {/* Panel Header */}
        <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50 shrink-0">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500"/> Configuration
            </span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">λ = {wavelength}Å</span>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            
            {/* 1. Instrument Section */}
            <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Instrument & Data</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileRead} className="hidden" accept=".dat,.xy,.csv,.txt"/>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-md text-slate-600 font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                            <Upload className="h-4 w-4"/> Import Data
                        </button>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Wavelength (Å)</label>
                        <input type="number" value={wavelength} onChange={(e) => setWavelength(Number(e.target.value))} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"/>
                    </div>
                    <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500">Beam Width (mm)</label>
                         <input type="number" defaultValue={0.2} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"/>
                    </div>
                </div>
            </section>

            {/* 2. Layer Stack Builder */}
            <section>
                <div className="flex items-center justify-between mb-3">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Layer Structure</h4>
                     <button 
                        onClick={addLayer} 
                        className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded hover:bg-blue-100 hover:border-blue-200 flex items-center gap-1 transition-all"
                     >
                        <Plus className="h-3 w-3"/> ADD LAYER
                     </button>
                </div>
                
                <div className="relative">
                     {/* Environment Line */}
                     <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                        <span className="text-xs text-slate-500 font-medium">Ambient (Air/Vacuum)</span>
                        <div className="flex-1 border-t border-dashed border-slate-300"></div>
                     </div>

                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={draggableLayers.map(l => l.id)} strategy={verticalListSortingStrategy}>
                            {draggableLayers.map((layer, idx) => (
                                <PhysicalLayerRow key={layer.id} layer={layer} index={idx} color="#3b82f6" />
                            ))}
                        </SortableContext>
                     </DndContext>

                     {/* Substrate (Fixed) */}
                     <div className="relative pl-4 mt-1">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-sm bg-slate-400"></div>
                        <div className="bg-slate-100 border border-slate-300 border-t-0 rounded-br-md p-3 opacity-80">
                             <div className="flex justify-between mb-2">
                                 <span className="font-bold text-sm text-slate-700">{substrate.material}</span>
                                 <span className="text-[10px] text-slate-500 font-mono bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300">Substrate (∞)</span>
                             </div>
                             <div className="grid grid-cols-3 gap-2">
                                 <div className="col-span-1"></div> {/* Placeholder */}
                                 <div className="flex flex-col">
                                     <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Density</label>
                                     <input type="number" value={substrate.density} onChange={(e)=>updateLayer(substrate.id,'density', Number(e.target.value))} className="w-full bg-transparent border-b border-slate-300 text-right text-sm font-mono text-slate-600 focus:border-blue-500 outline-none" />
                                 </div>
                                 <div className="flex flex-col">
                                     <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Rough (Å)</label>
                                     <input type="number" value={substrate.roughness} onChange={(e)=>updateLayer(substrate.id,'roughness', Number(e.target.value))} className="w-full bg-transparent border-b border-slate-300 text-right text-sm font-mono text-slate-600 focus:border-blue-500 outline-none" />
                                 </div>
                             </div>
                        </div>
                     </div>
                </div>
            </section>

        </div>
      </div>

      {/* --- RIGHT PANEL: GRAPH & ANALYTICS (70%) --- */}
      <div className="col-span-12 lg:col-span-8 h-full flex flex-col bg-white">
         
         {/* Graph Toolbar */}
         <div className="h-12 border-b border-slate-200 flex items-center justify-between px-4 bg-white z-10 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-slate-800">Reflectivity Scan</h2>
                <div className="h-4 w-[1px] bg-slate-300"></div>
                <div className="flex bg-slate-100 rounded p-0.5">
                    <button onClick={() => setYAxisType('linear')} className={`px-3 py-0.5 text-[10px] font-bold rounded-sm transition-all ${yAxisType==='linear'?'bg-white shadow text-blue-700':'text-slate-500'}`}>LIN</button>
                    <button onClick={() => setYAxisType('log')} className={`px-3 py-0.5 text-[10px] font-bold rounded-sm transition-all ${yAxisType==='log'?'bg-white shadow text-blue-700':'text-slate-500'}`}>LOG</button>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"><RefreshCw className="h-3.5 w-3.5"/> Normalize</button>
                <button className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"><AlignJustify className="h-3.5 w-3.5"/> Legend</button>
            </div>
         </div>

         {/* Graph Area (Maximizing Real Estate) */}
         <div className="flex-1 relative bg-white min-h-0">
            {measuredData ? (
                <ScientificChart 
                    data={[{ x: measuredData.x, y: measuredData.y, name: 'Experimental', color: '#3182f6', mode: 'markers' }]}
                    yScale={yAxisType}
                    xLabel="Momentum Transfer Q"
                    xUnit={xAxisUnit === 'q_a' ? 'Å⁻¹' : 'Å⁻¹ [Converted]'} 
                    yLabel="Intensity"
                    yUnit="counts"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 flex-col">
                    <Info className="h-10 w-10 mb-2 opacity-20"/>
                    <span className="font-mono text-sm">No Data Loaded</span>
                </div>
            )}
         </div>

         {/* Bottom Status Bar */}
         <DataQualityBar data={measuredData} />
      </div>

    </div>
  );
}