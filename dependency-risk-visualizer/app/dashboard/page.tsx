"use client";

import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { DependencyGraph } from "@/components/visualizers/DependencyGraph";

interface ScanResult {
  packageName: string;
  version: string;
  status: 'SAFE' | 'VULNERABLE' | 'UNKNOWN';
  vulnerabilities: Array<{
    id: string;
    title: string;
    severityScore: string;
    link: string;
  }>;
}

interface ScanStats {
  totalScanned: number;
  vulnerableCount: number;
  safeCount: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[] | null>(null);
  const [stats, setStats] = useState<ScanStats | null>(null);

  const handleScan = async (jsonContent: string) => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageJson: jsonContent }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results);
        setStats(data.stats);
      } else {
        alert("Scanning error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("There was an error connecting to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-indigo-600" />
            Dependency Risk Visualizer
          </h1>
          <p className="text-slate-500 mt-2">
            R&D Supply Chain Security Analysis Tool (OSV/Heuristics).
          </p>
        </header>

        {!results && (
          <UploadForm onScan={handleScan} isLoading={isLoading} />
        )}

        {results && stats && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Dependency Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DependencyGraph data={results} />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Scanned Packages</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats.totalScanned}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500 bg-red-50/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">Vulnerabilities Found</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-red-700">{stats.vulnerableCount}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Safe Packages</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-700">{stats.safeCount}</div></CardContent>
              </Card>
            </div>

            <div className="grid gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800">Detailed Report</h2>
                    <Button variant="outline" size="sm" onClick={() => setResults(null)}>New Scan</Button>
                </div>
                
                {results.map((item, idx) => (
                    <Card key={idx} className={`border ${item.status === 'VULNERABLE' ? 'border-red-200 shadow-red-100' : 'border-slate-200'}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                {item.status === 'VULNERABLE' 
                                    ? <AlertCircle className="text-red-500 w-5 h-5" /> 
                                    : <CheckCircle className="text-green-500 w-5 h-5" />
                                }
                                <div className="font-mono font-semibold text-lg">{item.packageName} <span className="text-slate-400 text-sm">v{item.version}</span></div>
                            </div>
                            <Badge variant={item.status === 'VULNERABLE' ? 'destructive' : 'outline'}>
                                {item.status}
                            </Badge>
                        </CardHeader>
                        
                        {item.vulnerabilities.length > 0 && (
                            <CardContent className="pt-0">
                                <div className="mt-2 space-y-2">
                                    {item.vulnerabilities.map((vuln) => (
                                        <div key={vuln.id} className="bg-red-50 p-3 rounded-md text-sm border border-red-100">
                                            <div className="font-semibold text-red-800 flex justify-between">
                                                <span>{vuln.id}: {vuln.title}</span>
                                                <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-red-200">CVSS: {vuln.severityScore}</span>
                                            </div>
                                            <a href={vuln.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block text-xs">
                                                See details in the OSV database &rarr;
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}