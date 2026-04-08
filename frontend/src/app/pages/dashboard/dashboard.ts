import { Component, inject, signal } from '@angular/core';
import { BookService } from '../../services/book-service';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { IconComponent } from '../../components/icon/IconComponent';
import { FilterBar } from '../../components/filter-bar/filter-bar';

@Component({
  selector: 'app-dashboard',
  imports: [BookCard, BookListItem, IconComponent, FilterBar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  bookService = inject(BookService);

  viewLayout = signal<'grid' | 'list'>('grid');
}
