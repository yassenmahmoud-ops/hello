import { fetchProducts } from './products.js';
import { Cart } from './cart.js';
import { showToast, showConfirm, pulseElement } from './ui.js';

let products = [];
const cart = new Cart();

function renderProduct(p) {
  const el = document.createElement('div');
  el.className = 'card flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg';
  el.style.animationDelay = `${(Number(p.id) - 1) * 80}ms`;
  el.innerHTML = `
    <div class="h-40 sm:h-44 md:h-48 bg-gray-100 overflow-hidden">
      <img src="${p.image}" alt="${p.title}" class="product-image w-full h-full object-cover" />
    </div>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="text-xs font-semibold uppercase tracking-wide text-indigo-600">${p.vendor}</div>
      <div class="text-base font-bold text-gray-900">${p.title}</div>
      <div class="text-sm leading-6 text-gray-600">${p.description ?? 'منتج عملي بتصميم جميل ومناسب للاستخدام اليومي.'}</div>
      <div class="mt-auto flex items-center justify-between pt-2">
        <div class="font-semibold text-gray-900">$${p.price}</div>
        <button data-id="${p.id}" class="motion-btn px-3 py-2 bg-indigo-600 text-white rounded-xl add-to-cart">أضف للسلة</button>
      </div>
    </div>
  `;
  return el;
}

function mountProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  products.forEach(p => grid.appendChild(renderProduct(p)));

  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = ev.currentTarget.getAttribute('data-id');
      const prod = products.find(p => p.id === id);
      if (prod) {
        cart.add(prod, 1);
        updateCartUI();
        showToast('تمت الإضافة إلى السلة');
        pulseElement(document.getElementById('cartCount'));
      }
    });
  });
}

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  const filtered = q ? products.filter(p => p.title.includes(q) || p.vendor.includes(q)) : products;
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  filtered.forEach(p => grid.appendChild(renderProduct(p)));
});

(async () => {
  products = await fetchProducts(12);
  mountProducts();
})();

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });
}

// Mobile nav action buttons
const mobileStoreBtn = document.getElementById('mobileStoreBtn');
const mobileCartBtn = document.getElementById('mobileCartBtn');
const mobileCheckoutBtn = document.getElementById('mobileCheckoutBtn');

if (mobileStoreBtn) {
  mobileStoreBtn.addEventListener('click', () => {
    if (mobileNav) mobileNav.classList.add('hidden');
    window.location.href = 'index.html';
  });
}

if (mobileCartBtn) {
  mobileCartBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (mobileNav) mobileNav.classList.add('hidden');
    // Match desktop cart button behavior: go to the checkout/cart page.
    window.location.href = 'checkout.html';
  });
}

if (mobileCheckoutBtn) {
  mobileCheckoutBtn.addEventListener('click', () => {
    if (mobileNav) mobileNav.classList.add('hidden');
    if (cartPanel) cartPanel.classList.remove('cart-open');
    setTimeout(() => { window.location.href = 'checkout.html'; }, 120);
  });
}

// cart UI
const cartToggle = document.getElementById('cartToggle');
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

// Always start with the cart panel closed on page load.
if (cartPanel) {
  cartPanel.classList.remove('cart-open');
}

function updateCartUI() {
  const count = cart.items.reduce((s, it) => s + it.qty, 0);
  cartCount.textContent = String(count);
  if (clearCartBtn) {
    clearCartBtn.classList.toggle('hidden', cart.items.length <= 1);
  }
  cartItemsEl.innerHTML = '';
  cart.items.forEach((it, index) => {
    const row = document.createElement('div');
    row.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-transparent transition duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm';
    row.style.animation = 'fade-up 320ms ease both';
    row.style.animationDelay = `${index * 45}ms`;
    row.innerHTML = `
      <div class="text-sm leading-6">
        ${it.product.title}
        <div class="text-xs text-gray-500">${it.product.vendor} — $${it.product.price}</div>
      </div>
      <div class="flex w-full sm:w-auto flex-wrap items-center gap-2 sm:justify-end">
        <button data-id="${it.product.id}" class="motion-btn decrease min-w-10 px-3 py-2 bg-gray-100 rounded-lg">-</button>
        <div class="min-w-10 px-3 py-2 text-center rounded-lg bg-white border border-gray-200">${it.qty}</div>
        <button data-id="${it.product.id}" class="motion-btn increase min-w-10 px-3 py-2 bg-gray-100 rounded-lg">+</button>
        <div class="font-semibold px-2 sm:pr-3">$${it.product.price * it.qty}</div>
        <button data-id="${it.product.id}" class="motion-btn remove flex-1 sm:flex-none px-3 py-2 bg-rose-500 text-white rounded-lg">حذف</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
    const dec = row.querySelector('.decrease');
    const inc = row.querySelector('.increase');
    const rem = row.querySelector('.remove');
    dec.addEventListener('click', () => {
      const newQty = it.qty - 1;
      if (newQty <= 0) {
        showConfirm({ title: 'حذف منتج', message: 'هل تريد حذف هذا المنتج من السلة؟' }).then(ok => {
          if (!ok) return;
          cart.remove(it.product.id);
          updateCartUI();
          showToast('تم حذف المنتج من السلة');
          pulseElement(document.getElementById('cartCount'));
        });
      } else {
        cart.updateQty(it.product.id, newQty);
        updateCartUI();
        showToast('تم تحديث كمية المنتج');
        pulseElement(document.getElementById('cartCount'));
      }
    });
    inc.addEventListener('click', () => {
      const newQty = it.qty + 1;
      cart.updateQty(it.product.id, newQty);
      updateCartUI();
      showToast('تم تحديث كمية المنتج');
      pulseElement(document.getElementById('cartCount'));
    });
    rem.addEventListener('click', () => {
      const maxRemovable = it.qty;
      const input = prompt(`أدخل كمية الحذف لـ ${it.product.title} من 1 إلى ${maxRemovable}`, String(maxRemovable));
      if (input === null) return;
      const removeQty = Number.parseInt(input, 10);
      if (!Number.isFinite(removeQty) || removeQty < 1 || removeQty > maxRemovable) {
        showToast('الكمية غير صحيحة');
        return;
      }
      const remainingQty = it.qty - removeQty;
      if (remainingQty <= 0) {
        cart.remove(it.product.id);
        showToast('تم حذف المنتج من السلة');
      } else {
        cart.updateQty(it.product.id, remainingQty);
        showToast('تم تحديث كمية المنتج');
      }
      updateCartUI();
      pulseElement(document.getElementById('cartCount'));
    });
  });
  cartTotalEl.textContent = `$${cart.total()}`;
  // Show checkout button only when cart has items
  if (checkoutBtn) {
    checkoutBtn.classList.toggle('hidden', cart.items.length === 0);
  }
  // mobile checkout visibility
  const mobileCheckoutBtnEl = document.getElementById('mobileCheckoutBtn');
  if (mobileCheckoutBtnEl) mobileCheckoutBtnEl.classList.toggle('hidden', cart.items.length === 0);
}

cartToggle.addEventListener('click', () => {
  window.location.href = 'checkout.html';
});

// init cart UI
updateCartUI();

// clear cart button (in cart panel)
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    showConfirm({ title: 'مسح السلة', message: 'هل تريد مسح كل المنتجات من السلة؟' }).then(ok => {
      if (!ok) return;
      cart.clear();
      updateCartUI();
      showToast('تم مسح السلة');
      pulseElement(document.getElementById('cartCount'));
    });
  });
}

// Checkout button navigates to checkout page
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cartPanel) cartPanel.classList.remove('cart-open');
    // small delay to allow close animation then navigate
    setTimeout(() => { window.location.href = 'checkout.html'; }, 120);
  });
}

// Contact form -> opens the user's email client with a prefilled message
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameEl = document.getElementById('contactName');
    const emailEl = document.getElementById('contactEmail');
    const subjectEl = document.getElementById('contactSubject');
    const messageEl = document.getElementById('contactMessage');

    const name = nameEl?.value.trim() || 'بدون اسم';
    const email = emailEl?.value.trim() || 'بدون بريد';
    const subject = subjectEl?.value.trim() || 'رسالة من موقع MarketPro';
    const message = messageEl?.value.trim() || 'لا توجد رسالة';

    const body = [
      `الاسم: ${name}`,
      `البريد: ${email}`,
      '',
      message,
    ].join('\n');

    const mailto = `mailto:contact@marketpro.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    contactForm.reset();
    showToast('تم تجهيز الرسالة وفتح البريد');
    setTimeout(() => {
      window.location.href = mailto;
    }, 120);
  });
}

const copyEmailBtn = document.getElementById('copyEmailBtn');
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', async () => {
    const email = 'contact@marketpro.com';
    try {
      await navigator.clipboard.writeText(email);
      showToast('تم نسخ الإيميل');
    } catch {
      showToast('تعذر نسخ الإيميل');
    }
  });
}

export {};