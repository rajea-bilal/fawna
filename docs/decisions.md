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
- Status: Accepted (conversion written, OpenAI call still commented out)

**Context:** The AI needs to see the photo. These are photos of children's work, so privacy matters.

**Options:** Base64 in the request · Store it online and send a link · Upload to OpenAI first and refer to it by ID

**Decision:** Base64. It's the simplest, and the photo is never stored. A link means storing children's work. An upload ID only helps if the same photo is analysed many times.

**Risks:** About 33% bigger (1.7 MB → about 2.3 MB). The whole photo is held in server memory.

**Validation:** Not tested end to end. Not measured.

**Lesson:** Base64 rewrites the same bytes as text. Nothing is removed, including hidden photo data.

---

# ADR-003: Shrink photos in the browser before upload

- Date: 2026-10-20
- Status: Proposed

**Context:** One worksheet photo was 1.7 MB. The AI shrinks large images anyway and is charged by pixel size, so most of that upload is wasted, which is slow on mobile.

**Options:** Upload the original · Shrink on the server · Shrink in the browser

**Decision:** Shrink in the browser to about 1600 px on the long side, JPEG/WebP at about 80% quality. Only shrinking in the browser speeds up the parent's upload.

**Risks:** Upright photos could come out sideways if the browser ignores the rotation note (modern browsers handle this). Small text could become unreadable.

**Validation:** Not built. Estimated 200–400 KB per photo. Test with real worksheets taken upright.

**Lesson:** Pixel size matters to the AI more than file size.

---

# ADR-004: Remove hidden photo data in the browser only

- Date: 2026-10-20
- Status: Proposed (depends on ADR-003)

**Context:** Phone photos carry hidden data (EXIF) that can include the home's location. Nothing removes it today.

**Options:** Browser only · Server only · Both

**Decision:** Browser only. Shrinking already removes it for free. Logins are planned. The data belongs to the parent uploading it. And it avoids adding an image library to the server.

**Risks:** Usually removed, not always. Originals can still get through if shrinking fails, if the page is an old cached copy, or if someone calls the endpoint directly. Logging in controls who uploads, not whether the file went through our page.

**Open question:** If shrinking fails, send the original or show an error?

**Revisit when:** Real parents start using Fawna, a second way to upload is added, or legal or privacy promises are needed.

**Lesson:** Logging in answers "who sent this?", not "was this file processed?"

---

# ADR-005: Two AI calls: Review, then Practice

- Date: 2026-10-21
- Status: Proposed

**Context:** Parents want marks first. Only some will want practice.

**Options:** One big call that does everything · Two calls

**Decision:** Two calls.

1. **Review** (on Analyze): reads the photo, marks each question and names the skill for each wrong answer.
2. **Practice** (on one "Practice my mistakes" button): makes questions **grouped by skill**, not by question, at easier, same or harder levels. It's sent text only, never the photo.

**Why:** You only pay for practice when it's asked for. Marks show up faster. The child's handwriting is sent once. Each step can be tested on its own.

**Lesson:** Split work where the user's choices split.

---

# ADR-006: Skill names come from a fixed list

- Date: 2026-10-21
- Status: Accepted (list in `lib/ai/mathSkills.ts`, not used yet)

**Context:** If the AI makes up skill names, the same gap gets different names ("carrying" or "regrouping"). Then results can't be grouped or tracked over time.

**Options:** AI makes up names · A fixed list the AI must pick from

**Decision:** Two levels, **category → skill**, based on the National Curriculum for England (Years 1–6). The AI can only pick from the list. If nothing fits, it uses **"Other"** and suggests a name, which we review and may add.

- `id` never changes. `name` can be reworded.
- `fromYear` lets us show the AI only the skills up to the child's year.

**Risks:** The list may miss skills. The curriculum changes in September 2028.

**Lesson:** Short names don't stop duplicates. A fixed list does.

---

# ADR-007: The AI marks the answers, and code counts them

- Date: 2026-10-22
- Status: Proposed

**Context:** Code can check `36 + 47`, but not word problems, graphs or shapes.

**Options:** Code checks the maths · The AI marks everything

**Decision:** The AI marks. To make it more reliable:

- It writes `correctAnswer` **before** `isCorrect`, so it solves before it judges.
- It can say **"can't read this"** instead of guessing.
- **Every wrong answer is a skill gap**, even a one-off slip.
- **Code**, not the AI, adds up the totals.

**Risks:** The AI can get simple sums wrong.

**Revisit when:** Tests show maths mistakes. Then add a code double-check for plain sums only.

**Lesson:** The order of fields in the schema changes the quality of the answer.

---

# ADR-008: The AI replies in a fixed shape

- Date: 2026-10-21
- Status: Proposed

**Context:** The page needs reliable data, not a chatty reply.

**Options:** Ask for JSON in the instructions · Make OpenAI enforce a schema

**Decision:** Enforce it. Use OpenAI Structured Outputs (`text.format`) with a **Zod** schema. Zod also checks the reply while the app runs, which TypeScript types can't do.

**Risks:** Adds Zod as a dependency (not installed directly yet).

**Lesson:** Asking for a format is a request. A schema is a rule.

---

# ADR-009: Send the AI only the photo and the school year

- Date: 2026-10-21
- Status: Proposed (year is fixed in the code for now)

**Context:** The year sets the skill list, the practice level and the tone. Families will enter the child's name and year when they sign up.

**Decision:**

- `analyzeWorksheet` takes the year as an input. For now the route passes a fixed value. Later it will come from the family account. The function won't change.
- **The child's name is never sent to the AI.** Use it only on our own page.
- Parents don't choose what the AI does. Analyze always does the same job.

**Lesson:** Only send an outside service what it needs. A function shouldn't care where its inputs come from.

---

# ADR-010: How we call OpenAI

- Date: 2026-10-22
- Status: Proposed

**Decision:**

- Use the **Responses API** (`responses.parse`), not the older `chat.completions`.
- **`instructions`** holds the fixed rules, the role and the tone. They're written once in `analyzeWorksheet.ts`, not passed in from the route. They're sent with every call, because the API has no memory, and kept the same each time so OpenAI's caching makes them cheaper.
- **`input`** holds what changes: the photo (data URL, `detail: "high"`) and the year.
- Language suits both the parent and the child.

**Lesson:** Instructions are the function. The input is its arguments.

---

# ADR-011: Choose the model by testing

- Date: 2026-10-22
- Status: Proposed

**Context:** Reading handwriting is the hard part. A misread "7" marks a right answer as wrong.

**Options:** `gpt-6-luna` (cheapest) · `gpt-6.1-sol` (mid) · `gpt-6-astra` (most capable)

**Decision:** Mark a real worksheet by hand. Run it through Luna and Sol. Pick the cheapest one that marks everything correctly.

**Validation:** Not tested. Estimated cost: about $0.001 (Luna) to $0.02 (Sol) per worksheet. This is a guess, not measured.

**Lesson:** Accuracy matters more than model cost at this scale.

I used `discriminatedUnion` so every answer marked `"incorrect"` must include a `skillId` from our approved list, or `"other"` if none fits. This prevents missing skill IDs and made-up skill names, keeping skill gap naming consistent. It does not guarantee the AI chooses the right skill.
