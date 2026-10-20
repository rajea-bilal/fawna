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
