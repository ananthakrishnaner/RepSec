import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Type, Link } from 'lucide-react';
import { NodeData } from './types';

interface TextInputNodeProps {
  data: NodeData;
  id: string;
}

export const TextInputNode = memo<TextInputNodeProps>(({ data, id }) => {
  const { updateNodeData, fieldType } = data;
  
  const [value, setValue] = useState(data.value || '');
  const [url, setUrl] = useState(data.url || ''); // State for the new URL field
  const [multiline, setMultiline] = useState(data.multiline || false);

  useEffect(() => {
    if (data.value !== value) setValue(data.value || '');
    if (data.url !== url) setUrl(data.url || '');
  }, [data.value, data.url]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    updateNodeData?.(id, 'value', newValue);
  };
  
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    updateNodeData?.(id, 'url', newUrl);
  };

  return (
    <Card className="w-80 p-4 bg-background border-border shadow-md">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center gap-2 mb-3">
        <Type className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{data.label}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${id}-multiline`} className="text-xs">Multi-line</Label>
          <Switch id={`${id}-multiline`} checked={multiline} onCheckedChange={setMultiline} />
        </div>
        
        <div>
          <Label htmlFor={`${id}-value`} className="text-xs">Content</Label>
          {multiline ? (
            <Textarea id={`${id}-value`} value={value} onChange={(e) => handleValueChange(e.target.value)} placeholder={data.placeholder} className="mt-1 min-h-24 nodrag nopan" />
          ) : (
            <Input id={`${id}-value`} value={value} onChange={(e) => handleValueChange(e.target.value)} placeholder={data.placeholder} className="mt-1 nodrag nopan" />
          )}
        </div>

        {/* --- NEW URL FIELD LOGIC --- */}
        {/* This block will only render if the node is a "Baselines" type */}
        {fieldType === 'baselines' && (
          <div>
            <Label htmlFor={`${id}-url`} className="text-xs flex items-center gap-1">
              <Link className="h-3 w-3" />
              Reference URL (Optional)
            </Label>
            <Input
              id={`${id}-url`}
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/baseline-doc"
              className="mt-1 nodrag nopan"
            />
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});