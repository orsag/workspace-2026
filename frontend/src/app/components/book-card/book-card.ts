import { Component, Input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-book-card',
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCard {
  @Input({ required: true }) data!: Book;
  @Input() isPriority = false;
}
