/* Impact Water Co. shared cart + account helpers.
   Everything lives in this browser's localStorage for now (no backend yet):
   'iwCart'    -> array of { id, name, format, price, img, qty }
   'iwLeads'   -> array of every signup/promo-code claim, for reference
   'iwAccount' -> the most recent signup, used by account.html
*/
(function () {
  var CART_KEY = 'iwCart';
  var ACCOUNT_KEY = 'iwAccount';
  var LEADS_KEY = 'iwLeads';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    updateBadge();
  }
  function addToCart(item, qty) {
    qty = qty || 1;
    var cart = getCart();
    var existing = cart.filter(function (i) { return i.id === item.id; })[0];
    if (existing) existing.qty += qty;
    else {
      var entry = { id: item.id, name: item.name, format: item.format, price: item.price, img: item.img || '', qty: qty };
      cart.push(entry);
    }
    saveCart(cart);
    return cart;
  }
  function removeFromCart(id) {
    saveCart(getCart().filter(function (i) { return i.id !== id; }));
  }
  function setQty(id, qty) {
    var cart = getCart();
    var item = cart.filter(function (i) { return i.id === id; })[0];
    if (!item) return;
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
  function clearCart() { saveCart([]); }
  function cartCount() {
    return getCart().reduce(function (n, i) { return n + i.qty; }, 0);
  }
  function cartSubtotal() {
    return getCart().reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
  }
  function updateBadge() {
    var n = cartCount();
    document.querySelectorAll('.cart-badge').forEach(function (el) {
      el.textContent = n;
      el.style.display = n > 0 ? 'flex' : 'none';
    });
  }

  function getAccount() {
    try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function saveAccount(account) {
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      var leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      var existingIndex = leads.findIndex(function (l) { return (l.phone || '') === (account.phone || ''); });
      if (existingIndex > -1) leads[existingIndex] = account;
      else leads.push(account);
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } catch (e) {}
  }
  function clearAccount() {
    try { localStorage.removeItem(ACCOUNT_KEY); } catch (e) {}
  }
  function findLeadByCode(code) {
    try {
      var leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      code = (code || '').trim().toUpperCase();
      return leads.filter(function (l) { return (l.code || '').toUpperCase() === code; })[0] || null;
    } catch (e) { return null; }
  }
  function findLeadByPhone(phone) {
    try {
      var leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      phone = (phone || '').trim();
      return leads.filter(function (l) { return (l.phone || '') === phone; })[0] || null;
    } catch (e) { return null; }
  }

  function wireAddToCartButtons() {
    document.querySelectorAll('[data-add-to-cart]').forEach(function (btn) {
      if (btn.dataset.wired) return;
      btn.dataset.wired = 'true';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var item = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          format: btn.dataset.format,
          price: parseFloat(btn.dataset.price),
          img: btn.dataset.img || ''
        };
        addToCart(item, 1);

        var original = btn.textContent;
        btn.textContent = 'Added ✓';
        setTimeout(function () { btn.textContent = original; }, 1100);

        if (btn.dataset.goToCart === 'true') {
          window.location.href = 'cart.html';
        }
      });
    });
  }

  window.IWCart = {
    getCart: getCart, saveCart: saveCart, addToCart: addToCart,
    removeFromCart: removeFromCart, setQty: setQty, clearCart: clearCart,
    cartCount: cartCount, cartSubtotal: cartSubtotal, updateBadge: updateBadge,
    getAccount: getAccount, saveAccount: saveAccount, clearAccount: clearAccount,
    findLeadByCode: findLeadByCode, findLeadByPhone: findLeadByPhone
  };

  document.addEventListener('DOMContentLoaded', function () {
    updateBadge();
    wireAddToCartButtons();
  });
})();