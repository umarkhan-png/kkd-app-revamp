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
      { id: 'h8', type: 'social_proof', title: 'Trusted by farmers', detail: 'Headline stats', visible: true },
      { id: 'h9', type: 'testimonials', title: 'Farmer stories', detail: 'Approved testimonials', visible: true },
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

    // ---------------- Offers & Rewards ----------------
    coupons: [
      { id: 'cp1', code: 'WELCOME100', type: 'flat', value: 100, minOrder: 300, desc: 'On your first order', scope: 'First order', start: '2026-06-01', end: '2026-06-30', status: 'active', maxSaving: true, used: 4120 },
      { id: 'cp2', code: 'HUMIC50', type: 'flat', value: 50, minOrder: 0, desc: 'Flat ₹50 on Humic range', scope: 'Category · Fertilizer', start: '2026-06-05', end: '2026-06-20', status: 'active', maxSaving: false, used: 880 },
      { id: 'cp3', code: 'KKD200', type: 'flat', value: 200, minOrder: 1500, desc: '₹200 off above ₹1500', scope: 'All products', start: '2026-06-10', end: '2026-07-10', status: 'active', maxSaving: false, used: 312 },
      { id: 'cp4', code: 'MONSOON15', type: 'percent', value: 15, minOrder: 800, desc: '15% off · max ₹300', scope: 'All products', start: '2026-06-15', end: '2026-06-25', status: 'scheduled', maxSaving: false, used: 0 },
      { id: 'cp5', code: 'DIWALI25', type: 'percent', value: 25, minOrder: 1000, desc: 'Festive 25% off', scope: 'All products', start: '2025-10-20', end: '2025-11-05', status: 'off', maxSaving: false, used: 9540 },
    ],
    flashDeals: [
      { id: 'fd1', title: 'Monsoon Flash Sale', start: '2026-06-11 09:00', end: '2026-06-11 21:00', products: ['p1','p3','p4'], discount: 40, status: 'active' },
      { id: 'fd2', title: 'Weekend Spray Kit', start: '2026-06-14 00:00', end: '2026-06-15 23:59', products: ['p7','p5'], discount: 30, status: 'scheduled' },
    ],
    coinSettings: { ratePerCoin: 1, redeemCapPct: 10, expiryDays: 0, prepaidEarnPct: 2 },
    coinRules: [
      { id: 'cn1', action: 'first_order', label: 'First order bonus', coins: 100, active: true },
      { id: 'cn2', action: 'enable_notifs', label: 'Enable notifications', coins: 50, active: true },
      { id: 'cn3', action: 'crop_setup', label: 'Set up your crops', coins: 15, active: true },
      { id: 'cn4', action: 'rate_order', label: 'Rate a delivered order', coins: 10, active: true },
      { id: 'cn5', action: 'video_review', label: 'Upload a video testimonial', coins: 25, active: true },
      { id: 'cn6', action: 'refer_friend', label: 'Refer a friend (per join)', coins: 60, active: true },
    ],
    earnSteps: [ // the home "Earn Krishi Coins · 5 steps" widget
      { id: 'es1', label: 'Complete your profile', coins: 20, done: false },
      { id: 'es2', label: 'Add your first crop', coins: 15, done: true },
      { id: 'es3', label: 'Place your first order', coins: 100, done: false },
      { id: 'es4', label: 'Rate a product', coins: 10, done: false },
      { id: 'es5', label: 'Refer a friend', coins: 60, done: false },
    ],
    scratchCampaigns: [
      { id: 'sc1', name: 'Order reward card', trigger: 'On every delivered order', active: true, distributed: 2140,
        prizes: [ { tier: 'Cashback ₹150', type: 'cashback', value: 150, odds: 5 }, { tier: 'Cashback ₹50', type: 'cashback', value: 50, odds: 20 }, { tier: '100 Coins', type: 'coins', value: 100, odds: 30 }, { tier: 'Better luck', type: 'none', value: 0, odds: 45 } ] },
      { id: 'sc2', name: 'Festive mega card', trigger: 'Manual · festival', active: false, distributed: 0,
        prizes: [ { tier: 'Cashback ₹200', type: 'cashback', value: 200, odds: 2 }, { tier: '50 Coins', type: 'coins', value: 50, odds: 48 }, { tier: 'Better luck', type: 'none', value: 0, odds: 50 } ] },
    ],
    referral: { referrerCoins: 60, refereeOff: 100, shareCopy: 'Get ₹100 off your first order on KKD! Use my code {code}.',
      milestones: [ { count: 5, bonus: 500 }, { count: 10, bonus: 1200 } ],
      leaderboard: [ { name: 'Mithun', count: 2211 }, { name: 'Sumit', count: 1611 }, { name: 'Ravindra', count: 1414 }, { name: 'Sorabh', count: 1181 } ] },

    // ---------------- Catalog extras ----------------
    reviews: [
      { id: 'rv1', product: 'Chakravarti Insecticide', user: 'Ramesh P.', rating: 5, text: 'Bahut accha result mila cotton me.', photos: 2, status: 'pending', date: '2026-06-10' },
      { id: 'rv2', product: 'Humic Acid Plus', user: 'Sunita D.', rating: 4, text: 'Growth improved in 7 days.', photos: 0, status: 'approved', date: '2026-06-09' },
      { id: 'rv3', product: 'Anti-Virus Bio Tonic', user: 'Anonymous', rating: 1, text: 'Spam link http://x.co buy now', photos: 0, status: 'pending', date: '2026-06-11' },
      { id: 'rv4', product: 'NPK 19:19:19', user: 'Vikram S.', rating: 5, text: 'Paddy me zabardast.', photos: 1, status: 'approved', date: '2026-06-08' },
      { id: 'rv5', product: 'Sulphur 80% WDG', user: 'Mahesh K.', rating: 2, text: 'Packaging damaged tha.', photos: 3, status: 'rejected', date: '2026-06-07' },
    ],
    trustBadges: [
      { id: 'tb1', title: '7-Day Return', desc: 'Easy returns within 7 days', icon: 'rotate-left', active: true },
      { id: 'tb2', title: 'Cash on Delivery', desc: 'Available across serviceable pincodes', icon: 'money-bill-wave', active: true },
      { id: 'tb3', title: 'Katyayani Assured', desc: '100% genuine, direct from factory', icon: 'shield-halved', active: true },
      { id: 'tb4', title: 'Verified by lab', desc: 'Quality lab-tested batches', icon: 'flask-vial', active: false },
    ],

    // ---------------- User-generated content & social proof ----------------
    // Farmer testimonials shown on Home / PDP / Welcome — go through approval before publishing
    testimonials: [
      { id: 'ts1', name: 'Ramesh Patel', location: 'Indore, MP', crop: 'Cotton', rating: 5, media: 'video', verified: true, featured: true, status: 'approved', placement: ['home','pdp'], quote: 'Chakravarti se cotton me bollworm control ho gaya. Yield 20% badhi.' },
      { id: 'ts2', name: 'Sunita Devi', location: 'Ujjain, MP', crop: 'Tomato', rating: 5, media: 'photo', verified: true, featured: false, status: 'approved', placement: ['home'], quote: 'Humic dalne ke 7 din me growth dikhne lagi.' },
      { id: 'ts3', name: 'Mahesh Kumar', location: 'Dewas, MP', crop: 'Soybean', rating: 4, media: 'none', verified: false, featured: false, status: 'pending', placement: ['pdp'], quote: 'Accha product, delivery thodi slow thi.' },
      { id: 'ts4', name: 'Anil S.', location: 'Bhopal, MP', crop: 'Chilli', rating: 5, media: 'video', verified: true, featured: false, status: 'pending', placement: ['home','welcome'], quote: 'Krishi doctor call se sahi dawa mili. Bahut help hui.' },
      { id: 'ts5', name: 'Spam User', location: '—', crop: '—', rating: 1, media: 'none', verified: false, featured: false, status: 'rejected', placement: [], quote: 'Buy followers http://spam.co cheap now!!!' },
    ],
    // Headline numbers shown across Home / About / Welcome — single source of truth
    socialProof: {
      farmers: '10 lakh+', states: '28', products: '500+', years: '8',
      pdpBought: '8,427+', headlineRating: '4.8',
      trustLine: '10 lakh+ farmers across India trust KKD',
    },
    // Rate-app fork + feedback capture (rate-app.html)
    rateApp: {
      happyThreshold: 4, // >= this many stars -> Play Store; below -> in-app feedback
      storeUrl: 'https://play.google.com/store/apps/details?id=com.kkd',
      feedbackTags: ['App is slow', 'Crashes / Bugs', 'Hard to use', 'Missing product', 'Delivery issue', 'Payment issue'],
      askAfter: 'First delivered order',
      submitted: [
        { user: 'Vikram S.', tag: 'App is slow', text: 'Home screen takes time to load on 3G.', date: '2026-06-10' },
        { user: 'Geeta R.', tag: 'Missing product', text: 'Mujhe Saaf fungicide nahi mila.', date: '2026-06-09' },
        { user: 'Anonymous', tag: 'Delivery issue', text: 'Order 2 din late aaya.', date: '2026-06-08' },
      ],
    },
    crossSell: [
      { id: 'xs1', trigger: 'In cart', label: 'Special deal', products: ['p3'], save: 98, active: true },
      { id: 'xs2', trigger: 'Buy together', label: 'Best buy together', products: ['p2','p5'], save: 120, active: true },
      { id: 'xs3', trigger: 'Cart special', label: 'Cart special offer', products: ['p7'], save: 150, active: true },
    ],
    searchConfig: {
      placeholder: 'Search products, pests, crops',
      engagementReward: 15,
      noResult: 'No products match this search',
      trending: ['Wheat protect','Bhumiraja','Imida','Cotton care','Bio stimulant'],
      voiceHints: ['मिर्च के लिए दवा','NPK 19-19-19 खरीदना है','टमाटर में फंगस'],
      suggestions: [
        { term: 'tomato', maps: ['Tomato crop','Tomato in Fertilizer','Tomato wilt & blight'] },
        { term: 'humic', maps: ['Humic + Fulvic','Humic for wheat','Humic dosage'] },
      ],
    },

    // ---------------- Crop Help ----------------
    cropStages: [ // crop calendar — stages with dated tasks (per crop key)
      { crop: 'chilli', stages: [
        { name: 'Sowing', hindi: 'बुवाई', dayFrom: 1, dayTo: 7, tasks: ['Treat seeds before sowing', 'Apply Humic + Fulvic 98'] },
        { name: 'Vegetative', hindi: 'शाकीय', dayFrom: 8, dayTo: 40, tasks: ['Nitrogen-rich feed', 'Watch for sucking pests'] },
        { name: 'Flowering', hindi: 'फूल', dayFrom: 41, dayTo: 75, tasks: ['Spray Chakravarti', 'Boron foliar spray'] },
        { name: 'Fruiting', hindi: 'फल', dayFrom: 76, dayTo: 110, tasks: ['Calcium spray', 'Harvest scouting'] },
      ]},
      { crop: 'tomato', stages: [
        { name: 'Nursery', hindi: 'नर्सरी', dayFrom: 0, dayTo: 20, tasks: ['Damping-off watch', 'Seedling drench'] },
        { name: 'Transplant', hindi: 'रोपाई', dayFrom: 21, dayTo: 40, tasks: ['Root dip', 'Starter fertilizer'] },
        { name: 'Flowering', hindi: 'फूल', dayFrom: 41, dayTo: 75, tasks: ['Pollination support', 'Fungicide rotation'] },
      ]},
    ],
    diseases: [
      { id: 'ds1', name: 'Yellow Mosaic Virus', hindi: 'पीला मोज़ेक वायरस', crop: 'chilli', severity: 'High', desc: 'Spread by aphids. Yellow patches on leaves, stunted growth.', products: ['p3'] },
      { id: 'ds2', name: 'Root Rot', hindi: 'जड़ सड़न', crop: 'tomato', severity: 'High', desc: 'Black lesions on hypocotyls; wilting.', products: ['p4'] },
      { id: 'ds3', name: 'Leaf Curl', hindi: 'पत्ती मोड़', crop: 'chilli', severity: 'Medium', desc: 'Curling, thickened leaves; whitefly vector.', products: ['p1'] },
      { id: 'ds4', name: 'Powdery Mildew', hindi: 'चूर्णिल आसिता', crop: 'tomato', severity: 'Medium', desc: 'White powder on leaf surface.', products: ['p4'] },
    ],
    advisory: [
      { id: 'ad1', title: 'Best time to spray for chilli yellow mosaic', crop: 'chilli', topic: 'Pest', answers: 3, status: 'published' },
      { id: 'ad2', title: 'Humic acid: dosage by crop stage', crop: 'all', topic: 'Nutrition', answers: 5, status: 'published' },
      { id: 'ad3', title: 'Monsoon fungicide rotation guide', crop: 'tomato', topic: 'Disease', answers: 2, status: 'draft' },
    ],
    mandi: [
      { crop: 'Tomato', location: 'Indore', price: 18, unit: 'kg', change: 2 },
      { crop: 'Chilli', location: 'Indore', price: 92, unit: 'kg', change: -4 },
      { crop: 'Wheat', location: 'Ujjain', price: 24, unit: 'kg', change: 1 },
      { crop: 'Soybean', location: 'Dewas', price: 46, unit: 'kg', change: -2 },
    ],
    experts: [
      { id: 'ex1', name: 'Dr. Priya Sharma', title: 'Senior Agronomist', exp: 8, langs: ['Hindi','Marathi'], rating: 4.9, calls: 2140, available: true },
      { id: 'ex2', name: 'Dr. R. Verma', title: 'Krishi Agronomist', exp: 6, langs: ['Hindi','English'], rating: 4.8, calls: 1530, available: true },
      { id: 'ex3', name: 'Dr. S. Patil', title: 'Crop Specialist', exp: 11, langs: ['Marathi','Hindi'], rating: 4.7, calls: 980, available: false },
    ],
    askAi: { greeting: 'Namaste 🙏 Main Krishi AI hoon — crops, pests, products ya order ke baare me poochiye.', persona: 'Friendly Hinglish agronomy assistant', chips: ['Check price','Disease help','Track order','Dosage'] },

    // ---------------- Engagement ----------------
    pushTemplates: [
      { id: 'pt1', type: 'order', title: 'Order delivered', body: 'Your order {id} was delivered. Rate it for +10 coins!', segment: 'Buyers', schedule: 'Triggered', status: 'active' },
      { id: 'pt2', type: 'crop', title: 'Crop calendar reminder', body: '{crop} is in {stage} — time to spray {product}.', segment: 'Crop set', schedule: 'Triggered', status: 'active' },
      { id: 'pt3', type: 'offer', title: 'Monsoon Sale is live', body: 'Up to 40% off on sprays. Shop now!', segment: 'All users', schedule: '2026-06-11 10:00', status: 'scheduled' },
      { id: 'pt4', type: 'coins', title: 'You earned coins', body: '+{n} Krishi Coins added to your wallet.', segment: 'Buyers', schedule: 'Triggered', status: 'active' },
    ],
    polls: [
      { id: 'pl1', question: 'Which crop do you grow most?', options: ['Wheat','Cotton','Tomato','Other'], reward: 15, placement: 'Home + Search', active: true },
      { id: 'pl2', question: 'How do you usually buy inputs?', options: ['Local dealer','Online','Co-op'], reward: 10, placement: 'Home', active: false },
    ],
    onboarding: {
      languages: ['Hindi','English','Hinglish','Marathi','Gujarati','Punjabi','Telugu','Tamil','Kannada','Malayalam','Odia','Bengali'],
      cropPicker: ['Wheat','Rice','Tomato','Chilli','Maize','Soybean','Cotton','Sugarcane','More'],
      welcomeAboard: { eyebrow: 'Welcome aboard', headline: 'Namaste,', sub: "You've joined the Katyayani family. Let's grow together." },
      welcomeBack: { eyebrow: 'Welcome back', headline: 'Hey,', sub: 'Good to see you again. Your farm has been waiting for you.' },
      permissionBullets: [
        { icon: 'truck-fast', text: 'Faster, accurate delivery to your farm' },
        { icon: 'wheat-awn', text: 'Product recommendations for your area' },
        { icon: 'cloud-sun-rain', text: 'Local weather & spray alerts' },
      ],
      otpFacts: [
        'Free doctor calls with every order',
        'Direct-from-factory pricing',
        'New launch: Bhumiraja bio-stimulant',
        'Licensed & lab-tested products',
      ],
    },

    // ---------------- Content & static pages ----------------
    staticPages: [
      { key: 'about', title: 'About Katyayani', updated: '2026-05-14', words: 180, status: 'published' },
      { key: 'privacy', title: 'Privacy Policy', updated: '2026-06-01', words: 640, status: 'published' },
      { key: 'terms', title: 'Terms of Service', updated: '2026-06-01', words: 520, status: 'published' },
      { key: 'returns', title: 'Returns & Refund Policy', updated: '2026-06-01', words: 410, status: 'published' },
      { key: 'help', title: 'Help & FAQ', updated: '2026-05-20', words: 300, status: 'published' },
      { key: 'know', title: 'Know your app', updated: '2026-05-10', words: 220, status: 'published' },
    ],
    screenCopy: [ // per-screen short strings (empty/error/loading/cta) admins tweak
      { screen: 'empty-cart', label: 'Empty cart title', value: 'कार्ट खाली है' },
      { screen: 'empty-orders', label: 'No orders title', value: 'अभी कोई ऑर्डर नहीं' },
      { screen: 'error-network', label: 'No-internet heading', value: 'No Internet' },
      { screen: 'error-payment', label: 'Payment failed title', value: 'Payment fail ho gaya' },
      { screen: 'search', label: 'Search empty state', value: 'No products match this search' },
    ],

    // ---------------- Store Setup ----------------
    serviceability: {
      deliveryFee: 0, freeThreshold: 499, etaDays: 1,
      servicePincodes: ['452001','452010','456001','456440','453111'],
      blockedPincodes: ['123456'],
      stateBans: [ { state: 'Kerala', product: 'Glyphosate 41% SL' } ],
    },
    payments: {
      methods: [
        { key: 'upi', label: 'UPI', enabled: true, note: '5% instant off · faster' },
        { key: 'card', label: 'Cards', enabled: true, note: 'Visa / Master / RuPay' },
        { key: 'netbank', label: 'Net banking', enabled: true, note: '' },
        { key: 'partial', label: 'Partial payment', enabled: true, note: 'Pay % now, rest COD' },
        { key: 'cod', label: 'Cash on Delivery', enabled: true, note: '₹95 surcharge' },
      ],
      prepaidDiscountPct: 5, codSurcharge: 95, coinsOnPrepaidPct: 2, partialOptions: [10,25,50,75],
    },
    ordersConfig: {
      statuses: [
        { key: 'placed', label: 'Order Placed', copy: 'Payment received' },
        { key: 'packed', label: 'Packed', copy: 'Packed at warehouse' },
        { key: 'dispatched', label: 'Dispatched', copy: 'Out for last-mile' },
        { key: 'out', label: 'Out for Delivery', copy: 'Arriving today' },
        { key: 'delivered', label: 'Delivered', copy: 'Delivered to address' },
      ],
      cancelReasons: ['Ordered by mistake','Found cheaper','Wrong product','Delivery slow','Change qty/address','Other'],
      returnReasons: ['Damaged','Wrong product','Defective','Not as described','Other'],
      refundSlaDays: 5,
      partners: [ { name: 'Delhivery', active: true }, { name: 'Ecom Express', active: true }, { name: 'India Post', active: false } ],
    },

    versions: [
      { v: 'v128', when: '2026-06-11 11:40', by: 'Admin', note: 'Centered delivery banner copy', live: true },
      { v: 'v127', when: '2026-06-10 18:05', by: 'Admin', note: 'Monsoon Sale banner + 2 products', live: false },
      { v: 'v126', when: '2026-06-08 14:22', by: 'Admin', note: 'Hindi strings for PDP', live: false },
      { v: 'v125', when: '2026-06-05 09:11', by: 'Admin', note: 'Added Soybean crop', live: false },
    ],
  };

  const KEY = 'kkdAdmin.data';
  function load() {
    const seed = JSON.parse(JSON.stringify(SEED));
    try {
      const s = localStorage.getItem(KEY);
      if (s) { const stored = JSON.parse(s); return Object.assign({}, seed, stored); } // new SEED collections fill in over older saved state
    } catch (e) {}
    return seed;
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
