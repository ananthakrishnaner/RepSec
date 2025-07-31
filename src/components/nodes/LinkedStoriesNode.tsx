import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, Plus, Minus, ExternalLink } from 'lucide-react';

interface LinkedStory {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface LinkedStoriesNodeProps {
  data: {
    label: string;
    changeDescription?: string;
    linkedStories?: LinkedStory[];
    updateNodeData?: (nodeId: string, field: string, value: any) => void;
  };
  id: string;
}

export const LinkedStoriesNode = memo<LinkedStoriesNodeProps>(({ data, id }) => {
  const updateNodeData = data.updateNodeData;
  const [changeDescription, setChangeDescription] = useState(data.changeDescription || '');
  const [linkedStories, setLinkedStories] = useState<LinkedStory[]>(data.linkedStories || []);

  const addLinkedStory = () => {
    const updated = [...linkedStories, {
      id: '',
      title: '',
      url: '',
      description: ''
    }];
    setLinkedStories(updated);
    updateNodeData?.(id, 'linkedStories', updated);
  };

  const removeLinkedStory = (index: number) => {
    const updated = linkedStories.filter((_, i) => i !== index);
    setLinkedStories(updated);
    updateNodeData?.(id, 'linkedStories', updated);
  };

  const updateLinkedStory = (index: number, field: keyof LinkedStory, value: string) => {
    const updated = [...linkedStories];
    updated[index] = { ...updated[index], [field]: value };
    setLinkedStories(updated);
    updateNodeData?.(id, 'linkedStories', updated);
  };

  const updateChangeDescription = (value: string) => {
    setChangeDescription(value);
    updateNodeData?.(id, 'changeDescription', value);
  };

  return (
    <Card className="w-[600px] p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center gap-2 mb-4">
        <Link className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Change Description & Linked Stories</span>
      </div>

      {/* Change Description */}
      <div className="mb-6">
        <Label className="text-xs font-medium mb-2 block">Change Description</Label>
        <Textarea
          value={changeDescription}
          onChange={(e) => updateChangeDescription(e.target.value)}
          placeholder="Describe the changes made during this security review..."
          className="text-xs min-h-[80px]"
        />
      </div>

      {/* Linked Stories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Linked Stories</Label>
          <Button onClick={addLinkedStory} size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            Add Story
          </Button>
        </div>

        {linkedStories.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-visible">
            {linkedStories.map((story, index) => (
              <div key={index} className="p-3 border border-border rounded bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium">Story #{index + 1}</Label>
                  <Button
                    onClick={() => removeLinkedStory(index)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label className="text-xs">Story ID</Label>
                    <Input
                      value={story.id}
                      onChange={(e) => updateLinkedStory(index, 'id', e.target.value)}
                      placeholder="JIRA-123"
                      className="text-xs"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={story.title}
                      onChange={(e) => updateLinkedStory(index, 'title', e.target.value)}
                      placeholder="Security fix for authentication"
                      className="text-xs"
                    />
                  </div>
                </div>
                
                <div className="mb-2">
                  <Label className="text-xs">URL</Label>
                  <div className="flex gap-1">
                    <Input
                      value={story.url}
                      onChange={(e) => updateLinkedStory(index, 'url', e.target.value)}
                      placeholder="https://jira.company.com/browse/JIRA-123"
                      className="text-xs"
                    />
                    {story.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-2"
                        onClick={() => window.open(story.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={story.description}
                    onChange={(e) => updateLinkedStory(index, 'description', e.target.value)}
                    placeholder="Brief description of the story..."
                    className="text-xs min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {linkedStories.length === 0 && (
          <div className="text-center text-muted-foreground py-4 border border-dashed border-border rounded">
            <p className="text-xs">No linked stories added yet</p>
            <p className="text-xs">Click "Add Story" to link related tickets or stories</p>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </Card>
  );
});