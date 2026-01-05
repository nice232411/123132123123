import { useState, useCallback, useEffect } from 'react';
import { EditorState, Wall, Window, Door, Point, Tool, HistoryState } from '../types/editor';
import { saveProject, loadProject } from '../utils/storage';

const WALL_THICKNESS = 10;
const MAX_HISTORY = 50;

export function useEditor() {
  const [state, setState] = useState<EditorState>({
    walls: [],
    windows: [],
    doors: [],
    selectedId: null,
    selectedType: null,
    tool: 'wall',
    tempWallStart: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    history: [],
    historyIndex: -1
  });

  useEffect(() => {
    const project = loadProject();
    if (project) {
      const walls = project.walls || [];
      const windows = (project.windows || []).map(w => ({
        ...w,
        color: w.color || '#60a5fa'
      }));
      const doors = (project.doors || []).map(d => ({
        ...d,
        color: d.color || '#f59e0b'
      }));

      setState(prev => ({
        ...prev,
        walls,
        windows,
        doors,
        history: [{ walls, windows, doors }],
        historyIndex: 0
      }));
    }
  }, []);

  useEffect(() => {
    if (state.walls.length > 0 || state.windows.length > 0 || state.doors.length > 0) {
      saveProject(state.walls, state.windows, state.doors);
    }
  }, [state.walls, state.windows, state.doors]);

  const addToHistory = useCallback((walls: Wall[], windows: Window[], doors: Door[]) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ walls, windows, doors });

      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return {
          ...prev,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        const historyState = prev.history[newIndex];
        return {
          ...prev,
          walls: historyState.walls,
          windows: historyState.windows,
          doors: historyState.doors,
          historyIndex: newIndex,
          selectedId: null,
          selectedType: null
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        const historyState = prev.history[newIndex];
        return {
          ...prev,
          walls: historyState.walls,
          windows: historyState.windows,
          doors: historyState.doors,
          historyIndex: newIndex,
          selectedId: null,
          selectedType: null
        };
      }
      return prev;
    });
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setState(prev => ({
      ...prev,
      tool,
      selectedId: null,
      selectedType: null,
      tempWallStart: null
    }));
  }, []);

  const addWall = useCallback((start: Point, end: Point) => {
    setState(prev => {
      const newWall: Wall = {
        id: `wall-${Date.now()}-${Math.random()}`,
        start,
        end,
        thickness: WALL_THICKNESS
      };

      const newWalls = [...prev.walls, newWall];
      addToHistory(newWalls, prev.windows, prev.doors);

      return {
        ...prev,
        walls: newWalls,
        tempWallStart: null
      };
    });
  }, [addToHistory]);

  const addWindow = useCallback((wallId: string, position: number) => {
    setState(prev => {
      const newWindow: Window = {
        id: `window-${Date.now()}-${Math.random()}`,
        wallId,
        position,
        width: 100,
        color: '#60a5fa'
      };

      const newWindows = [...prev.windows, newWindow];
      addToHistory(prev.walls, newWindows, prev.doors);

      return {
        ...prev,
        windows: newWindows,
        selectedId: newWindow.id,
        selectedType: 'window'
      };
    });
  }, [addToHistory]);

  const addDoor = useCallback((wallId: string, position: number) => {
    setState(prev => {
      const newDoor: Door = {
        id: `door-${Date.now()}-${Math.random()}`,
        wallId,
        position,
        width: 90,
        openDirection: 'right',
        color: '#f59e0b'
      };

      const newDoors = [...prev.doors, newDoor];
      addToHistory(prev.walls, prev.windows, newDoors);

      return {
        ...prev,
        doors: newDoors,
        selectedId: newDoor.id,
        selectedType: 'door'
      };
    });
  }, [addToHistory]);

  const selectObject = useCallback((id: string, type: 'wall' | 'window' | 'door') => {
    setState(prev => ({
      ...prev,
      selectedId: id,
      selectedType: type,
      tool: 'select'
    }));
  }, []);

  const deleteSelected = useCallback(() => {
    setState(prev => {
      if (!prev.selectedId || !prev.selectedType) return prev;

      let newWalls = prev.walls;
      let newWindows = prev.windows;
      let newDoors = prev.doors;

      if (prev.selectedType === 'wall') {
        newWalls = prev.walls.filter(w => w.id !== prev.selectedId);
        newWindows = prev.windows.filter(w => w.wallId !== prev.selectedId);
        newDoors = prev.doors.filter(d => d.wallId !== prev.selectedId);
      } else if (prev.selectedType === 'window') {
        newWindows = prev.windows.filter(w => w.id !== prev.selectedId);
      } else if (prev.selectedType === 'door') {
        newDoors = prev.doors.filter(d => d.id !== prev.selectedId);
      }

      addToHistory(newWalls, newWindows, newDoors);

      return {
        ...prev,
        walls: newWalls,
        windows: newWindows,
        doors: newDoors,
        selectedId: null,
        selectedType: null
      };
    });
  }, [addToHistory]);

  const updateWindow = useCallback((id: string, updates: Partial<Window>) => {
    setState(prev => {
      const newWindows = prev.windows.map(w => w.id === id ? { ...w, ...updates } : w);
      addToHistory(prev.walls, newWindows, prev.doors);

      return {
        ...prev,
        windows: newWindows
      };
    });
  }, [addToHistory]);

  const updateDoor = useCallback((id: string, updates: Partial<Door>) => {
    setState(prev => {
      const newDoors = prev.doors.map(d => d.id === id ? { ...d, ...updates } : d);
      addToHistory(prev.walls, prev.windows, newDoors);

      return {
        ...prev,
        doors: newDoors
      };
    });
  }, [addToHistory]);

  const updateWall = useCallback((id: string, updates: Partial<Wall>) => {
    setState(prev => {
      const newWalls = prev.walls.map(w => w.id === id ? { ...w, ...updates } : w);
      addToHistory(newWalls, prev.windows, prev.doors);

      return {
        ...prev,
        walls: newWalls
      };
    });
  }, [addToHistory]);

  const setTempWallStart = useCallback((point: Point | null) => {
    setState(prev => ({
      ...prev,
      tempWallStart: point
    }));
  }, []);

  const clearAll = useCallback(() => {
    if (confirm('Вы уверены, что хотите удалить всё?')) {
      setState(prev => {
        addToHistory([], [], []);

        return {
          ...prev,
          walls: [],
          windows: [],
          doors: [],
          selectedId: null,
          selectedType: null,
          tempWallStart: null
        };
      });
    }
  }, [addToHistory]);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, zoom))
    }));
  }, []);

  const setPan = useCallback((pan: Point) => {
    setState(prev => ({
      ...prev,
      pan
    }));
  }, []);

  return {
    state,
    setTool,
    addWall,
    addWindow,
    addDoor,
    selectObject,
    deleteSelected,
    updateWindow,
    updateDoor,
    updateWall,
    setTempWallStart,
    clearAll,
    setZoom,
    setPan,
    undo,
    redo
  };
}
