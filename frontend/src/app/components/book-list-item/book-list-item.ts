import { Component, computed, inject, Input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-book-list-item',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe, TranslocoDirective],
  templateUrl: './book-list-item.html',
  styleUrl: './book-list-item.css',
})
export class BookListItem {
  cartStore = inject(CartStore);
  @Input({ required: true }) data!: Book;
  @Input() isPriority = false;

  isInCart = computed(() => !!this.cartStore.itemsMap()[this.data.id]);

  handleCartAction() {
    if (this.isInCart()) {
      // If it's there, remove it
      this.cartStore.removeItem(this.data.id);
      console.log(`Removed ${this.data.title} from cart`);
    } else if(this.data.availableCount > 0) {
      // If it's not, add it
      this.cartStore.addToCart(this.data);
      console.log(`Added ${this.data.title} to cart`);
    }
  }
}
