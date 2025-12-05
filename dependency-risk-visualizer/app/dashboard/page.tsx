"use client";

import { useState } from "react";
import { UploadForm } from "@/components/UploadForm";
import { DependencyGraph } from "@/components/visualizers/DependencyGraph";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight 
} from "lucide-react";

interface ScanResult {
  packageName: string;
  version: string;
  status: 'SAFE' | 'VULNERABLE' | 'SUSPICIOUS' | 'UNKNOWN';
  vulnerabilities: Array<{
    id: string;
    title: string;
    severityScore: string;
    link: string;
  }>;
  typosquatting?: {
    isSuspicious: boolean;
    targetPackage?: string;
  };
}

interface ScanStats {
  totalScanned: number;
  vulnerableCount: number;
  suspiciousCount: number;
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'VULNERABLE':
        return { 
          color: 'text-red-600', 
          bg: 'bg-red-50', 
          border: 'border-red-200', 
          icon: AlertCircle, 
          badgeVariant: 'destructive' as const 
        };
      case 'SUSPICIOUS':
        return { 
          color: 'text-amber-600', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200', 
          icon: AlertTriangle, 
          badgeVariant: 'secondary' as const 
        };
      case 'SAFE':
        return { 
          color: 'text-green-600', 
          bg: 'bg-slate-50', 
          border: 'border-slate-200', 
          icon: CheckCircle, 
          badgeVariant: 'outline' as const 
        };
      default:
        return { 
          color: 'text-slate-600', 
          bg: 'bg-slate-50', 
          border: 'border-slate-200', 
          icon: AlertCircle, 
          badgeVariant: 'outline' as const 
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-indigo-600" />
            Dependency Risk Visualizer
          </h1>
          <p className="text-slate-500 mt-2">
            R&D Tool: CVE Detection + Typosquatting Heuristics.
          </p>
        </header>

        {!results && (
          <UploadForm onScan={handleScan} isLoading={isLoading} />
        )}

        {results && stats && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <Card className="overflow-hidden border-slate-300 shadow-sm">
                <CardHeader className="bg-slate-100/50 border-b pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Risk Map <span className="text-xs font-normal text-slate-500">(Supply Chain Graph)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DependencyGraph data={results} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Scanned</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats.totalScanned}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500 bg-red-50/30 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-700">Critical CVE</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-red-800">{stats.vulnerableCount}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500 bg-amber-50/30 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-amber-700">Suspicious (Typosquat)</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-amber-800">{stats.suspiciousCount}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Safe</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-700">{stats.safeCount}</div></CardContent>
              </Card>
            </div>

            <div className="grid gap-4 pt-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800">Detailed Report</h2>
                    <Button variant="outline" size="sm" onClick={() => setResults(null)}>New Scan</Button>
                </div>
                
                {results.map((item, idx) => {
                    const config = getStatusConfig(item.status);
                    const StatusIcon = config.icon;

                    return (
                        <Card key={idx} className={`border ${config.border} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-opacity-50">
                                <div className="flex items-center gap-3">
                                    <StatusIcon className={`${config.color} w-6 h-6`} />
                                    <div>
                                        <div className="font-mono font-bold text-lg text-slate-800">
                                            {item.packageName} 
                                            <span className="ml-2 text-slate-400 text-sm font-sans">v{item.version}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={config.badgeVariant} className="text-sm px-3 py-1">
                                    {item.status}
                                </Badge>
                            </CardHeader>
                            
                            <CardContent className="pt-0 pb-4 px-6 space-y-4">
                                {item.status === 'SUSPICIOUS' && item.typosquatting && (
                                  <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                      <div>
                                          <h4 className="font-semibold text-amber-800 text-sm">Possible attempt at Typosquatting</h4>
                                          <p className="text-sm text-amber-700 mt-1">
                                              The name of the package is confusingly similar to a popular library: 
                                              <span className="font-mono font-bold mx-1">&quot;{item.typosquatting.targetPackage}&quot;</span>.
                                              Please check if you really wanted to install this version.
                                          </p>
                                      </div>
                                  </div>
                                )}
                                {item.vulnerabilities.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {item.vulnerabilities.map((vuln) => (
                                            <div key={vuln.id} className="bg-red-50 p-3 rounded-md text-sm border border-red-100 group hover:border-red-300 transition-colors">
                                                <div className="font-semibold text-red-900 flex justify-between items-start">
                                                    <span className="flex items-center gap-2">
                                                        <ShieldAlert className="w-4 h-4" /> {vuln.id}: {vuln.title}
                                                    </span>
                                                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-red-200 text-red-600">
                                                        CVSS: {vuln.severityScore}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex justify-end">
                                                    <a href={vuln.link} target="_blank" rel="noopener noreferrer" 
                                                       className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs flex items-center gap-1 font-medium">
                                                        Analysis in the OSV database <ArrowRight className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {item.status === 'SAFE' && (
                                    <p className="text-slate-400 text-sm italic mt-2">No known threats in the OSV database and no suspicious names.</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}