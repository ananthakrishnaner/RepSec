import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    console.log('🎯 TextInputNode handleValueChange TRIGGERED:', id, newValue);
    setValue(newValue);
    if (updateNodeData) {
      console.log('✅ Calling updateNodeData:', id, 'value', newValue);
      updateNodeData(id, 'value', newValue);
    } else {
      console.log('❌ updateNodeData is not available!');
    }
  };

  // Test function to bypass React Flow
  const testUpdate = () => {
    console.log('🧪 TEST UPDATE BUTTON CLICKED');
    const testValue = 'Test value ' + Date.now();
    handleValueChange(testValue);
  };

  // Sync with external data changes
  React.useEffect(() => {
    if (data.value !== undefined && data.value !== value) {
      setValue(data.value);
    }
  }, [data.value, value]);

  console.log('📊 TextInputNode render:', id, 'updateNodeData:', !!updateNodeData, 'current value:', value);

  return (
    <Card className="w-80 p-4 bg-gradient-to-br from-card to-accent/30 border-border shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-card" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Type className="h-4 w-4 text-primary" />
        </div>
        <Input
          value={label}
          onChange={(e) => {
            e.stopPropagation();
            setLabel(e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-sm font-semibold border-none p-0 h-auto bg-transparent focus:ring-0 focus:border-transparent nodrag nopan"
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
            onChange={(e) => {
              e.stopPropagation();
              setPlaceholder(e.target.value);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="modern-input text-xs nodrag nopan"
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
          <Button 
            onClick={testUpdate} 
            size="sm" 
            variant="outline" 
            className="w-full mb-2 text-xs"
          >
            🧪 Test Update (Click to test data flow)
          </Button>
          {multiline ? (
            <Textarea
              id={`${id}-value`}
              value={value}
              onChange={(e) => {
                e.stopPropagation(); // Prevent React Flow from intercepting
                console.log('Textarea onChange triggered:', e.target.value);
                handleValueChange(e.target.value);
              }}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag interference
              onKeyDown={(e) => e.stopPropagation()} // Prevent key interference
              placeholder={placeholder}
              className="modern-input min-h-20 resize-none nodrag nopan"
            />
          ) : (
            <Input
              id={`${id}-value`}
              value={value}
              onChange={(e) => {
                e.stopPropagation(); // Prevent React Flow from intercepting
                console.log('Input onChange triggered:', e.target.value);
                handleValueChange(e.target.value);
              }}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag interference
              onKeyDown={(e) => e.stopPropagation()} // Prevent key interference
              placeholder={placeholder}
              className="modern-input nodrag nopan"
            />
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-card" />
    </Card>
  );
});