import { NextResponse } from 'next/server';
import { checkPackageVulnerabilities, SecurityVulnerability } from '@/lib/clients/osv-client';
import { analyzeTyposquatting } from '@/lib/analyzers/typosquatting';

interface ScanRequest {
  packageJson: string; 
}


interface PackageAnalysisResult {
  packageName: string;
  version: string;
  vulnerabilities: SecurityVulnerability[];
  status: 'SAFE' | 'VULNERABLE' | 'SUSPICIOUS' | 'UNKNOWN';
  typosquatting?: {
    isSuspicious: boolean;
    targetPackage?: string;
  };
}

function cleanVersion(version: string): string {
  return version.replace(/[\^~>=<]/g, '');
}

export async function POST(request: Request) {
  try {
    const body: ScanRequest = await request.json();

    if (!body.packageJson) {
      return NextResponse.json({ error: 'No content in package.json' }, { status: 400 });
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(body.packageJson);
    } catch (e) {
      return NextResponse.json({ error: 'Incorrect JSON format' }, { status: 400 });
    }

    const dependencies = {
      ...(parsedJson.dependencies || {}),
      ...(parsedJson.devDependencies || {}),
    };

    if (Object.keys(dependencies).length === 0) {
      return NextResponse.json({ message: 'No correlations found for analysis.' }, { status: 200 });
    }

    const analysisPromises = Object.entries(dependencies).map(async ([pkgName, rawVersion]) => {
      const version = cleanVersion(rawVersion as string);
      const vulns = await checkPackageVulnerabilities(pkgName, version);
      const typoAnalysis = analyzeTyposquatting(pkgName);

      let status: PackageAnalysisResult['status'] = 'SAFE';
      
      if (vulns.length > 0) {
        status = 'VULNERABLE';
      } else if (typoAnalysis.isSuspicious) {
        status = 'SUSPICIOUS'; 
      }

      const result: PackageAnalysisResult = {
        packageName: pkgName,
        version: version,
        vulnerabilities: vulns,
        status: status,
        typosquatting: typoAnalysis
      };

      return result;
    });

    const results = await Promise.all(analysisPromises);

    const stats = {
      totalScanned: results.length,
      vulnerableCount: results.filter(r => r.status === 'VULNERABLE').length,
      suspiciousCount: results.filter(r => r.status === 'SUSPICIOUS').length, 
      safeCount: results.filter(r => r.status === 'SAFE').length,
    };
    return NextResponse.json({ 
      results,
      stats
    });

  } catch (error) {
    console.error('[API Scan Error]', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}