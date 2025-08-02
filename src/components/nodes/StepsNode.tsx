import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area'; // <-- IMPORT THE SCROLLAREA COMPONENT
import { Plus, Trash2, ArrowUp, ArrowDown, ImageUp, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile, NodeData } from './types';

interface Step {
  id: string;
  text: string;
  image?: UploadedFile;
}

interface StepsNodeProps {
  data: NodeData;
  id: string;
}

const createNewStep = (): Step => ({ id: uuidv4(), text: '', image: undefined });

export const StepsNode = memo<StepsNodeProps>(({ data, id }) => {
  const { updateNodeData, label } = data;
  const { toast } = useToast();
  const [steps, setSteps] = useState<Step[]>(data.steps || [createNewStep()]);

  const syncSteps = (newSteps: Step[]) => {
    setSteps(newSteps);
    updateNodeData?.(id, 'steps', newSteps);
  };

  useEffect(() => {
    return () => {
      steps.forEach(step => {
        if (step.image) URL.revokeObjectURL(step.image.previewUrl);
      });
    };
  }, [steps]);

  const addStep = () => syncSteps([...steps, createNewStep()]);

  const removeStep = (stepId: string) => {
    if (steps.length <= 1) return toast({ title: "Cannot remove the last step.", variant: "destructive" });
    const stepToRemove = steps.find(s => s.id === stepId);
    if (stepToRemove?.image) URL.revokeObjectURL(stepToRemove.image.previewUrl);
    syncSteps(steps.filter(s => s.id !== stepId));
  };

  const updateStepText = (stepId: string, text: string) => {
    syncSteps(steps.map(s => (s.id === stepId ? { ...s, text } : s)));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    syncSteps(newSteps);
  };

  const handleImageUpload = (stepId: string, file: File) => {
    if (!file.type.startsWith('image/')) return toast({ title: "Only image files are allowed.", variant: "destructive" });
    const existingStep = steps.find(s => s.id === stepId);
    if (existingStep?.image) URL.revokeObjectURL(existingStep.image.previewUrl);
    const safeId = (id + stepId).replace(/[^a-zA-Z0-9-]/g, '_');
    const extension = file.name.split('.').pop() || 'png';
    const newFileName = `${safeId}.${extension}`;
    const newPath = `./evidence/${newFileName}`;
    const newImage: UploadedFile = { name: file.name, path: newPath, file: file, previewUrl: URL.createObjectURL(file) };
    syncSteps(steps.map(s => (s.id === stepId ? { ...s, image: newImage } : s)));
    toast({ title: "Screenshot attached to step." });
  };

  const removeImage = (stepId: string) => {
    const existingStep = steps.find(s => s.id === stepId);
    if (existingStep?.image) URL.revokeObjectURL(existingStep.image.previewUrl);
    syncSteps(steps.map(s => (s.id === stepId ? { ...s, image: undefined } : s)));
  };

  return (
    <Card className="w-[500px] p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} />
      <div className="flex justify-between items-center mb-4">
        <Label className="text-lg font-semibold">{label || 'Steps to Reproduce'}</Label>
        <Button onClick={addStep} size="sm"><Plus className="h-4 w-4 mr-2" />Add Step</Button>
      </div>
      
      {/* --- THIS IS THE DEFINITIVE FIX --- */}
      {/* We are now using the <ScrollArea> component which is designed for this */}
      <ScrollArea className="h-[24rem] w-full pr-4"> {/* h-[24rem] is 384px. You can adjust this. */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="p-3 border rounded-lg bg-muted/30 relative">
              <div className="flex items-start gap-3">
                <span className="font-bold text-lg mt-1">#{index + 1}</span>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder={`Describe step ${index + 1}...`}
                    value={step.text}
                    onChange={(e) => updateStepText(step.id, e.target.value)}
                    className="min-h-20"
                  />
                  {step.image ? (
                    <div className="relative w-32 h-20 border rounded-md overflow-hidden">
                      <img src={step.image.previewUrl} alt="Step screenshot" className="w-full h-full object-cover" />
                      <Button onClick={() => removeImage(step.id)} size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6"><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <label className="cursor-pointer"><ImageUp className="h-4 w-4 mr-2" />Attach Screenshot<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(step.id, e.target.files[0])} /></label>
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button onClick={() => moveStep(index, 'up')} size="icon" disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button onClick={() => moveStep(index, 'down')} size="icon" disabled={index === steps.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                  <Button onClick={() => removeStep(step.id)} size="icon" variant="destructive" disabled={steps.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {/* --- END OF FIX --- */}

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});