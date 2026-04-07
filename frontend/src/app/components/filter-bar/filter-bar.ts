import { Component, computed, effect, inject, signal } from '@angular/core';
import { BookService, QuickFilterState } from '../../services/book';

@Component({
  selector: 'app-filter-bar',
  imports: [],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar {
  bookService = inject(BookService); // this.bookService.getQuickFilterBooks()

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
    this.filterState.update((state) => ({
      ...state,
      mode,
      // If we switch to 'soldOut', we don't need to manually reset others
      // because 'mode' is now a single string value!
    }));
  }

  setSort(sort: QuickFilterState['sortBy']) {
    this.filterState.update((state) => ({
      ...state,
      // Toggle sort off if clicked again
      sortBy: state.sortBy === sort ? null : sort,
    }));
  }

  reset() {
    this.filterState.set({ mode: 'all', sortBy: null });
  }

  // 4. React to changes (The "Wiring")
  // Whenever filterState changes, this effect triggers the service
  private filterEffect = effect(() => {
    const state = this.filterState();
    this.bookService.getQuickFilterBooks(state);
  });
}
