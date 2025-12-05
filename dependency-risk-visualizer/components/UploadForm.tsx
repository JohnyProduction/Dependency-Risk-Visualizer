"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileJson, Play } from "lucide-react";

interface UploadFormProps {
  onScan: (jsonContent: string) => void;
  isLoading: boolean;
}

const DEMO_JSON = JSON.stringify({
  "name": "vulnerable-project",
  "dependencies": {
    "lodash": "4.17.15",
    "axios": "0.18.0",   
    "react": "18.2.0",
    "reac": "18.2.0",   
    "express": "4.16.0"  
  }
}, null, 2);

export function UploadForm({ onScan, isLoading }: UploadFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScan(content);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-blue-600" />
          Supply chain analysis
        </CardTitle>
        <CardDescription>
          Paste the contents of the file <code>package.json</code> to scan dependencies for known vulnerabilities (CVE) and risks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder='{ "dependencies": { ... } }'
              className="min-h-[300px] font-mono text-sm bg-slate-50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {content === "" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 text-xs"
                onClick={() => setContent(DEMO_JSON)}
              >
                Load Demo
              </Button>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !content}>
            {isLoading ? (
              "Analyzing..."
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" /> Start Scanning
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}