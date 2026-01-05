import { useRef, useEffect, useState, useCallback } from 'react';
import { EditorState, Point, Wall, Window, Door } from '../types/editor';
import {
  snapToGrid,
  isPointNearLine,
  getPositionOnWall,
  getPointOnWall,
  getWallAngle,
  getWallLength,
  distance
} from '../utils/geometry';

interface CanvasProps {
  state: EditorState;
  onAddWall: (start: Point, end: Point) => void;
  onAddWindow: (wallId: string, position: number) => void;
  onAddDoor: (wallId: string, position: number) => void;
  onSelectObject: (id: string, type: 'wall' | 'window' | 'door') => void;
  onSetTempWallStart: (point: Point | null) => void;
  onSetPan: (pan: Point) => void;
}

const GRID_SIZE = 20;
const WALL_COLOR = '#1a1a1a';
const WALL_HOVER_COLOR = '#444';
const SELECTED_COLOR = '#3b82f6';
const TEMP_LINE_COLOR = '#94a3b8';
const GRID_COLOR = '#e5e5e5';
const WINDOW_COLOR = '#60a5fa';
const DOOR_COLOR = '#f59e0b';

export function Canvas({
  state,
  onAddWall,
  onAddWindow,
  onAddDoor,
  onSelectObject,
  onSetTempWallStart,
  onSetPan
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  const toWorldCoords = useCallback((screenX: number, screenY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left - state.pan.x) / state.zoom,
      y: (screenY - rect.top - state.pan.y) / state.zoom
    };
  }, [state.pan, state.zoom]);

  const toScreenCoords = useCallback((worldX: number, worldY: number): Point => {
    return {
      x: worldX * state.zoom + state.pan.x,
      y: worldY * state.zoom + state.pan.y
    };
  }, [state.pan, state.zoom]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;

    const startX = Math.floor(-state.pan.x / state.zoom / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-state.pan.y / state.zoom / GRID_SIZE) * GRID_SIZE;
    const endX = startX + width / state.zoom + GRID_SIZE;
    const endY = startY + height / state.zoom + GRID_SIZE;

    for (let x = startX; x < endX; x += GRID_SIZE) {
      const screenX = x * state.zoom + state.pan.x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
    }

    for (let y = startY; y < endY; y += GRID_SIZE) {
      const screenY = y * state.zoom + state.pan.y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();
    }
  }, [state.pan, state.zoom]);

  const drawWall = useCallback((
    ctx: CanvasRenderingContext2D,
    wall: Wall,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const start = toScreenCoords(wall.start.x, wall.start.y);
    const end = toScreenCoords(wall.end.x, wall.end.y);

    ctx.strokeStyle = isSelected ? SELECTED_COLOR : isHovered ? WALL_HOVER_COLOR : WALL_COLOR;
    ctx.lineWidth = wall.thickness * state.zoom;
    ctx.lineCap = 'square';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    if (isSelected) {
      ctx.fillStyle = SELECTED_COLOR;
      ctx.beginPath();
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [state.zoom, toScreenCoords]);

  const drawWindow = useCallback((
    ctx: CanvasRenderingContext2D,
    window: Window,
    wall: Wall,
    isSelected: boolean
  ) => {
    const wallLength = getWallLength(wall);
    const windowWidth = (window.width / wallLength);
    const startPos = Math.max(0, Math.min(1 - windowWidth, window.position - windowWidth / 2));
    const endPos = Math.min(1, startPos + windowWidth);

    const startPoint = getPointOnWall(wall, startPos);
    const endPoint = getPointOnWall(wall, endPos);

    const start = toScreenCoords(startPoint.x, startPoint.y);
    const end = toScreenCoords(endPoint.x, endPoint.y);

    ctx.strokeStyle = isSelected ? SELECTED_COLOR : window.color;
    ctx.lineWidth = (wall.thickness + 4) * state.zoom;
    ctx.lineCap = 'butt';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const angle = getWallAngle(wall);
    const perpAngle = angle + Math.PI / 2;
    const offset = (wall.thickness / 2 + 6) * state.zoom;

    const midScreen = toScreenCoords(
      (startPoint.x + endPoint.x) / 2,
      (startPoint.y + endPoint.y) / 2
    );

    ctx.strokeStyle = isSelected ? SELECTED_COLOR : window.color;
    ctx.lineWidth = 2;

    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(
        start.x + Math.cos(perpAngle) * offset * side,
        start.y + Math.sin(perpAngle) * offset * side
      );
      ctx.lineTo(
        end.x + Math.cos(perpAngle) * offset * side,
        end.y + Math.sin(perpAngle) * offset * side
      );
      ctx.stroke();
    }

    if (isSelected) {
      ctx.fillStyle = SELECTED_COLOR;
      ctx.beginPath();
      ctx.arc(midScreen.x, midScreen.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [state.zoom, toScreenCoords]);

  const drawDoor = useCallback((
    ctx: CanvasRenderingContext2D,
    door: Door,
    wall: Wall,
    isSelected: boolean
  ) => {
    const wallLength = getWallLength(wall);
    const doorWidth = (door.width / wallLength);
    const startPos = Math.max(0, Math.min(1 - doorWidth, door.position - doorWidth / 2));
    const endPos = Math.min(1, startPos + doorWidth);

    const startPoint = getPointOnWall(wall, startPos);
    const endPoint = getPointOnWall(wall, endPos);

    const start = toScreenCoords(startPoint.x, startPoint.y);
    const end = toScreenCoords(endPoint.x, endPoint.y);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = (wall.thickness + 2) * state.zoom;
    ctx.lineCap = 'butt';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const angle = getWallAngle(wall);
    const doorDirection = door.openDirection === 'right' ? 1 : -1;
    const perpAngle = angle + Math.PI / 2 * doorDirection;

    const hingeScreen = door.openDirection === 'right' ? start : end;
    const doorLength = distance(start, end);

    ctx.strokeStyle = isSelected ? SELECTED_COLOR : door.color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(hingeScreen.x, hingeScreen.y, doorLength, angle, angle + Math.PI / 2 * doorDirection, doorDirection < 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(hingeScreen.x, hingeScreen.y);
    ctx.lineTo(
      hingeScreen.x + Math.cos(angle + Math.PI / 2 * doorDirection) * doorLength,
      hingeScreen.y + Math.sin(angle + Math.PI / 2 * doorDirection) * doorLength
    );
    ctx.stroke();

    if (isSelected) {
      const midScreen = toScreenCoords(
        (startPoint.x + endPoint.x) / 2,
        (startPoint.y + endPoint.y) / 2
      );
      ctx.fillStyle = SELECTED_COLOR;
      ctx.beginPath();
      ctx.arc(midScreen.x, midScreen.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [state.zoom, toScreenCoords]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);

    state.walls.forEach(wall => {
      const isSelected = state.selectedId === wall.id && state.selectedType === 'wall';
      const isHovered = hoveredWallId === wall.id;
      drawWall(ctx, wall, isSelected, isHovered);
    });

    state.windows.forEach(window => {
      const wall = state.walls.find(w => w.id === window.wallId);
      if (wall) {
        const isSelected = state.selectedId === window.id && state.selectedType === 'window';
        drawWindow(ctx, window, wall, isSelected);
      }
    });

    state.doors.forEach(door => {
      const wall = state.walls.find(w => w.id === door.wallId);
      if (wall) {
        const isSelected = state.selectedId === door.id && state.selectedType === 'door';
        drawDoor(ctx, door, wall, isSelected);
      }
    });

    if (state.tool === 'wall' && state.tempWallStart) {
      const snappedMouse = snapToGrid(mousePos, GRID_SIZE);
      const start = toScreenCoords(state.tempWallStart.x, state.tempWallStart.y);
      const end = toScreenCoords(snappedMouse.x, snappedMouse.y);

      ctx.strokeStyle = TEMP_LINE_COLOR;
      ctx.lineWidth = 10 * state.zoom;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.fillStyle = TEMP_LINE_COLOR;
      ctx.beginPath();
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [state, mousePos, hoveredWallId, drawGrid, drawWall, drawWindow, drawDoor, toScreenCoords]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = toWorldCoords(e.clientX, e.clientY);
    setMousePos(worldPos);

    if (isPanning) {
      onSetPan({
        x: state.pan.x + (e.clientX - panStart.x),
        y: state.pan.y + (e.clientY - panStart.y)
      });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (state.tool === 'select' || state.tool === 'window' || state.tool === 'door') {
      let foundWall: string | null = null;
      for (const wall of state.walls) {
        if (isPointNearLine(worldPos, wall.start, wall.end, 15)) {
          foundWall = wall.id;
          break;
        }
      }
      setHoveredWallId(foundWall);
    }
  }, [state, isPanning, panStart, toWorldCoords, onSetPan]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0) return;

    const worldPos = toWorldCoords(e.clientX, e.clientY);

    if (state.tool === 'wall') {
      const snappedPos = snapToGrid(worldPos, GRID_SIZE);

      if (!state.tempWallStart) {
        onSetTempWallStart(snappedPos);
      } else {
        if (distance(state.tempWallStart, snappedPos) > GRID_SIZE / 2) {
          onAddWall(state.tempWallStart, snappedPos);
        }
        onSetTempWallStart(snappedPos);
      }
    } else if (state.tool === 'select') {
      let found = false;

      for (const window of state.windows) {
        const wall = state.walls.find(w => w.id === window.wallId);
        if (wall) {
          const windowPoint = getPointOnWall(wall, window.position);
          if (distance(worldPos, windowPoint) < 20) {
            onSelectObject(window.id, 'window');
            found = true;
            break;
          }
        }
      }

      if (!found) {
        for (const door of state.doors) {
          const wall = state.walls.find(w => w.id === door.wallId);
          if (wall) {
            const doorPoint = getPointOnWall(wall, door.position);
            if (distance(worldPos, doorPoint) < 20) {
              onSelectObject(door.id, 'door');
              found = true;
              break;
            }
          }
        }
      }

      if (!found) {
        for (const wall of state.walls) {
          if (isPointNearLine(worldPos, wall.start, wall.end, 15)) {
            onSelectObject(wall.id, 'wall');
            found = true;
            break;
          }
        }
      }
    } else if (state.tool === 'window' || state.tool === 'door') {
      for (const wall of state.walls) {
        if (isPointNearLine(worldPos, wall.start, wall.end, 15)) {
          const position = getPositionOnWall(worldPos, wall);

          if (state.tool === 'window') {
            onAddWindow(wall.id, position);
          } else {
            onAddDoor(wall.id, position);
          }
          break;
        }
      }
    }
  }, [state, toWorldCoords, onAddWall, onAddWindow, onAddDoor, onSelectObject, onSetTempWallStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (state.tool === 'wall' && state.tempWallStart) {
      onSetTempWallStart(null);
    }
  }, [state.tool, state.tempWallStart, onSetTempWallStart]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : state.tool === 'pan' ? 'grab' : 'crosshair' }}
    />
  );
}
