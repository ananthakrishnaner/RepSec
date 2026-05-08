import { useCallback, useRef, useState } from 'react';
import { Node, Edge } from '@xyflow/react';

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

interface UseHistoryOptions {
  limit?: number;
  getSnapshot?: () => HistoryEntry;
}

export function useHistory(options: UseHistoryOptions = {}) {
  const { limit = 50, getSnapshot } = options;

  const pastRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isUndoRedoRef = useRef(false);
  const initializedRef = useRef(false);

  const updateFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    if (isUndoRedoRef.current) return;

    const cloned: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(entry.nodes)),
      edges: JSON.parse(JSON.stringify(entry.edges)),
    };

    pastRef.current.push(cloned);
    if (pastRef.current.length > limit) {
      pastRef.current.shift();
    }
    futureRef.current = [];
    updateFlags();
  }, [limit, updateFlags]);

  const undo = useCallback((): HistoryEntry | null => {
    if (pastRef.current.length === 0) return null;
    if (!getSnapshot) return null;

    const current = getSnapshot();
    futureRef.current.push({
      nodes: JSON.parse(JSON.stringify(current.nodes)),
      edges: JSON.parse(JSON.stringify(current.edges)),
    });

    const past = pastRef.current.pop()!;
    updateFlags();
    return past;
  }, [getSnapshot, updateFlags]);

  const redo = useCallback((): HistoryEntry | null => {
    if (futureRef.current.length === 0) return null;
    if (!getSnapshot) return null;

    const current = getSnapshot();
    pastRef.current.push({
      nodes: JSON.parse(JSON.stringify(current.nodes)),
      edges: JSON.parse(JSON.stringify(current.edges)),
    });

    const future = futureRef.current.pop()!;
    updateFlags();
    return future;
  }, [getSnapshot, updateFlags]);

  return {
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    isUndoRedoRef,
    initializedRef,
  };
}
