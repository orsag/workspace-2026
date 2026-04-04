import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Book as IBook } from '@test-monorepo/shared-models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = '/api/book';

  getBooks() {
    return this.http.get<IBook[]>(this.apiUrl);
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
