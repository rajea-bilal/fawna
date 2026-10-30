# Fawna

Snap a photo of your child's maths homework. Fawna marks it and tells you which skill to practise.

**Live:** [getfawna.com](https://www.getfawna.com)

## The problem

A parent sees "6/10" and doesn't know what to do next. More of the same questions won't help if the child misunderstood one step. Fawna finds **the step that broke** and names it as a skill, so practice can target it.

## What works today

1. A parent uploads a photo of a worksheet.
2. The photo is shrunk and cleaned (location data removed) in the browser, then again on the server.
3. An OpenAI model reads the handwriting and marks every question: correct, incorrect, blank or unreadable.
4. Every wrong or blank answer gets a skill from a fixed list of 116, based on the National Curriculum for England (Years 1–6).
5. The page shows the score and each question, marked like a real worksheet.

On the live site, uploads need a demo code. Anyone can click **Try a sample worksheet** to see a saved result.

## How the AI part works

- **Fixed skill list, not free text.** The AI must pick from our list, so the same mistake always gets the same name and can be tracked over time.
- **The reply is checked by a schema.** OpenAI Structured Outputs with a Zod schema. A wrong answer without a skill is rejected. So is a made-up skill.
- **The AI solves before it judges.** It writes the correct answer before deciding if the child's answer is right.
- **Code counts, the AI doesn't.** Totals are added up in code.
- **Tested against a golden set.** Worksheets I marked by hand, with the right skill for each mistake. Every change to the model or instructions is checked against it.

The best result so far: sending the AI what each skill *means* (not just its id) took skill picks from **0/2 to 2/2**, for about 2,000 extra tokens per call, most of them cached. See [ADR-017](docs/decisions.md#adr-017-send-the-skill-list-names-kinds-hints-in-the-instructions).

## Privacy

These are photos of children's work.

- Photos are never stored. They're sent to the AI and dropped.
- Location data is removed before the photo leaves the phone, and again on the server.
- The child's name is never sent to the AI.
- Logs hold counts only, never a child's answers.

## The plan

1. **Better marking:** grow the golden set to 15–20 real mistakes.
2. **Accounts:** parents log in, and the child's school year comes from their profile.
3. **Understand, then practise:** for each skill gap, show the child's answer next to the right one, ask one check question, then give practice. Facts get recall practice, methods get a worked example, ideas get a picture first.
4. **Spaced review:** bring skills back a few days later.
5. **English:** vocabulary worksheets and flashcards.

Full list in [docs/progress.md](docs/progress.md).

## The look

Fawna should feel like a warm kitchen table at homework time, not a dashboard.

- Every colour is taken from the hero painting: cream, linen, espresso, lamp amber, terracotta.
- The upload page looks like paper on a desk, and results look like a marked worksheet: ticks, crosses and the child's answer in handwriting.
- Motion is kept small. Only three things move, and each one has a reason.

See [ADR-018](docs/decisions.md#adr-018-hero-colours-come-from-the-painting-not-a-brand-green) and [ADR-023](docs/decisions.md#adr-023-upload-page-looks-like-a-marked-worksheet).

## Engineering decisions

Every big choice is written up in [docs/decisions.md](docs/decisions.md): the options, why I picked one, the risks, and how I tested it. Good places to start:

| Decision | Why it matters |
|---|---|
| [ADR-006](docs/decisions.md#adr-006-skill-names-come-from-a-fixed-list) Skill names come from a fixed list | Makes results trackable over time |
| [ADR-012](docs/decisions.md#adr-012-four-result-shapes-and-a-skill-is-required-where-it-matters) Four result shapes | The schema rules out impossible answers |
| [ADR-013](docs/decisions.md#adr-013-each-skill-has-one-kind-fact-method-or-idea) Fact, method or idea | Decides what kind of help a child gets |
| [ADR-014](docs/decisions.md#adr-014-layered-error-handling) Layered error handling | Parents see "try another photo" vs "try again later" |
| [ADR-017](docs/decisions.md#adr-017-send-the-skill-list-names-kinds-hints-in-the-instructions) Send the skill list | 0/2 → 2/2 skill picks, with token costs measured |
| [ADR-022](docs/decisions.md#adr-022-demo-code-and-sample-result-before-login) Demo code before login | Going public without risking the AI bill |

Also: [how I tested image shrinking](docs/process.md) and [the golden set](docs/golden-set.md).

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · OpenAI Responses API · Zod · sharp · Three.js

## Run it locally

```bash
npm install
npm run dev
```

Put your secrets in `.env.local`:

```
OPENAI_API_KEY=...
DEMO_ACCESS_CODE=...
```

Then open [localhost:3000](http://localhost:3000).
