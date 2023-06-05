import {
  Application,
  Assets,
  BlurFilter,
  Texture,
} from 'pixi.js';
import TWEEN from '@tweenjs/tween.js';

import GameScreen from './GameScreen';
import TitleScreen from './TitleScreen';
import MenuScreen from './MenuScreen';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
  TEXTURES_ENUM,
} from './consts';

export default class App {
  private _app: Application<HTMLCanvasElement>;

  public constructor(domRoot: HTMLDivElement) {
    this._app = new Application({
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
      backgroundColor: 0x1099bb,
      resolution: 1,
      antialias: false,
    });
    domRoot.appendChild(this._app.view);
    domRoot.addEventListener('contextmenu', e => e.preventDefault());

    Assets.add(TEXTURES_ENUM.BAR, 'images/bar.png');
    Assets.add(TEXTURES_ENUM.BAR_BG, 'images/bar_bg.png');
    Assets.add(TEXTURES_ENUM.BLOCK_BLUE, 'images/blue.png');
    Assets.add(TEXTURES_ENUM.BLOCK_GREEN, 'images/green.png');
    Assets.add(TEXTURES_ENUM.BLOCK_PURPLE, 'images/purple.png');
    Assets.add(TEXTURES_ENUM.BLOCK_RED, 'images/red.png');
    Assets.add(TEXTURES_ENUM.BLOCK_YELLOW, 'images/yellow.png');
    Assets.add(TEXTURES_ENUM.BLOCK_BOMB, 'images/bomb.png');
    Assets.load(Object.values(TEXTURES_ENUM)).then(this.onLoadResources);
  }

  public run() {
    this._app.ticker.autoStart = false;
    this._app.ticker.stop();
    const animate = (time: number) => {
      requestAnimationFrame(animate);
      this._app.ticker.update(time);
      TWEEN.update(time);
    };
    animate(performance.now());
  }

  private onLoadResources = (res: Record<TEXTURES_ENUM, Texture>) => {
    const gameScreen = new GameScreen(res);
    const titleScreen = new TitleScreen();
    const menuScreen = new MenuScreen();

    const blurFilter = new BlurFilter();

    titleScreen.visible = true;
    titleScreen.on('start', () => {
      titleScreen.visible = false;
      gameScreen.visible = true;
    });
    this._app.stage.addChild(titleScreen);

    gameScreen.visible = false;
    gameScreen.on('menu', () => {
      gameScreen.interactiveChildren = false;
      gameScreen.filters = [blurFilter];
      menuScreen.visible = true;
    });
    this._app.stage.addChild(gameScreen);

    menuScreen.visible = false;
    menuScreen.on('tomenu', () => {
      gameScreen.filters = [];
      menuScreen.visible = false;
      gameScreen.visible = false;
      gameScreen.restart();
      gameScreen.interactiveChildren = true;
      titleScreen.visible = true;
    });
    menuScreen.on('resume', () => {
      gameScreen.filters = [];
      menuScreen.visible = false;
      gameScreen.interactiveChildren = true;
    });
    this._app.stage.addChild(menuScreen);
  };
}
