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
