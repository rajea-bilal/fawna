import type { WorksheetResult } from "@/lib/ai/worksheetSchema";

// A saved result for the "Try a sample" button, so visitors can see Fawna
// work without a demo code and without an AI call.
// Modelled on golden set entry 1 (docs/golden-set.md). Questions are reworded,
// and no photo or name is used.
export const SAMPLE_RESULT: WorksheetResult = {
  questions: [
    {
      number: "1",
      question: "Write 53/100 as a decimal.",
      childAnswer: "0.53",
      correctAnswer: "0.53",
      result: "correct",
    },
    {
      number: "2",
      question: "66 ÷ 1000 =",
      childAnswer: "0.66",
      correctAnswer: "0.066",
      result: "incorrect",
      skill: { source: "list", skillId: "dividing-by-10-100-1000" },
    },
    {
      number: "3",
      question: "Write ¼ as a decimal.",
      childAnswer: "0.25",
      correctAnswer: "0.25",
      result: "correct",
    },
    {
      number: "4a",
      question: "Write 1 ⅖ as an improper fraction.",
      childAnswer: "7/5",
      correctAnswer: "7/5",
      result: "correct",
    },
    {
      number: "4b",
      question: "Write 3 ¾ as an improper fraction.",
      childAnswer: "15/4",
      correctAnswer: "15/4",
      result: "correct",
    },
    {
      number: "5a",
      question: "Write 28/4 as a whole number.",
      childAnswer: "7",
      correctAnswer: "7",
      result: "correct",
    },
    {
      number: "5b",
      question: "Write 42/8 as a mixed number.",
      childAnswer: "5 2/8",
      correctAnswer: "5 2/8 (or 5 ¼)",
      result: "correct",
    },
    {
      number: "6",
      question: "What is ⅗ of 40?",
      childAnswer: "24",
      correctAnswer: "24",
      result: "correct",
    },
    {
      number: "7",
      question: "Order from smallest to largest: 0.3, 0.05, 0.5, 0.25, 0.2",
      childAnswer: "0.05, 0.2, 0.25, 0.3, 0.5",
      correctAnswer: "0.05, 0.2, 0.25, 0.3, 0.5",
      result: "correct",
    },
    {
      number: "8",
      question: "Order from smallest to largest: ½, 25%, 34/100, ¾, 10%",
      childAnswer: "0.1, 0.34, 0.4, 0.5, 0.75",
      correctAnswer: "10%, 25%, 34/100, ½, ¾",
      result: "incorrect",
      skill: { source: "list", skillId: "percentage-facts" },
    },
  ],
};
