import {
  CellsConfig,
  CellType,
  Strategy,
} from './types';

// amount is a term that applies to the whole amount of cells in a distribution function
export const CELLS_CONFIG: CellsConfig = {
  blue: {
    amount: 0.19,
    texture: 'block_blue',
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  green: {
    amount: 0.19,
    texture: 'block_green',
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  purple: {
    amount: 0.19,
    texture: 'block_purple',
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  red: {
    amount: 0.19,
    texture: 'block_red',
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  yellow: {
    amount: 0.19,
    texture: 'block_yellow',
    strategy: Strategy.equals,
    cellType: CellType.regular,
  },
  bomb: {
    amount: 0.05,
    texture: 'block_blue',
    strategy: Strategy.explosion,
    cellType: CellType.bomb,
  },
};
