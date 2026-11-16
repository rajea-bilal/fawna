// Fawna's "working on it" picture (issue #18): two line-drawn bricks, the top one
// lifting off and settling back, like building. Used while marking and while
// cards are written. Reduced motion: the bricks sit still.

// One 2×2 brick in isometric view. Studs are drawn back to front so nearer ones
// cover farther ones.
function Brick({ fill }: { fill: string }) {
  const studs = [
    [84, 36],
    [56, 50],
    [112, 50],
    [84, 64],
  ];
  return (
    <g fill={fill}>
      <polygon points="28,50 84,78 84,108 28,80" />
      <polygon points="84,78 140,50 140,80 84,108" />
      <polygon points="84,22 140,50 84,78 28,50" />
      {studs.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${x - 12} ${y}v-7a12 6 0 0 0 24 0v7a12 6 0 0 1-24 0z`} />
          <ellipse cx={x} cy={y - 7} rx="12" ry="6" />
        </g>
      ))}
    </g>
  );
}

// `still`: no loop. The top brick sits on the bottom one and only moves when
// `liftClassName` says so (e.g. on hover or while a photo is dragged over).
export default function BuildingBricks({
  className = "",
  still = false,
  liftClassName = "",
  shadowClassName = "",
}: {
  className?: string;
  still?: boolean;
  liftClassName?: string;
  shadowClassName?: string;
}) {
  const shadowMotion = still
    ? `transition-opacity duration-250 ease-snappy ${shadowClassName}`
    : "motion-safe:animate-brick-shadow";
  const liftMotion = still
    ? `transition-[translate] duration-250 ease-snappy ${liftClassName}`
    : "motion-safe:animate-brick-lift";
  return (
    <svg
      aria-hidden
      viewBox="0 -38 168 152"
      className={`text-dusk ${className}`}
      stroke="currentColor"
      strokeOpacity="0.6"
      strokeWidth="1.3"
      strokeLinejoin="round"
    >
      <Brick fill="var(--color-canvas)" />
      {/* The shadow the top brick leaves on the bottom one as it lifts. */}
      <polygon
        points="84,22 140,50 84,78 28,50"
        fill="currentColor"
        stroke="none"
        opacity="0"
        className={`origin-center [transform-box:fill-box] ${shadowMotion}`}
      />
      <g className={liftMotion}>
        <g transform="translate(0 -30)">
          <Brick fill="#fdf3e3" />
        </g>
      </g>
    </svg>
  );
}
