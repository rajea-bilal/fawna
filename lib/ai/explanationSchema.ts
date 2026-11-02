import type { SkillGap } from "./groupSkillGaps";
import { z } from "zod";

export function buildExplanationSchema(skillGaps: SkillGap[]) {
  // Safety net: the explain step should never call this with nothing to explain (ADR-026)
  if (skillGaps.length === 0) {
    throw new Error("No skill gaps to explain");
  }

  const gapKeys = skillGaps.map((gap) => gap.key);

  // the shape of one card
  const explanationCardSchema = z.object({
    key: z.enum(gapKeys),
    title: z
      .string()
      .describe(
        "A short, child-friendly name for the skill, e.g. 'Carrying when you add'",
      ),
    whatWentWrong: z.string().describe("What went wrong"),
    steps: z.array(z.string()).describe("The steps to fix the problem"),
    parentTip: z.string().describe("A tip for the parent to help the child"),
  });
  // the shape of the AI response with multiple explanations based on the skill gaps
  // OpenAI needs an object at the top, not a bare list
  return z.object({
    explanations: z
      .array(explanationCardSchema)
      .describe("The explanation cards"),
  });
}
