import type { ExplanationCard } from "@/lib/ai/explanationSchema";

// Saved explanation cards for the sample worksheet, so its
// "How Fawna can help" button needs no AI call (ADR-024).
// Written by hand for now. They will be swapped for ones made by the live
// explain step, checked by hand. Make them again if the card shape changes.
// One card per non-fact skill gap in SAMPLE_RESULT, in sheet order.
// The question and answers must match each skill gap's example question.
export const SAMPLE_EXPLANATIONS: ExplanationCard[] = [
  {
    status: "explained",
    key: "dividing-by-10-100-1000",
    question: "66 ÷ 1000 =",
    childAnswer: "0.66",
    correctAnswer: "0.066",
    title: "Dividing by 1000",
    steps: [
      "Count the zeros in 1000. There are 3.",
      "So every digit moves 3 places to the right.",
      "66 becomes 6.6, then 0.66, then 0.066.",
      "Put a 0 in the empty place before the 6s.",
    ],
    whatWentWrong: "You moved the digits 2 places, not 3. That is dividing by 100.",
    parentTip:
      "Draw a place-value grid and slide the digits along it together, one place for each zero.",
  },
  {
    status: "explained",
    key: "rounding-decimals",
    question: "Round 3.46 to the nearest tenth.",
    childAnswer: "",
    correctAnswer: "3.5",
    title: "Rounding to the nearest tenth",
    steps: [
      "Find the tenths digit. In 3.46 it is the 4.",
      "Look at the next digit on the right. It is a 6.",
      "5 or more means round up. So the 4 becomes a 5.",
      "Drop the digits after it. The answer is 3.5.",
    ],
    whatWentWrong:
      "This one was left blank. Start by finding the tenths digit, then look one place to its right.",
    parentTip:
      "Ask: is 3.46 closer to 3.4 or 3.5? Mark both on a number line and let your child point.",
  },
  {
    status: "failed",
    key: "fractions-to-decimals",
    question: "Write 0.7 as a fraction.",
    childAnswer: "7/100",
    correctAnswer: "7/10",
  },
];
