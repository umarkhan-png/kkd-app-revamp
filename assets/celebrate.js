/* KKD · shared reward celebration · full-screen immersive emerald-glow reward
   Usage:  window.kkdCelebrate(amount)                          → "Thank you! 🎉" + "You earned +amount coins"
           window.kkdCelebrate(amount, {title})                 → custom headline
           window.kkdCelebrate(150, {prefix:'₹', unit:''})      → "You earned ₹150" (e.g. cash/scratch prize)
           window.kkdCelebrate(100, {title:'Coupon applied! 🎉', lead:'You saved', prefix:'₹', unit:'', icon:'fa-tag'})
   opts: { title, prefix='+', unit='coins', lead='You earned', icon='fa-coins' }
   Self-injects its CSS + overlay markup once; safe to load on every screen. */
(function () {
  if (window.kkdCelebrate) return;

  var CSS = '' +
    '.bar-ok{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 42%,rgba(5,150,105,0.40),rgba(15,23,42,0.86) 72%);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}' +
    '.bar-ok.show{display:flex}' +
    '.bar-ok-stage{position:relative;width:300px;max-width:86vw;text-align:center;transform:scale(.92);opacity:0}' +
    '.bar-ok.show .bar-ok-stage{animation:barOkIn .5s cubic-bezier(.22,.68,.3,1) forwards}' +
    '@keyframes barOkIn{to{transform:scale(1);opacity:1}}' +
    '.bar-ok-burst{position:relative;width:108px;height:108px;margin:0 auto 8px}' +
    '.bar-glow{position:absolute;inset:-34px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,0.6),rgba(16,185,129,0) 70%);opacity:0;z-index:0}' +
    '.bar-ok.show .bar-glow{animation:barGlow 2.5s ease-out .14s forwards}' +
    '@keyframes barGlow{0%{opacity:0;transform:scale(.5)}25%{opacity:1;transform:scale(1)}100%{opacity:.62;transform:scale(1.1)}}' +
    '.bar-ok-coin{position:absolute;inset:6px;border-radius:50%;background:linear-gradient(135deg,#34D399,#10B981 45%,#047857);color:#fff;display:flex;align-items:center;justify-content:center;font-size:42px;box-shadow:0 16px 38px -8px rgba(5,150,105,0.75),inset 0 2px 7px rgba(255,255,255,0.45);transform:scale(0);z-index:2}' +
    '.bar-ok.show .bar-ok-coin{animation:barCoinIn .64s cubic-bezier(.3,1.3,.5,1) .14s forwards}' +
    '@keyframes barCoinIn{0%{transform:scale(0)}100%{transform:scale(1)}}' +
    '.bar-ring{position:absolute;inset:6px;border-radius:50%;border:2.5px solid rgba(110,231,183,0.75);opacity:0;z-index:1}' +
    '.bar-ok.show .bar-ring{animation:barRing 1.7s ease-out .32s forwards}' +
    '.bar-ok.show .bar-ring.r2{animation-delay:.72s}' +
    '@keyframes barRing{0%{opacity:.85;transform:scale(.68)}100%{opacity:0;transform:scale(2.5)}}' +
    '.bar-tw{position:absolute;color:#FDE68A;opacity:0;pointer-events:none;z-index:3;filter:drop-shadow(0 0 6px rgba(251,191,36,0.75))}' +
    '.bar-tw i{display:block}' +
    '.bar-tw.t1{top:-8px;left:34px;font-size:16px}.bar-tw.t2{top:20px;right:26px;font-size:12px}.bar-tw.t3{top:104px;left:14px;font-size:11px}' +
    '.bar-tw.t4{top:82px;right:16px;font-size:18px}.bar-tw.t5{top:4px;right:88px;font-size:10px}.bar-tw.t6{top:128px;left:80px;font-size:14px}' +
    '.bar-ok.show .bar-tw{animation:barTw 2.1s ease-in-out forwards}' +
    '.bar-ok.show .bar-tw.t2{animation-delay:.24s}.bar-ok.show .bar-tw.t3{animation-delay:.5s}.bar-ok.show .bar-tw.t4{animation-delay:.14s}.bar-ok.show .bar-tw.t5{animation-delay:.62s}.bar-ok.show .bar-tw.t6{animation-delay:.4s}' +
    '@keyframes barTw{0%{opacity:0;transform:scale(0) rotate(-30deg)}22%{opacity:1;transform:scale(1.15) rotate(0)}50%{opacity:.8;transform:scale(.85)}74%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(.5) rotate(20deg)}}' +
    '.bar-ok-title{font-size:24px;font-weight:900;color:#fff;margin-top:16px;position:relative;z-index:3;opacity:0;text-shadow:0 2px 12px rgba(0,0,0,0.3)}' +
    '.bar-ok.show .bar-ok-title{animation:barTextUp .42s ease .32s forwards}' +
    '.bar-ok-sub{font-size:14.5px;color:rgba(255,255,255,0.9);margin-top:6px;position:relative;z-index:3;opacity:0}' +
    '.bar-ok.show .bar-ok-sub{animation:barTextUp .42s ease .46s forwards}' +
    '.bar-ok-sub b{color:#6EE7B7;font-weight:900;font-size:16px}' +
    '@keyframes barTextUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';

  var MARKUP = '' +
    '<div class="bar-ok-stage">' +
    '<span class="bar-tw t1"><i class="fa-solid fa-star"></i></span>' +
    '<span class="bar-tw t2"><i class="fa-solid fa-star"></i></span>' +
    '<span class="bar-tw t3"><i class="fa-solid fa-star"></i></span>' +
    '<span class="bar-tw t4"><i class="fa-solid fa-star"></i></span>' +
    '<span class="bar-tw t5"><i class="fa-solid fa-star"></i></span>' +
    '<span class="bar-tw t6"><i class="fa-solid fa-star"></i></span>' +
    '<div class="bar-ok-burst">' +
    '<span class="bar-glow"></span>' +
    '<span class="bar-ring"></span>' +
    '<span class="bar-ring r2"></span>' +
    '<div class="bar-ok-coin"><i class="fa-solid fa-coins bar-ok-ic"></i></div>' +
    '</div>' +
    '<div class="bar-ok-title">Thank you! 🎉</div>' +
    '<div class="bar-ok-sub"><span class="bar-ok-lead">You earned</span> <b class="bar-ok-coins">+0 coins</b></div>' +
    '</div>';

  function injectCSS() {
    if (document.getElementById('kkdCoinOkCSS')) return;
    var s = document.createElement('style');
    s.id = 'kkdCoinOkCSS';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function mount() {
    injectCSS();
    var ok = document.getElementById('kkdCoinOk');
    if (!ok) {
      ok = document.createElement('div');
      ok.id = 'kkdCoinOk';
      ok.className = 'bar-ok';
      ok.innerHTML = MARKUP;
      document.body.appendChild(ok);
    }
    return ok;
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  window.kkdCelebrate = function (coins, opts) {
    opts = opts || {};
    coins = coins || 0;
    var prefix = opts.prefix != null ? opts.prefix : '+';
    var unit = opts.unit != null ? opts.unit : 'coins';
    var fmt = function (v) { return prefix + v + (unit ? ' ' + unit : ''); };
    var ok = document.getElementById('kkdCoinOk') || mount();
    var titleEl = ok.querySelector('.bar-ok-title');
    var sub = ok.querySelector('.bar-ok-coins');
    var leadEl = ok.querySelector('.bar-ok-lead');
    var iconEl = ok.querySelector('.bar-ok-ic');
    titleEl.textContent = opts.title || 'Thank you! 🎉';
    if (leadEl) leadEl.textContent = opts.lead || 'You earned';
    if (iconEl) iconEl.className = 'fa-solid ' + (opts.icon || 'fa-coins') + ' bar-ok-ic';
    sub.textContent = fmt(0);
    // restart the animations even if the overlay was shown moments ago
    ok.classList.remove('show');
    void ok.offsetWidth;
    ok.classList.add('show');
    // count the coins up just after the medallion pops
    setTimeout(function () {
      var steps = Math.max(1, Math.min(coins, 18)), inc = coins / steps, i = 0;
      var t = setInterval(function () {
        i++;
        var v = Math.round(inc * i);
        if (i >= steps) { v = coins; clearInterval(t); }
        sub.textContent = fmt(v);
      }, 42);
    }, 360);
    // coin/sparkle fountain across the screen
    var burst = ok.querySelector('.bar-ok-burst');
    if (burst) {
      var sym = ['🪙','🪙','✨','🎉','🪙','✨','🪙','🎉','✨','🪙','🪙','✨','🎉','🪙','✨','🪙'];
      for (var k = 0; k < 16; k++) {
        var c = document.createElement('span');
        c.textContent = sym[k];
        var angle = (-90 + (k - 7.5) * 11) * Math.PI / 180;
        var dist = 120 + (k % 5) * 26;
        var tx = Math.cos(angle) * dist;
        var ty = Math.sin(angle) * dist - 18;
        var rot = (k % 2 ? 1 : -1) * (14 + (k * 9) % 40);
        c.style.cssText = 'position:absolute;left:50%;top:50%;font-size:' + (18 + (k % 5) * 3) + 'px;transform:translate(-50%,-50%) scale(.4);opacity:0;transition:transform 1.05s cubic-bezier(.18,.7,.3,1),opacity 1.05s ease;pointer-events:none;z-index:5;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3))';
        burst.appendChild(c);
        (function (c, tx, ty, rot, k) {
          setTimeout(function () { c.style.opacity = '1'; c.style.transform = 'translate(calc(-50% + ' + tx + 'px), calc(-50% + ' + ty + 'px)) scale(1.2) rotate(' + rot + 'deg)'; }, 130 + k * 26);
          setTimeout(function () { c.style.opacity = '0'; }, 980 + k * 26);
          setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 1420 + k * 26);
        })(c, tx, ty, rot, k);
      }
    }
    // hold for 2.5s then dismiss
    setTimeout(function () { ok.classList.remove('show'); }, 2500);
  };
})();
