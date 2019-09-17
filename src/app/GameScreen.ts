import {
  Container,
  interaction,
  Point,
  Text,
  Texture,
} from 'pixi.js-legacy';
import shuffle from 'lodash.shuffle';
import TWEEN from '@tweenjs/tween.js';

import {
  CellBombSprite,
  CellEmptySprite,
  CellSprite,
} from './cells';
import Button from './Button';
import ProgressBar from './ProgressBar';
import {
  collectCellsInRadius,
  collectEqualCells,
} from './strategies';
import {
  EXPLOSION_RADIUS,
  GAME_FIELD_HEIGHT,
  GAME_FIELD_WIDTH,
  MAP_HEIGHT,
  MAP_WIDTH,
  MIN_EQUAL_CELLS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  TEXT_STYLE,
  TILE_HEIGHT,
  TILE_OFFSET_X,
  TILE_OFFSET_Y,
  TILE_WIDTH,
} from './consts';
import { CELLS_CONFIG } from './config';
import {
  CellsConfig,
  CellType,
  Strategy,
} from './types';

const EMPTY_GROUP_NAME = '';

export interface Resources {
  [key: string]: Texture;
}

function calcX(xPositionOnMap: number) {
  return xPositionOnMap * TILE_WIDTH + TILE_OFFSET_X;
}

function calcY(yPositionOnMap: number) {
  return yPositionOnMap * TILE_HEIGHT + TILE_OFFSET_Y;
}

function coordToCellPos(coord: Point) {
  return new Point(
    Math.floor((coord.x - TILE_OFFSET_X) / TILE_WIDTH),
    Math.floor((coord.y - TILE_OFFSET_Y) / TILE_HEIGHT),
  );
}

function placeOnMap(cell: CellSprite, pos: Point) {
  cell.position.set(calcX(pos.x), calcY(pos.y));
}

function *makeColorGenerator(distributions: CellsConfig, expectedBufferSize: number) {
  let buffer: CellType[] = [];
  for (const [typeName, { amount }] of Object.entries(distributions)) {
    buffer = buffer.concat(
      Array(amount * expectedBufferSize).fill(typeName),
    );
  }
  buffer = shuffle(buffer);
  const bufferSize = buffer.length;
  let j = 0;
  while (true) {
    yield buffer[j];
    j += 1;
    if (j >= bufferSize) {
      buffer = shuffle(buffer);
      j = 0;
    }
  }
}

export default class GameScreen extends Container {
  private TEXT_OFFSET = 10;
  private _map: CellSprite[][] = [];
  private _bufferOfCells: {[key: string]: CellSprite[]} = {};
  private _bufferOfScoreTexts: Text[] = [];
  private _moveLayer: Container;
  private _cellsLayer: Container;
  private _progressBar!: ProgressBar;
  private _scoreContainer: Container;
  private _resultText!: Text;
  private _scoreText!: Text;
  private _movesText!: Text;
  private _cellsGenerator: Iterator<any>;
  private _resources: Resources;
  private _targetScore: number;
  private _maxMoves: number;
  private _score: number = 0;
  private _moves: number = 0;
  private _strategies: {[key: string]: (position: Point) => [CellSprite[], Point[]]};

  constructor(resources: Resources) {
    super();
    this._resources = resources;
    this._maxMoves = 30;
    this._targetScore = 100;
    this._cellsGenerator = makeColorGenerator(CELLS_CONFIG, MAP_WIDTH * MAP_HEIGHT * 3);

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

    this._strategies = {};
    const strategiesMapping = new Map();
    strategiesMapping.set(
      Strategy.equals,
      (position: Point) => collectEqualCells(this._map, position, MIN_EQUAL_CELLS),
    );
    strategiesMapping.set(
      Strategy.explosion,
      (position: Point) => collectCellsInRadius(this._map, position, EXPLOSION_RADIUS),
    );
    for (const [typeName, { strategy } ]of Object.entries(CELLS_CONFIG)) {
      this._strategies[typeName] = strategiesMapping.get(strategy);
    }
  }

  public restart() {
    this.handleRestart();
  }

  private onPointerDown = (event: interaction.InteractionEvent) => {
    const initialCellPos = coordToCellPos(event.data.getLocalPosition(this));
    const initialCell = this.getCell(initialCellPos);
    const execStragegy = this._strategies[initialCell.getGroupName()];
    if (!execStragegy) {
      return;
    }
    const [cells, coordinates] = execStragegy(initialCellPos);
    const amount = cells.length;
    if (amount === 0) {
      return;
    }
    const initialEventCellPosition = {
      x: cells[0].position.x,
      y: cells[0].position.y,
    };
    const finalDestination = {
      x: TILE_OFFSET_X,
      y: -60,
    };
    for (let i = 0; i < amount; i += 1) {
      const cell = cells[i];
      const coord = coordinates[i];
      if (!cell) {
        continue;
      }
      this._map[coord.y][coord.x] = this.prepareCell(EMPTY_GROUP_NAME);
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
          this.pushToBuffer(cell);
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

  private putDownCells() {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const listOfCells = [];
      let amountOfEmptyCells = 0;
      let lowestEmptyCell = null;
      for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
        const cell = this._map[y][x];
        if (lowestEmptyCell) {
          if (cell.isNotEmpty()) {
            listOfCells.push(cell);
            this._map[y][x] = this.prepareCell(EMPTY_GROUP_NAME);
          }
        } else if (cell.isEmpty()) {
          lowestEmptyCell = { x, y };
        }
        if (cell.isEmpty()) {
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
          this.pushToBuffer(this._map[lowestY - i][lowestX]);
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
          const cellType = this._cellsGenerator.next().value;
          const cell = this.prepareCell(cellType);
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
            this._cellsLayer.addChild(cell);
            cell.alpha = 0;
            cell.position.set(source.x, source.y);
            cell.renderable = true;
            this.pushToBuffer(this._map[i][x]);
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

  private getCell(pos: Point) {
    return this._map[pos.y][pos.x];
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
        const cellType = this._cellsGenerator.next().value;
        const cell = this.prepareCell(cellType);
        placeOnMap(cell, new Point(x, y));
        cell.renderable = true;
        const mapCell = this._map[y][x];
        if (mapCell.isNotEmpty()) {
          mapCell.renderable = false;
          mapCell.position.x = -mapCell.width - 1;
          this.pushToBuffer(mapCell);
        }
        this._map[y][x] = cell;
        this._cellsLayer.addChild(cell);
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

  private prepareCell(groupName: string) {
    const array = this._bufferOfCells[groupName];
    let cell;
    if (array && array.length) {
      cell = array.pop();
    }
    if (!cell) {
      const config = CELLS_CONFIG[groupName];
      if (config) {
        const { cellType, texture } = config;
        switch (cellType) {
          case CellType.regular:
            cell = new CellSprite(this._resources[texture], groupName);
            break;
          case CellType.bomb:
            cell = new CellBombSprite(this._resources[texture], groupName);
            break;
          default:
            cell = new CellEmptySprite();
            break;
        }
      } else {
        cell = new CellEmptySprite();
      }
    }
    cell.renderable = false;
    return cell;
  }

  private pushToBuffer(cell: CellSprite) {
    const array = this._bufferOfCells[cell.getGroupName()];
    if (array) {
      array.push(cell);
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
    this._map = Array(MAP_HEIGHT).fill(null).map(
      () => Array(MAP_WIDTH).fill(null).map(() => this.prepareCell('')),
    );
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
