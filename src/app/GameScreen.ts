import {
  Container,
  interaction,
  Point,
  Text,
  Texture,
} from 'pixi.js-legacy';
import shuffle from 'lodash.shuffle';
import TWEEN from '@tweenjs/tween.js';

import CellSprite, { CellColor } from './CellSprite';
import Button from './Button';
import ProgressBar from './ProgressBar';
import {
  GAME_FIELD_HEIGHT,
  GAME_FIELD_WIDTH,
  MAP_HEIGHT,
  MAP_WIDTH,
  SCENE_HEIGHT,
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

interface Coordinate {
  x: number;
  y: number;
}

const EMPTY_CELL = new CellSprite(Texture.EMPTY);
EMPTY_CELL.renderable = false;
EMPTY_CELL.setColor(CellColor.none);

function calcX(xPositionOnMap: number) {
  return xPositionOnMap * TILE_WIDTH + TILE_OFFSET_X;
}

function calcY(yPositionOnMap: number) {
  return yPositionOnMap * TILE_HEIGHT + TILE_OFFSET_Y;
}

function *makeColorGenerator<T>(colors: T[], bufferSize: number) {
  let buffer = [];
  const amountOfColors = colors.length;
  const alignedBufferSize = amountOfColors * Math.ceil(bufferSize / amountOfColors);
  for (let i = 0; i < alignedBufferSize; i += 1) {
    buffer.push(colors[i % amountOfColors]);
  }
  buffer = shuffle(buffer);
  let j = 0;
  while (true) {
    yield buffer[j];
    j += 1;
    if (j >= alignedBufferSize) {
      j = 0;
    }
  }
}

function mapColorToResource(color: CellColor) {
  let result = null;
  switch (color) {
    case CellColor.blue: result = 'block_blue'; break;
    case CellColor.green: result = 'block_green'; break;
    case CellColor.purple: result = 'block_purple'; break;
    case CellColor.red: result = 'block_red'; break;
    case CellColor.yellow: result = 'block_yellow'; break;
  }
  return result;
}

export default class GameScreen extends Container {
  private TEXT_OFFSET = 10;
  private _map: CellSprite[][] = [];
  private _bufferOfCells: CellSprite[] = [];
  private _bufferOfScoreTexts: Text[] = [];
  private _moveLayer: Container;
  private _cellsLayer: Container;
  private _progressBar!: ProgressBar;
  private _scoreContainer: Container;
  private _resultText!: Text;
  private _scoreText!: Text;
  private _movesText!: Text;
  private _colorIterator: Iterator<any>;
  private _resources: Resources;
  private _targetScore: number;
  private _maxMoves: number;
  private _score: number = 0;
  private _moves: number = 0;

  constructor(resources: Resources) {
    super();
    this._resources = resources;
    this._maxMoves = 30;
    this._targetScore = 100;
    this._colorIterator = makeColorGenerator([
      CellColor.blue,
      CellColor.green,
      CellColor.purple,
      CellColor.red,
      CellColor.yellow,
    ], 100);

    const restartButton = new Button({
      x: TILE_OFFSET_X + GAME_FIELD_WIDTH,
      y: TILE_OFFSET_Y - this.TEXT_OFFSET,
      caption: 'Restart',
      anchor: new Point(1, 1),
      style: { fontSize: 24 },
    });
    restartButton.on('pointerup', this.handleRestart);
    this.addChild(restartButton);

    const menuButton = new Button({
      x: TILE_OFFSET_X + GAME_FIELD_WIDTH,
      y: TILE_OFFSET_Y + GAME_FIELD_HEIGHT + this.TEXT_OFFSET,
      caption: 'Pause',
      anchor: new Point(1, 0),
      style: { fontSize: 24 },
    });
    menuButton.on('pointerup', () => this.emit('menu'));
    this.addChild(menuButton);

    this.initProgressBar();
    this.initScore();
    this.initMoves();

    this._cellsLayer = new Container();
    this._cellsLayer.interactive = true;
    this._cellsLayer.on('pointerdown', this.onPointerDown);
    this.addChild(this._cellsLayer);

    this.initResultText();

    this._scoreContainer = new Container();
    this.addChild(this._scoreContainer);

    this.initCells();

    this._moveLayer = new Container();
    this.addChild(this._moveLayer);

    for (let i = 0; i < 10; i += 1) {
      const text = new Text('', { ...TEXT_STYLE, fontSize: 24 });
      text.anchor.set(-0.5, 1);
      text.renderable = false;
      this._bufferOfScoreTexts.push(text);
      this._scoreContainer.addChild(text);
    }
  }

  private onPointerDown = (event: interaction.InteractionEvent) => {
    const initialCellPos = CellSprite.coordToCellPos(event.data.getLocalPosition(this));
    const [cells, coordinates] = this.collectAllEqualCells(initialCellPos);
    const amount = cells.length;
    if (amount < 2) {
      return;
    }
    const initialEventCellPosition = {
      x: cells[0].position.x,
      y: cells[0].position.y,
    };
    const finalDestination = {
      x: SCENE_WIDTH * 0.5,
      y: -60,
    };
    for (let i = 0; i < amount; i += 1) {
      const cell = cells[i];
      const coord = coordinates[i];
      if (!cell) {
        continue;
      }
      this._map[coord.y][coord.x] = EMPTY_CELL;
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
    this.incrementScore(initialCellPos, cells.length);
    this.updateProgressBar();
    this.updateMoves(this._moves - 1);
    this.checkWinningConditions();
  }

  private collectAllEqualCells(pos: Point): [CellSprite[], Coordinate[]] {
    const initialCell = this._map[pos.y][pos.x];
    const cellsAcc: CellSprite[] = [];
    const coordAcc: Coordinate[] = [];
    if (initialCell !== EMPTY_CELL) {
      this.collectNearestEqualCells(initialCell, pos, cellsAcc, coordAcc);
    }
    return [cellsAcc, coordAcc];
  }

  private collectNearestEqualCells(
    centralCell: CellSprite,
    pos: Coordinate,
    acc: CellSprite[],
    coordAcc: Coordinate[],
  ) {
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
      if (centralCell.isColor(cellNode.getColor())) {
        acc.push(cellNode);
        coordAcc.push(nearestCells[i]);
        this.collectNearestEqualCells(cellNode, nearestCells[i], acc, coordAcc);
      }
    }
  }

  private putDownCells() {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const listOfCells = [];
      let amountOfEmptyCells = 0;
      let lowestEmptyCell = null;
      for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
        const cell = this._map[y][x];
        if (lowestEmptyCell) {
          if (cell !== EMPTY_CELL) {
            listOfCells.push(this._map[y][x]);
            this._map[y][x] = EMPTY_CELL;
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
          const cell = listOfCells[i];
          const source = {
            x: cell.position.x,
            y: cell.position.y,
          };
          const destination = {
            x: calcX(lowestX),
            y: calcY(lowestY - i),
          };
          this._map[lowestY - i][lowestX] = cell;
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
            const colorType = this._colorIterator.next().value;
            const resName = mapColorToResource(colorType);
            if (resName) {
              cell.setColor(colorType);
              cell.setTexture(this._resources[resName]);
            }
            this._cellsLayer.addChild(cell);
            cell.alpha = 0;
            cell.position.set(source.x, source.y);
            cell.renderable = true;
            this._map[i][x] = cell;
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

  private updateScore(score: number) {
    this._scoreText.text = `${this._targetScore} / ${this._score}`;
  }

  private updateMoves(moves: number) {
    this._moves = moves;
    this._movesText.text = String(moves);
  }

  private updateProgressBar = () => {
    const ratio = this._score / this._targetScore;
    this._progressBar.update(ratio);
  }

  private checkWinningConditions() {
    if (this._score >= this._targetScore) {
      this.handleWinning();
    } else if (this._moves <= 0) {
      this.handleLosing();
    }
  }

  private placeCellsOnMap() {
    for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const colorType = this._colorIterator.next().value;
        const resName = mapColorToResource(colorType);
        if (!resName) {
          break;
        }
        const cell = this._bufferOfCells.pop();
        if (cell) {
          cell.setColor(colorType);
          cell.setTexture(this._resources[resName]);
          cell.placeOnMap(x, y);
          cell.renderable = true;
          const mapCell = this._map[y][x];
          if (mapCell !== EMPTY_CELL) {
            mapCell.renderable = false;
            mapCell.position.x = -mapCell.width - 1;
            this._bufferOfCells.push(mapCell);
          }
          this._map[y][x] = cell;
          this._cellsLayer.addChild(cell);
        }
      }
    }
  }

  private incrementScore(pos: Point, score: number) {
    this._score += score;
    this.updateScore(score);
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

  private initResultText() {
    this._resultText = new Text('', { ...TEXT_STYLE, fontSize: 36 });
    this._resultText.anchor.set(0.5, 1);
    this._resultText.position.set(SCENE_WIDTH * 0.5, SCENE_HEIGHT * 0.5);
    this._resultText.renderable = false;
    this.addChild(this._resultText);
  }

  private initCells() {
    this._map = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(EMPTY_CELL));
    for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT * 2; i += 1) {
      const colorType = this._colorIterator.next().value;
      const resName = mapColorToResource(colorType);
      if (!resName) {
        break;
      }
      const cell = new CellSprite(this._resources.blue);
      cell.setColor(CellColor.none);
      cell.renderable = false;
      cell.position.x = -cell.width - 1;
      this._bufferOfCells.push(cell);
    }
    this.placeCellsOnMap();
  }

  private initProgressBar() {
    this._progressBar = new ProgressBar({
      barTexture: this._resources.bar,
      bgTexture: this._resources.bar_bg,
      width: 150,
    });
    this._progressBar.update(0);
    this._progressBar.position.set(TILE_OFFSET_X, TILE_OFFSET_Y - 45);
    this.addChild(this._progressBar);
  }

  private initScore() {
    this._scoreText = new Text('', { ...TEXT_STYLE, fontSize: 24 });
    this._scoreText.anchor.set(0.5, 1);
    this._scoreText.position.set(TILE_OFFSET_X + 75, TILE_OFFSET_Y - this.TEXT_OFFSET);
    this.addChild(this._scoreText);
    this.updateScore(0);
  }

  private initMoves() {
    this._moves = this._maxMoves;
    this._movesText = new Text(String(this._moves), { ...TEXT_STYLE, fontSize: 24 });
    this._movesText.anchor.set(0.5, 1);
    this._movesText.position.set(SCENE_WIDTH * 0.54, TILE_OFFSET_Y - this.TEXT_OFFSET);
    this.addChild(this._movesText);
    this.updateMoves(this._moves);
  }

  private handleWinning() {
    this._resultText.text = 'You are awesome!';
    this._resultText.style.fill = ['#ffffff', '#00ff66'];
    this._resultText.renderable = true;
    this._cellsLayer.interactive = false;
  }

  private handleLosing() {
    this._resultText.text = 'Game Over';
    this._resultText.style.fill = ['#ffffff', '#ff0066'];
    this._resultText.renderable = true;
    this._cellsLayer.interactive = false;
  }

  private handleRestart = () => {
    this._score = 0;
    this._moves = this._maxMoves;
    this.updateScore(0);
    this.updateMoves(this._maxMoves);
    this.updateProgressBar();
    this.placeCellsOnMap();
    this._resultText.renderable = false;
    this._cellsLayer.interactive = true;
  }
}
