export type BlockLettersColors = {
  /** Faces that look at the viewer. */
  front: string;
  /** Left and right faces, seen when the word turns. */
  side: string;
  /** Top and bottom faces. Hidden while rotation is only around Y. */
  top: string;
  /** Cube edges. */
  outline: string;
};

export type BlockLettersConfig = {
  colors: BlockLettersColors;
  /** One full rock, left to right and back, in seconds. */
  periodSeconds: number;
  /** How far the word turns each way, in degrees. */
  amplitudeDegrees: number;
  /** Cube depth in cells. Deeper cubes show a wider side when turned:
   *  visible side = depth × sin(amplitude). */
  depth: number;
  /** Outline thickness in CSS pixels, for the canvas and the SVG alike. */
  outlineWidth: number;
};

// "Lamplight on linen" (ADR-020). The front is the lamp's amber, the
// sides are the terracotta floor, the outline is the hero's espresso.
export const DEFAULT_BLOCK_LETTERS: BlockLettersConfig = {
  colors: {
    front: "#e9a43f",
    side: "#a8482a",
    top: "#c9752f",
    outline: "#26160e",
  },
  periodSeconds: 11,
  amplitudeDegrees: 20,
  depth: 1.6,
  outlineWidth: 1.5,
};

/** Empty space around the word, in cells. Shared by the canvas and the
 *  static fallback so both frame the word the same way. */
export const FRAME_MARGIN = 0.75;
