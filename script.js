// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProductSlideshow();
  initNewsletter();
  initGlobalProductButtons(); // Combined click listener for homepage & products page

  // Page specific functions
  if (document.getElementById('filter-form')) initProductCatalog();
  if (document.getElementById('cart-list')) initCartPage();
  if (document.getElementById('checkout-form')) initCheckoutPage();
  if (document.getElementById('wishlist-container')) initWishlistPage();
  if (document.getElementById('feedback-form')) initSupportPage();
  if (document.querySelector('.scroll-showcase')) initScrollShowcase();
});

// Mobile menu toggle
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navUl = document.querySelector('nav ul');

  if (hamburger && navUl) {
    hamburger.addEventListener('click', () => {
      const expanded = navUl.classList.toggle('nav-active');
      hamburger.setAttribute('aria-expanded', String(expanded));
    });
  }
}

// LocalStorage helpers
function getStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Newsletter subscription
function initNewsletter() {
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value;
      showToast(`Thank you for subscribing, ${email}!`);
      newsletterForm.reset();
    });
  }
}

// Homepage scroll arrow functionality
function initScrollShowcase() {
  const container = document.querySelector('.scroll-container');
  const leftBtn = document.querySelector('.scroll-arrow.left');
  const rightBtn = document.querySelector('.scroll-arrow.right');

  if (container && leftBtn && rightBtn) {
    leftBtn.addEventListener('click', () => {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', () => {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }
}

// Global click listener for Add to Cart and Wishlist (Works on Homepage & Products page)
function initGlobalProductButtons() {
  document.addEventListener('click', (e) => {
    const isAddCart = e.target.classList.contains('add-cart-btn');
    const isAddWishlist = e.target.classList.contains('add-wishlist-btn');

    if (!isAddCart && !isAddWishlist) return;

    const card = e.target.closest('.product-card');
    if (!card) return;

    const title = card.querySelector('h3').textContent.trim();
    const priceText = card.querySelector('.price').textContent.replace('$', '').trim();
    const price = parseFloat(priceText);
    const imgSrc = card.querySelector('img').src;

    if (isAddCart) {
      addToCart({ title, price, imgSrc, quantity: 1 });
      showToast(`${title} added to cart!`);
    }

    if (isAddWishlist) {
      addToWishlist({ title, imgSrc, status: 'Interested' });
      showToast(`${title} added to wishlist!`);
    }
  });
}

// Search and filter on Products page
function initProductCatalog() {
  const searchInput = document.getElementById('product-search');
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  const productCards = document.querySelectorAll('.product-catalog .product-card');

  function filterProducts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = Array.from(categoryRadios).find(r => r.checked)?.value || 'all';

    productCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const category = card.getAttribute('data-category');

      const matchesSearch = title.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

      card.style.display = (matchesSearch && matchesCategory) ? 'flex' : 'none';
    });
  }

  if (searchInput) searchInput.addEventListener('input', filterProducts);
  categoryRadios.forEach(radio => radio.addEventListener('change', filterProducts));
}

// Save item to cart storage
function addToCart(item) {
  let cart = getStorage('toyhaven_cart');
  const existingItem = cart.find(i => i.title === item.title);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }
  setStorage('toyhaven_cart', cart);
}

// Save item to wishlist storage
function addToWishlist(item) {
  let wishlist = getStorage('toyhaven_wishlist');
  if (!wishlist.some(w => w.title === item.title)) {
    wishlist.push(item);
    setStorage('toyhaven_wishlist', wishlist);
  }
}

// Cart page logic
function initCartPage() {
  renderCart();

  const cartList = document.getElementById('cart-list');
  const clearCartBtn = document.getElementById('clear-cart-btn');

  if (cartList) {
    cartList.addEventListener('click', (e) => {
      let cart = getStorage('toyhaven_cart');
      const itemIndex = e.target.dataset.index;

      if (e.target.classList.contains('remove-btn')) {
        cart.splice(itemIndex, 1);
      } else if (e.target.classList.contains('qty-plus')) {
        cart[itemIndex].quantity += 1;
      } else if (e.target.classList.contains('qty-minus')) {
        if (cart[itemIndex].quantity > 1) {
          cart[itemIndex].quantity -= 1;
        }
      }

      setStorage('toyhaven_cart', cart);
      renderCart();
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      localStorage.removeItem('toyhaven_cart');
      renderCart();
    });
  }
}

// Render cart items and calculate total
function renderCart() {
  const cartList = document.getElementById('cart-list');
  const cartTotalDisplay = document.getElementById('cart-total');
  if (!cartList) return;

  const cart = getStorage('toyhaven_cart');
  cartList.innerHTML = '';

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-state">Your shopping cart is currently empty.<br><a class="cta-btn" href="products.html">Explore products</a></li>';
    if (cartTotalDisplay) cartTotalDisplay.textContent = '$0.00';
    return;
  }

  let grandTotal = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    grandTotal += subtotal;

    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <article>
        <img src="${item.imgSrc}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p class="unit-price">$${item.price.toFixed(2)}</p>
        <form class="quantity-controls" onsubmit="return false;">
          <button type="button" class="qty-minus" data-index="${index}">-</button>
          <input type="number" value="${item.quantity}" readonly>
          <button type="button" class="qty-plus" data-index="${index}">+</button>
        </form>
        <p class="subtotal">Subtotal: $${subtotal.toFixed(2)}</p>
        <button type="button" class="remove-btn" data-index="${index}">Remove</button>
      </article>
    `;
    cartList.appendChild(li);
  });

  if (cartTotalDisplay) {
    cartTotalDisplay.textContent = `$${grandTotal.toFixed(2)}`;
  }
}

// Checkout page summary and modal popup
function initCheckoutPage() {
  const checkoutList = document.getElementById('checkout-item-list');
  const checkoutTotalDisplay = document.getElementById('checkout-total');
  const checkoutForm = document.getElementById('checkout-form');
  const modal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  const cart = getStorage('toyhaven_cart');
  let grandTotal = 0;

  if (checkoutList) {
    checkoutList.innerHTML = '';
    cart.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      grandTotal += itemSubtotal;
      const li = document.createElement('li');
      li.textContent = `${item.title} x ${item.quantity} - $${itemSubtotal.toFixed(2)}`;
      checkoutList.appendChild(li);
    });
  }

  if (checkoutTotalDisplay) {
    checkoutTotalDisplay.textContent = `$${grandTotal.toFixed(2)}`;
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
      }
      
      localStorage.removeItem('toyhaven_cart');
      if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        showToast('Order Confirmed! Thank you for shopping at Toy Haven.');
        window.location.href = 'index.html';
      }
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.close();
      window.location.href = 'index.html';
    });
  }
}

// Wishlist page logic
function initWishlistPage() {
  renderWishlist();

  const container = document.getElementById('wishlist-container');
  if (container) {
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-wishlist-btn')) {
        const index = e.target.dataset.index;
        let wishlist = getStorage('toyhaven_wishlist');
        wishlist.splice(index, 1);
        setStorage('toyhaven_wishlist', wishlist);
        renderWishlist();
      }
    });

    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-select')) {
        const index = e.target.dataset.index;
        let wishlist = getStorage('toyhaven_wishlist');
        wishlist[index].status = e.target.value;
        setStorage('toyhaven_wishlist', wishlist);
      }
    });
  }
}

// Render wishlist items
function renderWishlist() {
  const container = document.getElementById('wishlist-container');
  if (!container) return;

  const wishlist = getStorage('toyhaven_wishlist');
  container.innerHTML = '';

  if (wishlist.length === 0) {
    container.innerHTML = '<div class="empty-state">Save your favourites here for later.<br><a class="cta-btn" href="products.html">Explore products</a></div>';
    return;
  }

  wishlist.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'wishlist-card';
    card.innerHTML = `
      <figure>
        <img src="${item.imgSrc}" alt="${item.title}">
      </figure>
      <h2>${item.title}</h2>
      <form class="status-selector" onsubmit="return false;">
        <label for="status-${index}">Status:</label>
        <select id="status-${index}" class="status-select" data-index="${index}">
          <option value="Interested" ${item.status === 'Interested' ? 'selected' : ''}>Interested</option>
          <option value="Owned" ${item.status === 'Owned' ? 'selected' : ''}>Owned</option>
          <option value="Not Interested" ${item.status === 'Not Interested' ? 'selected' : ''}>Not Interested</option>
        </select>
      </form>
      <button type="button" class="remove-wishlist-btn" data-index="${index}">Remove Item</button>
    `;
    container.appendChild(card);
  });
}

// Support page feedback form
function initSupportPage() {
  const feedbackForm = document.getElementById('feedback-form');
  const outputMsg = document.getElementById('form-feedback-message');

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('feedback-name').value;
      
      if (outputMsg) {
        outputMsg.textContent = `Thank you, ${name}! Your feedback has been submitted successfully.`;
        outputMsg.style.color = '#10B981';
      }
      feedbackForm.reset();
    });
  }
}
// Non-blocking feedback keeps the shopping interface in view.
let toastTimer;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.textContent = ''; }, 4000);
}

// Automatically show one full product at a time, without changing page scrolling.
function initProductSlideshow() {
  const carousel = document.querySelector('.product-slideshow');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const controls = carousel.querySelector('.slideshow-controls');
  const counter = carousel.querySelector('.slide-counter');
  const announcement = carousel.querySelector('.slide-announcement');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = motion.matches;
  let focused = false;
  let timer;
  controls.hidden = false;

  function schedule() {
    clearTimeout(timer);
    if (!paused && !focused && !document.hidden) {
      timer = setTimeout(() => show(index + 1, false), 10000);
    }
  }
  function show(next, manual) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== index;
      slide.classList.toggle('is-entering', i === index);
    });
    counter.textContent = `${index + 1} / ${slides.length}`;
    if (manual) announcement.textContent = slides[index].querySelector('h2').textContent;
    schedule();
  }
  carousel.querySelector('.slide-prev').addEventListener('click', () => show(index - 1, true));
  carousel.querySelector('.slide-next').addEventListener('click', () => show(index + 1, true));
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1), true);
    }
  });
  document.addEventListener('visibilitychange', schedule);
  function updateMotion() { paused = motion.matches; schedule(); }
  if (motion.addEventListener) motion.addEventListener('change', updateMotion);
  else motion.addListener(updateMotion);
  schedule();
}
