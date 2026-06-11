/* ==========================================================================
   KKD Admin · mock data store (UI-only, no backend)
   Everything the portal manages lives here and is mirrored into localStorage
   so edits "stick" across pages during a session. A real build would swap
   these reads/writes for Supabase calls — the UI contract stays the same.
   ========================================================================== */
(function (global) {
  const LOCALES = [
    { code: 'en', label: 'English', flag: '🇬🇧', enabled: true, fallback: true },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', enabled: true, fallback: false },
    { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳', enabled: true, fallback: false },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', enabled: false, fallback: false },
  ];

  const SEED = {
    locales: LOCALES,

    banners: [
      { id: 'bn1', title: 'Monsoon Mega Sale', slot: 'home_hero', status: 'active', start: '2026-06-01', end: '2026-06-30', target: 'shop.html?cat=offers', clicks: 12840, img: '#258046' },
      { id: 'bn2', title: 'Free delivery over ₹499', slot: 'home_hero', status: 'active', start: '2026-06-05', end: '2026-07-05', target: 'home.html', clicks: 8210, img: '#2563EB' },
      { id: 'bn3', title: 'New Fungicide range', slot: 'category_top', status: 'scheduled', start: '2026-06-15', end: '2026-07-15', target: 'shop.html?cat=fungicide', clicks: 0, img: '#B45309' },
      { id: 'bn4', title: 'Krishi Coins 2x weekend', slot: 'pdp', status: 'active', start: '2026-06-08', end: '2026-06-12', target: 'wallet.html', clicks: 3460, img: '#7C3AED' },
      { id: 'bn5', title: 'Diwali special (old)', slot: 'home_hero', status: 'off', start: '2025-10-20', end: '2025-11-05', target: 'home.html', clicks: 45120, img: '#DC2626' },
    ],

    categories: [
      { id: 'c1', key: 'pesticide', name: 'Pesticide', order: 1, products: 42, active: true },
      { id: 'c2', key: 'fungicide', name: 'Fungicide', order: 2, products: 38, active: true },
      { id: 'c3', key: 'fertilizer', name: 'Fertilizer', order: 3, products: 56, active: true },
      { id: 'c4', key: 'herbicide', name: 'Herbicide', order: 4, products: 27, active: true },
      { id: 'c5', key: 'combo', name: 'Combo Packs', order: 5, products: 14, active: true },
      { id: 'c6', key: 'seeds', name: 'Seeds', order: 6, products: 9, active: false },
    ],

    crops: [
      { id: 'cr1', key: 'wheat', name: 'Wheat', season: 'Rabi', products: 24, active: true },
      { id: 'cr2', key: 'cotton', name: 'Cotton', season: 'Kharif', products: 31, active: true },
      { id: 'cr3', key: 'paddy', name: 'Paddy / Rice', season: 'Kharif', products: 28, active: true },
      { id: 'cr4', key: 'soybean', name: 'Soybean', season: 'Kharif', products: 19, active: true },
      { id: 'cr5', key: 'tomato', name: 'Tomato', season: 'All season', products: 22, active: true },
      { id: 'cr6', key: 'chilli', name: 'Chilli', season: 'Kharif', products: 17, active: true },
      { id: 'cr7', key: 'sugarcane', name: 'Sugarcane', season: 'Annual', products: 13, active: false },
    ],

    products: [
      { id: 'p1', name: 'Chakravarti Insecticide', sku: 'KKD-INS-001', cat: 'pesticide', crop: 'cotton', price: 540, mrp: 720, stock: 124, badges: ['bestseller'], active: true },
      { id: 'p2', name: 'Humic Acid Plus', sku: 'KKD-FRT-014', cat: 'fertilizer', crop: 'wheat', price: 247, mrp: 499, stock: 8, badges: ['new'], active: true },
      { id: 'p3', name: 'Anti-Virus Bio Tonic', sku: 'KKD-FUN-007', cat: 'fungicide', crop: 'tomato', price: 208, mrp: 350, stock: 56, badges: ['most_selling'], active: true },
      { id: 'p4', name: 'Sulphur 80% WDG', sku: 'KKD-FUN-021', cat: 'fungicide', crop: 'chilli', price: 119, mrp: 180, stock: 0, badges: [], active: true },
      { id: 'p5', name: 'NPK 19:19:19', sku: 'KKD-FRT-002', cat: 'fertilizer', crop: 'paddy', price: 890, mrp: 1100, stock: 210, badges: ['top_rated'], active: true },
      { id: 'p6', name: 'Glyphosate 41% SL', sku: 'KKD-HRB-005', cat: 'herbicide', crop: 'soybean', price: 415, mrp: 560, stock: 73, badges: [], active: false },
      { id: 'p7', name: 'Combo: Spray Kit', sku: 'KKD-CMB-003', cat: 'combo', crop: 'cotton', price: 1290, mrp: 1850, stock: 31, badges: ['bestseller','new'], active: true },
    ],

    homepage: [
      { id: 'h1', type: 'banner', title: 'Hero carousel', detail: '2 active banners', visible: true },
      { id: 'h2', type: 'category_grid', title: 'Shop by category', detail: '5 categories', visible: true },
      { id: 'h3', type: 'product_rail', title: 'Most selling', detail: '8 products', visible: true },
      { id: 'h4', type: 'deals', title: 'Flash deals', detail: 'Timer · 6 products', visible: true },
      { id: 'h5', type: 'coins', title: 'Earn Krishi Coins', detail: '5-step widget', visible: true },
      { id: 'h6', type: 'product_rail', title: 'Buy again', detail: 'Personalised', visible: true },
      { id: 'h7', type: 'crop_picker', title: 'Shop by crop', detail: '6 crops', visible: false },
    ],

    // Page-wise i18n strings · each key carries a value per locale
    translations: {
      home: [
        { key: 'home.greeting', en: 'Hey! {name}', hi: 'नमस्ते! {name}', mr: 'नमस्कार! {name}' },
        { key: 'home.deliver_to', en: 'Deliver to', hi: 'यहाँ डिलीवर करें', mr: 'येथे वितरित करा' },
        { key: 'home.search_ph', en: 'Search products, crops…', hi: 'उत्पाद, फसल खोजें…', mr: 'उत्पादने, पिके शोधा…' },
        { key: 'home.shop_category', en: 'Shop by category', hi: 'श्रेणी से खरीदें', mr: 'श्रेणीनुसार खरेदी करा' },
        { key: 'home.most_selling', en: 'Most selling', hi: 'सबसे ज़्यादा बिकने वाले', mr: '' },
        { key: 'home.out_for_delivery', en: 'Out for delivery', hi: 'डिलीवरी के लिए निकला', mr: 'वितरणासाठी निघाले' },
      ],
      pdp: [
        { key: 'pdp.add_cart', en: 'Add to cart', hi: 'कार्ट में डालें', mr: 'कार्टमध्ये टाका' },
        { key: 'pdp.buy_now', en: 'Buy now', hi: 'अभी खरीदें', mr: 'आता खरेदी करा' },
        { key: 'pdp.ask_expert', en: 'Ask an expert', hi: 'विशेषज्ञ से पूछें', mr: '' },
        { key: 'pdp.in_stock', en: 'In stock', hi: 'स्टॉक में', mr: 'स्टॉकमध्ये' },
      ],
      cart: [
        { key: 'cart.title', en: 'Your cart', hi: 'आपका कार्ट', mr: 'तुमची कार्ट' },
        { key: 'cart.checkout', en: 'Proceed to checkout', hi: 'चेकआउट करें', mr: '' },
        { key: 'cart.empty', en: 'Your cart is empty', hi: 'आपका कार्ट खाली है', mr: 'तुमची कार्ट रिकामी आहे' },
      ],
      notifications: [
        { key: 'notif.title', en: 'Get important updates', hi: 'ज़रूरी अपडेट पाएं', mr: 'महत्त्वाचे अपडेट मिळवा' },
        { key: 'notif.allow', en: 'Allow notifications', hi: 'सूचनाएं चालू करें', mr: '' },
        { key: 'notif.later', en: 'Maybe later', hi: 'बाद में', mr: 'नंतर कधीतरी' },
      ],
    },

    config: [
      { key: 'cod_enabled', label: 'Cash on Delivery', desc: 'Allow COD at checkout', type: 'toggle', value: true },
      { key: 'min_order', label: 'Minimum order value', desc: 'Below this, free delivery is disabled', type: 'number', value: 499 },
      { key: 'support_phone', label: 'Support phone', desc: 'Shown on Help & Support', type: 'text', value: '+91 90000 12345' },
      { key: 'coins_per_100', label: 'Krishi Coins per ₹100', desc: 'Reward rate on orders', type: 'number', value: 5 },
      { key: 'maintenance', label: 'Maintenance mode', desc: 'Show a maintenance screen to all users', type: 'toggle', value: false },
    ],

    // App states (mirrors the app ?st= demo states)
    appStates: [
      { key: 'normal', label: 'Normal', desc: 'Everything available', active: true },
      { key: 'nonservice', label: 'Non-serviceable area', desc: 'Pincode not covered', active: false },
      { key: 'codoff', label: 'COD disabled', desc: 'Prepaid only', active: false },
      { key: 'bannedproduct', label: 'Banned product', desc: 'Hide restricted SKUs', active: false },
      { key: 'banneduser', label: 'Banned user', desc: 'Block flagged account', active: false },
    ],

    deeplinks: [
      { name: 'Home', route: 'home.html', params: '—' },
      { name: 'Category', route: 'shop.html', params: '?cat={key}' },
      { name: 'Product', route: 'pdp.html', params: '?id={sku}' },
      { name: 'Wallet', route: 'wallet.html', params: '—' },
      { name: 'Offers', route: 'shop.html', params: '?cat=offers' },
    ],

    versions: [
      { v: 'v128', when: '2026-06-11 11:40', by: 'Admin', note: 'Centered delivery banner copy', live: true },
      { v: 'v127', when: '2026-06-10 18:05', by: 'Admin', note: 'Monsoon Sale banner + 2 products', live: false },
      { v: 'v126', when: '2026-06-08 14:22', by: 'Admin', note: 'Hindi strings for PDP', live: false },
      { v: 'v125', when: '2026-06-05 09:11', by: 'Admin', note: 'Added Soybean crop', live: false },
    ],
  };

  const KEY = 'kkdAdmin.data';
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} bumpPending(); }
  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem('kkdAdmin.pending'); } catch (e) {} }
  function bumpPending() {
    let n = 0; try { n = parseInt(localStorage.getItem('kkdAdmin.pending') || '3', 10); } catch (e) {}
    try { localStorage.setItem('kkdAdmin.pending', String(n + 1)); } catch (e) {}
  }

  global.KKD = { SEED, load, save, reset,
    pending() { try { return parseInt(localStorage.getItem('kkdAdmin.pending') || '3', 10); } catch (e) { return 3; } },
    clearPending() { try { localStorage.setItem('kkdAdmin.pending', '0'); } catch (e) {} },
  };
})(window);
