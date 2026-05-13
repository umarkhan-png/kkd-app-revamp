# KKD App — Data Insights (April 2026)

> Source: `C:\KKD\App Data_for redesign(April 2026 data).xlsx`
> Play Store: https://play.google.com/store/apps/details?id=com.katyayani.krishisevakendra
> Captured: 2026-05-13

## Headline metrics

| Metric | Value | Notes |
|---|---|---|
| Total installs (lifetime) | **142,000** | Play Console |
| MAU | **90,000** | 63% of installs — decent retention floor |
| DAU | **9,000** | DAU/MAU = **10%** → low stickiness (visit every ~10 days) |
| April installs | 47,038 | |
| April revenue | **₹1.13 Cr** | ₹11.33M |
| April orders | **10,310** | |
| AOV | **₹1,099** | |
| April purchasers | 8,045 | Of which 80% single, 20% repeat |

## The funnel — where the leak is

### Install → Order (April cohort)

```
Play Store Installs    47,038
        │  -14%
First App Open         40,241
        │  -33%   ← 13,392 dropped (BIG)
Registration Done      26,849
        │  -68%   ← 18,222 dropped (BIGGEST)
Add to Cart             8,627
        │  -58%
Order Placed            3,608
```

**End-to-end: 7.7% of installs convert to an order.** Of those who register, 13.4% order.

### 1-week journey (April users)

```
App Launch       82,214
        │  -56%
Product View     36,209     ← discovery / browse friction
        │  -61%
Add to Cart      14,090     ← PDP / value-prop friction
        │  -17%
Checkout Started 11,726
        │  -47%
Purchase          6,190     ← checkout / payment friction
```

### Cart abandonment (full April)

| Stage | Users | Drop |
|---|---|---|
| Add to Cart | 17,618 | — |
| Checkout Started | 16,237 | -8% |
| **Abandoned** | **7,825** | **-52% abandonment rate** |

## The 3 design battles (in priority order)

1. **Registration → ATC drop of 68%** — biggest hole. People register, then don't find / don't trust / don't see value. → fix **search, discovery, hero pricing, social proof**.
2. **Checkout abandonment 52%** — fix checkout flow, payment options, COD friction, trust at the last mile.
3. **Install → Registration drop of 33%** — validates PM's onboarding complaints (4 loaders, mistimed permissions, double popups). Pure UX hygiene.

## SKU Pareto — what to hero on home

### Top SKUs by REVENUE (April)

| Rank | Product | Revenue | Orders | Notes |
|---|---|---|---|---|
| 1 | **Activated Humic Acid + Fulvic Acid 98** | ₹26.4L | 2,020 | Bio-stimulant |
| 2 | **Chakrawarti** (Thiamethoxam 12.6%) | ₹14.6L | 2,643 | Insecticide — top by orders |
| 3 | **Chakraveer** (Chlorantraniliprole 18.5%) | ₹12.0L | 1,185 | Insecticide |
| 4 | Antivirus | ₹7.0L | 1,726 | |
| 5 | Bhannat | ₹3.9L | 848 | |
| 6 | NPK 19-19-19 | ₹2.9L | 349 | Fertilizer |
| 7 | Katyayani Triple Attack Liquid | ₹2.9L | 450 | |
| 8 | K-Ortho (OSA 2%) | ₹2.4L | 420 | |
| 9 | NPK 00-52-34 | ₹1.8L | 185 | |
| 10 | Seaweed Extract Liquid | ₹1.8L | 281 | |

**Top 3 SKUs alone = ₹53L = 47% of total revenue.** → They must be merchandised as hero tiles on home (PM's "upselling" pain point).

### Category mix

| Category | Revenue | Orders | % rev |
|---|---|---|---|
| **Pesticide** | ₹51.2L | 6,296 | 45% |
| **Fertilizer** | ₹51.1L | 4,620 | 45% |
| Fungicide | ₹7.4L | 840 | 7% |
| Combo | ₹3.3L | 636 | 3% |
| Herbicide | ₹0.8L | 58 | <1% |

→ **Pesticide + Fertilizer = 90% of revenue.** Home IA should lead with these two; herbicide can live a level deeper.

## Payment mix

| Type | Sales | % | Orders | % |
|---|---|---|---|---|
| **COD** | ₹94.9L | **83.5%** | 8,745 | **85%** |
| Prepaid | ₹18.8L | 16.5% | 1,548 | 15% |

→ COD is dominant. Design must NOT punish COD users (no upfront-only flows). But **prepaid is the upsell lever** — Katyayani Parichay offer says: *free sample on ≥₹2,500 prepaid, free sample on Thu/Fri prepaid for specific products*. AOV ₹1,099 → 2.3× to hit free-sample threshold → bundle/upsell opportunity.

## Language preferences (lifetime, in-app)

| Language | Users | % of total |
|---|---|---|
| **English** | 103,247 | **42.8%** |
| **Hindi** | 96,430 | **40.0%** |
| Bengali | 12,262 | 5.1% |
| Marathi | 10,613 | 4.4% |
| Telugu | 7,661 | 3.2% |
| Kannada | 4,345 | 1.8% |
| Odia | 3,366 | 1.4% |
| Tamil | 2,003 | 0.8% |
| Malayalam | 724 | 0.3% |

> **Surprise:** English (43%) edges out Hindi (40%). Two interpretations:
> 1. App defaults to English, biasing the data (likely)
> 2. KKD users are more English-comfortable than typical farmer apps
>
> Action: in revamp, ask language **on first open** with prominent Hindi default + 8 other regional options. Don't auto-pick English.
> Languages to support in v1: **Hindi, English, Bengali, Marathi, Telugu** (covers 95%+ of base).

## Time-to-purchase

- **Average:** 4.6 days from first open
- **Same-day conversion:** **42.9%** of all purchasers convert on day 0

→ First session matters most. The new-user home must be **buy-ready**, not "explore-first". Show price + ADD on hero SKUs immediately, no warm-up.

## Repeat behavior

| | Users | % |
|---|---|---|
| Single purchase in April | 6,402 | **80%** |
| Repeat purchase in April | 1,643 | **20%** |

| Orders | Users |
|---|---|
| 1 | 6,402 |
| 2 | 1,225 |
| 3 | 296 |
| 4 | 83 |
| 5 | 24 |
| 6 | 11 |
| 7+ | 4 |

→ **Retention is the next frontier** but conversion is the bigger fire. Fix conversion first; retention features (loyalty, refill reminders, crop-cycle nudges) come in a later wave.

---

## Design implications (rolling list)

1. **Home merchandising** must be Pareto-driven: Top 3 SKUs (Humic+Fulvic, Chakrawarti, Chakraveer) as hero rails; Pesticide + Fertilizer as top categories.
2. **First session = buy-ready.** No tutorial walls, no permission spam. 4.6-day avg-to-purchase + 43% same-day conversion = treat every new user like a buyer.
3. **Search + discovery is the #1 leak.** PM said it; data confirms (-61% PV→ATC). Search ranking by April sales, vernacular synonyms, crop-problem search, brand-name autocomplete.
4. **Checkout abandonment 52% — design audit needed.** Likely culprits: COD friction, address entry, payment failure, lack of trust seals. Will inspect after screen audit.
5. **Language onboarding upfront** — 5 languages in v1 (Hi, En, Bn, Mr, Te). Don't default to English.
6. **Prepaid push via offer surfacing** — Parichay free-sample threshold (₹2,500) should be a progress bar in cart, not a hidden T&C. Bundle-builder to reach threshold.
7. **Top SKU cross-sell** — pesticide + Humic + NPK is the canonical farmer basket (top 3 categories all hit). Use these as bundle suggestions.
