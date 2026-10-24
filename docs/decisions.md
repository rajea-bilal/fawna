# Fawna — Engineering Decisions

Status: **Proposed** (agreed, not built) · **Accepted** (being built) · **Implemented** (in code) · **Validated** (proven by tests or real use)

---

# ADR-001: Check uploads in both browser and server

- Date: 2026-09-11
- Status: Implemented

**Context:** Parents need quick feedback on bad files. The server must never process one.

**Options:** Browser only · Server only · Both

**Decision:** Both, with the same rules (PNG/JPEG/WebP, same size limit). The browser gives instant feedback. The server is the real safety check, because anyone can call `/api/analyze` directly. It replies 400 (no file), 413 (too big) or 415 (wrong type).

**Risks:** The rules are written twice and could drift apart. The file type is whatever the browser reports, not checked from the file's contents.

**Validation:** Tested by hand. No automated tests.

**Lesson:** Browser checks are for convenience. Server checks are for safety.

---

# ADR-002: Send the photo to the AI as base64

- Date: 2026-10-20
- Status: Validated

**Context:** The AI needs to see the photo. These are photos of children's work, so privacy matters.

**Options:** Base64 in the request · Store it online and send a link · Upload to OpenAI first and refer to it by ID

**Decision:** Base64. It's the simplest, and the photo is never stored. A link means storing children's work. An upload ID only helps if the same photo is analysed many times.

**Risks:** About 33% bigger than the original. The whole photo is held in server memory.

**Validation:** A real worksheet photo went through OpenAI and every question was read (2026-10-24).

**Lesson:** Base64 rewrites the same bytes as text. Nothing is removed, including hidden photo data.

---

# ADR-003: Shrink photos in the browser before upload

- Date: 2026-10-20
- Status: Validated

**Context:** Phone photos are large. The AI shrinks large images anyway and is charged by pixel size, so most of the upload is wasted, which is slow on mobile.

**Options:** Upload the original · Shrink on the server · Shrink in the browser

**Decision:** Shrink in the browser to 1600 px on the long side, JPEG at 80% quality (`lib/image/shrinkImage.ts`). Only shrinking in the browser speeds up the parent's upload.

**Risks:** Small text could become unreadable.

**Validation:** A real iPhone photo went from 4.2 MB to 260 KB and stayed upright (`docs/process.md`). Not yet checked: whether the AI can read the small print.

**Lesson:** Pixel size matters to the AI more than file size.

---

# ADR-004: Remove hidden photo data in the browser and on the server

- Date: 2026-10-20 (updated 2026-10-24)
- Status: Validated

**Context:** Phone photos carry hidden data (EXIF) that can include the home's location.

**Options:** Browser only · Server only · Both

**Decision:** Both. Shrinking in the browser removes it for free. The server shrinks again with sharp as a safety net, in case the browser step was skipped (an old cached page, or someone calling the endpoint directly).

**Risks:** sharp is an extra dependency on the server.

**Validation:** After the server step, the hidden data sections were gone from the file (`docs/process.md`).

**Lesson:** Logging in answers "who sent this?", not "was this file processed?"

---

# ADR-005: Two AI calls: Review, then Practice

- Date: 2026-10-21
- Status: Proposed (Review is built, Practice is not)

**Context:** Parents want marks first. Only some will want practice.

**Options:** One big call that does everything · Two calls

**Decision:** Two calls.

1. **Review** (on Analyze): reads the photo, marks each question and names the skill for each wrong or blank answer.
2. **Practice** (one "Practice my mistakes" button): makes questions **grouped by skill**, not by question, at easier, same or harder levels. It's sent text only, never the photo.

**Why:** You only pay for practice when it's asked for. Marks show up faster. The child's handwriting is sent once. Each step can be tested on its own.

**Lesson:** Split work where the user's choices split.

---

# ADR-006: Skill names come from a fixed list

- Date: 2026-10-21
- Status: Implemented (`lib/ai/mathSkills.ts`)

**Context:** If the AI makes up skill names, the same gap gets different names ("carrying" or "regrouping"). Then results can't be grouped or tracked over time.

**Options:** The AI makes up names · A fixed list the AI must pick from

**Decision:** Two levels, **category → skill**, based on the National Curriculum for England (Years 1–6). The AI can only pick from the list. If nothing fits, it **suggests** a new skill (category and name), which we review and may add.

- `id` never changes. `name` can be reworded.
- `fromYear` will let us show the AI only the skills up to the child's year.
- Each skill has one `kind` (see ADR-013).

**Risks:** The list may miss skills. The curriculum changes in September 2028.

**Lesson:** Short names don't stop duplicates. A fixed list does.

---

# ADR-007: The AI marks the answers, and code counts them

- Date: 2026-10-22
- Status: Implemented (not yet tested with a real worksheet)

**Context:** Code can check `36 + 47`, but not word problems, graphs or shapes.

**Options:** Code checks the maths · The AI marks everything

**Decision:** The AI marks. To make it more reliable:

- It writes `correctAnswer` **before** `result`, so it solves before it judges.
- It can say **"unreadable"** instead of guessing.
- **Every wrong answer is a skill gap**, even a one-off slip.
- **Code**, not the AI, adds up the totals (`route.ts`).

**Risks:** The AI can get simple sums wrong.

**Revisit when:** Tests show maths mistakes. Then add a code double-check for plain sums only.

**Lesson:** The order of fields in the schema changes the quality of the answer.

---

# ADR-008: The AI replies in a fixed shape

- Date: 2026-10-21
- Status: Implemented (`lib/ai/worksheetSchema.ts`)

**Context:** The page needs reliable data, not a chatty reply.

**Options:** Ask for JSON in the instructions · Make OpenAI enforce a schema

**Decision:** Enforce it. Use OpenAI Structured Outputs (`text.format`) with a **Zod** schema. Zod also checks the reply while the app runs, which TypeScript types can't do. The TypeScript types come from the schema (`z.infer`), so the shape is written once.

**Risks:** The schema is sent with every call, which adds to the cost.

**Lesson:** Asking for a format is a request. A schema is a rule.

---

# ADR-009: Send the AI only the photo and the school year

- Date: 2026-10-21
- Status: Implemented (year is fixed at 5 for now)

**Context:** The year sets the skill list, the practice level and the tone. Families will enter the child's name and year when they sign up.

**Decision:**

- `analyzeWorksheet` takes the year as an input. For now the route passes a fixed value. Later it will come from the family account. The function won't change.
- **The child's name is never sent to the AI.** Use it only on our own page.
- Parents don't choose what the AI does. Analyze always does the same job.

**Lesson:** Only send an outside service what it needs. A function shouldn't care where its inputs come from.

---

# ADR-010: How we call OpenAI

- Date: 2026-10-22
- Status: Implemented (not yet run)

**Decision:**

- Use the **Responses API** (`responses.parse`), not the older `chat.completions`.
- **`instructions`** holds the fixed marking rules. They're written once in `analyzeWorksheet.ts`, not passed in from the route. They're sent with every call, because the API has no memory, and kept the same each time so OpenAI's caching makes them cheaper.
- **`input`** holds what changes: the year and the photo (data URL, `detail: "high"`).

**Lesson:** Instructions are the function. The input is its arguments.

---

# ADR-011: Choose the model by testing

- Date: 2026-10-22
- Status: Accepted (`gpt-6.1-sol`, based on 1 worksheet)

**Context:** Reading handwriting is the hard part. A misread "7" marks a right answer as wrong.

**Options:** `gpt-6-luna` (cheapest) · `gpt-6.1-sol` (mid) · `gpt-6-astra` (most capable)

**Decision:** Mark a real worksheet by hand. Run it through Luna and Sol. Pick the cheapest one that marks everything correctly.

**Validation:** Golden-set entry 1 (`docs/golden-set.md`): Luna marked 9/10 (it got its own answer to Q8 wrong). Sol marked 10/10. Both named 0 of 2 skills the way we would. Only one worksheet so far. Cost is still estimated, not measured: about $0.001 (Luna) to $0.02 (Sol) per worksheet.

**Revisit when:** the instructions improve. Then try Luna again, since it's about 20× cheaper.

**Lesson:** Accuracy matters more than model cost at this scale.

---

# ADR-012: Four result shapes, and a skill is required where it matters

- Date: 2026-10-24
- Status: Implemented (`lib/ai/worksheetSchema.ts`)

**Context:** Each question needs a result. Wrong answers must always name a skill. Some answers can't be read, and some are left blank. Two true/false fields (`isCorrect`, `isReadable`) would allow nonsense like "unreadable but correct".

**Options:** Two true/false fields · One `result` field with an optional skill · A different shape for each result (`discriminatedUnion`)

**Decision:** A different shape for each result. `result` says which one:

| Result | Skill? |
|---|---|
| `correct` | No |
| `incorrect` | **Required:** the skill for the step that went wrong |
| `unreadable` | No. The AI must not guess. |
| `blank` | **Required:** the main skill the question tests, so it can go into practice. If every answer is crossed out, it counts as blank. |

A skill is either **from the list** (`skillId`) or **suggested** (category and a short name).

**In my words:** I used `discriminatedUnion` so every answer marked "incorrect" must include a skill from our approved list, or a suggested one if none fits. This prevents missing skills and made-up skill names, and keeps skill gap naming consistent.

**Trade-offs and risks:**

- The schema makes sure the skill is **from the list**, not that it's the **right** one.
- We don't know why a question was left blank (didn't know how, or ran out of time).

**Validation:** Tested locally with Zod: a good reply passes. These are rejected: "incorrect" with no skill, a made-up skill id, and "blank" with no skill. OpenAI accepts the format (strict mode). Not yet tested with a real AI call.

**Lesson:** Make impossible states impossible.

---

# ADR-013: Each skill has one kind: fact, method or idea

- Date: 2026-10-24
- Status: Implemented in the list (`lib/ai/mathSkills.ts`). Not used for help yet.

**Context:** Not every mistake needs an explanation. Getting 7 × 5 or 1 kg = 1000 g wrong just means the fact isn't memorised yet. But one skill can hide two kinds: "Converting units" can be a forgotten fact (1 kg = 100 g) or a broken method (2.5 kg = 25 g).

**Options:** The AI decides the kind for each mistake · Keep the kind on each skill as it was · Split mixed skills so each skill has exactly one kind

**Decision:** Split them. The kind is fixed in our list, decided once, by a person. The AI only picks the most specific skill, "for the exact step that went wrong".

- **fact:** remember one thing → recall practice
- **method:** follow steps → worked example
- **idea:** understand why → a picture first

Test: *"Could a child get this right just by remembering one thing?"* Yes means fact.

**Trade-offs and risks:**

- Some kinds are judgement calls (BIDMAS = fact, telling the time = method). They need review.
- The AI may still pick the topic instead of the step that broke.

**Validation:** 116 skills, each with one kind, no duplicate ids. Not tested with the AI. Plan: a "golden set" of 15–20 real mistakes with the right skill.

**Lesson:** Put decisions in data you control, not in the AI's judgement.

---

# ADR-014: Layered error handling

- Date: 2026-10-24
- Status: Implemented (`app/api/analyze/route.ts`)

**Context:** One `catch` sent every failure as 400 "Malfunctioning in the system". The parent couldn't tell "try another photo" from "try again later", and 400 wrongly blamed them. Also, `catch (Error)` hid JavaScript's built-in `Error`.

**Options:** One catch for everything · Each helper catches and returns a response · Helpers throw, the route decides

**Decision:** Helpers throw. The route decides what the parent sees.

- **Layer 1, the image:** sharp fails → **422** "We couldn't open this photo."
- **Layer 2, the AI:** busy → **503**, too slow → **504**, anything else → **502**.
- The real error is logged with `console.error`. The parent only sees a simple message, never `error.message`.
- The OpenAI client gives up after 60 seconds and retries once.

I first added a `try/catch` inside `analyzeWorksheet` that returned a response. We removed it, because it hid the error type from the route, so "busy" and "too slow" could never be shown.

**Trade-offs and risks:**

- 502 covers many causes (bad key, empty reply, a bug). The logs tell them apart.
- The page doesn't use the status codes yet.

**Validation:** TypeScript passes. A wrong API key gave the parent a 502 with a simple message, while the full error showed in the server logs. The other error paths haven't been triggered yet.

**Lesson:** Catch errors only where you can do something about them.

---

# ADR-015: Understand the mistake before practising it

- Date: 2026-10-24
- Status: Proposed (not built, waits until marking is accurate)

**Context:** Parents want the score. But giving more questions of the same type doesn't fix a misunderstanding. The child just practises the mistake.

**Options:** Score, then practice · Score, explanation, an "Understood" button, then practice · Score, explanation, a check question, then practice

**Decision:** Five steps:

1. **Result:** the parent sees the score, what went well, and a short "how to help" note.
2. **Understand:** the child's answer next to the right one, step by step. Fact gaps skip this (ADR-013).
3. **Check:** one question. If it's right, go on. If it's wrong, explain another way. 2 tries at most, then suggest asking the teacher.
4. **Practice:** questions of the same type first, then mixed with other skills.
5. **Later:** bring the skill back a few days later (needs accounts).

A check question replaces the "Understood" button, because children (and adults) are poor judges of whether they've understood.

**Evidence (research, not our tests):** Comparing wrong and right examples builds understanding (Booth et al., 2013). Mixed practice scored 61% vs 38% a month later (Rohrer et al., 2019). Children of maths-anxious parents learned less when those parents often helped with homework (Maloney et al., 2015).

**Trade-offs and risks:** More AI calls, so more cost. More to build. The check question itself could be marked wrongly.

**Validation:** None yet.

**Lesson:** Feeling you understand isn't the same as understanding.
