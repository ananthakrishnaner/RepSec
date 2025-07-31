import React, { memo, useState, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Image, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUpload {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface FileUploadNodeProps {
  data: {
    label: string;
    files?: FileUpload[];
    allowedTypes?: string[];
    updateNodeData?: (nodeId: string, field: string, value: any) => void;
  };
  id: string;
}

export const FileUploadNode = memo<FileUploadNodeProps>(({ data, id }) => {
  const updateNodeData = data.updateNodeData;
  const [files, setFiles] = useState<FileUpload[]>(data.files || []);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedTypes = data.allowedTypes || [
    'image/png',
    'image/jpeg',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: FileUpload[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "File type not allowed",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      
      newFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        url: url,
      });
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    updateNodeData?.(id, 'files', updatedFiles);
    
    if (newFiles.length > 0) {
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) successfully uploaded.`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.url); // Clean up object URL
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    updateNodeData?.(id, 'files', updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Card className="w-80 p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      
      <div className="flex items-center gap-2 mb-3">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">File Attachments</span>
      </div>

      <div className="space-y-3">
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-2">
            Drag files here or click to browse
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Supported: Images, PDFs, Word docs (max 10MB each)
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Uploaded Files ({files.length})</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-muted rounded text-xs"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeFile(index)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </Card>
  );
});