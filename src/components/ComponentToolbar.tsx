import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Type, 
  Table, 
  Code, 
  Upload, 
  Heading,
  FileText
} from 'lucide-react';

const components = [
  {
    type: 'sectionHeader',
    label: 'Section Header',
    icon: Heading,
    description: 'Add section headers and titles'
  },
  {
    type: 'textInput',
    label: 'Text Field',
    icon: Type,
    description: 'Single or multi-line text input'
  },
  {
    type: 'table',
    label: 'Test Cases Table',
    icon: Table,
    description: 'Structured test case data'
  },
  {
    type: 'codeSnippet',
    label: 'Code Snippet',
    icon: Code,
    description: 'HTTP requests/responses'
  },
  {
    type: 'fileUpload',
    label: 'File Upload',
    icon: Upload,
    description: 'Screenshots, PDFs, docs'
  }
];

export const ComponentToolbar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Report Components
      </h3>
      
      {components.map((component) => {
        const Icon = component.icon;
        return (
          <Card
            key={component.type}
            className="p-3 cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors"
            draggable
            onDragStart={(event) => onDragStart(event, component.type)}
          >
            <div className="flex items-start gap-3">
              <Icon className="h-4 w-4 mt-0.5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{component.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {component.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
      
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">
          Quick Templates
        </h4>
        <Card className="p-2 cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 text-primary" />
            <span className="text-xs">Standard Security Report</span>
          </div>
        </Card>
      </div>
    </div>
  );
};