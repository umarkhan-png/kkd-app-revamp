/*
 * KKD font-weight ladder guard.
 * Enforces the size-driven weight rule on the RENDERED page, catching cases a
 * source sweep can't see (CSS-class weights, inherited sizes, Tailwind JIT, and
 * JS-injected content). Purely reductive: only steps an over-heavy weight DOWN
 * to what its size allows — never bolds anything up.
 *
 *   size >= 19px -> extrabold (800)
 *   16-18px      -> bold      (700)
 *   < 16px       -> semibold  (600)   <- floor
 *   font-black (900) is exempt; 600/500/400 are left alone.
 */
(function () {
  function target(size) { return size >= 19 ? 800 : size >= 16 ? 700 : 600; }

  function enforce(root) {
    var els = root.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      // only elements that directly render text
      var hasText = false;
      for (var j = 0; j < el.childNodes.length; j++) {
        var n = el.childNodes[j];
        if (n.nodeType === 3 && n.textContent.trim()) { hasText = true; break; }
      }
      if (!hasText) continue;
      var cs = getComputedStyle(el);
      var w = parseInt(cs.fontWeight, 10);
      if (w !== 700 && w !== 800) continue;        // only the bold-family heavies; 900 exempt
      var t = target(parseFloat(cs.fontSize));
      if (t < w) el.style.fontWeight = String(t);   // reduce only
    }
  }

  var scheduled = false;
  function run() {
    scheduled = false;
    try { enforce(document.body); } catch (e) {}
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(run, 80);
  }

  function init() {
    run();
    // Tailwind JIT injects styles after parse, and screens build content in JS —
    // re-run on any DOM/style change (debounced; our own inline edits settle quietly).
    try {
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', run);
})();
