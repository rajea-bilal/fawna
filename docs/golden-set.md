# Golden Set

An answer key we trust, used to test the AI.

Each entry is a real worksheet that **we** marked by hand, including the right skill for every mistake. Whenever we change the model, the instructions or the skill list, we run the AI on every entry and compare its answers with ours.

**Photos** are kept in `golden-set-photos/`, which git ignores. They show children's work, so they never go to GitHub.

## How to score a run

- **Marking:** how many questions the AI marked the same as us
- **Skills:** how many mistakes the AI gave the same skill as us

---

## Entry 1: Fraction Basics

- Photo: `golden-set-photos/01-fraction-basics.png`
- Worksheet: Section 6, Understanding & Application (Year 4 revision)
- Expected: **8 correct · 2 to work on**

| Q | Child wrote | Right answer | Result | Skill |
|---|---|---|---|---|
| 1 | 0.53 | 0.53 | ✅ | — |
| 2 | 0.66 | 0.066 | ❌ | `dividing-by-10-100-1000`: digits moved 2 places instead of 3 |
| 3 | 0.25 | 0.25 | ✅ | — |
| 4a | 7/5 | 7/5 | ✅ | — |
| 4b | 15/4 | 15/4 | ✅ | — |
| 5a | 7 | 7 | ✅ | — |
| 5b | 5 2/8 | 5 2/8 or 5 ¼ | ✅ | — (the question didn't ask for simplest form) |
| 6 | 24 | 24 | ✅ | — |
| 7 | 0.05, 0.2, 0.25, 0.3, 0.5 | same order | ✅ | — |
| 8 | 0.1, 0.34, 0.4, 0.5, 0.75 | 10%, 25%, 34/100, ½, ¾ | ❌ | `percentage-facts`: thought 25% = 0.4 |

**Notes:**
- Q8: the child's strategy (turn everything into decimals, then order) and the ordering were right. Only 25% → 0.4 was wrong.
- Q2 vs Q8: in Q2 the digits stayed (0.66), so they moved the wrong number of places. In Q8 the digits changed (0.4), so it's not a ÷100 slip.

### Runs

Token logs for the 2026-10-25 runs: [before ADR-017](images/token_usage_test.png), [after ADR-017](images/token_usage_after_test.png).

| Date | Model | Marking | Skills | Notes |
|---|---|---|---|---|
| 2026-10-24 | `gpt-5.6-luna` | 9/10 | 0/2 | Got its own Q8 order wrong, so marked Q8 correct. Q2 skill: `fractions-to-decimals`. |
| 2026-10-24 | `gpt-6.1-sol` | **10/10** | 0/2 | Q2: `fractions-to-decimals`. Q8: `fraction-decimal-percent`. Both name the topic, not the step that broke. |
| 2026-10-25 | `gpt-6.1-sol` | 10/10 | 0/2 | Before ADR-017 (ids only). Same picks as above. 4,542 tokens in. |
| 2026-10-25 | `gpt-6.1-sol` | 10/10 | **2/2** | After ADR-017 (full skill list + hints). 6,567 tokens in. Joined 4a/4b and 5a/5b into one row each. |
| 2026-10-25 | `gpt-6.1-sol` | 10/10 | **2/2** | Rerun of the above. 6,564 of 6,567 tokens cached. Split 4 and 5 into two rows again, but numbered both "4" (not 4a/4b). |

---

## Entry 2: Percentages, Division, Fraction & Decimal Basics

- Photo: `golden-set-photos/02-percentages-division-fractions.jpg`
- Worksheet: Page 3, Sections 4–6 (Year 4 revision)
- Expected: **11 correct · 4 to work on · 2 not answered**

| Q | Child wrote | Right answer | Result | Skill |
|---|---|---|---|---|
| 4.1 | 42p | 42p | ✅ | — (right answer, wrong method: see notes) |
| 4.2 | 120g | 12kg | ❌ | `percent-meaning`: used 15/10, not 15/100 |
| 4.3 | 140 (in the working, answer line empty) | £42 | ❌ | `percent-meaning`: used 35/10, not 35/100 |
| 5.1 | 50 | 50 | ✅ | — |
| 5.2 | 0.51 | 0.51 | ✅ | — |
| 6.1 | 0.067 | 0.067 | ✅ | — |
| 6.2 | blank | 52/1000 or 13/250 | ⬜ | `fractions-to-decimals` |
| 6.3 | 3/8 | 3/8 | ✅ | — |
| 6.4 | blank | 43/8 | ⬜ | `mixed-improper-fractions` |
| 6.5 | 2 4/5 | 2 4/5 | ✅ | — (could be misread as 24/5) |
| 6.6 | 3/4 | 3/4 | ✅ | — |
| 6.7a | 0.006, 0.06, 0.6, 0.66, 0.661 | same order | ✅ | — |
| 6.7b | 5/100, 1/5, 1/4, 3/10, 0.5 | same order | ✅ | — (the first ¼ is crossed out, checked on paper) |
| 6.7c | 0.2, 0.25, 0.2, (unfinished) | 0.25, 27/100, 0.4, 50%, 75% | ❌ | `comparing-decimals`: unfinished, so the gap is a guess |
| 6.8 | 60 | 60 | ✅ | — |
| 6.9 | 90p | 90p | ✅ | — |
| 6.10 | 4/6 | 5/6 | ❌ | `adding-subtracting-different-denominator`: changed 2/3 to 4/6, then didn't add the 1/6 |

**Notes:**
- **Percentages:** the working shows 7/10, 15/10 and 35/10. The child thinks percent means "out of 10". 4.1 is right only because 70/100 = 7/10. The explain AI can't see this, because it gets text only, not the working (ADR-022).
- 4.3 also has a slip in the working: 35 × 12 written as 70 + 70 = 140.
- 6.7c: a half-written answer is still readable. It should be ❌, not "couldn't read".
- Question numbers repeat across sections (three "Q2"s). The AI wrote Q2 for 4.2.

### Runs

| Date | Model | Marking | Skills | Notes |
|---|---|---|---|---|
| 2026-11-15 | `gpt-6.1-sol` | 16/17 | 5/6 | 11 correct · 3 to work on · 2 not answered · 1 couldn't read. 6.7c marked "couldn't read" instead of ❌, so it got no skill. Other skills matched. Percent card used 10% + 5%, not the child's own working. |
