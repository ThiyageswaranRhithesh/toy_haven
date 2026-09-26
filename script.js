'use strict';
const $ = selector => document.querySelector(selector);
const money = cents => '$' + (cents / 100).toFixed(2);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const productById = id => PRODUCTS.find(p => p.id === Number(id));
let toastTimer;
function showToast(message) {
  let toast = $('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role','status'); document.body.append(toast); }
  toast.textContent = message;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.textContent = ''; }, 4500);
}
function getStorage(key) {
  try { const data = JSON.parse(localStorage.getItem(key)); return Array.isArray(data) ? data : []; }
  catch { return []; }
}
function setStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); return true; }
  catch { showToast('Unable to save. Please allow browser storage or free some space, then try again.'); return false; }
}
// Accept carts saved by the earlier website, while using catalogue prices.
function getCart() {
  return getStorage('toyhaven_cart').flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const p = productById(item.id) || PRODUCTS.find(p => p.title === item.title);
    return p ? [{ id:p.id, title:p.title, price:p.price, imgSrc:p.image,
      quantity:Math.min(99, Math.max(1, Math.floor(Number(item.quantity) || 1))) }] : [];
  });
}
function getWishlist() {
  return getStorage('toyhaven_wishlist').flatMap(item => {
    if (!item) return [];
    const p = productById(item.id) || PRODUCTS.find(p => p.title === item.title);
    return p ? [{id:p.id, status:['Interested','Owned','Not Interested'].includes(item.status) ? item.status : 'Interested'}] : [];
  });
}
const cartTotal = cart => cart.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('header a[href="cart.html"]').forEach(a => { a.textContent = `Cart (${count})`; });
}
function addToCart(id) {
  const p = productById(id); if (!p) return;
  const cart = getCart(), item = cart.find(i => i.id === p.id);
  if (item && item.quantity >= 99) { showToast('Maximum quantity is 99 per product.'); return; }
  if (item) item.quantity++; else cart.push({id:p.id,title:p.title,price:p.price,imgSrc:p.image,quantity:1});
  if (setStorage('toyhaven_cart',cart)) { updateCartCount(); showToast(`${p.title} added to cart!`); }
}
function addToWishlist(id) {
  const p = productById(id); if (!p) return;
  const list = getWishlist();
  if (list.some(i => i.id === p.id)) { showToast('Already in your wishlist.'); return; }
  list.push({id:p.id,status:'Interested'});
  if (setStorage('toyhaven_wishlist',list)) showToast(`${p.title} added to wishlist!`);
}
function productCard(p, extra = '') {
  return `<article class="product-card ${extra}" data-id="${p.id}" data-category="${p.category}">
    <figure><img src="${p.image}" alt="${escapeHTML(p.title)}" loading="lazy" width="500" height="400"></figure>
    <h3>${escapeHTML(p.title)}</h3><p class="category-tag">${p.category}</p><p class="price">${money(Math.round(p.price*100))}</p>
    <button type="button" class="details-btn" data-action="details" data-id="${p.id}">View details</button>
    <button type="button" class="add-cart-btn" data-action="cart" data-id="${p.id}">Add to Cart</button>
    <button type="button" class="add-wishlist-btn" data-action="wishlist" data-id="${p.id}">Add to Wishlist</button></article>`;
}
function initProducts() {
  const catalog = $('#product-catalog');
  if (catalog) {
    const render = () => {
      const term = $('#product-search').value.trim().toLowerCase();
      const category = $('input[name="category"]:checked').value;
      const items = PRODUCTS.filter(p => p.title.toLowerCase().includes(term) && (category === 'all' || category === p.category));
      catalog.innerHTML = '<h1>All Products</h1>' + (items.map(p => productCard(p)).join('') || '<p class="empty-state">No products match your search.</p>');
    };
    $('#filter-form').addEventListener('submit', e => e.preventDefault());
    $('#product-search').addEventListener('input',render);
    document.querySelectorAll('input[name="category"]').forEach(input => input.addEventListener('change',render));
    render();
  }
  if ($('.scroll-container')) {
    $('.scroll-container').innerHTML = PRODUCTS.slice(0,4).map(p => productCard(p,'scroll-card')).join('');
    document.querySelectorAll('.scroll-arrow').forEach(button => button.addEventListener('click', () => $('.scroll-container').scrollBy({left:button.classList.contains('left')?-320:320,behavior:'smooth'})));
  }
  // Local calendar date: the same selection throughout each day.
  if ($('#daily-product')) {
    const date = new Date();
    const day = Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()) / 86400000);
    $('#daily-product').innerHTML = productCard(PRODUCTS[day % PRODUCTS.length]);
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-action]'); if (!button) return;
    if (button.dataset.action === 'cart') addToCart(button.dataset.id);
    if (button.dataset.action === 'wishlist') addToWishlist(button.dataset.id);
    if (button.dataset.action === 'details') showProductDetails(button.dataset.id);
  });
}
function showProductDetails(id) {
  const p = productById(id); if (!p) return;
  let dialog = $('#product-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog'); dialog.id = 'product-dialog'; dialog.setAttribute('aria-labelledby','product-dialog-title'); document.body.append(dialog);
    dialog.addEventListener('click',e => { if(e.target === dialog) dialog.close(); });
  }
  dialog.innerHTML = `<button type="button" class="dialog-close" aria-label="Close product details">Close</button><img src="${p.image}" alt="${escapeHTML(p.title)}" width="500" height="400"><h2 id="product-dialog-title">${escapeHTML(p.title)}</h2><p>${escapeHTML(p.description)}</p><p>${p.category} · ${money(Math.round(p.price*100))}</p><button type="button" class="cta-btn" data-action="cart" data-id="${p.id}">Add to Cart</button><button type="button" class="details-btn" data-action="wishlist" data-id="${p.id}">Add to Wishlist</button>`;
  dialog.querySelector('.dialog-close').addEventListener('click',() => dialog.close()); dialog.showModal();
}
function renderCart() {
  if (!$('#cart-list')) return;
  const cart = getCart();
  $('#cart-list').innerHTML = cart.map(item => `<li class="cart-item"><article>
    <img src="${item.imgSrc}" alt="${escapeHTML(item.title)}"><h3>${escapeHTML(item.title)}</h3>
    <p class="unit-price">${money(Math.round(item.price*100))}</p>
    <div class="quantity-controls"><button type="button" data-quantity="minus" data-id="${item.id}" aria-label="Decrease quantity of ${escapeHTML(item.title)}">−</button>
    <input type="number" value="${item.quantity}" readonly aria-label="Quantity of ${escapeHTML(item.title)}">
    <button type="button" data-quantity="plus" data-id="${item.id}" aria-label="Increase quantity of ${escapeHTML(item.title)}">+</button></div>
    <p class="subtotal">Subtotal: ${money(Math.round(item.price*100)*item.quantity)}</p>
    <button type="button" class="remove-btn" data-quantity="remove" data-id="${item.id}">Remove</button></article></li>`).join('') || '<li class="empty-state">Your shopping cart is currently empty.<br><a class="cta-btn" href="products.html">Explore products</a></li>';
  $('#cart-total').textContent = money(cartTotal(cart)); updateCartCount();
}
function initCart() {
  if (!$('#cart-list')) return;
  renderCart();
  $('#cart-list').addEventListener('click',e => {
    const button = e.target.closest('[data-quantity]'); if(!button)return;
    let cart = getCart(); const item = cart.find(i => i.id === Number(button.dataset.id)); if(!item)return;
    if(button.dataset.quantity === 'remove') cart = cart.filter(i => i.id !== item.id);
    if(button.dataset.quantity === 'plus') item.quantity = Math.min(99,item.quantity+1);
    if(button.dataset.quantity === 'minus') item.quantity = Math.max(1,item.quantity-1);
    if(setStorage('toyhaven_cart',cart)) renderCart();
  });
  $('#clear-cart-btn').addEventListener('click',()=> {if(setStorage('toyhaven_cart',[]))renderCart();});
}
function renderWishlist() {
  const container = $('#wishlist-container'); if(!container)return;
  container.innerHTML = getWishlist().map(item => {
    const p = productById(item.id);
    return `<article class="wishlist-card"><img src="${p.image}" alt="${escapeHTML(p.title)}"><h2>${escapeHTML(p.title)}</h2>
    <div class="status-selector"><label for="status-${p.id}">Status:</label><select id="status-${p.id}" data-id="${p.id}">${['Interested','Owned','Not Interested'].map(status=>`<option${status===item.status?' selected':''}>${status}</option>`).join('')}</select></div>
    <button type="button" class="remove-wishlist-btn" data-id="${p.id}">Remove Item</button></article>`;
  }).join('') || '<p class="empty-state">Save your favourites here for later.<br><a class="cta-btn" href="products.html">Explore products</a></p>';
}
function initWishlist() {
  const container = $('#wishlist-container');if(!container)return;renderWishlist();
  container.addEventListener('change',e=> {
    if(!e.target.matches('select'))return;
    const list = getWishlist(); const item = list.find(i=>i.id===Number(e.target.dataset.id)); if(!item)return;
    item.status=e.target.value; if(!setStorage('toyhaven_wishlist',list))renderWishlist();
  });
  container.addEventListener('click',e=> {
    const button=e.target.closest('.remove-wishlist-btn');if(!button)return;
    if(setStorage('toyhaven_wishlist',getWishlist().filter(i=>i.id!==Number(button.dataset.id))))renderWishlist();
  });
}
// Shared custom validation; text is trimmed so whitespace-only submissions fail.
function validateForm(form) {
  let firstInvalid=null;
  form.querySelectorAll('input[required],textarea[required]').forEach(field=> {
    field.value=field.value.trim();
    let message='';
    if(!field.value)message='Please complete this field.';
    else if(field.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value))message='Enter a valid email address.';
    else if(field.type!=='email'&&field.value.length<2)message='Please enter at least two characters.';
    field.setAttribute('aria-invalid',String(Boolean(message)));
    let error=document.getElementById(field.id+'-error');
    if(!error){error=document.createElement('span');error.id=field.id+'-error';error.className='field-error';field.after(error);field.setAttribute('aria-describedby',error.id);}
    error.textContent=message;if(message&&!firstInvalid)firstInvalid=field;
  });
  if(firstInvalid){firstInvalid.focus();showToast('Please check the highlighted fields.');return false;}return true;
}
function initForms() {
  document.querySelectorAll('#newsletter-form,#feedback-form,#checkout-form').forEach(form=> {form.noValidate=true;});
  const newsletter=$('#newsletter-form');
  if(newsletter)newsletter.addEventListener('submit',e=> {
    e.preventDefault();if(!validateForm(newsletter))return;
    const email=$('#newsletter-email').value.toLowerCase(),emails=getStorage('toyhaven_newsletter');
    if(emails.some(item=>item.email===email)){showToast('This email is already subscribed.');return;}
    emails.push({email,date:new Date().toISOString()});
    if(setStorage('toyhaven_newsletter',emails)){showToast('Thank you for subscribing!');newsletter.reset();}
  });
  const feedback=$('#feedback-form');
  if(feedback)feedback.addEventListener('submit',e=> {
    e.preventDefault();if(!validateForm(feedback))return;
    const list=getStorage('toyhaven_feedback');list.push({name:$('#feedback-name').value,email:$('#feedback-email').value,message:$('#feedback-msg').value,date:new Date().toISOString()});
    if(setStorage('toyhaven_feedback',list)){$('#form-feedback-message').textContent='Thank you! Your feedback has been saved in this browser.';feedback.reset();}
  });
}
function renderOrderHistory() {
  const target=$('#order-history');if(!target)return;
  target.innerHTML=getStorage('toyhaven_orders').slice().reverse().map(order=>`<article><h3>Order ${escapeHTML(order.id)}</h3><p>${escapeHTML(new Date(order.date).toLocaleString())} · ${escapeHTML(order.payment==='card'?'Card (simulation)':'Cash on Delivery')}</p><ul>${order.items.map(item=>`<li>${escapeHTML(item.title)} × ${item.quantity}</li>`).join('')}</ul><p>Total: ${money(order.totalCents)}</p></article>`).join('')||'<p>No orders yet.</p>';
}
function renderCheckout() {
  const cart=getCart();$('#checkout-item-list').innerHTML=cart.map(item=>`<li>${escapeHTML(item.title)} × ${item.quantity} — ${money(Math.round(item.price*100)*item.quantity)}</li>`).join('')||'<li>Your cart is empty.</li>';
  $('#checkout-total').textContent=money(cartTotal(cart));
}
function initCheckout() {
  const form=$('#checkout-form');if(!form)return;renderCheckout();renderOrderHistory();
  $('#success-modal').setAttribute('aria-label','Order confirmed');
  form.addEventListener('submit',e=> {
    e.preventDefault();if(!validateForm(form))return;
    const cart=getCart();if(!cart.length){showToast('Your cart is empty!');return;}
    const orders=getStorage('toyhaven_orders');
    // Store no payment card details: both options are simulations.
    orders.push({id:crypto.randomUUID(),date:new Date().toISOString(),customer:{name:$('#fullname').value,email:$('#email').value,address:$('#address').value},payment:form.elements.payment.value,items:cart,totalCents:cartTotal(cart)});
    if(!setStorage('toyhaven_orders',orders))return;
    if(!setStorage('toyhaven_cart',[])){showToast('Order saved, but cart could not be cleared. Please clear it before ordering again.');return;}
    form.reset();renderCheckout();renderOrderHistory();updateCartCount();$('#success-modal').showModal();
  });
  $('#close-modal-btn').addEventListener('click',()=>{$('#success-modal').close();});
  window.addEventListener('storage',e=>{if(e.key==='toyhaven_cart')renderCheckout();});
}
function initNavigation() {
  const button=$('.hamburger'),menu=$('#main-menu');if(!button||!menu)return;
  const close=()=>{button.setAttribute('aria-expanded','false');menu.classList.remove('nav-active');};
  button.addEventListener('click',()=>{const expanded=menu.classList.toggle('nav-active');button.setAttribute('aria-expanded',String(expanded));});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
  document.querySelectorAll('.faq-toggle').forEach(button=>button.addEventListener('click',()=>{
    const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));document.getElementById(button.getAttribute('aria-controls')).hidden=expanded;
  }));
}
function initReveal() {
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:0.08});
  document.querySelectorAll('.daily-feature,.scroll-showcase,.footer-newsletter').forEach(el=>{el.classList.add('reveal');observer.observe(el);});
}
document.addEventListener('DOMContentLoaded',()=> {
  initNavigation();initProducts();initProductSlideshow();initCart();initWishlist();initForms();initCheckout();updateCartCount();initReveal();
  if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{console.info('Offline mode is unavailable.');});
});
