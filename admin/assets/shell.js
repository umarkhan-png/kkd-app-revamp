/* ==========================================================================
   KKD Admin · shared shell — injects the sidebar + topbar into every page,
   and provides small UI helpers (toast, publish, drawer/modal, escape).
   Each page: <div class="admin"><aside id="side"></aside>
                <div class="main"><header id="top"></header><div class="work">…</div></div></div>
   and calls AdminShell.mount({active:'banners', title:'Banners', subtitle:'…', actions:'<button…>'})
   ========================================================================== */
(function (global) {
  const NAV = [
    { group: 'Overview', items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'gauge-high', href: 'index.html' },
    ]},
    { group: 'Content', items: [
      { key: 'banners', label: 'Banners', icon: 'images', href: 'banners.html' },
      { key: 'homepage', label: 'Homepage Builder', icon: 'table-cells-large', href: 'homepage.html' },
      { key: 'products', label: 'Products', icon: 'box-open', href: 'products.html' },
      { key: 'categories', label: 'Categories', icon: 'shapes', href: 'categories.html' },
      { key: 'crops', label: 'Crops', icon: 'seedling', href: 'crops.html' },
    ]},
    { group: 'Localization', items: [
      { key: 'translations', label: 'Translations', icon: 'language', href: 'translations.html' },
    ]},
    { group: 'Media & Config', items: [
      { key: 'media', label: 'Media Library', icon: 'photo-film', href: 'media.html' },
      { key: 'config', label: 'App Config', icon: 'sliders', href: 'config.html' },
      { key: 'deeplinks', label: 'Deep Links', icon: 'link', href: 'deeplinks.html' },
    ]},
    { group: 'Release', items: [
      { key: 'publish', label: 'Publish & Versions', icon: 'rocket', href: 'publish.html' },
    ]},
    { group: 'System', items: [
      { key: 'settings', label: 'Settings', icon: 'gear', href: 'settings.html' },
    ]},
  ];

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

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
      // toast container
      if (!document.querySelector('.toast-wrap')) {
        const w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w);
      }
    },
    refreshPending() {
      const n = global.KKD ? global.KKD.pending() : 0;
      const pc = document.getElementById('pendCount'); if (pc) pc.textContent = n;
      const np = document.getElementById('navPending'); if (np) np.textContent = n;
      const ep = document.getElementById('envPill');
      if (ep) ep.style.display = n > 0 ? '' : 'none';
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
      this.refreshPending();
      this.toast('Published! The app will pick this up on next launch — no redeploy.', 'rocket');
    },
    preview() { this.toast('Opening a live draft preview of the app…', 'eye'); },
    saved(msg) { this.toast(msg || 'Saved to draft', 'check'); this.refreshPending(); },

    // ---- drawer / modal open-close by id ----
    open(id) { const el = document.getElementById(id); if (el) el.classList.add('open'); const s = document.getElementById(id + 'Scrim'); if (s) s.classList.add('open'); document.body.style.overflow = 'hidden'; },
    close(id) { const el = document.getElementById(id); if (el) el.classList.remove('open'); const s = document.getElementById(id + 'Scrim'); if (s) s.classList.remove('open'); document.body.style.overflow = ''; },
  };

  // Esc closes any open drawer/modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.drawer.open,.modal.open,.scrim.open').forEach(x => x.classList.remove('open'));
      document.body.style.overflow = '';
    }
  });

  global.AdminShell = AdminShell;
  global.esc = esc;
})(window);
