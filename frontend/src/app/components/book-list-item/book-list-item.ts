import { Component, Input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-book-list-item',
  imports: [NgOptimizedImage],
  templateUrl: './book-list-item.html',
  styleUrl: './book-list-item.css',
})
export class BookListItem {
  @Input({ required: true }) data!: Book;
  @Input() isPriority = false;
}
