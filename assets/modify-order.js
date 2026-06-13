/* Shared "Modify order before confirmation" controller.
   Page sets window.KKD_MODIFY = { mount, note, coupon:{code,off,min,active}, items:[], catalog:[] }
   then includes this script. Injects the modify card into #mount and the sheets/modal/toast into <body>. */
(function () {
  var cfg = window.KKD_MODIFY;
  if (!cfg) return;
  var mount = document.getElementById(cfg.mount);
  if (!mount) return;

  var COUPON = cfg.coupon || { active: false, min: 0, off: 0, code: '' };
  var items = (cfg.items || []).map(function (i) { var o = {}; for (var k in i) o[k] = i[k]; return o; });
  var catalog = cfg.catalog || [];
  var note = cfg.note || 'Items can be changed before your order is confirmed';

  var $ = function (id) { return document.getElementById(id); };
  var rupee = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };
  var origItems = function () { return items.filter(function (i) { return !i.added; }); };
  var addedItems = function () { return items.filter(function (i) { return i.added; }); };
  var origSubtotal = function () { return origItems().reduce(function (s, i) { return s + i.price; }, 0); };
  var couponApplies = function () { return COUPON.active && origSubtotal() >= COUPON.min; };
  var img = function (src) { return '<img src="' + src + '" onerror="this.style.display=\'none\'"/>'; };

  // ---------- inject card ----------
  mount.innerHTML =
    '<div class="sec-title">Modify your order</div>' +
    '<div class="md-card">' +
      '<div class="md-window"><i class="fa-regular fa-pen-to-square"></i> <span>' + note + '</span></div>' +
      '<div id="mdItems"></div>' +
      '<div class="md-add-wrap"><button type="button" class="md-add" id="mdAddBtn"></button></div>' +
    '</div>';

  // ---------- inject overlays ----------
  var ov = document.createElement('div');
  ov.innerHTML =
    '<div id="mdBd" class="md-bd"></div>' +
    '<div id="mdSheet" class="md-sheet">' +
      '<div class="md-sh-head">' +
        '<div style="flex:1;min-width:0" class="leading-tight">' +
          '<div class="text-[16px] font-bold" style="color:#0F172A">Add more products</div>' +
          '<div class="text-[11.5px] mt-0.5" style="color:#64748B">Search or pick from suggestions</div>' +
        '</div>' +
        '<button class="md-sh-x" id="mdShX"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      '<div class="md-search"><i class="fa-solid fa-magnifying-glass"></i><input id="mdSearch" type="text" placeholder="Search products…" autocomplete="off"/></div>' +
      '<div class="aps-list" id="mdApsList"></div>' +
      '<div class="md-foot" id="mdFoot"></div>' +
    '</div>' +
    '<div id="mdRmBd" class="md-bd"></div>' +
    '<div id="mdRmSheet" class="md-sheet">' +
      '<div class="rmm">' +
        '<div class="rmm-ic"><i class="fa-solid fa-trash-can"></i></div>' +
        '<h3 id="mdRmTitle">Remove item?</h3>' +
        '<div class="rmm-credit" id="mdRmCredit"></div>' +
        '<div class="rmm-coupon" id="mdRmCoupon" style="display:none"></div>' +
        '<div class="rmm-btns"><button class="rmm-keep" id="mdRmKeep">Keep item</button><button class="rmm-go" id="mdRmGo">Remove</button></div>' +
      '</div>' +
    '</div>' +
    '<div class="wtoast" id="mdToast"><span class="wic"><i class="fa-solid fa-wallet"></i></span><div class="wt"><div class="a" id="mdToastA"></div><div class="b" id="mdToastB"></div></div></div>';
  document.body.appendChild(ov);

  // ---------- render ----------
  function render() {
    $('mdItems').innerHTML = items.map(function (i) {
      return '<div class="md-row">' +
        '<div class="md-thumb">' + img(i.img) + '</div>' +
        '<div class="md-info"><div class="md-name">' + i.name + (i.added ? '<span class="md-badge"><i class="fa-solid fa-plus" style="font-size:7px"></i> Added</span>' : '') + '</div><div class="md-sub">' + i.sub + '</div></div>' +
        '<div class="md-price tnum">' + rupee(i.price) + '</div>' +
        '<button class="md-rm" data-rm="' + i.key + '" aria-label="Remove"><i class="fa-solid fa-trash-can"></i></button>' +
      '</div>';
    }).join('');

    var added = addedItems();
    var addBtn = $('mdAddBtn');
    if (added.length) {
      var amt = added.reduce(function (s, i) { return s + i.price; }, 0);
      addBtn.innerHTML = '<i class="fa-solid fa-indian-rupee-sign"></i> Review &amp; pay added items (' + rupee(amt) + ')';
    } else {
      addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add more products';
    }
    if ($('mdSheet').classList.contains('open')) { renderCatalog(); renderFoot(); }
  }

  function renderCatalog() {
    var q = ($('mdSearch').value || '').trim().toLowerCase();
    var list = catalog.filter(function (c) { return !q || c.name.toLowerCase().indexOf(q) >= 0; });
    if (!list.length) { $('mdApsList').innerHTML = '<div class="aps-empty">No products match “' + q + '”</div>'; return; }
    $('mdApsList').innerHTML = list.map(function (c) {
      var inOrder = items.some(function (i) { return i.key === c.key; });
      return '<div class="aps-row">' +
        '<div class="md-thumb">' + img(c.img) + '</div>' +
        '<div class="md-info"><div class="md-name">' + c.name + '</div><div class="md-sub">' + c.sub + '</div></div>' +
        '<div class="md-price tnum" style="margin-right:6px">' + rupee(c.price) + '</div>' +
        '<button class="aps-add' + (inOrder ? ' done' : '') + '" data-add="' + c.key + '"' + (inOrder ? ' disabled' : '') + '>' + (inOrder ? 'Added' : '+ Add') + '</button>' +
      '</div>';
    }).join('');
  }

  function renderFoot() {
    var added = addedItems();
    if (!added.length) {
      $('mdFoot').innerHTML = '<button class="md-foot-done" id="mdDone">Done</button>';
      $('mdDone').addEventListener('click', function () { closeSheet(); });
      return;
    }
    var amt = added.reduce(function (s, i) { return s + i.price; }, 0);
    var online = Math.round(amt * 0.95);
    $('mdFoot').innerHTML =
      '<div class="md-pay-sum"><span class="l">Added items to pay</span><span class="v tnum">' + rupee(amt) + '</span></div>' +
      '<div class="md-pays">' +
        '<div class="apay online" id="mdPayOnline"><span class="apay-tag">Save 5%</span><span class="t">Pay online</span><span class="s tnum">' + rupee(online) + '</span></div>' +
        '<div class="apay cod" id="mdPayCod"><span class="t">Pay on delivery</span><span class="s tnum">' + rupee(amt) + '</span></div>' +
      '</div>';
    $('mdPayOnline').addEventListener('click', function () { payAdded('online'); });
    $('mdPayCod').addEventListener('click', function () { payAdded('cod'); });
  }

  function payAdded(mode) {
    addedItems().forEach(function (i) { i.added = false; });
    closeSheet();
    render();
    toast(mode === 'online' ? 'Added items paid online · 5% saved' : 'Added items set to Pay on delivery',
          mode === 'online' ? 'Now part of your order' : 'Pay cash to the courier');
  }

  // ---------- add ----------
  function addProduct(key) {
    if (items.some(function (i) { return i.key === key; })) return;
    var c = catalog.filter(function (x) { return x.key === key; })[0];
    if (!c) return;
    items.push({ key: c.key, name: c.name, sub: c.sub, price: c.price, img: c.img, added: true });
    renderCatalog(); renderFoot(); render();
  }

  // ---------- remove (lighter modal) ----------
  var pending = null;
  function openRemove(key) {
    var it = items.filter(function (i) { return i.key === key; })[0];
    if (!it) return;
    pending = it;
    $('mdRmTitle').textContent = 'Remove ' + it.name + '?';
    if (it.added) {
      $('mdRmCredit').innerHTML = 'Not paid yet — it’ll just be removed from your order.';
      $('mdRmCoupon').style.display = 'none';
      it._credit = 0; it._couponLost = false;
    } else {
      var couponLost = couponApplies() && (origSubtotal() - it.price) < COUPON.min;
      var credit = it.price - (couponLost ? COUPON.off : 0);
      $('mdRmCredit').innerHTML = '<b>' + rupee(credit) + '</b> will be credited to your KKD Wallet.';
      if (couponLost) {
        $('mdRmCoupon').style.display = 'block';
        $('mdRmCoupon').innerHTML = 'Coupon <b>' + COUPON.code + '</b> (' + rupee(COUPON.off) + ' off) is reversed and adjusted above.';
      } else { $('mdRmCoupon').style.display = 'none'; }
      it._credit = credit; it._couponLost = couponLost;
    }
    openModal();
  }
  function doRemove() {
    if (!pending) return;
    var it = pending, credit = it._credit;
    if (it._couponLost) COUPON.active = false;
    items = items.filter(function (x) { return x.key !== it.key; });
    closeModal();
    if (credit > 0) toast(rupee(credit) + ' credited to your wallet', 'Use it on your next order');
    pending = null;
    render();
  }

  // ---------- sheet / modal helpers ----------
  function openSheet() { renderCatalog(); renderFoot(); $('mdBd').classList.add('open'); $('mdSheet').classList.add('open'); }
  function closeSheet() { $('mdBd').classList.remove('open'); $('mdSheet').classList.remove('open'); }
  function openModal() { $('mdRmBd').classList.add('open'); $('mdRmSheet').classList.add('open'); }
  function closeModal() { $('mdRmBd').classList.remove('open'); $('mdRmSheet').classList.remove('open'); }

  // ---------- toast ----------
  var tTimer = null;
  function toast(a, b) {
    $('mdToastA').textContent = a; $('mdToastB').textContent = b;
    var t = $('mdToast'); t.classList.add('show');
    clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  // ---------- events ----------
  $('mdItems').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (b) openRemove(b.getAttribute('data-rm')); });
  $('mdAddBtn').addEventListener('click', openSheet);
  $('mdShX').addEventListener('click', closeSheet);
  $('mdBd').addEventListener('click', closeSheet);
  $('mdSearch').addEventListener('input', renderCatalog);
  $('mdApsList').addEventListener('click', function (e) { var b = e.target.closest('[data-add]'); if (b) addProduct(b.getAttribute('data-add')); });
  $('mdRmKeep').addEventListener('click', function () { closeModal(); pending = null; });
  $('mdRmBd').addEventListener('click', function () { closeModal(); pending = null; });
  $('mdRmGo').addEventListener('click', doRemove);

  render();
})();
