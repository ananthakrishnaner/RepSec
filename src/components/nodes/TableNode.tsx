import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, Plus, Minus } from 'lucide-react';

interface TestCase {
  id: string;
  testCase: string;
  category: string;
  exploited: string;
  url: string;
  evidence: string;
  remediation: string;
  tester: string;
}

interface TableNodeProps {
  data: {
    label: string;
    testCases?: TestCase[];
    updateNodeData?: (nodeId: string, field: string, value: any) => void;
  };
  id: string;
}

export const TableNode = memo<TableNodeProps>(({ data, id }) => {
  const updateNodeData = data.updateNodeData;
  const [testCases, setTestCases] = useState<TestCase[]>(data.testCases || [
    {
      id: '',
      testCase: '',
      category: '',
      exploited: 'No',
      url: '',
      evidence: '',
      remediation: 'Pending',
      tester: ''
    }
  ]);

  const addTestCase = () => {
    const updated = [...testCases, {
      id: '',
      testCase: '',
      category: '',
      exploited: 'No',
      url: '',
      evidence: '',
      remediation: 'Pending',
      tester: ''
    }];
    setTestCases(updated);
    updateNodeData?.(id, 'testCases', updated);
  };

  const removeTestCase = (index: number) => {
    const updatedTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(updatedTestCases);
    updateNodeData?.(id, 'testCases', updatedTestCases);
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
    updateNodeData?.(id, 'testCases', updated);
  };

  return (
    <Card className="w-[800px] p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Test Cases Table</span>
        </div>
        <Button onClick={addTestCase} size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Add Row
        </Button>
      </div>

      <div 
        style={{
          height: '400px',
          width: '750px',
          border: '3px solid #3b82f6',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          overflow: 'scroll',
          overflowX: 'scroll',
          overflowY: 'scroll'
        }}
      >
        <div style={{ minWidth: '1500px', minHeight: '600px', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {testCases.map((testCase, index) => (
              <div key={index} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                backgroundColor: '#ffffff',
                padding: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <Label className="text-xs font-medium">Test Case #{index + 1}</Label>
                  {testCases.length > 1 && (
                    <Button
                      onClick={() => removeTestCase(index)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(8, 1fr)', 
                  gap: '12px',
                  minWidth: '1400px'
                }}>
                  <div>
                    <Label className="text-xs">ID</Label>
                    <Input
                      value={testCase.id}
                      onChange={(e) => updateTestCase(index, 'id', e.target.value)}
                      placeholder="TC-001"
                      className="text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Test Case</Label>
                    <Input
                      value={testCase.testCase}
                      onChange={(e) => updateTestCase(index, 'testCase', e.target.value)}
                      placeholder="SQL Injection Test"
                      className="text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Input
                      value={testCase.category}
                      onChange={(e) => updateTestCase(index, 'category', e.target.value)}
                      placeholder="Injection"
                      className="text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Exploited</Label>
                    <Select value={testCase.exploited} onValueChange={(value) => updateTestCase(index, 'exploited', value)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">URL Reference</Label>
                    <Input
                      value={testCase.url}
                      onChange={(e) => updateTestCase(index, 'url', e.target.value)}
                      placeholder="https://example.com/vuln"
                      className="text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Evidence Path</Label>
                    <Input
                      value={testCase.evidence}
                      onChange={(e) => updateTestCase(index, 'evidence', e.target.value)}
                      placeholder="./evidence/screenshot1.png"
                      className="text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Remediation</Label>
                    <Select value={testCase.remediation} onValueChange={(value) => updateTestCase(index, 'remediation', value)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Won't Fix">Won't Fix</SelectItem>
                        <SelectItem value="Mitigated">Mitigated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Tester Name</Label>
                    <Input
                      value={testCase.tester}
                      onChange={(e) => updateTestCase(index, 'tester', e.target.value)}
                      placeholder="John Doe"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </Card>
  );
});