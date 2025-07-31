import React, { useState, useCallback } from 'react';
import { debugLogger, DebugLogViewer } from './DebugLogger';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportPreview } from './ReportPreview';

import { ComponentToolbar } from './ComponentToolbar';
import { TextInputNode } from './nodes/TextInputNode';
import { TableNode } from './nodes/TableNode';
import { CodeSnippetNode } from './nodes/CodeSnippetNode';
import { FileUploadNode } from './nodes/FileUploadNode';
import { SectionHeaderNode } from './nodes/SectionHeaderNode';
import { LinkedStoriesNode } from './nodes/LinkedStoriesNode';
import { initialNodes, initialEdges } from './initialElements';

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
  
  // Add tab change logging
  const handleTabChange = (newTab: string) => {
    debugLogger.info('TAB_CHANGE', `Switching from ${activeTab} to ${newTab}`, { from: activeTab, to: newTab });
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
    debugLogger.info('REPORT_DATA', 'updateReportData called', updates);
    setReportData((prev) => {
      debugLogger.debug('REPORT_DATA', 'Previous state', prev);
      const newData = { ...prev, ...updates };
      debugLogger.success('REPORT_DATA', 'New state set', newData);
      return newData;
    });
  }, []);

  // Function to collect data from nodes and update preview
  const updatePreviewFromBuilder = () => {
    debugLogger.info('PREVIEW_UPDATE', 'Show Preview clicked - collecting builder data');
    debugLogger.debug('PREVIEW_UPDATE', 'Current reportData before copy', reportData);
    
    const hasAnyData = Object.values(reportData).some(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
    
    debugLogger.info('PREVIEW_UPDATE', `Builder has data: ${hasAnyData}`, { 
      projectName: reportData.projectName || '(empty)',
      scope: reportData.scope || '(empty)',
      hasContent: hasAnyData 
    });
    
    setPreviewData({ ...reportData });
    debugLogger.success('PREVIEW_UPDATE', 'Preview data state updated', reportData);
  };

  // Standard nodes initialization - moved up to avoid "used before declaration" error
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const updateNodeData = useCallback((nodeId: string, field: string, value: any) => {
    debugLogger.info('NODE_UPDATE', 'updateNodeData called', { nodeId, field, value });
    
    if (field === 'value') {
      const node = nodes.find(n => n.id === nodeId);
      const fieldType = node?.data?.fieldType;
      
      debugLogger.debug('NODE_UPDATE', 'Field mapping lookup', { 
        nodeId, 
        fieldType, 
        nodeFound: !!node,
        allNodes: nodes.map(n => ({ id: n.id, fieldType: n.data?.fieldType }))
      });
      
      if (fieldType === 'projectName') {
        debugLogger.success('NODE_UPDATE', 'Mapping to PROJECT NAME', { value });
        updateReportData({ projectName: value });
      } else if (fieldType === 'scope') {
        debugLogger.success('NODE_UPDATE', 'Mapping to SCOPE', { value });
        updateReportData({ scope: value });
      } else if (fieldType === 'baselines') {
        debugLogger.success('NODE_UPDATE', 'Mapping to BASELINES', { value });
        updateReportData({ baselines: value });
      } else if (fieldType === 'changeDescription') {
        debugLogger.success('NODE_UPDATE', 'Mapping to CHANGE DESCRIPTION', { value });
        updateReportData({ changeDescription: value });
      } else if (fieldType === 'linkedStories') {
        debugLogger.success('NODE_UPDATE', 'Mapping to LINKED STORIES', { value });
        updateReportData({ linkedStories: value });
      } else {
        debugLogger.error('NODE_UPDATE', 'UNKNOWN FIELD TYPE - NO MAPPING', { 
          nodeId, 
          fieldType, 
          value,
          availableFieldTypes: nodes.map(n => n.data?.fieldType).filter(Boolean)
        });
      }
    } else if (field === 'label' || field === 'placeholder') {
      // Store label and placeholder in node data for display purposes
      debugLogger.info('NODE_UPDATE', `Storing ${field} in node data`, { nodeId, field, value });
    } else if (field === 'content' || field === 'title' || field === 'language') {
      // Handle code snippet fields
      const node = nodes.find(n => n.id === nodeId);
      debugLogger.info('NODE_UPDATE', 'Processing code snippet field', { nodeId, field, value, nodeType: node?.type });
      
      if (node?.type === 'codeSnippet') {
        setReportData(prev => {
          const existingSnippets = prev.codeSnippets || [];
          const snippetIndex = existingSnippets.findIndex(s => s.nodeId === nodeId);
          
          if (snippetIndex >= 0) {
            // Update existing snippet
            const updatedSnippets = [...existingSnippets];
            updatedSnippets[snippetIndex] = {
              ...updatedSnippets[snippetIndex],
              [field]: value
            };
            return { ...prev, codeSnippets: updatedSnippets };
          } else {
            // Create new snippet
            const newSnippet = {
              nodeId,
              title: field === 'title' ? value : 'Code Snippet',
              content: field === 'content' ? value : '',
              language: field === 'language' ? value : 'http'
            };
            return { ...prev, codeSnippets: [...existingSnippets, newSnippet] };
          }
        });
        debugLogger.success('NODE_UPDATE', 'Code snippet updated', { nodeId, field, value });
      }
    } else if (field === 'testCases') {
      // Handle table node test cases
      debugLogger.info('NODE_UPDATE', 'Processing test cases', { nodeId, field, value });
      setReportData(prev => ({ ...prev, testCases: value }));
      debugLogger.success('NODE_UPDATE', 'Test cases updated', { nodeId, count: value?.length });
    } else if (field === 'changeDescription') {
      // Handle change description
      debugLogger.info('NODE_UPDATE', 'Processing change description', { nodeId, field, value });
      setReportData(prev => ({ ...prev, changeDescription: value }));
      debugLogger.success('NODE_UPDATE', 'Change description updated', { nodeId });
    } else if (field === 'linkedStories') {
      // Handle linked stories
      debugLogger.info('NODE_UPDATE', 'Processing linked stories', { nodeId, field, value });
      setReportData(prev => ({ ...prev, linkedStories: value }));
      debugLogger.success('NODE_UPDATE', 'Linked stories updated', { nodeId, count: value?.length });
    } else if (field === 'files') {
      // Handle file upload attachments
      debugLogger.info('NODE_UPDATE', 'Processing file attachments', { nodeId, field, value });
      const attachments = value?.map((file: any) => ({
        name: file.name,
        url: file.url,
        type: file.type
      })) || [];
      setReportData(prev => ({ ...prev, attachments }));
      debugLogger.success('NODE_UPDATE', 'Attachments updated', { nodeId, count: attachments.length });
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
    debugLogger.debug('NODE_SETUP', 'Setting up node update functions', { nodeCount: nodes.length });
    
    const combinedUpdateFunction = (nodeId: string, field: string, value: any) => {
      debugLogger.debug('NODE_SETUP', 'Combined update function called', { nodeId, field, value });
      updateNodeData(nodeId, field, value);
      updateNodeInState(nodeId, field, value);
    };

    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: { ...node.data, updateNodeData: combinedUpdateFunction }
      }))
    );
    
    debugLogger.success('NODE_SETUP', 'All nodes updated with update functions');
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

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const fieldType = event.dataTransfer.getData('application/fieldtype');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: fieldType ? `${fieldType} Field` : `${type} node`,
          fieldType: fieldType,
          updateNodeData: (nodeId: string, field: string, value: any) => {
            updateNodeData(nodeId, field, value);
            updateNodeInState(nodeId, field, value);
          }
        },
      };

      debugLogger.success('NODE_CREATE', 'New node created', { 
        nodeId: newNode.id, 
        type, 
        fieldType, 
        label: newNode.data.label 
      });
      
      setNodes((nds) => [...nds, newNode as any]);
    },
    [setNodes, updateNodeData, updateNodeInState]
  );

  // Clear all data function
  const clearAllData = () => {
    debugLogger.warn('CLEAR_DATA', 'Clearing all application data');
    
    const emptyData = {
      projectName: '',
      scope: '',
      baselines: '',
      testCases: [],
      changeDescription: '',
      linkedStories: [],
      codeSnippets: [],
      attachments: [],
    };
    
    setReportData(emptyData);
    setPreviewData(emptyData);
    setNodes([]);
    setEdges([]);
    setActiveTab('builder');
    
    debugLogger.success('CLEAR_DATA', 'All data cleared successfully');
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
            <DebugLogViewer />
            <Button
              onClick={clearAllData}
              variant="outline"
              className="w-full bg-gradient-to-r from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 border-red-500/30 hover:border-red-500/50 text-red-600 hover:text-red-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              🧹 Clear All Data
            </Button>
            <Button 
              onClick={() => {
                debugLogger.info('PREVIEW_BUTTON', 'Show Preview button clicked');
                updatePreviewFromBuilder();
                setTimeout(() => {
                  debugLogger.info('PREVIEW_BUTTON', 'Switching to preview tab');
                  handleTabChange('preview');
                }, 100);
              }}
              variant="outline"
              className="w-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 text-primary hover:text-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
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
            
            <TabsContent value="preview" className="flex-1 m-0 p-0 animate-fade-in">
              {(() => {
                debugLogger.debug('PREVIEW_RENDER', 'Rendering preview tab with data', previewData);
                return null;
              })()}
              <ReportPreview reportData={previewData} />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};
