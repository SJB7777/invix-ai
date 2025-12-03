"use client";

import React, { useState, useEffect, use } from "react"; // ✅ 'use' 추가
import Link from "next/link";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import { BentoCard } from "@/components/ui/BentoCard";
import { Layers, Activity, FileText, Atom, ChevronRight } from "lucide-react";

import { SetupXRR } from "@/components/analysis/SetupXRR";
import { AnalysisXRR } from "@/components/analysis/AnalysisXRR";
import { ReportXRR } from "@/components/analysis/ReportXRR";

// ✅ params 타입을 Promise로 변경
export default function ProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
  // ✅ React.use()를 사용하여 params 언랩핑 (비동기 데이터 추출)
  const { id } = use(params);

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

        {/* 탭 네비게이션 */}
        <nav className="flex items-center p-1 bg-slate-100/50 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab("setup")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === "setup"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <Layers className="w-4 h-4" /> Setup
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === "analysis"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <Activity className="w-4 h-4" /> Analysis
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === "report"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <FileText className="w-4 h-4" /> Report
            </button>
        </nav>

        {/* 우측 도구 (설정 등) */}
        <div className="w-32 flex justify-end">
            {/* 필요 시 추가 버튼 배치 */}
        </div>
      </header>

      {/* --- 2. 메인 컨텐츠 영역 --- */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto h-full">
            {activeTab === "setup" && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <SetupXRR />
                </div>
            )}
            {activeTab === "analysis" && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
                    <AnalysisXRR />
                </div>
            )}
            {activeTab === "report" && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                    <ReportXRR />
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
