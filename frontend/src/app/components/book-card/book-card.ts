import { Component, computed, inject, Input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { AppStore } from '../../store/app-store';
import { CartStore } from '../../store/cart-store';
import { IconComponent } from '../icon/IconComponent';

@Component({
  selector: 'app-book-card',
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage,
    CurrencyPipe,
    IconComponent,
  ],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCard {
  @Input({ required: true }) data!: Book;
  @Input() isPriority = false;
  private readonly cartStore = inject(CartStore);
  readonly store = inject(AppStore);

  // Reactive check: is this book in the user's favorite array?
  isFavorite = computed(
    () => this.store.user()?.favorites?.includes(this.data.id) ?? false,
  );

  toggleFavorite(bookId: string) {
    if (!this.store.isLoggedIn()) {
      // Show a toast or redirect to login
      return;
    }
    // We will build this method in the Store next!
    this.store.toggleFavorite(bookId);
  }

  onAddToCart() {
    this.cartStore.addToCart(this.data);
    console.log(`Added ${this.data.title} to cart!`);
  }
}
