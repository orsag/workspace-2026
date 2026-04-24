import { Component, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { BookService } from '../../services/book-service';
import { AppStore } from '../../store/app-store';
import { IconComponent } from '../../components/icon/IconComponent';
import { CartStore } from '../../store/cart-store';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    NgOptimizedImage,
    CurrencyPipe,
    IconComponent,
    TranslocoDirective,
  ],
  templateUrl: './detail.html',
})
export class Detail {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private cartStore = inject(CartStore);
  readonly store = inject(AppStore);

  // Use optional chaining and a fallback to an empty string (or skip if null)
  isInCart = computed(() => {
    const currentBook = this.book();
    if (!currentBook || !currentBook.id) {
      return false;
    }
    return !!this.cartStore.itemsMap()[currentBook.id];
  });

  // 1. Reactively fetch the book based on the URL ID
  book = toSignal(
    this.route.params.pipe(
      switchMap((params) =>
        this.bookService.getOne(params['id']).pipe(
          catchError((error) => {
            console.error('Book fetch failed:', error);
            return of(null); // Return null so the UI can show an error state
          }),
        ),
      ),
    ),
  );

  handleCartAction() {
    const currentBook = this.book();
    if (currentBook) {
      if (this.isInCart()) {
        // If it's there, remove it
        this.cartStore.removeItem(currentBook.id);
      } else {
        // If it's not, add it
        this.cartStore.addToCart(currentBook);
      }
    }
  }

  readingHours = computed(() => {
    const pages = this.book()?.pageCount || 0;
    if (pages === 0) return 0;

    // Using 30 pages/hour as a baseline, rounded to 1 decimal place
    return Math.round((pages / 30) * 10) / 10;
  });
}
