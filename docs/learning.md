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
