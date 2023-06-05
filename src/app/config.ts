import {TEXTURES_ENUM} from './consts';
import {
  CellsConfig,
  CellType,
  Strategy,
} from './types';

// amount is a term that applies to the whole amount of cells in a distribution function
export const CELLS_CONFIG: CellsConfig = {
  blue: {
    amount: 0.19,
    texture: TEXTURES_ENUM.BLOCK_BLUE,
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  green: {
    amount: 0.19,
    texture: TEXTURES_ENUM.BLOCK_GREEN,
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  purple: {
    amount: 0.19,
    texture: TEXTURES_ENUM.BLOCK_PURPLE,
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  red: {
    amount: 0.19,
    texture: TEXTURES_ENUM.BLOCK_RED,
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  yellow: {
    amount: 0.19,
    texture: TEXTURES_ENUM.BLOCK_YELLOW,
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  bomb: {
    amount: 0.05,
    texture: TEXTURES_ENUM.BLOCK_BOMB,
    strategy: Strategy.explosion,
    cellType: CellType.bomb,
  },
};
