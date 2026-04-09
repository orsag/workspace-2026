import { computed, effect } from '@angular/core';
import { Book as IBook } from '@test-monorepo/shared-models';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';

export interface CartItem {
  book: IBook;
  quantity: number;
}

export interface CartState {
  itemsMap: Record<string, CartItem>;
  loading: boolean;
}

const initialState: CartState = {
  itemsMap: {},
  loading: false,
};

// Key for LocalStorage
const CART_STORAGE_KEY = 'app_cart_state';

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. Computed Selectors (derived state)
  withComputed(({ itemsMap }) => ({
    items: computed(() => Object.values(itemsMap())),
    subtotal: computed(() =>
      Object.values(itemsMap()).reduce(
        (acc, item) => acc + item.book.price * item.quantity,
        0,
      ),
    ),
    itemCount: computed(() =>
      Object.values(itemsMap()).reduce((acc, item) => acc + item.quantity, 0),
    ),
  })),

  withComputed(({ subtotal }) => ({
    tax: computed(() => subtotal() * 0.05),
    grandTotal: computed(() => subtotal() * 1.05), // total + 5% VAT
  })),

  // 2. Methods (actions)
  withMethods((store) => ({
    addToCart(book: IBook) {
      const currentMap = store.itemsMap();
      const existing = currentMap[book.id];

      patchState(store, {
        itemsMap: {
          ...currentMap,
          [book.id]: {
            book,
            quantity: existing ? existing.quantity + 1 : 1,
          },
        },
      });
    },

    updateQuantity(bookId: string, delta: number) {
      const currentMap = store.itemsMap();
      const item = currentMap[bookId];
      if (!item) return;

      const newQuantity = item.quantity + delta;

      if (newQuantity <= 0) {
        const { [bookId]: _, ...rest } = currentMap;
        patchState(store, { itemsMap: rest });
      } else {
        patchState(store, {
          itemsMap: {
            ...currentMap,
            [bookId]: { ...item, quantity: newQuantity },
          },
        });
      }
    },

    removeItem(bookId: string) {
      const { [bookId]: _, ...rest } = store.itemsMap();
      patchState(store, { itemsMap: rest });
    },

    clearCart() {
      patchState(store, { itemsMap: {} });
    },
  })),

  // 3. Storage Sync Logic
  withHooks({
    onInit(store) {
      // Load from LocalStorage
      const savedState = localStorage.getItem(CART_STORAGE_KEY);
      if (savedState) {
        patchState(store, JSON.parse(savedState));
      }

      // Sync to LocalStorage on every change
      effect(() => {
        const state = { itemsMap: store.itemsMap() };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      });
    },
  }),
);
