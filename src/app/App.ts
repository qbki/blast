import {
  Application,
  filters,
  Loader,
  LoaderResource,
} from 'pixi.js-legacy';
import TWEEN from '@tweenjs/tween.js';

import GameScreen, { Resources } from './GameScreen';
import TitleScreen from './TitleScreen';
import MenuScreen from './MenuScreen';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from './consts';

export default class App {
  private _app: Application;
  private _loader: Loader;

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
    this._loader = new Loader();
    this._loader
      .add('bar', 'images/bar.png')
      .add('bar_bg', 'images/bar_bg.png')
      .add('block_blue', 'images/blue.png')
      .add('block_green', 'images/green.png')
      .add('block_purple', 'images/purple.png')
      .add('block_red', 'images/red.png')
      .add('block_yellow', 'images/yellow.png')
      .load(this.onLoadResources);
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

  private onLoadResources = (_: unknown, res: Partial<Record<string, LoaderResource>>) => {
    if (!res) {
      window.console.error('Can\'t load resources');
      return;
    }
    const game = new GameScreen(Object.keys(res).reduce(
      (acc: Resources, name: string) => {
        acc[name] = res[name]!.texture;
        return acc;
      },
      {},
    ));
    const title = new TitleScreen();
    const menu = new MenuScreen();
    const blurFilter = new filters.BlurFilter();

    title.visible = true;
    title.on('start', () => {
      title.visible = false;
      game.visible = true;
    });
    this._app.stage.addChild(title);

    game.visible = false;
    game.on('menu', () => {
      game.interactiveChildren = false;
      game.filters = [blurFilter];
      menu.visible = true;
    });
    this._app.stage.addChild(game);

    menu.visible = false;
    menu.on('tomenu', () => {
      game.filters = [];
      menu.visible = false;
      game.visible = false;
      game.restart();
      game.interactiveChildren = true;
      title.visible = true;
    });
    menu.on('resume', () => {
      game.filters = [];
      menu.visible = false;
      game.interactiveChildren = true;
    });
    this._app.stage.addChild(menu);
  }
}
