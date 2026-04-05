import { Component, input } from '@angular/core';
import { Book } from '@test-monorepo/shared-models';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-book-table',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './book-table.html',
  styleUrl: './book-table.css',
})
export class BookTable {
  data = input.required<Book[]>();
}
