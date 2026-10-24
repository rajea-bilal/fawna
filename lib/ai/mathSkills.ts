// Fixed list of maths skills the AI must choose from when it names a skill gap.
// Based on the National Curriculum in England: mathematics programmes of study
// (Key Stages 1 and 2, Years 1–6, updated 28 Sept 2021).
// https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study
//
// Rules:
// - `id` never changes once saved data uses it. Rename `name` freely.
// - `fromYear` is the school year the skill first appears in the curriculum.
// - Names should be short and must not overlap, so the same mistake always gets the same name.
// - Each skill has exactly one `kind`. If a skill mixes kinds, split it into two skills.
//
// Kinds (decides how Fawna helps with a wrong answer):
// - fact:   the child just needs to remember one thing (7 × 5, 1 kg = 1000 g). Fix: recall practice.
// - method: the child needs to follow steps (column addition). Fix: worked example.
// - idea:   the child needs to understand why (¼ is smaller than ⅓). Fix: a picture or model first.
// Test: "Could a child get this right just by remembering one thing?" Yes → fact.

export type SkillKind = "fact" | "method" | "idea";

export interface MathSkill {
  id: string;
  name: string;
  kind: SkillKind;
  fromYear: number;
}

export interface MathCategory {
  id: string;
  name: string;
  skills: MathSkill[];
}

export const MATH_CATEGORIES: MathCategory[] = [
  {
    id: "place-value",
    name: "Place value",
    skills: [
      { id: "counting-in-steps", name: "Counting in steps (2s, 5s, 10s…)", kind: "fact", fromYear: 1 },
      { id: "one-ten-hundred-more-less", name: "1, 10, 100 or 1000 more or less", kind: "idea", fromYear: 1 },
      { id: "digit-value", name: "Value of each digit", kind: "idea", fromYear: 2 },
      { id: "greater-less-signs", name: "Greater than and less than signs (<, >)", kind: "fact", fromYear: 2 },
      { id: "comparing-ordering-numbers", name: "Comparing and ordering numbers", kind: "idea", fromYear: 1 },
      { id: "number-line", name: "Number lines", kind: "idea", fromYear: 2 },
      { id: "reading-writing-numbers", name: "Reading and writing numbers in words", kind: "fact", fromYear: 1 },
      { id: "rounding", name: "Rounding", kind: "method", fromYear: 4 },
      { id: "negative-numbers", name: "Negative numbers", kind: "idea", fromYear: 4 },
      { id: "roman-numeral-symbols", name: "Roman numeral symbols (I, V, X, L, C, D, M)", kind: "fact", fromYear: 3 },
      { id: "reading-roman-numerals", name: "Reading and writing Roman numerals", kind: "method", fromYear: 3 },
    ],
  },
  {
    id: "addition",
    name: "Addition",
    skills: [
      { id: "addition-facts", name: "Addition facts and number bonds", kind: "fact", fromYear: 1 },
      { id: "mental-addition", name: "Mental addition", kind: "method", fromYear: 2 },
      { id: "column-addition", name: "Column addition (no exchanging)", kind: "method", fromYear: 3 },
      { id: "addition-exchanging", name: "Column addition with exchanging (carrying)", kind: "method", fromYear: 3 },
    ],
  },
  {
    id: "subtraction",
    name: "Subtraction",
    skills: [
      { id: "subtraction-facts", name: "Subtraction facts within 20", kind: "fact", fromYear: 1 },
      { id: "mental-subtraction", name: "Mental subtraction", kind: "method", fromYear: 2 },
      { id: "column-subtraction", name: "Column subtraction (no exchanging)", kind: "method", fromYear: 3 },
      { id: "subtraction-exchanging", name: "Column subtraction with exchanging (borrowing)", kind: "method", fromYear: 3 },
      { id: "subtracting-across-zero", name: "Exchanging across a zero", kind: "method", fromYear: 3 },
    ],
  },
  {
    id: "multiplication",
    name: "Multiplication",
    skills: [
      { id: "times-tables-2-5-10", name: "Times tables: 2, 5, 10", kind: "fact", fromYear: 2 },
      { id: "times-tables-3-4-8", name: "Times tables: 3, 4, 8", kind: "fact", fromYear: 3 },
      { id: "times-tables-6-7-9-11-12", name: "Times tables: 6, 7, 9, 11, 12", kind: "fact", fromYear: 4 },
      { id: "multiplying-by-0-and-1", name: "Multiplying by 0 and 1", kind: "fact", fromYear: 4 },
      { id: "multiplying-by-10-100-1000", name: "Multiplying by 10, 100, 1000", kind: "method", fromYear: 4 },
      { id: "short-multiplication", name: "Short multiplication (by 1 digit)", kind: "method", fromYear: 3 },
      { id: "long-multiplication", name: "Long multiplication (by 2 digits)", kind: "method", fromYear: 5 },
      { id: "factors-multiples", name: "Finding factors and multiples", kind: "method", fromYear: 4 },
      { id: "prime-numbers", name: "Prime numbers", kind: "fact", fromYear: 5 },
      { id: "square-cube-numbers", name: "Square and cube numbers", kind: "fact", fromYear: 5 },
    ],
  },
  {
    id: "division",
    name: "Division",
    skills: [
      { id: "division-facts", name: "Division facts (from times tables)", kind: "fact", fromYear: 2 },
      { id: "sharing-grouping", name: "Sharing and grouping", kind: "idea", fromYear: 1 },
      { id: "dividing-by-10-100-1000", name: "Dividing by 10, 100, 1000", kind: "method", fromYear: 4 },
      { id: "short-division", name: "Short division (bus stop)", kind: "method", fromYear: 5 },
      { id: "long-division", name: "Long division", kind: "method", fromYear: 6 },
      { id: "remainders", name: "Finding remainders", kind: "method", fromYear: 5 },
      { id: "remainders-in-context", name: "What to do with a remainder in a word problem", kind: "idea", fromYear: 5 },
    ],
  },
  {
    id: "fractions",
    name: "Fractions",
    skills: [
      { id: "naming-fractions", name: "Recognising and naming fractions", kind: "idea", fromYear: 1 },
      { id: "fraction-size", name: "Fraction size (bigger bottom number = smaller part)", kind: "idea", fromYear: 3 },
      { id: "fraction-of-amount", name: "Fraction of an amount", kind: "method", fromYear: 2 },
      { id: "equivalent-fractions", name: "Finding equivalent fractions", kind: "method", fromYear: 2 },
      { id: "comparing-fractions", name: "Comparing and ordering fractions", kind: "method", fromYear: 3 },
      { id: "simplifying-fractions", name: "Simplifying fractions", kind: "method", fromYear: 6 },
      { id: "mixed-improper-fractions", name: "Mixed numbers and improper fractions", kind: "method", fromYear: 5 },
      { id: "adding-subtracting-same-denominator", name: "Adding and subtracting fractions (same denominator)", kind: "method", fromYear: 3 },
      { id: "adding-subtracting-different-denominator", name: "Adding and subtracting fractions (different denominators)", kind: "method", fromYear: 5 },
      { id: "multiplying-fractions", name: "Multiplying fractions", kind: "method", fromYear: 5 },
      { id: "dividing-fractions", name: "Dividing fractions by whole numbers", kind: "method", fromYear: 6 },
    ],
  },
  {
    id: "decimals",
    name: "Decimals",
    skills: [
      { id: "tenths-hundredths", name: "Tenths and hundredths", kind: "idea", fromYear: 3 },
      { id: "decimal-place-value", name: "Decimal place value", kind: "idea", fromYear: 4 },
      { id: "fraction-decimal-facts", name: "Fraction–decimal facts (½ = 0.5, ¼ = 0.25)", kind: "fact", fromYear: 4 },
      { id: "fractions-to-decimals", name: "Converting fractions and decimals", kind: "method", fromYear: 4 },
      { id: "comparing-decimals", name: "Comparing and ordering decimals", kind: "idea", fromYear: 4 },
      { id: "rounding-decimals", name: "Rounding decimals", kind: "method", fromYear: 4 },
      { id: "calculating-with-decimals", name: "Calculating with decimals", kind: "method", fromYear: 5 },
    ],
  },
  {
    id: "percentages",
    name: "Percentages",
    skills: [
      { id: "percent-meaning", name: "What a percentage means (out of 100)", kind: "idea", fromYear: 5 },
      { id: "percentage-facts", name: "Percentage facts (50% = ½, 25% = ¼, 10% = ⅒)", kind: "fact", fromYear: 5 },
      { id: "fraction-decimal-percent", name: "Converting fractions, decimals and percentages", kind: "method", fromYear: 5 },
      { id: "percentage-of-amount", name: "Percentage of an amount", kind: "method", fromYear: 6 },
    ],
  },
  {
    id: "ratio",
    name: "Ratio and proportion",
    skills: [
      { id: "scaling", name: "Scaling up and down", kind: "method", fromYear: 3 },
      { id: "ratio-sharing", name: "Unequal sharing (ratio)", kind: "method", fromYear: 6 },
      { id: "scale-factor", name: "Scale factor and similar shapes", kind: "method", fromYear: 6 },
    ],
  },
  {
    id: "algebra",
    name: "Algebra",
    skills: [
      { id: "missing-numbers", name: "Missing number problems", kind: "method", fromYear: 1 },
      { id: "order-of-operations", name: "Order of operations (BIDMAS)", kind: "fact", fromYear: 6 },
      { id: "sequences", name: "Number sequences", kind: "method", fromYear: 6 },
      { id: "formulae", name: "Using simple formulae", kind: "method", fromYear: 6 },
      { id: "two-unknowns", name: "Equations with two unknowns", kind: "method", fromYear: 6 },
    ],
  },
  {
    id: "money",
    name: "Money",
    skills: [
      { id: "coin-note-values", name: "Coin and note values", kind: "fact", fromYear: 1 },
      { id: "pounds-pence", name: "Pounds and pence (£1 = 100p)", kind: "fact", fromYear: 2 },
      { id: "adding-money", name: "Adding amounts of money", kind: "method", fromYear: 2 },
      { id: "giving-change", name: "Giving change", kind: "method", fromYear: 2 },
    ],
  },
  {
    id: "time",
    name: "Time",
    skills: [
      { id: "time-facts", name: "Time facts (60 seconds, 60 minutes, days in each month)", kind: "fact", fromYear: 1 },
      { id: "telling-time-analogue", name: "Telling the time (analogue clock)", kind: "method", fromYear: 1 },
      { id: "telling-time-24-hour", name: "12-hour and 24-hour time", kind: "method", fromYear: 3 },
      { id: "converting-time", name: "Converting units of time", kind: "method", fromYear: 4 },
      { id: "time-intervals", name: "Working out time durations", kind: "method", fromYear: 2 },
    ],
  },
  {
    id: "measurement",
    name: "Measurement",
    skills: [
      { id: "reading-scales", name: "Reading scales", kind: "method", fromYear: 2 },
      { id: "measuring-length-mass-capacity", name: "Measuring length, mass and capacity", kind: "method", fromYear: 1 },
      { id: "unit-facts", name: "Unit facts (1 kg = 1000 g, 1 m = 100 cm)", kind: "fact", fromYear: 3 },
      { id: "converting-units", name: "Converting between units", kind: "method", fromYear: 4 },
      { id: "imperial-units", name: "Imperial units (miles, inches, pints)", kind: "fact", fromYear: 5 },
    ],
  },
  {
    id: "perimeter-area-volume",
    name: "Perimeter, area and volume",
    skills: [
      { id: "area-vs-perimeter", name: "Area vs perimeter (which is which)", kind: "idea", fromYear: 4 },
      { id: "area-volume-formulas", name: "Area and volume formulas", kind: "fact", fromYear: 5 },
      { id: "perimeter", name: "Finding perimeter", kind: "method", fromYear: 3 },
      { id: "area-counting-squares", name: "Area by counting squares", kind: "method", fromYear: 4 },
      { id: "area-rectangles", name: "Area of rectangles", kind: "method", fromYear: 5 },
      { id: "area-triangles-parallelograms", name: "Area of triangles and parallelograms", kind: "method", fromYear: 6 },
      { id: "volume", name: "Finding volume", kind: "method", fromYear: 5 },
    ],
  },
  {
    id: "shapes",
    name: "Shapes",
    skills: [
      { id: "2d-shape-names", name: "Names of 2D shapes", kind: "fact", fromYear: 1 },
      { id: "2d-shape-properties", name: "Properties of 2D shapes (sides, corners)", kind: "method", fromYear: 2 },
      { id: "3d-shape-names", name: "Names of 3D shapes", kind: "fact", fromYear: 1 },
      { id: "3d-shape-properties", name: "Faces, edges and vertices", kind: "method", fromYear: 2 },
      { id: "triangle-quadrilateral-types", name: "Types of triangles and quadrilaterals", kind: "fact", fromYear: 4 },
      { id: "parallel-perpendicular", name: "Parallel and perpendicular lines", kind: "fact", fromYear: 3 },
      { id: "symmetry", name: "Lines of symmetry", kind: "method", fromYear: 2 },
      { id: "nets", name: "Nets of 3D shapes", kind: "idea", fromYear: 6 },
      { id: "circle-parts", name: "Parts of a circle (radius, diameter)", kind: "fact", fromYear: 6 },
    ],
  },
  {
    id: "angles",
    name: "Angles",
    skills: [
      { id: "turns", name: "Turns (quarter, half, clockwise)", kind: "fact", fromYear: 1 },
      { id: "angle-types", name: "Angle types (right, acute, obtuse, reflex)", kind: "fact", fromYear: 3 },
      { id: "angle-facts", name: "Angle facts (180° on a line, 360° round a point)", kind: "fact", fromYear: 5 },
      { id: "measuring-angles", name: "Measuring angles with a protractor", kind: "method", fromYear: 5 },
      { id: "missing-angles", name: "Finding missing angles", kind: "method", fromYear: 5 },
    ],
  },
  {
    id: "position-direction",
    name: "Position and direction",
    skills: [
      { id: "coordinate-order", name: "Coordinate order (across, then up)", kind: "fact", fromYear: 4 },
      { id: "coordinates", name: "Plotting and reading coordinates", kind: "method", fromYear: 4 },
      { id: "translation", name: "Translation (moving shapes)", kind: "method", fromYear: 4 },
      { id: "reflection", name: "Reflection", kind: "method", fromYear: 5 },
    ],
  },
  {
    id: "statistics",
    name: "Statistics",
    skills: [
      { id: "tally-pictograms", name: "Tally charts and pictograms", kind: "method", fromYear: 2 },
      { id: "bar-charts-tables", name: "Bar charts and tables", kind: "method", fromYear: 2 },
      { id: "line-graphs", name: "Line graphs", kind: "method", fromYear: 4 },
      { id: "pie-charts", name: "Pie charts", kind: "method", fromYear: 6 },
      { id: "mean", name: "Mean (average)", kind: "method", fromYear: 6 },
    ],
  },
  {
    id: "problem-solving",
    name: "Problem solving",
    skills: [
      { id: "maths-words", name: "Maths words (sum, difference, product, quotient)", kind: "fact", fromYear: 2 },
      { id: "choosing-operation", name: "Choosing the right operation in a word problem", kind: "idea", fromYear: 1 },
      { id: "multi-step-problems", name: "Multi-step problems", kind: "method", fromYear: 4 },
      { id: "inverse-checking", name: "Using the inverse to check", kind: "method", fromYear: 2 },
      { id: "estimating", name: "Estimating answers", kind: "method", fromYear: 3 },
    ],
  },
];
