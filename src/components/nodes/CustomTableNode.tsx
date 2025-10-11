import React, { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeResizer, NodeProps, Node } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, Plus, Trash2, Settings2 } from 'lucide-react';
import { NodeData } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CustomTableData extends NodeData {
  rows?: number;
  cols?: number;
  headers?: string[];
  cellData?: string[][];
}

export const CustomTableNode = memo(({ data, id, selected }: NodeProps<Node<CustomTableData>>) => {
  const { updateNodeData } = data;
  const [rows, setRows] = useState(data.rows || 3);
  const [cols, setCols] = useState(data.cols || 3);
  const [headers, setHeaders] = useState<string[]>(data.headers || Array(data.cols || 3).fill(''));
  const [cellData, setCellData] = useState<string[][]>(
    data.cellData || Array(data.rows || 3).fill(null).map(() => Array(data.cols || 3).fill(''))
  );

  useEffect(() => {
    updateNodeData?.(id, 'rows', rows);
    updateNodeData?.(id, 'cols', cols);
    updateNodeData?.(id, 'headers', headers);
    updateNodeData?.(id, 'cellData', cellData);
  }, [rows, cols, headers, cellData, id, updateNodeData]);

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
    setRows(rows + 1);
  };

  const addColumn = () => {
    setHeaders([...headers, '']);
    setCellData(cellData.map(row => [...row, '']));
    setCols(cols + 1);
  };

  const removeRow = (rowIndex: number) => {
    if (rows <= 1) return;
    const newCellData = cellData.filter((_, i) => i !== rowIndex);
    setCellData(newCellData);
    setRows(rows - 1);
  };

  const removeColumn = (colIndex: number) => {
    if (cols <= 1) return;
    setHeaders(headers.filter((_, i) => i !== colIndex));
    setCellData(cellData.map(row => row.filter((_, i) => i !== colIndex)));
    setCols(cols - 1);
  };

  return (
    <Card className="w-full h-full p-4 bg-background border-border flex flex-col">
      <NodeResizer minWidth={400} minHeight={300} isVisible={selected} />
      <Handle type="target" position={Position.Top} />
      
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

      <div className="flex-1 overflow-auto border rounded-lg p-2 bg-muted/20">
        <table className="w-full border-collapse">
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
                    <div className="flex items-center gap-1">
                      <Input
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
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
