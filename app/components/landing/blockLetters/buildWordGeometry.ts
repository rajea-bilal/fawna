import {
  BoxGeometry,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { BlockLettersColors } from "./config";
import { LETTER_ROWS, cellsForWord, wordWidth } from "./letterGrids";

export type WordGeometry = {
  /** All cubes merged into one mesh. Colour lives on the vertices. */
  solid: BufferGeometry;
  /** All cube edges merged into one line set. */
  edges: BufferGeometry;
  /** Size of the word in cells. */
  width: number;
  height: number;
};

// One cube per filled cell, all merged so the word draws in two calls:
// one for the faces, one for the outlines. Each vertex gets a colour from
// its face normal, so one material can paint front and side differently.
export function buildWordGeometry(
  word: string,
  colors: BlockLettersColors,
  depth = 1,
): WordGeometry {
  const width = wordWidth(word);
  const height = LETTER_ROWS;
  const front = new Color(colors.front);
  const side = new Color(colors.side);
  const top = new Color(colors.top);

  const unit = new BoxGeometry(1, 1, depth);
  const normals = unit.getAttribute("normal");
  const rgb: number[] = [];
  for (let i = 0; i < normals.count; i++) {
    const nx = Math.abs(normals.getX(i));
    const nz = Math.abs(normals.getZ(i));
    const c = nz > 0.5 ? front : nx > 0.5 ? side : top;
    rgb.push(c.r, c.g, c.b);
  }
  unit.setAttribute("color", new Float32BufferAttribute(rgb, 3));
  const unitEdges = new EdgesGeometry(unit);

  const boxes: BufferGeometry[] = [];
  const outlines: BufferGeometry[] = [];
  for (const { col, row } of cellsForWord(word)) {
    // Centre the word on the origin. Three's y points up, the grid's row
    // counts down, so flip it.
    const x = col - width / 2 + 0.5;
    const y = height / 2 - row - 0.5;
    boxes.push(unit.clone().translate(x, y, 0));
    outlines.push(unitEdges.clone().translate(x, y, 0));
  }

  const solid = mergeGeometries(boxes);
  const edges = mergeGeometries(outlines);
  for (const g of [...boxes, ...outlines, unit, unitEdges]) g.dispose();
  if (!solid || !edges) throw new Error(`Could not build geometry for "${word}"`);

  return { solid, edges, width, height };
}
