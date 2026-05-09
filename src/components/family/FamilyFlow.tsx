"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  type NodeChange,
  applyNodeChanges,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { useState, useEffect } from "react";
import { updateMemberPosition } from "@/app/actions/family";

export type FlowMember = {
  id: string;
  characterId: string;
  name: string;
  portrait: string | null;
  birthYear: number | null;
  deathYear: number | null;
  x: number | null;
  y: number | null;
};

export type FlowEdge = {
  id: string;
  fromId: string;
  toId: string;
  type: string;
};

function PersonNode({ data }: NodeProps<{ name: string; portrait?: string | null; href: string; lifespan?: string }>) {
  return (
    <a
      href={data.href}
      className="block min-w-[180px] rounded-md border border-ink-600 bg-ink-900/95 px-3 py-2 shadow-glow transition-colors hover:border-rune-500"
    >
      <Handle type="target" position={Position.Top} className="!bg-rune-500" />
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-ink-700 bg-ink-800">
          {data.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.portrait} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm">
              👤
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-sm text-parchment-50">
            {data.name}
          </div>
          {data.lifespan ? (
            <div className="text-[10px] text-ink-400">{data.lifespan}</div>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-rune-500" />
    </a>
  );
}

const nodeTypes = { person: PersonNode };

export function FamilyFlow({
  worldId,
  treeId,
  members,
  edges,
}: {
  worldId: string;
  treeId: string;
  members: FlowMember[];
  edges: FlowEdge[];
}) {
  return (
    <ReactFlowProvider>
      <Inner worldId={worldId} treeId={treeId} members={members} edges={edges} />
    </ReactFlowProvider>
  );
}

function Inner({
  worldId,
  treeId,
  members,
  edges,
}: {
  worldId: string;
  treeId: string;
  members: FlowMember[];
  edges: FlowEdge[];
}) {
  const router = useRouter();

  const initialNodes: Node[] = useMemo(() => {
    // Auto layout if positions are missing.
    const fallbackPositions = autoLayout(members, edges);
    return members.map((m, idx) => {
      const pos =
        m.x != null && m.y != null
          ? { x: m.x, y: m.y }
          : fallbackPositions.get(m.id) ?? { x: 80 + (idx % 4) * 240, y: 80 + Math.floor(idx / 4) * 160 };
      const lifespan =
        m.birthYear != null || m.deathYear != null
          ? `${m.birthYear ?? "?"} – ${m.deathYear ?? "?"}`
          : undefined;
      return {
        id: m.id,
        type: "person",
        position: pos,
        data: {
          name: m.name,
          portrait: m.portrait,
          href: `/worlds/${worldId}/characters/${m.characterId}`,
          lifespan,
        },
      };
    });
  }, [members, edges, worldId]);

  const initialEdges: Edge[] = useMemo(() => {
    return edges.map((e) => ({
      id: e.id,
      source: e.fromId,
      target: e.toId,
      label: e.type === "spouse" ? "♥" : undefined,
      animated: e.type === "spouse",
      style: {
        stroke: e.type === "spouse" ? "#e76f51" : "#5fb0ec",
        strokeWidth: 2,
      },
      labelStyle: { fill: "#f5ecd6", fontWeight: 600 },
      labelBgStyle: { fill: "#161a25" },
      type: e.type === "spouse" ? "straight" : "smoothstep",
      markerEnd:
        e.type === "parent"
          ? { type: MarkerType.ArrowClosed, color: "#5fb0ec" }
          : undefined,
    }));
  }, [edges]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edgesState, setEdgesState] = useState<Edge[]>(initialEdges);

  useEffect(() => setNodes(initialNodes), [initialNodes]);
  useEffect(() => setEdgesState(initialEdges), [initialEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      for (const change of changes) {
        if (change.type === "position" && !change.dragging && change.position) {
          updateMemberPosition(treeId, change.id, change.position.x, change.position.y).catch(() => {});
        }
      }
    },
    [treeId],
  );

  return (
    <div className="card h-[640px] w-full overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edgesState}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: false }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background color="#272d3d" gap={24} />
        <Controls className="!bg-ink-900 !border-ink-700" />
      </ReactFlow>
    </div>
  );
}

function autoLayout(members: FlowMember[], edges: FlowEdge[]) {
  // Simple generation-based layout based on parent edges.
  const childOf = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  members.forEach((m) => incoming.set(m.id, 0));
  for (const e of edges) {
    if (e.type !== "parent") continue;
    if (!childOf.has(e.fromId)) childOf.set(e.fromId, []);
    childOf.get(e.fromId)!.push(e.toId);
    incoming.set(e.toId, (incoming.get(e.toId) ?? 0) + 1);
  }
  const generation = new Map<string, number>();
  const queue = members
    .filter((m) => (incoming.get(m.id) ?? 0) === 0)
    .map((m) => m.id);
  for (const id of queue) generation.set(id, 0);
  while (queue.length) {
    const current = queue.shift()!;
    const gen = generation.get(current)!;
    for (const child of childOf.get(current) ?? []) {
      const childGen = Math.max(generation.get(child) ?? 0, gen + 1);
      if (generation.get(child) !== childGen) {
        generation.set(child, childGen);
        queue.push(child);
      }
    }
  }
  const byGen = new Map<number, string[]>();
  members.forEach((m) => {
    const g = generation.get(m.id) ?? 0;
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(m.id);
  });
  const positions = new Map<string, { x: number; y: number }>();
  const HORIZ = 240;
  const VERT = 180;
  for (const [g, ids] of byGen) {
    ids.forEach((id, idx) => {
      positions.set(id, { x: 80 + idx * HORIZ, y: 80 + g * VERT });
    });
  }
  return positions;
}
