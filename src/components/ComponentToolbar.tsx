import React from 'react';
import { Card } from '@/components/ui/card';
import { Type, Table, Code, Upload, Heading, Link, ListOrdered, Bot } from 'lucide-react';

const components = [
  { type: 'sectionHeader', label: 'Section Header', icon: Heading, description: 'Add section headers and titles' },
  { type: 'textInput', label: 'Project Name', icon: Type, description: 'Add the main project title', fieldType: 'projectName' },
  { type: 'textInput', label: 'Scope Field', icon: Type, description: 'Define the scope of work', fieldType: 'scope' },
  { type: 'textInput', label: 'Baselines', icon: Type, description: 'Add baseline information', fieldType: 'baselines' },
  { type: 'linkedStories', label: 'Linked Stories (Jira)', icon: Link, description: 'Link to Jira tickets or stories' },
  { type: 'table', label: 'Test Cases Table', icon: Table, description: 'A detailed table for test cases' },
  { type: 'aiGenerator', label: 'AI Test Case Generator', icon: Bot, description: 'Use AI to populate a Test Case Table' },
  { type: 'codeSnippet', label: 'Code Snippet', icon: Code, description: 'For HTTP requests or code blocks' },
  { type: 'fileUpload', label: 'File Upload', icon: Upload, description: 'Attach images or documents' },
  { type: 'steps', label: 'Steps to Reproduce', icon: ListOrdered, description: 'Create a numbered list of steps' }
];

export const ComponentToolbar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, fieldType?: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (fieldType) { event.dataTransfer.setData('application/fieldtype', fieldType); }
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Report Components</h3>
      {components.map((component) => {
        const Icon = component.icon;
        return (
          <Card key={`${component.type}-${component.fieldType || component.label}`} className="p-3 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-primary/30 transition-all group" draggable onDragStart={(event) => onDragStart(event, component.type, component.fieldType)}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 transition-colors"><Icon className={`h-5 w-5 ${component.type === 'aiGenerator' ? 'text-purple-500' : 'text-primary'}`} /></div>
              <div><p className={`font-semibold text-sm group-hover:text-primary ${component.type === 'aiGenerator' && 'text-purple-400'}`}>{component.label}</p><p className="text-xs text-muted-foreground">{component.description}</p></div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};