import {
  Sprite,
  Texture,
} from 'pixi.js-legacy';

export class CellSprite extends Sprite {
  private _groupName: string;

  constructor(texture: Texture, groupName: string) {
    super(texture);
    this.scale.set(0.233, 0.233);
    this._groupName = groupName;
  }

  public getGroupName() {
    return this._groupName;
  }

  public isEmpty() {
    return false;
  }

  public isNotEmpty() {
    return !this.isEmpty();
  }
}
