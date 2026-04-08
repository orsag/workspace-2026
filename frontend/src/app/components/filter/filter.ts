import { Component, signal } from '@angular/core';
import { IconComponent } from '../icon/IconComponent';
import { ConfigurationService } from '../../services/configuration-service';
import { inject, computed } from '@angular/core';
import { BookService } from '../../services/book-service';
import { BookFilters } from '../../../types';

@Component({
  selector: 'app-filter',
  imports: [IconComponent],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  bookService = inject(BookService);
  config = inject(ConfigurationService);
  showFilter = computed(() => this.config.flags().SHOW_FILTER);

  filters = signal<BookFilters>({
    search: '',
    available: false,
    newReleases: false,
    discounted: false,
    bestsellers: false,
    sortBy: null,
    category: null,
  });

  // Update helper
  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  updateSort(target: 'popularity' | 'price') {
    const current = this.filters().sortBy;

    if (target === 'price') {
      const nextPrice = current === 'price_asc' ? 'price_desc' : 'price_asc';
      this.updateFilter('sortBy', nextPrice);
    } else {
      this.updateFilter('sortBy', 'popularity');
    }
  }

  onSubmit() {
    this.bookService.getFilteredBooks(this.filters());
  }

  public bookCategories: string[] = [
    'Fiction',
    'Non-fiction',
    'Fantasy',
    'Sci-Fi',
    'Romance',
    'History',
    'Biography',
    'Self-help',
    'Mystery',
  ];
}
