/* ==========================================================================
   KKD Admin · shared shell — sidebar + topbar + helpers (toast, publish,
   drawer/modal, a "Controls/Preview-in-app" context bar, and an in-portal
   phone preview of any app screen). Each page:
     <div class="admin"><aside id="side"></aside>
       <div class="main"><header id="top"></header><div class="work">…</div></div></div>
   and calls AdminShell.mount({active, title, crumb, controls, preview})
     controls : plain-language "what this controls in the app"
     preview  : an app screen filename (e.g. 'home.html') for the phone preview
   ========================================================================== */
(function (global) {
  // Screen-first layout: the primary nav is the app's actual screens. Each opens a
  // workspace (screen.html?s=…) that shows the screen's live preview + the content
  // blocks on it, which link to the detailed editors. A slim "Library" (reusable
  // catalogs) and "Tools" (global) sit below.
  const NAV = [
    { group: 'Overview', items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'gauge-high', href: 'index.html' },
    ]},
    { group: 'App Screens', items: [
      { key: 'sc-home', label: 'Home', icon: 'house', href: 'home-manager.html' },
      { key: 'sc-search', label: 'Search', icon: 'magnifying-glass', href: 'screen.html?s=search' },
      { key: 'sc-shop', label: 'Shop & Category', icon: 'store', href: 'screen.html?s=shop' },
      { key: 'sc-pdp', label: 'Product Page', icon: 'box-open', href: 'screen.html?s=pdp' },
      { key: 'sc-cart', label: 'Cart & Checkout', icon: 'cart-shopping', href: 'screen.html?s=cart' },
      { key: 'sc-orders', label: 'Orders & Tracking', icon: 'truck', href: 'screen.html?s=orders' },
      { key: 'sc-mycrop', label: 'My Crop', icon: 'seedling', href: 'screen.html?s=mycrop' },
      { key: 'sc-rewards', label: 'Rewards & Wallet', icon: 'gift', href: 'screen.html?s=rewards' },
      { key: 'sc-onboarding', label: 'Onboarding', icon: 'flag-checkered', href: 'screen.html?s=onboarding' },
      { key: 'sc-account', label: 'Account & Help', icon: 'user', href: 'screen.html?s=account' },
      { key: 'sc-pages', label: 'Static Pages', icon: 'file-lines', href: 'screen.html?s=pages' },
    ]},
    { group: 'Library', items: [
      { key: 'products', label: 'Products', icon: 'flask', href: 'products.html' },
      { key: 'categories', label: 'Categories', icon: 'shapes', href: 'categories.html' },
      { key: 'crops', label: 'Crops', icon: 'wheat-awn', href: 'crops.html' },
      { key: 'media', label: 'Media', icon: 'photo-film', href: 'media.html' },
    ]},
    { group: 'Tools', items: [
      { key: 'translations', label: 'Translations', icon: 'language', href: 'translations.html' },
      { key: 'config', label: 'App Config & States', icon: 'sliders', href: 'config.html' },
      { key: 'deeplinks', label: 'App Links', icon: 'link', href: 'deeplinks.html' },
      { key: 'publish', label: 'Publish & Versions', icon: 'rocket', href: 'publish.html' },
      { key: 'settings', label: 'Settings', icon: 'gear', href: 'settings.html' },
    ]},
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

  function sidebar(active) {
    const groups = NAV.map(g => `
      <div class="nav-group">
        <div class="nav-group-label">${g.group}</div>
        ${g.items.map(it => `
          <a class="nav-item ${it.key === active ? 'active' : ''}" href="${it.href}">
            <i class="fa-solid fa-${it.icon}"></i><span>${it.label}</span>
            ${it.key === 'publish' ? `<span class="pill" id="navPending"></span>` : ''}
          </a>`).join('')}
      </div>`).join('');
    return `
      <div class="brand">
        <div class="brand-logo brandfont">K</div>
        <div>
          <div class="brand-name brandfont">KKD Admin</div>
          <div class="brand-sub">Content Studio</div>
        </div>
      </div>
      <nav class="nav">${groups}</nav>
      <div class="side-foot">
        <div class="side-user">
          <div class="side-ava">AD</div>
          <div style="min-width:0">
            <div style="color:#fff;font-weight:700;font-size:13px">Admin</div>
            <div style="font-size:11px;color:var(--side-txt-dim)">Super Admin</div>
          </div>
          <i class="fa-solid fa-right-from-bracket" style="margin-left:auto;color:var(--side-txt-dim);font-size:13px"></i>
        </div>
      </div>`;
  }

  function topbar(o) {
    return `
      <div>
        <div class="crumb">${esc(o.crumb || 'KKD App')} <i class="fa-solid fa-angle-right" style="font-size:9px;margin:0 4px"></i> ${esc(o.title)}</div>
        <div class="ttl">${esc(o.title)}</div>
      </div>
      <div class="topbar-spacer"></div>
      <div class="search">
        <i class="fa-solid fa-magnifying-glass" style="font-size:12px"></i>
        <input placeholder="Search content…"/>
      </div>
      <span class="env-pill" id="envPill"><span class="dot"></span> Draft · <span id="pendCount">0</span> unpublished</span>
      <button class="btn btn-ghost btn-sm" onclick="AdminShell.preview()"><i class="fa-solid fa-eye"></i> Preview</button>
      <button class="btn btn-primary btn-sm" onclick="AdminShell.publish()"><i class="fa-solid fa-rocket"></i> Publish</button>`;
  }

  const AdminShell = {
    mount(o) {
      document.getElementById('side').innerHTML = sidebar(o.active);
      document.getElementById('top').innerHTML = topbar(o);
      this.refreshPending();
      // friendliness: a "Controls: … / Preview in app" context bar at the top of the work area
      if (o.controls) {
        const work = document.querySelector('.work');
        if (work && !work.querySelector('.context-bar')) {
          const bar = document.createElement('div');
          bar.className = 'context-bar';
          bar.innerHTML = `<i class="fa-solid fa-circle-info"></i><span><b>Controls:</b> ${esc(o.controls)}</span>` +
            (o.preview ? `<button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="AdminShell.previewApp('${o.preview}')"><i class="fa-solid fa-mobile-screen-button"></i> Preview in app</button>` : '');
          work.insertBefore(bar, work.firstChild);
        }
      }
      if (!document.querySelector('.toast-wrap')) {
        const w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w);
      }
    },
    refreshPending() {
      const n = global.KKD ? global.KKD.pending() : 0;
      const pc = document.getElementById('pendCount'); if (pc) pc.textContent = n;
      const np = document.getElementById('navPending'); if (np) np.textContent = n;
      const ep = document.getElementById('envPill'); if (ep) ep.style.display = n > 0 ? '' : 'none';
    },
    toast(msg, icon) {
      const w = document.querySelector('.toast-wrap'); if (!w) return;
      const t = document.createElement('div'); t.className = 'toast';
      t.innerHTML = `<span class="ic"><i class="fa-solid fa-${icon || 'check'}"></i></span>${esc(msg)}`;
      w.appendChild(t); requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
    },
    publish() {
      if (global.KKD) global.KKD.clearPending();
      this.refreshPending(); this.refreshPreview();
      this.toast('Published! The app picks this up on next launch — no redeploy.', 'rocket');
    },
    preview() { this.previewApp('home.html'); },
    saved(msg) { this.toast(msg || 'Saved to draft', 'check'); this.refreshPending(); this.refreshPreview(); },

    // tell any open live-preview iframe to re-render after an edit
    refreshPreview() {
      document.querySelectorAll('iframe').forEach(f => { try { f.contentWindow.postMessage('kkd-refresh', '*'); } catch (e) {} });
    },

    // in-portal phone preview of an actual app screen
    previewApp(screen) {
      let m = document.getElementById('appPreview');
      if (!m) {
        const scrim = document.createElement('div');
        scrim.className = 'scrim'; scrim.id = 'appPreviewScrim';
        scrim.addEventListener('click', () => this.close('appPreview'));
        m = document.createElement('div'); m.id = 'appPreview'; m.className = 'app-preview';
        m.innerHTML = `<div class="app-preview-head"><span id="appPreviewTitle"></span>
            <button class="x-btn" style="margin-left:0" onclick="AdminShell.close('appPreview')"><i class="fa-solid fa-xmark"></i></button></div>
          <div class="phone"><div class="phone-screen"><iframe id="appPreviewFrame"></iframe></div></div>`;
        document.body.appendChild(scrim); document.body.appendChild(m);
      }
      // Home (and home-driven surfaces) use the content-driven live preview that reflects draft edits;
      // other screens load the real static app screen.
      const isHome = screen === 'home.html';
      document.getElementById('appPreviewFrame').src = isHome ? 'live-preview.html' : ('../screens/' + screen);
      document.getElementById('appPreviewTitle').textContent = isHome ? 'Live preview · Home · reflects your edits' : 'Live preview · ' + screen;
      this.open('appPreview');
    },

    open(id) { const el = document.getElementById(id); if (el) el.classList.add('open'); const s = document.getElementById(id + 'Scrim'); if (s) s.classList.add('open'); document.body.style.overflow = 'hidden'; },
    close(id) { const el = document.getElementById(id); if (el) el.classList.remove('open'); const s = document.getElementById(id + 'Scrim'); if (s) s.classList.remove('open'); document.body.style.overflow = ''; },
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.drawer.open,.modal.open,.scrim.open,.app-preview.open').forEach(x => x.classList.remove('open'));
      document.body.style.overflow = '';
    }
  });

  global.AdminShell = AdminShell;
  global.esc = esc;
})(window);
