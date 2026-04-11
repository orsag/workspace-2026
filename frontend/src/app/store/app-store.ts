import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { computed, effect, inject } from '@angular/core';
import { User } from '@test-monorepo/shared-models';
import { Book as IBook } from '@test-monorepo/shared-models';
import { AuthService } from '../services/auth-service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, map, filter } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { BookService } from '../services/book-service';
import { TranslocoService } from '@jsverse/transloco';

// Key for LocalStorage
const USER_STORAGE_KEY = 'currentUser';

export interface AppState {
  user: User | null;
  // --- 📚 Book State ---
  books: IBook[];
  totalBooks: number;
  isLoading: boolean;
  error: string | null;
  // --- 🔍 Filter State ---
  filters: {
    page: number;
    limit: number;
    search: string;
    category: string | null;
    sortBy: string | null;
    isAvailable: boolean;
    isBestSeller: boolean;
    isNewRelease: boolean;
    isDiscounted: boolean;
  };
}

const initialState: AppState = {
  user: null,
  books: [],
  totalBooks: 0,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    search: '',
    category: null,
    sortBy: null,
    isAvailable: false,
    isBestSeller: false,
    isNewRelease: false,
    isDiscounted: false,
  },
};


export const AppStore = signalStore(
  { providedIn: 'root' }, // Makes it a singleton for the whole app
  withState(initialState),

  // 1. Computed Values (Like Selectors)
  withComputed(({ user, totalBooks, filters }) => ({
    isLoggedIn: computed(() => !!user()),
    isAdmin: computed(() => user()?.isAdmin ?? false),
    favoriteCount: computed(() => user()?.favorites?.length ?? 0),
    cartCount: computed(() => user()?.cartItems?.length ?? 0),
    // FIX: Use totalBooks() instead of books().length
    totalPages: computed(() => Math.ceil(totalBooks() / filters().limit)),

    // FIX: Compare current page against the corrected totalPages calculation
    hasMorePage: computed(
      () => filters.page() < Math.ceil(totalBooks() / filters().limit),
    ),
  })),

  // 2. Methods (Like Actions/Reducers)
  withMethods(
    (
      store,
      bookService = inject(BookService),
      authService = inject(AuthService),
      toast = inject(ToastService),
      translocoService = inject(TranslocoService),
    ) => ({
      // Update filters without triggering a fetch automatically
      updateFilters(newFilters: Partial<AppState['filters']>) {
        patchState(store, (state) => ({
          filters: { ...state.filters, ...newFilters, page: 1 },
        }));
        this.loadBooks();
      },

      // Explicitly call this ONLY when needed
      async loadBooks(append = false) {
        patchState(store, { isLoading: true });

        const params = store.filters();
        bookService.fetchBooks(params).subscribe({
          next: (res) =>
            patchState(store, {
              // If append is true, concat the arrays. Otherwise, replace.
              books: append ? [...store.books(), ...res.data] : res.data,
              totalBooks: res.meta.total,
              isLoading: false,
            }),
          error: (err) =>
            patchState(store, {
              error: 'Failed to load books',
              isLoading: false,
            }),
        });
      },

      loadMore() {
        patchState(store, (state) => ({
          filters: { ...state.filters, page: state.filters.page + 1 },
        }));
        this.loadBooks(true);
      },

      setPage(page: number) {
        patchState(store, (state) => ({
          filters: {
            ...state.filters,
            page: page,
          },
        }));
        this.loadBooks();
      },

      login: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((username) =>
            authService.login(username).pipe(
              tap((user) => {
                const message = translocoService.translate(
                  'common.success_logout',
                );
                toast.success(message);
                patchState(store, { user, isLoading: false });
              }),
              catchError((err) => {
                patchState(store, {
                  error: err.error?.message || 'Login failed',
                  isLoading: false,
                });
                const message = translocoService.translate(
                  'common.failed_login',
                );
                toast.alert(message);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      logout: rxMethod<void>(
        pipe(
          switchMap(() => {
            const username = store.user()?.username;
            if (!username) return EMPTY;

            return authService.logout(username).pipe(
              tap(() => {
                const message = translocoService.translate(
                  'common.success_logout',
                );
                toast.success(message);
                patchState(store, { user: null, error: null });
              }),
            );
          }),
        ),
      ),

      refreshUser: rxMethod<void>(
        pipe(
          // Map to the current username from the store
          map(() => store.user()?.username),
          // Only proceed if we actually have a logged-in user
          filter((username): username is string => !!username),
          switchMap((username) =>
            authService.getUser(username).pipe(
              tap((updatedUser) => {
                patchState(store, { user: updatedUser });
                // Persistence sync
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }),
              catchError((err) => {
                console.error('Failed to refresh user data', err);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      setUser(user: User) {
        patchState(store, { user, error: null });
      },

      clearUser() {
        patchState(store, { user: null });
      },

      toggleFavorite: rxMethod<string>(
        pipe(
          switchMap((bookId) => {
            const currentUser = store.user();
            if (!currentUser) return EMPTY;

            // 1. Calculate new favorites array locally
            const isFavorite = currentUser.favorites.includes(bookId);
            const updatedFavorites = isFavorite
              ? currentUser.favorites.filter((id) => id !== bookId)
              : [...currentUser.favorites, bookId];

            // 2. Optimistic Update: Update UI immediately
            const updatedUser = { ...currentUser, favorites: updatedFavorites };
            patchState(store, { user: updatedUser });

            // 3. Sync with Backend
            // We'll assume a new 'updateUser' method in AuthService
            return authService
              .updateUserFavorites(currentUser.username, updatedFavorites)
              .pipe(
                catchError((err) => {
                  // Rollback: If backend fails, revert the state
                  patchState(store, { user: currentUser });
                  return EMPTY;
                }),
              );
          }),
        ),
      ),

      // Inside AppStore withMethods
      updateUserProfile: rxMethod<{ username: string; updates: Partial<User> }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ username, updates }) => {
            // Whitelist only the safe fields to be sent to the backend
            const safeUpdates = {
              email: updates.email,
              phoneNumber: updates.phoneNumber,
              theme: updates.theme,
            };

            return authService.updateProfile(username, safeUpdates).pipe(
              tap((updatedUser) => {
                patchState(store, { user: updatedUser, isLoading: false });
                toast.success('Profil bol úspešne aktualizovaný');
              }),
              catchError(() => {
                const errorMessage = 'Aktualizácia profilu zlyhala';
                toast.alert(errorMessage);
                patchState(store, { error: errorMessage, isLoading: false });
                return EMPTY;
              }),
            );
          }),
        ),
      ),
    }),
  ),

  // 3. Automated Lifecycle & Persistence
  withHooks({
    onInit(store) {
      // 1. Hydrate state from storage
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        patchState(store, { user: JSON.parse(savedUser) });
      }

      // 2. Automatically track the 'user' signal
      // Whenever store.user() changes, this effect runs.
      effect(() => {
        const user = store.user();
        if (user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      });
    },
  }),
);
