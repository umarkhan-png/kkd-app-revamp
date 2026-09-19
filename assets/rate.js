/* KKD · shared Rate & Review sheet (same form as the Orders page "Rate your products" sheet, for ONE product)
   Usage: window.kkdRate({ name, img, size, order, rating, onSubmit(coins, rating) })
   - opens after a star tap on the page; the page must NOT fill its stars until onSubmit fires
   - coins = 25 per rating + 25 for a testimonial (same as Orders)
   Self-injects CSS + markup once; needs celebrate.js for the celebration (optional). */
(function () {
  if (window.kkdRate) return;

  var CSS = '' +
    '.kr-sheet-bd{position:absolute;inset:0;background:rgba(15,23,42,0.55);opacity:0;transition:opacity .25s ease}' +
    '.kr-sheet{position:absolute;left:0;right:0;bottom:0;background:#FFFFFF;border-radius:24px 24px 0 0;box-shadow:0 -8px 32px rgba(0,0,0,0.18);transform:translateY(calc(100% + 60px));transition:transform .3s cubic-bezier(.32,.72,0,1);max-height:88vh;display:flex;flex-direction:column}' +
    '.kr-handle{width:40px;height:4px;border-radius:999px;background:#E2E8F0;margin:10px auto 0;flex-shrink:0}' +
    '.kr-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 20px 8px;flex-shrink:0}' +
    '.kr-title{font-size:17px;font-weight:700;color:#0F172A;line-height:1.25}' +
    '.kr-sub{font-size:11.5px;font-weight:600;color:#64748B;line-height:1.25}' +
    '.kr-sub b{font-weight:700;color:#0F172A}' +
    '.kr-close{width:36px;height:36px;border-radius:9999px;background:#F1F5F9;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}' +
    '.kr-body{padding:0 20px;overflow-y:auto;flex:1}' +
    '.kr-item{padding:14px 0}' +
    '.kr-item-head{display:flex;align-items:center;gap:10px}' +
    '.kr-item-img{width:44px;height:44px;border-radius:10px;background:#F8FAFC;border:1px solid #E5E7EB;display:flex;align-items:center;justify-content:center;padding:5px;flex-shrink:0}' +
    '.kr-item-img img{max-width:100%;max-height:100%;object-fit:contain;mix-blend-mode:multiply}' +
    '.kr-item-name{font-size:13.5px;font-weight:800;color:#0F172A;line-height:1.2}' +
    '.kr-item-size{font-size:11px;color:#94A3B8;margin-top:1px}' +
    '.kr-stars{display:flex;gap:8px;margin-top:10px}' +
    '.kr-stars .kr-star{background:transparent;border:0;padding:0;cursor:pointer;font-size:22px;color:#CBD5E1;transition:transform .12s ease,color .15s ease}' +
    '.kr-stars .kr-star.on{color:#F59E0B}' +
    '.kr-stars .kr-star:active{transform:scale(.85)}' +
    '.kr-review{display:none;margin-top:10px;width:100%;min-height:58px;padding:10px 12px;border-radius:10px;border:1px solid #E5E7EB;background:#FAFAFA;font-size:12.5px;font-family:inherit;color:#0F172A;outline:none;resize:none;box-sizing:border-box}' +
    '.kr-item.rated .kr-review{display:block}' +
    '.kr-attach{display:none;align-items:center;gap:7px;margin-top:8px;height:38px;padding:0 14px;border-radius:10px;border:1.5px dashed #CBD5E1;background:#FFFFFF;color:#475569;font-size:12px;font-weight:700;cursor:pointer}' +
    '.kr-item.rated .kr-attach{display:inline-flex}' +
    '.kr-attach i{color:#258046;font-size:13px}' +
    '.kr-attach-info{display:none;font-size:11px;font-weight:700;color:#258046;margin-top:6px}' +
    '.kr-attach-info i{font-size:10px}' +
    '.kr-testi{display:none;margin-top:10px;border:1px solid #E5E7EB;border-radius:14px;padding:13px;background:#F8FAFC}' +
    '.kr-item.rated .kr-testi{display:block}' +
    '.kr-testi-h{font-size:13.5px;font-weight:800;color:#0F172A;display:flex;align-items:center;gap:7px}' +
    '.kr-testi-coin{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;color:#78350F;background:linear-gradient(135deg,#FBBF24,#F59E0B);padding:3px 8px;border-radius:9999px}' +
    '.kr-testi-coin i{font-size:9px}' +
    '.kr-testi-sub{font-size:11px;color:#64748B;margin-top:3px;line-height:1.35}' +
    '.kr-upload{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;margin-top:11px;min-height:84px;border:1.5px dashed #A7F3D0;border-radius:12px;background:#FFFFFF;color:#258046;font-size:12.5px;font-weight:700;cursor:pointer;text-align:center;padding:12px}' +
    '.kr-upload i{font-size:22px}' +
    '.kr-upload.has{border-style:solid;border-color:#258046;background:#ECFDF5}' +
    '.kr-foot{flex-shrink:0;padding:12px 20px calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid #F1F5F9}' +
    '.kr-submit{width:100%;height:52px;border-radius:12px;font-size:15px;font-weight:600;background:#258046;color:#FFFFFF;border:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 20px -6px rgba(5,150,105,0.45);cursor:pointer;font-family:inherit}' +
    '.kr-submit:disabled{opacity:.55}' +
    '.kr-ok{position:fixed;inset:0;z-index:330;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,0.5);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}' +
    '.kr-ok.show{display:flex}' +
    '.kr-ok-card{background:#FFFFFF;border-radius:18px;padding:24px 28px;text-align:center;width:250px;box-shadow:0 24px 60px -10px rgba(15,23,42,0.35);transform:scale(.9);opacity:0;animation:krOkIn .42s cubic-bezier(.34,1.56,.64,1) forwards}' +
    '@keyframes krOkIn{to{transform:scale(1);opacity:1}}' +
    '.kr-ok-coin{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#FBBF24,#F59E0B);color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:27px;margin:0 auto;box-shadow:0 10px 24px -6px rgba(245,158,11,0.5);animation:krCoinPop .6s ease-out .12s both}' +
    '@keyframes krCoinPop{0%{transform:scale(0) rotate(-18deg)}60%{transform:scale(1.14) rotate(7deg)}100%{transform:scale(1) rotate(0)}}' +
    '.kr-ok-title{font-size:16px;font-weight:900;color:#0F172A;margin-top:14px}' +
    '.kr-ok-sub{font-size:12.5px;color:#64748B;margin-top:4px;line-height:1.35}' +
    '.kr-ok-sub b{color:#B45309}' +
    '.kr-cropov{position:fixed;inset:0;z-index:340;display:none}' +
    '.kr-cropov .bd{position:absolute;inset:0;background:rgba(15,23,42,0.55);opacity:0;transition:opacity .25s ease}' +
    '.kr-cropov .pnl{position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:24px 24px 0 0;display:flex;flex-direction:column;max-height:78vh;transform:translateY(100%);transition:transform .3s cubic-bezier(.32,.72,0,1);box-shadow:0 -10px 32px rgba(0,0,0,0.18)}' +
    '.kr-crop-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:12px 20px;overflow-y:auto;flex:1}' +
    '.kr-crop-tile{position:relative;display:flex;flex-direction:column;align-items:center;padding:12px;border-radius:12px;background:#fff;border:2px solid #E2E8F0;cursor:pointer;font-family:inherit}' +
    '.kr-crop-tile.on{border-color:#258046;background:#ECFDF5}' +
    '.kr-crop-tile .ci{width:56px;height:56px;border-radius:9999px;overflow:hidden;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:28px;background:#F1F5F9}' +
    '.kr-crop-tile .ci img{width:100%;height:100%;object-fit:cover}' +
    '.kr-crop-tile .cl{font-size:12px;font-weight:700;color:#0F172A}' +
    '.kr-crop-chk{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:9999px;background:#258046;color:#fff;display:none;align-items:center;justify-content:center;font-size:9px}' +
    '.kr-crop-tile.on .kr-crop-chk{display:flex}' +
    /* Home "Shop by Crop" inline tile picker (replaces the old select-crop trigger) */
    '.kr-item .kr-sbc{display:none}.kr-item.rated .kr-sbc{display:block}' +
    '.kr-sbc{margin-top:16px;background:#ECFDF5;border:1px solid #BBF7D0;border-radius:12px;padding:10px 0}' +
    '.kr-sbc-h{font-size:12.5px;font-weight:800;color:#0F172A;padding:0 12px 8px}' +
    '.kr-sbc-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}' +
    '.kr-sbc-scroll::-webkit-scrollbar{display:none}' +
    '.kr-crop-picker{display:flex;gap:8px;padding:2px 12px;min-width:max-content}' +
    /* tile width tracks the viewport so ~3.9 show (4th ~10% cut) — stays narrow on phones, wider on large screens */
    '.kr-crop-picker > button{flex:0 0 auto;width:calc((100vw - 74px) / 3.9)}';

  var MARKUP = '' +
    '<div class="kr-sheet-bd"></div>' +
    '<div class="kr-sheet">' +
      '<div class="kr-handle"></div>' +
      '<div class="kr-head">' +
        '<div><div class="kr-title">Rate your product</div><div class="kr-sub"></div></div>' +
        '<button class="kr-close"><i class="fa-solid fa-xmark" style="font-size:13px;color:#475569"></i></button>' +
      '</div>' +
      '<div class="kr-body">' +
        '<div class="kr-item">' +
          '<div class="kr-item-head"><div class="kr-item-img"><img class="kr-img" src="" alt=""/></div><div><div class="kr-item-name kr-name">product</div><div class="kr-item-size"></div></div></div>' +
          '<div class="kr-stars">' +
            '<button class="kr-star" data-v="1"><i class="fa-solid fa-star"></i></button><button class="kr-star" data-v="2"><i class="fa-solid fa-star"></i></button><button class="kr-star" data-v="3"><i class="fa-solid fa-star"></i></button><button class="kr-star" data-v="4"><i class="fa-solid fa-star"></i></button><button class="kr-star" data-v="5"><i class="fa-solid fa-star"></i></button>' +
          '</div>' +
          '<textarea class="kr-review" placeholder="Write a review (optional)…"></textarea>' +
          '<div class="kr-sbc">' +
            '<div class="kr-sbc-h">Select crop</div>' +
            '<div class="kr-sbc-scroll"><div class="kr-crop-picker"></div></div>' +
          '</div>' +
          '<label class="kr-attach"><i class="fa-solid fa-camera"></i> Add photo / video<input class="kr-media" type="file" accept="image/*,video/*" capture="environment" multiple style="display:none"/></label>' +
          '<div class="kr-attach-info"></div>' +
          '<div class="kr-testi">' +
            '<div class="kr-testi-h"><i class="fa-solid fa-bullhorn" style="color:#258046"></i> Share a testimonial <span class="kr-testi-coin"><i class="fa-solid fa-coins"></i> +25</span></div>' +
            '<div class="kr-testi-sub">Upload a short photo or video for this product</div>' +
            '<label class="kr-upload kr-testibox"><i class="fa-solid fa-cloud-arrow-up"></i><span class="kr-testilabel">Upload photo / video testimonial</span><input class="kr-testi-input" type="file" accept="image/*,video/*" style="display:none"/></label>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="kr-foot"><button class="kr-submit"><i class="fa-solid fa-paper-plane" style="font-size:13px"></i> Submit</button></div>' +
    '</div>';
  var OK_MARKUP = '<div class="kr-ok-card"><div class="kr-ok-coin"><i class="fa-solid fa-coins"></i></div><div class="kr-ok-title">Thanks for rating!</div><div class="kr-ok-sub"></div></div>';

  var ov, bg, pnl, stars, nameEl, imgEl, sizeEl, subEl, itemEl, textEl, media, mediaInfo, testi, testiBox, testiLabel, submit, okEl, cropGrid, renderInline;
  var rating = 0, testiUp = false, onSubmit = null, krCrops = null;
  var CROP_OV = '' +
    '<div class="bd"></div>' +
    '<div class="pnl">' +
      '<div style="flex-shrink:0;padding:12px 20px 4px">' +
        '<div style="margin:0 auto 12px;width:40px;height:4px;border-radius:9999px;background:#E2E8F0"></div>' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between">' +
          '<div><div style="font-size:17px;font-weight:800;color:#0F172A">All Crops</div><div style="font-size:11.5px;color:#64748B;margin-top:2px">Tap all crops you grow</div></div>' +
          '<button class="kr-crop-x" style="width:36px;height:36px;border-radius:50%;background:#F1F5F9;border:0;cursor:pointer"><i class="fa-solid fa-xmark" style="font-size:13px;color:#475569"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="kr-crop-grid"></div>' +
      '<div style="flex-shrink:0;padding:12px 20px;border-top:1px solid #F1F5F9;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 12px)"><button class="kr-crop-done" style="width:100%;height:48px;border-radius:12px;background:#258046;color:#fff;font-size:14px;font-weight:800;border:0;cursor:pointer">Done</button></div>' +
    '</div>';
  // EXACT same crop catalog + local images as the homepage "All Crops" modal
  var CROP_IMG = '../assets/crops/';
  var CROP_META = window.kkdCropMeta();   // DB crop list (assets/crops-db.js)
  var CROPMAP = CROP_META;
  if (!window.cropFallback) { window.cropFallback = function (img, emoji, size) { img.outerHTML = '<div class="w-full h-full flex items-center justify-center" style="font-size:' + (size || 32) + 'px;line-height:1">' + emoji + '</div>'; }; }

  function setStars(v) { rating = v; stars.forEach(function (s, i) { s.classList.toggle('on', i < v); }); itemEl.classList.toggle('rated', v > 0); syncSubmit(); }
  // Same rule as Orders: a star rating OR a testimonial is enough to submit
  function syncSubmit() { submit.disabled = !(rating > 0 || testiUp); }
  function close() { bg.style.opacity = '0'; pnl.style.transform = 'translateY(calc(100% + 60px))'; setTimeout(function () { ov.style.display = 'none'; }, 280); }

  function mount() {
    if (!document.getElementById('kkdRateCSS')) {
      var s = document.createElement('style'); s.id = 'kkdRateCSS'; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    ov = document.getElementById('kkdRateBd');
    if (ov) return ov;
    ov = document.createElement('div'); ov.id = 'kkdRateBd';
    ov.style.cssText = 'position:fixed;inset:0;z-index:320;display:none';
    ov.innerHTML = MARKUP;
    document.body.appendChild(ov);
    bg = ov.querySelector('.kr-sheet-bd'); pnl = ov.querySelector('.kr-sheet');
    stars = Array.prototype.slice.call(ov.querySelectorAll('.kr-star'));
    nameEl = ov.querySelector('.kr-name'); imgEl = ov.querySelector('.kr-img'); sizeEl = ov.querySelector('.kr-item-size'); subEl = ov.querySelector('.kr-sub'); itemEl = ov.querySelector('.kr-item');
    okEl = document.createElement('div'); okEl.className = 'kr-ok'; okEl.innerHTML = OK_MARKUP; document.body.appendChild(okEl);
    textEl = ov.querySelector('.kr-review'); media = ov.querySelector('.kr-media'); mediaInfo = ov.querySelector('.kr-attach-info');
    testi = ov.querySelector('.kr-testi-input'); testiBox = ov.querySelector('.kr-testibox'); testiLabel = ov.querySelector('.kr-testilabel');
    submit = ov.querySelector('.kr-submit');
    // Select crop · home "Shop by Crop" inline tile picker · multi-select · "All crops" tile opens the full-catalog sheet
    krCrops = new Set();
    var cropPicker = ov.querySelector('.kr-crop-picker');
    var cropOv = document.createElement('div'); cropOv.className = 'kr-cropov'; cropOv.innerHTML = CROP_OV;
    document.body.appendChild(cropOv);
    var cbg = cropOv.querySelector('.bd'), cpnl = cropOv.querySelector('.pnl');
    cropGrid = cropOv.querySelector('.kr-crop-grid');
    var cropTemp = new Set();
    var INLINE_COUNT = 8;
    // Render the grid EXACTLY like the homepage All-Crops sheet (120px card · 90px image area + emoji fallback · check tick)
    function renderGrid() {
      cropGrid.innerHTML = Object.keys(CROP_META).map(function (key) {
        var m = CROP_META[key]; var sel = cropTemp.has(key);
        var borderColor = sel ? '#258046' : '#E5E7EB';
        var shadow = sel ? '0 6px 14px -4px rgba(5,150,105,0.32)' : '0 1px 3px rgba(0,0,0,0.05)';
        var labelColor = sel ? '#258046' : '#0F172A';
        var tick = sel
          ? '<span class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style="background:#258046;box-shadow:0 2px 6px rgba(5,150,105,0.5);border:1.5px solid #fff;z-index:2"><i class="fa-solid fa-check text-white text-[9px]"></i></span>'
          : '<span class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full" style="background:rgba(255,255,255,0.95);border:1.5px solid #CBD5E1;box-shadow:0 1px 3px rgba(15,23,42,0.18);z-index:2"></span>';
        return '<button type="button" data-k="' + key + '" class="rounded-xl overflow-hidden transition-all" style="background:#FFFFFF;border:1.5px solid ' + borderColor + ';box-shadow:' + shadow + ';height:120px;display:flex;flex-direction:column">'
          + '<div class="relative w-full" style="height:90px;background:' + m.bg + ';overflow:hidden;flex-shrink:0">'
          + '<img src="' + m.img + '" class="w-full h-full object-cover" style="display:block" onerror="cropFallback(this,\'' + m.emoji + '\',38)"/>'
          + tick + '</div>'
          + '<div class="flex-1 flex items-center justify-center px-1"><span class="text-[12.5px] font-semibold leading-none" style="color:' + labelColor + '">' + m.label + '</span></div>'
          + '</button>';
      }).join('');
      cropGrid.querySelectorAll('[data-k]').forEach(function (btn) {
        btn.addEventListener('click', function () { var k = btn.dataset.k; if (cropTemp.has(k)) cropTemp.delete(k); else cropTemp.add(k); renderGrid(); });
      });
    }
    function closeCrop() { cbg.style.opacity = '0'; cpnl.style.transform = 'translateY(100%)'; setTimeout(function () { cropOv.style.display = 'none'; }, 280); }
    function openCropSheet() { cropTemp = new Set(krCrops); renderGrid(); cropOv.style.display = 'block'; requestAnimationFrame(function () { cbg.style.opacity = '1'; cpnl.style.transform = 'translateY(0)'; }); }
    // Inline tile picker · copied 1:1 from the home "Shop by Crop" strip (84x100 tile · 78px photo · ✓ tick · selected = green · "All crops" tile)
    function renderInlinePicker() {
      if (!cropPicker) return;
      var allKeys = Object.keys(CROP_META).slice().sort(function (a, b) { return (krCrops.has(b) ? 1 : 0) - (krCrops.has(a) ? 1 : 0); });
      var chips = allKeys.slice(0, INLINE_COUNT).map(function (key) {
        var m = CROP_META[key]; var sel = krCrops.has(key);
        var borderColor = sel ? '#258046' : '#E5E7EB';
        var tileBg = sel ? '#258046' : '#FFFFFF';
        var shadow = sel ? '0 8px 18px -4px rgba(5,150,105,0.4)' : '0 1px 3px rgba(0,0,0,0.05)';
        var labelColor = sel ? '#FFFFFF' : '#0F172A';
        var tick = sel
          ? '<span class="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style="background:#258046;box-shadow:0 2px 6px rgba(5,150,105,0.5);border:1.5px solid #fff;z-index:2"><i class="fa-solid fa-check text-white text-[9px]"></i></span>'
          : '<span class="absolute top-1 right-1 w-5 h-5 rounded-full" style="background:rgba(255,255,255,0.95);border:1.5px solid #CBD5E1;box-shadow:0 1px 3px rgba(15,23,42,0.18);z-index:2"></span>';
        return '<button type="button" data-crop-key="' + key + '" class="flex-shrink-0 rounded-xl overflow-hidden transition-all" style="background:' + tileBg + ';border:1.5px solid ' + borderColor + ';box-shadow:' + shadow + ';height:100px;display:flex;flex-direction:column">'
          + '<div class="relative w-full" style="height:78px;background:' + m.bg + ';overflow:hidden;flex-shrink:0">'
          + '<img src="' + m.img + '" class="w-full h-full object-cover" style="display:block" onerror="cropFallback(this,\'' + m.emoji + '\',34)"/>'
          + tick + '</div>'
          + '<div class="flex-1 flex items-center justify-center px-1" style="background:' + tileBg + '"><span class="text-[11.5px] font-semibold leading-none whitespace-nowrap" style="color:' + labelColor + '">' + m.label + '</span></div>'
          + '</button>';
      }).join('');
      var moreChip = '<button type="button" data-crop-more class="flex-shrink-0 rounded-xl overflow-hidden transition-all" style="background:#FFFFFF;border:1.5px solid #E5E7EB;height:100px;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(0,0,0,0.05)">'
        + '<div class="w-full flex items-center justify-center" style="height:78px;background:#ECFDF5;flex-shrink:0"><div class="rounded-full flex items-center justify-center" style="width:40px;height:40px;background:#258046;box-shadow:0 4px 10px -2px rgba(5,150,105,0.45)"><i class="fa-solid fa-plus text-[16px]" style="color:#FFFFFF"></i></div></div>'
        + '<div class="flex-1 flex items-center justify-center px-1" style="background:#FFFFFF"><span class="text-[11.5px] font-semibold leading-none whitespace-nowrap" style="color:#0F172A">All crops</span></div>'
        + '</button>';
      cropPicker.innerHTML = chips + moreChip;
      cropPicker.querySelectorAll('[data-crop-key]').forEach(function (btn) {
        btn.addEventListener('click', function () { var k = btn.getAttribute('data-crop-key'); if (krCrops.has(k)) krCrops.delete(k); else krCrops.add(k); renderInlinePicker(); });
      });
      var moreBtn = cropPicker.querySelector('[data-crop-more]');
      if (moreBtn) moreBtn.addEventListener('click', openCropSheet);
    }
    renderInline = renderInlinePicker;
    cbg.addEventListener('click', closeCrop);
    cropOv.querySelector('.kr-crop-x').addEventListener('click', closeCrop);
    cropOv.querySelector('.kr-crop-done').addEventListener('click', function () { krCrops = new Set(cropTemp); renderInlinePicker(); closeCrop(); });
    renderInlinePicker();
    stars.forEach(function (s) { s.addEventListener('click', function () { setStars(parseInt(s.dataset.v, 10)); }); });
    media.addEventListener('change', function () { var n = media.files ? media.files.length : 0; if (n) { mediaInfo.style.display = 'block'; mediaInfo.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + n + ' file' + (n > 1 ? 's' : '') + ' attached'; } else mediaInfo.style.display = 'none'; });
    testi.addEventListener('change', function () { testiUp = !!(testi.files && testi.files.length); if (testiUp) { testiBox.classList.add('has'); testiLabel.innerHTML = '<i class="fa-solid fa-circle-check"></i> Testimonial added'; } else { testiBox.classList.remove('has'); testiLabel.textContent = 'Upload photo / video testimonial'; } syncSubmit(); });
    ov.querySelector('.kr-close').addEventListener('click', close);
    bg.addEventListener('click', close);
    submit.addEventListener('click', function () {
      if (submit.disabled) return;
      var coins = (rating > 0 ? 25 : 0) + (testiUp ? 25 : 0);   // same as Orders: 25 per rating + 25 per testimonial
      var r = rating || 5, cb = onSubmit;
      // Persist the user's own review so they can see it (badged "Pending") on the PDP before admin approval
      try {
        var arr = JSON.parse(localStorage.getItem('kkd.myReviews') || '[]') || [];
        var cropLabels = Array.prototype.slice.call(krCrops || []).map(function (k) { return (CROPMAP[k] ? CROPMAP[k].label : k); });
        arr.unshift({
          product: (nameEl && nameEl.textContent) || 'product',
          rating: r,
          text: textEl.value.trim(),
          crops: cropLabels,
          photos: (media && media.files ? media.files.length : 0) + (testiUp ? 1 : 0),
          ts: Date.now(),
          status: 'pending'
        });
        localStorage.setItem('kkd.myReviews', JSON.stringify(arr.slice(0, 20)));
      } catch (e) {}
      close();
      if (cb) cb(coins, r);   // the page fills its stars only now
      if (window.kkdCelebrate) window.kkdCelebrate(coins);
      okEl.querySelector('.kr-ok-sub').innerHTML = 'You earned <b>+' + coins + ' coins</b> · thanks for the feedback!';
      setTimeout(function () {
        okEl.classList.add('show');
        okEl.querySelectorAll('.kr-ok-card,.kr-ok-coin').forEach(function (el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
        setTimeout(function () { okEl.classList.remove('show'); }, 2300);
      }, 220);
    });
    return ov;
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  window.kkdRate = function (opts) {
    opts = opts || {};
    if (!ov) mount();
    onSubmit = opts.onSubmit || null;
    nameEl.textContent = opts.name || 'product';
    imgEl.src = opts.img || '';
    sizeEl.textContent = opts.size || ''; sizeEl.style.display = opts.size ? '' : 'none';
    subEl.innerHTML = opts.order ? 'Order <b>#' + String(opts.order).replace(/^#/, '') + '</b> · earn 25 coins per rating' : 'Earn 25 coins per rating';
    textEl.value = ''; mediaInfo.style.display = 'none'; if (media) media.value = '';
    testiUp = false; if (testi) testi.value = ''; testiBox.classList.remove('has'); testiLabel.textContent = 'Upload photo / video testimonial';
    krCrops = new Set(); if (renderInline) renderInline();
    setStars(opts.rating || 0);
    ov.style.display = 'block';
    requestAnimationFrame(function () { bg.style.opacity = '1'; pnl.style.transform = 'translateY(0)'; });
  };
})();
