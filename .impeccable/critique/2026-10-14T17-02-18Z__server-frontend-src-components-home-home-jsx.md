---
target: home page
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\dispa\\Music\\repos\\dealership-website\\server\\frontend\\src\\components\\Home\\Home.jsx"
target_fingerprint: "sha256:50b8608ba27d25aaa1b9ad28da045dae1346b3763fb2935c159c7bdb529d7310"
target_path: "C:\\Users\\dispa\\Music\\repos\\dealership-website\\server\\frontend\\src\\components\\Home\\Home.jsx"
timestamp: 2026-10-14T17-02-18Z
slug: server-frontend-src-components-home-home-jsx
closed: true
---
Method: dual-agent (A: design review · B: detector + browser). Isolation caveat: shared browser context; B's preflight briefly retitled A's tab and A saw overlay labels once; A disregarded them.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Stale reading stays under edited/empty text; green "live" dot over skeleton before "offline" |
| 2 | Match System / Real World | 3 | compound / pos / neu / neg shown raw, unexplained |
| 3 | User Control and Freedom | 3 | Presets and abort work; minor |
| 4 | Consistency and Standards | 2 | Breaks own DESIGN.md: light teal on dark hero, reading-green used as status, retry only on one error |
| 5 | Error Prevention | 2 | >500 chars / whitespace silently disables button; server messages unreachable |
| 6 | Recognition Rather Than Recall | 3 | Ctrl+Enter undiscoverable |
| 7 | Flexibility and Efficiency | n/a | Persuade surface |
| 8 | Aesthetic and Minimalist Design | 3 | Full-width Analyze bar outweighs the primary CTA |
| 9 | Error Recovery | 3 | Analyzer failure is model-grade; dealer offline has no retry; focus lost on submit |
| 10 | Help and Documentation | n/a | Landing page; map serves as docs |
| Total | | 22/32 | Acceptable (69%), up from 19/32 |

## Design Specificity Verdict
Mostly specific: the Instrument and Sequence Map are product-unique and truthful (map matches views.py:86-94). The frame (H1, CTA band, pill buttons) is still category-generic, and the page never shows a review with its computed label. Detector: CLI 0; browser overlay 3, all TP: teal mono labels 4.4:1 on background-secondary (SystemMap.jsx:82,100), closing paragraph ~102ch line (SystemMap.jsx:108), footer muted 4.4:1 (Home.jsx:162).

## Priority Issues
1. [P1] Stale result and lost focus: reading persists under edited/emptied text; isDisabled while pending drops focus to body; Try again unmounts. Fix: tie result to analyzed text and dim when stale; aria-disabled instead of isDisabled; focus result region after retry. /impeccable harden
2. [P1] Silent input limits: >500/whitespace disables button with no reason; counter counts spaces; native light scrollbar in dark well; server messages unreachable (SentimentDemo.jsx:305 dead). Fix: validate on submit and show messages inline; style scrollbar. /impeccable harden
3. [P2] Competing primaries: full-width teal Analyze bar is the heaviest object above the fold; Browse dealerships x3 while dealer data offline. Fix: compact Analyze with Ctrl+Enter hint; offline line explains impact + retry; replace generic CTA band. /impeccable layout then distill
4. [P2] DESIGN.md drift and contrast: --accent not switched to Night Teal on the hero (teal 3.1-3.5:1 on dark); reading-positive used as status dot (Home.jsx:94); map labels 4.35:1, step numbers 4.40:1, footer 4.43:1; chip focus ring indistinguishable from selected. Fix: scope Night Teal to hero, neutral/teal status dot, darken map teal, white focus outline. /impeccable colorize
5. [P2] Product output never shown; "near you" overclaims (Home.jsx:118). Fix: "by state"; add a sample review strip with computed label; consider H1 around the differentiator. /impeccable clarify then shape

## Persona Red Flags
- Jordan: raw VADER terms unexplained; "Mixed visit" -> Positive +0.73 reads as a bug; shop vs tech-demo ambiguity.
- Riley: silent disable, whitespace counted, stale reading, focus to body, native scrollbar, no dealer retry, "Dealership SignUp" pre-hydration title, manifest 404.
- Casey: no Dealers link on mobile; auto-run result ~1100px down; 26px chips; request vs reply differ only by colour on mobile map.
- Recruiter: strong first 10s, then "Dealer data is offline" beside the main CTA; never sees a labeled review.

## Minor Observations
Lane headers 5-7px off lifelines (gap-x-4 vs gapless grid, SystemMap.jsx:56,62); alert() on logout; footer lacks Dealers; aria-live re-announces meter axis; result min-height shorter than success state (panel jumps); "Flask answered in" is Django->Flask time; hard-coded dealer/15 not labelled as example; ~200px dead space above H1 on desktop; system typeface still provisional.

## Questions to Consider
- Should the page own VADER's blind spot ("Mixed visit" scores Positive) instead of hiding it?
- Is the H1 selling the fictional shopper or the real evaluator?
- Would a live service status strip (Django ✓ · Flask ✓ · Express ✗) turn "looks broken" into "monitors its services"?
