import { Component, Input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-book-list-item',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe],
  templateUrl: './book-list-item.html',
  styleUrl: './book-list-item.css',
})
export class BookListItem {
  @Input({ required: true }) data!: Book;
  @Input() isPriority = false;
}
