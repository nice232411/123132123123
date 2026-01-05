import { EditorState, Window, Door, Wall } from '../types/editor';
import { getWallLength } from '../utils/geometry';

interface PropertiesPanelProps {
  state: EditorState;
  onUpdateWindow: (id: string, updates: Partial<Window>) => void;
  onUpdateDoor: (id: string, updates: Partial<Door>) => void;
  onUpdateWall: (id: string, updates: Partial<Wall>) => void;
}

export function PropertiesPanel({ state, onUpdateWindow, onUpdateDoor, onUpdateWall }: PropertiesPanelProps) {
  if (!state.selectedId || !state.selectedType) {
    return (
      <div className="bg-white border-l border-gray-200 w-80 p-6">
        <div className="text-center text-gray-400 mt-10">
          <p className="text-sm">Объект не выбран</p>
          <p className="text-xs mt-2">Выберите стену, окно или дверь для редактирования</p>
        </div>

        <div className="mt-10 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">Краткое руководство</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Кликайте для создания стен</li>
              <li>• ПКМ для отмены стены</li>
              <li>• Кликайте по стенам для добавления окон/дверей</li>
              <li>• Используйте выбор для редактирования</li>
              <li>• Средняя кнопка или Alt+перетаскивание для панорамы</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Горячие клавиши</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• <kbd className="px-1 bg-white border rounded">S</kbd> Инструмент выбора</li>
              <li>• <kbd className="px-1 bg-white border rounded">W</kbd> Инструмент стены</li>
              <li>• <kbd className="px-1 bg-white border rounded">N</kbd> Инструмент окна</li>
              <li>• <kbd className="px-1 bg-white border rounded">D</kbd> Инструмент двери</li>
              <li>• <kbd className="px-1 bg-white border rounded">Del</kbd> Удалить выбранное</li>
              <li>• <kbd className="px-1 bg-white border rounded">Esc</kbd> Снять выделение</li>
              <li>• <kbd className="px-1 bg-white border rounded">Ctrl+Z</kbd> Отменить</li>
              <li>• <kbd className="px-1 bg-white border rounded">Ctrl+Y</kbd> Повторить</li>
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
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Свойства стены</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Длина</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-2xl font-semibold text-gray-900">{Math.round(length)}</span>
              <span className="text-sm text-gray-500 ml-2">px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Толщина (px)</label>
            <input
              type="range"
              min="5"
              max="30"
              value={wall.thickness}
              onChange={(e) => onUpdateWall(wall.id, { thickness: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5px</span>
              <span className="font-semibold text-gray-900">{wall.thickness}px</span>
              <span>30px</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Координаты</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500">Начало</div>
                <div className="text-sm font-mono">
                  {Math.round(wall.start.x)}, {Math.round(wall.start.y)}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500">Конец</div>
                <div className="text-sm font-mono">
                  {Math.round(wall.end.x)}, {Math.round(wall.end.y)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 mt-4">
            <p className="text-xs text-amber-800">
              При удалении стены также удалятся все окна и двери на ней.
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
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Свойства окна</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ширина (px)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Позиция на стене</label>
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
              <span>Начало</span>
              <span className="font-semibold text-gray-900">{Math.round(window.position * 100)}%</span>
              <span>Конец</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={window.color}
                onChange={(e) => onUpdateWindow(window.id, { color: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-mono">{window.color}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Информация о стене</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Длина стены</div>
              <div className="text-lg font-semibold text-gray-900">{Math.round(wallLength)}px</div>
            </div>
          </div>

          <div className="bg-sky-50 rounded-lg p-3 mt-4">
            <p className="text-xs text-sky-800">
              Окна автоматически центрируются на стене. Настройте ширину и позицию по необходимости.
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
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Свойства двери</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ширина (px)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Позиция на стене</label>
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
              <span>Начало</span>
              <span className="font-semibold text-gray-900">{Math.round(door.position * 100)}%</span>
              <span>Конец</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Направление открытия</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateDoor(door.id, { openDirection: 'left' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  door.openDirection === 'left'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Влево
              </button>
              <button
                onClick={() => onUpdateDoor(door.id, { openDirection: 'right' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  door.openDirection === 'right'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Вправо
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={door.color}
                onChange={(e) => onUpdateDoor(door.id, { color: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-mono">{door.color}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Информация о стене</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Длина стены</div>
              <div className="text-lg font-semibold text-gray-900">{Math.round(wallLength)}px</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 mt-4">
            <p className="text-xs text-amber-800">
              Двери автоматически показывают дугу открытия. Выберите направление подходящее для вашего плана.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
