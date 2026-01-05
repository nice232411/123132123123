import { useState, useCallback, useEffect } from 'react';
import { EditorState, Wall, Window, Door, Point, Tool } from '../types/editor';
import { saveProject, loadProject } from '../utils/storage';

const WALL_THICKNESS = 10;

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
    pan: { x: 0, y: 0 }
  });

  useEffect(() => {
    const project = loadProject();
    if (project) {
      setState(prev => ({
        ...prev,
        walls: project.walls,
        windows: project.windows,
        doors: project.doors
      }));
    }
  }, []);

  useEffect(() => {
    if (state.walls.length > 0 || state.windows.length > 0 || state.doors.length > 0) {
      saveProject(state.walls, state.windows, state.doors);
    }
  }, [state.walls, state.windows, state.doors]);

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
    const newWall: Wall = {
      id: `wall-${Date.now()}-${Math.random()}`,
      start,
      end,
      thickness: WALL_THICKNESS
    };

    setState(prev => ({
      ...prev,
      walls: [...prev.walls, newWall],
      tempWallStart: null
    }));
  }, []);

  const addWindow = useCallback((wallId: string, position: number) => {
    const newWindow: Window = {
      id: `window-${Date.now()}-${Math.random()}`,
      wallId,
      position,
      width: 100
    };

    setState(prev => ({
      ...prev,
      windows: [...prev.windows, newWindow],
      selectedId: newWindow.id,
      selectedType: 'window'
    }));
  }, []);

  const addDoor = useCallback((wallId: string, position: number) => {
    const newDoor: Door = {
      id: `door-${Date.now()}-${Math.random()}`,
      wallId,
      position,
      width: 90,
      openDirection: 'right'
    };

    setState(prev => ({
      ...prev,
      doors: [...prev.doors, newDoor],
      selectedId: newDoor.id,
      selectedType: 'door'
    }));
  }, []);

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

      const newState = { ...prev };

      if (prev.selectedType === 'wall') {
        newState.walls = prev.walls.filter(w => w.id !== prev.selectedId);
        newState.windows = prev.windows.filter(w => w.wallId !== prev.selectedId);
        newState.doors = prev.doors.filter(d => d.wallId !== prev.selectedId);
      } else if (prev.selectedType === 'window') {
        newState.windows = prev.windows.filter(w => w.id !== prev.selectedId);
      } else if (prev.selectedType === 'door') {
        newState.doors = prev.doors.filter(d => d.id !== prev.selectedId);
      }

      newState.selectedId = null;
      newState.selectedType = null;

      return newState;
    });
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<Window>) => {
    setState(prev => ({
      ...prev,
      windows: prev.windows.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  }, []);

  const updateDoor = useCallback((id: string, updates: Partial<Door>) => {
    setState(prev => ({
      ...prev,
      doors: prev.doors.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  }, []);

  const updateWall = useCallback((id: string, updates: Partial<Wall>) => {
    setState(prev => ({
      ...prev,
      walls: prev.walls.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  }, []);

  const setTempWallStart = useCallback((point: Point | null) => {
    setState(prev => ({
      ...prev,
      tempWallStart: point
    }));
  }, []);

  const clearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear everything?')) {
      setState(prev => ({
        ...prev,
        walls: [],
        windows: [],
        doors: [],
        selectedId: null,
        selectedType: null,
        tempWallStart: null
      }));
    }
  }, []);

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
    setPan
  };
}
