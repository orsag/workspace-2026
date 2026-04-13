import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActionResponse, Book as IBook } from '@test-monorepo/libs';
import { Observable } from 'rxjs';
import { PaginatedBooks } from '../../types';
import { AppState } from '../store/app-store';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = '/api/book';

  // Pure fetcher used by the Store
  fetchBooks(p: Partial<AppState['filters']>): Observable<PaginatedBooks> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, v.toString());
      }
    });
    return this.http.get<PaginatedBooks>(this.apiUrl, { params });
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

  delete(id: string): Observable<ActionResponse> {
    return this.http.delete<ActionResponse>(`${this.apiUrl}/${id}`);
  }

  // Fetches multiple books by their IDs for the favorites list
  getFavorites(ids: string[]): Observable<IBook[]> {
    return this.http.post<IBook[]>(`${this.apiUrl}/list`, { ids });
  }
}
