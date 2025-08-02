import React, { memo, useState } from 'react';
import { Handle, Position, NodeResizer, NodeProps, useReactFlow } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NodeData, TestCase } from './types';
import { generateComprehensiveTestPlan } from '@/lib/gemini';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const AIGeneratorNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const { getEdges, setNodes } = useReactFlow();
  const { toast } = useToast();

  const [scope, setScope] = useState('');
  const [intensity, setIntensity] = useState<'focused' | 'comprehensive'>('focused');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setError("API Key is not set in Settings.");
      setIsLoading(false);
      return toast({ title: "API Key Missing", description: "Add your Gemini API Key in the Settings panel (cog icon).", variant: "destructive" });
    }

    const targetEdge = getEdges().find(edge => edge.source === id);
    if (!targetEdge) {
      setError("Connect this node to a Test Case Table.");
      setIsLoading(false);
      return toast({ title: "No Target Table", description: "Connect this AI node to a Test Case Table to populate it.", variant: "destructive" });
    }
    
    const targetTableId = targetEdge.target;

    try {
      const newTestCases = await generateComprehensiveTestPlan(apiKey, scope, intensity);

      if (!Array.isArray(newTestCases)) { throw new Error("AI response was not a valid list."); }
      
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === targetTableId && node.type === 'table') {
            const existingCases: TestCase[] = Array.isArray(node.data.testCases) ? node.data.testCases : [];
            const processedNewCases = newTestCases.map(tc => ({ ...tc, evidence: [] }));
            return { ...node, data: { ...node.data, testCases: [...existingCases, ...processedNewCases] } };
          }
          return node;
        })
      );
      
      toast({ title: "Success!", description: `${newTestCases.length} diverse test cases have been added to the target table.` });
      
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full p-0 bg-background border-border flex flex-col shadow-lg border-2 border-purple-500/50">
      <NodeResizer minWidth={380} minHeight={380} isVisible={selected} />
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <CardHeader className="flex-shrink-0 flex-row items-center space-x-2 bg-purple-500/10 p-3">
        <Bot className="h-6 w-6 text-purple-500" />
        <CardTitle className="text-base text-purple-400">{data.label || 'AI Test Plan Generator'}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3 flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col">
          <Label htmlFor={`${id}-scope`}>Scope & Target Description</Label>
          <Textarea 
            id={`${id}-scope`} 
            value={scope} 
            onChange={(e) => setScope(e.target.value)} 
            placeholder="Be descriptive! For example: 'A NodeJS user profile API at /api/users/{id} that allows image uploads. The API uses a PostgreSQL database.'" 
            className="flex-1 text-xs nodrag nopan"
          />
        </div>
        
        <div className="space-y-2">
            <Label>Generation Intensity</Label>
            <RadioGroup defaultValue="focused" value={intensity} onValueChange={(val: 'focused' | 'comprehensive') => setIntensity(val)} className="flex items-center space-x-4 nodrag nopan">
                <div className="flex items-center space-x-2"><RadioGroupItem value="focused" id={`${id}-r1`} /><Label htmlFor={`${id}-r1`} className="text-xs">Focused</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="comprehensive" id={`${id}-r2`} /><Label htmlFor={`${id}-r2`} className="text-xs">Comprehensive</Label></div>
            </RadioGroup>
        </div>

        <Button onClick={handleGenerate} disabled={isLoading || !scope} className="w-full bg-purple-600 hover:bg-purple-700">
          {isLoading ? ( <Loader2 className="h-4 w-4 mr-2 animate-spin" /> ) : ( <Zap className="h-4 w-4 mr-2" /> )}
          Generate Test Plan
        </Button>
        {error && <p className="text-xs text-red-500 text-center p-1 bg-red-500/10 rounded">{error}</p>}
      </CardContent>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});