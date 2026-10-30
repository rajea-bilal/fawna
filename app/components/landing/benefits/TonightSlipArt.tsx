// Drawn in SVG so the maths stays crisp at any size. Three inks only,
// taken from the worksheet collage: peach paper, orange panels, black line.
// "slice" crops the 4:3 drawing evenly to fit the card's 16:10 art band.
export default function TonightSlipArt() {
  return (
    <svg
      className="block size-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Tonight's practice slip with three fraction questions and a tag saying then stop."
    >
      <defs>
        <pattern id="sq3" width="12" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M12 0H0V12"
            fill="none"
            stroke="#1e1915"
            strokeOpacity=".35"
            strokeWidth=".8"
          />
        </pattern>
        <pattern id="dot3" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.1" fill="#1e1915" fillOpacity=".5" />
        </pattern>
        <filter id="grain3">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".9"
            numOctaves="2"
            seed="7"
          />
          <feColorMatrix values="0 0 0 0 .12  0 0 0 0 .1  0 0 0 0 .08  0 0 0 -1.6 1.05" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="#e86748" />
      <rect width="400" height="300" fill="url(#sq3)" />
      <g transform="rotate(7 330 220)">
        <rect
          x="268"
          y="150"
          width="150"
          height="170"
          fill="#f2d0b0"
          stroke="#1e1915"
          strokeWidth="2.5"
        />
        <g stroke="#1e1915" strokeWidth="2">
          <rect x="284" y="170" width="120" height="26" fill="#f2d0b0" />
          <path d="M308 170v26M332 170v26M356 170v26M380 170v26" />
        </g>
        <g>
          <rect x="284" y="170" width="72" height="26" fill="url(#dot3)" />
        </g>
        <text
          x="284"
          y="226"
          className="font-hand"
          fontSize="20"
          fill="#1e1915"
        >
          3/5 shaded
        </text>
      </g>
      <rect
        x="-6"
        y="-6"
        width="80"
        height="90"
        fill="url(#dot3)"
        transform="rotate(-6 30 40)"
      />
      <g transform="rotate(-4 170 150)">
        <rect
          x="34"
          y="34"
          width="250"
          height="240"
          fill="#f7dcc2"
          stroke="#1e1915"
          strokeWidth="2.5"
        />
        <path d="M34 72h250" stroke="#1e1915" strokeWidth="1.8" />
        <text
          x="50"
          y="60"
          className="font-hand"
          fontSize="18"
          letterSpacing="2"
          fill="#1e1915"
        >
          TONIGHT
        </text>
        <g stroke="#1e1915" strokeWidth="1.8">
          <rect x="206" y="46" width="16" height="16" fill="#e86748" />
          <rect x="226" y="46" width="16" height="16" fill="#f7dcc2" />
          <rect x="246" y="46" width="16" height="16" fill="#f7dcc2" />
        </g>
        <g className="font-hand" fill="#1e1915">
          <g fontSize="20" textAnchor="middle">
            <text x="58" y="112" fontSize="15">
              1.
            </text>
            <text x="90" y="100">
              1
            </text>
            <text x="90" y="122">
              5
            </text>
            <text x="116" y="111">
              +
            </text>
            <text x="142" y="100">
              2
            </text>
            <text x="142" y="122">
              5
            </text>
            <text x="168" y="111">
              =
            </text>
            <text x="58" y="172" fontSize="15">
              2.
            </text>
            <text x="90" y="160">
              2
            </text>
            <text x="90" y="182">
              5
            </text>
            <text x="116" y="171">
              +
            </text>
            <text x="142" y="160">
              2
            </text>
            <text x="142" y="182">
              5
            </text>
            <text x="168" y="171">
              =
            </text>
            <text x="58" y="232" fontSize="15">
              3.
            </text>
            <text x="90" y="220">
              3
            </text>
            <text x="90" y="242">
              5
            </text>
            <text x="116" y="231">
              +
            </text>
            <text x="142" y="220">
              1
            </text>
            <text x="142" y="242">
              5
            </text>
            <text x="168" y="231">
              =
            </text>
          </g>
          <path
            d="M81 105h18M133 105h18M81 165h18M133 165h18M81 225h18M133 225h18"
            stroke="#1e1915"
            strokeWidth="1.5"
          />
          <path
            d="M184 118h76M184 178h76M184 238h76"
            stroke="#1e1915"
            strokeWidth="1.5"
          />
          <text x="190" y="112" fontSize="24">
            3/5
          </text>
          <path
            d="M232 104l5 6 12-15"
            fill="none"
            stroke="#1e1915"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <g transform="rotate(-9 300 80)">
        <rect
          x="250"
          y="52"
          width="122"
          height="44"
          fill="#f2d0b0"
          stroke="#1e1915"
          strokeWidth="2.5"
        />
        <text x="264" y="81" className="font-hand" fontSize="21" fill="#1e1915">
          then stop ✓
        </text>
      </g>
      <path
        d="M352 30l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z"
        fill="#1e1915"
        transform="translate(16 220)"
      />
      <rect
        width="400"
        height="300"
        filter="url(#grain3)"
        opacity=".35"
        className="mix-blend-multiply"
      />
    </svg>
  );
}
