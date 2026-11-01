import type { MarkedQuestion, WorksheetResult } from "./worksheetSchema";
import { MATH_CATEGORIES, type SkillKind } from "./mathSkills";

// One skill the child got wrong or left blank, with every question that needed it.
export interface SkillGap {
  key: string;
  name: string;
  kind: SkillKind | null; // null for suggested skills
  exampleQuestion: MarkedQuestion;
  questions: MarkedQuestion[];
}

const ALL_SKILLS = MATH_CATEGORIES.flatMap((category) => category.skills);

// Code groups the mistakes, not the AI (ADR-021)
export function groupSkillGaps(result: WorksheetResult): SkillGap[] {
  const gapQuestions = result.questions.filter(
    (question) => question.result === "incorrect" || question.result === "blank",
  );

  // Sort questions into piles, one per skill, in sheet order
  const piles: { label: string; questions: typeof gapQuestions }[] = [];
  for (const question of gapQuestions) {
    const label =
      question.skill.source === "list" ? question.skill.skillId : question.skill.name;
    const pile = piles.find((p) => p.label === label);
    if (pile) {
      pile.questions.push(question);
    } else {
      piles.push({ label, questions: [question] });
    }
  }

  // Turn each pile into a skill gap
  let suggestedCount = 0;
  return piles.map(({ questions }) => {
    const { skill } = questions[0];
    // First wrong answer, or the first blank if there are none
    const exampleQuestion =
      questions.find((question) => question.result === "incorrect") ?? questions[0];

    if (skill.source === "list") {
      const listSkill = ALL_SKILLS.find((s) => s.id === skill.skillId);
      return {
        key: skill.skillId,
        name: listSkill?.name ?? skill.skillId,
        kind: listSkill?.kind ?? null,
        exampleQuestion,
        questions,
      };
    }

    suggestedCount += 1;
    return {
      key: `suggested-${suggestedCount}`,
      name: skill.name,
      kind: null,
      exampleQuestion,
      questions,
    };
  });
}
