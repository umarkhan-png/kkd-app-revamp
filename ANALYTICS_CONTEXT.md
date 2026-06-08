# KKD D2C App — Event-Tracking Project Context

> **Purpose of this document.** This is an exhaustive, granular context file describing the KKD (Katyayani Krishi Direct) D2C agri-commerce app — every screen, every interactive element, every user journey, and every dynamic data point tied to those interactions. It is written to be fed into an AI/engineering effort that will build the app's **event-tracking architecture**. Completeness is the priority: each screen is documented at the component level with the explicit user intent behind every interaction and the exact dynamic properties available at the moment of that interaction.
>
> **Grounding.** Everything below is derived from a direct reading of the actual prototype HTML/JS in `screens/*.html` and `assets/*.js`. Where the prototype is missing a handler, persists nothing, or contradicts itself, it is flagged as a **⚠ GAP** so instrumentation knows what must be wired before tracking will fire reliably. No screens or fields are invented.

---

## 0. App overview & technical context

- **Product.** A direct-to-farmer (D2C) commerce app for Katyayani Krishi Direct — sells crop-protection and nutrition products (pesticides, fungicides, fertilizers, herbicides, combos) plus agronomy services (expert calls, photo diagnosis, crop calendar).
- **Stack.** Static HTML/CSS/JS prototype (no backend). Each "screen" is a standalone `.html` file under `screens/`. Shared behaviour lives in `assets/*.js`. All persisted state is mock data in JS arrays + `localStorage`. Live build is served via Capacitor (APK `server.url` → jsDelivr) and previewed at `umarkhan-png.github.io/kkd-app-revamp/` through `viewer.html?s=<screen>.html`.
- **Languages.** UI is bilingual (Hindi/Hinglish + English); 12 languages are selectable.
- **Audience for tracking.** Product analytics / growth — funnel analysis (discover → PDP → cart → checkout → order), reward/gamification engagement, and agronomy-service usage.

### Tracking-architecture implications (read first)
1. **Most product data is in markup, not data-attributes.** Only a few components (e.g. home Bestseller variant cards, `categories.html` `.pcard`) carry clean `data-product-*` attributes. Many cards encode `product_name / price / mrp / off% / rating / size` as visible text. **Recommendation:** add explicit `data-product-*` / `data-analytics-*` attributes to every commerce card before instrumenting, rather than scraping rendered text.
2. **No analytics layer exists yet.** There is no IntersectionObserver, no `track()` shim, no dataLayer. Impression events (`*_impression`, `product_impression`, `section_view`) must be **added** — they are specified here but not currently emitted.
3. **Two different `PRODUCTS` schemas** exist (`shop.html` vs `categories.html`) with different field names. A tracking layer must normalize them (see §2.1).
4. **Several spec-expected controls don't exist in HTML** (GPS "locate-me", save-for-later, address-type filter, sort modal, payment select/remove, settings persistence). Each is flagged ⚠ GAP at the point it would fire.
5. **Nested-anchor click bug.** On some cards (e.g. `wishlist.html`), Add/Heart buttons sit inside the `<a href="pdp.html">` with no `preventDefault`, so a tap both fires the action *and* navigates. Analytics handlers must `stopPropagation()` and fire before navigation.

---

## 1. Standardized event taxonomy (conventions)

To keep the spec consistent, all events use `snake_case`. The suggested events in the per-screen tables (§3) should be emitted with a **common property envelope** plus event-specific properties.

### 1.1 Common envelope (attach to every event)
| Property | Source | Example |
|---|---|---|
| `screen` | current file | `pdp` |
| `session_id` | generated at `splash`/`app_open` | — |
| `user_id` / `is_guest` | `kkd.mobile` presence (set on OTP verify) | `+9112345…` / `true` |
| `user_type` | OTP routing | `new` \| `returning` |
| `language` | `kkd.lang` (default `hi`) | `hi` |
| `active_pincode` | `kkd.pincode` (default `452001`) | `452001` |
| `serviceable` | pincode ≠ `123456` | `true` |
| `app_state` | `kkdAppStates()` | `{nonservice,bannedproduct,banneduser,codoff}` |
| `header_theme` | `data-theme` on home | `green` \| `rain` \| `festival` |
| `cart_count` / `cart_total` | live cart | `3` / `1360` |

### 1.2 Core funnel events (canonical names)
`app_open` → `screen_view` → `product_impression` → `product_view` → `add_to_cart` → `cart_viewed` → `checkout_started` → `payment_method_selected` → `order_placed` (success) **or** `payment_failed` (failure). Reward/engagement and agronomy-service events run in parallel (see §4).

---

## 2. Shared Data Dictionary (the data model behind every interaction)

### 2.1 Product object — two source schemas (must be normalized)

**Schema A — `shop.html` (`PRODUCTS`, line ~154):** home/bestseller/"shop" shape.

| Field | Type | Example | Normalized name |
|---|---|---|---|
| `n` | string | `'Humic + Fulvic'` | `product_name` |
| `t` | string | `'Bio-stimulant'` | `tech_name` / subtitle |
| `s` | string | `'500 ml'` | `pack_size` |
| `p` | number | `276` | `price` |
| `m` | number | `390` (`0`=none) | `compare_at_price` / MRP |
| `r` | number | `4.8` | `rating` |
| `cat` | string | `'fertilizer'` | `category` (`pesticide`/`fungicide`/`fertilizer`/`herbicide`/`combo`) |
| `sub` | string | `'bio'` | `subcategory` (`bio`/`chemical`/`npk`/`organic`/`herb`/`combo`) |
| `best` | bool | `true` | `is_bestseller` |
| `crops` | `'all'`\|string[] | `['tomato','chilli','cotton']` | `crops[]` |
| `tags` | string[] | `['bestseller','recent','bought','mostselling','new']` | `tags[]` |
| `img` | URL | `…/Humic_1.jpg` | `image_url` |
| derived | `offPct = m? round((1−p/m)*100):0` | `29` | `discount_pct` |

**Schema B — `categories.html` (`PRODUCTS`, line ~428):** catalog-browse shape.

| Field | Type | Example | Normalized name |
|---|---|---|---|
| `name` | string | `'Neem-Shield Bio'` | `product_name` |
| `sub` | string | `'Azadirachtin 1500 ppm'` | `tech_name` |
| `cat` | string | `'pesticide'` | `category` |
| `subs` | string[] | `['bio']` | `subcategory[]` |
| `size` | string | `'500 ml'` | `pack_size` (default) |
| `target` | string | `'aphid · whitefly'` | `use_target` |
| `price` | number | `285` | `price` |
| `mrp` | number | `380` | `compare_at_price` |
| `img` | URL | `../assets/AntiVirus_nobg.png` | `image_url` |
| `variants` | object[] | `[{size:'100 ml',price:358,mrp:495,off:28}]` | `variants[]` |
| derived id | `<cat>-<sub>-<idx>` | `pesticide-bio-3` | `sku` / `variant_id` |

> **⚠ Field drift:** `n`↔`name`, `p`↔`price`, `m`↔`mrp`, `s`↔`size`, `t`↔`sub`. The tracking layer must map both into one canonical product object: `{ product_name, brand:"Katyayani", tech_name, category, subcategory, sku, pack_size, price, compare_at_price, discount_pct, rating, image_url, tags[], crops[], variants[] }`.

**Brand.** Always `"Katyayani"` (single-brand catalog).

**Cross-sell card shape (cart.html)** — carried as `data-*`, not an array: `data-name`, `data-tech`, `data-size`, `data-price`, `data-mrp`, `data-off` (`"23% off"`), `data-img`.

**Crop enum** (home `CROP_META`, ~24 keys): `tomato, chilli, wheat, maize, onion, potato, cotton, paddy, sugarcane, brinjal, okra, papaya, soyabean, grapes, banana …` (emoji + bg colour per crop).

### 2.2 Cart / order / bill model

No persisted order object — bills are computed live from DOM. Key constants:

| Context | Constant | Value | Meaning |
|---|---|---|---|
| Cart (`cart.html`) | `ITEM_DISCOUNT` | `300` | fixed item discount ₹ |
| | `COUPON` | `100` | applied coupon ₹ (WELCOME100) |
| | `COIN_REDEEM` | `190` | coins redemption (1 coin = ₹1), via `#coinUse` toggle |
| | `WALLET_BAL` | `540` | money wallet, auto-applied, capped |
| | `cartTotal` | derived | `max(0, Σ(price×qty) − ITEM_DISCOUNT − COUPON − coins − wallet)` (init **₹1,360**) |
| Checkout (`checkout.html`) | `SUBTOTAL` | `1900` | after-coupon amount ₹ |
| | Pay Now | `−5%` | `round(SUBTOTAL*0.05)` = ₹95 instant off |
| | Partial | `+2% coins` | pay `pct`% now, earn 2% coins on prepaid, **no** instant discount |
| | COD | `+₹95` | full subtotal, forgoes the 5% |
| | `currentMethod` | `paynow`\|`partial`\|`cod` | `data-pay` |
| | total | derived | init **₹1,805** (Pay Now) |

**Canonical line-item** (for `cart_viewed`, `checkout_viewed`, `order_*`): `{ product_name, brand, sku/variant_id, pack_size, unit_price, compare_at_price, quantity, line_total }`.
**Canonical order payload**: `{ order_id, order_status, order_total, item_count, items[], payment_method, partial_payment_pct?, coins_used, coins_earned, wallet_applied, coupon_code, delivery_fee, delivery_eta, refund_amount?, refund_status? }`.

> **⚠ COD→coin conversion is inconsistent across screens:** `order-success` = 2% of amount; `orders` list ≈ ₹28.6/coin; `order-details` ≈ ₹12.5/coin. Pick one rule before tracking `coins_earned`.

### 2.3 Location object

Available on `add-address.html` save: `city` (`#city`), `state` (`#state`), `postal_code`/`pincode` (`#pin`, digits-only), `address_type` (active `.tag`). Detected via `locating.html`: `village='Mahidpur'`, `district='Ujjain'`, `state='Madhya Pradesh'`, `pincode='456440'`.

| Property | Source | Notes |
|---|---|---|
| `city` | `#city` / `kkd.city` | manual entry |
| `state` | `#state` / `kkd.state` / `kkd.district` | manual or detected |
| `postal_code`/`pincode` | `#pin` / `kkd.pincode` | drives serviceability (`123456` = not serviceable) |
| `village` | `kkd.village` | from GPS-detect only |
| `country` | — | **⚠ no field**; hardcode `"India"` |
| `latitude` / `longitude` | — | **⚠ no GPS coords captured anywhere** |
| `address_type` | `.tag[data-tag]` | `home`/`work`/`farm`/`shop`/`other` |
| `detection_method` | derived | `gps_auto` (locating.html only) vs `manual_entry` (add-address) vs `saved_select` (addresses.html) |

> **⚠ GAP:** `add-address.html` has a `.locate` CSS class but **no GPS "locate-me" element or handler is rendered** — so `detection_method:"gps_auto"` can only originate from the (now off-chain) `locating.html`. `add-address` persists **only** pincode/city/state; `#house` and the tag are not saved.

### 2.4 localStorage keys (identity, cart, rewards, state)

| Key | Type | Stores | Written/read |
|---|---|---|---|
| `kkd.mobile` | string | login phone; prefix routes onboarding & app-state | phone/otp/appstate |
| `kkd.firstName` / `kkd.lastName` | string | name (returning demo default `'Sagar'`) | name/otp/welcome |
| `kkd.lang` | string | language (`hi` default; 12 codes) | language/phone/otp/account |
| `kkd.referCode` | string | referral code at signup | phone |
| `kkd.pincode` | string | delivery pincode (`123456`→nonservice; default `452001`) | add-address/addresses/appstate |
| `kkd.city` / `kkd.state` | string | address form city/state | add-address |
| `kkd.addr` | string | selected address id | addresses |
| `kkd.altNumber` | string | alternate contact (10-digit) | checkout/edit-profile |
| `kkd.village` / `kkd.district` | string | GPS-detected (`Mahidpur`/`Ujjain`) | locating/home |
| `kkd.cart` | JSON string[] | cart item ids — **source of truth for cart** | cart/appstate |
| `kkd.wallet` | string(int) | money-wallet ₹ (default `540`; pill hides if `0`) | home |
| `kkd.quest` | JSON string[] | completed quest steps: `notif/loc/cart/search/crop` | home/cart/search |
| `kkd.coins.firstCrop` | `'1'` | first-crop +50 reward claimed | home |
| `kkd.coins.rewardSeen` | `'1'` | "Your rewards" state shown once | home |
| `kkd.ratedMap` | JSON {name:rating} | buy-again per-product ratings | home |
| `kkd.cropProb.done` | `'1'` | home crop-problem card dismissed | home |
| `kkd.q.<key>` / `kkd.q.acres.dismissed` | string | inline poll answers | home |
| `kkd.stOverride` | string | manual app-state override from `?st=` | appstate |

> **⚠** There is **no `kkd.coins` integer key** — the coin balance lives in the DOM (`#coinBalance`, default 120/220 depending on screen). `kkd.appState` appears only in design-system docs; live code uses `kkd.stOverride`.

### 2.5 App-state machine (`assets/appstate.js`)

`window.kkdAppStates()` → `{ nonservice, bannedproduct, banneduser, codoff }`.

| State | Trigger | Effect |
|---|---|---|
| `nonservice` | `kkd.pincode === '123456'` | "Not serviceable", hides free-delivery, blocks checkout |
| `bannedproduct` | `'chakrawarti'` in `kkd.cart` | dims item, red banner, blocks checkout until removed |
| `banneduser` | `kkd.mobile === '12345'` | full-screen "Account suspended"; also forces `codoff` |
| `codoff` | implied by `banneduser` | COD payment disabled |

Override via `?st=<state>` (persisted to `kkd.stOverride`); `?st=clear` resets. **Track these as super-properties** so funnel drop-off can be segmented by restriction state.

### 2.6 Header themes (presentational)

`themes = ['green','rain','festival']` cycled by tapping the KKD logo (or long-pressing the address bar) on `home.html`. Track `theme_changed {from_theme,to_theme}`.

### 2.7 Shared reward/helper modules (`assets/`)

| Module | Global | Signature | Fires |
|---|---|---|---|
| `celebrate.js` | `kkdCelebrate` | `kkdCelebrate(amount, {title,prefix='+',unit='coins',lead,icon})` | full-screen reward burst (2.5s). Used on coupon apply, scratch win, review submit, COD prepay, first-crop. → emit `reward_celebration_shown {amount,unit,context}` |
| `verify.js` | `kkdVerify` | `kkdVerify(force?)` `'genuine'\|'fake'` | mock QR authenticity scan → `verify_product_result {result}` |
| `rate.js` | `kkdRate` | `kkdRate({name,img,rating,onSubmit(coins,rating)})` | bottom-sheet review: +10 coins review / +25 testimonial → `review_submit` |
| `appstate.js` | `kkdAppStates` | `kkdAppStates()` | see §2.5 |

---

## 3. Exhaustive Screen & Component Inventory

> Each screen lists **every** interactive element (tap/swipe/scroll/input/view), its explicit **user intent**, a suggested **snake_case event**, and the **dynamic data** available at that interaction. Impression/state notes follow each table. ⚠ marks gaps where a handler/field is missing in the current prototype.

### 3.A Onboarding & identity

#### `splash.html` — App Launch
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| (none) | view | wait for load | `splash_view` / `app_open` | — |
- Auto-redirect → `language.html` after **2500ms** (`splash_auto_redirect {destination, delay_ms:2500}`). This is the anonymous **session start** — emit `session_start`/`app_open`.

#### `language.html` — Choose Language (full page)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back `→splash` | tap | go back | `back_tap` | `to:'splash'` |
| Language tile `.lang-tile[data-code]` ×12 | tap | set UI language | `language_select` | `lang_code` (hi/en/hien/mr/gu/pa/te/ta/kn/ml/od/bn), `lang_label`, `is_first_run:true` |
- Persists `kkd.lang` → navigates `phone.html`. Impression: `language_screen_view`.

#### `phone.html` — Enter Mobile Number
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Language chip `#langChipBtn` | tap | open lang sheet | `language_sheet_open` | `lang_code` |
| Lang sheet close `#langClose` / backdrop `#langBd` | tap | dismiss | `language_sheet_close` | `method:x_button\|backdrop` |
| Lang tile `.lang-tile[data-code]` ×12 | tap | change lang | `language_select` | `lang_code` |
| Mobile input `#mobInput` (tel, max 10) | input | enter phone | `mobile_number_input` | `length`; persisted `kkd.mobile` on submit |
| Referral toggle `#referToggle` | tap | reveal referral | `referral_field_toggle` | `expanded` |
| Referral input `#referCode` | input | enter code | `referral_code_input` | raw value |
| Referral Apply `#referApply` | tap | apply code | `referral_code_apply` | `referral_code` (persisted `kkd.referCode`) |
| Consent terms `#consentTerms` (default ✓) | toggle | accept T&C | `consent_toggle_terms` | `checked` |
| Consent SMS `#consentSms` (default ✓) | toggle | authorize SMS | `consent_toggle_sms` | `checked` |
| Send OTP `#sendOtpBtn` | tap | request OTP | `send_otp_tap` | `mobile`, `referral_code?`, `consent_terms`, `consent_sms` |
- Send OTP **gated** on both consents (button disabled until checked). `offer_banner_impression {offer:'first_order_100_off'}`. Persists `kkd.mobile` → `otp.html`.

#### `otp.html` — Enter OTP
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back `.back-btn` | tap | return to phone | `back_tap` | — |
| Language chip / sheet / tiles | tap | change lang | `language_sheet_open` / `language_select` | `lang_code` |
| "Change" `→phone` | tap | edit number | `change_number_tap` | — |
| OTP cells `input[data-otp=1..4]` | input/backspace | enter OTP | `otp_digit_input` | `position` (auto-advance) |
| Resend WhatsApp / SMS `.resend-btn` | tap | resend OTP | `otp_resend` | `channel:whatsapp\|sms` |
| Verify `#verifyBtn` | tap | submit OTP | `otp_verify_tap` → `otp_verified` | `mobile`, `user_type`, `route`, `matched_prefix` |
- **Routing (load-bearing demo prefixes):** `kkd.mobile` starts `12345…` → **returning** → `welcome-back.html`; else `1234…` → **new** → `name.html`; else fallback by saved name. This is the **guest→identified** transition (`otp_verified {user_type:'returning'|'new'}`). Resend timer 30s → surfaces WhatsApp/SMS pills.

#### `name.html` — What's Your Name? (new users)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back `.back-btn` | tap | go back | `back_tap` | — |
| Language pill `→language` | tap | change lang | `language_change_tap` | `lang_code` |
| First name `#firstName` | input | enter first name | `first_name_input` | prefilled from `kkd.firstName` |
| Last name `#lastName` | input | enter last name | `last_name_input` | prefilled |
| Continue `#cta` | tap | submit name | `name_submit_tap` → `profile_name_saved` | `first_name`, `last_name` (persisted) |
- ⚠ Navigation not gated on non-empty name (empty allowed). → `welcome-aboard.html`.

#### `welcome-aboard.html` / `welcome-back.html` — Splash (no CTA)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| (none) | view | acknowledge | `welcome_aboard_view` / `welcome_back_view` | `first_name` (from `kkd.firstName`; aboard falls back to "Farmer", back to "Sagar") |
- Both auto-redirect after **4500ms** (guarded by `!document.hidden`): aboard → `notifications-allow.html`; back → `home.html` (returning users skip notifications). ⚠ `welcome-back` defines a `.cta` style but renders no tappable element. `social_proof_impression` on "10 lakh+ farmers" strip.

#### `notifications-allow.html` — Notification soft-ask
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Allow `.allow-btn` `→home` | tap | grant push | `notification_permission_allow` | `source:soft_ask` |
| Maybe later `.skip-btn` `→home` | tap | postpone | `notification_permission_skip` | `source:soft_ask` |
- ⚠ Both route to the same `home.html`; choice is not persisted — add persistence + event. `notifications_prompt_view` impression (3 reason rows).

#### `permissions.html` → `locating.html` — Location pair (⚠ wired but dropped from live chain)
| Screen | Element | Action | Event | Dynamic data |
|---|---|---|---|---|
| permissions | Allow Location `→locating` | tap | `location_permission_allow` | `source:soft_ask` (no skip control) |
| permissions | Back `history.back()` | tap | `back_tap` | — |
| locating | (none) | view | `locating_view` | — |
- `locating.html`: at **2400ms** flips to "found" → writes `kkd.village='Mahidpur'`, `kkd.district='Ujjain'` → `location_detected {village,district,state:'Madhya Pradesh',pincode:'456440',detection_method:'gps_auto'}`; auto-redirect → `home.html` at **5500ms** (not visibility-guarded).

#### `tell-us.html` — Crop preference picker (⚠ filename misleading; it is NOT a survey)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Crop tile `.crop-tile` ×8 `onclick=toggle()` | tap | select crops grown | `crop_selected`/`crop_deselected` | `crop_name` (Wheat/Rice/Tomato/Chilli/Maize/Soybean/Cotton/Sugarcane), `crop_name_hi`, `is_selected`, `max_selection:3` |
| "More" tile | tap | find more crops | `crop_more_tapped` | ⚠ no handler |
| State selector (मध्य प्रदेश) | tap | change state | `state_selector_opened` | `state:'Madhya Pradesh'` ⚠ no handler |
| Skip | tap | skip | `crop_selection_skipped` | `selected_count` |
| Continue | tap | proceed | `crop_selection_submitted` | `selected_crops[]`, `state` |
- → `permissions.html`. ⚠ Count label static ("2 of 3"); pre-selected: Wheat, Tomato.

---

### 3.B Home (the hub)

#### `home.html` — Home
*The single most instrumented screen. Full element inventory:*

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Address bar `#addressBtn` | tap | change location | `address_bar_tap` | `current_address` ("Indore 452001"), `greeting`, `village` (`kkd.village`) → `addresses.html` |
| Address bar `#addressBtn` | long-press 700ms | demo theme cycle | `header_theme_longpress_cycle` | `from_theme`,`to_theme` |
| KKD logo `#kkdLogo` | tap | cycle theme | `header_theme_logo_cycle` | green→rain→festival |
| Wallet pill `#walletPill` | tap | view money wallet | `wallet_pill_tap` | `wallet_amount` (`kkd.wallet`) → `wallet.html` |
| Coin pill `#coinPill` | tap | view coins | `coin_pill_tap` | `coin_balance` (`#coinBalance`) → `coins-statement.html` |
| Notification bell `#notifBtn` | tap | open notifications | `notification_bell_tap` | `unread_count` (`#notifBadge`=3) → `notifications.html` |
| Top status banner `#topStatusBanner` | tap | act on alert | `top_status_banner_tap` | `banner_state` (rain/festival), `href` |
| Search field `#search-input` | tap | search | `search_bar_tap` | animated placeholder → `search.html` |
| Voice icon | tap | voice search | `voice_search_tap` | → `voice-search.html` |
| Category tile `.cat-tile` ×6 | tap | browse category | `category_tile_tap` | `category`, `position` → `categories.html?cat=` |
| Delivery tile `.delivery-card` | tap | track order | `delivery_tile_tap` (opens `#trackSheet`) | `order_id` (KKD-26194/26195), `status`, `amount`, `item_count`, `eta`, `carousel_index` |
| Delivery dots `[data-ds-dot]` / carousel | tap/swipe | switch order | `delivery_carousel_dot_tap`/`_swipe` | `index`, `total` |
| Track-sheet Call rider | tap | call rider | `track_call_rider_tap` | `rider_name` (Suresh Yadav), `order_id` → `tel:` |
| Track-sheet help / view full | tap | support / detail | `track_sheet_action_tap` | `action` → help/order-details |
| Quest tile `#onboardingTile` | tap | earn/spend coins | `quest_tile_tap` | `state` (earn/spend), `quest_done_count`, `max_coins`(95) |
| Quest step `[data-quest]` | tap | complete step | `quest_step_action_tap` | `step_id` (notif/loc/cart/search/crop), `coins`(10/10/15/10/50), `kind` |
| Quest close `#questClose`/backdrop | tap | dismiss | `quest_modal_close` | `quest_done_count` |
| Flash-deal card ×4 | tap | view flash product | `product_tap` | name (Chakrawarti ZC/Humic+Fulvic 98/NPK 19-19-19/Triple Attack), price (248/312/221/500), mrp, off%, size, image_url, position, `source_section:flash_deals` |
| Flash "+" `.flash-add` / steppers | tap | add / adjust | `add_to_cart` / `cart_qty_change` | product_name, price, qty, `source_section:flash_deals` |
| Mela carousel `[data-mela-slide]` ×3 | tap/swipe | view campaign | `promo_banner_tap`/`_swipe` | `slide_index`, `campaign` (mela/antivirus_bogo/fertilizer_fest), `discount`, `href` |
| Shop-by-Crop chip `[data-crop-key]` ×8 | tap | select crop | `crop_chip_toggle` | `crop_key`, `selected`, `selected_count` |
| "All crops" `#cropMoreBtn` + sheet `[data-sheet-crop]`×24 | tap | open/toggle crops | `crop_more_tap`/`crop_sheet_toggle` | `crop_key`, `selected_count` |
| Crop sheet "Done" `#cropSheetDone` | tap | confirm crops | `crop_selection_done` | `selected_count`, `first_crop` (→+50 coins) |
| Crop-products filter `[data-cf]` | tap | filter by crop | `crop_product_filter_tap` | `filter` (all/crop_key) |
| Crop-product card `.cpg-card` / Add `.cropprod-add` | tap | view / add | `product_tap`/`add_to_cart` | product attrs, `source_section:shop_by_crop` |
| Crop "View Products" `#cropViewMore` | tap | see all | `crop_view_products_tap` | `selected_count`, crops, `href` (disabled when 0) |
| Wallet nudge `#walletNudge` | tap | spend wallet | `wallet_nudge_tap` | `wallet_amount` → categories |
| Bestseller card ×4 | tap | view product | `product_tap` | name (Humic+Fulvic 98/Chakrawarti ZC/Chakraveer 18.5%/Antivirus), brand:Katyayani, price (210/358/440/327), MRP, off%, size, rating (4.7/4.8/4.5/4.9), badge, `stock_left`, image_url, position, `source_section:bestseller`, `data-variants` |
| Bestseller "Options" `.variant-btn` | tap | open size picker | `variant_sheet_open` | product_name, `variants[]` |
| Bestseller Add `.qty-add` / steppers | tap | add / adjust | `add_to_cart`/`cart_qty_change` | product_name, price, `source_section:bestseller` |
| Variant-sheet rows `[data-vs-act]` / cart bar `#vsCartBar` | tap | add specific size / go cart | `variant_add_to_cart`/`cart_qty_change`/`cart_bar_tap` | variant_size, variant_price, qty, totals |
| Bestsellers "See all" | tap | browse all | `see_all_tap` | `source_section:bestseller` → `shop.html?sort=bestsellers` |
| Recently-viewed card `.rv-card` ×5 / Add `.rv-add` / See all | tap | re-view / add | `product_tap`/`add_to_cart`/`see_all_tap` | name (Humic/Chakrawarti ZC/NPK/Antivirus/Bhumiraja), price (276/358/330/327/245), `source_section:recently_viewed` |
| Buy-again card `.ba-*` ×5 | tap | re-view | `product_tap` | name, `ordered_on` date, `source_section:buy_again` |
| Buy-again "Buy again" `.ba-reorder` | tap | reorder | `reorder_tap` | `reorder_key` → `cart.html?reorder=` |
| Buy-again star `.bs` → `#baRateBd` | tap | rate purchase | `product_rating_star_tap` | product_name, `preset_rating` |
| Rate modal stars/text/media/testimonial/submit | tap/input | submit review | `review_rating_set`/`review_text_input`/`review_media_attach`/`testimonial_video_attach`/`review_submit` | product_name, rating, `coins_earned` (+10 review / +25 testimonial) |
| Featured hero ×3 + carousel | tap/swipe | view featured | `product_tap`/`carousel_swipe` | name (Chakrawarti ZC/Antivirus/Humic+Fulvic), rating, `source_section:featured` |
| Acres poll `.acre-opt[data-val]` / close | tap | answer / dismiss | `poll_answer`/`poll_dismiss` | `value` (lt1/1-5/5-10/gt10), `coins:20`, `first_answer` |
| Engagement: crop-grow `[data-reward]` | tap | answer which-crop | `engagement_answer` | `value`, `coins:15` |
| Engagement: crop-problem `[data-ms]` + submit | tap (multi) | report problem | `crop_problem_submit` | `problems[]`, `coins:15` → product strip |
| Crop-problem rec card / Add / view all | tap | view/add fix | `product_tap`/`add_to_cart`/`crop_problem_view_all` | product attrs, `source_section:crop_problem_rec` |
| Engagement: testimonial `#engTestiOpen` + submit | tap | share story | `testimonial_open`/`testimonial_submit` | `coins:30` |
| Engagement: refer `→refer` | tap | invite friend | `refer_invite_tap` | `reward:₹50` |
| Engagement: order-OK Yes / No `#orderNotOkBtn` | tap | confirm/report delivery | `engagement_answer`/`order_not_ok_tap` | `value`, `coins:10`; No → `#sorryBd` |
| Sorry-sheet reach-out / not-now | tap | support / dismiss | `support_reach_out_tap`/`sorry_sheet_dismiss` | → help.html |
| Engagement: rate-purchase `#engRateOpen` + submit | tap | rate purchase | `rate_modal_open`/`review_submit` | product (Humic+Fulvic), `coins:25` |
| Engagement close `.eng-close` ×6 | tap | dismiss widget | `engagement_dismiss` | `widget_id` |
| Farmer testimonial tiles ×4 | tap | play testimonial | `testimonial_video_tap` | farmer_name, crop, location, position |
| Most-selling card ×4 / Add / See all | tap | view/add/browse | `product_tap`/`add_to_cart`/`see_all_tap` | name (Chakrawarti ZC/Humic+Fulvic/NPK/Chakraveer), price (358/376/289/440), `bought_last_week`, `source_section:most_selling` |
| Verify-product card `onclick=kkdVerify()` | tap | scan QR | `verify_product_tap` | shared scanner |
| Jump-to-top | tap | scroll top | `jump_to_top_tap` | — |
| Floating cart bar `#cartBar` | tap | go to cart | `cart_bar_tap` | `cart_total`, `cart_count`, `cart_save` → cart |
| Ask-Expert FAB `#expertFab` | tap | free agronomist call | `ask_expert_tap` | `state` → help.html |
| Bottom nav ×4 | tap | switch tab | `bottom_nav_tap` | `tab` (home/crop/orders/profile) |
| Add-crop modal `.crop-choice` ×9 + Apply | tap | multi-select crops | `crop_modal_apply` | `crops[]`, `picked_count` |

**Impressions/state (home):** `product_impression` (per card into view — ⚠ must add observer), `section_view` per section, `quest_step_completed` (persist `kkd.quest`), `quest_all_completed`/`rewards_state_shown` (`kkd.coins.rewardSeen`), `first_crop_reward_earned` (+50, coin-fly), `theme_changed`, `cart_count_changed` (`bumpCart`/`unbumpCart`), `scroll_state_changed` (`body.scrolled`/`at-end`), `poll_answered_state` (persist `kkd.q.*`), `app_state_overlay` (banneduser suspended / nonservice red greeting).

---

### 3.C Discovery (search & catalog)

#### `search.html` — Unified Search
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back `.back` | tap | exit | `search_dismissed` | fallback `home.html` |
| Search input `#q` | input | type query | `search_query_typed` | `search_query`, `query_length` |
| Clear `#clearBtn` | tap | reset | `search_query_cleared` | prior query |
| Voice mic `#voiceBtn` | tap | voice search | `voice_search_opened` | (inline overlay, auto-cancels 4s) |
| Voice cancel `#voiceCancel` / backdrop | tap | abort | `voice_search_cancelled` | `dismiss_method` |
| Recent chip `.chip[data-q]` / remove / CLEAR | tap | rerun/delete/wipe | `recent_search_tapped`/`_removed`/`recent_searches_cleared` | `search_query`, `source_section:recent_searches`, `position` |
| Recently-viewed card `.rv-card` `→pdp` / VIEW ALL | tap | reopen product | `product_card_tapped`/`recently_viewed_view_all_tapped` | product_name, price, image_url, `source_section:recently_viewed`, position |
| Trending chip `.chip.trend[data-q]` | tap | explore trend | `trending_search_tapped` | `search_query`, `source_section:trending_in_area`, position |
| Crop-engagement chip `.scrop-chip` / dismiss | tap | answer / skip | `crop_engagement_answered`/`_dismissed` | `crop_value`, `reward_coins:15` |
| Ask-expert tile `→help` | tap | request call | `ask_expert_tapped` | `source_section:search`, `call_type:video` |
| Category tile `.cat-tile` | tap | browse category | `category_tile_tapped` | category, position (⚠ grid empty in markup) |
| Smart-suggest row `.suggest-row` `→categories` | tap | refine query | `search_suggestion_tapped` | `search_query`, `suggestion_kind` (crop/category/disease), `suggestion_label`, position. ⚠ query NOT passed as param on nav — log before navigating |
| Product-hit row `.sugg-row[data-name]` `→pdp` | tap | open product | `search_result_tapped` | `search_query`, product_name (`data-name`), subtitle, price, discount, image_url, position, `source_section:top_results` |
| Empty-state categories link | tap | fallback browse | `zero_results_browse_categories_tapped` | `search_query` |
- States: `search_idle_shown` (first_time vs returning), `search_live_state_entered`, `search_suggestions_returned`/`_empty`, `search_results_returned {result_count,result_names[]}`, `search_zero_results`, `search_result_impression`. Writes `kkd.quest`+='search' at query length ≥2.

#### `voice-search.html` — Voice (Listening)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Close ✕ | tap | abort | `voice_search_closed` | `method:back` |
| Language toggle (हिंदी ▾) | tap | switch recog lang | `voice_language_toggle_tapped` | `current_language:hi` |
| Mic/waveform | view | listening indicator | `voice_listening_active` | animation only |
| Transcript `.hi` | view | see recognized speech | `voice_transcript_updated` | `transcript` (mocked), `state:listening` |
| "Tap to Stop" `→shop` | tap | finish & see results | `voice_search_submitted` | `transcript` → `shop.html` |
- ⚠ Only a "listening" state exists (no idle/processing/error/no-speech). Separate from the inline overlay in `search.html`.

#### `categories.html` — Shop by Category / Catalog
**Params:** `?cat=<slug>` (preselect category), `?view=recent` (first 6 as "Recently viewed"). ⚠ `?sort=` is **not** implemented; no Sort modal exists.

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back | tap | leave | `categories_dismissed` | — |
| Header search `→search` | tap | switch to search | `search_opened_from_categories` | — |
| Top category `[data-cat]` ×5 | tap | switch category | `category_selected` | `category_slug`, `category_label`, position |
| Subcategory `.subcat-btn[data-sub]` | tap | narrow | `subcategory_selected` | `subcategory_key`, label, icon |
| Filter pill `#filterFilterBtn` + quick-jumps `[data-jump-filter]` | tap | open filter | `filter_sheet_opened`/`filter_quickjump_tapped` | `filter_section` (crop/rating) |
| Filter tab `[data-ftab]` | tap | switch filter section | `filter_section_viewed` | tags/crop/rating/price/discount/packSize/stock |
| Filter option `[data-fopt]` | tap | toggle value | `filter_value_toggled` | `filter_section`, `filter_value`, `now_selected`. Values — Tags: bestseller/new/mostselling/toprated; Crop: 9 crops; Rating: 5/4plus/3plus/2plus/1plus; Discount: 10/20/30/40; Pack: 100ml…10kg; Stock: instock/outofstock |
| Price inputs `#pminInp`/`#pmaxInp` + slider `#psMin`/`#psMax` | input/drag | set price range | `price_filter_input`/`_slider_changed` | `min`,`max` (0–3000) |
| Filter Clear / Apply / close | tap | reset/commit/dismiss | `filters_cleared_all`/`filter_sheet_applied`/`filter_sheet_closed` | `applied_filters` snapshot |
| Applied-filter chip ✕ `[data-aclose]` / Clear all | tap | remove one / all | `applied_filter_removed`/`filters_cleared_all` | `filter_id`, `filter_label` |
| Product card `.pcard` `→pdp` | tap | open PDP | `product_card_tapped` | product_name, subtitle (`sub`), pack_size, target, price, compare_at_price (`mrp`), discount_pct (`offPct`), rating, category, subcategory, **sku** (`<cat>-<sub>-<idx>`), image_url, position, `source_section`, `applied_filters`, has_variants |
| Add `.padd-action[data-act=inc]` / steppers | tap | add / adjust | `add_to_cart`/`cart_qty_incremented`/`_decremented` | product_name, sku, price, position, applied_filters, new_qty |
| "N Options" `.variant-btn` + rows `[data-vs-act]` + close | tap | open/add/adjust variant | `variant_sheet_opened`/`variant_add_to_cart`/`variant_qty_changed`/`variant_sheet_closed` | variant_size, variant_price, variant_mrp, variant_off, variant_key, new_qty |
| Floating cart bar `#cartBar` | tap | go to cart | `cart_bar_tapped` | cart_total, cart_count |
| Bottom nav ×4 | tap | navigate | `bottom_nav_tapped` | tab |
- States: `category_page_loaded {cat,view,active_sub}`, `product_list_rendered {result_count,category,subcategory,applied_filters}`, `zero_results_state`, `product_impression` per `.pcard`, `filter_applied`/`filter_cleared`, `applied_chips_updated`, `category_strip_compacted`, `cart_bar_shown/_compacted`, `cart_updated`. ⚠ **Stock filter is UI-only** (not applied to results).

---

### 3.D Product Detail Page

#### `pdp.html` — Product Detail Page
**Params:** `?p=chakrawarti` swaps identity to "Chakrawarti ZC" (banned-in-state demo); default = "Humic". App-state overlays via `kkdAppStates()`.

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back | tap | leave PDP | `pdp_back` | product_name, has_history |
| Search icon `→search` | tap | find another | `pdp_search_open` | product_name |
| Share | tap | share product | `product_share` | product_name, slug, price, image_url |
| Image carousel `#imgScroll` | swipe | view photos | `product_image_swipe` | image_index (0–3), image_url, total:4 |
| Carousel dots `#imgDots` | view | position | `product_image_view` | active_index |
| BESTSELLER badge / rating pill / "Highly viewed today" | view | impression | `badge_impression`/`social_proof_view` | badge_type, rating:4.6, review_count:2020, type:live_viewers |
| Category badge "Fertilizer" `→categories` | tap | browse category | `pdp_category_tap` | category |
| **ADD** `#addBtn` | tap | add to cart | `add_to_cart` | product_name, brand:Katyayani, category:Fertilizer, selected_pack_size (default 500 ml), price (curPrice 276), compare_at_price (520), discount_pct (28), image_url, quantity, rating:4.6, review_count:2020 |
| Qty stepper `#addDec`/`#addVal`/`#addInc` | tap | adjust qty per variant | `cart_qty_change` | selected_pack_size, new_qty, price, direction, removed(qty→0) |
| Sticky ADD `#stickyAddBtn` | tap | add from sticky bar | `add_to_cart` | `source:sticky_header`, selected_pack_size, price |
| Pack-size tiles `.var` ×7 | tap | select variant | `variant_changed` | selected_pack_size (100ml…10L), price, per_litre_rate, is_bestseller (500ml), is_oos (2L stock 0), is_low_stock (250ml=4 / 500ml=2), position |
| "More / +5 sizes" `#moreSizes` + all-sizes sheet ×12 + close | tap | see all sizes / select | `all_sizes_sheet_open`/`variant_changed`/`all_sizes_sheet_close` | visible_count:7, total_count:12, up to 100 L |
| Variant "cheaper per unit" arrow `.vk-arrow` | view | upsell nudge | `variant_upsell_impression` | cheaper_pack_size, cheaper_per_litre |
| Trust badge "i" (7-Day Return) + policy link + close | tap | see return policy | `trust_detail_open`/`policy_open`/`trust_detail_close` | trust_type:return, doc:returns |
| Delivery "Change" `→addresses` + delivery card | tap/view | change address / ETA | `delivery_address_change`/`delivery_eta_view` | current_address ("Mahidpur, Ujjain · 456440"), deliv_date ("Tomorrow, 28 May"), cutoff, pincode, serviceable |
| Crop chips `.pc-chip` ×4 + dismiss | tap | personalize / earn | `crop_preference_select`/`crop_widget_dismiss` | crop (Wheat/Cotton/Tomato/Other), reward_coins:15 (→kkdCelebrate) |
| How-to-use video `.video-card` | tap | watch usage video | `how_to_video_play` | video_label, duration "1:24", product_name |
| Technical/Dose/Disease tabs `.tab` | tap | view spec section | `tab_view` | tab_id (technical/dose/disease) |
| Description collapsible `details.kkd-collapse` | toggle | expand/collapse | `description_toggle` | open_state |
| Farmer testimonial tiles `#pdpTestiRow` | tap/scroll | view / load more | `testimonial_view`/`testimonial_load_more` | farmer_name, crop·location, quote |
| Reviews "View all" photos `#viewAllPhotos` | tap | open gallery grid | `review_gallery_open` | photo_count, video_count |
| Customer media `.cust-tile` / row scroll | tap/scroll | open lightbox / load more | `review_media_view`/`review_media_load_more` | media_url, is_video, duration, position |
| Lightbox prev/next/swipe/grid cell/close | tap/swipe | navigate / open / exit | `review_media_nav`/`review_media_view`/`review_media_close` | direction, current_index, total, is_video |
| Review filter pills ×5 | tap | filter reviews | `review_filter` | filter (All 2020 / Most helpful / With photos 412 / 5★ / Critical) ⚠ static |
| In-review photos `#reviewList img` | tap | open in lightbox | `review_media_view` | media_url, reviewer_name, position |
| "View more" reviews `#viewMoreBtn` | tap | load 5 more | `reviews_load_more` | batch_size:5, total_shown |
| Rating histogram | view | breakdown | `rating_breakdown_view` | avg:4.6, total:2020, dist(72/18/6/2/2) |
| FAQ buttons ×3 | tap | read Q&A | `faq_expand` | question ⚠ static |
| Ask Expert banner `→advisory` | tap | book call | `expert_cta_tap` | placement:pdp, product_name |
| Floating cart bar `#cartBar` | tap | go to cart | `cart_bar_tap` | cart_count, cart_total (sums all variants) |
| Banned-product sheet "Got it" `#banClose` | tap | acknowledge | `banned_product_dismiss` | product_name:Chakrawarti ZC, state:Madhya Pradesh |
- **`product_view`** (load): product_name, technical_name, brand:Katyayani, category, default_pack_size:500ml, price:276, MRP:520, discount_pct:28, save_amount:144, rating:4.6, review_count:2020, image_url, badges:[bestseller], live_viewers:true, source. States: `variant_changed`, `add_to_cart`+cart_count (per-variant cart map supports multiple sizes), `add_blocked_oos` (2L), `tab_view`, `sticky_header_shown`/`scroll_past_gallery` (threshold 280px), `add_blocked_banned` (nonservice/bannedproduct). ⚠ **No "you may also like" cross-sell section exists** — do not invent xsell events here.

---

### 3.E Cart, Checkout & payment outcomes

#### `cart.html` — Shopping Cart
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back | tap | leave | `cart_back_tapped` | — |
| Line item `.cart-item[data-item]` | view | see contents | `cart_viewed` | `item_count`(3), `line_items[]` {product_name, brand:Katyayani, sku (humic/chakrawarti/npk), tech_name, pack_size (500ml/100ml/1kg), unit_price (276/358/330), compare_at_price (390/495/—), discount_pct (29%/28%), quantity (2/3/1), line_total}, subtotal(2300), coupon_code(WELCOME100), coupon_value(100), item_discount(300), coins_used(0/190), wallet_applied(≤540), delivery_fee(FREE), grand_total(1360), total_saved(520) |
| Qty +/− `.qty button` (min 1) | tap | adjust quantity | `cart_qty_increased`/`_decreased` | line-item + new_quantity, new_line_total, recomputed totals |
| Remove `.trash-btn` | tap | drop item | `cart_item_removed` | removed {product_name,sku,qty,line_total}, new item_count; persists `kkd.cart` |
| Line item → PDP | tap | inspect | `cart_item_tapped` | sku, product_name ⚠ no anchor/handler wired |
| Reward meter `#pmeter` | tap | unlock free gift | `cart_reward_meter_tapped` | reward_product ("Humic 50 ml"), threshold_remaining(₹300), progress_pct, unlocked |
| Coupon card `#couponCard` | tap | open coupon sheet | `cart_coupon_sheet_opened` | current coupon_code |
| Coupon code input/check `#coupInput`/`#coupCheck` | input/tap | enter manual code | `cart_coupon_code_entered` | typed code ⚠ no validation handler |
| Coupon tile Apply | tap | apply coupon | `coupon_applied` | coupon_code (WELCOME100/HUMIC50/KKD200), coupon_value (100/50/200), is_max_saving |
| Coupon tile (ineligible) | view | see locked offers | `cart_coupon_locked_viewed` | coupon_code (KISAN500/CROP300), lock_reason |
| Remove coupon `#removeCoupon` / sheet close | tap | drop / dismiss | `coupon_removed`/`cart_coupon_sheet_closed` | coupon_code, coupon_value |
| Coins toggle `#coinUse` | toggle | redeem coins | `coins_redeem_toggled` | coins_on, coins_balance(1240), coins_used(190), recomputed grand_total |
| Wallet tile `.wallet-apply` | view | wallet deduction | `cart_wallet_auto_applied` | wallet_applied(540), remaining(0) |
| Bill rows `.bill-row`/`.bill-total` | view | understand pricing | `cart_bill_viewed` | full bill breakdown |
| Deliver-to "Change" `→addresses` | tap | change address | `cart_address_change_tapped` | delivery_date, recipient ("Ramesh Patel · Mahidpur, Ujjain · 456440") |
| Checkout CTA `#checkoutBtn` | tap | begin checkout | `checkout_started` (opens cross-sell sheet) | full cart payload |
| Cross-sell "Add" `.xsell-add` ×3 | tap | add upsell | `cross_sell_item_added` | product_name (Antivirus/Bhumiraja/Chakraveer 18.5%), pack_size, unit_price (327/245/440), compare_at_price, discount, saving, deal_type (hot/combo/best); appends real row |
| Cross-sell threshold strip / Continue `#xsellContinue` `→checkout` / close | view/tap | hit free-ship / proceed / skip | `cross_sell_threshold_viewed`/`checkout_proceeded`/`cross_sell_sheet_dismissed` | threshold_remaining, item_count, grand_total |
- States: `cart_viewed` (quest+='cart'), `coupon_applied`→`kkdCelebrate(save,{prefix:'₹',icon:'fa-tag'})`, `coupon_removed`, `coins_redeem_toggled` (bill recalc), `cross_sell_item_added` (mutates cart, toast), app-state: `cart_nonserviceable_shown`, `cart_banned_product_blocked` (CTA→"Remove restricted item"). ⚠ **No save-for-later control**; ⚠ line-item→PDP not wired.

#### `checkout.html` — Checkout
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back | tap | leave | `checkout_back_tapped` | — |
| (load) | view | begin payment | `checkout_viewed` | item_count(3), subtotal/SUBTOTAL(1900), item_discount(300), coupon (WELCOME100/100), coins_used(190), wallet_applied(≤540), delivery_fee(FREE), payment_method(paynow), grand_total(1805). ⚠ line_items not rendered here — carry from cart |
| Alt-number `#altNum` | input | faster delivery | `alt_number_entered` | alt_number (persisted `kkd.altNumber` at len 10) |
| Deliver-to "Change" `→addresses` | tap | edit address | `checkout_address_change_tapped` | delivery_date, recipient |
| Pay Now `[data-pay=paynow]` (default) | select | prepay & save 5% | `payment_method_selected` | payment_method:paynow, prepaid_discount(95), pay_now_amount(1805), is_recommended |
| Partial `[data-pay=partial]` + %-pills `.pp-opt` (10/25/50/75) | select/tap | pay part now | `payment_method_selected`/`partial_payment_pct_selected` | payment_method:partial, partial_payment_pct, prepaid_amount, on_delivery_amount, coins_earned (2% of prepaid) |
| COD `[data-pay=cod]` + switch link `#codSwitchPay` | select/tap | pay on arrival / switch | `payment_method_selected`/`cod_switch_to_paynow_tapped` | payment_method:cod, cod_amount(1900), cod_extra(95) |
| Coins toggle `#coinUse` | toggle | redeem coins | `coins_redeem_toggled` | coins_used(190), recomputed grand_total. ⚠ standalone coin section removed; shown as bill row, auto-applied |
| Wallet tile `.wallet-apply` | view | wallet deduction (mandatory) | `checkout_wallet_auto_applied` | wallet_applied(≤540), remaining |
| Bill rows `#billTotal` etc | view | understand pricing | `checkout_bill_viewed` | items_total(2300), item_discount(300), coupon(100), prepaid_extra_off(95, Pay Now only), coins_used(190), wallet_applied(540), delivery FREE, grand_total |
| Place-order `#placeOrderBtn` | tap | submit order | `place_order_tapped` → `order_placed` | payment_method, partial_payment_pct?, grand_total, coins_used, wallet_applied, prepaid_discount → `order-success.html?mode=<method>` |
- States: `checkout_viewed` (default paynow), `payment_method_selected` recalculation (Pay Now −95 / Partial split only / COD discloses +95), `partial_payment_pct_selected` (split only, total unchanged), `cod_switch_to_paynow`. App-state: `checkout_nonserviceable_shown` (CTA→"Change address"), `checkout_banned_product_blocked` (CTA disabled), `checkout_cod_disabled_shown` (auto-switches to Pay Now).

#### `error-payment.html` — Payment Failed
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| (load) | view | see failure | `payment_failed` | order_amount(₹1,900), payment_method ("UPI · oksbi"), failure_reason ("Insufficient balance") ⚠ all static |
| Retry `→checkout` | tap | retry payment | `payment_retry_tapped` | previous_method, failure_reason, order_amount |
| Use COD instead `→checkout` | tap | switch to COD | `payment_change_method_tapped` | new_method:cod (⚠ both route to checkout) |
| Contact support `→help` | tap | get support | `payment_support_tapped` | order_amount, failure_reason |
- This is the **failure terminal** of the checkout funnel (vs `order_placed` success). Properties: failure_reason, payment_method, order_amount.

#### `empty-cart.html` — Empty Cart
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| (load) | view | realize empty | `empty_cart_viewed` | item_count:0, cart_state:empty |
| Back `→home` | tap | leave | `empty_cart_back_tapped` | — |
| Shop-now `→shop` | tap | start shopping | `shop_now_tapped` | source:empty_cart |
| Voice tile `→voice-search` / Photo tile `→photo-diagnosis` | tap | discover | `empty_cart_voice_search_tapped`/`empty_cart_photo_diagnosis_tapped` | source:empty_cart |
| Bottom nav ×4 | tap | navigate | `nav_tab_tapped` | tab (home/crops/news→shop/advisor) |

---

### 3.F Post-purchase (success, orders, tracking, returns, refunds)

#### `order-success.html` — Order Confirmed
**Params:** `?mode=paynow|cod|partial&welcome=1`.

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Order hero + pill | view | see confirmation | `order_confirmed_viewed` | order_id ("KKD-26194-7821"), order_status:confirmed, payment_method |
| ETA row / thumbnails / payment row | view | know arrival / items / payment | `delivery_eta_viewed`/`order_items_viewed`/`payment_summary_viewed` | eta ("Wed, 4 Jun · by 7 PM"), address, delivery_fee:FREE, item_count:3, order_total:₹1,805, items[{Humic},{Chakrawarti},{NPK}], payment_status, amount_paid, amount_due (partial: ₹475/₹1,425) |
| 4-step tracker | view | track progress | `mini_tracker_viewed` | order_status:packing, steps[], status_banner |
| COD-due strip `#payCodBtn` (cod/partial) | tap | clear COD early, earn coins | `cod_pay_strip_tapped` | order_id, cod_due (cod ₹1,900 / partial ₹1,425), coins_offered:+38 |
| COD sheet: amount `#codInput` / Full `#codFull` / method radios / confirm `#codPayConfirm` / close | input/tap | prepay COD | `cod_amount_edited`/`cod_pay_full_selected`/`cod_pay_method_selected`/`cod_payment_confirmed`/`cod_sheet_dismissed` | amount_paid, coins_earned (=round(amt×0.02)), selected_method (upi/cards/netbanking), order_id |
| Scratch tile `#scratchTile` + canvas + close | tap/swipe | reveal reward | `scratch_card_opened`/`scratch_card_scratched`/`scratch_reward_revealed`/`scratch_card_dismissed` | max_reward ₹200, cleared_pct (reveal >0.45), cashback "₹150" |
| Coins tile `→coins-statement` | tap | view wallet | `coins_wallet_opened` | coins_earned:+36 |
| WhatsApp updates / Share cards | tap | opt-in / refer | `whatsapp_updates_tapped`/`referral_share_tapped` | phone, referral_offer "₹100 off" |
| Continue `→home` / Track `→order-details` | tap | keep shopping / track | `continue_shopping_tapped`/`track_order_tapped` | order_id, order_status |
| Welcome overlay (`?welcome=1`) | view | greet returning | `welcome_back_shown` | first_name |
- **`order_placed`/`order_confirmed`** payload: {order_id, order_status:confirmed→packing, order_total:1805, item_count:3, items[], payment_method, amount_paid, amount_due, coins_earned:36, delivery_eta, delivery_fee:FREE}. Scratch reveal >45% → `scratch_reward_revealed {cashback:150}` → `kkdCelebrate`. COD confirm → status amber→emerald "Payment received".

#### `orders.html` — My Orders
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Summary strip | tap/view | go back / lifetime stats | `orders_back_tapped`/`orders_summary_viewed` | total_orders:12, delivered:9, lifetime_saved:₹4,180 |
| Search `#ordSearchInput` / clear | input/tap | find order | `order_search`/`order_search_cleared` | query, results_count (matches order_id+product_name) |
| Order card `.ord-link` `→order-details` | tap | open details | `order_card_tapped` | order_id (KAT-2026-04-1284/1198/1102), order_status (transit/delivered), order_total (1430/698/1205), item_count, order_saved, delivery_eta |
| COD pay banner `.cod-trigger` | tap | pay COD, earn coins | `cod_pay_banner_tapped` | order_id, cod_amount:1430, coins_offered:+50 |
| Reorder `→cart?reorder=` | tap | rebuy | `reorder_tapped` | order_id |
| Rate `.rate-trigger` | tap | rate products | `rate_order_opened` | order_id, products[{name,size,img}] |
| Invoice `→order-details?invoice=` | tap | get invoice | `invoice_opened` | order_id |
| COD sheet amount/confirm | input/tap | pay COD | `cod_amount_edited`/`cod_payment_confirmed` | amount_paid, coins_earned (≈₹28.6/coin) |
| Rate sheet: stars/review/media/testimonial/submit | tap/input | rate products | `product_rated`/`product_review_written`/`rating_media_attached`/`testimonial_uploaded`/`ratings_submitted` | product_name, rating, coins_earned, testimonial +25 |
| Bottom nav ×4 | tap | navigate | `bottom_nav_tapped` | tab |
- ⚠ Tab filters (all/active/delivered) exist only as a visual toggle, not wired to filtering. Ratings submit → `kkdCelebrate`, removes Rate button.

#### `order-details.html` — Order Details
**Params:** `?state=delivered|transit&id=<order_id>&payment=partial&invoice=<id>`.

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back `→orders` / Status hero / Order-ID | tap/view | return / status | `details_back_tapped`/`order_status_viewed`/`order_id_viewed` | order_id (default KAT-2026-04-1198), order_status, delivered_on / eta |
| Kebab `#kebabBtn` → Cancel `#cancelOrderBtn` (transit) / Invoice / Support | tap | menu actions | `order_menu_opened`/`cancel_order_started`/`invoice_download_tapped`/`support_contact_tapped` | order_id |
| Timeline (Placed/Packed/Dispatched/Delivered) | view | track | `timeline_viewed` | steps + timestamps, current_step |
| Product row `→pdp` | tap | view product | `product_opened` | product_name, source:order_details |
| Itemized bill | view | verify charges | `bill_viewed` | items[{Humic+Fulvic, sku:humic, size:1L, price:376, qty:2, line:752},{Antivirus, sku:antivirus, 250ml, 327, 3, 981}], subtotal:1733, delivery:FREE, coins_used:50, coins_value:−₹5, order_total:1728 |
| Per-product star `.star-btn` → `kkdRate` / submit | tap | rate product | `product_rated`/`product_review_submitted` | product_name, sku (data-key), rating, coins_earned (+10/+25) |
| Per-product Reorder `.prod-reorder` `→cart?reorder=` | tap | rebuy 1 item | `product_reorder_tapped` | sku |
| Address / Payment row / invoice chip | view/tap | confirm | `address_viewed`/`payment_viewed`/`invoice_download_tapped` | name "Sagar Patel", payment_method UPI, bank "HDFC ••7842", txn_id |
| Partial COD strip `#payCodBtn` + sheet | tap/input | pay COD balance | `cod_pay_strip_tapped`/`cod_amount_edited`/`cod_payment_confirmed` | advance_paid, cod_due (₹628/transit ₹1,287), coins_offered:+50, coins_earned (≈₹12.5/coin) |
| Unboxing video `#unboxVideo` / Verify `#verifyCard` (kkdVerify) | input/tap | proof / authenticate | `unboxing_video_attached`/`verify_product_tapped` | order_id |
| Need help `#helpRow` + channels | tap | contact support | `support_sheet_opened`/`support_channel_tapped` | channel (call 1800 270 0300 / email / chat / whatsapp +91 96964 00400) |
| Sticky Return CTA `#returnCta` (delivered, 7-day) / Reorder | tap | start return / rebuy all | `return_initiate_started`/`reorder_tapped` | order_id, days_left |
| Return flow: T&C agree/proceed, type seg, product checkbox + qty, reason, desc, voice, proof, submit | tap/input | full return/replace | `return_terms_agreed`/`return_form_opened`/`return_type_selected`/`return_product_selected`/`return_qty_changed`/`return_reason_selected`/`return_description_entered`/`return_voice_recorded`/`return_proof_attached`/`return_submitted` | choice (return/replace), products[{sku,qty}], reason (Damaged/Wrong/Not as described/Missing/Quality/Other), proof_count |
| Return details `[data-ret-details]` | tap | view R&R timeline | `return_status_opened` | product_name, return_choice |
| Cancel flow: confirm → reason → submit | tap/input | cancel order | `cancel_order_confirmed`/`cancel_reason_selected`/`cancel_submitted` | reason, refund_amount (advance ₹70), refund_method:UPI |
- `?state=transit` → Dispatched current, total ₹1,430, partial (advance 10% ₹143, COD due ₹1,287), hides Return CTA. Return submit → success card + per-row `.ret-status` banner + 4-step return timeline. Cancel → "advance refunded to UPI in 3–5 days" → `orders.html`.

#### `track-order.html` — Track Order
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Map / timeline | tap/view | track | `track_back_tapped`/`track_map_viewed`/`track_timeline_viewed` | order_id KKD-26194-7821, order_status:out_for_delivery, distance "8 km", eta "12 hrs", courier:Delhivery, 5 steps |
| Map call / sticky "Call delivery partner" | tap | call agent | `delivery_agent_called` | order_id, agent_name "Suresh K.", agent_phone, source (map/sticky_cta) |

#### `refund-status.html` — Refund Status
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / SLA card / timeline / method card | tap/view | track refund | `refund_back_tapped`/`refund_summary_viewed`/`refund_timeline_viewed`/`refund_method_viewed` | order_id KKD-26190-3344, refund_amount ₹509, refund_status processing/initiated, expected_by "Sat 17 May", method "Original payment · COD", destination "UPI 98XXX@oksbi", reason "Wrong product delivered", 4 steps |
| "Need help with this refund?" | tap | support | `refund_help_tapped` | order_id, refund_amount, refund_status |

#### `empty-orders.html` — No Orders
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| (load) / Shop-now `→shop` / Back / nav | view/tap | first-purchase nudge | `empty_orders_viewed`/`shop_now_tapped` | order_count:0, first_order_offer "₹100", source:empty_orders |

---

### 3.G Address & location

#### `addresses.html` — Saved Addresses
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back | tap | leave | `address_book_back_tapped` | — |
| Address card `.addr-card[data-id,data-pin]` | tap | select active delivery address | `address_selected` | address_id (home/farm/shop/field), pincode (452001/453555/452002/123456), address_type, is_default (home), serviceable (false for 123456), detection_method:saved_select |
| Edit `.addr-act` `→add-address?edit=1` | tap | modify | `address_edit_tapped` | address_id, pincode, address_type |
| Delete `.addr-act.del` | tap | remove | `address_delete_tapped` | ⚠ no handler wired |
| Add-new `.add-btn` `→add-address` | tap | create | `add_address_cta_tapped` | source:address_book |
- `address_selected` persists `kkd.addr`+`kkd.pincode`, clears `kkd.stOverride`, `history.back()` after 180ms. `serviceability_state_resolved {serviceable,pincode}`. ⚠ The `123456` card renders NOT-SERVICEABLE on load (`non_serviceable_card_impression`). ⚠ No address-type filter tabs exist — Home/Farm/Shop/Field are individual cards.

#### `add-address.html` — Add / Edit Address
**Params:** `?edit=1` → edit mode (prefills house/pin/city/state, retitles).

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back | tap | abandon | `add_address_back_tapped` | mode, fields_filled |
| Address textarea `#house` | input | enter street/house/landmark | `address_line_entered` | house text, length, detection_method:manual_entry |
| Pincode `#pin` (tel, 6) | input | postal code | `pincode_entered` | postal_code (digits), length |
| City `#city` / State `#state` | input | enter city/state | `city_entered`/`state_entered` | city, state |
| Save-as tags `.tag[data-tag]` (home default) | tap | label address | `address_tag_selected` | address_type (home/work/farm/shop/other) |
| Default checkbox `#defaultChk` (default ✓) | toggle | set default | `default_address_toggled` | is_default |
| Save `#addrSave` | tap | persist | `address_saved` | address_type, pincode, city, state, house, is_default, mode, detection_method:manual_entry |
- ⚠ **No GPS/locate-me element** (`.locate` class unused) → `gps_auto` impossible here. ⚠ Persists **only** pincode/city/state (not house/tag). ⚠ No country/lat/long fields. ⚠ No serviceability check or validation at save — resolved later in `addresses.html`.

---

### 3.H Account, profile & settings

#### `account.html` — Profile Hub
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / profile header / completion meter | tap/view | identity & completeness | `nav_back`/`profile_header_viewed`/`profile_completion_viewed` | user_name "Ramesh Patel", phone, member_since "Apr 2026", completion_pct:75 |
| Edit pill `→edit-profile` | tap | edit profile | `profile_edit_tapped` | completion_pct:75 |
| Menu rows (Addresses/Language/Refer/Krishi Coins/Scratch cards/Wallet/Settings/Know-app/About) | tap | navigate | `menu_row_tapped` | row, destination, meta (saved_count:2, coins_balance:1240, pending_scratch:1, wallet_balance:540, reward_per_friend:50) |
| Language row | tap | change lang | `menu_row_tapped` | current_language_label "हिंदी", lang_code (`kkd.lang`) |
| Verify-product `onclick=kkdVerify()` | tap | scan QR | `verify_product_opened` | action:scan_qr |
| Help row `#helpBtn` (sheet) + channels + close | tap | support | `help_sheet_opened`/`help_channel_tapped`/`help_sheet_dismissed` | channel (call 18002700300 / email care@… / live_chat / whatsapp +91 96964 00400) |
| Sign-out `#signoutBtn` (sheet) + confirm/cancel | tap | sign out | `signout_sheet_opened`/`signout_confirmed`/`signout_cancelled` | destination:splash |
| Legal rows `→policy?doc=` | tap | read policy | `legal_doc_tapped` | doc (privacy/terms/returns) |
| Bottom nav ×4 | tap | switch tab | `bottom_nav_tapped` | tab |

#### `edit-profile.html` — Edit Profile
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Change photo | tap | cancel / avatar | `nav_back`/`avatar_change_tapped` | initials "RP" |
| Inputs: first/last name, mobile, alt number `#altNumber`, email, village/city | input | edit fields | `profile_field_edited` | field, value (prefilled: Ramesh/Patel/+91 98765 43210/Indore, MP), alt persisted `kkd.altNumber` |
| Save `#saveBtn` | tap | persist | `profile_save_tapped` → `profile_updated` | fields_changed[] |

#### `settings.html` — App Settings
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Theme row | tap | leave / change theme | `nav_back`/`theme_row_tapped` | current_theme "Light" |
| Toggles: order updates / price alerts / crop calendar reminders / promotions / WhatsApp | tap | toggle notif | `setting_toggled` | setting, value (initial on/on/on/off/on). ⚠ in-memory only, not persisted |
| Legal links / Delete account / Version | tap/view | policy / delete / build | `legal_doc_tapped`/`delete_account_tapped`/`app_version_viewed` | doc, version "KKD v1.0", build "2026.05.14" ⚠ delete has no confirmation |

#### `notifications.html` — Notifications
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Mark all read | tap | leave / clear unread | `nav_back`/`notifications_mark_all_read` | unread_count_before:1 |
| Notification items (order_delivered / crop_reminder / coins_credited / price_drop) | tap | open relevant page | `notification_tapped` | type, unread, order_id/crop/coins/product_name+discount_pct, group (today/this_week), time_ago, destination |
- `notification_read` per unread tap + bulk; `notification_impression` per item.

#### `wishlist.html` — Wishlist
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back `→account` / header | tap/view | return / size | `nav_back`/`wishlist_viewed` | saved_count_label:5, items_rendered:3 |
| Product tile `→pdp` ×3 | tap | open PDP | `wishlist_item_tapped` | product_name (Humic+Fulvic 98/Chakrawarti/Antivirus), brand:Katyayani, sku, price (376/358/327), compare_at_price (520/—/—), discount_pct |
| Heart button | tap | remove | `wishlist_item_removed` | product_name, sku, price |
| ADD button | tap | move to cart | `wishlist_item_moved_to_cart` | product_name, sku, price, compare_at_price |
- ⚠ Heart/ADD nested inside `<a href=pdp.html>` with no `preventDefault` — fire event + `stopPropagation` before nav.

#### `refer.html` — Refer & Earn
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / hero / code `#refCode` | tap/view | offer / own code | `nav_back`/`referral_offer_viewed`/`referral_code_viewed` | coins_per_friend:60, friend_discount:100, referral_code "KRIYUMT" ⚠ account row says ₹50 — mismatch |
| Copy `#copyBtn` / Share `#shareBtn` / WhatsApp | tap | copy / share | `referral_code_copied`/`referral_shared` | referral_code, share_channel (copy/native_share/whatsapp) |
| Milestone / stats / leaderboard / own-rank | view | progress / standing | `referral_milestone_viewed`/`referral_stats_viewed`/`referral_earnings_viewed`/`leaderboard_viewed`/`leaderboard_own_rank_viewed` | progress_pct:60 (3/5), referrals_count:3, pending:1, coins_this_month:180, lifetime:540, rank:24 |

#### `saved-payments.html` — Saved Payments
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back `→account` | tap | return | `nav_back` | — |
| UPI card (Default) / COD card | tap/view | select/view | `payment_method_tapped` | method_type (upi handle "ramesh@oksbi" / cod), is_default |
| Add new (sticky) | tap | add method | `payment_method_add_tapped` | surface:sticky_cta |
- ⚠ Cards have no select/remove handlers (display-only); `payment_method_selected`/`_removed` need handlers added.

#### `signout-confirm.html` — Sign Out (standalone sheet)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| (slide-up) / Yes `→splash` / Cancel `history.back()` | view/tap | confirm / abort | `signout_sheet_opened`/`signout_confirmed`/`signout_cancelled` | surface:standalone_page, destination:splash |

---

### 3.I Rewards, coins & feedback

#### `wallet.html` — Wallet (money)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Balance hero | tap/view | leave / funds | `wallet_back_tapped`/`wallet_balance_viewed` | wallet_money_balance:540, lifetime_received:3180 |
| Refund txn row `.txn[data-i]` + detail sheet + close | tap/view | inspect refund | `wallet_transaction_tapped`/`wallet_refund_detail_viewed`/`wallet_refund_detail_closed` | transaction_id (KAT-2026-05-1284), transaction_amount (330/512/405), type:refund, date, item_count, has_penalty, per-item {product_name,qty,refund} |
- ⚠ No redeem CTA (read-only refund ledger). No coins here.

#### `scratch-cards.html` — Scratch Cards
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Summary strip | view | totals | `scratch_summary_viewed` | to_scratch_count:1, scratched_count:4, total_won:180 |
| To-scratch tile `.sc-tile[data-prize…]` | tap | start scratching | `scratch_card_opened` | reward_amount (data-prize ₹150), reward_label, reward_sub, reward_date |
| Scratch canvas `#scratchCanvas` | drag/scratch | reveal (>0.45) | `scratch_card_scratching`→`scratch_reward_revealed` | reward_amount, cleared_pct, reward_unit (₹/coins), won, input_type |
| Overlay close / backdrop | tap | abandon | `scratch_card_dismissed` | reward_amount, was_revealed:false |
| Scratched-history card `.sc-won` | view | review past | `scratched_history_viewed` | reward_amount (₹100/50/₹30), reward_type (cashback/krishi_coins/missed), won_status, date |
| Bottom nav ×4 | tap | navigate | `nav_tab_tapped` | destination |
- Reveal auto-credits (no Claim button) → `reward_credited` + `kkdCelebrate`. `scratch_todo_emptied` when none left.

#### `coins-statement.html` — Coins
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Balance hero | tap/view | leave / balance | `coins_back_tapped`/`coins_balance_viewed` | coins_balance:120, coins_worth_rupees:120, rate:1 |
| Activity rows (earn/spend) | view | review history | `coins_statement_row_viewed` | transaction_title (First-order bonus/Enabled notifications/Added first crop/Redeemed at checkout), type (earn/redeem), amount (+100/+10/+50/−40), date, order_id |
- ⚠ Rows non-interactive (impression-only); no filter control.

#### `rate-app.html` — Rate the App
**Params:** `?rate=fork|happy|feedback|thanks`.

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Fork options (Loving it!/It's okay/Needs work) | tap | sentiment | `rate_sentiment_selected` | sentiment (happy/okay/unhappy) |
| Maybe later / Not now / backdrop | tap | dismiss | `rate_dismissed` | view |
| Star selector `#happyStars .st` ×5 | tap | set rating | `rating_value_selected` | rating_value (1–5, default 5) |
| Play Store CTA | tap | go to store | `app_store_redirect` | rating_value, store:play_store ⚠ code only closes sheet |
| Feedback tags `.fb-tag` ×9 + textarea + screenshot | tap/input | issue reasons | `feedback_tag_toggled`/`feedback_text_entered`/`feedback_screenshot_attached` | tag_label (9 issues), selected_tags[], feedback_text |
| Submit feedback / Back / Done | tap | send / nav | `feedback_submitted`/`feedback_back_tapped`/`rate_flow_closed` | sentiment:unhappy, selected_tags[], feedback_text |
- States: `rate_sheet_opened {view}`, `rating_submitted`, `survey_completed`, `rate_thanks_shown`.

#### `know-your-app.html` — Know Your App (static feature list)
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / feature rows ×6 / help hint | tap/view | learn capability | `know_app_back_tapped`/`feature_card_viewed`/`help_hint_viewed` | feature_title (6 capabilities), feature_index (0–5) |
- ⚠ No stepper/next/skip — single static list.

---

### 3.J Crop & agronomy services

#### `crop-detail.html` — My Crops (Crop Guide)
*The only screen with true dynamic rendering (`CROPS`, products `P`, problems `PROB`).*

| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / crop chip `.crop-chip` / Add-crop chip / empty CTA | tap | leave / switch / add | `nav_back`/`crop_selected`/`add_crop_sheet_opened` | crop_name, crop_key (userCrops default ['cotton','wheat']) |
| Identity hero / chips / 2×2 stats | view | identify / scope | `crop_identity_viewed`/`crop_stats_viewed` | sci_name "Gossypium hirsutum", chips (Fiber/Kharif/CR-8/180 days), stages:9, issues:47, products:313, duration:180d |
| Growth-stage accordion `.vstg-head` | tap | expand stage | `crop_stage_toggled` | crop_name, growth_stage, stage_index, day_range, stage_pct, issue_count, is_current_stage |
| Disease block `.prob-block` | view | learn disease | `disease_viewed` | disease_name, severity (high/med), crop_name, growth_stage, disease_image |
| "Show recommended products (n)" `.rp-toggle` | tap | reveal products | `disease_products_toggled` | disease_name, severity, product_count, open |
| Recommended-product row `.prod-row` `→pdp` | tap | open PDP | `recommended_product_clicked` | product_name, product_tech ("Thiamethoxam 25% WG"), pack, use, product_type (chem/bio), price, disease_name, crop_name, growth_stage |
| "Add" `.prod-price .add` | tap | add to cart | `add_to_cart` | product_name, tech, pack, price, type, disease_name, crop_name, growth_stage ⚠ in-place "Added ✓" only, no real cart write |
| Ask Expert banner `→advisory` | tap | contact agronomist | `expert_contact_initiated` | expert_channel:video, source:crop-detail |
| Add-crop sheet: tile `.pick[data-k]` + Done `#addApply` + close | tap | multi-select crops | `add_crop_toggled`/`crops_updated`/`add_crop_sheet_dismissed` | crop_key, selected_crops[], crop_count |
| Bottom nav ×4 | tap | navigate | `nav_tab_selected` | tab |

#### `crop-calendar.html` — Crop Calendar
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / hero / progress | tap/view | leave / orient | `nav_back`/`crop_calendar_viewed` | crop_name:Chilli, day_current:47, day_total:110, acres:2, location:Indore, progress_pct:43 |
| Stage rows (Sowing✓/Vegetative✓/Flowering-Active/Fruiting/Harvest) | view | lifecycle | `crop_stage_viewed` | growth_stage, stage_status (done/active/upcoming), day_range, is_active |
| Task "Spray Chakrawarti · Today" `→pdp` (DUE) | tap | buy task product | `task_product_clicked` | task_name, task_status:due, growth_stage:Flowering |
| "Flowering Kit" card `→pdp` | tap | buy stage kit | `stage_kit_clicked` | kit_name, product_count:2, price ₹685, savings ₹50, growth_stage |
- ⚠ Other tasks static (no checkbox wiring); only the two `<a href=pdp>` are real.

#### `my-crop.html` — My Crop Dashboard
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Header "+" | tap | add crop | `add_crop_clicked` | source:my-crop_header ⚠ no handler |
| Crop card (Chilli/Tomato) `→crop-calendar` | tap | open calendar | `my_crop_card_clicked` | crop_name, growth_stage, day, acres, sown, days_left |
| Today's task "Buy now" `→pdp` / "Done" | tap | buy / complete | `task_buy_clicked`/`task_marked_done` | task "Spray Chakrawarti", crop_name, growth_stage ⚠ Done no handler |
| Recommended cards `→pdp` / carousel | tap/swipe | open / browse | `recommended_product_clicked`/`recommended_carousel_scrolled` | product_name, price (Antivirus 327/Chakrawarti 358/Bhannaat 334), recommendation_context, position |
| Mandi rate rows | view | market price | `mandi_rate_viewed` | commodity, market:Indore, price, change (Tomato ₹18/kg +₹2; Chilli ₹85/kg −₹4) |
| Bottom nav ×4 | tap | navigate | `nav_tab_selected` | tab |

#### `advisory.html` — Advisory Hub
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| "Call an expert" hero `→doctor-call` | tap | talk to agronomist | `expert_contact_initiated` | expert_channel:call, meta "Avg pickup 90 sec · Free 5 min" |
| Photo diagnosis `→photo-diagnosis` / Voice `→voice-search` | tap | diagnose / ask | `photo_diagnosis_opened`/`voice_search_opened` | source:advisory |
| Article rows ×4 `→doctor-call` | tap | read/answers | `advisory_article_clicked` | article_id (chilli-yellow-mosaic etc.), crop_name, problem_title, answer_count |
| Bottom nav ×4 | tap | navigate | `nav_tab_selected` | tab |

#### `doctor-call.html` — Voice Call In-Progress
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Calling state | view | connecting | `expert_call_connecting` | expert_name "डॉ. प्रिया शर्मा", rating:4.9, calls:2140, role, langs, call_timer |
| Mute / End `→advisory` / Speaker | tap | mute / hang up / toggle | `call_mute_toggled`/`expert_call_ended`/`call_speaker_toggled` | muted, duration ⚠ speaker no handler |

#### `photo-diagnosis.html` — Photo Diagnosis
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / captured image / result card | tap/view | await / see result | `nav_back`/`diagnosis_analyzing`/`diagnosis_result_viewed` | disease_name "Chilli Yellow Mosaic Virus", confidence:94, crop_name:Chilli |
| Recommended (Antivirus) / Alternative (Triple Attack) `→pdp` | tap | view treatment | `recommended_product_clicked` | product_name, brand:Katyayani, pack, price (₹327/₹509), mrp, rank (primary/alternative), disease_name, diagnosis_confidence:94 |
| Sticky camera / CTA "कार्ट में डालें · ₹327" `→cart` | tap | retake / add to cart | `diagnosis_photo_capture`/`add_to_cart` | product_name:Antivirus, price:327, disease_name, diagnosis_confidence ⚠ camera no handler |

#### `help.html` — Help & Support
| Element | Action | Intent | Event | Dynamic data |
|---|---|---|---|---|
| Back / Ask-AI hero `#askAiCta` | tap | leave / open AI chat | `nav_back`/`ai_chat_opened` | expert_channel:ai, assistant "Krishi AI" |
| AI input/send + chips + attach + voice | input/tap | ask AI | `ai_message_sent`/`ai_chip_tapped`/`ai_attach_clicked`/`ai_voice_clicked` | query_text, chip_label (Check price/Disease help/Dose calculator/Order status) |
| AI product cards `→pdp` / Add `.addb` / close | tap | view / add suggested | `ai_product_clicked`/`add_to_cart`/`ai_chat_closed` | product_name, pack, use, price, mrp, source:ai_chat |
| "Call an expert" video row + confirm + connect + disconnect | tap | video call | `expert_contact_initiated`/`video_call_confirmed`/`video_call_cancelled`/`video_call_connected`/`video_call_ended` | expert_channel:video, expert_name "Dr. R. Verma", role, duration |
| Call us `tel:` / WhatsApp / Email `mailto:` | tap | contact | `expert_contact_initiated` | expert_channel (call/whatsapp/email), hours, toll_free |
| Bottom nav ×4 | tap | navigate | `nav_tab_selected` | tab |

---

## 4. Granular User Journeys & State Changes

### 4.1 Onboarding → Home (identity acquisition)
```
splash (app_open, session_start)
  → language (language_select)
    → phone (consent gating → send_otp_tap)
      → otp (otp_verified)  ◀── GUEST→IDENTIFIED transition
         ├─ mobile 1234…  (new)      → name (profile_name_saved) → welcome-aboard → notifications-allow (allow/skip) → home
         └─ mobile 12345… (returning)→ welcome-back → home
```
**State changes:** `kkd.mobile` set at phone; `user_type` resolved at OTP by prefix; `kkd.firstName/lastName` at name; push-permission choice at notifications-allow (⚠ not persisted). Returning users skip name + notifications. (The `tell-us → permissions → locating` crop/GPS branch is wired but **dropped from the live chain**; if re-enabled it writes `kkd.village/district` and emits `location_detected`.)

### 4.2 Discover → PDP → Cart (core commerce funnel)
```
home  ──product_tap (source_section: bestseller|most_selling|flash_deals|recently_viewed|buy_again|featured|shop_by_crop)──┐
search ──search_results_returned → search_result_tapped──┐                                                                │
categories ──category_selected → filter_value_toggled → product_card_tapped──┐                                            │
crop-detail / crop-calendar / my-crop / photo-diagnosis ──recommended_product_clicked──┐                                  │
                                                                                       ▼                                  ▼
                                                                                    pdp (product_view)
                                                                                       │ variant_changed (pack-size, price, per-litre)
                                                                                       │ add_to_cart {selected_pack_size, price, qty}
                                                                                       ▼
                                                                                    cart (cart_viewed)
```
**Critical property to preserve:** `source_section` / `source` — *where the product was clicked from* (best-seller banner vs search vs category grid vs crop recommendation). This is the single most valuable attribution dimension and must ride on `product_tap` → `product_view` → `add_to_cart`.

**State changes en route:**
- **Variant selection (PDP):** `variant_changed` swaps price, per-litre rate, stock state; OOS size (2 L) → `add_blocked_oos`; the cart is a **per-variant map** so the same product can be in cart at multiple pack sizes.
- **Restriction overlays:** if `app_state.bannedproduct` (or `?p=chakrawarti`) → `add_blocked_banned` (add intercepted by a "not available in your state" sheet); if `app_state.nonservice` → delivery shows "Not serviceable".

### 4.3 Cart → Quantity/Coupon/Coins → Checkout → Order
```
cart (cart_viewed)
  ├─ cart_qty_increased/_decreased  → bill recompute (subtotal, grand_total)
  ├─ cart_item_removed              → persist kkd.cart; if empties → empty-cart (empty_cart_viewed)
  ├─ coupon_applied (WELCOME100/HUMIC50/KKD200) → kkdCelebrate; grand_total ↓
  ├─ coins_redeem_toggled           → coin row + wallet re-cap; grand_total ↓
  └─ checkout_started → cross-sell sheet (cross_sell_item_added*) → checkout_proceeded
        ▼
     checkout (checkout_viewed, default payment_method=paynow)
        ├─ payment_method_selected: paynow (−5% ₹95) | partial (% split + 2% coins) | cod (+₹95)
        │     └─ codoff state → COD disabled, auto-switch to paynow (checkout_cod_disabled_shown)
        ├─ partial_payment_pct_selected (10/25/50/75) → split recompute (total unchanged)
        ├─ coins_redeem_toggled / wallet auto-applied (mandatory)
        └─ place_order_tapped → order_placed
              ├─ SUCCESS → order-success.html?mode=<method>  (order_confirmed)
              └─ FAILURE → error-payment.html (payment_failed {failure_reason, payment_method, order_amount})
```
**Guest vs identified at checkout:** the user is already identified (OTP happened pre-home); alternate number capture (`alt_number_entered`, persisted `kkd.altNumber`) is the only new identity write here.

**Address auto-fill vs manual (state change detail):**
- **`saved_select`** — picking a card in `addresses.html` sets active `kkd.pincode`/`kkd.addr` and resolves serviceability instantly (`123456` → not serviceable). This is how delivery address changes from cart/checkout/PDP "Change" links.
- **`manual_entry`** — typing in `add-address.html`; persists pincode/city/state only; no serviceability check at save time.
- **`gps_auto`** — only `locating.html` produces coordinates-free village/district detection; ⚠ no lat/long is ever captured, and the in-form GPS button doesn't exist.

### 4.4 Payment success vs failure (terminal states)
| Outcome | Screen | Event | Key properties | Next |
|---|---|---|---|---|
| **Success** | `order-success.html` | `order_confirmed` | order_id, order_total, items[], payment_method, amount_paid, amount_due (partial/cod), coins_earned, delivery_eta | scratch reward → `scratch_reward_revealed`; COD prepay → `cod_payment_confirmed`; → home / order-details |
| **Failure** | `error-payment.html` | `payment_failed` | failure_reason ("Insufficient balance"), payment_method ("UPI · oksbi"), order_amount | `payment_retry_tapped` → re-enters checkout |

### 4.5 Post-purchase lifecycle
```
order-success → orders (list) → order-details
   ├─ track-order (track_timeline_viewed, delivery_agent_called)
   ├─ COD prepay (cod_payment_confirmed) — on success / orders / details
   ├─ rate products (product_rated → review_submit, kkdRate, +10/+25 coins)
   ├─ reorder (reorder_tapped → cart?reorder=)
   ├─ return/replace (return_submitted {choice, products[], reason, proof}) → return timeline
   ├─ cancel (cancel_submitted {reason, refund_amount}) 
   └─ refund-status (refund_timeline_viewed {refund_amount, refund_status})
```

### 4.6 Rewards & gamification (parallel loop)
- **Earn-coins quest (home):** 5 steps (notif 10 / loc 10 / cart 15 / search 10 / crop 50) persisted to `kkd.quest`; all-done → "Your rewards" (`kkd.coins.rewardSeen`), first-crop → +50 (`first_crop_reward_earned`).
- **Reviews:** +10 coins (text) / +25 (video testimonial) via `kkdRate`/inline modals on home buy-again, orders, order-details.
- **Scratch cards:** reveal >45% auto-credits cashback/coins (`scratch_reward_revealed` → `kkdCelebrate`).
- **Referral:** share code KRIYUMT (`referral_shared {channel}`); milestone progress to 5.
- **Coins economy:** 1 coin = ₹1; earned at order/notifications/first-crop/reviews/COD-prepay; redeemed at checkout (auto ₹190). ⚠ Balance is DOM-only (no canonical store).

### 4.7 Agronomy services (engagement, non-commerce)
`advisory` hub → **call** (`doctor-call`, expert_call_*), **photo diagnosis** (`diagnosis_result_viewed` → recommended product → `add_to_cart`), **AI chat** (`help.html` Krishi AI → `ai_product_clicked`/`add_to_cart`), **video call** (`help.html`), **crop guide** (`crop-detail` disease → recommended product). Every service path is designed to funnel back into `add_to_cart` — track `expert_channel` (call/video/whatsapp/email/ai/advisory) and the service→cart conversion.

---

## 5. Complete Dynamic-Data & Property Mapping (consolidated dictionaries)

### 5.1 Product interaction properties (every `product_*` / `add_to_cart`)
| Property | Always available? | Source |
|---|---|---|
| `product_name` | yes | markup / `n`/`name` |
| `brand` | yes (constant) | `"Katyayani"` |
| `tech_name` / subtitle | usually | `t`/`sub` |
| `category` | yes on catalog | `cat` |
| `subcategory` | catalog | `sub`/`subs` |
| `sku` / `variant_id` | catalog (`<cat>-<sub>-<idx>`), PDP cart map | ⚠ home cards lack stable sku — add one |
| `selected_pack_size` | PDP/variant | `.var`, variants[] |
| `price` | yes | `p`/`price`/data-price |
| `compare_at_price` (MRP) | usually | `m`/`mrp`/data-mrp |
| `discount_pct` | derived | `offPct`/data-off |
| `quantity` | cart/PDP | qty stepper |
| `image_url` | yes | `img`/data-img |
| `rating` / `review_count` | home/PDP | markup |
| `position` / `index` | yes | DOM order |
| **`source_section`** | **critical** | bestseller / most_selling / flash_deals / recently_viewed / buy_again / featured / shop_by_crop / crop_problem_rec / search:top_results / category_grid / ai_chat / photo_diagnosis / crop_guide |
| `applied_filters` | categories | filter Set snapshot |
| `tags[]` / `crops[]` | catalog | `tags`/`crops` |

### 5.2 Cart / Checkout properties
`item_count`, `line_items[]` ({product_name, brand, sku, pack_size, unit_price, compare_at_price, quantity, line_total}), `subtotal`, `item_discount` (300), `coupon_code` + `coupon_value`, `coins_used` (190), `wallet_applied` (≤540), `delivery_fee` (FREE), `grand_total`, `total_saved`, `payment_method` (paynow/partial/cod), `partial_payment_pct` (10/25/50/75), `prepaid_discount` (95), `cod_extra` (95), `coins_earned`.

### 5.3 Order / Return / Refund properties
`order_id` (KKD-26194-7821 / KAT-2026-04-1198 …), `order_status` (confirmed/packing/transit/out_for_delivery/delivered), `order_total`, `item_count`, `items[]`, `payment_method`, `amount_paid`, `amount_due`, `coins_used` (50→₹5), `coins_earned`, `delivery_eta`, `courier` (Delhivery), `agent_name`/`agent_phone`, `return_choice` (return/replace), `return_reason`, `proof_count`, `refund_amount` (₹509), `refund_status`, `refund_method`, `expected_by`, `sla` (3–5 days).

### 5.4 Location properties
`city`, `state`, `pincode`/`postal_code`, `village`, `district`, `address_type` (home/work/farm/shop/other/field), `is_default`, `serviceable` (pincode≠123456), `detection_method` (gps_auto / manual_entry / saved_select). ⚠ `country` absent (use "India"); ⚠ `latitude`/`longitude` never captured.

### 5.5 Reward / engagement properties
`coins_balance` (DOM), `wallet_money_balance` (540), `lifetime_received` (3180), `reward_amount`, `reward_type` (cashback/krishi_coins/missed), `rating_value` (1–5), `review_text`, `selected_tags[]`, `referral_code` (KRIYUMT), `referrals_count` (3), `share_channel` (copy/native_share/whatsapp), `quest_step_id`, `coins_earned`, `expert_channel` (call/video/whatsapp/email/ai/advisory).

---

## 6. Instrumentation gaps to resolve before/while wiring tracking (checklist)

1. **Add a `track()` shim + dataLayer** — none exists; every event here is currently un-emitted.
2. **Add `data-product-*` (incl. stable `sku`) to every commerce card**, especially on `home.html`, so product events don't scrape rendered text.
3. **Add IntersectionObserver** for `product_impression` / `section_view` (no impression tracking exists).
4. **Fix nested-anchor clicks** (`wishlist.html` Add/Heart, and audit others) — `stopPropagation()` + fire event before navigation.
5. **Pass `search_query` on search-suggestion navigation** (`search.html` → `categories.html` currently loses it).
6. **Wire missing handlers** flagged ⚠: address delete, save-for-later, settings persistence, saved-payment select/remove, my-crop "+"/task-Done, call speaker, AI attach/voice, photo-diagnosis camera, cart line-item→PDP.
7. **Normalize the two PRODUCTS schemas** (§2.1) into one canonical product object.
8. **Reconcile contradictory constants** before they pollute funnels: referral reward (₹50 vs 60 coins), COD→coin rates (2% vs ₹28.6 vs ₹12.5/coin), and the coin balance source-of-truth (DOM `#coinBalance` 120 vs 220).
9. **Decide canonical names** where the prototype routes are placeholders (e.g. several "news"/"shop" nav targets point at `shop.html`, which is otherwise deprecated).
10. **Treat app-state (`nonservice/bannedproduct/banneduser/codoff`) as super-properties** so blocked-checkout drop-off is segmentable.

---

*Generated from a screen-by-screen reading of the KKD app prototype (`screens/*.html`, `assets/*.js`). Treat the per-screen tables in §3 as the authoritative element inventory and the §5 dictionaries as the property contract for the event schema.*
