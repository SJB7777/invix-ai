"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import { BentoCard } from "@/components/ui/BentoCard";
// ✅ 아이콘 추가 (Atom, ChevronRight)
import { Layers, Activity, FileText, Atom, ChevronRight } from "lucide-react";

import { SetupXRR } from "@/components/analysis/SetupXRR";
import { AnalysisXRR } from "@/components/analysis/AnalysisXRR"; 
import { ReportXRR } from "@/components/analysis/ReportXRR";

export default function ProjectWorkspace({ params }: { params: { id: string } }) {
  const { id } = params;
  const [activeTab, setActiveTab] = useState<"setup" | "analysis" | "report">("setup");
  
  const { setProjectId } = useProjectStore();

  useEffect(() => {
    if (id) {
      setProjectId(id);
    }
  }, [id, setProjectId]);

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden">
      
      {/* --- 1. 배너형 헤더 (Banner Header) --- */}
      <header className="flex h-16 w-full items-center justify-between px-6 bg-white border-b border-slate-200 shadow-sm shrink-0 z-20 relative">
        
        {/* 로고 및 프로젝트 정보 (Breadcrumb Style) */}
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
                    <Atom className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-lg font-bold tracking-tight text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                        InviX<span className="text-blue-600">.ai</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none mt-1">X-ray Metrology</span>
                </div>
            </Link>

            <ChevronRight className="w-4 h-4 text-slate-300" />

            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Project {id}</span>
            </div>
        </div>

        {/* 탭 네비게이션 (중앙 정렬 느낌으로 배치) */}
        <nav className="flex items-center p-1 bg-slate-100/50 rounded-xl border border-slate-200/60">
           {[
            { id: "setup", label: "Setup", icon: Layers },
            { id: "analysis", label: "Analysis", icon: Activity },
            { id: "report", label: "Report", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5 scale-100"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95 opacity-80 hover:opacity-100"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 우측 여백 확보 (밸런스 맞추기용, 필요 시 사용자 프로필 등 추가) */}
        <div className="w-[180px] flex justify-end">
            {/* "Run Simulation" 버튼 삭제됨 */}
        </div>
      </header>

      {/* --- 메인 콘텐츠 영역 --- */}
      <main className="flex-1 overflow-hidden min-h-0 p-4">
        {activeTab === "setup" && <SetupXRR />}
        {activeTab === "analysis" && <AnalysisXRR />}
        {activeTab === "report" && <ReportXRR />}
      </main>
    </div>
  );
}