import {
  Container,
  Point,
  Text,
  Texture,
} from 'pixi.js-legacy';

import CellSprite from './CellSprite';
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
    this.addChild(cellsContainer);

    this._map = Array(MAP_HEIGHT).fill([]);
    for (let y = MAP_HEIGHT - 1; y >= 0; y -= 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const colors = Object.keys(resources);
        const color = colors[Math.round(Math.random() * (colors.length - 1))];
        const cell = new CellSprite(resources[color]);
        cell.placeOnMap(x, y);
        this._map[y].push(cell);
        cellsContainer.addChild(cell);
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
