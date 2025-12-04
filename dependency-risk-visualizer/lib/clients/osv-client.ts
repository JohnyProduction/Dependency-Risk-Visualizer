interface OsvQueryPayload {
  package: {
    name: string;
    ecosystem: string;
  };
  version: string;
}

interface OsvVulnerability {
  id: string;
  summary?: string;
  details?: string;
  published?: string;
  severity?: Array<{
    type: string;
    score: string; 
  }>;
  references?: Array<{
    type: string;
    url: string;
  }>;
}

interface OsvApiResponse {
  vulns?: OsvVulnerability[];
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  description: string;
  severityScore: string; 
  link: string;
  source: 'OSV';
}

export async function checkPackageVulnerabilities(
  packageName: string,
  version: string
): Promise<SecurityVulnerability[]> {
  
  const endpoint = 'https://api.osv.dev/v1/query';
  
  const payload: OsvQueryPayload = {
    package: {
      name: packageName,
      ecosystem: 'npm',
    },
    version: version,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store', 
    });

    if (!response.ok) {
      console.error(`[OSV Client Error] Status: ${response.status}`);
      return []; 
    }

    const data: OsvApiResponse = await response.json();

    if (!data.vulns) {
      return [];
    }

    return data.vulns.map((vuln) => ({
      id: vuln.id,
      title: vuln.summary || 'Unknown security bug',
      description: vuln.details || 'No details.',
      severityScore: vuln.severity?.[0]?.score || 'UNKNOWN',
      link: vuln.references?.[0]?.url || `https://osv.dev/vulnerability/${vuln.id}`,
      source: 'OSV',
    }));

  } catch (error) {
    console.error('[OSV Client Exception]', error);
    return [];
  }
}