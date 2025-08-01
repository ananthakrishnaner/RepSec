// src/lib/layout.ts
import { Edge, Node } from '@xyflow/react';
import dagre from 'dagre';
import { NodeData } from '@/components/nodes/types';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// You can adjust these values to change the spacing between nodes
const nodeWidth = 850; // A bit wider to accommodate the TableNode
const nodeHeight = 500; // Average height

export const getLayoutedElements = (nodes: Node<NodeData>[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 }); // Top-to-Bottom layout

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We are shifting the dagre node position (anchor=center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};