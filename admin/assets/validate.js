/* ==========================================================================
   KKD Admin · shared content-validation layer
   ──────────────────────────────────────────────────────────────────────────
   Why: anything an admin types or uploads ends up on a fixed-size phone screen.
   Wrong banner dimensions crop ugly; over-long titles clip or wrap and break
   the layout. This module enforces those limits IN THE ADMIN so bad content
   never reaches the app.

   Two kinds of guard, both auto-wired by data-attributes (no per-page JS):

   1. IMAGES  — add  data-img-spec="banner"  to an <input type=file>.
        On change: type + size + dimension are checked against the named spec.
        Wrong size → red error (blocks). A "Required: 1080×480 px …" hint and a
        live message slot are injected automatically right after the input.
        Optional: data-img-ok="fnName"  is called (input, result) on success
                  data-img-preview="#sel" sets that <img>/element bg on success

   2. TEXT    — add  data-maxlen="40"  to an <input type=text> or <textarea>.
        A live "12 / 40" counter is injected; it turns amber near the limit and
        red over it, with a short "may clip in the app" warning.

   Specs live in KKDV.SPECS and read top-to-bottom: { label, formats, maxMB,
   gifMB, dim:{w,h,mode}, tol }. mode = 'exact' (must equal, else error),
   'aspect' (ratio must match, else error; below size → warn), 'min' (below →
   warn only), 'square' (1:1 aspect). Everything degrades to a friendly message.
   ========================================================================== */
(function (global) {
  'use strict';
  const esc = global.esc || (s => String(s == null ? '' : s));

  /* ── image spec registry ── ------------------------------------------------
     Dimensions reflect where each image renders on the 390-wide app screen.   */
  const IMG = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const IMG_NS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
  const SPECS = {
    // Full-width promo banner — fixed 9:4 strip in every carousel slot.
    banner:    { label: 'Promo banner',      formats: IMG,    maxMB: 2, gifMB: 4, dim: { w: 1080, h: 480, mode: 'exact' }, tol: 4 },
    // Mobile-number / Home hero card — matches the real hero (362×292 on the 390px screen → 3× = 1080×870, ~5:4).
    hero:      { label: 'Hero image', formats: IMG,    maxMB: 2, gifMB: 4, dim: { w: 1080, h: 870, mode: 'aspect' } },
    // App logo — small, square, ideally transparent PNG/SVG.
    logo:      { label: 'App logo',          formats: IMG_NS, maxMB: 0.5,          dim: { w: 512, h: 512, mode: 'square' } },
    // Product shot — square, shown on Shop tiles + PDP.
    product:   { label: 'Product image',     formats: IMG,    maxMB: 2,            dim: { w: 800, h: 800, mode: 'square' } },
    // Crop circle — square.
    crop:      { label: 'Crop image',        formats: IMG,    maxMB: 1,            dim: { w: 600, h: 600, mode: 'square' } },
    // Category / nav icon — small square.
    icon:      { label: 'Category icon',     formats: IMG_NS, maxMB: 0.3,          dim: { w: 240, h: 240, mode: 'square' } },
    // Expert / farmer face — small square, circular-cropped in app.
    avatar:    { label: 'Photo (round)',     formats: IMG,    maxMB: 0.5,          dim: { w: 320, h: 320, mode: 'square' } },
    // Splash / onboarding full screen — portrait.
    splash:    { label: 'Full-screen image', formats: IMG,    maxMB: 2,            dim: { w: 1080, h: 1920, mode: 'aspect' } },
    // Farmer testimonial clip.
    video:     { label: 'Testimonial video', formats: ['video/mp4', 'video/webm'], maxMB: 100, isVideo: true },
  };

  const fmtList = f => f.map(t => t.split('/')[1].replace('svg+xml', 'SVG').toUpperCase()).join(', ');
  function specHint(name) {
    const s = SPECS[name]; if (!s) return '';
    if (s.isVideo) return `Required: ${fmtList(s.formats)} · max ${s.maxMB} MB`;
    const d = s.dim, sizeTxt =
      d.mode === 'exact'  ? `<b>exactly ${d.w} × ${d.h} px</b>` :
      d.mode === 'square' ? `<b>square, ${d.w} × ${d.h} px</b>` :
      d.mode === 'aspect' ? `<b>${d.w} × ${d.h} px</b> (same ratio)` :
                            `<b>at least ${d.w} × ${d.h} px</b>`;
    const cap = s.gifMB ? `max ${s.maxMB} MB (GIF ${s.gifMB} MB)` : `max ${s.maxMB} MB`;
    return `Required: ${sizeTxt} · ${cap} · ${fmtList(s.formats)}`;
  }

  /* ── async image/file check → resolves {kind:'ok'|'warn'|'err', text, w, h} ── */
  function checkImage(file, name) {
    return new Promise(resolve => {
      const s = SPECS[name];
      if (!s) return resolve({ kind: 'ok', text: '' });
      if (s.formats.indexOf(file.type) < 0)
        return resolve({ kind: 'err', text: `Unsupported file type. Use ${fmtList(s.formats)}.` });
      const MB = file.size / 1048576;
      const cap = (file.type === 'image/gif' && s.gifMB) ? s.gifMB : s.maxMB;
      if (MB > cap)
        return resolve({ kind: 'err', text: `This file is ${MB.toFixed(1)} MB — keep it under ${cap} MB so the app stays fast. Compress and re-upload.` });

      if (s.isVideo) return resolve({ kind: 'ok', text: `Looks good — ${MB.toFixed(1)} MB. Saved to draft.` });

      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const w = img.naturalWidth, h = img.naturalHeight, d = s.dim, tol = s.tol || 2;
        let r;
        if (d.mode === 'exact') {
          r = (Math.abs(w - d.w) <= tol && Math.abs(h - d.h) <= tol)
            ? { kind: 'ok', text: `Perfect — ${w} × ${h} px, ${MB.toFixed(1)} MB. Saved to draft.` }
            : { kind: 'err', text: `Wrong size: this is ${w} × ${h} px but the banner must be exactly ${d.w} × ${d.h} px. Resize/crop and re-upload.` };
        } else if (d.mode === 'square') {
          if (Math.abs(w - h) > Math.max(2, w * 0.02))
            r = { kind: 'err', text: `This image is ${w} × ${h} px — it must be square (e.g. ${d.w} × ${d.w} px) or it will crop oddly. Re-upload a square image.` };
          else if (w < d.w * 0.8)
            r = { kind: 'warn', text: `${w} × ${h} px is below the ${d.w} × ${d.h} px recommendation — may look soft. It will still work.` };
          else
            r = { kind: 'ok', text: `Looks great — ${w} × ${h} px, ${MB.toFixed(1)} MB. Saved to draft.` };
        } else if (d.mode === 'aspect') {
          const want = d.w / d.h, got = w / h;
          if (Math.abs(got - want) > 0.18)
            r = { kind: 'err', text: `Wrong shape: ${w} × ${h} px is the wrong ratio. Use ${d.w} × ${d.h} px (or the same ${want >= 1 ? 'landscape' : 'portrait'} ratio).` };
          else if (w < d.w * 0.8)
            r = { kind: 'warn', text: `${w} × ${h} px is below the ${d.w} × ${d.h} px recommendation — may look soft on big phones.` };
          else
            r = { kind: 'ok', text: `Looks great — ${w} × ${h} px, ${MB.toFixed(1)} MB. Saved to draft.` };
        } else { // 'min'
          r = (w < d.w || h < d.h)
            ? { kind: 'warn', text: `${w} × ${h} px is below the recommended ${d.w} × ${d.h} px — may look soft.` }
            : { kind: 'ok', text: `Looks great — ${w} × ${h} px, ${MB.toFixed(1)} MB. Saved to draft.` };
        }
        r.w = w; r.h = h; r.url = url; resolve(r);
      };
      img.onerror = () => resolve({ kind: 'err', text: 'That image could not be read — it may be corrupt. Try another file.' });
      img.src = url;
    });
  }

  /* ── wire ONE file input ── */
  function bindImage(inp) {
    if (inp.dataset.kkdvBound) return; inp.dataset.kkdvBound = '1';
    const name = inp.dataset.imgSpec;
    // inject hint + message slots right after the input (its container)
    const hint = document.createElement('div');
    hint.className = 'kkdv-hint'; hint.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${specHint(name)}`;
    const msg = document.createElement('div'); msg.className = 'kkdv-msg';
    inp.insertAdjacentElement('afterend', msg);
    inp.insertAdjacentElement('afterend', hint);
    inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      msg.className = 'kkdv-msg show muted'; msg.textContent = 'Checking…';
      const res = await checkImage(f, name);
      msg.className = 'kkdv-msg show ' + res.kind;
      msg.textContent = res.text;
      if (res.kind === 'err') { inp.value = ''; return; }
      // success → optional preview + callback
      const pv = inp.dataset.imgPreview && document.querySelector(inp.dataset.imgPreview);
      if (pv && res.url) {
        if (pv.tagName === 'IMG') pv.src = res.url;
        else { pv.style.backgroundImage = `url(${res.url})`; pv.style.backgroundSize = 'cover'; pv.style.backgroundPosition = 'center'; pv.textContent = ''; }
      }
      const cb = inp.dataset.imgOk && global[inp.dataset.imgOk];
      if (typeof cb === 'function') cb(inp, res);
    });
  }

  /* ── label-driven character limits ── ----------------------------------------
     Most app-facing strings live in <label>…</label><input> pairs. Rather than
     tag hundreds of inputs by hand, we keep an allow-list of label → max-chars.
     Only labels in this map get a limit, so URL / numeric / internal fields are
     never touched. A page may extend/override via  window.KKDV_TEXT_RULES.        */
  const TEXT_RULES = {
    // greetings & rotating copy
    'greeting text': 50, 'morning variant': 50, 'afternoon variant': 50, 'evening variant': 50,
    // tickers / banners / offers
    'bold label': 30, 'bold label (colored)': 30, 'body text': 80,
    // section chrome
    'section label': 20, 'section title': 40, 'section title template': 40, 'drawer title': 45, 'sub-heading': 40,
    // names / titles
    'banner name': 40, 'collection name': 40, 'theme name': 40,
    'name': 40, 'name (hi)': 25, 'name (en)': 25, 'title': 50, 'title (hi)': 40, 'title (en)': 40,
    'farmer name': 30, 'crop': 20, 'location': 25, 'segment': 20,
    // long-form
    'caption': 90, 'caption / quote': 90, 'quote': 140, 'description': 180, 'greeting': 200, 'body': 110,
    // labels / badges / buttons
    'button label': 20, 'cta button text': 22, 'tap button': 16, 'track button': 18,
    'view cart label': 18, 'item label': 14, 'savings prefix': 14, 'savings / accent label': 16,
    'see all label': 14, '"see all" label': 14, 'reward': 14, 'badge label': 30, 'status label': 20,
    'eta template': 50, 'coins label': 26, 'sub-label': 30, 'placeholder': 42, 'widget title': 46,
    'status label template': 40, '"ordered on" prefix': 16, 'coins balance label': 26,
  };
  function normLabel(s) { return String(s || '').trim().toLowerCase().replace(/[:：]\s*$/, '').replace(/\s+/g, ' '); }
  function labelFor(inp) {
    // nearest preceding <label> within the same field group
    let p = inp.previousElementSibling;
    while (p) { if (p.tagName === 'LABEL') return p.textContent; p = p.previousElementSibling; }
    const box = inp.closest('.fg, .field, .li-body'); const l = box && box.querySelector('label');
    return l ? l.textContent : '';
  }
  function ruleMax(inp) {
    const rules = Object.assign({}, TEXT_RULES, global.KKDV_TEXT_RULES || {});
    return rules[normLabel(labelFor(inp))] || 0;
  }

  /* ── wire ONE text input / textarea ── */
  function bindText(inp) {
    if (inp.dataset.kkdvBound) return; inp.dataset.kkdvBound = '1';
    const max = parseInt(inp.dataset.maxlen, 10); if (!max) return;
    const c = document.createElement('div'); c.className = 'kkdv-counter';
    inp.insertAdjacentElement('afterend', c);
    const upd = () => {
      const n = (inp.value || '').length, over = n - max;
      c.textContent = over > 0 ? `${n} / ${max} · ${over} over` : `${n} / ${max}`;
      c.className = 'kkdv-counter' + (over > 0 ? ' over' : (n >= max * 0.85 ? ' warn' : ''));
      inp.classList.toggle('kkdv-bad', over > 0);
      if (over > 0 && !c.dataset.warned) { c.dataset.warned = '1'; }
      c.title = over > 0 ? `${over} characters over — this may clip or wrap in the app and break the layout.` : '';
    };
    inp.addEventListener('input', upd); upd();
  }

  /* ── scan a subtree and bind anything new ── */
  function scan(root) {
    root = root || document;
    root.querySelectorAll('input[type=file][data-img-spec]:not([data-kkdv-bound])').forEach(bindImage);
    // explicit data-maxlen
    root.querySelectorAll('[data-maxlen]:not([data-kkdv-bound])').forEach(bindText);
    // implicit, label-driven limits on free-text fields (skip url/number/date/etc.)
    root.querySelectorAll('input[type=text]:not([data-kkdv-seen]):not([data-maxlen]), textarea:not([data-kkdv-seen]):not([data-maxlen]), input:not([type]):not([data-kkdv-seen]):not([data-maxlen])').forEach(inp => {
      inp.dataset.kkdvSeen = '1';
      const m = ruleMax(inp); if (m) { inp.dataset.maxlen = m; bindText(inp); }
    });
    // fill any standalone spec hints: <span data-img-hint="banner"></span>
    (root || document).querySelectorAll('[data-img-hint]:not([data-kkdv-bound])').forEach(el => {
      el.dataset.kkdvBound = '1'; el.classList.add('kkdv-hint');
      el.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${specHint(el.dataset.imgHint)}`;
    });
  }

  /* ── styles (injected once, so every page gets them without editing CSS) ── */
  function injectCSS() {
    if (document.getElementById('kkdv-css')) return;
    const s = document.createElement('style'); s.id = 'kkdv-css';
    s.textContent = `
    .kkdv-hint{font-size:11.5px;color:#6B7280;background:#F9FAFB;border:1px dashed #D1D5DB;border-radius:7px;padding:5px 9px;margin-top:6px;line-height:1.45;}
    .kkdv-hint i{color:#258046;margin-right:4px;}
    .kkdv-hint b{color:#374151;font-weight:700;}
    .kkdv-msg{display:none;font-size:12px;font-weight:600;border-radius:7px;padding:6px 9px;margin-top:6px;line-height:1.4;}
    .kkdv-msg.show{display:block;}
    .kkdv-msg.muted{background:#F3F4F6;color:#6B7280;}
    .kkdv-msg.ok{background:#ECFDF5;color:#258046;border:1px solid #A7F3D0;}
    .kkdv-msg.warn{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A;}
    .kkdv-msg.err{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;}
    .kkdv-counter{font-size:10.5px;color:#9CA3AF;margin-top:3px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}
    .kkdv-counter.warn{color:#D97706;}
    .kkdv-counter.over{color:#DC2626;}
    input.kkdv-bad,textarea.kkdv-bad{border-color:#DC2626 !important;box-shadow:0 0 0 3px rgba(220,38,38,.08) !important;}`;
    document.head.appendChild(s);
  }

  /* ── boot: initial scan + observe future DOM (editors render lazily) ── */
  function boot() {
    injectCSS(); scan(document);
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return; queued = true;
      requestAnimationFrame(() => { queued = false; scan(document); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.KKDV = { SPECS, specHint, checkImage, scan, bindImage, bindText };
})(window);
