import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CodeSnippetNodeProps {
  data: {
    label: string;
    title?: string;
    content?: string;
    language?: string;
  };
  id: string;
  updateNodeData?: (nodeId: string, field: string, value: any) => void;
}

const languages = [
  { value: 'http', label: 'HTTP' },
  { value: 'bash', label: 'Bash' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'curl', label: 'cURL' },
];

export const CodeSnippetNode = memo<CodeSnippetNodeProps>(({ data, id, updateNodeData }) => {
  const [title, setTitle] = useState(data.title || 'Code Snippet');
  const [content, setContent] = useState(data.content || '');
  const [language, setLanguage] = useState(data.language || 'http');
  const { toast } = useToast();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateNodeData?.(id, 'content', newContent);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    updateNodeData?.(id, 'language', newLanguage);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNodeData?.(id, 'title', newTitle);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet has been copied to your clipboard.",
    });
  };

  const formatAsHttpRequest = () => {
    const httpTemplate = `POST /api/login HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 45

{
  "username": "admin",
  "password": "password123"
}`;
    handleContentChange(httpTemplate);
    handleLanguageChange('http');
  };

  const formatAsHttpResponse = () => {
    const httpTemplate = `HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 76

{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 123
}`;
    handleContentChange(httpTemplate);
    handleLanguageChange('http');
  };

  return (
    <Card className="w-96 p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center gap-2 mb-3">
        <Code className="h-4 w-4 text-primary" />
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-sm font-medium border-none p-0 h-auto"
          placeholder="Snippet title"
        />
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`${id}-language`} className="text-xs">
            Language
          </Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={formatAsHttpRequest}
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
          >
            HTTP Request
          </Button>
          <Button
            onClick={formatAsHttpResponse}
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
          >
            HTTP Response
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor={`${id}-content`} className="text-xs">
              Code Content
            </Label>
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <Textarea
            id={`${id}-content`}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Paste your HTTP request/response or code here..."
            className="font-mono text-xs min-h-32"
          />
        </div>

        {content && (
          <div className="bg-muted p-3 rounded text-xs">
            <div className="text-muted-foreground mb-1">Preview:</div>
            <pre className="font-mono whitespace-pre-wrap break-all">
              {content.substring(0, 100)}
              {content.length > 100 && '...'}
            </pre>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </Card>
  );
});