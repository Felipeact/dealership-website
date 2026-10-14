---
target: home page
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\dispa\\Music\\repos\\dealership-website\\server\\frontend\\src\\components\\Home\\Home.jsx"
target_fingerprint: "sha256:d9e6ea512b0d4ba45e1ca87f125fbde3fd83cc80b0d4897222fde0739897630b"
target_path: "C:\\Users\\dispa\\Music\\repos\\dealership-website\\server\\frontend\\src\\components\\Home\\Home.jsx"
timestamp: 2026-10-14T15-44-17Z
slug: server-frontend-src-components-home-home-jsx
---
Method: dual-agent (A: design review · B: detector + browser). Isolation caveat: A's tab shared a browser context with B's overlay; A reloaded and discarded overlay artifacts.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Stats block silently removed on API error (Home.jsx:174) |
| 2 | Match System / Real World | 3 | Copy promises inventory ("on the lot", "in stock") the product doesn't have |
| 3 | User Control and Freedom | 3 | Logout via blocking alert() |
| 4 | Consistency and Standards | 2 | External-link icon on internal links; Bootstrap pages; About says "Best Cars"; title "Dealership SignUp" |
| 5 | Error Prevention | 3 | Little to get wrong |
| 6 | Recognition Rather Than Recall | 3 | Mobile nav hidden with no replacement (Home.jsx:75) |
| 7 | Flexibility and Efficiency | n/a | Persuade surface |
| 8 | Aesthetic and Minimalist Design | 2 | Empty hero right half; placeholders dominate; off-product section |
| 9 | Error Recovery | 1 | No message, retry, or fallback when data fails |
| 10 | Help and Documentation | n/a | Landing page |
| Total | | 19/32 | Acceptable (59%) |

## Design Specificity Verdict
Category-interchangeable: stock HeroUI SaaS landing skeleton. No review, sentiment, dealer, state, or system diagram on the page. Detector: CLI 0 findings; browser overlay 8 (7 low-contrast TP: muted text 4.1-4.4:1 on bg/tabs/cards, CTA subtext opacity-85 4.1:1 Home.jsx:267; 1 ai-color-palette likely FP on CarImage fallback gradient).

## Priority Issues
1. [P0] Differentiator and system invisible: VADER sentiment and 4-service architecture are half a sentence (Home.jsx:48). Fix: hero right half shows a review card with computed sentiment chip (labelled sample data) or a pipeline diagram. /impeccable shape then bolder.
2. [P1] Page sells car shopping, not dealer reviews: "Shop by body style" 5 tabs all go to /dealers; hardcoded "Popular models in stock". Fix: cut, or replace with Browse by state from get_dealers. /impeccable distill.
3. [P1] Silent error/loading states and grey-sedan placeholders read as unfinished. Fix: inline degraded state with retry; typographic treatment instead of fake photo slots. /impeccable harden.
4. [P1] No mobile navigation (Home.jsx:75). Fix: menu disclosure or keep Dealers visible. /impeccable adapt.
5. [P2] Generic identity + contrast misses: system font, HeroUI violet-grey muted on teal brand, 7 AA misses. Fix: type pairing, tint neutrals to hue 200, raise muted contrast, drop opacity-85. /impeccable typeset then colorize.

## Persona Red Flags
- Jordan: body-style tabs imply car browsing, land on a dealer table; ↗ icon suggests leaving site; "Get started" doesn't say accounts are for reviewing.
- Riley: API down = stats vanish; logout has no try/catch; sessionStorage read in render unguarded (Home.jsx:292).
- Casey: no nav; tablist hides 2 of 5 tabs; placeholder eats ~40% of first scroll.
- Recruiter (60s): well-executed template, zero evidence of the system; one click into Bootstrap + "Best Cars".

## Minor Observations
Unbacked "New and used vehicles nationwide" chip (Home.jsx:152); hardcoded year/brand list (Home.jsx:190); alt "A modern suvs example"; ClosingCta bg-white override no dark counterpart (Home.jsx:271); footer lacks source link / stack note / mock-data disclaimer; no skip link.

## Questions to Consider
- If a recruiter sees one thing above the fold, why a stock car photo instead of a review with its computed sentiment?
- What would the page lose if "Shop by body style" were deleted?
- Could an honest "live data via Django → Express/Mongo, currently unavailable" state prove the architecture better than hiding it?
