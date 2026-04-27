import { Component, OnInit, signal } from '@angular/core';
import { ConfigurationService } from '../../services/configuration-service';
import { inject, computed } from '@angular/core';
import { BookFilters } from '../../../types';
import { AppStore } from '../../store/app-store';
import { CATEGORIES } from '@test-monorepo/shared-models';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { ScrollService } from '../../services/scroll-service';
import { NoFocusJumpDirective } from '../../core/no-focus-jump.directive';
import { LucideSearch } from '@lucide/angular';

@Component({
  selector: 'app-filter',
  imports: [
    LucideSearch,
    TranslocoDirective,
    TranslocoPipe,
    NoFocusJumpDirective,
  ],
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter implements OnInit {
  store = inject(AppStore);
  router = inject(Router);
  config = inject(ConfigurationService);
  scroller = inject(ScrollService);
  bookCategories = CATEGORIES;

  showFilter = computed(() => this.config.flags().SHOW_FILTER);
  isCoolingDown = signal(false);
  toggles = [
    { key: 'isAvailable', label: 'available' },
    { key: 'isNewRelease', label: 'newReleases' },
    { key: 'isDiscounted', label: 'discounted' },
    { key: 'isBestSeller', label: 'bestsellers' },
  ] as const;

  // Initialize from store instead of hardcoded defaults
  filters = signal<BookFilters>({
    search: '',
    category: null,
    isAvailable: false,
    isBestSeller: false,
    isNewRelease: false,
    isDiscounted: false,
  });

  ngOnInit() {
    this.filters.set({
      search: this.store.filters.search(),
      category: this.store.filters.category(),
      isAvailable: this.store.filters.isAvailable(),
      isBestSeller: this.store.filters.isBestSeller(),
      isNewRelease: this.store.filters.isNewRelease(),
      isDiscounted: this.store.filters.isDiscounted(),
    });
  }

  // Update helper
  updateFilter<K extends keyof BookFilters>(key: K, value: BookFilters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  onSubmit() {
    if (this.isCoolingDown()) return;

    this.isCoolingDown.set(true);
    this.store.updateFilters(this.filters());

    const allowedRoutes = ['/', '/home', '/administration'];

    if (allowedRoutes.includes(this.router.url)) {
      this.scroller.scrollToTop();
    } else {
      this.router.navigate(['/']);
    }

    setTimeout(() => {
      this.isCoolingDown.set(false);
    }, 2000);
  }
}
