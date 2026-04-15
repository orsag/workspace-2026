import { Component, inject, output } from '@angular/core';
import {
  Book as IBook,
} from '@test-monorepo/shared-models';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { IconComponent } from '../icon/IconComponent';
import { AppStore } from '../../store/app-store';
import { TranslocoDirective } from '@jsverse/transloco';


@Component({
  selector: 'app-book-table',
  imports: [
    RouterLink,
    CurrencyPipe,
    IconComponent,
    DatePipe,
    TranslocoDirective,
  ],
  templateUrl: './book-table.html',
  styleUrl: './book-table.css',
})
export class BookTable {
  store = inject(AppStore);
  edit = output<IBook>();
  remove = output<IBook>();

  books = this.store.books;

  handleEdit(book: IBook) {
    this.edit.emit(book);
  }

  handleDelete(book: IBook) {
    this.remove.emit(book);
  }
}
