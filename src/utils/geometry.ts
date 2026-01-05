import { Point, Wall } from '../types/editor';

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isPointNearLine(point: Point, lineStart: Point, lineEnd: Point, threshold: number): boolean {
  const dist = pointToLineDistance(point, lineStart, lineEnd);
  return dist <= threshold;
}

export function getPositionOnWall(point: Point, wall: Wall): number {
  const A = point.x - wall.start.x;
  const B = point.y - wall.start.y;
  const C = wall.end.x - wall.start.x;
  const D = wall.end.y - wall.start.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  if (lenSq === 0) return 0;

  const param = Math.max(0, Math.min(1, dot / lenSq));
  return param;
}

export function getPointOnWall(wall: Wall, position: number): Point {
  return {
    x: wall.start.x + (wall.end.x - wall.start.x) * position,
    y: wall.start.y + (wall.end.y - wall.start.y) * position
  };
}

export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}

export function getWallAngle(wall: Wall): number {
  return Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
}

export function getWallLength(wall: Wall): number {
  return distance(wall.start, wall.end);
}
