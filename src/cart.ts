import type { Product } from './products';

export type CartItem = { product: Product; qty: number };

const STORAGE_KEY = 'marketpro_cart_v1';

export class Cart {
  items: CartItem[] = [];

  constructor() {
    this.load();
  }

  add(product: Product, qty = 1) {
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else this.items.push({ product, qty });
    this.save();
  }

  remove(productId: string) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  total() {
    return this.items.reduce((s, it) => s + it.product.price * it.qty, 0);
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Failed to save cart', e);
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.items = JSON.parse(raw);
    } catch (e) {
      this.items = [];
    }
  }
}

export default Cart;
