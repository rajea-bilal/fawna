import type { ExplanationCard } from "@/lib/ai/explanationSchema";

// Saved explanation cards for the sample worksheet, so its
// "How Fawna can help" button needs no AI call (ADR-024).
// Made by one live run of the explain step on 2026-11-14, checked by hand,
// and saved as they came. Make them again if the card shape changes.
// One card per non-fact skill gap in SAMPLE_RESULT, in sheet order.
// The question and answers must match each skill gap's example question.
export const SAMPLE_EXPLANATIONS: ExplanationCard[] = [
  {
    status: "explained",
    key: "dividing-by-10-100-1000",
    question: "66 ÷ 1000 =",
    childAnswer: "0.66",
    correctAnswer: "0.066",
    title: "Dividing by 1,000",
    whatWentWrong: "Your answer, 0.66, is 66 divided by 100, not 1,000.",
    steps: [
      "Start with 66. Dividing by 1,000 moves each digit three place-value columns to the right.",
      "After one move, 66 becomes 6.6.",
      "After two moves, it becomes 0.66.",
      "After three moves, it becomes 0.066. So 66 ÷ 1,000 = 0.066.",
    ],
    parentTip:
      "Use a place-value chart and ask your child to move both 6s three columns to the right.",
  },
  {
    status: "explained",
    key: "rounding-decimals",
    question: "Round 3.46 to the nearest tenth.",
    childAnswer: "",
    correctAnswer: "3.5",
    title: "Rounding to the nearest tenth",
    whatWentWrong:
      "This was left blank. Start by finding the tenths digit: the first digit after the decimal point.",
    steps: [
      "In 3.46, the tenths digit is 4.",
      "Look at the next digit, the hundredths digit. It is 6.",
      "As 6 is 5 or more, round the tenths digit up from 4 to 5.",
      "Keep just one decimal place. The answer is 3.5.",
    ],
    parentTip:
      "Draw a number line from 3.4 to 3.5 and help your child mark 3.46 to see which end is nearer.",
  },
  {
    status: "explained",
    key: "fractions-to-decimals",
    question: "Write 0.7 as a fraction.",
    childAnswer: "7/100",
    correctAnswer: "7/10",
    title: "Writing tenths as fractions",
    whatWentWrong:
      "You used 100 on the bottom, but the 7 in 0.7 means seven tenths, not seven hundredths.",
    steps: [
      "Look at 0.7. The 7 is in the tenths column.",
      "This means 7 tenths: 7 out of 10 equal parts.",
      "Write 7 on top and 10 on the bottom. So 0.7 = 7/10.",
    ],
    parentTip:
      "Draw a strip split into 10 equal parts and ask your child to shade 7, then label it 0.7 and 7/10.",
  },
];
