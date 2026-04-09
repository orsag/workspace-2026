import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, FormField, required } from '@angular/forms/signals';
import { UserWithoutId, User } from '@test-monorepo/shared-models';
import { AppStore } from '../../store/app-store';
import { FormsModule } from '@angular/forms';
import { BookCard } from '../../components/book-card/book-card';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { BookService } from '../../services/book-service';
import { IconComponent } from '../../components/icon/IconComponent';
import { OrderService } from '../../services/order-service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, BookCard, FormField, IconComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  store = inject(AppStore);
  bookService = inject(BookService);
  orderService = inject(OrderService);
  favorites = this.store.user()?.favorites;

  favoriteBooks = toSignal(
    toObservable(computed(() => this.store.user()?.favorites || [])).pipe(
      // 1. Only emit if the IDs have actually changed (content-wise)
      distinctUntilChanged(
        (prev, curr) =>
          prev.length === curr.length &&
          prev.every((id, index) => id === curr[index]),
      ),
      // 2. Only switchMap to the API call if we have a fresh, different list of IDs
      switchMap((ids) =>
        ids.length > 0 ? this.bookService.getFavorites(ids) : of([]),
      ),
    ),
    { initialValue: [] },
  );

  userModel = signal<UserWithoutId>({
    username: this.store.user()?.username ?? '',
    email: this.store.user()?.email ?? '',
    phoneNumber: this.store.user()?.phoneNumber ?? '',
    theme: this.store.user()?.theme ?? 'light',
  });

  userForm = form(this.userModel, (schemaPath) => {
    required(schemaPath.username, {
      message: 'Username is required',
    });
    required(schemaPath.email, {
      message: 'Email is required',
    });
    required(schemaPath.phoneNumber, {
      message: 'Phone is required',
    });
  });

  handleSave() {
    if (this.userForm().valid()) {
      const username = this.store.user()?.username;
      const updatedData: Partial<User> = {
        ...this.userModel(),
      };

      if (username) {
        this.store.updateUserProfile({ username, updates: updatedData });
      }
    }
  }

  handleCancel() {
    this.userForm().reset();
  }

  // New Signal for Order History
  orders = toSignal(
    toObservable(computed(() => this.store.user())).pipe(
      map((user) => user?.id), // observing whole object user
      distinctUntilChanged(), // only if changes
      switchMap(
        (userId) => (userId ? this.orderService.getUserOrders(userId) : of([])),
      ),
    ),
    { initialValue: [] },
  );

  // Logic to determine if an order can be cancelled (within 14 days)
  canCancel(createdAt: Date): boolean {
    const now = Date.now();
    const orderTime = new Date(createdAt).getTime();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    return now - orderTime <= fourteenDaysMs;
  }

  handleCancelOrder(orderId: string) {
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.store.refreshUser(); // rxMethod is called just like a regular method
      },
    });
  }
}
