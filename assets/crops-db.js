/* KKD · crop master list = CRM DB crops_v2 (all active crops, DB order) · one source for every "All Crops" picker
   Images: the DB's image_url files, saved at assets/crops/db/<slug>.webp
   window.KKD_CROPS      → [{k,label,emoji,bg,img}]
   window.kkdCropMeta()  → fresh {k:{label,emoji,bg,img}} map (safe to mutate per page) */
(function () {
  var IMG = '../assets/crops/db/';
  var LIST = [
    { k:'tomato', label:'Tomato', emoji:'🍅', bg:'#FEE2E2' },
    { k:'bengal-gram', label:'Bengal Gram', emoji:'🫘', bg:'#FEF3C7' },
    { k:'black-gram', label:'Black Gram', emoji:'🫘', bg:'#E5E7EB' },
    { k:'brinjal', label:'Brinjal', emoji:'🍆', bg:'#EDE9FE' },
    { k:'cabbage', label:'Cabbage', emoji:'🥬', bg:'#DCFCE7' },
    { k:'cardamom', label:'Cardamom', emoji:'🌿', bg:'#D1FAE5' },
    { k:'cauliflower', label:'Cauliflower', emoji:'🥦', bg:'#FEF3C7' },
    { k:'cotton', label:'Cotton', emoji:'☁️', bg:'#F1F5F9' },
    { k:'garlic', label:'Garlic', emoji:'🧄', bg:'#F5F5F4' },
    { k:'ginger', label:'Ginger', emoji:'🫚', bg:'#FEF3C7' },
    { k:'green-gram', label:'Green Gram', emoji:'🫘', bg:'#DCFCE7' },
    { k:'jasmine', label:'Jasmine', emoji:'🌼', bg:'#F0FDF4' },
    { k:'maize', label:'Maize', emoji:'🌽', bg:'#FEF9C3' },
    { k:'marigold', label:'Marigold', emoji:'🌼', bg:'#FFEDD5' },
    { k:'watermelon', label:'Watermelon', emoji:'🍉', bg:'#FECACA' },
    { k:'mustard', label:'Mustard', emoji:'🌼', bg:'#FEF9C3' },
    { k:'okra', label:'Okra', emoji:'🌿', bg:'#DCFCE7' },
    { k:'onion', label:'Onion', emoji:'🧅', bg:'#FCE7F3' },
    { k:'paddy', label:'Paddy', emoji:'🌾', bg:'#FEF3C7' },
    { k:'potato', label:'Potato', emoji:'🥔', bg:'#FEF3C7' },
    { k:'red-gram', label:'Red Gram', emoji:'🫘', bg:'#FFEDD5' },
    { k:'soyabean', label:'Soyabean', emoji:'🫘', bg:'#DCFCE7' },
    { k:'sugarcane', label:'Sugarcane', emoji:'🎋', bg:'#DCFCE7' },
    { k:'turmeric', label:'Turmeric', emoji:'🫚', bg:'#FEF3C7' },
    { k:'wheat', label:'Wheat', emoji:'🌾', bg:'#FEF3C7' }
  ];
  LIST.forEach(function (c) { c.img = IMG + c.k + '.webp?v=2'; });   // v=2 · cleaned photos (no neighbouring-crop strips)
  window.KKD_CROPS = LIST;
  window.kkdCropMeta = function () {
    var m = {};
    LIST.forEach(function (c) { m[c.k] = { label: c.label, emoji: c.emoji, bg: c.bg, img: c.img }; });
    return m;
  };
})();
