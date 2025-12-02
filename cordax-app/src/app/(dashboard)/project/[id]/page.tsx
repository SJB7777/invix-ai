"use client";

import React, { useState, useEffect } from "react";
import { useProjectStore } from "@/lib/stores/useProjectStore";
import { BentoCard } from "@/components/ui/BentoCard";
import { Layers, Activity, FileText, Play } from "lucide-react";

// 방금 만든 Setup 컴포넌트 import
import { SetupXRR } from "@/components/analysis/SetupXRR";

export default function ProjectWorkspace({ params }: { params: { id: string } }) {
  // Next.js 15+ 에서는 params를 unwrap 해야 할 수도 있지만, 
  // 현재 버전(14.x 추정)에서는 바로 사용하거나 React.use()를 씁니다.
  // 만약 params 관련 에러가 나면: const { id } = React.use(params as any); 로 바꾸세요.
  const { id } = params; 

  // ✅ 여기가 누락되었던 부분입니다 (탭 상태 관리)
  const [activeTab, setActiveTab] = useState<"setup" | "analysis" | "report">("setup");
  
  const { setProjectId, status, runSimulation } = useProjectStore();

  // 초기화 로직
  useEffect(() => {
    if (id) {
      setProjectId(id);
    }
  }, [id, setProjectId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 bg-background p-4 overflow-hidden">
      
      {/* --- 상단 헤더 (탭 메뉴) --- */}
      <header className="flex h-14 w-full items-center justify-between rounded-xl bg-surface px-6 shadow-sm border border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
           <h1 className="text-lg font-bold text-slate-800">
             CordaX <span className="text-slate-400 font-normal">/ Project {id}</span>
           </h1>
        </div>

        {/* 탭 스위처 */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1">
          {[
            { id: "setup", label: "Setup", icon: Layers },
            { id: "analysis", label: "Analysis", icon: Activity },
            { id: "report", label: "Report", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 시뮬레이션 실행 버튼 */}
        <button 
          onClick={runSimulation}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          {status === 'fitting' ? 'Calculating...' : 'Run Simulation'}
          <Play className="h-4 w-4 fill-current" />
        </button>
      </header>

      {/* --- 메인 콘텐츠 영역 --- */}
      <main className="flex-1 overflow-hidden min-h-0">
        
        {/* 1. SETUP 탭 */}
        {activeTab === "setup" && (
           <SetupXRR />
        )}

        {/* 2. ANALYSIS 탭 (임시) */}
        {activeTab === "analysis" && (
           <BentoCard title="Analysis Result" className="h-full flex items-center justify-center">
             <p className="text-slate-400">Analysis view is under construction.</p>
           </BentoCard>
        )}

        {/* 3. REPORT 탭 (임시) */}
        {activeTab === "report" && (
           <BentoCard title="Report Generation" className="h-full flex items-center justify-center">
             <p className="text-slate-400">Report generation is under construction.</p>
           </BentoCard>
        )}

      </main>
    </div>
  );
}