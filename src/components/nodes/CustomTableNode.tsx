import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizer, NodeProps, Node, useReactFlow } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, Plus, Trash2, Settings2, ChevronLeft, ChevronRight, FileUp, X, FileText, Image as ImageIcon, File, ChevronDown, ChevronUp } from 'lucide-react';
import { NodeData, UploadedFile } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface CustomTableData extends NodeData {
  rows?: number;
  cols?: number;
  headers?: string[];
  cellData?: string[][];
  cellFileEnabled?: boolean[][]; // Which cells have file upload enabled
  fileData?: UploadedFile[][][]; // [row][col][files]
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return ImageIcon;
  if (['pdf'].includes(ext || '')) return FileText;
  if (['csv', 'xlsx', 'xls'].includes(ext || '')) return FileText;
  if (['doc', 'docx'].includes(ext || '')) return FileText;
  return File;
};

export const CustomTableNode = memo(({ data, id, selected }: NodeProps<Node<CustomTableData>>) => {
  const { updateNodeData } = data;
  const { toast } = useToast();
  const { deleteElements } = useReactFlow();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const [rows, setRows] = useState(data.rows || 3);
  const [cols, setCols] = useState(data.cols || 3);
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});
  const [headers, setHeaders] = useState<string[]>(data.headers || Array(data.cols || 3).fill(''));
  const [cellData, setCellData] = useState<string[][]>(
    data.cellData || Array(data.rows || 3).fill(null).map(() => Array(data.cols || 3).fill(''))
  );
  const [cellFileEnabled, setCellFileEnabled] = useState<boolean[][]>(
    data.cellFileEnabled || Array(data.rows || 3).fill(null).map(() => Array(data.cols || 3).fill(false))
  );
  const [fileData, setFileData] = useState<UploadedFile[][][]>(
    data.fileData || Array(data.rows || 3).fill(null).map(() => Array(data.cols || 3).fill(null).map(() => []))
  );

  useEffect(() => {
    updateNodeData?.(id, 'rows', rows);
    updateNodeData?.(id, 'cols', cols);
    updateNodeData?.(id, 'headers', headers);
    updateNodeData?.(id, 'cellData', cellData);
    updateNodeData?.(id, 'cellFileEnabled', cellFileEnabled);
    updateNodeData?.(id, 'fileData', fileData);
  }, [rows, cols, headers, cellData, cellFileEnabled, fileData, id, updateNodeData]);

  const updateDimensions = (newRows: number, newCols: number) => {
    // Adjust headers
    const newHeaders = [...headers];
    if (newCols > cols) {
      newHeaders.push(...Array(newCols - cols).fill(''));
    } else if (newCols < cols) {
      newHeaders.splice(newCols);
    }
    setHeaders(newHeaders);

    // Adjust cell data
    const newCellData = [...cellData];
    
    // Adjust rows
    if (newRows > rows) {
      newCellData.push(...Array(newRows - rows).fill(null).map(() => Array(newCols).fill('')));
    } else if (newRows < rows) {
      newCellData.splice(newRows);
    }
    
    // Adjust columns in each row
    newCellData.forEach((row, i) => {
      if (newCols > cols) {
        newCellData[i] = [...row, ...Array(newCols - cols).fill('')];
      } else if (newCols < cols) {
        newCellData[i] = row.slice(0, newCols);
      }
    });

    // Adjust file data
    const newFileData = [...fileData];
    if (newRows > rows) {
      newFileData.push(...Array(newRows - rows).fill(null).map(() => Array(newCols).fill(null).map(() => [])));
    } else if (newRows < rows) {
      newFileData.splice(newRows);
    }
    
    newFileData.forEach((row, i) => {
      if (newCols > cols) {
        newFileData[i] = [...row, ...Array(newCols - cols).fill(null).map(() => [])];
      } else if (newCols < cols) {
        newFileData[i] = row.slice(0, newCols);
      }
    });

    // Adjust cellFileEnabled
    const newCellFileEnabled = [...cellFileEnabled];
    if (newRows > rows) {
      newCellFileEnabled.push(...Array(newRows - rows).fill(null).map(() => Array(newCols).fill(false)));
    } else if (newRows < rows) {
      newCellFileEnabled.splice(newRows);
    }
    
    newCellFileEnabled.forEach((row, i) => {
      if (newCols > cols) {
        newCellFileEnabled[i] = [...row, ...Array(newCols - cols).fill(false)];
      } else if (newCols < cols) {
        newCellFileEnabled[i] = row.slice(0, newCols);
      }
    });

    setFileData(newFileData);
    setCellFileEnabled(newCellFileEnabled);
    setCellData(newCellData);
    setRows(newRows);
    setCols(newCols);
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newCellData = [...cellData];
    newCellData[rowIndex][colIndex] = value;
    setCellData(newCellData);
  };

  const addRow = () => {
    setCellData([...cellData, Array(cols).fill('')]);
    setFileData([...fileData, Array(cols).fill(null).map(() => [])]);
    setCellFileEnabled([...cellFileEnabled, Array(cols).fill(false)]);
    setRows(rows + 1);
  };

  const addColumn = () => {
    setHeaders([...headers, '']);
    setCellData(cellData.map(row => [...row, '']));
    setFileData(fileData.map(row => [...row, []]));
    setCellFileEnabled(cellFileEnabled.map(row => [...row, false]));
    setCols(cols + 1);
  };

  const removeRow = (rowIndex: number) => {
    if (rows <= 1) return;
    const newCellData = cellData.filter((_, i) => i !== rowIndex);
    const newFileData = fileData.filter((_, i) => i !== rowIndex);
    const newCellFileEnabled = cellFileEnabled.filter((_, i) => i !== rowIndex);
    setCellData(newCellData);
    setFileData(newFileData);
    setCellFileEnabled(newCellFileEnabled);
    setRows(rows - 1);
  };

  const removeColumn = (colIndex: number) => {
    if (cols <= 1) return;
    setHeaders(headers.filter((_, i) => i !== colIndex));
    setCellData(cellData.map(row => row.filter((_, i) => i !== colIndex)));
    setFileData(fileData.map(row => row.filter((_, i) => i !== colIndex)));
    setCellFileEnabled(cellFileEnabled.map(row => row.filter((_, i) => i !== colIndex)));
    setCols(cols - 1);
  };

  const handleFileUpload = (rowIndex: number, colIndex: number, files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const extension = file.name.split('.').pop() || 'file';
      const newFileName = `custom-table-r${rowIndex}-c${colIndex}-${Date.now()}.${extension}`;
      const newPath = `./evidence/${newFileName}`;
      return { name: file.name, path: newPath, file, previewUrl: URL.createObjectURL(file) };
    });

    const newFileData = [...fileData];
    newFileData[rowIndex][colIndex] = [...newFileData[rowIndex][colIndex], ...newFiles];
    setFileData(newFileData);
    toast({ title: `${newFiles.length} file(s) uploaded` });
  };

  const removeFile = (rowIndex: number, colIndex: number, fileIndex: number) => {
    const newFileData = [...fileData];
    URL.revokeObjectURL(newFileData[rowIndex][colIndex][fileIndex].previewUrl);
    newFileData[rowIndex][colIndex] = newFileData[rowIndex][colIndex].filter((_, i) => i !== fileIndex);
    setFileData(newFileData);
  };

  const handlePasteImage = (rowIndex: number, colIndex: number, e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const blob = items[i].getAsFile();
        if (blob) {
          const ext = items[i].type.split('/')[1] || 'png';
          imageFiles.push(new window.File([blob], `pasted-${Date.now()}-${i}.${ext}`, { type: items[i].type }));
        }
      }
    }
    if (imageFiles.length === 0) return;
    e.preventDefault();
    const dt = new DataTransfer();
    imageFiles.forEach(f => dt.items.add(f));
    handleFileUpload(rowIndex, colIndex, dt.files);
  };

  const isImage = (name: string) => /\.(jpe?g|png|gif|webp|svg)$/i.test(name);

  const toggleCellFileUpload = (rowIndex: number, colIndex: number) => {
    const newCellFileEnabled = [...cellFileEnabled];
    newCellFileEnabled[rowIndex][colIndex] = !newCellFileEnabled[rowIndex][colIndex];
    setCellFileEnabled(newCellFileEnabled);
  };

  const handleDelete = () => deleteElements({ nodes: [{ id }] });


  const scroll = (x: number) => scrollContainerRef.current?.scrollBy({ left: x, behavior: 'smooth' });

  return (
    <Card className="w-full h-full p-4 bg-background border-border flex flex-col relative">
      <NodeResizer minWidth={500} minHeight={300} isVisible={selected} />
      <Handle type="target" position={Position.Top} />
      <Button
        onClick={handleDelete}
        size="icon"
        variant="destructive"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10"
      >
        <X className="h-3 w-3" />
      </Button>
      
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Custom Table</span>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings2 className="h-3 w-3 mr-1" /> Configure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Table Dimensions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rows</Label>
                  <Input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={(e) => {
                      const newRows = Math.max(1, parseInt(e.target.value) || 1);
                      updateDimensions(newRows, cols);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Columns</Label>
                  <Input
                    type="number"
                    min="1"
                    value={cols}
                    onChange={(e) => {
                      const newCols = Math.max(1, parseInt(e.target.value) || 1);
                      updateDimensions(rows, newCols);
                    }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={addRow} size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" /> Row
          </Button>
          <Button onClick={addColumn} size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" /> Col
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-2 shrink-0">
        <Button onClick={() => scroll(-200)} size="icon" variant="outline">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button onClick={() => scroll(200)} size="icon" variant="outline">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-auto border rounded-lg p-2 bg-muted/20">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              {headers.map((header, colIndex) => (
                <th key={colIndex} className="border border-border p-1 bg-card">
                  <div className="flex items-center gap-1">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(colIndex, e.target.value)}
                      placeholder={`Column ${colIndex + 1}`}
                      className="text-xs font-semibold nodrag nopan h-7"
                    />
                    {cols > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeColumn(colIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cellData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-border p-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Switch
                            checked={cellFileEnabled[rowIndex][colIndex]}
                            onCheckedChange={() => toggleCellFileUpload(rowIndex, colIndex)}
                            className="scale-75"
                          />
                          <FileUp className="h-3 w-3" />
                        </Label>
                      </div>
                      {cellFileEnabled[rowIndex][colIndex] ? (
                        (() => {
                          const cellKey = `${rowIndex}-${colIndex}`;
                          const expanded = expandedCells[cellKey] ?? true;
                          const files = fileData[rowIndex][colIndex];
                          return (
                            <div className="space-y-1">
                              {files.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-full h-6 text-xs justify-between nodrag nopan"
                                  onClick={() => setExpandedCells(prev => ({ ...prev, [cellKey]: !expanded }))}
                                >
                                  <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
                                  {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </Button>
                              )}
                              {expanded && (
                                <div className={`space-y-2 ${files.length > 3 ? 'max-h-80 overflow-y-auto' : ''}`}>
                                  {files.map((file, fileIndex) => {
                                    const FileIcon = getFileIcon(file.name);
                                    return (
                                      <div key={fileIndex} className="space-y-1">
                                        <div className="flex items-center justify-between bg-background p-1 rounded text-xs">
                                          <div className="flex items-center gap-1 truncate">
                                            <FileIcon className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                          </div>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5 shrink-0"
                                            onClick={() => removeFile(rowIndex, colIndex, fileIndex)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        {isImage(file.name) && (
                                          <img src={file.previewUrl} alt={file.name} className="max-w-full h-auto rounded border" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs nodrag nopan h-6"
                                onClick={() => fileInputRefs.current[cellKey]?.click()}
                              >
                                <FileUp className="h-3 w-3 mr-1" /> Upload Files
                              </Button>
                              <div
                                tabIndex={0}
                                onPaste={(e) => handlePasteImage(rowIndex, colIndex, e)}
                                className="w-full border border-dashed rounded text-[10px] text-muted-foreground text-center py-1 nodrag nopan focus:outline-none focus:ring-2 focus:ring-primary cursor-text"
                                title="Click then Ctrl+V to paste image"
                              >
                                Paste Image (Ctrl+V)
                              </div>
                              <input
                                ref={el => fileInputRefs.current[cellKey] = el}
                                type="file"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.csv,.xlsx,.xls"
                                className="hidden"
                                onChange={(e) => e.target.files && handleFileUpload(rowIndex, colIndex, e.target.files)}
                              />
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex items-center gap-1">
                          <Input
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            onPaste={(e) => handlePasteImage(rowIndex, colIndex, e)}
                            className="text-xs nodrag nopan h-7"
                          />
                          {colIndex === 0 && rows > 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 shrink-0"
                              onClick={() => removeRow(rowIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                              </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});
