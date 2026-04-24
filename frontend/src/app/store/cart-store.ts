import { computed, effect, inject } from '@angular/core';
import { Book as IBook } from '@test-monorepo/shared-models';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { BookService } from '../services/book-service';

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

    // Opravený subtotal, ktorý berie do úvahy zľavu
    subtotal: computed(() =>
      Object.values(itemsMap()).reduce((acc, item) => {
        const discountedPrice = item.book.price * (1 - item.book.discount);
        return acc + discountedPrice * item.quantity;
      }, 0),
    ),

    itemCount: computed(() =>
      Object.values(itemsMap()).reduce((acc, item) => acc + item.quantity, 0),
    ),

    totalSavings: computed(() =>
      Object.values(itemsMap()).reduce((acc, item) => {
        if (item.book.discount > 0) {
          const savingsPerItem = item.book.price * item.book.discount;
          return acc + savingsPerItem * item.quantity;
        }
        return acc;
      }, 0),
    ),
  })),

  withComputed(({ subtotal }) => ({
    tax: computed(() => subtotal() * 0.05),
    grandTotal: computed(() => subtotal() * 1.05), // total + 5% VAT
  })),

  // 2. Methods (actions)
  withMethods((store, bookService = inject(BookService)) => ({
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

    // inside withMethods in cart-store.ts
    syncCartWithServer() {
      const ids = Object.keys(store.itemsMap());

      if (ids.length === 0) return;

      patchState(store, { loading: true });

      bookService.getFavorites(ids).subscribe({
        next: (freshBooks) => {
          const currentMap = { ...store.itemsMap() };
          const freshIds = new Set(freshBooks.map((b) => b.id));
          let hasChanges = false;

          freshBooks.forEach((freshBook) => {
            const item = currentMap[freshBook.id];
            if (item) {
              if (
                item.book.price !== freshBook.price ||
                item.book.discount !== freshBook.discount
              ) {
                currentMap[freshBook.id] = { ...item, book: freshBook };
                hasChanges = true;
              }
            }
          });

          // Optional: Remove items from cart that are no longer in the DB
          Object.keys(currentMap).forEach((id) => {
            if (!freshIds.has(id)) {
              delete currentMap[id];
              hasChanges = true;
            }
          });

          if (hasChanges) {
            patchState(store, { itemsMap: currentMap });
          }
          patchState(store, { loading: false });
        },
        error: () => patchState(store, { loading: false }),
      });
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
