# Fawna — Progress

Last updated: 2026-10-21

## What Fawna does right now

1. A parent picks a photo of a worksheet.
2. The browser checks it's a picture (PNG, JPEG or WebP) and not too big.
3. The browser **shrinks** the photo and shows a preview of the whole page.
4. The parent clicks **Analyze** and the photo is sent to our server.
5. The server checks it again, **shrinks it again** with sharp (a safety net), and turns it into base64.
6. The server replies "received", and the page shows that message.

The AI isn't switched on yet. The code to call it is written but turned off.

## Done ✅

| What | Where | Tested? |
|---|---|---|
| Upload a photo and see a preview | `ImageUpload.tsx` | Yes, by hand |
| Check the photo in the browser and on the server | `ImageUpload.tsx`, `route.ts` | Yes, by hand |
| Shrink the photo in the browser | `lib/image/shrinkImage.ts` | Yes, with a real iPhone photo |
| Shrink the photo on the server (sharp) | `lib/image/processImageOnServer.ts` | Yes, with a real iPhone photo |
| Shared settings (1600 px, quality 0.8) | `lib/image/imageSettings.ts` | — |
| Turn the photo into base64 for the AI | `route.ts` | Runs, but the AI call is off |
| Preview shows the whole page (`object-contain`) | `ImageUpload.tsx` | Yes, by hand |
| Decisions and test write-up | `docs/decisions.md`, `docs/process.md` | — |

## Shrinking test (details in `docs/process.md`)

- **Browser:** 4.2 MB → 260 KB (about 94% smaller)
- **Server:** 259,798 → 259,252 bytes (barely changes, as expected)
- **Hidden data removed on the server:** yes. The data sections were gone from the file.

## What we learned

- **Base64** writes the same photo out as text. It's about a third bigger, and it removes nothing.
- **AI models shrink big photos anyway**, so sending a huge photo wastes time.
- **Phone photos hide extra data**, like location. Redrawing or re-saving the photo removes it.
- **Browser code can't run on the server.** No `document` or canvas, so the server uses sharp.
- **An `async` function always returns a Promise.** Use `await` to get the real value.
- **Catch errors only where you can do something about them.**
- **Check first, process after.** Don't do expensive work on a file you'll reject.

## Not done yet ⏳

- [ ] **Switch on the AI call** and send the result back to the page (next)
- [ ] Check the AI can read the small print
- [ ] Build a "golden set": 15–20 real mistakes with the right skill, to test the AI and compare models
- [ ] Prove upright photos are handled (check the original photo's rotation note)
- [ ] Make the size limit smaller (still 10 MB)
- [ ] Update ADR-004 to say "browser **and** server"
- [ ] Finish the 415 error message (it just says "File type ")
- [ ] Error codes: use 4xx for bad images and 5xx for server faults (the catch always sends 400)
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
