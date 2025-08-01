import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import JSZip from 'jszip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportPreview, ReportComponent } from './ReportPreview';
import { useToast } from '@/hooks/use-toast';
import { Eye, Wrench, Trash2, FileArchive, Download, Upload, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComponentToolbar } from './ComponentToolbar';
import { TextInputNode } from './nodes/TextInputNode';
import { TableNode } from './nodes/TableNode';
import { CodeSnippetNode } from './nodes/CodeSnippetNode';
import { FileUploadNode } from './nodes/FileUploadNode';
import { SectionHeaderNode } from './nodes/SectionHeaderNode';
import { LinkedStoriesNode } from './nodes/LinkedStoriesNode';
import { StepsNode } from './nodes/StepsNode';
import { initialNodes as defaultInitialNodes } from './initialElements';
import { UploadedFile, NodeData } from './nodes/types';
import { getLayoutedElements } from '@/lib/layout';

const nodeIdCounter = { current: 0 };
const getId = () => `dndnode_${nodeIdCounter.current++}`;
const isImageFile = (filename: string): boolean => /\.(jpe?g|png|gif|webp|svg)$/i.test(filename);

export const ReportBuilder: React.FC = () => {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [previewData, setPreviewData] = useState<ReportComponent[] | null>(null);

  const updateNodeData = useCallback((nodeId: string, field: string, value: any) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, [field]: value } } : node)
    );
  }, []);

  const runtimeInitialNodes: Node<NodeData>[] = defaultInitialNodes.map(node => ({ ...node, data: { ...node.data, updateNodeData } }));
  const [nodes, setNodes, onNodesChange] = useNodesState(runtimeInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = { textInput: TextInputNode, table: TableNode, codeSnippet: CodeSnippetNode, fileUpload: FileUploadNode, sectionHeader: SectionHeaderNode, linkedStories: LinkedStoriesNode, steps: StepsNode };
  
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
  
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current) return;
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const fieldType = event.dataTransfer.getData('application/fieldtype');
    if (!type) return;
    const position = { x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top };
    const newNodeData: NodeData = { label: `${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}`, fieldType: fieldType || '', updateNodeData };
    const newNode: Node<NodeData> = { id: getId(), type, position, data: newNodeData };
    setNodes((nds) => nds.concat(newNode));
  }, [updateNodeData, setNodes]);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]); setEdges([...layoutedEdges]);
    toast({ title: "Layout updated!" });
  }, [nodes, edges, setNodes, setEdges]);

  const exportDesign = () => {
    try {
      const designData = { nodes: nodes.map(({ data: { updateNodeData, ...restData }, ...restNode }) => ({ ...restNode, data: restData })), edges };
      const dataStr = JSON.stringify(designData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `report-design-${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href);
      toast({ title: "Design Exported Successfully" });
    } catch (e) { toast({ title: "Failed to export design", variant: "destructive" }); }
  };

  const importDesign = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const designData = JSON.parse(e.target?.result as string);
        if (!designData.nodes || !designData.edges) throw new Error("Invalid design file");
        const rehydratedNodes = designData.nodes.map((node: Node<NodeData>) => ({ ...node, data: { ...node.data, updateNodeData } }));
        setNodes(rehydratedNodes); setEdges(designData.edges);
        toast({ title: "Design Imported Successfully" });
      } catch (err) { toast({ title: "Failed to import design", variant: "destructive" }); }
    };
    reader.readAsText(file); event.target.value = '';
  };

  const generateReportFromNodes = (currentNodes: Node<NodeData>[]): ReportComponent[] => {
    return [...currentNodes].sort((a, b) => a.position.y - b.position.y).map(node => ({ type: node.type as ReportComponent['type'], data: node.data }));
  };
  const handleShowPreview = () => { setPreviewData(generateReportFromNodes(nodes)); setActiveTab('preview'); };
  
  const generateMarkdownContent = (components: ReportComponent[]): string => {
      return components.map(comp => {
      const { type, data } = comp;
      switch (type) {
        case 'sectionHeader': return `\n## ${data.title || ''}\n`;
        case 'textInput':
          if (data.fieldType === 'projectName') return `# ${data.value || ''}\n`;
          const titles: { [key: string]: string } = { scope: "### Scope of Work", baselines: "### Baselines" };
          let content = titles[data.fieldType] ? `${titles[data.fieldType]}\n\n${data.value || ''}\n` : `${data.value || ''}\n`;
          if (data.fieldType === 'baselines' && data.url) {
            content += `\n[Reference URL](${data.url})\n`;
          }
          return content;
        case 'table':
          let tableMd = `### Test Cases\n\n| ID | Test Case | Category | Exploited | URL | Evidence | Status | Tester |\n|---|---|---|---|---|---|---|---|\n`;
          (data.testCases || []).forEach((tc: any) => {
            const evidenceLinks = (tc.evidence || []).map((ev: UploadedFile) => `[${ev.name}](${ev.path})`).join('<br>');
            tableMd += `| ${tc.id || ''} | ${tc.testCase || ''} | ${tc.category || ''} | ${tc.exploited || ''} | ${tc.url || ''} | ${evidenceLinks} | ${tc.status || ''} | ${tc.tester || ''} |\n`;
          }); return tableMd;
        case 'codeSnippet': return `\n### ${data.title || 'Code Snippet'}\n\n\`\`\`${data.language || 'text'}\n${data.content || ''}\n\`\`\`\n`;
        case 'linkedStories':
          let storiesMd = `\n### Change Description & Linked Stories\n\n**Description:**\n${data.changeDescription || 'N/A'}\n`;
          if (data.linkedStories && data.linkedStories.length > 0) {
            storiesMd += `\n**Linked Stories:**\n`;
            data.linkedStories.forEach((story: any) => { storiesMd += `- **[${story.id || 'N/A'}](${story.url || '#'})**: ${story.title || ''}\n`; });
          } return storiesMd + '\n';
        case 'fileUpload':
          let filesMd = `\n### Attachments\n`;
          (data.files || []).forEach((file: UploadedFile) => { filesMd += isImageFile(file.name) ? `\n![${file.name}](${file.path})\n` : `\n- [${file.name}](${file.path})`; });
          return filesMd + '\n';
        case 'steps':
          let stepsMd = `\n### Steps to Reproduce\n`;
          (data.steps || []).forEach((step: any, index: number) => {
            stepsMd += `\n${index + 1}. ${step.text || ''}\n`;
            if (step.image) { stepsMd += `   ![Screenshot for Step ${index + 1}](${step.image.path})\n`; }
          });
          return stepsMd + '\n';
        default: return '';
      }
    }).join('\n');
  };

  const handleGeneratePackage = async () => { /* ... Unchanged ... */ };
  const clearAllData = () => { /* ... Unchanged ... */ };
  const [activeTab, setActiveTab] = useState('builder');
  
  return (
    <div className="h-screen bg-background overflow-hidden flex">
      <div className="w-80 border-r border-border/50 bg-card/50 flex flex-col h-full"><div className="p-4 border-b border-border/30"><h2 className="text-xl font-bold text-primary">Report Builder</h2><p className="text-sm text-muted-foreground">Arrange components to build your report.</p></div><div className="flex-1 overflow-y-auto"><ComponentToolbar /></div><div className="p-4 border-t border-border/30 space-y-2">
        <div className="grid grid-cols-2 gap-2">
            <Button onClick={exportDesign} variant="outline"><Download className="w-4 h-4 mr-2" />Export Design</Button>
            <Button asChild variant="outline"><label className="cursor-pointer flex items-center justify-center"><Upload className="w-4 h-4 mr-2" />Import Design<input type="file" accept=".json" className="hidden" onChange={importDesign} /></label></Button>
        </div>
        <Button onClick={onLayout} variant="outline" className="w-full"><GitBranch className="w-4 h-4 mr-2" />Tidy Up Layout</Button>
        <Button onClick={clearAllData} variant="destructive" className="w-full"><Trash2 className="w-4 h-4 mr-2" />Clear Canvas</Button>
        <Button onClick={handleShowPreview} className="w-full"><Eye className="w-4 h-4 mr-2" />Show Preview</Button>
        <Button onClick={handleGeneratePackage} className="w-full bg-green-600 hover:bg-green-700 text-white"><FileArchive className="w-4 h-4 mr-2" />Generate Report Package</Button>
      </div></div>
      <div className="flex-1 flex flex-col"><Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col"><TabsList className="shrink-0 border-b border-border/30 bg-card/20 rounded-none p-0 h-14"><TabsTrigger value="builder" className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"><Wrench className="w-4 h-4 mr-2" />Builder</TabsTrigger><TabsTrigger value="preview" className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"><Eye className="w-4 h-4 mr-2"/>Preview</TabsTrigger></TabsList><TabsContent value="builder" className="flex-1 m-0"><div ref={reactFlowWrapper} className="h-full w-full"><ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver} nodeTypes={nodeTypes} fitView><Background /><Controls /><MiniMap /></ReactFlow></div></TabsContent><TabsContent value="preview" className="flex-1 m-0 h-full overflow-y-auto bg-muted/20"><ReportPreview reportComponents={previewData} /></TabsContent></Tabs></div>
    </div>
  );
};