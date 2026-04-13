import { Component, computed, inject, Input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AppStore } from '../../store/app-store';
import { CartStore } from '../../store/cart-store';
import { PriceTagComponent } from '../common/price-tag.component';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-book-card',
  imports: [CommonModule, RouterLink, NgOptimizedImage, TranslocoDirective],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCard {
  @Input({ required: true }) data!: Book;
  private readonly cartStore = inject(CartStore);
  readonly store = inject(AppStore);

  // Reactive check: is this book in the user's favorite array?
  isFavorite = computed(
    () => this.store.user()?.favorites?.includes(this.data.id) ?? false,
  );

  isInCart = computed(() => !!this.cartStore.itemsMap()[this.data.id]);

  toggleFavorite(bookId: string) {
    if (!this.store.isLoggedIn()) {
      // Show a common or redirect to login
      return;
    }
    // We will build this method in the Store next!
    this.store.toggleFavorite(bookId);
  }

  handleCartAction() {
    if (this.isInCart()) {
      // If it's there, remove it
      this.cartStore.removeItem(this.data.id);
    } else {
      // If it's not, add it
      this.cartStore.addToCart(this.data);
    }
  }
}
