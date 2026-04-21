import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { BookCard } from '../../components/book-card/book-card';
import { BookListItem } from '../../components/book-list-item/book-list-item';
import { IconComponent } from '../../components/icon/IconComponent';
import { FilterBar } from '../../components/filter-bar/filter-bar';
import { AppStore } from '../../store/app-store';
import { CartStore } from '../../store/cart-store';

@Component({
  selector: 'app-dashboard',
  imports: [BookCard, BookListItem, IconComponent, FilterBar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  store = inject(AppStore);
  cart = inject(CartStore);

  viewLayout = signal<'grid' | 'list'>('grid');

  ngOnInit() {
    this.store.loadBooks();
    this.cart.syncCartWithServer();
  }
}
