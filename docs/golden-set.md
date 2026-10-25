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

| Date | Model | Marking | Skills | Notes |
|---|---|---|---|---|
| 2026-10-24 | `gpt-5.6-luna` | 9/10 | 0/2 | Got its own Q8 order wrong, so marked Q8 correct. Q2 skill: `fractions-to-decimals`. |
| 2026-10-24 | `gpt-6.1-sol` | **10/10** | 0/2 | Q2: `fractions-to-decimals`. Q8: `fraction-decimal-percent`. Both name the topic, not the step that broke. |
| 2026-10-25 | `gpt-6.1-sol` | 10/10 | 0/2 | Before ADR-017 (ids only). Same picks as above. 4,542 tokens in. |
| 2026-10-25 | `gpt-6.1-sol` | 10/10 | **2/2** | After ADR-017 (full skill list + hints). 6,567 tokens in. Joined 4a/4b and 5a/5b into one row each. |
| 2026-10-25 | `gpt-6.1-sol` | 10/10 | **2/2** | Rerun of the above. 6,564 of 6,567 tokens cached. Split 4 and 5 into two rows again, but numbered both "4" (not 4a/4b). |
