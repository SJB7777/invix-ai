"use client";

import React, { useState, useEffect } from "react";
import { FileText, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { XAxisUnit } from "@/lib/stores/useProjectStore";

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: string;
  onConfirm: (config: { unit: XAxisUnit; xCol: number; yCol: number }) => void;
}

export function DataImportModal({ isOpen, onClose, fileContent, onConfirm }: DataImportModalProps) {
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [rawNumberRows, setRawNumberRows] = useState<number[][]>([]);
  
  const [unit, setUnit] = useState<XAxisUnit>('2theta');
  const [xCol, setXCol] = useState(0);
  const [yCol, setYCol] = useState(1);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Parse and Guess
  useEffect(() => {
    if (!fileContent) return;

    const lines = fileContent.split('\n').filter(line => line.trim().length > 0 && !line.trim().startsWith('#'));
    const parsed = lines.slice(0, 10).map(line => line.trim().split(/[\s,;]+/).filter(Boolean));
    const numbers = lines.map(line => line.trim().split(/[\s,;]+/).map(Number)).filter(row => row.length >= 2 && !row.some(isNaN));

    setPreviewRows(parsed);
    setRawNumberRows(numbers);

    // --- Smart Guessing Logic ---
    if (numbers.length > 0) {
        const xValues = numbers.map(r => r[0]); // Assume Col 0 is X
        const maxX = Math.max(...xValues);

        if (maxX < 2.5) {
            setUnit('q_a');
            setSuggestion("Detected q-vector (Max X < 2.5)");
        } else {
            setUnit('2theta');
            setSuggestion("Detected 2-Theta (Max X > 5.0)");
        }
    }
  }, [fileContent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-100 px-6 py-4 border-b border-slate-300 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> 
            Import Raw Data
          </h3>
          <div className="flex items-center gap-2">
             {suggestion && (
                 <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded border border-green-200 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3"/> {suggestion}
                 </span>
             )}
             <button onClick={onClose} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto bg-white">
            
            {/* 1. Preview Table */}
            <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data Preview (First 10 Rows)</h4>
                <div className="border border-slate-300 rounded-sm overflow-hidden">
                    <table className="w-full text-sm font-mono text-right">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                            <tr>
                                {previewRows[0]?.map((_, i) => (
                                    <th key={i} className="px-4 py-2 border-r border-slate-300 last:border-r-0">
                                        Col {i}
                                        <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                                            {i === xCol ? "(X-Axis)" : i === yCol ? "(Y-Axis)" : "-"}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-slate-900">
                            {previewRows.map((row, ri) => (
                                <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-blue-50">
                                    {row.map((cell, ci) => (
                                        <td key={ci} className={`px-4 py-1 border-r border-slate-200 last:border-r-0 ${ci === xCol ? 'bg-blue-50/50 font-bold text-blue-900' : ''} ${ci === yCol ? 'bg-orange-50/50 font-bold text-orange-900' : ''}`}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. Configuration Form */}
            <div className="grid grid-cols-2 gap-8">
                
                {/* Column Mapping */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">Column Mapping</h4>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">X-Axis Column</label>
                        <select 
                            value={xCol} onChange={(e) => setXCol(Number(e.target.value))}
                            className="border border-slate-300 rounded px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {previewRows[0]?.map((_, i) => <option key={i} value={i}>Column {i}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">Y-Axis Column</label>
                        <select 
                            value={yCol} onChange={(e) => setYCol(Number(e.target.value))}
                            className="border border-slate-300 rounded px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {previewRows[0]?.map((_, i) => <option key={i} value={i}>Column {i}</option>)}
                        </select>
                    </div>
                </div>

                {/* Unit Selection */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">Physical Units</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2 border border-slate-200 rounded cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="radio" name="unit" checked={unit === '2theta'} onChange={() => setUnit('2theta')} className="text-blue-600 focus:ring-blue-500" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">2-Theta (degrees)</span>
                                <span className="text-xs text-slate-500">Standard diffractometer output</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 border border-slate-200 rounded cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="radio" name="unit" checked={unit === 'q_a'} onChange={() => setUnit('q_a')} className="text-blue-600 focus:ring-blue-500" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">Momentum Transfer q (Å⁻¹)</span>
                                <span className="text-xs text-slate-500">Inverse space units</span>
                            </div>
                        </label>
                    </div>
                </div>

            </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-300 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded hover:bg-white transition-all">Cancel</button>
            <button 
                onClick={() => onConfirm({ unit, xCol, yCol })}
                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
                Confirm Import <ArrowRight className="h-4 w-4" />
            </button>
        </div>
      </div>
    </div>
  );
}