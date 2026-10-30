## Zod

- Zod is a library that checks whether data follows the rules you have written.

- Can check actual data while your app runs.

- Helps catch unexpected data from forms, APIs or AI replies.

## TypeScript

- Checks types while you write and build your code.

- Helps catch mistakes in your code.

- It's type annotations are removed when converted to JavaScript.

## Why do we need Zod + TypeScript in conjunction in our app

- Because an API response arrives **while** your app is running. Giving it a TypeScript type does not automatically check what the API actually sent. That is where Zod helps.

- TypeScript checks your code. Zod checks the data your app receives.

## Schema

- Schema is a description of the data you expect, **including** the rules it must follow.

- shape of data + rules it must follow

```bash
const MarkedQuestion = z.object({
  question: z.string(),
  childAnswer: z.string(),
  result: z.enum(["correct", "incorrect", "unreadable"]),
});
```

- an **enum** specifies a fixed list of allowed values

- once we have defined the schema, Zod can give TypeScript he matching type

```bash
type MarkedQuestionType = z.infer<typeof MarkedQuestion>;
```

- the resulting type is equivalent to

```bash
type MarkedQuestionType = {
  question: string;
  childAnswer: string;
  result: "correct" | "incorrect" | "unreadable";
};
```

What OpenAI receives on every call, in this order:

1. Instructions + skill list ← the same every time
2. Schema (the reply shape) ← the same every time
3. "The child is in Year 5." ← the same for now
4. The photo ← different for each worksheet
   How the cache works:
   OpenAI compares your new request with one it saw recently, from the start. It counts how far the two match. It stops at the first difference.

The matching part is cached, so OpenAI doesn't redo that work and charges you less. Everything after the first difference is charged at the normal price.

Three things to know:

Order matters. The parts that stay the same go first, and the photo goes last. Your code already does this. If the photo came first, nothing would ever match.
Cached isn't free. It's cheaper, but you still pay something.
The cache doesn't last forever. It only lasts a short while. If no one uses Fawna for a while, the next call starts again at 0 cached.
