/* KKD · shared Rate & Review modal (same as the home Buy-again modal)
   Usage: window.kkdRate({ name, img, rating, onSubmit(coins, rating) })
   - stars are the rating; coins are earned for the REVIEW (+10) and/or TESTIMONIAL (+25), NOT for the stars
   - Submit enables only when a review is written OR a testimonial is added
   Self-injects CSS + markup once; needs celebrate.js for the celebration (optional). */
(function () {
  if (window.kkdRate) return;

  var CSS = '' +
    '#kkdRateStars .bar-star{font-size:32px;color:#CBD5E1;cursor:pointer;transition:transform .12s ease,color .15s ease}' +
    '#kkdRateStars .bar-star.on{color:#F59E0B}' +
    '#kkdRateStars .bar-star:active{transform:scale(.85)}' +
    '.kr-review-h{font-size:13.5px;font-weight:800;color:#0F172A;display:flex;align-items:center;gap:7px;margin-bottom:8px}' +
    '.kr-review-h span{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;color:#78350F;background:linear-gradient(135deg,#FBBF24,#F59E0B);padding:3px 8px;border-radius:9999px}' +
    '.kr-review-h span i{font-size:9px}' +
    '.kr-review{width:100%;min-height:72px;padding:11px 13px;border-radius:12px;border:1.5px solid #E5E7EB;background:#FFFFFF;font-size:13px;font-family:inherit;color:#0F172A;outline:none;resize:none;box-sizing:border-box}' +
    '.kr-review::placeholder{color:#94A3B8}' +
    '.kr-review:focus{border-color:#258046;box-shadow:0 0 0 3px rgba(5,150,105,0.1)}' +
    '.kr-attach{display:inline-flex;align-items:center;gap:7px;margin-top:10px;height:40px;padding:0 16px;border-radius:10px;border:1.5px dashed #CBD5E1;background:#FFFFFF;color:#475569;font-size:12.5px;font-weight:700;cursor:pointer}' +
    '.kr-attach i{color:#258046;font-size:13px}' +
    '.kr-attach-info{display:none;font-size:11px;font-weight:700;color:#258046;margin-top:7px}' +
    '.kr-attach-info i{font-size:10px}' +
    '.kr-testi{margin-top:14px;border:1px solid #E5E7EB;border-radius:14px;padding:13px;background:#F8FAFC}' +
    '.kr-testi-h{font-size:13.5px;font-weight:800;color:#0F172A;display:flex;align-items:center;gap:7px}' +
    '.kr-testi-h span{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;color:#78350F;background:linear-gradient(135deg,#FBBF24,#F59E0B);padding:3px 8px;border-radius:9999px}' +
    '.kr-testi-h span i{font-size:9px}' +
    '.kr-testi-sub{font-size:11px;color:#64748B;margin-top:3px;line-height:1.35}' +
    '.kr-upload{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;margin-top:11px;min-height:88px;border:1.5px dashed #A7F3D0;border-radius:12px;background:#FFFFFF;color:#258046;font-size:12.5px;font-weight:700;cursor:pointer;text-align:center;padding:12px}' +
    '.kr-upload i{font-size:22px}' +
    '.kr-upload.has{border-style:solid;border-color:#258046;background:#ECFDF5}' +
    '.kr-crop-h{font-size:13.5px;font-weight:800;color:#0F172A;margin:14px 0 8px}' +
    '.kr-crop-trigger{display:flex;align-items:center;gap:8px;width:100%;padding:11px 13px;border-radius:11px;border:1.5px solid #E5E7EB;background:#fff;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;color:#0F172A}' +
    '.kr-crop-trigger > i:first-child{color:#258046;font-size:13px}' +
    '.kr-crop-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
    '.kr-cp-chip{display:inline-flex;padding:4px 10px;border-radius:9999px;background:#ECFDF5;border:1px solid #A7F3D0;font-size:11.5px;font-weight:700;color:#0E7A4E}' +
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
    '.kr-crop-tile.on .kr-crop-chk{display:flex}';

  var MARKUP = '' +
    '<div class="kr-backdrop" style="position:absolute;inset:0;background:rgba(15,23,42,0.55);opacity:0;transition:opacity .25s ease"></div>' +
    '<div class="kr-panel" style="position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:24px 24px 0 0;display:flex;flex-direction:column;max-height:92vh;transform:translateY(100%);transition:transform .3s cubic-bezier(.32,.72,0,1);box-shadow:0 -10px 32px rgba(0,0,0,0.18)">' +
      '<div style="flex-shrink:0;padding:12px 20px 0">' +
        '<div style="margin:0 auto 12px;width:40px;height:4px;border-radius:9999px;background:#E2E8F0"></div>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#F8FAFC;border:1px solid #E5E7EB;padding:5px"><img class="kr-img" src="" style="max-height:100%;object-fit:contain"/></div>' +
          '<div style="flex:1;min-width:0;line-height:1.25"><div style="font-size:15px;font-weight:800;color:#0F172A">Rate <span class="kr-name">product</span></div><div style="font-size:11.5px;color:#64748B">Share your experience with other farmers</div></div>' +
          '<button class="kr-close" style="width:36px;height:36px;border-radius:50%;background:#F1F5F9;border:0;cursor:pointer"><i class="fa-solid fa-xmark" style="font-size:13px;color:#475569"></i></button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:8px 20px 8px;overflow-y:auto;flex:1;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 12px)">' +
        '<div id="kkdRateStars" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 0">' +
          '<span class="bar-star" data-v="1"><i class="fa-solid fa-star"></i></span><span class="bar-star" data-v="2"><i class="fa-solid fa-star"></i></span><span class="bar-star" data-v="3"><i class="fa-solid fa-star"></i></span><span class="bar-star" data-v="4"><i class="fa-solid fa-star"></i></span><span class="bar-star" data-v="5"><i class="fa-solid fa-star"></i></span>' +
        '</div>' +
        '<div class="kr-review-h">Write a review <span><i class="fa-solid fa-coins"></i> +10 coins</span></div>' +
        '<textarea class="kr-review" placeholder="Write a quick review — how did it work on your crop?"></textarea>' +
        '<label class="kr-attach"><i class="fa-solid fa-camera"></i> Add photo / video<input class="kr-media" type="file" accept="image/*,video/*" capture="environment" multiple style="display:none"/></label>' +
        '<div class="kr-attach-info"><i class="fa-solid fa-paperclip"></i> <span></span></div>' +
        '<div class="kr-crop-h">Select crop</div>' +
        '<button type="button" class="kr-crop-trigger"><i class="fa-solid fa-seedling"></i><span class="kr-crop-lbl">Select crop</span><i class="fa-solid fa-chevron-right" style="margin-left:auto;color:#94A3B8;font-size:11px"></i></button>' +
        '<div class="kr-crop-chips"></div>' +
        '<div class="kr-testi">' +
          '<div class="kr-testi-h"><i class="fa-solid fa-bullhorn" style="color:#258046"></i> Share a testimonial <span><i class="fa-solid fa-coins"></i> +25 coins</span></div>' +
          '<div class="kr-testi-sub">Upload a short photo or video to help other farmers</div>' +
          '<label class="kr-upload kr-testibox"><i class="fa-solid fa-cloud-arrow-up"></i><span class="kr-testilabel">Upload photo / video testimonial</span><input class="kr-testi-input" type="file" accept="image/*,video/*" style="display:none"/></label>' +
        '</div>' +
      '</div>' +
      '<div style="flex-shrink:0;padding:8px 20px;border-top:1px solid #F1F5F9;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 14px)">' +
        '<button class="kr-submit" disabled style="width:100%;height:50px;border-radius:12px;color:#fff;font-size:14.5px;font-weight:800;background:#258046;border:0;opacity:.55;box-shadow:0 8px 20px -6px rgba(5,150,105,0.45);cursor:pointer">Submit review</button>' +
      '</div>' +
    '</div>';

  var ov, bg, pnl, stars, nameEl, imgEl, textEl, media, mediaInfo, testi, testiBox, testiLabel, submit, cropGrid, cropChips, cropLbl;
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
  var CROP_META = {
    tomato:{label:'Tomato',emoji:'🍅',bg:'#FEE2E2'}, chilli:{label:'Chilli',emoji:'🌶',bg:'#FFEDD5'},
    wheat:{label:'Wheat',emoji:'🌾',bg:'#FEF3C7'}, maize:{label:'Maize',emoji:'🌽',bg:'#FEF9C3'},
    onion:{label:'Onion',emoji:'🧅',bg:'#FCE7F3'}, potato:{label:'Potato',emoji:'🥔',bg:'#FEF3C7'},
    sugarcane:{label:'Sugarcane',emoji:'🎋',bg:'#DCFCE7'}, banana:{label:'Banana',emoji:'🍌',bg:'#FEF9C3'},
    mango:{label:'Mango',emoji:'🥭',bg:'#FED7AA'}, grapes:{label:'Grapes',emoji:'🍇',bg:'#F3E8FF'},
    orange:{label:'Orange',emoji:'🍊',bg:'#FFEDD5'}, watermelon:{label:'Watermelon',emoji:'🍉',bg:'#FECACA'},
    papaya:{label:'Papaya',emoji:'🥭',bg:'#FED7AA'}, pomegranate:{label:'Pomegranate',emoji:'🍎',bg:'#FEE2E2'},
    brinjal:{label:'Brinjal',emoji:'🍆',bg:'#EDE9FE'}, cauliflower:{label:'Cauliflower',emoji:'🥦',bg:'#FEF3C7'},
    cabbage:{label:'Cabbage',emoji:'🥬',bg:'#DCFCE7'}, okra:{label:'Okra',emoji:'🌿',bg:'#DCFCE7'},
    garlic:{label:'Garlic',emoji:'🧄',bg:'#F5F5F4'}, cumin:{label:'Cumin',emoji:'🌱',bg:'#FEF3C7'},
    cardamom:{label:'Cardamom',emoji:'🌿',bg:'#D1FAE5'}, chickpea:{label:'Chickpea',emoji:'🫘',bg:'#FEF3C7'},
    soyabean:{label:'Soyabean',emoji:'🫘',bg:'#DCFCE7'}, blackgram:{label:'Black Gram',emoji:'🫘',bg:'#E5E7EB'}
  };
  Object.keys(CROP_META).forEach(function (k) { CROP_META[k].img = CROP_IMG + k + '.jpg'; });
  var CROPMAP = CROP_META;
  if (!window.cropFallback) { window.cropFallback = function (img, emoji, size) { img.outerHTML = '<div class="w-full h-full flex items-center justify-center" style="font-size:' + (size || 32) + 'px;line-height:1">' + emoji + '</div>'; }; }

  function setStars(v) { rating = v; stars.forEach(function (s, i) { s.classList.toggle('on', i < v); }); }
  function syncSubmit() { var ok = (textEl.value.trim().length > 0) || testiUp; submit.disabled = !ok; submit.style.opacity = ok ? '1' : '.55'; }
  function close() { bg.style.opacity = '0'; pnl.style.transform = 'translateY(100%)'; setTimeout(function () { ov.style.display = 'none'; }, 280); }

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
    bg = ov.querySelector('.kr-backdrop'); pnl = ov.querySelector('.kr-panel');
    stars = Array.prototype.slice.call(ov.querySelectorAll('#kkdRateStars .bar-star'));
    nameEl = ov.querySelector('.kr-name'); imgEl = ov.querySelector('.kr-img');
    textEl = ov.querySelector('.kr-review'); media = ov.querySelector('.kr-media'); mediaInfo = ov.querySelector('.kr-attach-info');
    testi = ov.querySelector('.kr-testi-input'); testiBox = ov.querySelector('.kr-testibox'); testiLabel = ov.querySelector('.kr-testilabel');
    submit = ov.querySelector('.kr-submit');
    // Select crop · trigger opens an "All Crops" bottom sheet (same as the home All-Crops modal) · multi-select
    krCrops = new Set();
    cropChips = ov.querySelector('.kr-crop-chips');
    cropLbl = ov.querySelector('.kr-crop-lbl');
    var cropTrigger = ov.querySelector('.kr-crop-trigger');
    var cropOv = document.createElement('div'); cropOv.className = 'kr-cropov'; cropOv.innerHTML = CROP_OV;
    document.body.appendChild(cropOv);
    var cbg = cropOv.querySelector('.bd'), cpnl = cropOv.querySelector('.pnl');
    cropGrid = cropOv.querySelector('.kr-crop-grid');
    var cropTemp = new Set();
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
    function renderCropChips() {
      var arr = Array.prototype.slice.call(krCrops);
      if (cropChips) cropChips.innerHTML = arr.map(function (k) { return '<span class="kr-cp-chip">' + (CROPMAP[k] ? CROPMAP[k].label : k) + '</span>'; }).join('');
      if (cropLbl) cropLbl.textContent = arr.length ? 'Edit crops (' + arr.length + ')' : 'Select crop';
    }
    function closeCrop() { cbg.style.opacity = '0'; cpnl.style.transform = 'translateY(100%)'; setTimeout(function () { cropOv.style.display = 'none'; }, 280); }
    cropTrigger.addEventListener('click', function () { cropTemp = new Set(krCrops); renderGrid(); cropOv.style.display = 'block'; requestAnimationFrame(function () { cbg.style.opacity = '1'; cpnl.style.transform = 'translateY(0)'; }); });
    cbg.addEventListener('click', closeCrop);
    cropOv.querySelector('.kr-crop-x').addEventListener('click', closeCrop);
    cropOv.querySelector('.kr-crop-done').addEventListener('click', function () { krCrops = new Set(cropTemp); renderCropChips(); closeCrop(); });
    stars.forEach(function (s) { s.addEventListener('click', function () { setStars(parseInt(s.dataset.v, 10)); }); });
    textEl.addEventListener('input', syncSubmit);
    media.addEventListener('change', function () { var n = media.files ? media.files.length : 0; if (n) { mediaInfo.style.display = 'block'; mediaInfo.querySelector('span').textContent = n + ' file' + (n > 1 ? 's' : '') + ' attached'; } else mediaInfo.style.display = 'none'; });
    testi.addEventListener('change', function () { testiUp = !!(testi.files && testi.files.length); if (testiUp) { testiBox.classList.add('has'); testiLabel.innerHTML = '<i class="fa-solid fa-circle-check"></i> Testimonial added'; } else { testiBox.classList.remove('has'); testiLabel.textContent = 'Upload photo / video testimonial'; } syncSubmit(); });
    ov.querySelector('.kr-close').addEventListener('click', close);
    bg.addEventListener('click', close);
    submit.addEventListener('click', function () {
      if (submit.disabled) return;
      var coins = (textEl.value.trim().length > 0 ? 10 : 0) + (testiUp ? 25 : 0);
      var r = rating || 5, cb = onSubmit;
      close();
      setTimeout(function () { if (window.kkdCelebrate) window.kkdCelebrate(coins); if (cb) cb(coins, r); }, 300);
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
    setStars(opts.rating || 0);
    textEl.value = ''; mediaInfo.style.display = 'none'; if (media) media.value = '';
    testiUp = false; if (testi) testi.value = ''; testiBox.classList.remove('has'); testiLabel.textContent = 'Upload photo / video testimonial';
    krCrops = new Set(); if (cropChips) cropChips.innerHTML = ''; if (cropLbl) cropLbl.textContent = 'Select crop';
    syncSubmit();
    ov.style.display = 'block';
    requestAnimationFrame(function () { bg.style.opacity = '1'; pnl.style.transform = 'translateY(0)'; });
  };
})();
