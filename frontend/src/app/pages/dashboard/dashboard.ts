import { Component, inject, OnInit, signal } from '@angular/core';
import { BookService } from '../../services/book';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { BookTable } from '../../components/book-table/book-table';

@Component({
  selector: 'app-dashboard',
  imports: [BookCard, BookListItem, BookTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  bookService = inject(BookService);

  viewLayout = signal<'grid' | 'list' | 'table'>('grid');

  ngOnInit() {
    // Only load if we don't have books yet (persistence!)
    if (this.bookService.books().length === 0) {
      this.bookService.loadBooks();
    }
  }
}
