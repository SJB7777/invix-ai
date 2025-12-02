"use client";

import React from "react";
import Link from "next/link";
import { 
  Activity, 
  Layers, 
  Download, 
  Database, 
  Zap,
  Atom // XRD 아이콘용
} from "lucide-react";

export default function LandingPage() {
  
  // 샘플 데이터 다운로드 (XRR, XRD 두 파일을 동시에 다운로드)
  const handleDownloadSample = () => {
    // 1. XRR 데이터 생성
    const xrrHeader = "# CordaX Sample Data\n# Type: XRR\n# Columns: Q(A^-1)  Intensity(a.u.)\n";
    let xrrData = xrrHeader;
    for (let i = 0; i < 150; i++) {
      const q = 0.0 + i * 0.005;
      const fringe = Math.cos(q * 100) * 0.5 + 0.5; // 간섭무늬 추가
      const intensity = (Math.pow(q + 0.02, -4) * 1000 * fringe) + Math.random() * 5; 
      xrrData += `${q.toFixed(4)}  ${intensity.toFixed(4)}\n`;
    }
    downloadFile(xrrData, "sample_xrr.dat");

    // 2. XRD 데이터 생성 (약간의 시간차를 두고 실행)
    setTimeout(() => {
        const xrdHeader = "# CordaX Sample Data\n# Type: XRD\n# Columns: 2Theta(deg)  Intensity(counts)\n";
        let xrdData = xrdHeader;
        for (let i = 0; i < 300; i++) {
          const th = 20 + i * 0.1; 
          // 가우시안 피크 생성
          const peak = 3000 * Math.exp(-Math.pow(th - 40, 2) / 0.5); 
          const bg = 50 + Math.random() * 10;
          const intensity = peak + bg;
          xrdData += `${th.toFixed(2)}  ${intensity.toFixed(1)}\n`;
        }
        downloadFile(xrdData, "sample_xrd.xy");
    }, 500);
  };

  // 파일 다운로드 헬퍼
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* --- 네비게이션 바 --- */}
      <nav className="flex h-16 items-center justify-between border-b border-border bg-surface px-8 shadow-sm">
        <div className="text-xl font-bold tracking-tighter text-slate-900">
          InviX<span className="text-primary">.ai</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-primary">Documentation</a>
          <a href="#" className="hover:text-primary">Pricing</a>
          <a href="#" className="hover:text-primary">Login</a>
        </div>
      </nav>

      {/* --- 히어로 섹션 --- */}
      <section className="flex flex-col items-center justify-center py-24 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
        <div className="mb-6 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-primary border border-blue-100">
          v1.0 Public Beta
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
          차세대 <span className="text-primary">X-ray Metrology</span> 플랫폼
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
          AI 기반의 자동 피팅과 클라우드 컴퓨팅을 통해<br />
          복잡한 박막 및 결정 구조 분석을 웹에서 즉시 수행하세요.
        </p>

        {/* --- 버튼 3개 배치 영역 --- */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl justify-center px-4">
          
          {/* 1. XRR 분석 버튼 */}
          <Link 
            href="/project/new?mode=xrr" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
          >
            <Layers className="h-5 w-5" />
            <span>XRR 분석 시작</span>
          </Link>

          {/* 2. XRD 분석 버튼 */}
          <Link 
            href="/project/new?mode=xrd" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
          >
            <Atom className="h-5 w-5" />
            <span>XRD 분석 시작</span>
          </Link>
          
          {/* 3. 샘플 다운로드 버튼 */}
          <button 
            onClick={handleDownloadSample}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <Download className="h-5 w-5" />
            <span>Sample Data</span>
          </button>
        </div>
      </section>

      {/* --- 기능 소개 (Bento Grid 스타일 유지) --- */}
      <section className="flex-1 px-4 py-20 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Platform Features</h2>
          <p className="text-slate-500 mt-2">연구 효율을 극대화하는 핵심 기능들</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 카드 1 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Activity className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI 자동 피팅</h3>
            <p className="text-slate-500 leading-relaxed">
              Parratt 알고리즘과 유전 알고리즘을 결합하여, 초기값 설정 없이도 
              두께와 거칠기를 자동으로 최적화합니다.
            </p>
          </div>

          {/* 카드 2 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <Zap className="h-6 w-6 text-orange-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">초고속 시각화</h3>
            <p className="text-slate-500 leading-relaxed">
              수십만 개의 데이터 포인트도 끊김 없이 렌더링하며, 
              로그 스케일 및 오차 범위(Residuals)를 실시간으로 확인합니다.
            </p>
          </div>

          {/* 카드 3 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
              <Database className="h-6 w-6 text-green-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">프로젝트 관리</h3>
            <p className="text-slate-500 leading-relaxed">
              분석 중인 프로젝트는 자동으로 클라우드에 저장됩니다. 
              언제 어디서든 이전 분석 결과를 불러와 이어서 작업하세요.
            </p>
          </div>
        </div>
      </section>

      {/* --- 푸터 --- */}
      <footer className="py-10 text-center text-slate-400 text-sm bg-slate-50 border-t border-slate-200">
        <p>© 2025 InviX Metrology. All rights reserved.</p>
      </footer>
    </div>
  );
}