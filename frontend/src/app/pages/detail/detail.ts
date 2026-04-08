import { Component, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { BookService } from '../../services/book-service';
import { AppStore } from '../../store/app-store';
import { IconComponent } from '../../components/icon/IconComponent';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, NgOptimizedImage, CurrencyPipe, IconComponent],
  templateUrl: './detail.html',
})
export class Detail {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  readonly store = inject(AppStore);

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

  // 2. Reuse your favorite logic
  isFavorite = computed(() => {
    const currentBook = this.book();
    return currentBook
      ? this.store.user()?.favorites.includes(currentBook.id)
      : false;
  });

  toggleFavorite() {
    const currentBook = this.book();
    if (currentBook) {
      this.store.toggleFavorite(currentBook.id);
    }
  }

  addToCart() {
    const currentBook = this.book();
    if (currentBook) {
      // Future logic for cart
      console.log('Added to cart:', currentBook.title);
    }
  }

  readingHours = computed(() => {
    const pages = this.book()?.pageCount || 0;
    if (pages === 0) return 0;

    // Using 30 pages/hour as a baseline, rounded to 1 decimal place
    return Math.round((pages / 30) * 10) / 10;
  });
}
