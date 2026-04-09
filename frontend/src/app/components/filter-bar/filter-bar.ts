import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { AppStore } from '../../store/app-store';
import { QuickFilterState } from '../../../types';
import { CartStore } from '../../store/cart-store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-filter-bar',
  imports: [RouterLink],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  store = inject(AppStore);
  cartStore = inject(CartStore);
  isCoolingDown = signal(false);
  private isFirstRun = true;

  // 1. The Single Source of Truth
  protected filterState = signal<QuickFilterState>({
    mode: 'all',
    sortBy: null,
  });

  // 2. Derive helper for the UI "active" classes
  protected activeMode = computed(() => this.filterState().mode);
  protected activeSort = computed(() => this.filterState().sortBy);

  // 3. Simple State Transitions
  setMode(mode: QuickFilterState['mode']) {
    this.filterState.update((state) => ({ ...state, mode }));
  }

  setSort(sort: QuickFilterState['sortBy']) {
    this.filterState.update((state) => ({
      ...state,
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

      const filters = {
        page: 1,
        bestsellers: state.mode === 'bestsellers',
        newReleases: state.mode === 'newReleases',
        discounted: state.mode === 'discounted',
        available: state.mode !== 'soldOut',
        soldOut: state.mode === 'soldOut',
        sortBy: state.sortBy,
      };

      // This change won't trigger the effect again because it's untracked
      this.store.updateFilters(filters);

      setTimeout(() => {
        this.isCoolingDown.set(false);
      }, 1500);
    });
  });
}
