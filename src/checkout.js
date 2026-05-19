// Checkout page script: reads cart from localStorage
const CART_KEY = 'marketpro_cart_v1';

import { showToast, showConfirm } from './ui.js';

function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e){ return []; } }

function renderCheckout() {
  const items = loadCart();
  const container = document.getElementById('checkoutItems');
  const clearCheckoutBtn = document.getElementById('clearCheckoutBtn');
  container.innerHTML = '';
  let total = 0;
  if (clearCheckoutBtn) {
    clearCheckoutBtn.classList.toggle('hidden', items.length <= 1);
  }
  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-xl border border-transparent transition duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm';
    row.style.animation = 'fade-up 320ms ease both';
    row.innerHTML = `<div><div class="font-medium">${it.product.title}</div><div class="text-xs text-gray-500">${it.qty} × $${it.product.price}</div></div><div class="flex items-center gap-2"><div class="font-semibold">$${it.product.price * it.qty}</div><button data-id="${it.product.id}" class="motion-btn removeItem px-2 py-1 bg-rose-500 text-white rounded-lg">حذف</button></div>`;
    container.appendChild(row);
    const rem = row.querySelector('.removeItem');
    rem.addEventListener('click', () => {
      showConfirm({ title: 'حذف منتج', message: 'هل تريد حذف هذا المنتج من السلة؟' }).then(ok => {
        if (!ok) return;
        const filtered = items.filter(x => x.product.id !== it.product.id);
        localStorage.setItem(CART_KEY, JSON.stringify(filtered));
        renderCheckout();
        showToast('تم حذف المنتج');
      });
    });
    total += it.product.price * it.qty;
  });
  document.getElementById('checkoutTotal').textContent = `$${total}`;
}

const clearCheckoutBtn = document.getElementById('clearCheckoutBtn');
if (clearCheckoutBtn) {
  clearCheckoutBtn.addEventListener('click', () => {
    showConfirm({ title: 'حذف الكل', message: 'هل تريد حذف كل المنتجات من السلة؟' }).then(ok => {
      if (!ok) return;
      localStorage.removeItem(CART_KEY);
      showToast('تم حذف كل المنتجات');
      renderCheckout();
    });
  });
}

document.getElementById('checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  // mock place order
  localStorage.removeItem(CART_KEY);
  showToast('تم إنشاء الطلب (تجريبي)');
  renderCheckout();
});

renderCheckout();

export {};
