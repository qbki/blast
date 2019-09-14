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
  TILE_OFFSET_X,
  TILE_OFFSET_Y,
} from './consts';

export interface Resources {
  [key: string]: Texture;
}

export default class MenuScreen extends Container {
  private _map: CellSprite[][] = [];
  private _moveLayer: Container;
  private _infoText: Text;
  private _resultText: Text;

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

    this._infoText = new Text(
      '',
      {
        ...TEXT_STYLE,
        fontSize: 24,
      },
    );
    this._infoText.anchor.set(0, 1);
    this._infoText.position.set(TILE_OFFSET_X, TILE_OFFSET_Y - textOffset);
    this.addChild(this._infoText);

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
    cellsContainer.name = 'cells';
    cellsContainer.interactive = true;
    cellsContainer.on('pointerdown', this.onPointerDown);
    this.addChild(cellsContainer);

    this._map = Array(MAP_HEIGHT).fill(null).map(() => []);
    const colorMap: {[key: string]: CellColor} = {
      blue_cell: CellColor.blue,
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
        if (colorType !== undefined) {
          cell.setColor(colorType);
        }
        cell.placeOnMap(x, y);
        this._map[y].push(cell);
        cellsContainer.addChild(cell);
      }
    }

    this._moveLayer = new Container();
    this.addChild(this._moveLayer);
  }

  private onPointerDown = (event: interaction.InteractionEvent) => {
    const pos = CellSprite.coordToCellPos(event.data.getLocalPosition(this));
    const cells = this.collectAllEqualCells(pos);
    const amount = cells.length;
    if (amount < 2) {
      return;
    }

    for (let i = 0; i < amount; i += 1) {
      const cell = cells[i];
      const source = {
        x: cell.position.x,
        y: cell.position.y,
      };
      const intermediateDestination = {
        x: cells[0].position.x + (Math.random() * 2 - 1) * 40,
        y: cells[0].position.y + (Math.random() * 2 - 1) * 40,
      };
      const finalDestination = {
        x: SCENE_WIDTH * 0.5,
        y: -60,
      };
      this._moveLayer.addChild(cell);
      const intermediateTween = new TWEEN.Tween(source)
        .to(intermediateDestination, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(arg => cell.position.set(arg.x, arg.y));
      const finalTween = new TWEEN.Tween(intermediateDestination)
        .to(finalDestination, 400)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(arg => cell.position.set(arg.x, arg.y));
      intermediateTween.chain(finalTween).start();
    }
  }

  private collectAllEqualCells(pos: Point): CellSprite[] {
    const initialSprite = this._map[pos.y][pos.x];
    const acc: CellSprite[] = [];
    this.collectNearestEqualCells(initialSprite, acc);
    return acc;
  }

  private collectNearestEqualCells(centralCell: CellSprite, acc: CellSprite[]) {
    const { x: tileX, y: tileY } = centralCell.tilePos();
    const nearestCells = [
      {x: tileX, y: tileY},
      {x: tileX, y: tileY - 1},
      {x: tileX, y: tileY + 1},
      {x: tileX - 1, y: tileY},
      {x: tileX + 1, y: tileY},
    ];
    const nearestCellsamount = nearestCells.length;
    for (let i = 0; i < nearestCellsamount; i += 1) {
      const { x, y } = nearestCells[i];
      if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) {
        continue;
      }
      const cell = this._map[y][x];
      if (acc.includes(cell)) {
        continue;
      }
      if (centralCell.isColor(cell.getColor())) {
        acc.push(centralCell);
        this.collectNearestEqualCells(cell, acc);
      }
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
