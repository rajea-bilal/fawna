// Drawn in SVG so the maths stays crisp at any size. Three inks only,
// taken from the worksheet collage: peach paper, orange panels, black line.
// "slice" crops the 4:3 drawing evenly to fit the card's 16:10 art band.
export default function FractionsSheetArt() {
  return (
    <svg
      className="block size-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A fractions worksheet. One quarter plus two quarters is answered as three eighths and circled. A tag says the skill to practise is adding fractions."
    >
      <defs>
        <pattern id="sq1" width="12" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M12 0H0V12"
            fill="none"
            stroke="#1e1915"
            strokeOpacity=".28"
            strokeWidth=".8"
          />
        </pattern>
        <pattern id="dot1" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.1" fill="#1e1915" fillOpacity=".55" />
        </pattern>
        <filter id="grain1">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".9"
            numOctaves="2"
            seed="3"
          />
          <feColorMatrix values="0 0 0 0 .12  0 0 0 0 .1  0 0 0 0 .08  0 0 0 -1.6 1.05" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="#f2d0b0" />
      <rect width="400" height="300" fill="url(#sq1)" />
      <g transform="rotate(-8 330 70)">
        <rect
          x="250"
          y="-10"
          width="190"
          height="120"
          fill="#e86748"
          stroke="#1e1915"
          strokeWidth="2.5"
        />
        <g stroke="#1e1915" strokeWidth="1.5">
          <path d="M250 30H440M250 70H440" />
        </g>
        <g className="font-hand" fontSize="22" fill="#1e1915">
          <text x="268" y="22">
            3 × 4 = 12
          </text>
          <text x="268" y="62">
            3 × 5 = 15
          </text>
          <text x="268" y="102">
            3 × 6 = 18
          </text>
        </g>
      </g>
      <rect
        x="-10"
        y="210"
        width="110"
        height="110"
        fill="url(#dot1)"
        transform="rotate(6 40 260)"
      />
      <g transform="rotate(-3 200 170)">
        <rect
          x="40"
          y="58"
          width="300"
          height="220"
          fill="#f7dcc2"
          stroke="#1e1915"
          strokeWidth="2.5"
        />
        <g fill="#f2d0b0" stroke="#1e1915" strokeWidth="1.5">
          <circle cx="58" cy="90" r="5" />
          <circle cx="58" cy="125" r="5" />
          <circle cx="58" cy="160" r="5" />
          <circle cx="58" cy="195" r="5" />
          <circle cx="58" cy="230" r="5" />
        </g>
        <rect
          x="74"
          y="74"
          width="252"
          height="26"
          fill="#e86748"
          stroke="#1e1915"
          strokeWidth="1.8"
        />
        <text
          x="86"
          y="93"
          className="font-hand"
          fontSize="18"
          letterSpacing="2"
          fill="#1e1915"
        >
          FRACTIONS
        </text>
        <g className="font-hand" fill="#1e1915">
          <text x="84" y="130" fontSize="16">
            3.
          </text>
          <g fontSize="22" textAnchor="middle">
            <text x="118" y="128">
              1
            </text>
            <text x="118" y="152">
              4
            </text>
            <text x="148" y="140">
              +
            </text>
            <text x="178" y="128">
              1
            </text>
            <text x="178" y="152">
              4
            </text>
            <text x="208" y="140">
              =
            </text>
            <text x="240" y="128">
              2
            </text>
            <text x="240" y="152">
              4
            </text>
          </g>
          <path
            d="M108 134h20M168 134h20M230 134h20"
            stroke="#1e1915"
            strokeWidth="1.6"
          />
          <path
            d="M266 136l6 7 14-18"
            fill="none"
            stroke="#1e1915"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="84" y="196" fontSize="16">
            4.
          </text>
          <g fontSize="22" textAnchor="middle">
            <text x="118" y="194">
              1
            </text>
            <text x="118" y="218">
              4
            </text>
            <text x="148" y="206">
              +
            </text>
            <text x="178" y="194">
              2
            </text>
            <text x="178" y="218">
              4
            </text>
            <text x="208" y="206">
              =
            </text>
            <text x="242" y="194">
              3
            </text>
            <text x="242" y="218">
              8
            </text>
          </g>
          <path
            d="M108 200h20M168 200h20M232 200h20"
            stroke="#1e1915"
            strokeWidth="1.6"
          />
          <path
            d="M226 178c18-12 40-4 38 22s-30 34-44 14c-8-12-4-30 12-38"
            fill="none"
            stroke="#1e1915"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M84 250h230"
            stroke="#1e1915"
            strokeWidth="1.2"
            strokeDasharray="3 4"
          />
        </g>
      </g>
      <g transform="translate(4 -150) rotate(5 300 230)">
        <rect
          x="230"
          y="206"
          width="160"
          height="58"
          fill="#e86748"
          stroke="#1e1915"
          strokeWidth="2.5"
        />
        <text
          x="244"
          y="228"
          className="font-hand"
          fontSize="13"
          letterSpacing="1.6"
          fill="#1e1915"
        >
          SKILL TO PRACTISE
        </text>
        <text
          x="244"
          y="252"
          className="font-hand"
          fontSize="19"
          fill="#1e1915"
        >
          adding fractions
        </text>
      </g>
      <path
        d="M352 30l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z"
        fill="#1e1915"
        transform="translate(-320 -6)"
      />
      <rect
        width="400"
        height="300"
        filter="url(#grain1)"
        opacity=".35"
        className="mix-blend-multiply"
      />
    </svg>
  );
}
