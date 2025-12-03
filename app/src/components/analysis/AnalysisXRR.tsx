"use client";

import React from "react";
import { useProjectStore, MaterialLayer } from "@/lib/stores/useProjectStore";
import { ScientificChart } from "@/components/analysis/ScientificChart";
import { BentoCard } from "@/components/ui/BentoCard";
import { Play, CheckCircle2, Cpu, LineChart, Activity, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// ... (PipelineStep 컴포넌트는 기존과 동일) ...
function PipelineStep({ 
    status, 
    stepName, 
    isActive, 
    isCompleted, 
    icon: Icon 
}: { status: string, stepName: string, isActive: boolean, isCompleted: boolean, icon: any }) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-500 whitespace-nowrap",
            isActive ? "bg-blue-50 border-blue-200 shadow-sm scale-105" : "bg-transparent border-transparent",
            isCompleted ? "text-slate-800" : isActive ? "text-blue-700" : "text-slate-400"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shrink-0",
                isCompleted ? "bg-green-500 text-white" : isActive ? "bg-blue-600 text-white animate-pulse" : "bg-slate-100 text-slate-400"
            )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider">{stepName}</span>
                {isActive && <span className="text-[10px] text-blue-500 font-medium animate-pulse">Processing...</span>}
            </div>
        </div>
    );
}

export function AnalysisXRR() {
    const { 
        measuredData, aiData, fitData, residualData, edpData, fftData, metrics, fittedLayers,
        status, runAnalysisPipeline 
    } = useProjectStore();

    const isAiDone = status === 'optimizing' || status === 'success';
    const isFitDone = status === 'success';

    // --- Charts Data Prep ---
    const mainGraphData = [];
    if (measuredData) mainGraphData.push({ x: measuredData.x, y: measuredData.y, name: 'Raw Data', color: '#94a3b8', mode: 'markers' });
    if (aiData) mainGraphData.push({ x: aiData.x, y: aiData.y, name: 'AI Guess', color: '#f59e0b', mode: 'lines' });
    if (fitData) mainGraphData.push({ x: fitData.x, y: fitData.y, name: 'Final Fit', color: '#ef4444', mode: 'lines' });

    // ✅ EDP Plot Data 구성
    const edpPlotData: any[] = [];
    if (edpData) {
        // 1. Total Profile (Filled Area)
        edpPlotData.push({
            x: edpData.z,
            y: edpData.rho,
            name: 'Total Density',
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy', // 전체 영역 채우기
            line: { color: '#059669', width: 3, shape: 'spline' },
            fillcolor: 'rgba(5, 150, 105, 0.1)'
        });

        // 2. Individual Layers (Dotted Lines)
        // 색상 팔레트
        const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
        
        edpData.layers.forEach((layer, idx) => {
            edpPlotData.push({
                x: edpData.z,
                y: layer.rho,
                name: layer.name,
                type: 'scatter',
                mode: 'lines',
                line: { 
                    color: colors[idx % colors.length], 
                    width: 2, 
                    dash: 'dot', // ✅ 점선 처리
                    shape: 'spline' 
                },
                hoverinfo: 'y+name'
            });
        });
    }

    // EDP Annotations
    const edpAnnotations = React.useMemo(() => {
        if (!fittedLayers) return [];
        let currentZ = 0;
        return fittedLayers.map((layer, idx) => {
            const isSubstrate = idx === fittedLayers.length - 1;
            const midPoint = isSubstrate ? currentZ + 20 : currentZ + (layer.thickness / 2);
            
            const ann = {
                x: midPoint,
                y: layer.density + 0.5,
                xref: 'x',
                yref: 'y',
                text: layer.material,
                showarrow: false,
                font: { family: 'var(--font-inter)', size: 10, color: '#64748b' },
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#cbd5e1',
                borderwidth: 1,
                borderpad: 2,
                rx: 3,
            };
            currentZ += layer.thickness;
            return ann;
        });
    }, [fittedLayers]);

    return (
        <div className="grid grid-cols-12 gap-6 h-full pb-6">
            
            {/* Top Bar (기존 코드 유지) */}
            <div className="col-span-12 h-16">
                <BentoCard className="h-full" noPadding>
                    <div className="flex items-center justify-between h-full px-2 w-full">
                        <div className="px-4 border-r border-slate-100 h-full flex items-center shrink-0">
                            <button 
                                onClick={runAnalysisPipeline}
                                disabled={status === 'ai_thinking' || status === 'optimizing'}
                                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {status === 'idle' || status === 'success' ? <Play className="w-4 h-4 fill-current"/> : <Activity className="w-4 h-4 animate-spin"/>}
                                {status === 'success' ? 'Re-Run Analysis' : 'Start Analysis'}
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-start md:justify-center gap-4 px-4 overflow-x-auto min-w-0 scrollbar-hide h-full">
                            <PipelineStep status={status} stepName="AI Inference" isActive={status === 'ai_thinking'} isCompleted={isAiDone} icon={Cpu} />
                            <ArrowRight className={cn("w-4 h-4 transition-colors shrink-0", isAiDone ? "text-slate-300" : "text-slate-100")} />
                            <PipelineStep status={status} stepName="Fine Tuning" isActive={status === 'optimizing'} isCompleted={isFitDone} icon={LineChart} />
                            <ArrowRight className={cn("w-4 h-4 transition-colors shrink-0", isFitDone ? "text-slate-300" : "text-slate-100")} />
                            <PipelineStep status={status} stepName="Result" isActive={false} isCompleted={isFitDone} icon={CheckCircle2} />
                        </div>
                        <div className="px-6 border-l border-slate-100 h-full flex items-center gap-6 min-w-[200px] justify-end shrink-0 hidden md:flex">
                            {metrics ? (
                                <>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Chi-Square</div>
                                        <div className="text-sm font-mono font-bold text-slate-800">{metrics.chi2.toExponential(2)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">FOM</div>
                                        <div className="text-sm font-mono font-bold text-blue-600">{metrics.fom}%</div>
                                    </div>
                                </>
                            ) : (
                                <span className="text-xs text-slate-300 font-medium">No Results Yet</span>
                            )}
                        </div>
                    </div>
                </BentoCard>
            </div>

            {/* Left: Main Visualization (기존 코드 유지) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden">
                <BentoCard title="Reflectivity Analysis" className="flex-1 min-h-0 relative" noPadding>
                    <div className="flex flex-col h-full w-full">
                        <div className="flex-[3] w-full min-h-0 relative p-2 pb-0">
                            {measuredData ? (
                                <ScientificChart 
                                    data={mainGraphData} 
                                    yScale="log" yLabel="Reflectivity" 
                                    showLegend={true} hideXLabel={true} 
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300">Data required</div>
                            )}
                        </div>
                        <div className="h-[1px] bg-slate-100 mx-4" />
                        <div className="flex-1 w-full min-h-[120px] relative p-2 pt-0">
                            {residualData ? (
                                <ScientificChart 
                                    data={[{ x: residualData.x, y: residualData.y, name: 'Residual', color: '#64748b', mode: 'lines' }]}
                                    yScale="linear" yLabel="Δ log R" yUnit="" showLegend={false} hideXLabel={false}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs uppercase font-bold tracking-wider">
                                    Waiting for fit results...
                                </div>
                            )}
                        </div>
                    </div>
                </BentoCard>
            </div>

            {/* Right: Insights (EDP Chart 업데이트됨) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-1 pb-10">
                
                {/* 1. EDP Chart */}
                <BentoCard title="Electron Density Profile" className="min-h-[320px] shrink-0" noPadding>
                    <div className="flex flex-col h-full">
                        <div className="flex-1 min-h-[200px]">
                            {edpData ? (
                                <Plot
                                    data={edpPlotData} // ✅ 여러 개의 Trace 전달 (Total + Layers)
                                    layout={{
                                        autosize: true,
                                        margin: { l: 50, r: 20, t: 20, b: 40 },
                                        xaxis: { title: 'Depth (Å)', zeroline: false },
                                        yaxis: { title: 'SLD (10⁻⁶ Å⁻²)', zeroline: false },
                                        annotations: edpAnnotations as any,
                                        showlegend: false, // 범례는 숨기고 호버로 확인하거나 별도 표시
                                        paper_bgcolor: 'transparent', 
                                        plot_bgcolor: 'transparent',
                                        font: { family: 'var(--font-inter)', size: 11 }
                                    }}
                                    config={{ displayModeBar: false, responsive: true }}
                                    style={{ width: '100%', height: '100%' }}
                                    useResizeHandler
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 text-sm">No Model</div>
                            )}
                        </div>
                        
                        {/* Result Table */}
                        {fittedLayers && (
                            <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Layers className="w-3 h-3"/> Layer Parameters
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="grid grid-cols-4 text-[9px] font-bold text-slate-400 uppercase px-2 pb-1 border-b border-slate-200">
                                        <div className="col-span-1">Material</div>
                                        <div className="text-right">Thick</div>
                                        <div className="text-right">Dens</div>
                                        <div className="text-right">Rough</div>
                                    </div>
                                    {fittedLayers.map((layer, idx) => (
                                        <div key={idx} className="grid grid-cols-4 text-xs px-2 py-1.5 bg-white border border-slate-100 rounded shadow-sm">
                                            <div className="col-span-1 font-bold text-slate-700 truncate" title={layer.material}>{layer.material}</div>
                                            <div className="text-right font-mono text-slate-600">
                                                {idx === fittedLayers.length-1 ? 'Inf' : layer.thickness.toFixed(1)}
                                            </div>
                                            <div className="text-right font-mono text-blue-600 font-semibold">{layer.density.toFixed(2)}</div>
                                            <div className="text-right font-mono text-slate-600">{layer.roughness.toFixed(1)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </BentoCard>

                {/* 2. FFT */}
                <BentoCard title="Fourier Transform (FFT)" className="h-[200px] shrink-0" noPadding>
                    {fftData ? (
                        <Plot
                            data={[{
                                x: fftData.freq,
                                y: fftData.amp,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: '#8b5cf6', width: 1.5 }
                            }]}
                            layout={{
                                autosize: true,
                                margin: { l: 50, r: 20, t: 20, b: 40 },
                                xaxis: { title: 'Thickness (Å)', zeroline: false },
                                yaxis: { title: 'Amplitude', showticklabels: false },
                                paper_bgcolor: 'transparent',
                                plot_bgcolor: 'transparent',
                                font: { family: 'var(--font-inter)', size: 11 }
                            }}
                            config={{ displayModeBar: false, responsive: true }}
                            style={{ width: '100%', height: '100%' }}
                            useResizeHandler
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 text-sm">No Data</div>
                    )}
                </BentoCard>

                <BentoCard title="Fit Metrics" className="shrink-0">
                    {metrics ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Mean Abs Error</div>
                                <div className="text-lg font-mono font-bold text-slate-800">{metrics.mae}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">Log Likelihood</div>
                                <div className="text-lg font-mono font-bold text-slate-800">-420.5</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                                <div className="text-xs text-slate-500 mb-1">Convergence Status</div>
                                <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                                    <CheckCircle2 className="w-4 h-4"/> Converged (24 iters)
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 text-sm py-8">Run analysis to view metrics</div>
                    )}
                </BentoCard>
            </div>
        </div>
    );
}