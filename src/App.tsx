import { useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useEditor } from './hooks/useEditor';

function App() {
  const {
    state,
    setTool,
    addWall,
    addWindow,
    addDoor,
    selectObject,
    deleteSelected,
    updateWindow,
    updateDoor,
    setTempWallStart,
    clearAll,
    setPan
  } = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 's':
          setTool('select');
          break;
        case 'w':
          setTool('wall');
          break;
        case 'n':
          setTool('window');
          break;
        case 'd':
          setTool('door');
          break;
        case ' ':
          e.preventDefault();
          setTool('pan');
          break;
        case 'delete':
        case 'backspace':
          if (state.selectedId) {
            e.preventDefault();
            deleteSelected();
          }
          break;
        case 'escape':
          if (state.tool === 'wall' && state.tempWallStart) {
            setTempWallStart(null);
          } else {
            selectObject('', 'wall');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, setTool, deleteSelected, selectObject, setTempWallStart]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">2D Floor Plan Editor</h1>
            <p className="text-sm text-gray-500 mt-1">
              {state.tool === 'wall' && 'Click to place wall points. Right-click to cancel.'}
              {state.tool === 'window' && 'Click on a wall to add a window'}
              {state.tool === 'door' && 'Click on a wall to add a door'}
              {state.tool === 'select' && 'Click on objects to select and edit them'}
              {state.tool === 'pan' && 'Drag to move the canvas'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800">Auto-saving to localStorage</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div className="font-medium">Stats:</div>
              <div className="text-xs space-x-3">
                <span>{state.walls.length} walls</span>
                <span>{state.windows.length} windows</span>
                <span>{state.doors.length} doors</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          currentTool={state.tool}
          onSelectTool={setTool}
          onClear={clearAll}
          hasSelection={!!state.selectedId}
          onDelete={deleteSelected}
        />

        <div className="flex-1 relative bg-white">
          <Canvas
            state={state}
            onAddWall={addWall}
            onAddWindow={addWindow}
            onAddDoor={addDoor}
            onSelectObject={selectObject}
            onSetTempWallStart={setTempWallStart}
            onSetPan={setPan}
          />
        </div>

        <PropertiesPanel
          state={state}
          onUpdateWindow={updateWindow}
          onUpdateDoor={updateDoor}
        />
      </div>
    </div>
  );
}

export default App;
