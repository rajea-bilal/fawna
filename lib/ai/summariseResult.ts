import type { MarkedQuestion, WorksheetResult } from "./worksheetSchema";

// What the page shows for one marked worksheet.
// Used by the live route and by the sample, so both read the same way.
export interface WorksheetSummary {
  message: string;
  correct: number;
  incorrect: number;
  blank: number;
  unreadable: number;
  questions: MarkedQuestion[];
}

// Code counts, not the AI (ADR-007)
export function summariseResult(result: WorksheetResult): WorksheetSummary {
  const count = (kind: MarkedQuestion["result"]) =>
    result.questions.filter((question) => question.result === kind).length;
  const correct = count("correct");
  const incorrect = count("incorrect");
  const blank = count("blank");
  const unreadable = count("unreadable");

  return {
    message: `${correct} correct · ${incorrect} to work on · ${blank} not answered · ${unreadable} couldn't read`,
    correct,
    incorrect,
    blank,
    unreadable,
    questions: result.questions,
  };
}
