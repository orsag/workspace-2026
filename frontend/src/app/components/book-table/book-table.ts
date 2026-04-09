import { Component, inject, output } from '@angular/core';
import {
  Book as IBook,
} from '@test-monorepo/shared-models';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { IconComponent } from '../icon/IconComponent';
import { AppStore } from '../../store/app-store';


@Component({
  selector: 'app-book-table',
  imports: [RouterLink, CurrencyPipe, IconComponent, DatePipe],
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
