import { Point } from 'pixi.js';
import { GameMap } from '../GameMap';
import { CellSpriteType } from '../types';

function collectNearestEqualCells<T extends CellSpriteType>(
  map: GameMap<T>,
  centralCell: T,
  pos: Point,
  acc: T[],
  coordAcc: Point[],
) {
  const { x: tileX, y: tileY } = pos;
  const nearestCells = [
    new Point(tileX, tileY),
    new Point(tileX, tileY - 1),
    new Point(tileX, tileY + 1),
    new Point(tileX - 1, tileY),
    new Point(tileX + 1, tileY),
  ];
  for (const nearestCell of nearestCells) {
    const { x, y } = nearestCell;
    if (x < 0 || y < 0 || x >= map.getWidth() || y >= map.getHeight()) {
      continue;
    }
    const cellNode = map.getCell(x, y);
    if (!cellNode || acc.includes(cellNode)) {
      continue;
    }
    if (centralCell.getGroupName() === cellNode.getGroupName()) {
      acc.push(cellNode);
      coordAcc.push(nearestCell);
      collectNearestEqualCells(map, cellNode, nearestCell, acc, coordAcc);
    }
  }
}

export function collectEqualCells<T extends CellSpriteType>(map: GameMap<T>, pos: Point, min: number): [T[], Point[]] {
  const initialCell = map.getCell(pos.x, pos.y);
  if (initialCell === undefined) {
    return [[], []];
  }
  const cellsAcc: T[] = [];
  const coordAcc: Point[] = [];
  if (initialCell.isNotEmpty()) {
    collectNearestEqualCells(map, initialCell, pos, cellsAcc, coordAcc);
  }
  if (cellsAcc.length >= min) {
    return [cellsAcc, coordAcc];
  }
  return [[], []];
}
