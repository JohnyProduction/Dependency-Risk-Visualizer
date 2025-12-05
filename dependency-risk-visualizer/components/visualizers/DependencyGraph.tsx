"use client";

import { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  MarkerType,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Vulnerability {
    id: string;
    severityScore: string;
}

interface ScanResult {
    packageName: string;
    version: string;
    status: 'SAFE' | 'VULNERABLE' | 'UNKNOWN';
    vulnerabilities: Vulnerability[];
}

interface Props {
  data: ScanResult[];
}

export function DependencyGraph({ data }: Props) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    nodes.push({
      id: 'root',
      type: 'input', 
      data: { label: 'Your Application' },
      position: { x: 400, y: 300 }, 
      style: { 
        background: '#1e293b', 
        color: '#fff', 
        border: '1px solid #94a3b8', 
        width: 150, 
        fontWeight: 'bold' 
      },
    });

    const radius = 250; 
    const angleStep = (2 * Math.PI) / data.length;

    data.forEach((pkg, index) => {
      const angle = index * angleStep;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      const isVuln = pkg.status === 'VULNERABLE';
      const bg = isVuln ? '#fef2f2' : '#f0fdf4';
      const border = isVuln ? '#ef4444' : '#22c55e';

      nodes.push({
        id: pkg.packageName,
        data: { 
            label: `${pkg.packageName}\n(v${pkg.version})` 
        },
        position: { x, y },
        style: {
          background: bg,
          borderColor: border,
          borderWidth: 2,
          fontSize: '12px',
          width: 120,
          textAlign: 'center'
        }
      });

      edges.push({
        id: `e-root-${pkg.packageName}`,
        source: 'root',
        target: pkg.packageName,
        animated: true,
        style: { stroke: isVuln ? '#ef4444' : '#94a3b8' },
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[500px] w-full border rounded-lg bg-slate-50 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}