import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: string;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  log(level: LogEntry['level'], category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      data
    };
    
    this.logs.push(entry);
    
    // Keep only last 500 logs
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-500);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]));
    
    // Also log to browser console with styling
    const styles = {
      info: 'color: #3b82f6; font-weight: bold',
      warn: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      debug: 'color: #6b7280; font-weight: normal',
      success: 'color: #10b981; font-weight: bold'
    };
    
    console.log(`%c[${entry.timestamp}] ${category}: ${message}`, styles[level], data || '');
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  success(category: string, message: string, data?: any) {
    this.log('success', category, message, data);
  }

  subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback);
    callback([...this.logs]);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }

  getLogs() {
    return [...this.logs];
  }

  exportLogs() {
    const logsText = this.logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()} - ${log.category}: ${log.message}${log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// React component for viewing logs
export const DebugLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const levelColors = {
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    warn: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
    debug: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/20'
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="w-full bg-gradient-to-r from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border-purple-500/30 hover:border-purple-500/50 text-purple-600 hover:text-purple-500"
      >
        🔧 Debug Logs ({logs.length})
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-96 h-96 z-50 bg-background/95 backdrop-blur-sm border shadow-xl">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">Debug Logs ({filteredLogs.length})</h3>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-border rounded px-2 py-1 bg-background"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
            <option value="success">Success</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => debugLogger.exportLogs()}>
            💾
          </Button>
          <Button size="sm" variant="outline" onClick={() => debugLogger.clear()}>
            🗑️
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
            ✕
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-80">
        <div className="p-2 space-y-1">
          {filteredLogs.slice(-50).map((log, index) => (
            <div key={index} className="text-xs p-2 rounded border border-border/50 hover:bg-accent/50">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-xs px-1 py-0 ${levelColors[log.level]}`}>
                  {log.level}
                </Badge>
                <span className="text-muted-foreground">{log.timestamp}</span>
                <span className="font-medium text-xs">{log.category}</span>
              </div>
              <div className="text-foreground">{log.message}</div>
              {log.data && (
                <details className="mt-1">
                  <summary className="text-muted-foreground cursor-pointer">Data</summary>
                  <pre className="text-xs mt-1 p-1 bg-muted rounded overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
