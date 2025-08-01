import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile, NodeData } from './types';

interface FileUploadNodeProps { data: NodeData; id: string; }

export const FileUploadNode = memo<FileUploadNodeProps>(({ data, id }) => {
  const { updateNodeData } = data;
  const [files, setFiles] = useState<UploadedFile[]>(data.files || []);
  const { toast } = useToast();

  useEffect(() => {
    return () => { files.forEach(file => URL.revokeObjectURL(file.previewUrl)); };
  }, [files]);

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({ name: file.name, path: `./evidence/${file.name}`, file: file, previewUrl: URL.createObjectURL(file) }));
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    updateNodeData?.(id, 'files', updatedFiles);
    toast({ title: `${newFiles.length} file(s) prepared for report.` });
  };

  const removeFile = (indexToRemove: number) => {
    URL.revokeObjectURL(files[indexToRemove].previewUrl);
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    updateNodeData?.(id, 'files', updatedFiles);
  };

  return (
    <Card className="w-80 p-4 bg-background border-border">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-3"><Upload className="h-4 w-4 text-primary" /><span className="text-sm font-medium">File Attachments</span></div>
      <div className="space-y-3">
        <Button asChild variant="outline" className="w-full"><label className="cursor-pointer"><Upload className="h-4 w-4 mr-2" />Choose Files (Any Type)<input type="file" multiple onChange={(e) => e.target.files && handleFileSelect(e.target.files)} className="hidden" /></label></Button>
        {files.length > 0 && <div className="space-y-1 max-h-40 overflow-y-auto">{files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
            <FileText className="h-4 w-4 shrink-0" /><span className="truncate font-mono">{file.path}</span>
            <Button onClick={() => removeFile(index)} size="icon" variant="ghost" className="h-6 w-6 ml-auto shrink-0"><X className="h-3 w-3" /></Button>
          </div>
        ))}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});