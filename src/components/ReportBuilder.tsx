import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, Background, Controls, MiniMap, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import JSZip from 'jszip';
import html2pdf from 'html2pdf.js';
import { createRoot } from 'react-dom/client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportPreview, ReportComponent } from './ReportPreview';
import { useToast } from '@/hooks/use-toast';
import { Eye, Wrench, Trash2, FileArchive, Download, Upload, GitBranch, FileJson, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { ComponentToolbar } from './ComponentToolbar';
import { TextInputNode } from './nodes/TextInputNode';
import { TableNode } from './nodes/TableNode';
import { CodeSnippetNode } from './nodes/CodeSnippetNode';
import { FileUploadNode } from './nodes/FileUploadNode';
import { SectionHeaderNode } from './nodes/SectionHeaderNode';
import { LinkedStoriesNode } from './nodes/LinkedStoriesNode';
import { StepsNode } from './nodes/StepsNode';
import { AIGeneratorNode } from './nodes/AIGeneratorNode';
import { initialNodes as defaultInitialNodes } from './initialElements';
import { UploadedFile, NodeData } from './nodes/types';
import { getLayoutedElements } from '@/lib/layout';
import { PdfTemplate } from './PdfTemplate';

const nodeIdCounter = { current: 0 };
const getId = () => `dndnode_${nodeIdCounter.current++}`;
const isImageFile = (filename: string): boolean => /\.(jpe?g|png|gif|webp|svg)$/i.test(filename);

const SettingsModal = () => {
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        toast({ title: "Settings Saved", description: "Your Gemini API Key has been saved locally." });
    };
    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="outline" size="icon" className="absolute top-2 right-2 z-10 bg-background/50 h-8 w-8"><Settings className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Settings</DialogTitle><DialogDescription>Manage application settings. Your keys are saved securely in your browser's local storage.</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="gemini-key">Gemini API Key</Label><Input id="gemini-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your Google AI Studio API Key" /></div></div>
                <DialogFooter><Button onClick={handleSave}>Save Changes</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ReportBuilderInner = () => {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [previewData, setPreviewData] = useState<ReportComponent[] | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  const updateNodeData = useCallback((nodeId: string, field: string, value: any) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, [field]: value } } : node)
    );
  }, []);

  const runtimeInitialNodes: Node<NodeData>[] = defaultInitialNodes.map(node => ({ ...node, data: { ...node.data, updateNodeData } }));
  const [nodes, setNodes, onNodesChange] = useNodesState(runtimeInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = { textInput: TextInputNode, table: TableNode, codeSnippet: CodeSnippetNode, fileUpload: FileUploadNode, sectionHeader: SectionHeaderNode, linkedStories: LinkedStoriesNode, steps: StepsNode, aiGenerator: AIGeneratorNode };
  
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
  
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault(); if (!reactFlowWrapper.current) return;
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow'); const fieldType = event.dataTransfer.getData('application/fieldtype');
    if (!type) return;
    const position = { x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top };
    const newNodeData: NodeData = { label: `${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}`, fieldType: fieldType || '', updateNodeData, value: '', title: '', level: 'h2', multiline: false, placeholder: 'Enter content...', testCases: [], changeDescription: '', linkedStories: [], content: '', language: 'text', files: [], steps: [], url: '' };
    const newNode: Node<NodeData> = { id: getId(), type, position, data: newNodeData, style: { width: type === 'table' ? 800 : type === 'steps' || type === 'linkedStories' ? 500 : 350 }};
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
          if (data.fieldType === 'baselines' && data.url) { content += `\n[Reference URL](${data.url})\n`; }
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

  const handleGeneratePackage = async () => {
    toast({ title: "Generating Report Package..." });
    const zip = new JSZip();
    zip.file("report.md", generateMarkdownContent(generateReportFromNodes(nodes)));
    const evidenceFolder = zip.folder("evidence");
    if (!evidenceFolder) return toast({ title: "Failed to create ZIP folder", variant: "destructive" });
    nodes.forEach(node => {
      if (node.data.files) node.data.files.forEach((uploadedFile: UploadedFile) => { evidenceFolder.file(uploadedFile.path.replace('./evidence/', ''), uploadedFile.file); });
      if (node.data.testCases) node.data.testCases.forEach((tc: any) => { if(tc.evidence) tc.evidence.forEach((ev: UploadedFile) => { evidenceFolder.file(ev.path.replace('./evidence/', ''), ev.file); }); });
      if (node.data.steps) node.data.steps.forEach((step: any) => { if (step.image) evidenceFolder.file(step.image.path.replace('./evidence/', ''), step.image.file); });
    });
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement('a'); a.href = URL.createObjectURL(content); a.download = "SecurityReportPackage.zip"; a.click(); URL.revokeObjectURL(a.href);
      toast({ title: "Report Package Downloaded!" });
    } catch (error) { toast({ title: "Failed to generate ZIP", variant: "destructive" }); }
  };
  
  const clearAllData = () => { if (window.confirm('Clear the canvas and all uploaded files?')) { setNodes([]); setEdges([]); setPreviewData(null); toast({ title: "Canvas Cleared" }); }};

  const handleExportPdf = async () => {
    setIsExportingPdf(true); toast({ title: "Generating PDF...", description: "This may take a moment." });
    const reportData = generateReportFromNodes(nodes);
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute'; pdfContainer.style.left = '-9999px'; pdfContainer.style.width = '8.5in';
    document.body.appendChild(pdfContainer);
    const root = createRoot(pdfContainer);
    await new Promise<void>((resolve) => { root.render( <React.StrictMode><PdfTemplate reportComponents={reportData} /></React.StrictMode> ); setTimeout(resolve, 500); });
    const elementToCapture = pdfContainer.querySelector('#pdf-content-wrapper');
    if (elementToCapture) {
      const projectNameComponent = nodes.find(n => n.data.fieldType === 'projectName');
      const filename = projectNameComponent ? `${projectNameComponent.data.value}_SecurityReport.pdf` : 'SecurityReport.pdf';
      const options = { margin: 0, filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
      try {
        await html2pdf().from(elementToCapture).set(options).save();
        toast({ title: "PDF Exported Successfully!" });
      } catch (error) { toast({ title: "PDF Export Failed", description: "An error occurred.", variant: "destructive" }); }
    } else { toast({ title: "Error: Could not find PDF template to render.", variant: "destructive" }); }
    root.unmount(); document.body.removeChild(pdfContainer);
    setIsExportingPdf(false);
  };

  const [activeTab, setActiveTab] = useState('builder');
  
  return (
    <>
      <div className="h-screen bg-background overflow-hidden flex">
        <div className="w-80 border-r border-border/50 bg-card/50 flex flex-col h-full">
          <div className="p-4 border-b border-border/30 relative"><h2 className="text-xl font-bold text-primary">RepSec Builder</h2><p className="text-sm text-muted-foreground">Visual Report Generator</p><SettingsModal/></div>
          <div className="flex-1 overflow-y-auto"><ComponentToolbar /></div>
          <div className="p-4 border-t border-border/30 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={exportDesign} variant="outline"><FileJson className="w-4 h-4 mr-2" />Export Design</Button>
              <Button asChild variant="outline"><label className="cursor-pointer flex items-center justify-center"><Upload className="w-4 h-4 mr-2" />Import Design<input type="file" accept=".json" className="hidden" onChange={importDesign} /></label></Button>
            </div>
            <Button onClick={onLayout} variant="outline" className="w-full"><GitBranch className="w-4 h-4 mr-2" />Tidy Up Layout</Button>
            <Button onClick={clearAllData} variant="destructive" className="w-full"><Trash2 className="w-4 h-4 mr-2" />Clear Canvas</Button>
            <Button onClick={handleShowPreview} className="w-full"><Eye className="w-4 h-4 mr-2" />Show Preview</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleGeneratePackage} className="bg-green-600 hover:bg-green-700 text-white"><FileArchive className="w-4 h-4 mr-2" />Get .zip</Button>
              <Button onClick={handleExportPdf} disabled={isExportingPdf} className="bg-red-600 hover:bg-red-700 text-white">
                {isExportingPdf ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <FileText className="w-4 h-4 mr-2" />}
                Export PDF
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="shrink-0 border-b border-border/30 bg-card/20 rounded-none p-0 h-14">
              <TabsTrigger value="builder" className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"><Wrench className="w-4 h-4 mr-2" />Builder</TabsTrigger>
              <TabsTrigger value="preview" className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"><Eye className="w-4 h-4 mr-2"/>Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="builder" className="flex-1 m-0">
              <div ref={reactFlowWrapper} className="h-full w-full">
                <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver} nodeTypes={nodeTypes} fitView nodesResizable>
                  <Background /><Controls /><MiniMap />
                </ReactFlow>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 m-0 h-full overflow-y-auto bg-muted/20">
              <ReportPreview reportComponents={previewData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div id="pdf-render-target" style={{ position: 'fixed', left: '-9999px', pointerEvents: 'none', width: '8.5in' }}></div>
    </>
  );
};

export const ReportBuilderContainer: React.FC = () => (
  <ReactFlowProvider>
    <ReportBuilderInner />
  </ReactFlowProvider>
);