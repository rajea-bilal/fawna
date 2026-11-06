# What I've Learned

## TypeScript

- Checks types while I write and build the code.
- Catches mistakes in my code.
- Its types are removed when the code becomes JavaScript, so they don't exist while the app runs.

## Zod

- A library that checks data against rules I write.
- It runs while the app runs, so it can check real data.
- Catches bad data from forms, APIs or AI replies.

## Why use both

An API reply arrives while the app is running. Giving it a TypeScript type doesn't check what was actually sent. Zod does.

TypeScript checks my code. Zod checks the data my app receives.

## Schema

A schema describes the data I expect: its shape and the rules it must follow.

```ts
const MarkedQuestion = z.object({
  question: z.string(),
  childAnswer: z.string(),
  result: z.enum(["correct", "incorrect", "unreadable"]),
});
```

An **enum** is a fixed list of allowed values.

Once the schema exists, Zod can give TypeScript the matching type:

```ts
type MarkedQuestionType = z.infer<typeof MarkedQuestion>;
```

This is the same as writing:

```ts
type MarkedQuestionType = {
  question: string;
  childAnswer: string;
  result: "correct" | "incorrect" | "unreadable";
};
```

## Zod words

| Word | Means |
|---|---|
| `z.object({...})` | An object, with a rule for each field. |
| `z.string()` | Any text. |
| `z.literal("list")` | Exactly this value. `"List"` or `"lists"` fail. |
| `z.enum([...])` | One value from a fixed list. |
| `z.array(...)` | A list. Every item in it follows the rule inside. |
| `.describe("...")` | A note for the AI on what to put in the field. It doesn't check anything. |
| `z.discriminatedUnion("source", [a, b])` | Shape `a` **or** shape `b`. One field (`source`) tells them apart. |

## One thing, two shapes

When a child gets a question wrong, the AI names the skill. It can do this in two ways:

```ts
// A skill from my list
{ source: "list", skillId: "column-addition" }

// A new skill the AI suggests, when nothing on my list fits
{ source: "suggested", categoryId: "measurement", name: "Reading a bus timetable" }
```

The schema:

```ts
const listSkill = z.object({
  source: z.literal("list"),
  skillId: z.enum(SKILL_IDS), // one of my 116 ids, so the AI can't make one up
});

const suggestedSkill = z.object({
  source: z.literal("suggested"),
  categoryId: z.enum(CATEGORY_IDS),
  name: z.string(), // any text, because the AI makes it up
});

const skill = z.discriminatedUnion("source", [listSkill, suggestedSkill]);
```

Questions use the same trick. There, `result` tells the four shapes apart.

Once I check `source`, TypeScript knows which shape I have:

```ts
if (question.skill.source === "list") {
  question.skill.skillId; // ✅ only the list shape has skillId
} else {
  question.skill.name;    // ✅ only the suggested shape has name
}
```

Without the check, TypeScript won't let me use `skillId`. The skill might be the suggested shape, which doesn't have one.

## `z.enum` vs `z.array`

They sound alike but do different jobs.

- `z.enum(list)` means **one** value, picked from the list.
- `z.array(rule)` means **many** values. Each one follows the rule.

```ts
z.enum(["red", "blue"])
// ✅ "red"
// ❌ "green"           (not on the list)
// ❌ ["red"]           (a list, not one value)

z.array(z.string())
// ✅ ["a", "b", "c"]
// ✅ []                (an empty list is still a list)
// ❌ "a"               (one value, not a list)
```

I can put one inside the other. `z.array(z.enum(["red", "blue"]))` means a list where every item is red or blue.

A plain list like `["red", "blue"]` is **not** a rule. It's just data. `z.enum` turns it into a rule. Think of a guest list and a bouncer. The list is just paper. The bouncer uses it to say yes or no.

## A schema for data that hasn't arrived yet

A schema isn't data. It's a set of **rules** the data must follow. So I can write it before the data exists, the same way I can write party rules before any guests turn up.

Most schemas are the same for every request. I write them once, at the top of the file. The marking schema is like this: every worksheet uses the same 116 skill ids.

Sometimes the rules depend on the request. In Fawna, each worksheet has different skill gaps. The AI's explanations must only use **this sheet's** keys.

One sheet might give:

```
["dividing-by-10-100-1000", "percentage-facts"]
```

The next sheet might give:

```
["column-addition", "suggested-1"]
```

A schema at the top of the file is built once, when the file loads. At that moment there's no worksheet yet, so it can't know the keys. Once a schema is built, I can't change it either.

The fix is to **build the schema inside a function**:

- A function only runs when I call it.
- I call it during each request, once I have that sheet's skill gaps.
- It builds a fresh schema from them and returns it.

A schema is just a value, like a number or an object, so a function can return it.

```ts
export function buildExplanationSchema(skillGaps: SkillGap[]) {
  // 1. Pull out this sheet's keys
  const gapKeys = skillGaps.map((gap) => gap.key);

  // 2. The shape of ONE explanation
  const explanation = z.object({
    key: z.enum(gapKeys), // one of THIS sheet's keys, nothing else
    title: z.string(),
    whatWentWrong: z.string(),
    steps: z.array(z.string()),
    parentTip: z.string(),
  });

  // 3. The whole reply: MANY explanations.
  //    OpenAI needs an object at the top, not a bare list.
  return z.object({
    explanations: z.array(explanation),
  });
}
```

How it's used on each request:

1. Code groups the mistakes into skill gaps.
2. `buildExplanationSchema(skillGaps)` builds the rules for this sheet.
3. The schema goes to OpenAI with the request. It tells the AI what shape to reply in.
4. The facts (question, child's answer, right answer) go in the message, not the schema. The schema is the empty form. The message is the information to fill it in with.
5. When the reply comes back, the same schema checks it. A key that isn't on this sheet fails.

The rule of thumb: if the rules are the same every time, write the schema at the top of the file. If they depend on the request, build it in a function.

## Small and capital names

- `markedQuestion` (small m) is the **Zod schema**. It checks data while the app runs.
- `MarkedQuestion` (capital M) is the **TypeScript type** made from it with `z.infer`. It checks my code.

## How OpenAI's prompt cache works

Every call sends these, in this order:

1. Instructions + skill list (the same every time)
2. Schema, the shape of the reply (the same every time)
3. "The child is in Year 5." (the same for now)
4. The photo (different for each worksheet)

OpenAI compares my new request with recent ones, from the start, and stops at the first difference. The matching part is cached: OpenAI doesn't redo that work and charges less for it. Everything after the first difference costs the normal price.

Three things to know:

- **Order matters.** The parts that stay the same go first, and the photo goes last. My code already does this. If the photo came first, nothing would ever match.
- **Cached isn't free.** It's cheaper, but I still pay something.
- **The cache doesn't last long.** If no one uses Fawna for a while, the next call starts again with nothing cached.

## Vitest

- A tool that runs tests.
- A test is code that checks my other code still does the right thing.
- It finds every file ending in `.test.ts` and runs it.
- It tells me which tests passed and which failed.

`npm test` runs all tests once and stops. (`vitest` on its own keeps running and tests again each time I save.)

### What a test looks like

```ts
describe("groupSkillGaps", () => {
  it("gives an empty list for an empty result", () => {
    expect(groupSkillGaps({ questions: [] })).toEqual([]);
  });
});
```

| Word | Means |
|---|---|
| `describe("...", ...)` | A group of tests about one thing. |
| `it("...", ...)` | One test. The text reads like a sentence: "it gives an empty list…". |
| `expect(x)` | "I expect x to be…". This is the check. |
| `.toBe(y)` | x is exactly y. For simple values like text or numbers. |
| `.toEqual(y)` | x has the same contents as y. For lists and objects. |
| `.toHaveLength(n)` | x has n items. |

### How I write my tests

- **Put data in, check what comes out.** Don't test how the code works inside. Then I can rewrite the inside, and the tests still pass if the answer is the same.
- **Use small helpers.** `wrong("2", "rounding")` makes a whole wrong question. The test only shows what matters.
- **One idea per test.** When a test fails, its name tells me what broke.

### A failing test is good news

It means the test caught a change. Read the message: it shows what I expected and what I got.

## Zod vs evals

An AI answer can have a perfect shape and still be wrong. Zod can't tell. An eval can.

| | Zod | Eval |
|---|---|---|
| Checks | The **shape** | The **quality** |
| Asks | "Is `steps` a list of text?" | "Are the steps actually right?" |
| Runs | On every real request | When I test, or change the prompt or model |
| Example | Rejects a missing `title` | Notices the AI said 66 ÷ 1000 = 0.66 |

An **eval** is:

1. Test inputs where I already know the right answer.
2. Run them through the AI.
3. Score the answers: by code, by me, or by another AI (a "grader").

My golden set (`docs/golden-set.md`) is an eval. ADR-011 used it to choose the model.

**Three checks in Fawna:**

- **Vitest** checks my code.
- **Zod** checks the AI's shape.
- **The golden set** checks the AI's quality.

## Words we use in Fawna

| Word | Means | Not to be confused with |
|---|---|---|
| **Skill** | One thing a child should be able to do, from our fixed list, e.g. "Column addition with regrouping". | A topic. A skill is the exact step that went wrong. |
| **Kind** | What sort of skill it is: **fact** (just remember it), **method** (follow steps) or **idea** (understand why). | |
| **Suggested skill** | A skill the AI names when nothing on our list fits. It has no kind. | A skill on our list. |
| **Skill gap** | One skill the child got wrong or left blank, with every question on the sheet that needed it. | A single wrong question. One skill gap can hold many questions. |
| **Key** | The fixed label for a skill gap: the skill's id, or `suggested-1`, `suggested-2` for suggested skills. Used to match an explanation to its skill gap. | The title. A title can change, a key can't. |
| **Example question** | The one question an explanation is built around: the first wrong answer in the skill gap, or the first blank if there are none. | |
| **Explanation** | Help for one skill gap, written for the child: a title, their answer next to the right one, short steps, what went wrong, and a tip for the parent. Fact skills don't get one. | Practice. An explanation helps the child understand. Practice makes it stick. |
| **Title** | The child-friendly name at the top of an explanation, e.g. "Carrying when you add". Written by the AI, so it can change. | The skill's name on our list. |
