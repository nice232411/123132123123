import { MousePointer2, Minus, Square, DoorOpen, Move, Trash2, Save, RotateCcw, Undo, Redo, Download } from 'lucide-react';
import { Tool } from '../types/editor';

interface ToolbarProps {
  currentTool: Tool;
  onSelectTool: (tool: Tool) => void;
  onClear: () => void;
  hasSelection: boolean;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
}

export function Toolbar({
  currentTool,
  onSelectTool,
  onClear,
  hasSelection,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport
}: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'Выбор (S)', color: 'bg-blue-500' },
    { id: 'wall' as Tool, icon: Minus, label: 'Стена (W)', color: 'bg-gray-700' },
    { id: 'window' as Tool, icon: Square, label: 'Окно (N)', color: 'bg-sky-500' },
    { id: 'door' as Tool, icon: DoorOpen, label: 'Дверь (D)', color: 'bg-amber-500' },
    { id: 'pan' as Tool, icon: Move, label: 'Панорама (Space)', color: 'bg-green-500' },
  ];

  return (
    <div className="bg-white border-r border-gray-200 w-20 flex flex-col items-center py-4 gap-2">
      <div className="text-xs font-semibold text-gray-600 mb-2 px-2 text-center">Инструменты</div>

      {tools.map(tool => {
        const Icon = tool.icon;
        const isActive = currentTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
              isActive
                ? `${tool.color} text-white shadow-lg`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={tool.label}
          >
            <Icon size={24} />
          </button>
        );
      })}

      <div className="border-t border-gray-200 w-12 my-2" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
          canUndo
            ? 'bg-gray-600 text-white hover:bg-gray-700 hover:scale-105'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Отменить (Ctrl+Z)"
      >
        <Undo size={24} />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
          canRedo
            ? 'bg-gray-600 text-white hover:bg-gray-700 hover:scale-105'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Повторить (Ctrl+Y)"
      >
        <Redo size={24} />
      </button>

      <div className="border-t border-gray-200 w-12 my-2" />

      <button
        onClick={onDelete}
        disabled={!hasSelection}
        className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
          hasSelection
            ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Удалить (Del)"
      >
        <Trash2 size={24} />
      </button>

      <button
        onClick={onClear}
        className="w-14 h-14 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-105"
        title="Очистить всё"
      >
        <RotateCcw size={24} />
      </button>

      <button
        onClick={onExport}
        className="w-14 h-14 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-all hover:scale-105"
        title="Скачать проект"
      >
        <Download size={24} />
      </button>

      <div className="flex-1" />

      <div className="text-xs text-gray-400 px-2 text-center">
        <Save size={16} className="mx-auto mb-1" />
        Авто-сохранение
      </div>
    </div>
  );
}
