import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heading } from 'lucide-react';

interface SectionHeaderNodeProps {
  data: {
    label: string;
    title?: string;
    level?: string;
  };
  id: string;
}

export const SectionHeaderNode = memo<SectionHeaderNodeProps>(({ data, id }) => {
  const [title, setTitle] = useState(data.title || 'Section Title');
  const [level, setLevel] = useState(data.level || 'h2');

  const getPreviewStyle = () => {
    switch (level) {
      case 'h1': return 'text-2xl font-bold';
      case 'h2': return 'text-xl font-semibold';
      case 'h3': return 'text-lg font-medium';
      case 'h4': return 'text-base font-medium';
      default: return 'text-xl font-semibold';
    }
  };

  const getMarkdownPrefix = () => {
    switch (level) {
      case 'h1': return '# ';
      case 'h2': return '## ';
      case 'h3': return '### ';
      case 'h4': return '#### ';
      default: return '## ';
    }
  };

  return (
    <Card className="w-80 p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center gap-2 mb-3">
        <Heading className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Section Header</span>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`${id}-level`} className="text-xs">
            Header Level
          </Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1 - Main Title</SelectItem>
              <SelectItem value="h2">H2 - Section</SelectItem>
              <SelectItem value="h3">H3 - Subsection</SelectItem>
              <SelectItem value="h4">H4 - Sub-subsection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`${id}-title`} className="text-xs">
            Title Text
          </Label>
          <Input
            id={`${id}-title`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter section title"
          />
        </div>

        <div className="border-t border-border pt-3">
          <Label className="text-xs">Preview</Label>
          <div className={`mt-1 ${getPreviewStyle()}`}>
            {title}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            {getMarkdownPrefix()}{title}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </Card>
  );
});