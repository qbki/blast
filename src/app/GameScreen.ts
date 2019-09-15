import {
  Container,
  interaction,
  Point,
  Text,
  Texture,
} from 'pixi.js-legacy';
import TWEEN from '@tweenjs/tween.js';

import CellSprite, { CellColor } from './CellSprite';
import Button from './Button';
import {
  GAME_FIELD_HEIGHT,
  GAME_FIELD_WIDTH,
  MAP_HEIGHT,
  MAP_WIDTH,
  SCENE_WIDTH,
  TEXT_STYLE,
  TILE_HEIGHT,
  TILE_OFFSET_X,
  TILE_OFFSET_Y,
  TILE_WIDTH,
} from './consts';

export interface Resources {
  [key: string]: Texture;
}

const enum CellStatus {
    filled,
    empty,
}

interface CellNode {
  cell: CellSprite;
  status: CellStatus;
}

const EMPTY_CELL = new CellSprite(Texture.EMPTY);
EMPTY_CELL.setColor(CellColor.none);

function calcX(xPositionOnMap: number) {
  return xPositionOnMap * TILE_WIDTH + TILE_OFFSET_X;
}

function calcY(yPositionOnMap: number) {
  return yPositionOnMap * TILE_HEIGHT + TILE_OFFSET_Y;
}

export default class GameScreen extends Container {
  private _map: CellNode[][] = [];
  private _bufferOfCells: CellSprite[] = [];
  private _bufferOfScoreTexts: Text[] = [];
  private _moveLayer: Container;
  private _cellsLayer: Container;
  private _scoreContainer: Container;
  private _resultText: Text;
  private _scoreText: Text;
  private _score: number = 0;

  constructor(resources: Resources) {
    super();
    const textOffset = 10;

    const restartButton = new Button({
      x: TILE_OFFSET_X + GAME_FIELD_WIDTH,
      y: TILE_OFFSET_Y - textOffset,
      caption: 'Restart',
      anchor: new Point(1, 1),
      style: { fontSize: 24 },
    });
    this.addChild(restartButton);

    const menuButton = new Button({
      x: TILE_OFFSET_X + GAME_FIELD_WIDTH,
      y: TILE_OFFSET_Y + GAME_FIELD_HEIGHT + textOffset,
      caption: 'Pause',
      anchor: new Point(1, 0),
      style: { fontSize: 24 },
    });
    menuButton.on('pointerup', () => this.emit('menu'));
    this.addChild(menuButton);

    this._scoreText = new Text(
      '',
      {
        ...TEXT_STYLE,
        fontSize: 24,
      },
    );
    this._scoreText.anchor.set(0, 1);
    this._scoreText.position.set(TILE_OFFSET_X, TILE_OFFSET_Y - textOffset);
    this.addChild(this._scoreText);

    this._resultText = new Text(
      '',
      {
        ...TEXT_STYLE,
        fontSize: 36,
      },
    );
    this._resultText.anchor.set(0.5, 1);
    this._resultText.position.set(SCENE_WIDTH * 0.5, TILE_OFFSET_Y - textOffset);
    this.addChild(this._resultText);

    const cellsContainer = new Container();
    cellsContainer.interactive = true;
    cellsContainer.on('pointerdown', this.onPointerDown);
    this._cellsLayer = cellsContainer;
    this.addChild(cellsContainer);

    this._scoreContainer = new Container();
    this.addChild(this._scoreContainer);

    this._map = Array(MAP_HEIGHT).fill(null).map(() => []);
    const colorMap: {[key: string]: CellColor} = {
      block_blue: CellColor.blue,
      block_green: CellColor.green,
      block_purple: CellColor.purple,
      block_red: CellColor.red,
      block_yellow: CellColor.yellow,
    };
    for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const colors = Object.keys(resources);
        const color = colors[Math.round(Math.random() * (colors.length - 1))];
        const colorType = colorMap[color];
        const cell = new CellSprite(resources[color]);
        if (colorType) {
          cell.setColor(colorType);
        }
        cell.placeOnMap(x, y);
        this._map[y].push({
          cell,
          status: CellStatus.filled,
        });
        cellsContainer.addChild(cell);
      }
    }

    this._moveLayer = new Container();
    this.addChild(this._moveLayer);

    for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT; i += 1) {
      const colors = Object.keys(resources);
      const color = colors[Math.round(Math.random() * (colors.length - 1))];
      const cell = new CellSprite(resources[color]);
      const colorType = colorMap[color];
      if (colorType) {
        cell.setColor(colorType);
      }
      cell.renderable = false;
      this._bufferOfCells.push(cell);
    }

    for (let i = 0; i < 10; i += 1) {
      const text = new Text(
        '',
        {
          ...TEXT_STYLE,
          fontSize: 24,
        },
      );
      text.anchor.set(-0.5, 1);
      text.renderable = false;
      this._bufferOfScoreTexts.push(text);
      this._scoreContainer.addChild(text);
    }
  }

  private onPointerDown = (event: interaction.InteractionEvent) => {
    const pos = CellSprite.coordToCellPos(event.data.getLocalPosition(this));
    const cells = this.collectAllEqualCells(pos);
    const amount = cells.length;
    if (amount < 2) {
      return;
    }
    const initialEventCellPosition = {
      x: cells[0].cell.position.x,
      y: cells[0].cell.position.y,
    };
    const finalDestination = {
      x: SCENE_WIDTH * 0.5,
      y: -60,
    };
    for (let i = 0; i < amount; i += 1) {
      const cellNode = cells[i];
      const { cell } = cellNode;
      cellNode.cell = EMPTY_CELL;
      const source = {
        x: cell.position.x,
        y: cell.position.y,
      };
      const intermediateDestination = {
        x: initialEventCellPosition.x + (Math.random() * 2 - 1) * amount * 3,
        y: initialEventCellPosition.y + (Math.random() * 2 - 1) * amount * 3,
      };
      this._moveLayer.addChild(cell);
      const intermediateTween = new TWEEN.Tween(source)
        .to(intermediateDestination, 130)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(props => cell.position.set(props.x, props.y));
      const finalTween = new TWEEN.Tween(intermediateDestination)
        .to(finalDestination, 400)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(props => cell.position.set(props.x, props.y))
        .onComplete(() => {
          cell.renderable = false;
          this._cellsLayer.removeChild(cell);
          this._bufferOfCells.push(cell);
        });
      intermediateTween
        .chain(finalTween)
        .start();
    }
    this.putDownCells();
    this.updateScore(pos, cells.length);
  }

  private collectAllEqualCells(pos: Point): CellNode[] {
    const initialCell = this._map[pos.y][pos.x];
    const acc: CellNode[] = [];
    if (initialCell.cell !== EMPTY_CELL) {
      this.collectNearestEqualCells(initialCell, pos, acc);
    }
    return acc;
  }

  private collectNearestEqualCells(centralCell: CellNode, pos: { x: number, y: number }, acc: CellNode[]) {
    const { x: tileX, y: tileY } = pos;
    const nearestCells = [
      {x: tileX, y: tileY},
      {x: tileX, y: tileY - 1},
      {x: tileX, y: tileY + 1},
      {x: tileX - 1, y: tileY},
      {x: tileX + 1, y: tileY},
    ];
    const nearestCellsAmount = nearestCells.length;
    for (let i = 0; i < nearestCellsAmount; i += 1) {
      const { x, y } = nearestCells[i];
      if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) {
        continue;
      }
      const cellNode = this._map[y][x];
      if (acc.includes(cellNode)) {
        continue;
      }
      if (centralCell.cell.isColor(cellNode.cell.getColor())) {
        acc.push(cellNode);
        this.collectNearestEqualCells(cellNode, nearestCells[i], acc);
      }
    }
  }

  private putDownCells() {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const listOfCells = [];
      let amountOfEmptyCells = 0;
      let lowestEmptyCell = null;
      for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
        const { cell } = this._map[y][x];
        if (lowestEmptyCell) {
          if (cell !== EMPTY_CELL) {
            const cellNode = this._map[y][x];
            listOfCells.push(cellNode.cell);
            cellNode.cell = EMPTY_CELL;
          }
        } else if (cell === EMPTY_CELL) {
          lowestEmptyCell = { x, y };
        }
        if (cell === EMPTY_CELL) {
          amountOfEmptyCells += 1;
        }
      }

      const amount = listOfCells.length;
      if (amount && lowestEmptyCell) {
        for (let i = 0; i < amount; i += 1) {
          const { x: lowestX, y: lowestY } = lowestEmptyCell;
          const cellNode = this._map[lowestY - i][lowestX];
          const cell = listOfCells[i];
          const source = {
            x: cell.position.x,
            y: cell.position.y,
          };
          const destination = {
            x: calcX(lowestX),
            y: calcY(lowestY - i),
          };
          cellNode.cell = cell;
          new TWEEN.Tween(source)
            .to(destination, 800)
            .easing(TWEEN.Easing.Bounce.Out)
            .onUpdate(props => cell.position.set(props.x, props.y))
            .start();
        }
      }

      if (amountOfEmptyCells && lowestEmptyCell) {
        for (let i = amountOfEmptyCells - 1; i >= 0; i -= 1) {
          const cell = this._bufferOfCells.pop();
          if (cell) {
            const cellNode = this._map[i][x];
            const source = {
              alpha: 0,
              x: calcX(x),
              y: calcY(i - amountOfEmptyCells),
            };
            const destination = {
              alpha: 1,
              x: calcX(x),
              y: calcY(i),
            };
            this._cellsLayer.addChild(cell);
            cell.renderable = true;
            cellNode.cell = cell;
            new TWEEN.Tween(source)
              .to(destination, 800)
              .easing(TWEEN.Easing.Bounce.Out)
              .onUpdate(props => {
                cell.position.set(props.x, props.y);
                cell.alpha = props.alpha;
              })
              .start();
          }
        }
      }
    }
  }

  private updateScore(pos: Point, score: number) {
    this._score += score;
    this._scoreText.text = String(this._score);
    const text = this._bufferOfScoreTexts.pop();
    if (text) {
      const source = {
        alpha: 1,
        y: calcY(pos.y),
      };
      text.alpha = source.alpha;
      text.position.set(calcX(pos.x), source.y);
      text.renderable = true;
      text.text = String(score);
      const destination = {
        alpha: 0,
        y: source.y - 20,
      };
      new TWEEN.Tween(source)
        .to(destination, 1000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(props => {
          text.alpha = props.alpha;
          text.position.y = props.y;
        })
        .onComplete(() => {
          text.renderable = false;
          this._bufferOfScoreTexts.push(text);
        })
        .start();
    }
  }

  // private handleWinning() {
    // this._resultText.text = 'You are awesome!';
    // this._resultText.style.fill = ['#ffffff', '#00ff66'];
    // this.getChildByName('cells').interactive = false;
  // }

  // private handleLosing() {
    // this._resultText.text = 'Game Over';
    // this._resultText.style.fill = ['#ffffff', '#ff0066'];
    // this.getChildByName('cells').interactive = false;
  // }
}
