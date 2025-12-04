import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Network, Lock, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-4">
      <div className="max-w-3xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-mono mb-4">
          <ShieldCheck className="w-4 h-4" />
          Cybersecurity R&D Project
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-slate-300 to-slate-600 bg-clip-text text-transparent">
          Supply Chain <br />
          Risk Visualizer
        </h1>
        
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Advanced dependency analysis in Node.js projects.
          Detection of vulnerabilities (CVEs), typosquatting risks, and graph visualization of attack vectors.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold h-12 px-8">
              Start Scanner <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="https://github.com/JohnyProduction" target="_blank">
            <Button variant="outline" size="lg" className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12">
              View Code 
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 text-left">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-semibold text-slate-200">CVE detection</h3>
            <p className="text-sm text-slate-500">Real-time integration with the OSV.dev (Google) database.</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Network className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Graph Analysis</h3>
            <p className="text-sm text-slate-500">Interactive visualization of connections between packages.</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Heuristics</h3>
            <p className="text-sm text-slate-500">Algorithms for detecting anomalies in versioning.</p>
          </div>
        </div>

      </div>
    </main>
  );
}