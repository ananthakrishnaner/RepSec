import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Terminal, Trash2, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class AppLogger {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined
    };

    this.logs.push(logEntry);
    
    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Notify all listeners
    this.listeners.forEach(listener => listener([...this.logs]));

    // Also log to browser console for fallback
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }

  getLogs() {
    return [...this.logs];
  }
}

// Create global logger instance
export const appLogger = new AppLogger();

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = appLogger.subscribe(setLogs);
    setLogs(appLogger.getLogs());
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const clearLogs = useCallback(() => {
    appLogger.clear();
    toast({
      title: "Logs cleared",
      description: "All log entries have been cleared.",
    });
  }, [toast]);

  const copyLogs = useCallback(() => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? '\n' + log.data : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logText);
    toast({
      title: "Logs copied",
      description: "All visible logs have been copied to clipboard.",
    });
  }, [filteredLogs, toast]);

  const downloadLogs = useCallback(() => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? '\n' + log.data : ''}`
    ).join('\n\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-builder-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Logs downloaded",
      description: "Log file has been downloaded to your device.",
    });
  }, [filteredLogs, toast]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'warn': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'debug': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border-purple-500/30 hover:border-purple-500/50 text-purple-600 hover:text-purple-500"
        >
          <Terminal className="h-4 w-4 mr-2" />
          View Logs ({logs.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Application Logs
            <Badge variant="outline" className="ml-2">
              {filteredLogs.length} entries
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex gap-1">
            {(['all', 'info', 'warn', 'error', 'debug'] as const).map((level) => (
              <Button
                key={level}
                variant={filter === level ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(level)}
                className="h-8"
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                {level !== 'all' && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {logs.filter(log => log.level === level).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-1 ml-auto">
            <Button variant="outline" size="sm" onClick={copyLogs}>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadLogs}>
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 border rounded-lg bg-muted/30">
          <div className="p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No logs to display</p>
                <p className="text-sm">Interact with the application to see logs here</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <Card key={log.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <Badge className={`${getLevelColor(log.level)} font-mono text-xs`}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{log.message}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {log.timestamp}
                        </span>
                      </div>
                      {log.data && (
                        <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                          {log.data}
                        </pre>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
