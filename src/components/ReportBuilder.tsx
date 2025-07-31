import React, { useState, useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportPreview } from './ReportPreview';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';

import { ComponentToolbar } from './ComponentToolbar';
import { TextInputNode } from './nodes/TextInputNode';
import { TableNode } from './nodes/TableNode';
import { CodeSnippetNode } from './nodes/CodeSnippetNode';
import { FileUploadNode } from './nodes/FileUploadNode';
import { SectionHeaderNode } from './nodes/SectionHeaderNode';
import { LinkedStoriesNode } from './nodes/LinkedStoriesNode';
import { initialNodes, initialEdges } from './initialElements';

// Move ID counter outside component to prevent resets
let globalNodeId = 0;
const getId = () => `dndnode_${globalNodeId++}`;

interface ReportData {
  projectName: string;
  scope: string;
  baselines: string;
  testCases: Array<{
    id: string;
    testCase: string;
    category: string;
    exploited: string;
    url: string;
    evidence: string;
    remediation: string;
    tester: string;
  }>;
  changeDescription: string;
  linkedStories: Array<{
    id: string;
    title: string;
    url: string;
    description: string;
  }>;
  codeSnippets: Array<{
    nodeId?: string;
    title: string;
    content: string;
    language: string;
  }>;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export const ReportBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };
  
  const [reportData, setReportData] = useState<ReportData>({
    projectName: '',
    scope: '',
    baselines: '',
    testCases: [],
    changeDescription: '',
    linkedStories: [],
    codeSnippets: [],
    attachments: [],
  });

  // Separate state for preview data - only updates when "Show Preview" is clicked
  const [previewData, setPreviewData] = useState<ReportData>({
    projectName: '',
    scope: '',
    baselines: '',
    testCases: [],
    changeDescription: '',
    linkedStories: [],
    codeSnippets: [],
    attachments: [],
  });

  const updateReportData = useCallback((updates: Partial<ReportData>) => {
    setReportData(prev => {
      const newData = { ...prev, ...updates };
      return newData;
    });
  }, []);

  // Function to collect data from nodes and update preview
  const updatePreviewFromBuilder = () => {
    // Extract data dynamically from actual nodes on canvas
    const nodeBasedData = generateReportFromNodes(nodes);
    setPreviewData(nodeBasedData);
  };

  // Function to generate report data from canvas nodes
  const generateReportFromNodes = (currentNodes: Node[]) => {
    const generatedData: ReportData = {
      projectName: '',
      scope: '',
      baselines: '',
      testCases: [],
      changeDescription: '',
      linkedStories: [],
      codeSnippets: [],
      attachments: [],
    };

    // Sort nodes by position (top to bottom, left to right)
    const sortedNodes = [...currentNodes].sort((a, b) => {
      if (Math.abs(a.position.y - b.position.y) > 50) {
        return a.position.y - b.position.y;
      }
      return a.position.x - b.position.x;
    });

    // Extract data from each node based on its type and current data
    sortedNodes.forEach(node => {
      const nodeData = node.data || {};
      
      switch (node.type) {
        case 'textInput':
          if (nodeData.fieldType === 'projectName' && nodeData.value) {
            generatedData.projectName = String(nodeData.value);
          } else if (nodeData.fieldType === 'scope' && nodeData.value) {
            generatedData.scope = String(nodeData.value);
          } else if (nodeData.fieldType === 'baselines' && nodeData.value) {
            generatedData.baselines = String(nodeData.value);
          }
          break;
          
        case 'table':
          if (nodeData.testCases && Array.isArray(nodeData.testCases)) {
            generatedData.testCases = nodeData.testCases;
          }
          break;
          
        case 'codeSnippet':
          if (nodeData.title && nodeData.content) {
            generatedData.codeSnippets.push({
              nodeId: node.id,
              title: String(nodeData.title || 'Code Snippet'),
              content: String(nodeData.content || ''),
              language: String(nodeData.language || 'javascript')
            });
          }
          break;
          
        case 'linkedStories':
          if (nodeData.changeDescription) {
            generatedData.changeDescription = String(nodeData.changeDescription);
          }
          if (nodeData.linkedStories && Array.isArray(nodeData.linkedStories)) {
            generatedData.linkedStories = nodeData.linkedStories;
          }
          break;
          
        case 'fileUpload':
          if (nodeData.files && Array.isArray(nodeData.files)) {
            const attachments = nodeData.files.map((file: any) => ({
              name: file.name || 'Unknown File',
              url: file.url || '#',
              type: file.type || 'Unknown'
            }));
            generatedData.attachments.push(...attachments);
          }
          break;
      }
    });

    return generatedData;
  };

  // Standard nodes initialization - moved up to avoid "used before declaration" error
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const updateNodeData = useCallback((nodeId: string, field: string, value: any) => {
    if (field === 'value') {
      const node = nodes.find(n => n.id === nodeId);
      const fieldType = node?.data?.fieldType;
      
      if (fieldType === 'projectName') {
        updateReportData({ projectName: value });
      } else if (fieldType === 'scope') {
        updateReportData({ scope: value });
      } else if (fieldType === 'baselines') {
        updateReportData({ baselines: value });
      } else if (fieldType === 'changeDescription') {
        updateReportData({ changeDescription: value });
      } else if (fieldType === 'linkedStories') {
        updateReportData({ linkedStories: value });
      }
    } else if (field === 'label' || field === 'placeholder') {
      // Store label and placeholder in node data for display purposes
    } else if (field === 'content' || field === 'language' || field === 'title') {
      const node = nodes.find(n => n.id === nodeId);
      
      if (node?.type === 'codeSnippet') {
        setReportData(prev => {
          const existingSnippets = prev.codeSnippets || [];
          const snippetIndex = existingSnippets.findIndex(s => s.nodeId === nodeId);
          
          if (snippetIndex >= 0) {
            const updatedSnippets = [...existingSnippets];
            updatedSnippets[snippetIndex] = {
              ...updatedSnippets[snippetIndex],
              [field]: value
            };
            return { ...prev, codeSnippets: updatedSnippets };
          } else {
            const nodeData = node.data || {};
            const newSnippet = {
              nodeId,
              title: field === 'title' ? value : (nodeData.title || 'Code Snippet'),
              content: field === 'content' ? value : (nodeData.content || ''),
              language: field === 'language' ? value : (nodeData.language || 'javascript')
            };
            return { ...prev, codeSnippets: [...existingSnippets, newSnippet] };
          }
        });
      }
    } else if (field === 'testCases') {
      setReportData(prev => ({ ...prev, testCases: value }));
    } else if (field === 'changeDescription') {
      setReportData(prev => ({ ...prev, changeDescription: value }));
    } else if (field === 'linkedStories') {
      setReportData(prev => ({ ...prev, linkedStories: value }));
    } else if (field === 'files') {
      const attachments = value.map((file: any) => ({
        name: file.name || 'Unknown File',
        url: file.url || '#',
        type: file.type || 'Unknown'
      }));
      setReportData(prev => ({ ...prev, attachments }));
    }
  }, [updateReportData, nodes]);

  // Update node data in the state
  const updateNodeInState = useCallback((nodeId: string, field: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, [field]: value } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Update the updateNodeData to use the new function
  React.useEffect(() => {
    const combinedUpdateFunction = (nodeId: string, field: string, value: any) => {
      updateNodeData(nodeId, field, value);
      updateNodeInState(nodeId, field, value);
    };

    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: { ...node.data, updateNodeData: combinedUpdateFunction }
      }))
    );
  }, [nodes.length]);

  // Create node types that use updateNodeData from data prop
  const nodeTypes = {
    textInput: TextInputNode,
    table: TableNode,
    codeSnippet: CodeSnippetNode,
    fileUpload: FileUploadNode,
    sectionHeader: SectionHeaderNode,
    linkedStories: LinkedStoriesNode,
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      console.log('Drop event triggered');

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const fieldType = event.dataTransfer.getData('application/fieldtype');

      console.log('Drop data - type:', type, 'fieldType:', fieldType);

      if (typeof type === 'undefined' || !type) {
        console.log('No valid type found, dropping failed');
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      console.log('Drop position:', position);

      const combinedUpdateFunction = (nodeId: string, field: string, value: any) => {
        updateNodeData(nodeId, field, value);
        updateNodeInState(nodeId, field, value);
      };

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: fieldType ? { 
          label: `${type} Node`,
          placeholder: `Enter ${fieldType}...`,
          fieldType,
          updateNodeData: combinedUpdateFunction
        } : { 
          label: `${type} Node`,
          updateNodeData: combinedUpdateFunction
        },
      };

      console.log('Creating new node:', newNode);
      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        console.log('Total nodes after adding:', newNodes.length);
        return newNodes;
      });
    },
    [setNodes, updateNodeData, updateNodeInState]
  );

  const clearAllData = () => {
    // Reset global data states
    setReportData({
      projectName: '',
      scope: '',
      baselines: '',
      testCases: [],
      changeDescription: '',
      linkedStories: [],
      codeSnippets: [],
      attachments: []
    });
    
    setPreviewData({
      projectName: '',
      scope: '',
      baselines: '',
      testCases: [],
      changeDescription: '',
      linkedStories: [],
      codeSnippets: [],
      attachments: []
    });
    
    // Clear ALL nodes and edges - completely empty canvas
    setNodes([]);
    setEdges([]);
    
    // Reset global ID counter
    globalNodeId = 0;
  };

  // Export/Import functionality
  const { toast } = useToast();

  const exportDesign = () => {
    try {
      const exportData = {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        appInfo: "ReportBuilder",
        reportData: reportData,
        flowData: {
          nodes: nodes,
          edges: edges
        },
        nodeStates: {} // Additional node-specific states if needed
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-report-design-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Design exported successfully",
        description: "Your report design has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export design. Please try again.",
        variant: "destructive",
      });
    }
  };

  const importDesign = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Validate the imported data structure
          if (!importedData.version || !importedData.reportData || !importedData.flowData) {
            throw new Error('Invalid file structure');
          }

          // Confirm before replacing current data
          if (window.confirm('This will replace your current design. Are you sure you want to continue?')) {
            // Restore report data
            setReportData(importedData.reportData);
            setPreviewData(importedData.reportData);
            
            // Restore React Flow nodes and edges
            setNodes(importedData.flowData.nodes || []);
            setEdges(importedData.flowData.edges || []);

            toast({
              title: "Design imported successfully",
              description: `Design from ${importedData.timestamp ? new Date(importedData.timestamp).toLocaleDateString() : 'unknown date'} has been loaded.`,
            });
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid or corrupted JSON file. Please check the file and try again.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-card overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar with component toolbar */}
        <div className="w-80 border-r border-border/50 bg-gradient-to-b from-background via-card/30 to-primary/5 backdrop-blur-xl relative overflow-hidden flex flex-col h-full">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-bounce"></div>
          
          <div className="relative z-10 p-6 border-b border-border/30 bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-sm flex-shrink-0">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent mb-2 animate-fade-in">
              Security Report Builder
            </h2>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              Drag components to build your professional security report
            </p>
            <div className="mt-3 flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
          
          {/* Scrollable component toolbar area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <ComponentToolbar />
          </div>
          
          <div className="relative z-10 p-6 border-t border-border/30 bg-gradient-to-r from-background/50 to-transparent space-y-3 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={exportDesign}
                variant="outline"
                className="bg-gradient-to-r from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 border-green-500/30 hover:border-green-500/50 text-green-600 hover:text-green-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                onClick={importDesign}
                variant="outline"
                className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 border-blue-500/30 hover:border-blue-500/50 text-blue-600 hover:text-blue-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
            </div>
            <Button
              onClick={clearAllData}
              variant="outline"
              className="w-full bg-gradient-to-r from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 border-red-500/30 hover:border-red-500/50 text-red-600 hover:text-red-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              🧹 Clear All Data
            </Button>
            <Button 
              onClick={() => {
                updatePreviewFromBuilder();
                setActiveTab('preview');
              }}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Show Preview
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background/95 to-card/20">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            <div className="border-b border-border/30 bg-gradient-to-r from-background/90 via-card/30 to-background/90 backdrop-blur-sm">
              <TabsList className="h-14 px-6 bg-transparent gap-1">
                <TabsTrigger 
                  value="builder" 
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 font-medium px-6 py-3 rounded-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Report Builder
                </TabsTrigger>
                <TabsTrigger 
                  value="preview"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 font-medium px-6 py-3 rounded-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Preview
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="builder" className="flex-1 m-0 p-0 animate-fade-in">
              <div className="h-full w-full relative" style={{ height: 'calc(100vh - 9rem)' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-gradient-to-br from-background/30 via-card/20 to-primary/5"
                  style={{ width: '100%', height: '100%' }}
                >
                  <Background 
                    gap={24} 
                    size={1.5} 
                    color="hsl(var(--border))" 
                    className="opacity-30" 
                  />
                  <Controls className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg rounded-lg" />
                  <MiniMap 
                    className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg rounded-lg" 
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--background) / 0.9)"
                    style={{ width: 200, height: 150 }}
                  />
                </ReactFlow>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-0 mt-0 h-full">
              <ReportPreview reportData={previewData} />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};