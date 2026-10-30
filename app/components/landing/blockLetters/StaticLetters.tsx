import { FRAME_MARGIN, type BlockLettersColors } from "./config";
import { LETTER_ROWS, cellsForWord, wordWidth } from "./letterGrids";

type Props = {
  word: string;
  colors: BlockLettersColors;
  outlineWidth: number;
  className?: string;
};

// The front-facing word as plain SVG. Shown before the 3D canvas loads,
// and instead of it when motion is reduced or WebGL is missing. Uses the
// same framing as the canvas, so the handover is invisible.
export default function StaticLetters({
  word,
  colors,
  outlineWidth,
  className,
}: Props) {
  const width = wordWidth(word);
  const height = LETTER_ROWS;
  const halfW = width / 2 + FRAME_MARGIN;
  const halfH = height / 2 + FRAME_MARGIN;

  return (
    <svg
      viewBox={`${-halfW} ${-halfH} ${halfW * 2} ${halfH * 2}`}
      className={className}
      aria-hidden
      focusable="false"
    >
      {cellsForWord(word).map(({ col, row }) => (
        <rect
          key={`${col}-${row}`}
          x={col - width / 2}
          y={row - height / 2}
          width={1}
          height={1}
          fill={colors.front}
          stroke={colors.outline}
          strokeWidth={outlineWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
