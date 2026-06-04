/* KKD · demo app-state resolver · data-driven
   window.kkdAppStates() → { nonservice, bannedproduct, banneduser, codoff }
   Real-data triggers:
     - pincode 123456 (localStorage kkd.pincode) → nonservice
     - 'chakrawarti' in cart (localStorage kkd.cart, array of item ids) → bannedproduct
     - mobile 12345 (localStorage kkd.mobile) → banneduser + codoff
   Manual override (for testing): ?st=<state> (persisted to kkd.stOverride; ?st=clear resets). */
(function () {
  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  window.kkdAppStates = function () {
    var st = { nonservice: false, bannedproduct: false, banneduser: false, codoff: false };
    // optional manual override
    var q = new URLSearchParams(location.search).get('st');
    if (q !== null) { try { if (q === 'clear' || q === '') localStorage.removeItem('kkd.stOverride'); else localStorage.setItem('kkd.stOverride', q); } catch (e) {} }
    var ov = ls('kkd.stOverride');
    if (ov) { if (st.hasOwnProperty(ov)) st[ov] = true; if (ov === 'banneduser') st.codoff = true; return st; }
    // data-driven
    var pin = ls('kkd.pincode') || '452001';
    var mob = ls('kkd.mobile').replace(/\D/g, '');
    var cart = []; try { cart = JSON.parse(ls('kkd.cart') || '[]') || []; } catch (e) { cart = []; }
    if (mob === '12345') { st.banneduser = true; st.codoff = true; }
    if (pin === '123456') st.nonservice = true;
    if (cart.indexOf('chakrawarti') >= 0 || cart.indexOf('Chakrawarti ZC') >= 0) st.bannedproduct = true;
    return st;
  };
})();
