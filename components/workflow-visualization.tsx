import type { Edge, Node } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useTheme } from 'next-themes';

import '@xyflow/react/dist/style.css';

import { cn, debounce } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Workflow } from './types';

type ButterflowWorkflowContent = Workflow;

type ProjectStatus =
  | 'todo'
  | 'in_progress'
  | 'done'
  | 'closed'
  | 'awaiting_trigger'
  | 'is_bot_processing';

type ButterflowTask = {
  id: string;
  name: string;
  status: ProjectStatus;
  workflowStepId: string;
};

const proOptions = { hideAttribution: true };

interface ButterflowNodeData {
  name: string;
  nodeStatus: ProjectStatus;
  nodeTasks: ButterflowTask[];
  hoveredNodeId?: string;
  setHoveredNodeId?: (id: string | undefined) => void;
  selectedNodeId?: string | null;
}

// Custom Node Component
function ButterflowNode({
  data,
  id,
}: {
  data: ButterflowNodeData;
  id: string;
}) {
  const {
    name,
    nodeStatus,
    nodeTasks,
    hoveredNodeId,
    setHoveredNodeId,
    selectedNodeId,
  } = data;

  return (
    <>
      <Handle type="target" position={Position.Top} className="invisible" />
      <div
        className={cn(
          'xyflow-handle:invisible rounded-lg border bg-card/90 p-0 shadow-xl shadow-slate-900/10 backdrop-blur-lg transition-shadow dark:shadow-black/20',
          'hover:ring-1 hover:ring-primary',
          hoveredNodeId === id && 'ring-1 ring-primary',
          selectedNodeId === id && 'bg-primary/5 ring-2 ring-primary'
        )}
      >
        <div
          className="flex items-center justify-between gap-2 px-4 py-[18px] text-left"
          onMouseEnter={() => setHoveredNodeId?.(id)}
          onMouseLeave={() => setHoveredNodeId?.(undefined)}
        >
          <div className="flex flex-col gap-1">
            <strong className="max-w-[200px] truncate text-sm font-bold">
              {name}
            </strong>
            {nodeTasks.length > 1 && (
              <Badge variant="secondary" className="mt-1 w-fit text-xs">
                {nodeTasks.length} tasks
              </Badge>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </>
  );
}

// Node types definition for ReactFlow
const nodeTypes = {
  butterflowNode: ButterflowNode,
};

const transformButterflowToElements = (
  workflow: { workflow: ButterflowWorkflowContent },
  tasks: ButterflowTask[],
  {
    hoveredNodeId,
    setHoveredNodeId,
    selectedNodeId,
  }: {
    hoveredNodeId?: string;
    setHoveredNodeId?: (id: string | undefined) => void;
    selectedNodeId?: string | null;
  }
) => {
  const nodes = workflow.workflow.nodes.map<Node>((node) => {
    // For butterflow workflows, the tasks are linked to nodes instead of steps
    const nodeTasks = tasks.filter((task) => task.workflowStepId === node.id);

    // Get consolidated status for the node based on its tasks
    let nodeStatus: ProjectStatus = 'todo';
    if (nodeTasks.length > 0) {
      if (
        nodeTasks.some(
          (t) => t.status === 'in_progress' || t.status === 'is_bot_processing'
        )
      ) {
        nodeStatus = 'in_progress';
      } else if (nodeTasks.every((t) => t.status === 'done')) {
        nodeStatus = 'done';
      } else if (nodeTasks.some((t) => t.status === 'closed')) {
        nodeStatus = 'closed';
      } else if (nodeTasks.some((t) => t.status === 'awaiting_trigger')) {
        nodeStatus = 'awaiting_trigger';
      }
    }

    return {
      id: node.id,
      type: 'butterflowNode',
      data: {
        name: node.name,
        nodeStatus,
        nodeTasks,
        hoveredNodeId,
        setHoveredNodeId,
        selectedNodeId,
      },
      draggable: false,
      connectable: false,
      position: { x: 0, y: 0 },
    };
  });

  const edges = workflow.workflow.nodes
    .filter((node) => node.depends_on && node.depends_on.length > 0)
    .flatMap(
      (node) =>
        node.depends_on?.map<Edge>((dep) => ({
          id: `e${dep}-${node.id}`,
          type: 'smoothstep',
          source: dep,
          target: node.id,
          markerEnd: {
            type: MarkerType.Arrow,
            strokeWidth: 3,
            color: 'hsl(var(--foreground))',
          },
          className:
            'stroke-foreground hover:stroke-foreground/50 *:stroke-foreground/50!',
        })) ?? []
    );

  return { nodes, edges };
};

// Inner component that has access to the ReactFlow instance
const WorkflowInner = ({
  workflow,
  tasks,
  hoveredNodeId,
  setHoveredNodeId,
  selectedNodeId,
  onNodeSelect,
  fitViewReady,
}: {
  workflow: { workflow: ButterflowWorkflowContent };
  tasks: ButterflowTask[];
  hoveredNodeId?: string;
  setHoveredNodeId?: (id: string | undefined) => void;
  selectedNodeId?: string | null;
  onNodeSelect?: (id: string) => void;
  fitViewReady: boolean;
}) => {
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();
  // Track whether ELK has finished laying out nodes
  const [layoutReady, setLayoutReady] = useState(false);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  useEffect(() => {
    setLayoutReady(false);
    const { nodes, edges } = transformButterflowToElements(workflow, tasks, {
      hoveredNodeId,
      setHoveredNodeId,
      selectedNodeId,
    });
    const elk = new ELK();

    void elk
      .layout({
        id: 'root',
        layoutOptions: {
          'elk.direction': 'DOWN',
          'spacing.nodeNode': '20',
          'spacing.nodeNodeBetweenLayers': '100',
        },
        children: nodes.map((node) => ({
          ...node,
          width: 280,
          height: 58,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      })
      .then((layout) => {
        const layoutedNodes =
          layout.children?.map((node) => ({
            ...node,
            position: { x: node.x ?? 0, y: node.y ?? 0 },
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
          })) ?? [];

        setNodes(layoutedNodes);
        setEdges(edges);
        setLayoutReady(true);
      });
  }, [
    hoveredNodeId,
    setEdges,
    setNodes,
    workflow,
    setHoveredNodeId,
    tasks,
    selectedNodeId,
  ]);

  // Only fitView once BOTH the layout is computed AND the parent animation is done
  useEffect(() => {
    if (!layoutReady || !fitViewReady) return;
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 300 });
    });
  }, [layoutReady, fitViewReady, fitView]);

  // Re-fit on window resize (debounced) once the pane is ready
  useEffect(() => {
    if (!layoutReady || !fitViewReady) return;
    const onResize = debounce(() => {
      fitView({ padding: 0.2, duration: 200 });
    }, 150);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [layoutReady, fitViewReady, fitView]);

  const theme = useTheme();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{
        padding: 0.2,
      }}
      colorMode={theme.resolvedTheme === 'dark' ? 'dark' : 'light'}
      className="bg-transparent!"
      proOptions={proOptions}
      onNodeClick={onNodeClick}
    >
      <Background
        bgColor="transparent"
        variant={BackgroundVariant.Lines}
        patternClassName="opacity-10 stroke-muted-foreground/40!"
      />
    </ReactFlow>
  );
};

export const ButterflowWorkflowVisualization = ({
  workflow,
  tasks,
  hoveredNodeId,
  setHoveredNodeId,
  selectedNodeId,
  onNodeSelect,
  fitViewReady = false,
}: {
  workflow: { workflow: ButterflowWorkflowContent };
  tasks: ButterflowTask[];
  hoveredNodeId?: string;
  setHoveredNodeId?: (id: string | undefined) => void;
  selectedNodeId?: string | null;
  onNodeSelect?: (id: string) => void;
  fitViewReady?: boolean;
}) => {
  return (
    <div className="size-full">
      <ReactFlowProvider>
        <WorkflowInner
          workflow={workflow}
          tasks={tasks}
          hoveredNodeId={hoveredNodeId}
          setHoveredNodeId={setHoveredNodeId}
          selectedNodeId={selectedNodeId}
          onNodeSelect={onNodeSelect}
          fitViewReady={fitViewReady}
        />
      </ReactFlowProvider>
    </div>
  );
};
