import { CellType } from './types';

export const SCENE_WIDTH = 800;
export const SCENE_HEIGHT = 600;
export const MAP_WIDTH = 10;
export const MAP_HEIGHT = 10;
export const TILE_WIDTH = 40;
export const TILE_HEIGHT = 40;
export const EXPLOSION_RADIUS = 2;
export const BOMB_APPEARANCE_CHANCE = 0.05;
export const MIN_EQUAL_CELLS = 2;
// amount is a term that applies to the whole amount of cells in a distribution function
export const CELLS_DISTRIBUTION = [
  { cellType: CellType.blue, amount: 0.19 },
  { cellType: CellType.green, amount: 0.19 },
  { cellType: CellType.purple, amount: 0.19 },
  { cellType: CellType.red, amount: 0.19 },
  { cellType: CellType.yellow, amount: 0.19 },
  { cellType: CellType.bomb, amount: 0.05 },
];
export const GAME_FIELD_WIDTH = TILE_WIDTH * MAP_WIDTH;
export const GAME_FIELD_HEIGHT = TILE_HEIGHT * MAP_HEIGHT;
export const TILE_OFFSET_X = Math.round((SCENE_WIDTH - GAME_FIELD_WIDTH) / 2);
export const TILE_OFFSET_Y = Math.round((SCENE_HEIGHT - GAME_FIELD_HEIGHT) / 2);

export const TEXT_STYLE = {
  fontFamily: 'Arial',
  fontSize: 36,
  fontWeight: 'bold',
  fill: ['#ffffff', '#00ff99'],
  stroke: '#4a1850',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 3,
  lineJoin: 'round',
  padding: 8,
};
