// src/components/nodes/types.ts
export interface UploadedFile {
  name: string;
  path: string;
  file: File;
  previewUrl: string;
}
export interface NodeData {
  [key: string]: any;
  label: string;
  updateNodeData?: (nodeId: string, field: string, value: any) => void;
  
  // All possible fields for all node types
  value?: string;
  fieldType?: string;
  title?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  multiline?: boolean;
  placeholder?: string;
  testCases?: any[];
  changeDescription?: string;
  linkedStories?: any[];
  content?: string;
  language?: string;
  files?: UploadedFile[];
  steps?: { id: string; text: string; image?: UploadedFile }[];
  url?: string; // <-- NEW PROPERTY FOR THE BASELINE URL
}