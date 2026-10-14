---
target: home page
total_score: 28
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\dispa\\Music\\repos\\dealership-website\\server\\frontend\\src\\components\\Home\\Home.jsx"
target_fingerprint: "sha256:a47723e69f1b1a4c5a909f8918c141e0a4dc7a5e113c631f578eacae8dea4498"
target_path: "C:\\Users\\dispa\\Music\\repos\\dealership-website\\server\\frontend\\src\\components\\Home\\Home.jsx"
timestamp: 2026-10-14T17-36-27Z
slug: server-frontend-src-components-home-home-jsx
---
Method: dual-agent (A: design review · B: detector + browser). Isolation caveat: shared browser; A's evaluate/click briefly landed on B's tab; B made no changes to A's tab. Neither saw the other's findings.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Status strip is a one-shot snapshot (no checked-at, re-check only when down); hop path stays "done" while result is stale |
| 2 | Match System / Real World | 3 | "words: 35% positive…" mislabels VADER lexicon proportions; can sum to 101% |
| 3 | User Control and Freedom | 3 | No way to restore original example text (minor) |
| 4 | Consistency and Standards | 3 | Instrument "Try again" is light-grey HeroUI secondary, not outline-on-dark; field stays teal when aria-invalid |
| 5 | Error Prevention | 3 | Off-by-one copy at exactly 500 chars |
| 6 | Recognition Rather Than Recall | 4 | Presets, visible Ctrl ↵ hint, labelled hops/lanes |
| 7 | Flexibility and Efficiency | 3 | Ctrl/Cmd+Enter; adequate for a landing page |
| 8 | Aesthetic and Minimalist Design | 3 | Result block stacks ~7 readouts in ~180px |
| 9 | Error Recovery | 3 | Client validation not announced; identical retry failure is silent to screen readers |
| 10 | Help and Documentation | n/a | Persuade surface; map + README link serve as docs |
| Total | | 28/36 | Good (78%); like-for-like with prior runs (H7, H10 n/a): 25/32 |

## Design Specificity Verdict
Specific, not category-interchangeable: instrument, status strip and sequence map are product-unique and truthful. Remaining template fallbacks: three-equal-card sample reviews (testimonial row) and the teal CTA band. Detector: CLI 0, browser overlay 0 (was 3).

## Priority Issues
1. [P1] Every exit but the primary CTA lands on scaffolding: About us (nav + footer) opens Bootstrap About.html with Person1 cards; /dealers still Bootstrap. Fix: drop About/Contact until rebuilt or rebuild as "About this project"; port /dealers next. /impeccable polish + shape
2. [P2] Readouts partly untruthful and limits story stops at "but": words % mislabel + 101% sums (SentimentDemo.jsx:211-213); sarcasm reads Positive +0.85 with no caveat. Fix: "lexicon weight" normalised to 100; persistent limit line or a "Sarcastic" chip. /impeccable clarify
3. [P2] Validation not announced/spec-aligned: inputError not in announce(), no role=alert; error below chips not under field; no fault border on aria-invalid; "under 500" off-by-one; role-less aria-label region; identical retry silent. /impeccable harden
4. [P2] Mobile payoff below the fold: reading at ~997px on 844px screen; chips wrap; hop routes nearly collide. Fix: tighten mobile intro, single-row chips, names-only hops below sm. /impeccable adapt
5. [P3] Sample reviews read as testimonial row; Mockaroo names; hardcoded "Three … one for each label". Fix: realistic fictional names, derived count, shared −1…+1 axis above cards. /impeccable layout

## Persona Red Flags
- Jordan: pre-run result not labelled as an example; "score +0.73" needs the meter to parse; About -> Person1.
- Riley: sarcasm Positive +0.85 no caveat; 101% split; status never re-polls; silent identical retry.
- Casey: result ~997px; chips 2 rows; routes collide; menu no outside-tap close.
- Recruiter: grasps product in ~5s; source link only in the last band; primary CTA and About land on Bootstrap; seed names read as course data.

## Minor Observations
Hop pulse 1.1s vs 15ms real requests (never seen); both hops "active" at once; mono used for person-addressed status ("Text edited…", "Analyzing…"); HeroUI focus-ring offset uses light --background inside .bay; no skip link; "Django up" lacks ms; service_health pings sequentially (up to ~4s); sample_reviews calls Flask serially; get_dealer_reviews 500s when Flask is down; CTA copy "how the four services fit together" vs GitHub button; mobile menu no outside close/focus move; empty sample state has no action.

## Questions to Consider
- 15ms request vs 1.1s pulse: labelled replay, or an honest timing waterfall?
- Let visitors watch the model fail on purpose with a "Sarcastic" chip?
- Should the hero's second action be "Read the source" instead of "Sign up to review"?
