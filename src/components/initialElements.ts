import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: 'header-1',
    type: 'sectionHeader',
    position: { x: 100, y: 50 },
    data: { 
      label: 'Main Title',
      title: 'Security Testing Report',
      level: 'h1'
    },
  },
  {
    id: 'project-name',
    type: 'textInput',
    position: { x: 100, y: 180 },
    data: { 
      label: 'Project Name',
      placeholder: 'Enter project name...',
      value: ''
    },
  },
  {
    id: 'scope-section',
    type: 'sectionHeader',
    position: { x: 100, y: 320 },
    data: { 
      label: 'Scope Section',
      title: 'Scope of Work',
      level: 'h2'
    },
  },
  {
    id: 'scope-text',
    type: 'textInput',
    position: { x: 100, y: 450 },
    data: { 
      label: 'Scope Description',
      placeholder: 'Describe the scope of testing...',
      multiline: true
    },
  },
  {
    id: 'test-cases-header',
    type: 'sectionHeader',
    position: { x: 500, y: 50 },
    data: { 
      label: 'Test Cases Section',
      title: 'Test Cases',
      level: 'h2'
    },
  },
  {
    id: 'test-cases-table',
    type: 'table',
    position: { x: 500, y: 180 },
    data: { 
      label: 'Test Cases Table',
      testCases: []
    },
  },
];

export const initialEdges: Edge[] = [];