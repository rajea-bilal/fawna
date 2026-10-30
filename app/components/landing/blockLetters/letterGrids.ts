// Letter shapes as five-by-seven grids. "X" is a filled cell, "." is empty.
// Read top row first. Keep every grid exactly LETTER_ROWS strings of
// LETTER_COLS characters; `cellsForWord` checks this at build time.

export const LETTER_COLS = 5;
export const LETTER_ROWS = 7;
/** Empty columns between two letters. */
export const LETTER_GAP = 1;

type Grid = readonly [string, string, string, string, string, string, string];

export const LETTER_GRIDS: Readonly<Record<string, Grid>> = {
  A: [".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  C: [".XXXX", "X....", "X....", "X....", "X....", "X....", ".XXXX"],
  E: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "XXXXX"],
  I: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "XXXXX"],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
  R: ["XXXX.", "X...X", "X...X", "XXXX.", "X.X..", "X..X.", "X...X"],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
};

export type Cell = { col: number; row: number };

/** Width of a word in cells, letters plus the gaps between them. */
export function wordWidth(word: string): number {
  const n = word.length;
  return n * LETTER_COLS + Math.max(0, n - 1) * LETTER_GAP;
}

/** Every filled cell in the word, as (col, row) from the top-left. */
export function cellsForWord(word: string): Cell[] {
  const cells: Cell[] = [];
  [...word].forEach((letter, i) => {
    const grid = LETTER_GRIDS[letter];
    if (!grid) throw new Error(`No grid for letter "${letter}"`);
    const offset = i * (LETTER_COLS + LETTER_GAP);
    grid.forEach((line, row) => {
      if (line.length !== LETTER_COLS) {
        throw new Error(`Letter "${letter}" row ${row} is not ${LETTER_COLS} wide`);
      }
      [...line].forEach((ch, col) => {
        if (ch === "X") cells.push({ col: offset + col, row });
      });
    });
  });
  return cells;
}
