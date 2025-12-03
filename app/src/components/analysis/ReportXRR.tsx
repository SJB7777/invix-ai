"use client";

import React, { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Center, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useProjectStore, MaterialLayer } from "@/lib/stores/useProjectStore";
import { BentoCard } from "@/components/ui/BentoCard";
import { Copy, Download, Printer, Box, FileSpreadsheet, BarChart2, Sigma } from "lucide-react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// --- 1. Helper: Color Generator ---
function getLayerColor(str: string, isSubstrate = false) {
    if (isSubstrate) return '#64748b';
    const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// --- 2. 3D Layer Mesh ---
function LayerMesh({ layer, position, size, color, isSubstrate }: any) {
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={size} />
                <meshStandardMaterial 
                    color={color} 
                    roughness={0.4} 
                    metalness={0.1}
                    transparent={!isSubstrate}
                    opacity={isSubstrate ? 1 : 0.9}
                />
            </mesh>
            <Text position={[0, 0, size[2] / 2 + 0.05]} fontSize={0.25} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
                {layer.material}
            </Text>
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(size[0], size[1], size[2])]} />
                <lineBasicMaterial color="white" opacity={0.3} transparent />
            </lineSegments>
        </group>
    );
}

// --- 3. Scene Assembler ---
function ModelScene({ layers }: { layers: MaterialLayer[] }) {
    const renderLayers = useMemo(() => [...layers].reverse(), [layers]);
    let currentY = 0;
    
    return (
        <Center top>
            <group>
                {renderLayers.map((layer, idx) => {
                    const isSubstrate = idx === 0;
                    const visualThickness = isSubstrate ? 1.0 : Math.max(layer.thickness * 0.02, 0.2);
                    const posY = currentY + visualThickness / 2;
                    currentY += visualThickness;
                    
                    return (
                        <LayerMesh 
                            key={layer.id} layer={layer} 
                            position={[0, posY, 0]} size={[3, visualThickness, 3]} 
                            color={getLayerColor(layer.material, isSubstrate)} 
                            isSubstrate={isSubstrate}
                        />
                    );
                })}
            </group>
        </Center>
    );
}

// --- Helper Components ---
function CopyButton({ text }: { text: string }) {
    const handleCopy = () => { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); };
    return (
        <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all" title="Copy to Clipboard">
            <Copy className="w-4 h-4" />
        </button>
    );
}

// --- 4. Main Component ---
export function ReportXRR() {
    const { fittedLayers, metrics, measuredData, fitData, residualData } = useProjectStore();

    // CSV Download Handler
    const handleDownloadCSV = () => {
        if (!measuredData || !fitData || !residualData) return;
        
        // Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Q (A^-1), Measured Intensity, Calculated Intensity, Residual\n";

        // Rows
        measuredData.x.forEach((x, i) => {
            const meas = measuredData.y[i]?.toExponential(5) || "0";
            const calc = fitData.y[i]?.toExponential(5) || "0";
            const resid = residualData.y[i]?.toExponential(5) || "0";
            csvContent += `${x},${meas},${calc},${resid}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "xrr_fitting_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Text & Table Generators
    const methodologyText = React.useMemo(() => {
        if (!fittedLayers) return "";
        return `The X-ray reflectivity (XRR) measurements were analyzed using a genetic algorithm coupled with Parratt's recursive formalism. The structural model consists of a ${fittedLayers[fittedLayers.length-1].material} substrate with ${fittedLayers.length - 1} overlayers. Interface roughness was modeled using a gradient approximation to simulate interdiffusion.`;
    }, [fittedLayers]);

    const resultsText = React.useMemo(() => {
        if (!fittedLayers || !metrics) return "";
        const topLayer = fittedLayers[0];
        return `The best-fit model yielded a Chi-square value of ${metrics.chi2.toExponential(2)} and an FOM of ${metrics.fom.toFixed(2)}%. The topmost ${topLayer.material} layer thickness was determined to be ${topLayer.thickness.toFixed(2)} Å.`;
    }, [fittedLayers, metrics]);

    const latexTable = React.useMemo(() => {
        if (!fittedLayers) return "";
        let latex = `\\begin{table}[h]\n\\centering\n\\begin{tabular}{l c c c}\n\\hline\nMaterial & Thickness (\\AA) & Density (g/cm$^3$) & Roughness (\\AA) \\\\\n\\hline\n`;
        fittedLayers.forEach((l, i) => {
            const th = i === fittedLayers.length - 1 ? "\\infty" : l.thickness.toFixed(2);
            latex += `${l.material} & ${th} & ${l.density.toFixed(2)} & ${l.roughness.toFixed(2)} \\\\\n`;
        });
        latex += `\\hline\n\\end{tabular}\n`;
        return latex;
    }, [fittedLayers]);

    // Plot Data Preparation
    const plotData = useMemo(() => {
        if (!measuredData || !fitData || !residualData) return [];
        return [
            // 1. Measured Data (Points)
            {
                x: measuredData.x, y: measuredData.y,
                type: 'scatter', mode: 'markers', name: 'Measured',
                marker: { color: 'black', symbol: 'circle-open', size: 6 },
                xaxis: 'x', yaxis: 'y'
            },
            // 2. Fitted Data (Line)
            {
                x: fitData.x, y: fitData.y,
                type: 'scatter', mode: 'lines', name: 'Calculated',
                line: { color: '#ef4444', width: 2 },
                xaxis: 'x', yaxis: 'y'
            },
            // 3. Residual (Bottom Panel)
            {
                x: residualData.x, y: residualData.y,
                type: 'scatter', mode: 'lines', name: 'Residual',
                line: { color: '#64748b', width: 1 },
                xaxis: 'x', yaxis: 'y2'
            }
        ];
    }, [measuredData, fitData, residualData]);

    if (!fittedLayers || !metrics || !measuredData) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <Box className="w-12 h-12 text-slate-200" />
                <p>No analysis results available.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-6 h-full pb-6 overflow-y-auto">
            
            {/* --- Left Column: Visuals --- */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                
                {/* 1. 3D Model */}
                <BentoCard 
                    title="Schematic 3D Structure" 
                    className="min-h-[400px]"
                    action={
                        <button onClick={() => { 
                            const canvas = document.querySelector('canvas'); 
                            if(canvas){ const a = document.createElement('a'); a.download='model.png'; a.href=canvas.toDataURL(); a.click(); }
                        }} className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Save Image
                        </button>
                    }
                >
                    <div className="w-full h-full bg-slate-50/50 rounded-xl overflow-hidden cursor-move relative">
                        <Canvas shadows camera={{ position: [5, 4, 5], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
                            <ambientLight intensity={0.6} />
                            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                            <Environment preset="city" />
                            <ModelScene layers={fittedLayers} />
                            <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enablePan={false} />
                        </Canvas>
                    </div>
                </BentoCard>

                {/* 2. Publication Graph (Main Fit + Residual) */}
                <BentoCard 
                    title={<div className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary"/> Fitting Result</div>}
                    className="min-h-[500px]"
                    action={
                        <div className="flex gap-2">
                            <button onClick={handleDownloadCSV} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors">
                                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV Data
                            </button>
                        </div>
                    }
                >
                    <div className="w-full h-full p-2 bg-white rounded-lg border border-slate-100">
                        <Plot
                            data={plotData as any}
                            layout={{
                                grid: { rows: 2, columns: 1, pattern: 'coupled', roworder: 'top to bottom' },
                                xaxis: { title: 'Q (Å⁻¹)', zeroline: false, showgrid: false, mirror: true, ticks: 'inside', showline: true, linecolor: 'black' },
                                yaxis: { 
                                    title: 'Reflectivity', type: 'log', domain: [0.3, 1], 
                                    zeroline: false, showgrid: false, mirror: true, ticks: 'inside', showline: true, linecolor: 'black',
                                    exponentformat: 'e'
                                },
                                yaxis2: { 
                                    title: 'Residual', domain: [0, 0.2], 
                                    zeroline: true, showgrid: false, mirror: true, ticks: 'inside', showline: true, linecolor: 'black' 
                                },
                                autosize: true,
                                margin: { l: 70, r: 20, t: 20, b: 50 },
                                showlegend: true,
                                legend: { x: 1, xanchor: 'right', y: 1 },
                                font: { family: 'Arial, sans-serif', size: 12, color: 'black' },
                                paper_bgcolor: 'white',
                                plot_bgcolor: 'white'
                            }}
                            config={{ 
                                toImageButtonOptions: { format: 'png', filename: 'fitting_result', height: 800, width: 800, scale: 2 }, // High-Res export
                                displayModeBar: true, 
                                modeBarButtons: [['toImage']] // Only show save image button for cleanliness
                            }}
                            style={{ width: '100%', height: '100%' }}
                            useResizeHandler
                        />
                    </div>
                </BentoCard>
            </div>

            {/* --- Right Column: Text & Stats --- */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                
                {/* Statistics Card (New) */}
                <BentoCard title={<div className="flex items-center gap-2"><Sigma className="w-4 h-4 text-primary"/> Statistical Error Analysis</div>}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Chi-Square (χ²)</div>
                            <div className="text-xl font-mono font-bold text-slate-900">{metrics.chi2.toExponential(2)}</div>
                            <div className="text-[10px] text-slate-400 mt-1">Goodness of fit</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Figure of Merit</div>
                            <div className="text-xl font-mono font-bold text-blue-600">{metrics.fom.toFixed(3)}%</div>
                            <div className="text-[10px] text-slate-400 mt-1">Log-difference metric</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Mean Abs Error</div>
                            <div className="text-lg font-mono text-slate-700">{metrics.mae.toFixed(4)}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-bold">Points</div>
                            <div className="text-lg font-mono text-slate-700">{measuredData.x.length}</div>
                        </div>
                    </div>
                </BentoCard>

                {/* Parameters Table */}
                <BentoCard title="Structural Parameters" className="flex-1" action={<CopyButton text={latexTable} />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-t-2 border-b border-slate-800 text-slate-900">
                                    <th className="py-2 px-2 font-bold">Material</th>
                                    <th className="py-2 px-2 font-bold text-right">d (Å)</th>
                                    <th className="py-2 px-2 font-bold text-right">ρ (g/cm³)</th>
                                    <th className="py-2 px-2 font-bold text-right">σ (Å)</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {fittedLayers.map((layer, idx) => (
                                    <tr key={layer.id} className="border-b border-slate-200 last:border-b-2 last:border-slate-800">
                                        <td className="py-2 px-2 font-semibold">{layer.material}</td>
                                        <td className="py-2 px-2 text-right font-mono">{idx === fittedLayers.length - 1 ? '∞' : layer.thickness.toFixed(2)}</td>
                                        <td className="py-2 px-2 text-right font-mono">{layer.density.toFixed(2)}</td>
                                        <td className="py-2 px-2 text-right font-mono">{layer.roughness.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </BentoCard>

                {/* Methodology Text */}
                <BentoCard title="Methodology" className="shrink-0" action={<CopyButton text={methodologyText} />}>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed font-serif text-justify">{methodologyText}</p>
                    </div>
                </BentoCard>

                {/* Results Text */}
                <BentoCard title="Results" className="shrink-0" action={<CopyButton text={resultsText} />}>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed font-serif text-justify">{resultsText}</p>
                    </div>
                </BentoCard>

                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-all">
                        <Download className="w-4 h-4" /> Export Report (PDF)
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>

            </div>
        </div>
    );
}