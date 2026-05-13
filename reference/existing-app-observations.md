# Existing KKD App — Observations & Pain Points

> PM walkthrough notes from 2026-05-13. Each item is a redesign opportunity.
> Screenshots: `C:\KKD\KKD App Screenshot\` (52 files).

## Onboarding / App Open

| # | Observation | Severity | Fix direction |
|---|---|---|---|
| 1 | **Four loaders on app open:** `app logo` → `logo splash` → `parichay splash` → `homepage loader` | High — perceived slowness | Collapse to 1 splash + skeleton home |
| 2 | Auto-fetch mobile number | ✅ Good — keep | — |
| 3 | Auto-fetch OTP | ✅ Good — keep | — |
| 4 | Signup & login are same page; signup user must enter name AFTER OTP | Medium — flow break | Detect new vs existing on OTP success; show name field inline only for new |

## Permissions & First-run

| # | Observation | Severity | Fix direction |
|---|---|---|---|
| 5 | Notification permission modal pops ~10 sec after landing on home | Medium — disruptive | Trigger contextually (e.g. on order placed, on price alert opt-in) |
| 6 | "Earn 10 coins on enable" — **not communicated** in the permission ask itself | High — broken value prop | Pre-permission rationale screen: "Enable notifications, earn ₹X" |
| 7 | Toast appears AFTER earning coins (success feedback) | ✅ OK | — |
| 8 | Location permission auto-pops ~10 sec AFTER notification permission | Medium — permission fatigue | Same: trigger contextually (on address entry, mandi price view) |
| 9 | Same "earn 10 coins" miscommunication for location | High | Same fix as #6 |

## Home / First-time Modals

| # | Observation | Severity | Fix direction |
|---|---|---|---|
| 10 | "KKD app ke baare mein" modal appears after few sec — sits **above the banner**, **not visible** | High — wasted impression | Either remove or convert to first-time bottom-sheet with proper z-index |

## PDP (Product Detail Page)

| # | Observation | Severity | Fix direction |
|---|---|---|---|
| 11 | Side popup appears **twice** — once in English, then Hindi | High — bug + clutter | Single popup, language-aware OR remove |
| 12 | "Delayed + Overall rating 5" — rating calculation is **incorrect** | High — trust killer | Fix math + show breakdown (delivery time vs product quality) |
| 13 | Variant selector eats up too much vertical space when many variants | Medium — discovery loss | Compact chip row + "See all" sheet (Blinkit-style) |

## Crop / Farm Module

| # | Observation | Severity | Fix direction |
|---|---|---|---|
| 14 | Select Crop → Crop Calendar → **nothing appears** (empty state / broken) | High — broken feature | Fix data wiring; meaningful empty state with crop suggestions |
| 15 | Naming inconsistency: "**My farm**" vs "**My crop**" | Low — IA hygiene | Pick one taxonomy; reflect in nav + screen titles |

## Orders

| # | Observation | Severity | Fix direction |
|---|---|---|---|
| 16 | Naming inconsistency: "**Track order**" (list) vs "**Order tracking**" (inside order detail) | Low — IA hygiene | Single canonical term |

## Account / Settings

| # | Observation | Severity | Fix direction |
|---|---|---|---|
| 17 | **No confirmation on sign-out** | Medium — accidental loss | Add confirm dialog ("Sign out? You'll lose offline cart.") |

---

## Themes (rolled up)

1. **Permission strategy is broken** — wrong timing, no value communication, fatigue (items #5–9)
2. **First-run polish is missing** — 4 loaders, invisible modals, mistimed popups (#1, #10)
3. **Trust signals are buggy** — rating math wrong, double popup (#11–12)
4. **IA inconsistencies** — same concept named differently across screens (#15, #16)
5. **Empty/edge states missing** — Crop Calendar (#14)
6. **No destructive-action confirmations** (#17)
