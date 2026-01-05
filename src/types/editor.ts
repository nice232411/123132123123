export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
}

export interface Window {
  id: string;
  wallId: string;
  position: number;
  width: number;
  color: string;
}

export interface Door {
  id: string;
  wallId: string;
  position: number;
  width: number;
  openDirection: 'left' | 'right';
  color: string;
}

export type Tool = 'select' | 'wall' | 'window' | 'door' | 'pan';

export interface EditorState {
  walls: Wall[];
  windows: Window[];
  doors: Door[];
  selectedId: string | null;
  selectedType: 'wall' | 'window' | 'door' | null;
  tool: Tool;
  tempWallStart: Point | null;
  zoom: number;
  pan: Point;
  history: HistoryState[];
  historyIndex: number;
}

export interface HistoryState {
  walls: Wall[];
  windows: Window[];
  doors: Door[];
}

export interface Project {
  name: string;
  walls: Wall[];
  windows: Window[];
  doors: Door[];
  createdAt: string;
  updatedAt: string;
}
