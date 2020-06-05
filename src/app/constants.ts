export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30;


export class KEYCODE {
    static readonly LEFT=37;
    static readonly RIGHT=39;
    static readonly DOWN=40;
    static readonly SPACE=32;
    static readonly UP=38;
}

/*
EX : 
const X = ‘x’;
const a = { [X]: 5 };
console.log(a.x); // 5
*/
export const COLORS = [
    'none',
    'cyan',
    'blue',
    'orange',
    'yellow',
    'green',
    'purple',
    'red'
];

export const SHAPES = [
    [],
    [[1, 1, 1, 1],[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    [[4, 4], [4, 4]],
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]
  ];

  export class Points {
    static readonly SINGLE = 100;
    static readonly DOUBLE = 300;
    static readonly TRIPLE = 500;
    static readonly TETRIS = 800;
    static readonly SOFT_DROP = 1;
    static readonly HARD_DROP = 2;
  }

  export const LINES_PER_LEVEL = 10;
  export class Level {
    static readonly 0 = 800;
    static readonly 1 = 720;
    static readonly 2 = 630;
    static readonly 3 = 550;
    static readonly 4 = 450;
    static readonly 5 = 360;
    static readonly 6 = 340;
    static readonly 7 = 320;
    static readonly 8 = 300;
    static readonly 9 = 290;
    static readonly 10 = 280;
    static readonly 11 = 270;
  }
