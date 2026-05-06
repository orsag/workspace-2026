import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { AppState, AppStore } from '../../store/app-store';
import { QuickFilterState } from '../../../types';
import { CartStore } from '../../store/cart-store';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { FilterItem } from '../../../types';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-filter-bar',
  imports: [RouterLink, TranslocoDirective, NgOptimizedImage],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  store = inject(AppStore);
  cartStore = inject(CartStore);
  isCoolingDown = signal(false);
  private isFirstRun = true;

  // Inside your component class:
  filters = signal<FilterItem[]>([
    {
      label: 'bar.all',
      icon: 'all',
      style: 'outline',
      isActive: () => this.activeMode() === 'all',
      action: () => this.reset(),
    },
    // {
    //   label: 'bar.bestsellers',
    //   icon: 'bestsellers',
    //   style: 'outline',
    //   isActive: () => this.activeMode() === 'bestSellers',
    //   action: () => this.setMode('bestSellers'),
    // },
    // {
    //   label: 'bar.new_releases',
    //   icon: 'newreleases',
    //   style: 'outline',
    //   isActive: () => this.activeMode() === 'newReleases',
    //   action: () => this.setMode('newReleases'),
    // },
    {
      label: 'bar.most_expensive',
      icon: 'expensive',
      style: 'outline',
      isActive: () => this.activeSort() === 'price_desc',
      action: () => this.setSort('price_desc'),
    },
    {
      label: 'bar.cheapest',
      icon: 'cheapest',
      style: 'outline',
      isActive: () => this.activeSort() === 'price_asc',
      action: () => this.setSort('price_asc'),
    },
    // {
    //   label: 'bar.highest_discount',
    //   icon: 'discount',
    //   style: 'outline',
    //   isActive: () => this.activeMode() === 'discounted',
    //   action: () => this.setMode('discounted'),
    // },
  ]);

  // 1. The Single Source of Truth
  protected filterState = signal<QuickFilterState>({
    mode: 'all',
    sortBy: null,
  });

  // 2. Derive helper for the UI "active" classes
  protected activeMode = computed(() => this.filterState().mode);
  protected activeSort = computed(() => this.filterState().sortBy);

  setMode(mode: QuickFilterState['mode']) {
    this.filterState.set({
      mode: mode,
      sortBy: null,
    });
  }

  setSort(sort: QuickFilterState['sortBy']) {
    this.filterState.update((state) => ({
      mode: 'all',
      sortBy: state.sortBy === sort ? null : sort,
    }));
  }

  reset() {
    this.filterState.set({ mode: 'all', sortBy: null });
  }

  // 4. React to changes (The "Wiring")
  // Whenever filterState changes, this effect triggers the update
  private filterEffect = effect(() => {
    // 1. The Trigger: This makes the effect run whenever filterState changes
    const state = this.filterState();

    // 2. Use untracked so the store update doesn't cause a loop
    untracked(() => {
      if (this.isFirstRun) {
        this.isFirstRun = false;
        return;
      }
      // 3. The Guard: Stop if we are in cooldown
      if (this.isCoolingDown()) return;

      this.isCoolingDown.set(true);

      let filters: Partial<AppState['filters']>;

      if (state.sortBy === 'price_asc' || state.sortBy === 'price_desc') {
        filters = {
          page: 1,
          sortBy: state.sortBy,
        };
      } else if (state.mode === 'all') {
        filters = {
          page: 1,
          sortBy: null,
        };
      } else {
        filters = {
          page: 1,
          sortBy: state.sortBy,
        };
      }

      // This change won't trigger the effect again because it's untracked
      this.store.updateFilters(filters);

      setTimeout(() => {
        this.isCoolingDown.set(false);
      }, 500);
    });
  });
}
