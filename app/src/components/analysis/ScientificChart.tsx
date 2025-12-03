"use client";

import React from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ScientificChartProps {
  data: { x: number[]; y: number[]; name?: string; color?: string; mode?: string }[];
  xLabel?: string;
  yLabel?: string;
  xUnit?: string;
  yUnit?: string;
  yScale?: "linear" | "log";
  showLegend?: boolean;
  hideXLabel?: boolean; // ✅ 추가: X축 라벨 숨김 옵션
}

export function ScientificChart({
  data,
  xLabel = "Q",
  yLabel = "Intensity",
  xUnit = "Å⁻¹",
  yUnit = "counts",
  yScale = "log",
  showLegend = true,
  hideXLabel = false, // ✅ 기본값 false
}: ScientificChartProps) {
  
  const axisTitleFont = { size: 13, family: "var(--font-inter)", color: "#475569" };
  const tickFont = { family: "var(--font-jetbrains-mono)", size: 11, color: "#64748b" };

  return (
    <div className="w-full h-full relative">
      <Plot
        data={data.map((d) => ({
          x: d.x,
          y: d.y,
          type: "scatter",
          mode: d.mode || "markers",
          name: d.name,
          hovertemplate: `<b>${xLabel}:</b> %{x:.4f} ${xUnit}<br><b>${yLabel}:</b> %{y:.3e} ${yUnit}<extra></extra>`, 
          marker: {
            color: d.color || "#3b82f6",
            size: 5,
            symbol: "circle", 
            line: { width: 0 }
          },
          line: {
            width: 2,
            color: d.color || "#3b82f6"
          }
        }))}
        layout={{
          autosize: true,
          font: { family: "var(--font-inter)", size: 12 },
          // ✅ 여백 조정: X축이 없으면 아래 여백을 줄임
          margin: { l: 60, r: 20, t: 20, b: hideXLabel ? 10 : 50 }, 
          showlegend: showLegend,
          legend: {
            x: 1, xanchor: "right", y: 1,
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "transparent",
            font: { size: 11, color: "#64748b" }
          },
          xaxis: {
            // ✅ hideXLabel이면 타이틀과 틱 라벨을 숨김
            title: hideXLabel ? undefined : { text: `${xLabel} (${xUnit})`, font: axisTitleFont },
            showticklabels: !hideXLabel, 
            type: "linear",
            gridcolor: "#f1f5f9",
            zerolinecolor: "#e2e8f0",
            tickfont: tickFont,
            automargin: true,
          },
          yaxis: {
            title: { text: `${yLabel} (${yUnit})`, font: axisTitleFont },
            type: yScale,
            gridcolor: "#f1f5f9",
            zerolinecolor: "#e2e8f0",
            tickfont: tickFont,
            tickformat: ".1e",
            automargin: true,
          },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          hovermode: "closest",
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["lasso2d", "select2d"],
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}