import { Node } from '@xyflow/react';
import { NodeData } from './nodes/types';

export const initialNodes: Node<NodeData>[] = [
  {
    id: 'header-1',
    type: 'sectionHeader',
    position: { x: 100, y: 50 },
    data: { 
      label: 'Main Title',
      title: 'Security Testing Report',
      level: 'h1',
    },
  },
  {
    id: 'project-name',
    type: 'textInput',
    position: { x: 100, y: 180 },
    data: { 
      label: 'Project Name',
      placeholder: 'Enter project name...',
      fieldType: 'projectName',
      value: 'My Awesome Project',
    },
  },
];