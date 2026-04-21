import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { computed, effect, inject } from '@angular/core';
import {
  PremiumStatus,
  User,
  UserDetail,
  UserDetailSmall,
} from '@test-monorepo/shared-models';
import { Book as IBook } from '@test-monorepo/shared-models';
import { AuthService } from '../services/auth-service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, map, filter, of, distinctUntilChanged } from 'rxjs';
import { pipe, switchMap, catchError, finalize, EMPTY } from 'rxjs';
import { BookService } from '../services/book-service';
import { DetailService } from '../services/detail-service';
import {
  ErrorCodes,
  ErrorHandlerService,
  SuccessCodes,
} from '../core/error.handler';
import { registerLocaleData } from '@angular/common';
import localeSk from '@angular/common/locales/sk';

registerLocaleData(localeSk);

// Key for LocalStorage
const USER_STORAGE_KEY = 'currentUser';
const TOKEN_STORAGE_KEY = 'accessToken';
const DETAIL_STORAGE_KEY = 'currentStatus';

export interface AppState {
  user: User | null;
  userDetail: UserDetail | null;
  token: string | null;
  premiumStatus: PremiumStatus | null;
  // --- 📚 Book State ---
  books: IBook[];
  favoriteBooks: IBook[];
  totalBooks: number;
  isLoading: boolean;
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
  userDetail: null,
  token: null,
  premiumStatus: null,
  books: [],
  favoriteBooks: [],
  totalBooks: 0,
  isLoading: false,
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
  { providedIn: 'root' },
  withState(initialState),

  // 1. Computed Values (Like Selectors)
  withComputed(({ user, totalBooks, filters }) => ({
    isLoggedIn: computed(() => !!user()),
    isAdmin: computed(() => user()?.isAdmin ?? false),
    favoriteCount: computed(() => user()?.favorites?.length ?? 0),
    cartCount: computed(() => user()?.cartItems?.length ?? 0),
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
      detailService = inject(DetailService),
      errorService = inject(ErrorHandlerService),
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

        const params: Partial<AppState['filters']> = store.filters();
        bookService.fetchBooks(params).subscribe({
          next: (res) =>
            patchState(store, {
              // If append is true, concat the arrays. Otherwise, replace.
              books: append ? [...store.books(), ...res.data] : res.data,
              totalBooks: res.meta.total,
              isLoading: false,
            }),
          error: () => {
            patchState(store, { isLoading: false });
            errorService.handleError(ErrorCodes.FETCH_BOOKS);
          },
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

      _syncFavorites: rxMethod<string[]>(
        pipe(
          distinctUntilChanged(
            (prev, curr) =>
              prev.length === curr.length &&
              prev.every((id, i) => id === curr[i]),
          ),
          switchMap((ids) => {
            if (ids.length === 0) {
              patchState(store, { favoriteBooks: [], isLoading: false });
              return of([]);
            }

            patchState(store, { isLoading: true });
            return bookService.getFavorites(ids).pipe(
              tap((books) => {
                patchState(store, { favoriteBooks: books, isLoading: false });
              }),
              catchError((err) => {
                patchState(store, { isLoading: false });
                return of([]);
              }),
            );
          }),
        ),
      ),

      login: rxMethod<{ username: string; onSuccess?: () => void }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ username, onSuccess }) =>
            authService.login(username).pipe(
              // Chain the premium status call
              switchMap(({ user, access_token }) =>
                detailService.findPremiumStatus(user.id).pipe(
                  tap((premiumStatus) => {
                    errorService.handleSuccess(SuccessCodes.LOGIN);
                    if (onSuccess) onSuccess();
                    // Update state with everything at once
                    patchState(store, {
                      user,
                      token: access_token,
                      premiumStatus: premiumStatus, // Make sure this exists in your state
                      isLoading: false,
                    });
                  }),
                  // Catch error for premium status specifically if you want
                  // the user to still be logged in even if premium check fails
                  catchError((err) => {
                    errorService.handleError(ErrorCodes.PREMIUM);
                    // Still log the user in, just without premium status
                    patchState(store, {
                      user,
                      token: access_token,
                      isLoading: false,
                    });
                    return of(null);
                  }),
                ),
              ),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOGIN);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      logout: rxMethod<void>(
        pipe(
          // 1. Get the username from the store signal before we wipe it
          map(() => store.user()?.username),
          filter((username): username is string => !!username),

          switchMap((username) =>
            authService.logout(username).pipe(
              tap(() => {
                errorService.handleSuccess(SuccessCodes.LOGOUT);
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOGOUT);
                // Even if backend fails, we proceed with local cleanup
                return EMPTY;
              }),
              finalize(() => {
                // 2. ALWAYS wipe the local state and storage
                patchState(store, { user: null, token: null });
                localStorage.removeItem(DETAIL_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
              }),
            ),
          ),
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
                errorService.handleError(ErrorCodes.REFRESH);
                console.error(err);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      setUser(user: User) {
        patchState(store, { user });
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
            return authService
              .updateUserFavorites(currentUser.username, updatedFavorites)
              .pipe(
                catchError(() => {
                  errorService.handleError(ErrorCodes.TOGGLE_FAVORITE);
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
                errorService.handleSuccess(SuccessCodes.UPDATE_PROFILE);
                patchState(store, { user: updatedUser, isLoading: false });
              }),
              catchError((err) => {
                errorService.handleError(ErrorCodes.UPDATE_PROFILE);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      updateUserDetail: rxMethod<{
        userId: string;
        updates: Partial<UserDetailSmall>;
      }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ userId, updates }) => {
            return detailService.updateUserDetail(userId, updates).pipe(
              tap((updatedDetail: UserDetail) => {
                errorService.handleSuccess(SuccessCodes.UPDATE_PROFILE);
                patchState(store, {
                  userDetail: updatedDetail,
                  isLoading: false,
                });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.UPDATE_PROFILE);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      loadUserDetail: rxMethod<{ userId: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ userId }) =>
            detailService.getUserDetailById(userId).pipe(
              tap((userDetail: UserDetail) => {
                patchState(store, {
                  userDetail: userDetail,
                  isLoading: false,
                });
              }),
              catchError(() => {
                errorService.handleError(ErrorCodes.LOAD_PROFILE);
                patchState(store, { isLoading: false });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    }),
  ),

  // 3. Automated Lifecycle & Persistence
  withHooks({
    onInit(store) {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const savedDetail = localStorage.getItem(DETAIL_STORAGE_KEY);

      // Automatically react to user favorite ID changes
      const favoriteIds = computed(() => store.user()?.favorites || []);
      store._syncFavorites(favoriteIds);

      if (savedUser && savedToken) {
        patchState(store, {
          user: JSON.parse(savedUser),
          token: savedToken,
        });
      }

      if (savedDetail) {
        patchState(store, {
          premiumStatus: JSON.parse(savedDetail),
        });
      }

      effect(() => {
        const { user, token, userDetail } = store;
        if (userDetail()) {
          localStorage.setItem(
            DETAIL_STORAGE_KEY,
            JSON.stringify(userDetail()),
          );
        } else {
          localStorage.removeItem(DETAIL_STORAGE_KEY);
        }
        const _token = token();
        if (user() && _token) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user()));
          localStorage.setItem(TOKEN_STORAGE_KEY, _token);
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      });
    },
  }),
);
