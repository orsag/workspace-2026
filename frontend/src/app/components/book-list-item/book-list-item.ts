import { Component, inject, Input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../store/cart-store';

@Component({
  selector: 'app-book-list-item',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe],
  templateUrl: './book-list-item.html',
  styleUrl: './book-list-item.css',
})
export class BookListItem {
  cartStore = inject(CartStore);
  @Input({ required: true }) data!: Book;
  @Input() isPriority = false;

  onAddToCart() {
    this.cartStore.addToCart(this.data);
    console.log(`Added ${this.data.title} to cart!`);
  }
}
