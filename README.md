# KKD App Revamp

Revamp of **Katyayani Krishi Direct** (KKD) — D2C farmer-facing agri-inputs app.

**🔗 Live prototype:** https://umarkhan-png.github.io/kkd-app-revamp/

## Context

- **Brand:** Katyayani Krishi Direct — D2C agri-input app for Indian farmers
- **Existing app:** [Play Store](https://play.google.com/store/apps/details?id=com.katyayani.krishisevakendra) · 142k installs · 90k MAU · ₹1.13 Cr April 2026 revenue
- **Sister project:** [Partner App](https://github.com/umarkhan-png/katyayani-partner-app-prototype) (retailer-facing — different design system)
- **Owner:** Umar (PM, Katyayani Organics)
- **Tech target:** Flutter

## Status — v2.1 · 2026-05-14

**38 screens · 8 flows · 17/17 PM observations fixed · K1–K5 review pains addressed**

### Flows

| # | Flow | Screens |
|---|---|---|
| 1 | Browse-first entry | splash · language · home-loggedout |
| 2 | Login (₹100 unlock triggered) | phone · otp · name · tell-us · permissions |
| 3 | Logged-in home | home |
| 4 | Discovery + PDP | shop · pdp · voice-search · photo-diagnosis · categories |
| 5 | Cart → Order | cart · empty-cart · checkout · error-payment · order-success · orders · empty-orders · order-details · track-order · refund-status |
| 6 | My Crop + Advisory | my-crop · crop-calendar · advisory · doctor-call |
| 7 | Account | account · wishlist · saved-payments · about · settings · signout-confirm · addresses · add-address · notifications · help |
| 8 | System | error-network · design-system · philosophy |

### Repo layout

```
kkd-app-revamp/
├── index.html              ← dark gallery (entry)
├── viewer.html             ← phone-shaped viewer · /viewer.html?s=X.html
├── screens/                ← 38 screen files (designed 390×858)
│   ├── design-system.html
│   ├── philosophy.html
│   └── ...
└── reference/              ← source-of-truth docs
    ├── project-brief.md
    ├── existing-app-observations.md
    ├── data-insights.md
    ├── competitor-benchmarks.md
    ├── user-reviews-analysis.md
    └── data/App_Data_April_2026.xlsx
```

## Design language v2.0 (farmer-first)

**Not a Partner App copy.** Distinct earthy aesthetic for B2C farmer audience.

| Token | Value | Use |
|---|---|---|
| Page bg | `#FDF8EE` warm cream | All screens |
| Primary | `#2D5016` forest green | Active nav, hero CTAs |
| CTA green | `#0C831F` | ADD / Buy buttons |
| Terracotta | `#C75933` | Photo diagnosis, error states |
| Mustard | `#D9A441` | Offers, gold accents, sun |
| Sky | `#5B8AC4` | Trust badges, weather |
| Cream tile | `#FFF1D9` | Product card backgrounds |
| Border | `#E8DCC4` | Warm card borders |
| Text 1 | `#2A1F14` warm brown | Primary text |
| Text 2 | `#806A45` | Body |
| Hindi font | Noto Sans Devanagari (Black hero 28–36px) | Devanagari-first |
| Latin font | Hind / Poppins | Body 14–15px min |
| Touch target | 48–54px min | Farmer-friendly |

### Bottom nav (Hindi-native, 4 tabs)

🌾 **खेत** · 🛒 **बाज़ार** · 👨‍⚕️ **डॉक्टर** · 👤 **मैं**

### Home structure (operational, not e-commerce-first)

1. Field-photo hero + greeting + weather card (floating)
2. **Aaj ka kaam** flashcard (single bold action)
3. **Voice + Photo** twin giant CTAs (148px tall)
4. Mandi rates auto-ticker (running marquee)
5. ₹100 unlock note OR ₹100 unlocked confirmation
6. Krishi Doctor with agronomist face
7. Categories (4 emoji tiles)
8. Crop circles (6 real crop photos)
9. Bestsellers (last)

## Coverage map

### 17 PM observations (all fixed)

| # | Observation | Fix screen |
|---|---|---|
| 1 | 4 splash loaders | splash (single, 2.5s) |
| 2 | Auto-fetch mobile | phone (kept) |
| 3 | Auto-fetch OTP | otp (kept) |
| 4 | Name after OTP flow break | name (inline new-user only) |
| 5–9 | Permission popups, no value comm | permissions (value-first + coins shown) |
| 10 | About-modal hidden above banner | removed from new flow |
| 11 | PDP popup twice (Eng + Hindi) | pdp (single language-aware) |
| 12 | Wrong rating calculation | pdp (breakdown shown) |
| 13 | Variant selector eats space | pdp (chip row + sheet) |
| 14 | Crop Calendar broken empty | crop-calendar (5-stage timeline + tasks) |
| 15 | "My farm" vs "My crop" | "My Crop" canonical |
| 16 | "Track order" vs "Order tracking" | "Track Order" canonical |
| 17 | No sign-out confirm | signout-confirm (bottom sheet) |

### K1–K5 review pain fixes

| # | Complaint | Fix |
|---|---|---|
| K1 | Payment taken, no product | Confirmation screen + WhatsApp receipt on order-success |
| K2 | Refund stuck ~1 month | refund-status (SLA tracker with timeline + expected-by) |
| K3 | Wrong product, no replacement path | order-details "Report issue" → pre-approved replacement |
| K4 | "Fake offer, more than market" | pdp factory-direct badge + "you saved ₹X" bill |
| K5 | "Higher price vs other brands" | Cart bill summary highlights total savings |

## Deploy + iterate

GitHub Pages auto-deploys from `main` branch root in ~30–60s after push.

```bash
git add -A
git commit -m "..."
git push
# Verify deployed:
curl -s "https://umarkhan-png.github.io/kkd-app-revamp/?v=$RANDOM" | grep "..."
```

## Source-of-truth docs

- [Project brief](reference/project-brief.md) — 11-point PM scope
- [Existing-app observations](reference/existing-app-observations.md) — 17 PM-stated pain points
- [Data insights](reference/data-insights.md) — April 2026 funnel + Pareto
- [Competitor benchmarks](reference/competitor-benchmarks.md) — DeHaat · AgroStar · BigHaat · Krishify
- [User reviews analysis](reference/user-reviews-analysis.md) — K1–K5 + Trust pack
