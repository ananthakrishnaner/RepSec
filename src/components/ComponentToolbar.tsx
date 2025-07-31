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
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
        Report Components
      </h3>
      
      <div className="space-y-3">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <Card
              key={component.type}
              className="component-card p-4 cursor-grab active:cursor-grabbing transform transition-all duration-200 hover:scale-105 group"
              draggable
              onDragStart={(event) => onDragStart(event, component.type)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    {component.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {component.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-accent-foreground rounded-full"></div>
          Quick Templates
        </h4>
        <Card className="component-card p-3 cursor-pointer transform transition-all duration-200 hover:scale-105 group">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-accent/20 rounded group-hover:bg-accent/30 transition-colors duration-200">
              <FileText className="h-3 w-3 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium group-hover:text-primary transition-colors duration-200">
              Standard Security Report
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};