export const SCENE_WIDTH = 800;
export const SCENE_HEIGHT = 600;
export const MAP_WIDTH = 10;
export const MAP_HEIGHT = 10;
export const TILE_WIDTH = 40;
export const TILE_HEIGHT = 40;
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
