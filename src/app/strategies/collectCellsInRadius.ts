import { Point } from 'pixi.js';

export function collectCellsInRadius<T>(
  map: GameMap<T>,
  pos: Point,
  radius: number,
): [T[], Point[]] {
  const squaredRadius = radius * radius;
  const cells = [];
  const coords = [];
  const width =  map.getWidth();
  const height = map.getHeight();
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const dx = pos.x - x;
      const dy = pos.y - y;
      if (squaredRadius >= dx * dx + dy * dy) {
        const cell = map.getCell(x, y);
        if (!cell) {
          continue;
        }
        cells.push(cell);
        coords.push(new Point(x, y));
      }
    }
  }
  return [cells, coords];
}
