import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, FormField, required } from '@angular/forms/signals';
import { UserWithoutId, User } from '@test-monorepo/shared-models';
import { AppStore } from '../../store/app-store';
import { FormsModule } from '@angular/forms';
import { BookCard } from '../../components/book-card/book-card';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { BookService } from '../../services/book-service';
import { IconComponent } from '../../components/icon/IconComponent';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, BookCard, FormField, IconComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  store = inject(AppStore);
  bookService = inject(BookService);
  favorites = this.store.user()?.favorites;

  favoriteBooks = toSignal(
    toObservable(computed(() => this.store.user()?.favorites || [])).pipe(
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
}
