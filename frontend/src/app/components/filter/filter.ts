import { Component, signal } from '@angular/core';
import { IconComponent } from '../icon/IconComponent';
import { ConfigurationService } from '../../services/configuration-service';
import { inject, computed } from '@angular/core';
import { BookFilters } from '../../../types';
import { AppStore } from '../../store/app-store';
import { CATEGORIES } from '@test-monorepo/shared-models';

@Component({
  selector: 'app-filter',
  imports: [IconComponent],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  store = inject(AppStore);
  config = inject(ConfigurationService);

  showFilter = computed(() => this.config.flags().SHOW_FILTER);
  isCoolingDown = signal(false);
  filters = signal<BookFilters>({
    search: '',
    category: null,
    sortBy: null,
    isAvailable: false,
    isBestSeller: false,
    isNewRelease: false,
    isDiscounted: false,
  });

  bookCategories = CATEGORIES;

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
    if (this.isCoolingDown()) return;

    this.isCoolingDown.set(true);
    this.store.updateFilters(this.filters());

    setTimeout(() => {
      this.isCoolingDown.set(false);
    }, 3000);
  }
}
