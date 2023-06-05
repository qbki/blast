import {
  Container,
  Graphics,
  Matrix,
  Texture,
} from 'pixi.js';

interface ProgressBarProps {
  barTexture: Texture;
  bgTexture: Texture;
  width: number;
}

export default class ProgressBar extends Container {
  private static HEIGHT = 32;
  private static ROUND = 17;
  private _bar: Graphics;

  constructor({ barTexture, bgTexture, width }: ProgressBarProps) {
    super();
    const Self = ProgressBar;
    this._width = width;
    const scale = Matrix.IDENTITY.scale(1, 0.5);

    const bg = new Graphics();
    bg.beginTextureFill({
        texture: bgTexture,
        color: 0xffffff,
        alpha: 1,
        matrix: scale
    });
    bg.drawRoundedRect(0, 0, width, Self.HEIGHT, Self.ROUND);
    bg.endFill();

    const mask = new Graphics();
    mask.beginTextureFill({
        texture: bgTexture,
        color: 0xffffff,
        alpha: 1,
        matrix: scale
    });
    mask.drawRoundedRect(0, 0, width, Self.HEIGHT, Self.ROUND);
    mask.endFill();

    const bar = new Graphics();
    this._bar = bar;
    bar.beginTextureFill({
      texture: barTexture,
      color: 0xffffff,
      alpha: 1,
      matrix: scale
    });
    bar.drawRoundedRect(-width, 0, width, Self.HEIGHT, Self.ROUND);
    bar.endFill();

    this._bar.mask = mask;
    this.addChild(mask);
    this.addChild(bg);
    this.addChild(bar);
  }

  public update(progress: number) {
    this._bar.position.x = this._width * Math.min(progress, 1);
  }
}
