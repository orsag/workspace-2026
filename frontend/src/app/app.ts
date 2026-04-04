import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Book } from '@test-monorepo/shared-models';
import { BookService } from '../services/book';
import { CommonModule } from '@angular/common';

@Component({
  imports: [RouterModule, CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private bookService = inject(BookService);

  // Use Signals for data (modern Angular)
  books = signal<Book[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching books', err);
        this.loading.set(false);
      },
    });
  }
}
