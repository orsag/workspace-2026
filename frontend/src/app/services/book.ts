import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Book as IBook } from '@test-monorepo/libs';
import {
  catchError,
  filter,
  finalize,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { BookFilters } from '../../types';
import { toObservable } from '@angular/core/rxjs-interop';
import { ToastService } from './toast-service';

export type QuickFilterState = {
  mode: 'all' | 'bestsellers' | 'newReleases' | 'discounted' | 'soldOut';
  sortBy: 'price_asc' | 'price_desc' | null;
};

export interface PaginatedBooks {
  data: IBook[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    count: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = '/api/book';

  // --- 📦 The "Source of Truth" State ---
  books = signal<IBook[]>([]);
  soldOutBooks = signal<IBook[]>([]);
  total = signal(0);
  loading = signal(false);
  protected refreshSignal = signal(0);

  // --- 🔍 Filter State ---
  currentPage = signal(1);
  pageSize = signal(20);
  search = signal('');
  category = signal<string | null>(null);
  sortBy = signal<string | null>(null);
  available = signal<boolean>(false);
  newReleases = signal<boolean>(false);
  discounted = signal<boolean>(false);
  bestsellers = signal<boolean>(false);
  soldOut = signal<boolean>(false);

  // --- 🧮 Derived State ---
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  hasMore = computed(() => this.currentPage() < this.totalPages());

  constructor() {
    // Sold-out observer
    this.getSoldOutBooks();
    // Automatically reload whenever any state signal changes
    toObservable(
      computed(() => ({
        refresh: this.refreshSignal(),
        search: this.search(),
        category: this.category(),
        sortBy: this.sortBy(),
        isAvailable: this.available(),
        newReleases: this.newReleases(),
        isDiscounted: this.discounted(),
        isBestSeller: this.bestsellers(),
        page: this.currentPage(),
        limit: this.pageSize(),
      })),
    )
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((params) =>
          this.fetchBooks(params).pipe(
            catchError((err) => {
              // 1. Handle UI state on error
              this.loading.set(false);
              this.toast.show('Chyba pri načítaní dát', 'alert');
              console.error('Server error:', err);

              // 2. Return an empty "safe" result so the subscribe doesn't crash
              // and the outer observable stays active for next filter change
              return of({
                data: [],
                meta: {
                  total: 0,
                  page: this.currentPage(),
                  lastPage: 0,
                  count: 0,
                },
              } as PaginatedBooks);
            }),
          ),
        ),
      )
      .subscribe((res: PaginatedBooks) => {
        this.books.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);

        // 3. Only show the info toast if we actually have data (not an error fallback)
        if (res.data.length > 0 || res.meta.total === 0) {
          this.toast.show(`Najdene knihy: ${res.meta.total}`, 'info');
        }
      });
  }

  private fetchBooks(p: any) {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, v.toString());
      }
    });
    return this.http.get<PaginatedBooks>(this.apiUrl, { params });
  }

  // --- 🛠️ Helper Methods ---
  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setSearch(query: string) {
    this.search.set(query);
    this.currentPage.set(1); // Reset to page 1 on new search
  }

  getFilteredBooks(filters: BookFilters) {
    this.search.set(filters.search.trim());
    this.category.set(filters.category);
    this.sortBy.set(filters.sortBy);
    this.available.set(filters.available);
    this.newReleases.set(filters.newReleases);
    this.discounted.set(filters.discounted);
    this.bestsellers.set(filters.bestsellers);
  }

  getQuickFilterBooks(filters: QuickFilterState) {
    console.log(filters);
    this.bestsellers.set(filters.mode === 'bestsellers');
    this.newReleases.set(filters.mode === 'newReleases');
    this.discounted.set(filters.mode === 'discounted');

    // Handling 'soldOut' vs 'available' logic:
    // If mode is 'soldOut', available is false. Otherwise, we usually want true/all.
    this.available.set(filters.mode !== 'soldOut');
    this.soldOut.set(filters.mode === 'soldOut');
    // 2. Handle the Sorting
    this.sortBy.set(filters.sortBy);
    // 3. Reset Pagination
    this.currentPage.set(1);
  }

  getSoldOutBooks() {
    toObservable(
      computed(() => ({
        active: this.soldOut(),
      })),
    )
      .pipe(
        // 1. Only proceed if the toggle is TRUE
        filter((state) => state.active),
        tap(() => this.loading.set(true)),
        // 2. Switch to the new endpoint
        switchMap(() => this.http.get<IBook[]>(`${this.apiUrl}/sold`)),
        tap(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.soldOutBooks.set(data);
          this.toast.show('Nacitane soldOutBooks', 'success');
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.show('Chyba pri načítaní dát', 'alert');
        },
      });
  }

  getOne(id: string): Observable<IBook> {
    return this.http.get<IBook>(`${this.apiUrl}/${id}`);
  }

  create(book: Omit<IBook, 'id'>): Observable<IBook> {
    return this.http.post<IBook>(this.apiUrl, book);
  }

  update(id: string, book: Partial<IBook>) {
    this.loading.set(true);

    this.http
      .patch<IBook>(`${this.apiUrl}/${id}`, book)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.toast.show(`Kniha upravená`, 'success');
          // Pulse the refresh stream
          this.refreshSignal.update((v) => v + 1);
        },
        error: () => this.toast.show('Chyba', 'alert'),
      });
  }

  delete(id: string) {
    this.loading.set(true);

    this.http
      .delete<IBook>(`${this.apiUrl}/${id}`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.toast.show(`Kniha vymazaná`, 'success');
          // Pulse the refresh stream
          this.refreshSignal.update((v) => v + 1);
        },
        error: () => this.toast.show('Chyba', 'alert'),
      });
  }
}
