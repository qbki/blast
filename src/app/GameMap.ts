export class GameMap<T> {
  private _map: T[][];
  private _width;
  private _height;

  constructor(cols: number, rows: number, initFn: (x: number, y: number) => T) {
    this._map = [];
    this._width = cols;
    this._height = rows;
    for (let y = 0; y < rows; y += 1) {
      const row = [];
      for (let x = 0; x < cols; x += 1) {
        row.push(initFn(x, y));
      }
      this._map.push(row);
    }
  }

  setCell(x: number, y: number, cell: T): void {
    const row = this._map[y];
    if (row) {
      row[x] = cell;
    }
  }

  getCell(x: number, y: number): T | undefined {
    return this._map[y]?.[x];
  }

  getWidth(): number {
    return this._width;
  }

  getHeight(): number {
    return this._height;
  }
}
