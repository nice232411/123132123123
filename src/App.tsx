import { useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useEditor } from './hooks/useEditor';
import { exportProject } from './utils/storage';

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
    updateWall,
    setTempWallStart,
    clearAll,
    setPan,
    undo,
    redo
  } = useEditor();

  const handleExport = () => {
    exportProject(state.walls, state.windows, state.doors);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type !== 'range' && e.target.type !== 'color') return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          undo();
          return;
        }
        if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
          return;
        }
      }

      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          setTool('select');
          break;
        case 'w':
          e.preventDefault();
          setTool('wall');
          break;
        case 'n':
          e.preventDefault();
          setTool('window');
          break;
        case 'd':
          e.preventDefault();
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
  }, [state, setTool, deleteSelected, selectObject, setTempWallStart, undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Редактор 2D планировок</h1>
            <p className="text-sm text-gray-500 mt-1">
              {state.tool === 'wall' && 'Кликайте для создания точек стены. ПКМ для отмены.'}
              {state.tool === 'window' && 'Кликните по стене чтобы добавить окно'}
              {state.tool === 'door' && 'Кликните по стене чтобы добавить дверь'}
              {state.tool === 'select' && 'Кликайте по объектам для выбора и редактирования'}
              {state.tool === 'pan' && 'Перетаскивайте для перемещения холста'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800">Авто-сохранение в localStorage</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div className="font-medium">Статистика:</div>
              <div className="text-xs space-x-3">
                <span>{state.walls.length} стен</span>
                <span>{state.windows.length} окон</span>
                <span>{state.doors.length} дверей</span>
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
          onUndo={undo}
          onRedo={redo}
          canUndo={state.historyIndex > 0}
          canRedo={state.historyIndex < state.history.length - 1}
          onExport={handleExport}
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
          onUpdateWall={updateWall}
        />
      </div>
    </div>
  );
}

export default App;
