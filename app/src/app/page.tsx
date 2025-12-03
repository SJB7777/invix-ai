"use client";

import React from "react";
import Link from "next/link";
import { 
  Activity, Layers, Download, Zap, Atom, 
  ChevronRight, BarChart2, Cpu, Globe, ArrowRight, CheckCircle2, Database,
  Server, Terminal, Mail, Phone, MapPin, Github, Twitter, Linkedin
} from "lucide-react";

// --- Visual Components ---

function BackgroundDecoration() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full"></div>
    </div>
  );
}

// DataTicker (기존 유지)
function DataTicker() {
  return (
    <div className="max-w-5xl mx-auto -mt-6 relative z-0">
      <div className="w-full bg-slate-900/5 backdrop-blur-sm border border-slate-200/50 rounded-b-xl py-2 overflow-hidden select-none">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/80 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/80 to-transparent z-10"></div>
        <div className="flex gap-16 animate-marquee whitespace-nowrap items-center text-[10px] font-mono font-medium tracking-wide opacity-80">
          <div className="flex items-center gap-2 text-slate-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 font-bold">SYSTEM_OPTIMAL</span>
              <span className="text-slate-400">|</span>
              <span>LATENCY: 42ms</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
              <Server className="w-3 h-3 text-blue-500" />
              <span>JOB #XRR-9281:</span>
              <span className="text-blue-600">CONVERGED</span>
              <span className="text-slate-400">::</span>
              <span>Chi²=1.2e-5</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
              <Cpu className="w-3 h-3 text-orange-500" />
              <span>CLUSTER_LOAD:</span>
              <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[65%] rounded-full animate-pulse"></div>
              </div>
              <span className="text-orange-600">65%</span>
          </div>
           {/* 반복 (생략 가능하나 부드러운 스크롤 위해 유지) */}
           <div className="flex items-center gap-2 text-slate-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 font-bold">SYSTEM_OPTIMAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon, children, className }: any) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 text-slate-900" />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-4 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
        <div className="mt-auto pt-2">
            {children}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  
  const handleDownloadSample = () => {
    const xrrHeader = "# CordaX Sample Data\n# Type: XRR\n# Columns: Q(A^-1)  Intensity(a.u.)\n";
    let xrrData = xrrHeader;
    for (let i = 0; i < 150; i++) {
      const q = 0.0 + i * 0.005;
      const fringe = Math.cos(q * 100) * 0.5 + 0.5;
      const intensity = (Math.pow(q + 0.02, -4) * 1000 * fringe) + Math.random() * 5;
      xrrData += `${q.toFixed(4)}  ${intensity.toFixed(4)}\n`;
    }
    downloadFile(xrrData, "sample_xrr.dat");

    setTimeout(() => {
        const xrdHeader = "# CordaX Sample Data\n# Type: XRD\n# Columns: 2Theta(deg)  Intensity(counts)\n";
        let xrdData = xrdHeader;
        for (let i = 0; i < 300; i++) {
          const th = 20 + i * 0.1; 
          const peak = 3000 * Math.exp(-Math.pow(th - 40, 2) / 0.5); 
          const bg = 50 + Math.random() * 10;
          const intensity = peak + bg;
          xrdData += `${th.toFixed(2)}  ${intensity.toFixed(1)}\n`;
        }
        downloadFile(xrdData, "sample_xrd.xy");
    }, 500);
  };

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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-x-hidden">
      <BackgroundDecoration />

      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/50 bg-white/70 px-8 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Atom className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold tracking-tight text-slate-900">
            InviX<span className="text-blue-600">.ai</span>
            </div>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Algorithms</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
        </div>
        <div className="flex gap-3">
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">Login</button>
            <button className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">Get Started</button>
        </div>
      </nav>

      {/* --- 히어로 섹션 --- */}
      <section className="relative pt-20 pb-20 text-center px-4">
        {/* ... (기존 히어로 내용 유지) ... */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 shadow-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          v1.0 Public Beta Live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-5xl mx-auto leading-tight">
          Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">X-ray Metrology</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          AI-powered autonomous fitting and cloud computing.<br/>
          Analyze complex thin films and crystal structures instantly on the web.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl mx-auto justify-center mb-20">
          <Link href="/project/new?mode=xrr" className="flex-1 group">
            <div className="flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/20 transition-all group-hover:bg-blue-700 group-hover:scale-105 group-active:scale-95">
                <Layers className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                <span>Start XRR Analysis</span>
            </div>
          </Link>
          <Link href="/project/new?mode=xrd" className="flex-1 group">
            <div className="flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all group-hover:bg-indigo-700 group-hover:scale-105 group-active:scale-95">
                <Atom className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                <span>Start XRD Analysis</span>
            </div>
          </Link>
          <button onClick={handleDownloadSample} className="flex-1 group">
            <div className="flex items-center justify-center gap-3 rounded-xl bg-white border border-slate-200 px-6 py-4 text-base font-bold text-slate-600 shadow-sm transition-all group-hover:border-slate-300 group-hover:bg-slate-50 group-hover:text-slate-900 group-active:scale-95">
                <Download className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                <span>Get Sample Data</span>
            </div>
          </button>
        </div>
        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 transform rotate-x-6 overflow-hidden z-10">
            <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <div className="ml-4 px-3 py-1 bg-white rounded-md border border-slate-200 text-[10px] text-slate-400 font-mono flex-1 text-center">
                    invix.ai/project/xrr-demo-result
                </div>
            </div>
            <div className="grid grid-cols-12 gap-0 h-[400px]">
                <div className="col-span-1 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-4 gap-4">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600"><Activity className="w-4 h-4"/></div>
                    <div className="w-8 h-8 rounded flex items-center justify-center text-slate-400"><Layers className="w-4 h-4"/></div>
                    <div className="w-8 h-8 rounded flex items-center justify-center text-slate-400"><Database className="w-4 h-4"/></div>
                </div>
                <div className="col-span-8 p-6 relative">
                    <div className="absolute top-6 right-6 flex gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3"/> Fit Converged
                        </span>
                    </div>
                    <div className="w-full h-full border-l border-b border-slate-200 relative flex items-end">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path d="M0,300 Q50,280 100,200 T200,150 T300,100 T400,50 T500,20" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="4 4" />
                            <path d="M0,305 Q50,285 100,205 T200,155 T300,105 T400,55 T500,25" fill="none" stroke="#3b82f6" strokeWidth="3" />
                        </svg>
                        <div className="absolute bottom-0 left-0 w-full h-[20%] border-t border-slate-100 bg-slate-50/30">
                             <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <path d="M0,20 L50,15 L100,25 L150,20 L200,22 L250,18 L300,20 L350,22 L400,18 L450,20 L500,20" fill="none" stroke="#64748b" strokeWidth="1" />
                             </svg>
                        </div>
                    </div>
                </div>
                <div className="col-span-3 border-l border-slate-100 p-4 space-y-4 bg-white">
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Material Structure</div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 text-xs font-mono space-y-1">
                            <div className="flex justify-between"><span>Layer 1</span> <span>SiO2</span></div>
                            <div className="flex justify-between text-slate-500"><span>Thick</span> <span>24.5Å</span></div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100 text-xs font-mono space-y-1">
                            <div className="flex justify-between"><span>Substrate</span> <span>Si</span></div>
                            <div className="flex justify-between text-slate-500"><span>Rough</span> <span>3.2Å</span></div>
                        </div>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Metrics</div>
                        <div className="text-2xl font-bold text-slate-800 font-mono">98.5%</div>
                        <div className="text-xs text-green-600 font-medium">High Confidence</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <DataTicker />

      {/* --- 기능 소개 (Bento Grid) --- */}
      <section className="py-24 px-4 bg-slate-50/50 border-t border-slate-100">
        {/* ... (기존 기능 소개 유지) ... */}
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">Advanced Metrology Suite</h2>
                <p className="text-slate-500 mt-2">Everything you need to characterize thin films.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
                <FeatureCard title="Auto-Fitting AI" desc="Genetic algorithms combined with Parratt recursion." icon={Cpu} className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-white to-blue-50/50">
                    {/* ... */}
                </FeatureCard>
                <FeatureCard title="Real-time Viz" desc="Interactive plotting with residual analysis." icon={Activity} className="md:col-span-1 md:row-span-1">
                    <div className="absolute bottom-4 right-4 text-slate-200"><BarChart2 className="w-12 h-12 opacity-50" /></div>
                </FeatureCard>
                <FeatureCard title="Cloud Native" desc="Access your projects from anywhere." icon={Globe} className="md:col-span-1 md:row-span-1" />
                <FeatureCard title="3D Reconstruction" desc="Visualize layer stacking in 3D." icon={Layers} className="md:col-span-2 md:row-span-1">
                    {/* ... */}
                </FeatureCard>
            </div>
        </div>
      </section>

      {/* ✅ [추가됨] Contact & Support Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-slate-900">Contact & Support</h2>
                <p className="text-slate-500 mt-2 text-sm">Need enterprise support or custom integration?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center hover:border-blue-200 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">Email Us</h3>
                    <p className="text-xs text-slate-500 mb-3">For general inquiries & support</p>
                    <a href="mailto:support@invix.ai" className="text-sm font-semibold text-blue-600 hover:underline">support@invix.ai</a>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center hover:border-blue-200 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <Phone className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">Call Us</h3>
                    <p className="text-xs text-slate-500 mb-3">Mon-Fri, 9am - 6pm (KST)</p>
                    <a href="tel:+82-2-1234-5678" className="text-sm font-semibold text-slate-700 hover:text-blue-600">+82 (02) 1234-5678</a>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center text-center hover:border-blue-200 transition-colors">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">Visit Us</h3>
                    <p className="text-xs text-slate-500 mb-3">Headquarters</p>
                    <span className="text-sm font-medium text-slate-700">123 Science-daero, Yuseong-gu<br/>Daejeon, South Korea</span>
                </div>
            </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 px-8 bg-slate-950 text-slate-400 text-sm border-t border-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                        <Atom className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-slate-200 text-lg">InviX.ai</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                    Accelerating materials science with AI-driven analysis tools.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-slate-200 mb-4">Product</h4>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-white transition-colors">XRR Analysis</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">XRD Analysis</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-200 mb-4">Company</h4>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-200 mb-4">Connect</h4>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5"/></a>
                    <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5"/></a>
                    <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5"/></a>
                </div>
            </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
            <p>© 2025 InviX Metrology. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-slate-400">Privacy Policy</a>
                <a href="#" className="hover:text-slate-400">Terms of Service</a>
            </div>
        </div>
      </footer>
    </div>
  );
}