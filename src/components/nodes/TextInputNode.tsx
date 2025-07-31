import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Type } from 'lucide-react';

interface TextInputNodeProps {
  data: {
    label: string;
    value?: string;
    placeholder?: string;
    multiline?: boolean;
  };
  id: string;
  updateNodeData?: (nodeId: string, field: string, value: any) => void;
}

export const TextInputNode = memo<TextInputNodeProps>(({ data, id, updateNodeData }) => {
  const [value, setValue] = useState(data.value || '');
  const [placeholder, setPlaceholder] = useState(data.placeholder || 'Enter text...');
  const [multiline, setMultiline] = useState(data.multiline || false);
  const [label, setLabel] = useState(data.label || 'Text Input');

  const handleValueChange = (newValue: string) => {
    console.log('TextInputNode handleValueChange:', id, newValue);
    setValue(newValue);
    updateNodeData?.(id, 'value', newValue);
  };

  console.log('TextInputNode render:', id, 'updateNodeData:', !!updateNodeData);

  return (
    <Card className="w-80 p-4 bg-gradient-to-br from-card to-accent/30 border-border shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-card" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Type className="h-4 w-4 text-primary" />
        </div>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="text-sm font-semibold border-none p-0 h-auto bg-transparent focus:ring-0 focus:border-transparent"
          placeholder="Field label"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-placeholder`} className="text-xs font-medium text-muted-foreground">
            Placeholder Text
          </Label>
          <Input
            id={`${id}-placeholder`}
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            className="modern-input text-xs"
            placeholder="Enter placeholder..."
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <Label htmlFor={`${id}-multiline`} className="text-xs font-medium">
            Multi-line text
          </Label>
          <Switch
            id={`${id}-multiline`}
            checked={multiline}
            onCheckedChange={setMultiline}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${id}-value`} className="text-xs font-medium text-muted-foreground">
            Content
          </Label>
          {multiline ? (
            <Textarea
              id={`${id}-value`}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={placeholder}
              className="modern-input min-h-20 resize-none"
            />
          ) : (
            <Input
              id={`${id}-value`}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={placeholder}
              className="modern-input"
            />
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-card" />
    </Card>
  );
});