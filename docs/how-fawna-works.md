# How Fawna Works

One glance at how data moves through the app.

✅ = built · 🚧 = being built · 💭 = planned

## The big picture

```
 Parent uploads a photo
         │
         ▼
 ① Marking AI reads the sheet        ✅  lib/ai/analyzeWorksheet.ts
         │   one MarkedQuestion per question
         ▼
 ② Code counts the score             ✅  lib/ai/summariseResult.ts
         │   one WorksheetSummary
         ▼
 ③ Code groups the mistakes          ✅  lib/ai/groupSkillGaps.ts  (not on screen yet)
         │   one SkillGap per skill
         ▼
 Parent clicks "How Fawna can help"
         │
         ▼
 ④ Explain AI writes explanations    🚧  lib/ai/explanationSchema.ts (shape)
         │   one AI explanation per skill gap
         ▼
 ⑤ Code builds the page cards        🚧
         │   one card per skill gap: explained or failed
         ▼
 The page shows the cards, one by one
```

## The shapes, using one real mistake

Sample sheet, question 2. The child wrote 0.66. The answer is 0.066.

### ① MarkedQuestion: one per question on the sheet

Made by the marking AI. Shape in `worksheetSchema.ts`.

```
number:        "2"
question:      "66 ÷ 1000 ="
childAnswer:   "0.66"
correctAnswer: "0.066"
result:        "incorrect"        ← correct / incorrect / blank / unreadable
skill:         { source: "list", skillId: "dividing-by-10-100-1000" }
```

### ② WorksheetSummary: one per sheet

Made by code. The score the parent sees first.

```
message:    "..."
correct:    8
incorrect:  2
blank:      0
unreadable: 0
questions:  [ ...every MarkedQuestion ]
```

### ③ SkillGap: one per skill the child got wrong

Made by code. Wrong and blank answers with the same skill go together.

```
key:             "dividing-by-10-100-1000"      ← fixed label, for code
name:            "Dividing by 10, 100, 1000"    ← from our skill list
kind:            "method"                       ← fact / method / idea / null
exampleQuestion: question 2
questions:       [ question 2 ]
```

Fact skill gaps stop here. They don't get an explanation (ADR-021).

### ④ AI explanation: one per skill gap

Written by the explain AI. Only these five fields.

```
key:           "dividing-by-10-100-1000"   ← must be one of this sheet's keys
title:         "Dividing by 1000"          ← child-friendly, can change
whatWentWrong: "You moved the digits 2 places, not 3."
steps:         ["...", "...", "..."]
parentTip:     "Draw a place-value grid..."
```

### ⑤ Page card: one per skill gap

Made by code. It joins the AI's explanation with the question and answers from the skill gap.

```
Explained card                 Failed card
──────────────                 ───────────
status: "explained"            status: "failed"
key                            key
question       ← code          question       ← code
childAnswer    ← code          childAnswer    ← code
correctAnswer  ← code          correctAnswer  ← code
title          ← AI
whatWentWrong  ← AI
steps          ← AI
parentTip      ← AI
```

`status` tells the page which card it has.

## Easy to mix up

| Word | Lives on | Means |
|---|---|---|
| `result` | MarkedQuestion | Was the child right? |
| `status` | Page card | Did the AI explain it? |
| `skillId` | MarkedQuestion | The skill's id from our list |
| `key` | SkillGap, explanation, card | The skill gap's fixed label. Used to match things up. |
| `name` | SkillGap | The skill's name from our list |
| `title` | Explanation, card | The AI's child-friendly name |
| `kind` | SkillGap | fact, method or idea |

## The files

| File | What it does |
|---|---|
| `app/upload/page.tsx` | The upload page |
| `app/components/ImageUpload.tsx` | Shrinks the photo, sends it, shows the result |
| `app/components/ResultsList.tsx` | Shows the score and each question |
| `app/api/analyze/route.ts` | The server endpoint for marking |
| `lib/ai/analyzeWorksheet.ts` | Calls the marking AI |
| `lib/ai/worksheetSchema.ts` | The marking AI's reply shape |
| `lib/ai/mathSkills.ts` | Our fixed skill list |
| `lib/ai/summariseResult.ts` | Counts the score |
| `lib/ai/groupSkillGaps.ts` | Groups mistakes into skill gaps |
| `lib/ai/explanationSchema.ts` | The explain AI's reply shape, and the page cards |
| `lib/demo/sampleResult.ts` | A saved result for "Try a sample" |

## Where to read more

- **Why** things are built this way: `docs/decisions.md`
- **Words and concepts:** `docs/learning.md`
