import type { Product } from './products';
import { fetchProducts } from './products';
import { Cart } from './cart';

let products: Product[] = [];
const cart = new Cart();

function renderProduct(p: Product) {
  const el = document.createElement('div');
  el.className = 'card flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg';
  el.style.animationDelay = `${(Number(p.id) - 1) * 80}ms`;
  el.innerHTML = `
    <div class="h-48 bg-gray-100 overflow-hidden">
      <img src="${p.image}" alt="${p.title}" class="product-image h-full w-full object-cover" />
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
  const grid = document.getElementById('productsGrid') as HTMLElement;
  grid.innerHTML = '';
  products.forEach(p => grid.appendChild(renderProduct(p)));

  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = (ev.currentTarget as HTMLElement).getAttribute('data-id');
      const prod = products.find(p => p.id === id);
      if (prod) {
        cart.add(prod, 1);
        updateCartUI();
        alert(`أضيف ${prod.title} للسلة`);
      }
    });
  });
}

// search
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  const filtered = q ? products.filter(p => p.title.includes(q) || p.vendor.includes(q)) : products;
  const grid = document.getElementById('productsGrid') as HTMLElement;
  grid.innerHTML = '';
  filtered.forEach(p => grid.appendChild(renderProduct(p)));
});

// initial async load
(async () => {
  products = await fetchProducts(12);
  mountProducts();
})();

// cart UI
const cartToggle = document.getElementById('cartToggle');
const cartCount = document.getElementById('cartCount');
const cartPanel = document.getElementById('cartPanel');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');

function updateCartUI() {
  const count = cart.items.reduce((s, it) => s + it.qty, 0);
  cartCount.textContent = String(count);
  if (clearCartBtn) {
    clearCartBtn.classList.toggle('hidden', cart.items.length <= 1);
  }
  cartItemsEl.innerHTML = '';
  cart.items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
    row.innerHTML = `
      <div class="text-sm">
        ${it.product.title}
        <div class="text-xs text-gray-500">${it.product.vendor} — $${it.product.price}</div>
      </div>
      <div class="flex items-center gap-2">
        <button data-id="${it.product.id}" class="decrease px-2 py-1 bg-gray-100 rounded">-</button>
        <div class="px-2">${it.qty}</div>
        <button data-id="${it.product.id}" class="increase px-2 py-1 bg-gray-100 rounded">+</button>
        <div class="font-semibold pr-3">$${it.product.price * it.qty}</div>
        <button data-id="${it.product.id}" class="remove px-2 py-1 bg-rose-500 text-white rounded">حذف</button>
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
        alert('الكمية غير صحيحة');
        return;
      }
      const remainingQty = it.qty - removeQty;
      if (remainingQty <= 0) {
        cart.remove(it.product.id);
      } else {
        cart.updateQty(it.product.id, remainingQty);
      }
      updateCartUI();
      alert(remainingQty <= 0 ? `تم حذف ${it.product.title} من السلة` : 'تم تحديث كمية المنتج');
    });
  });
  cartTotalEl.textContent = `$${cart.total()}`;
}

cartToggle.addEventListener('click', () => {
  if (cartPanel.classList.contains('cart-open')) {
    cartPanel.classList.remove('cart-open');
  } else {
    updateCartUI();
    cartPanel.classList.add('cart-open');
  }
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

// export for tests if needed
export {};