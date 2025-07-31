import React, { memo, useState } from 'react';
import { debugLogger } from '../DebugLogger';
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
    fieldType?: string; // Add fieldType to the interface
    updateNodeData?: (nodeId: string, field: string, value: any) => void;
  };
  id: string;
}

export const TextInputNode = memo<TextInputNodeProps>(({ data, id }) => {
  const updateNodeData = data.updateNodeData; // Get from data prop
  const [value, setValue] = useState(data.value || '');
  const [placeholder, setPlaceholder] = useState(data.placeholder || 'Enter text...');
  const [multiline, setMultiline] = useState(data.multiline || false);
  const [label, setLabel] = useState(data.label || 'Text Input');

  const handleValueChange = (newValue: string) => {
    debugLogger.info('TEXT_INPUT', '🔥 VALUE CHANGE TRIGGERED', { 
      nodeId: id, 
      fieldType: data.fieldType, 
      value: newValue,
      previousValue: value,
      hasUpdateNodeData: !!updateNodeData,
      label: data.label
    });
    
    setValue(newValue);
    if (updateNodeData) {
      debugLogger.info('TEXT_INPUT', '📡 CALLING updateNodeData', { 
        nodeId: id, 
        field: 'value', 
        value: newValue, 
        fieldType: data.fieldType 
      });
      updateNodeData(id, 'value', newValue);
      debugLogger.success('TEXT_INPUT', '✅ updateNodeData called successfully');
    } else {
      debugLogger.error('TEXT_INPUT', '❌ updateNodeData NOT AVAILABLE', { 
        nodeId: id, 
        fieldType: data.fieldType,
        dataKeys: Object.keys(data)
      });
    }
  };

  // Sync with external data changes and ensure value persists
  React.useEffect(() => {
    if (data.value !== undefined && data.value !== value) {
      debugLogger.debug('TEXT_INPUT', 'Syncing external data change', { 
        nodeId: id, 
        newValue: data.value, 
        currentValue: value 
      });
      setValue(data.value);
    }
  }, [data.value, value, id]);

  debugLogger.info('TEXT_INPUT', '🎯 COMPONENT RENDER', { 
    nodeId: id, 
    hasUpdateNodeData: !!updateNodeData, 
    currentValue: value, 
    fieldType: data.fieldType, 
    label: data.label,
    placeholder: data.placeholder,
    allDataProps: Object.keys(data)
  });

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
            const newLabel = e.target.value;
            setLabel(newLabel);
            // Also update the report data with the label
            if (updateNodeData) {
              debugLogger.info('TEXT_INPUT', '🏷️ LABEL CHANGED', { nodeId: id, label: newLabel, fieldType: data.fieldType });
              updateNodeData(id, 'label', newLabel);
            }
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
              const newPlaceholder = e.target.value;
              setPlaceholder(newPlaceholder);
              // Also update the report data with the placeholder
              if (updateNodeData) {
                debugLogger.info('TEXT_INPUT', '📝 PLACEHOLDER CHANGED', { nodeId: id, placeholder: newPlaceholder, fieldType: data.fieldType });
                updateNodeData(id, 'placeholder', newPlaceholder);
              }
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
          {multiline ? (
            <Textarea
              id={`${id}-value`}
              value={value}
              onChange={(e) => {
                e.stopPropagation(); 
                const newValue = e.target.value;
                debugLogger.info('TEXT_INPUT', '⌨️  TEXTAREA onChange EVENT', { 
                  nodeId: id, 
                  value: newValue, 
                  fieldType: data.fieldType,
                  event: 'textarea',
                  hasHandler: !!handleValueChange
                });
                handleValueChange(newValue);
              }}
              onFocus={(e) => {
                e.stopPropagation();
                debugLogger.debug('TEXT_INPUT', 'Textarea focused', { nodeId: id });
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className="modern-input min-h-20 resize-none nodrag nopan"
              style={{ pointerEvents: 'auto' }}
            />
          ) : (
            <Input
              id={`${id}-value`}
              value={value}
              onChange={(e) => {
                e.stopPropagation();
                const newValue = e.target.value;
                debugLogger.info('TEXT_INPUT', '⌨️  INPUT onChange EVENT', { 
                  nodeId: id, 
                  value: newValue, 
                  fieldType: data.fieldType,
                  event: 'input',
                  hasHandler: !!handleValueChange
                });
                handleValueChange(newValue);
              }}
              onFocus={(e) => {
                e.stopPropagation();
                debugLogger.debug('TEXT_INPUT', 'Input focused', { nodeId: id });
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className="modern-input nodrag nopan"
              style={{ pointerEvents: 'auto' }}
            />
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-card" />
    </Card>
  );
});