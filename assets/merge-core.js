/* KKD · shared order-merge core · used by merge-review.html (page 1) + merge-payment.html (page 2)
   Single source of truth for the merge model so the two pages can never drift apart.
   Reads kkd.lastOrder (a recent placed order, <60 min old) + kkd.cart (the buy-again selection). */
(function () {
  if (window.kkdMerge) return;

  var ADVANCE_THRESHOLD = 10000, ADVANCE_PCT = 10;

  // Catalog · keys match the data-item ids used on cart.html / PDPs / checkout.html
  var CATALOG = {
    humic:       { name: 'Humic + Fulvic', sub: '1 L',    price: 752, img: '../assets/Humic_nobg.png' },
    chakrawarti: { name: 'Chakrawarti ZC', sub: '100 ml', price: 700, img: '../assets/Chakrawarti_nobg.png' },
    chakra:      { name: 'Chakrawarti ZC', sub: '100 ml', price: 700, img: '../assets/Chakrawarti_nobg.png' },
    npk:         { name: 'NPK 19:19:19',   sub: '1 kg',   price: 453, img: 'https://katyayanikrishidirect.com/cdn/shop/files/NPK_19-19-19_Front.webp' },
    antivirus:   { name: 'Antivirus',      sub: '250 ml', price: 327, img: '../assets/AntiVirus_nobg.png' },
    bhumiraja:   { name: 'Bhumiraja',      sub: '1 kg',   price: 410, img: 'https://katyayanikrishidirect.com/cdn/shop/files/Bhumiraja_2_1.webp' },
    triple:      { name: 'Triple Attack',  sub: '500 ml', price: 585, img: 'https://katyayanikrishidirect.com/cdn/shop/files/Triple_attack_1_2.webp' },
    chakraveer:  { name: 'Chakraveer',     sub: '1 L',    price: 640, img: 'https://katyayanikrishidirect.com/cdn/shop/files/ChakraveerNewMockup.webp' }
  };
  function itemMeta(k) { return CATALOG[k] || { name: k, sub: '', price: 0, img: '' }; }
  function rupee(n) { return '₹' + (Math.round(n || 0)).toLocaleString('en-IN'); }

  function getRecentOrder() {
    try {
      var lo = JSON.parse(localStorage.getItem('kkd.lastOrder') || 'null');
      if (!lo || !Array.isArray(lo.items) || !lo.items.length) return null;
      if (Date.now() - (lo.ts || 0) > 60 * 60 * 1000) return null;
      return lo;
    } catch (e) { return null; }
  }
  // The buy-again merge selection lives in its OWN key (kkd.mergeCart) so cart.html's cart-reconcile
  // (which rewrites kkd.cart from its static markup) can never clobber it. Falls back to kkd.cart.
  function getCart() {
    try {
      var mc = JSON.parse(localStorage.getItem('kkd.mergeCart') || 'null');
      if (mc && Array.isArray(mc) && mc.length) return mc.slice().sort();
    } catch (e) {}
    try { return (JSON.parse(localStorage.getItem('kkd.cart') || '[]') || []).slice().sort(); }
    catch (e) { return []; }
  }
  function clearMergeCart() { try { localStorage.removeItem('kkd.mergeCart'); } catch (e) {} }

  // Compute the full merge model · returns null when there's no recent order or nothing actually changes
  function compute() {
    var recent = getRecentOrder();
    if (!recent) return null;
    var cart = getCart();
    var prevQtys = (recent.qtys && typeof recent.qtys === 'object') ? recent.qtys : {};
    var qtyOf = function (k) { return (prevQtys[k] && prevQtys[k] > 0) ? prevQtys[k] : 1; };
    var prevSet = {}; recent.items.forEach(function (k) { prevSet[k] = 1; });
    var cartSet = {}; cart.forEach(function (k) { cartSet[k] = 1; });
    var updatedIds   = recent.items.filter(function (k) { return cartSet[k]; });   // in both → qty bump
    var newIds       = cart.filter(function (k) { return !prevSet[k]; });          // cart only → brand new
    var unchangedIds = recent.items.filter(function (k) { return !cartSet[k]; });  // prev only → untouched
    if (!updatedIds.length && !newIds.length) return null;                          // nothing to merge
    var isCaseA = !newIds.length && updatedIds.length === cart.length;              // every cart item already in the order

    var extra = 0;
    updatedIds.forEach(function (k) { extra += (itemMeta(k).price || 0); });
    newIds.forEach(function (k) { extra += (itemMeta(k).price || 0); });
    var prevTotal = 0;
    recent.items.forEach(function (k) { prevTotal += (itemMeta(k).price || 0) * qtyOf(k); });
    // Demo · clean forced totals so the merged-value breakdown reads cleanly (set by the buy-again tiles)
    if (recent.demoPrev != null) { prevTotal = recent.demoPrev; if (recent.demoAdd != null) extra = recent.demoAdd; }

    var onlineDiscount = Math.round(extra * 0.05);
    var onlineTotal = Math.max(0, extra - onlineDiscount);
    var mergedOrderValue = prevTotal + extra;
    var alreadyPaid = (recent.mode === 'cod') ? 0 : prevTotal;   // COD previous = nothing paid yet
    var advanceRegime = mergedOrderValue > ADVANCE_THRESHOLD;
    var fullPrepaidNow = Math.max(0, mergedOrderValue - alreadyPaid);
    var advanceMin = Math.max(0, Math.round(mergedOrderValue * ADVANCE_PCT / 100) - alreadyPaid);

    return {
      recent: recent, cart: cart, oid: recent.id || 'KKD-26194', prevQtys: prevQtys, qtyOf: qtyOf,
      updatedIds: updatedIds, newIds: newIds, unchangedIds: unchangedIds, isCaseA: isCaseA,
      mergedCount: updatedIds.length + newIds.length + unchangedIds.length,
      extra: extra, prevTotal: prevTotal, onlineDiscount: onlineDiscount, onlineTotal: onlineTotal,
      mergedOrderValue: mergedOrderValue, alreadyPaid: alreadyPaid, advanceRegime: advanceRegime,
      fullPrepaidNow: fullPrepaidNow, advanceMin: advanceMin,
      ADVANCE_THRESHOLD: ADVANCE_THRESHOLD, ADVANCE_PCT: ADVANCE_PCT
    };
  }

  // One row of the "After merge" item list · state = 'updated' | 'new' | 'unchanged'
  function row(state, key, qtyOf) {
    var m = itemMeta(key);
    var q = qtyOf(key);
    var qtyHtml, tagHtml = '', priceHtml = '';
    if (state === 'updated') {
      qtyHtml = '<span class="qty">Qty <span class="prev">' + q + '</span><i class="fa-solid fa-arrow-right arrow"></i><span class="next">' + (q + 1) + '</span></span>';
      priceHtml = '<span class="om-row-price">' + rupee(m.price || 0) + '</span>';
    } else if (state === 'new') {
      qtyHtml = '<span class="qty">Qty 1</span>';
      tagHtml = '<span class="om-tag new">New item</span>';
      priceHtml = '<span class="om-row-price">' + rupee(m.price || 0) + '</span>';
    } else {
      qtyHtml = '<span class="qty">Qty ' + q + '</span>';
      tagHtml = '<span class="om-tag unchanged">In order</span>';
      priceHtml = '<span class="om-row-price" style="color:#475569">' + rupee((m.price || 0) * q) + '</span>';
    }
    return '<div class="om-row" data-state="' + state + '">' +
      '<div class="om-row-img">' + (m.img ? '<img src="' + m.img + '" alt="" onerror="this.style.display=\'none\'"/>' : '') + '</div>' +
      '<div class="om-row-body"><div class="n">' + m.name + '</div>' + (m.sub ? '<div class="s">' + m.sub + '</div>' : '') + qtyHtml + '</div>' +
      '<div class="om-row-right">' + tagHtml + priceHtml + '</div>' +
    '</div>';
  }

  // Render the full "After merge" list into a container
  function renderList(el, model) {
    if (!el || !model) return;
    var html = '';
    model.updatedIds.forEach(function (k) { html += row('updated', k, model.qtyOf); });
    model.newIds.forEach(function (k) { html += row('new', k, model.qtyOf); });
    model.unchangedIds.forEach(function (k) { html += row('unchanged', k, model.qtyOf); });
    el.innerHTML = html;
  }

  window.kkdMerge = { compute: compute, row: row, renderList: renderList, itemMeta: itemMeta, rupee: rupee, clearMergeCart: clearMergeCart };
})();
