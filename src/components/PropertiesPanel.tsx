import { EditorState, Window, Door, Wall } from '../types/editor';
import { getWallLength } from '../utils/geometry';

interface PropertiesPanelProps {
  state: EditorState;
  onUpdateWindow: (id: string, updates: Partial<Window>) => void;
  onUpdateDoor: (id: string, updates: Partial<Door>) => void;
}

export function PropertiesPanel({ state, onUpdateWindow, onUpdateDoor }: PropertiesPanelProps) {
  if (!state.selectedId || !state.selectedType) {
    return (
      <div className="bg-white border-l border-gray-200 w-80 p-6">
        <div className="text-center text-gray-400 mt-10">
          <p className="text-sm">No object selected</p>
          <p className="text-xs mt-2">Select a wall, window, or door to edit properties</p>
        </div>

        <div className="mt-10 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">Quick Guide</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Click points to draw walls</li>
              <li>• Right-click to cancel wall</li>
              <li>• Click on walls to add windows/doors</li>
              <li>• Use select tool to edit objects</li>
              <li>• Middle-click or Alt+drag to pan</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Keyboard Shortcuts</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• <kbd className="px-1 bg-white border rounded">S</kbd> Select tool</li>
              <li>• <kbd className="px-1 bg-white border rounded">W</kbd> Wall tool</li>
              <li>• <kbd className="px-1 bg-white border rounded">N</kbd> Window tool</li>
              <li>• <kbd className="px-1 bg-white border rounded">D</kbd> Door tool</li>
              <li>• <kbd className="px-1 bg-white border rounded">Del</kbd> Delete selected</li>
              <li>• <kbd className="px-1 bg-white border rounded">Esc</kbd> Deselect</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (state.selectedType === 'wall') {
    const wall = state.walls.find(w => w.id === state.selectedId) as Wall;
    if (!wall) return null;

    const length = getWallLength(wall);

    return (
      <div className="bg-white border-l border-gray-200 w-80 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Wall Properties</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-2xl font-semibold text-gray-900">{Math.round(length)}</span>
              <span className="text-sm text-gray-500 ml-2">px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thickness</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-2xl font-semibold text-gray-900">{wall.thickness}</span>
              <span className="text-sm text-gray-500 ml-2">px</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Coordinates</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500">Start</div>
                <div className="text-sm font-mono">
                  {Math.round(wall.start.x)}, {Math.round(wall.start.y)}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500">End</div>
                <div className="text-sm font-mono">
                  {Math.round(wall.end.x)}, {Math.round(wall.end.y)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 mt-4">
            <p className="text-xs text-amber-800">
              Deleting this wall will also remove any windows or doors attached to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.selectedType === 'window') {
    const window = state.windows.find(w => w.id === state.selectedId) as Window;
    if (!window) return null;

    const wall = state.walls.find(w => w.id === window.wallId);
    if (!wall) return null;

    const wallLength = getWallLength(wall);

    return (
      <div className="bg-white border-l border-gray-200 w-80 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Window Properties</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
            <input
              type="range"
              min="50"
              max={Math.min(300, wallLength * 0.8)}
              value={window.width}
              onChange={(e) => onUpdateWindow(window.id, { width: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50px</span>
              <span className="font-semibold text-gray-900">{window.width}px</span>
              <span>{Math.min(300, Math.round(wallLength * 0.8))}px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position on Wall</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={window.position}
              onChange={(e) => onUpdateWindow(window.id, { position: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Start</span>
              <span className="font-semibold text-gray-900">{Math.round(window.position * 100)}%</span>
              <span>End</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Wall Info</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Wall Length</div>
              <div className="text-lg font-semibold text-gray-900">{Math.round(wallLength)}px</div>
            </div>
          </div>

          <div className="bg-sky-50 rounded-lg p-3 mt-4">
            <p className="text-xs text-sky-800">
              Windows are automatically centered on the wall. Adjust the width and position as needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.selectedType === 'door') {
    const door = state.doors.find(d => d.id === state.selectedId) as Door;
    if (!door) return null;

    const wall = state.walls.find(w => w.id === door.wallId);
    if (!wall) return null;

    const wallLength = getWallLength(wall);

    return (
      <div className="bg-white border-l border-gray-200 w-80 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Door Properties</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
            <input
              type="range"
              min="60"
              max={Math.min(150, wallLength * 0.8)}
              value={door.width}
              onChange={(e) => onUpdateDoor(door.id, { width: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>60px</span>
              <span className="font-semibold text-gray-900">{door.width}px</span>
              <span>{Math.min(150, Math.round(wallLength * 0.8))}px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position on Wall</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={door.position}
              onChange={(e) => onUpdateDoor(door.id, { position: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Start</span>
              <span className="font-semibold text-gray-900">{Math.round(door.position * 100)}%</span>
              <span>End</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Open Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateDoor(door.id, { openDirection: 'left' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  door.openDirection === 'left'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => onUpdateDoor(door.id, { openDirection: 'right' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  door.openDirection === 'right'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Right
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Wall Info</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Wall Length</div>
              <div className="text-lg font-semibold text-gray-900">{Math.round(wallLength)}px</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 mt-4">
            <p className="text-xs text-amber-800">
              Doors automatically show opening arc. Choose the direction that makes sense for your layout.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
