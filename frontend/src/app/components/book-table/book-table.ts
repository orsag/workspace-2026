import { Component, input, output } from '@angular/core';
import {
  Book as IBook,
} from '@test-monorepo/shared-models';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { IconComponent } from '../icon/IconComponent';


@Component({
  selector: 'app-book-table',
  imports: [RouterLink, CurrencyPipe, IconComponent],
  templateUrl: './book-table.html',
  styleUrl: './book-table.css',
})
export class BookTable {
  data = input.required<IBook[]>();
  edit = output<IBook>();
  remove = output<IBook>();

  handleEdit(book: IBook) {
    this.edit.emit(book);
  }

  handleDelete(book: IBook) {
    this.remove.emit(book);
  }
}
