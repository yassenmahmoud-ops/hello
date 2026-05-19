// Simple seller portal using localStorage
import { showToast, showConfirm } from './ui.js';

const STORAGE = 'marketpro_seller_products_v1';

function loadSellerProducts() { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch(e){ return []; } }
function saveSellerProducts(list) { localStorage.setItem(STORAGE, JSON.stringify(list)); }

function renderList() {
  const container = document.getElementById('sellerList');
  const clearSellerBtn = document.getElementById('clearSellerBtn');
  const list = loadSellerProducts();
  container.innerHTML = '';
  if (clearSellerBtn) {
    clearSellerBtn.classList.toggle('hidden', list.length <= 1);
  }
  list.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-xl border border-transparent transition duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm';
    row.style.animation = 'fade-up 320ms ease both';
    row.style.animationDelay = `${i * 45}ms`;
    row.innerHTML = `<div><div class="font-medium">${p.title}</div><div class="text-xs text-gray-500">${p.vendor} — $${p.price} — الكمية: ${p.qty ?? 1}</div></div><div class="flex gap-2"><button data-i="${i}" class="motion-btn deleteBtn px-2 py-1 text-sm bg-rose-500 text-white rounded-lg">حذف</button></div>`;
    container.appendChild(row);
  });
  container.querySelectorAll('.deleteBtn').forEach(b => b.addEventListener('click', (e)=>{
    const idx = Number(e.currentTarget.getAttribute('data-i'));
    showConfirm({ title: 'حذف منتج', message: 'هل تريد حذف هذا المنتج نهائيًا؟' }).then(ok => {
      if (!ok) return;
      const list = loadSellerProducts(); list.splice(idx,1); saveSellerProducts(list); renderList(); showToast('تم حذف المنتج');
    });
  }));
}

const clearSellerBtn = document.getElementById('clearSellerBtn');
if (clearSellerBtn) {
  clearSellerBtn.addEventListener('click', () => {
    showConfirm({ title: 'حذف الكل', message: 'هل تريد حذف كل منتجات البائع؟' }).then(ok => {
      if (!ok) return;
      saveSellerProducts([]);
      renderList();
      showToast('تم حذف كل المنتجات');
    });
  });
}

document.getElementById('addProductForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('pTitle').value.trim();
  const price = Number(document.getElementById('pPrice').value) || 0;
  const vendor = document.getElementById('pVendor').value.trim() || 'مجهول';
  const qty = Math.max(1, Number(document.getElementById('pQty').value) || 1);
  if (!title) { showToast('اكتب اسم المنتج'); return; }
  const list = loadSellerProducts();
  const product = { id: Date.now().toString(), title, price, vendor, qty };
  list.unshift(product);
  saveSellerProducts(list);
  document.getElementById('addProductForm').reset();
  renderList();
  showToast('تم إضافة المنتج مع الكمية');
});

renderList();

export {};
