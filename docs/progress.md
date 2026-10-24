# Fawna — Progress

Last updated: 2026-10-24

## What Fawna does right now

1. A parent picks a photo of a worksheet.
2. The browser checks it's a picture (PNG, JPEG or WebP) and not too big.
3. The browser **shrinks** the photo and shows a preview of the whole page.
4. The parent clicks **Analyze** and the photo is sent to our server.
5. The server checks it again, **shrinks it again** with sharp (a safety net), and turns it into base64.
6. The server sends the photo and the school year (fixed at 5 for now) to OpenAI (`gpt-6.1-sol`).
7. The AI marks every question: correct, incorrect, blank or unreadable. Wrong and blank answers get a skill from our list.
8. The server counts the results and the page shows the score, e.g. "8 correct · 2 to work on".

## Done ✅

| What | Where | Tested? |
|---|---|---|
| Upload a photo and see a preview | `ImageUpload.tsx` | Yes, by hand |
| Check the photo in the browser and on the server | `ImageUpload.tsx`, `route.ts` | Yes, by hand |
| Shrink the photo in the browser | `lib/image/shrinkImage.ts` | Yes, with a real iPhone photo |
| Shrink the photo on the server (sharp) | `lib/image/processImageOnServer.ts` | Yes, with a real iPhone photo |
| Shared settings (1600 px, quality 0.8) | `lib/image/imageSettings.ts` | — |
| Turn the photo into base64 for the AI | `route.ts` | Yes, end to end |
| AI marks the worksheet (Responses API + Zod schema) | `lib/ai/analyzeWorksheet.ts`, `worksheetSchema.ts` | Yes, 1 real worksheet (`docs/golden-set.md`) |
| Fixed skill list with kinds (116 skills) | `lib/ai/mathSkills.ts` | Not yet checked against many mistakes |
| Code counts the results | `route.ts` | Yes, matched the AI's list |
| Layered error handling (422, 502, 503, 504) | `route.ts` | 502 seen with a bad API key |
| Preview shows the whole page (`object-contain`) | `ImageUpload.tsx` | Yes, by hand |
| Decisions and test write-up | `docs/decisions.md`, `docs/process.md` | — |

## Shrinking test (details in `docs/process.md`)

- **Browser:** 4.2 MB → 260 KB (about 94% smaller)
- **Server:** 259,798 → 259,252 bytes (barely changes, as expected)
- **Hidden data removed on the server:** yes. The data sections were gone from the file.

## First AI test (details in `docs/golden-set.md`)

| Model | Marking | Skills |
|---|---|---|
| `gpt-5.6-luna` | 9/10 | 0/2 |
| `gpt-6.1-sol` | **10/10** | 0/2 |

- Sol marks well. Neither model names the skill gap the way we would: both pick the **topic**, not the **step that broke**.
- Both models made the same kind of choice, so the fix is probably our instructions, not the model.

## What we learned

- **Base64** writes the same photo out as text. It's about a third bigger, and it removes nothing.
- **AI models shrink big photos anyway**, so sending a huge photo wastes time.
- **Phone photos hide extra data**, like location. Redrawing or re-saving the photo removes it.
- **Browser code can't run on the server.** No `document` or canvas, so the server uses sharp.
- **An `async` function always returns a Promise.** Use `await` to get the real value.
- **Catch errors only where you can do something about them.**
- **Check first, process after.** Don't do expensive work on a file you'll reject.
- **Make impossible states impossible.** One `result` field with four shapes, not two true/false fields.
- **Helpers throw, the route decides** what the user sees.
- **`.env.local` wins over `.env`.** Secrets go in `.env.local` only.
- **Change one thing at a time** when testing the AI, so you know what made the difference.
- **A wrong answer is a clue.** If the digits stayed but moved, it's a place-value slip. If the digits changed, look for a fact or a misconception.

## Not done yet ⏳

- [x] **Switch on the AI call** and send the result back to the page
- [x] Check the AI can read the small print (it read every question on entry 1)
- [ ] **Better skill picks (next):** add `useWhen` hints to skills that overlap, plus a "read the digits of the wrong answer" rule in the instructions. Rerun Sol on entry 1 and log `response.usage` before and after.
- [ ] Grow the golden set to 15–20 real mistakes (1 worksheet so far)
- [ ] Show each question's result on the page, not just the score
- [ ] Get the school year from the family account, not a fixed value
- [ ] Prove upright photos are handled (check the original photo's rotation note)
- [ ] Make the size limit smaller (still 10 MB)
- [x] Update ADR-004 to say "browser **and** server"
- [ ] Finish the 415 error message (it just says "File type ")
- [x] Error codes: 4xx for bad images, 5xx for server and AI faults (ADR-014)
- [ ] Remove debug `console.log`s
- [ ] Free old preview links with `URL.revokeObjectURL`

## Later

- Parents log in
- iPhone HEIC photos uploaded from a Mac are rejected. Decide what to do.
- Automated tests

## Plan for later: English worksheets

Start this once the maths flow works well. It's a different process from maths:

- Worksheet types: vocabulary, antonyms, synonyms.
- Help the child understand what each word means.
- Show example sentences.
- Build muscle memory: the child writes the correct word in full in the blanks.

## Plan for later: helping with mistakes (maths)

After marking works well, each skill gap goes through these steps:

1. **Result:** the parent sees the score, what went well, and a short "how to help" note.
2. **Understand:** the child's answer next to the right one, step by step. Fact gaps skip this.
3. **Check:** one quick question. If it's right, go to practice. If it's wrong, explain another way (2 tries at most, then suggest asking the teacher).
4. **Practice:** questions of the same type first, then mixed with other skills.
5. **Later:** bring the skill back a few days later (needs accounts).

Each skill has a `kind` in `lib/ai/mathSkills.ts`, and the kind decides the help:
- **fact** (7 × 5, 1 kg = 1000 g): recall practice
- **method** (column addition): worked example
- **idea** (¼ is smaller than ⅓): a picture first

## Plan for later: PDF resources

- Let the child or parent open a PDF (cheat sheet, practice sheet) for a skill gap.
- Link each PDF by **skill `id`**. That's another reason ids must never change.
- Only use PDFs we made or have permission to share.
- Start with static files in the app.
