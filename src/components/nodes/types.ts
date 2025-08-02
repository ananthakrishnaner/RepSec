// src/components/nodes/types.ts
export interface UploadedFile {
  name: string;
  path: string;
  file: File;
  previewUrl: string;
}
export interface TestCase {
  id: string;
  testCase: string;
  category: string;
  exploited: string;
  url: string;
  evidence: UploadedFile[];
  status: string;
  tester: string;
}
export interface NodeData {
  [key: string]: any;
  label: string;
  updateNodeData?: (nodeId: string, field: string, value: any) => void;
  value?: string;
  fieldType?: string;
  title?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  multiline?: boolean;
  placeholder?: string;
  testCases?: TestCase[];
  changeDescription?: string;
  linkedStories?: any[];
  content?: string;
  language?: string;
  files?: UploadedFile[];
  steps?: { id: string; text: string; image?: UploadedFile }[];
  url?: string;
}