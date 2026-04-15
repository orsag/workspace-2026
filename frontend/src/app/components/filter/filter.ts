import { Component, signal } from '@angular/core';
import { IconComponent } from '../icon/IconComponent';
import { ConfigurationService } from '../../services/configuration-service';
import { inject, computed } from '@angular/core';
import { BookFilters } from '../../../types';
import { AppStore } from '../../store/app-store';
import { CATEGORIES } from '@test-monorepo/shared-models';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { ScrollService } from '../../services/scroll-service';

@Component({
  selector: 'app-filter',
  imports: [IconComponent, TranslocoDirective, TranslocoPipe],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  store = inject(AppStore);
  router = inject(Router);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);

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

    if (this.router.url !== '/home' && this.router.url !== '/') {
      this.router.navigate(['/']);
    } else {
      this.scroller.scrollToTop();
    }

    setTimeout(() => {
      this.isCoolingDown.set(false);
    }, 2000);
  }
}
