/* KKD · shared "Verify genuine product" QR scanner · full-screen mock viewfinder → genuine / not-genuine result
   Usage:  window.kkdVerify()            → alternates genuine ↔ not-genuine on each scan (for the demo)
           window.kkdVerify('genuine')   → force genuine
           window.kkdVerify('fake')      → force not-genuine
   Self-injects its CSS + overlay once; safe to load on every screen. */
(function () {
  if (window.kkdVerify) return;

  var CSS = '' +
    '.qrs-ov{position:fixed;inset:0;z-index:300;background:#0B1120;display:none;flex-direction:column}' +
    '.qrs-ov.open{display:flex}' +
    '.qrs-top{display:flex;align-items:center;gap:12px;padding:16px 18px;color:#fff}' +
    '.qrs-close{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.12);border:0;color:#fff;font-size:15px;cursor:pointer}' +
    '.qrs-title{font-size:15px;font-weight:800}' +
    '.qrs-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}' +
    '.qrs-scan{display:flex;flex-direction:column;align-items:center}' +
    '.qrs-frame{position:relative;width:230px;height:230px;border-radius:22px;background:radial-gradient(circle at 50% 40%,rgba(16,185,129,0.10),rgba(255,255,255,0.03));overflow:hidden}' +
    '.qrs-ghost{position:absolute;inset:0;margin:auto;width:fit-content;height:fit-content;font-size:108px;color:rgba(255,255,255,0.10)}' +
    '.qrs-corner{position:absolute;width:34px;height:34px;border:3px solid #34D399}' +
    '.qrs-corner.tl{top:10px;left:10px;border-right:0;border-bottom:0;border-radius:10px 0 0 0}' +
    '.qrs-corner.tr{top:10px;right:10px;border-left:0;border-bottom:0;border-radius:0 10px 0 0}' +
    '.qrs-corner.bl{bottom:10px;left:10px;border-right:0;border-top:0;border-radius:0 0 0 10px}' +
    '.qrs-corner.br{bottom:10px;right:10px;border-left:0;border-top:0;border-radius:0 0 10px 0}' +
    '.qrs-laser{position:absolute;left:14px;right:14px;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,#34D399,transparent);box-shadow:0 0 12px 2px rgba(52,211,153,0.7);top:18px;animation:qrsScan 1.5s ease-in-out infinite}' +
    '@keyframes qrsScan{0%{top:18px}50%{top:208px}100%{top:18px}}' +
    '.qrs-hint{color:rgba(255,255,255,0.7);font-size:12.5px;text-align:center;max-width:240px;margin-top:22px;line-height:1.5}' +
    '.qrs-result{display:none;flex-direction:column;align-items:center;text-align:center;animation:qrsIn .4s ease}' +
    '@keyframes qrsIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}' +
    '.qrs-badge{width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,#34D399,#047857);color:#fff;display:flex;align-items:center;justify-content:center;font-size:42px;box-shadow:0 14px 34px -8px rgba(5,150,105,0.7)}' +
    '.qrs-badge.bad{background:linear-gradient(135deg,#F87171,#DC2626);box-shadow:0 14px 34px -8px rgba(220,38,38,0.6)}' +
    '.qrs-rtitle{color:#fff;font-size:19px;font-weight:900;margin-top:18px}' +
    '.qrs-rprod{font-size:14px;font-weight:700;margin-top:6px}' +
    '.qrs-rmeta{color:rgba(255,255,255,0.6);font-size:11.5px;margin-top:10px;max-width:260px;line-height:1.5}' +
    '.qrs-rmeta b{color:rgba(255,255,255,0.85)}' +
    '.qrs-done{margin-top:28px;height:48px;padding:0 44px;border-radius:12px;background:#059669;color:#fff;border:0;font-size:14.5px;font-weight:800;cursor:pointer;box-shadow:0 10px 24px -8px rgba(5,150,105,0.6)}' +
    '.qrs-fbtns{display:flex;gap:10px;margin-top:26px}' +
    '.qrs-report{height:48px;padding:0 22px;border-radius:12px;background:#DC2626;color:#fff;border:0;font-size:14px;font-weight:800;cursor:pointer}' +
    '.qrs-again{height:48px;padding:0 22px;border-radius:12px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,0.3);font-size:14px;font-weight:800;cursor:pointer}';

  var SCAN = '' +
    '<div class="qrs-frame"><span class="qrs-corner tl"></span><span class="qrs-corner tr"></span><span class="qrs-corner bl"></span><span class="qrs-corner br"></span><i class="fa-solid fa-qrcode qrs-ghost"></i><div class="qrs-laser"></div></div>' +
    '<div class="qrs-hint">Point your camera at the QR code printed on the product pack</div>';

  var OK = '' +
    '<div class="qrs-badge"><i class="fa-solid fa-circle-check"></i></div>' +
    '<div class="qrs-rtitle">Genuine Katyayani product</div>' +
    '<div class="qrs-rprod" style="color:#A7F3D0">Chakrawarti ZC · 100 ml</div>' +
    '<div class="qrs-rmeta">Batch <b>KKD-CHK-24A</b> &nbsp;·&nbsp; <i class="fa-solid fa-shield-halved"></i> Verified by Katyayani</div>' +
    '<button type="button" class="qrs-done">Done</button>';

  var BAD = '' +
    '<div class="qrs-badge bad"><i class="fa-solid fa-triangle-exclamation"></i></div>' +
    '<div class="qrs-rtitle">Couldn\'t verify this product</div>' +
    '<div class="qrs-rprod" style="color:#FCA5A5">This QR doesn\'t match Katyayani records</div>' +
    '<div class="qrs-rmeta">It may be counterfeit or tampered. Please don\'t use it — report the seller so we can act.</div>' +
    '<div class="qrs-fbtns"><button type="button" class="qrs-report"><i class="fa-solid fa-flag"></i> Report seller</button><button type="button" class="qrs-again">Scan again</button></div>';

  var MARKUP = '' +
    '<div class="qrs-top"><button type="button" class="qrs-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button><span class="qrs-title">Verify product</span></div>' +
    '<div class="qrs-body"><div class="qrs-scan">' + SCAN + '</div><div class="qrs-result"></div></div>';

  var ov, scanEl, resultEl, timer = null, count = 0;

  function close() { if (ov) ov.classList.remove('open'); if (timer) { clearTimeout(timer); timer = null; } }

  function mount() {
    if (!document.getElementById('kkdVerifyCSS')) {
      var s = document.createElement('style'); s.id = 'kkdVerifyCSS'; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    ov = document.getElementById('kkdVerifyOv');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'kkdVerifyOv'; ov.className = 'qrs-ov'; ov.innerHTML = MARKUP;
      document.body.appendChild(ov);
      ov.addEventListener('click', function (e) {
        if (e.target.closest('.qrs-close, .qrs-done, .qrs-report')) close();
        else if (e.target.closest('.qrs-again')) window.kkdVerify();
      });
    }
    scanEl = ov.querySelector('.qrs-scan');
    resultEl = ov.querySelector('.qrs-result');
    return ov;
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  window.kkdVerify = function (force) {
    if (!ov) mount();
    // default demo behaviour: alternate genuine ↔ not-genuine each scan
    var fake = force === 'fake' || (!force && (count % 2 === 1));
    count++;
    scanEl.style.display = 'flex';
    resultEl.style.display = 'none';
    resultEl.classList.remove('bad');
    ov.classList.add('open');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      scanEl.style.display = 'none';
      resultEl.innerHTML = fake ? BAD : OK;
      resultEl.style.display = 'flex';
    }, 2200);
  };
})();
