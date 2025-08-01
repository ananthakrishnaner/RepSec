import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, Plus, X, FileUp, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile, NodeData } from './types';

interface TestCase { id: string; testCase: string; category: string; exploited: string; url: string; evidence: UploadedFile[]; status: string; tester: string; }
interface TableNodeProps { data: NodeData; id: string; }

// --- CHANGE IS HERE ---
// The default status is now "Not Applicable"
const createNewTestCase = (): TestCase => ({ id: '', testCase: '', category: '', exploited: 'No', url: '', evidence: [], status: 'Not Applicable', tester: '' });

export const TableNode = memo<TableNodeProps>(({ data, id }) => {
  const { updateNodeData } = data;
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [testCases, setTestCases] = useState<TestCase[]>(data.testCases || [createNewTestCase()]);

  useEffect(() => {
    return () => { testCases.forEach(tc => tc.evidence.forEach(ev => URL.revokeObjectURL(ev.previewUrl))); };
  }, [testCases]);

  const updateTestCasesState = (newTestCases: TestCase[]) => { setTestCases(newTestCases); updateNodeData?.(id, 'testCases', newTestCases); };
  const addTestCase = () => updateTestCasesState([...testCases, createNewTestCase()]);
  const removeTestCase = (index: number) => {
    if (testCases.length <= 1) return toast({ title: "Cannot remove the last row", variant: "destructive" });
    testCases[index].evidence.forEach(ev => URL.revokeObjectURL(ev.previewUrl));
    updateTestCasesState(testCases.filter((_, i) => i !== index));
  };
  const updateTestCaseField = (index: number, field: keyof TestCase, value: any) => {
    const updated = [...testCases]; updated[index] = { ...updated[index], [field]: value };
    updateTestCasesState(updated);
  };
  const handleEvidenceUpload = (tcIndex: number, files: FileList) => {
    const testCaseId = testCases[tcIndex].id.trim();
    if (!testCaseId) return toast({ title: "Please provide a Test Case ID first.", variant: "destructive" });
    const newEvidence: UploadedFile[] = Array.from(files).filter(f => f.type.startsWith('image/')).map((file, i) => {
      const extension = file.name.split('.').pop() || 'png';
      const safeId = testCaseId.replace(/[^a-zA-Z0-9-]/g, '_');
      const newFileName = `${safeId}-evidence-${testCases[tcIndex].evidence.length + i + 1}.${extension}`;
      const newPath = `./evidence/${newFileName}`;
      return { name: file.name, path: newPath, file: file, previewUrl: URL.createObjectURL(file) };
    });
    if (newEvidence.length > 0) {
      updateTestCaseField(tcIndex, 'evidence', [...testCases[tcIndex].evidence, ...newEvidence]);
      toast({ title: "Evidence prepared and renamed." });
    }
  };
  const removeEvidence = (tcIndex: number, evIndex: number) => {
    URL.revokeObjectURL(testCases[tcIndex].evidence[evIndex].previewUrl);
    updateTestCaseField(tcIndex, 'evidence', testCases[tcIndex].evidence.filter((_, i) => i !== evIndex));
  };
  const scroll = (x: number, y: number) => scrollContainerRef.current?.scrollBy({ left: x, top: y, behavior: 'smooth' });

  return (
    <Card className="w-[800px] max-w-[90vw] p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Table className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Test Cases Table</span></div><Button onClick={addTestCase} size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Add Row</Button></div>
      <div className="flex items-center justify-center gap-4 my-2"><Button onClick={() => scroll(-200, 0)} size="icon" variant="outline"><ChevronLeft className="h-4 w-4" /></Button><div className="flex flex-col gap-1"><Button onClick={() => scroll(0, -150)} size="icon" variant="outline"><ChevronUp className="h-4 w-4" /></Button><Button onClick={() => scroll(0, 150)} size="icon" variant="outline"><ChevronDown className="h-4 w-4" /></Button></div><Button onClick={() => scroll(200, 0)} size="icon" variant="outline"><ChevronRight className="h-4 w-4" /></Button></div>
      <div ref={scrollContainerRef} className="h-[400px] overflow-auto border rounded-lg p-2 bg-muted/20"><div className="space-y-4 min-w-[1400px]">
        {testCases.map((tc, index) => (
          <div key={index} className="p-3 border rounded-lg bg-card">
            <div className="flex justify-between items-center mb-2"><Label className="text-sm font-medium">Test Case #{index + 1}</Label><Button onClick={() => removeTestCase(index)} size="sm" variant="destructive" disabled={testCases.length <= 1}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button></div>
            <div className="grid grid-cols-8 gap-2">
              <div><Label className="text-xs">ID (*Required)</Label><Input value={tc.id} onChange={(e) => updateTestCaseField(index, 'id', e.target.value)} className="text-xs" /></div>
              <div><Label className="text-xs">Test Case</Label><Input value={tc.testCase} onChange={(e) => updateTestCaseField(index, 'testCase', e.target.value)} className="text-xs" /></div>
              <div><Label className="text-xs">Category</Label><Input value={tc.category} onChange={(e) => updateTestCaseField(index, 'category', e.target.value)} className="text-xs" /></div>
              <div><Label className="text-xs">Exploited</Label><Select value={tc.exploited} onValueChange={(v) => updateTestCaseField(index, 'exploited', v)}><SelectTrigger className="text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent></Select></div>
              <div><Label className="text-xs">URL</Label><Input value={tc.url} onChange={(e) => updateTestCaseField(index, 'url', e.target.value)} className="text-xs" /></div>
              <div className="col-span-1"><Label className="text-xs">Evidence</Label><div className="space-y-1 mt-1 max-h-20 overflow-y-auto">{tc.evidence.map((ev, evIndex) => (<div key={evIndex} className="flex items-center justify-between bg-background p-1 rounded text-xs" title={ev.path}><span className="truncate">{ev.name}</span><Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => removeEvidence(index, evIndex)}><X className="h-3 w-3"/></Button></div>))}</div><Button size="sm" variant="outline" className="w-full mt-2 text-xs" disabled={!tc.id.trim()} onClick={() => fileInputRefs.current[index]?.click()}><FileUp className="h-3 w-3 mr-1"/> Upload</Button><input ref={el => fileInputRefs.current[index] = el} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleEvidenceUpload(index, e.target.files)} /></div>
              
              {/* --- CHANGE IS HERE --- */}
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={tc.status} onValueChange={(v) => updateTestCaseField(index, 'status', v)}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Fail">Fail</SelectItem>
                    <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* --- END OF CHANGE --- */}

              <div><Label className="text-xs">Tester</Label><Input value={tc.tester} onChange={(e) => updateTestCaseField(index, 'tester', e.target.value)} className="text-xs" /></div>
            </div>
          </div>
        ))}
      </div></div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});