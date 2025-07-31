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
    <div className="p-6 space-y-6">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-3">
        <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse"></div>
        Report Components
        <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent"></div>
      </h3>
      
      <div className="space-y-3">
        {components.map((component, index) => {
          const Icon = component.icon;
          return (
            <Card
              key={component.type}
              className="component-card p-4 cursor-grab active:cursor-grabbing transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group bg-gradient-to-r from-card/80 to-accent/20 border-border/50 backdrop-blur-sm animate-fade-in hover:border-primary/30"
              draggable
              onDragStart={(event) => onDragStart(event, component.type)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Icon className="h-4 w-4 text-primary group-hover:text-primary/90 transition-colors duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {component.label}
                  </p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1 group-hover:text-muted-foreground transition-colors duration-300">
                    {component.description}
                  </p>
                </div>
                <div className="w-2 h-2 bg-primary/30 rounded-full group-hover:bg-primary/60 transition-all duration-300 group-hover:scale-125"></div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};