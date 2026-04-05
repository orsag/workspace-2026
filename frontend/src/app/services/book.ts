import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Book as IBook } from '@test-monorepo/libs';
import { Observable } from 'rxjs';

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
  private apiUrl = '/api/book';

  // --- 📦 The "Source of Truth" State ---
  books = signal<IBook[]>([]);
  total = signal(0);
  loading = signal(false);

  // --- 🔍 Filter State ---
  currentPage = signal(1);
  pageSize = signal(12);
  search = signal('');
  category = signal<string | null>(null);

  // --- 🧮 Derived State ---
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  hasMore = computed(() => this.currentPage() < this.totalPages());

  loadBooks = () => {
    this.loading.set(true);

    const params = new HttpParams()
      .set('page', this.currentPage().toString())
      .set('limit', this.pageSize().toString())
      .set('search', this.search() || '')
      .set('category', this.category() || '');

    this.http.get<PaginatedBooks>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        this.books.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  };

  // --- 🛠️ Helper Methods ---
  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadBooks();
    }
  }

  setSearch(query: string) {
    this.search.set(query);
    this.currentPage.set(1); // Reset to page 1 on new search
    this.loadBooks();
  }

  getBooks(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isBestSeller?: boolean;
    isNew?: boolean;
    sortBy?: string;
  }) {
    let httpParams = new HttpParams();

    // Dynamically add params if they exist
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<PaginatedBooks>(this.apiUrl, { params: httpParams });
  }

  getOne(id: string): Observable<IBook> {
    return this.http.get<IBook>(`${this.apiUrl}/${id}`);
  }

  create(book: Omit<IBook, 'id'>): Observable<IBook> {
    return this.http.post<IBook>(this.apiUrl, book);
  }

  update(id: string, book: Partial<IBook>): Observable<IBook> {
    return this.http.patch<IBook>(`${this.apiUrl}/${id}`, book);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
