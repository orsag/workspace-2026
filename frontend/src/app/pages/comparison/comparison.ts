import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AppStore } from '../../store/app-store';
import { ToastService } from '../../services/toast-service';
import { Book } from '@test-monorepo/libs';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-book-comparator',
  imports: [CommonModule, NgOptimizedImage, TranslocoDirective],
  templateUrl: './comparison.html',
  styleUrl: './comparison.css',
})
export class Comparison {
  store = inject(AppStore);
  cartStore = inject(CartStore);
  favorites = this.store.user()?.favorites;
  toast = inject(ToastService);
  favoriteBooks = this.store.favoriteBooks;

  // Track selected books for comparison
  selectedLeft = signal<Book | null>(null);
  selectedRight = signal<Book | null>(null);

  isInCartLeft = computed(() => {
    const book = this.selectedLeft();
    return !!book && !!this.cartStore.itemsMap()[book.id];
  });

  isInCartRight = computed(() => {
    const book = this.selectedRight();
    return !!book && !!this.cartStore.itemsMap()[book.id];
  });

  // Helper to get keys for the comparison rows (excluding ID and images)
  readonly comparisonMap: Partial<Record<keyof Book, string>> = {
    title: 'comparison.title',
    author: 'comparison.author',
    price: 'comparison.price',
    category: 'comparison.category',
    pageCount: 'comparison.pageCount',
    publisher: 'comparison.publisher',
    publishedDate: 'comparison.publishedDate',
    popularity: 'comparison.popularity',
    isbn: 'comparison.isbn',
  };

  comparisonFields = Object.entries(this.comparisonMap) as [
    keyof Book,
    string,
  ][];

  selectBook(book: Book, side: 'left' | 'right') {
    if (side === 'left') this.selectedLeft.set(book);
    else this.selectedRight.set(book);
  }

  formatValue(value: any, key: keyof Book): string {
    if (value === null || value === undefined) return '—';

    if (key === 'price') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    if (key === 'publishedDate' && value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (key === 'popularity') {
      return `${value} / 10`;
    }

    return String(value);
  }

  handleCartAction(book: Book | null) {
    if (book) {
      if (this.cartStore.itemsMap()[book.id]) {
        this.cartStore.removeItem(book.id);
      } else {
        this.cartStore.addToCart(book);
      }
    }
  }
}
