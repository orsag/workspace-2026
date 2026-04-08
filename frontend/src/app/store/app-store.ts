import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { User } from '@test-monorepo/shared-models';
import { AuthService } from '../services/auth-service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ToastService } from '../services/toast-service';

export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppState = {
  user: null,
  isLoading: false,
  error: null,
};


export const AppStore = signalStore(
  { providedIn: 'root' }, // Makes it a singleton for the whole app
  withState(initialState),

  // 1. Computed Values (Like Selectors)
  withComputed(({ user }) => ({
    isLoggedIn: computed(() => !!user()),
    isAdmin: computed(() => user()?.isAdmin ?? false),
    favoriteCount: computed(() => user()?.favorites?.length ?? 0),
    cartCount: computed(() => user()?.cartItems?.length ?? 0),
  })),

  // 2. Methods (Like Actions/Reducers)
  withMethods(
    (
      store,
      authService = inject(AuthService),
      toast = inject(ToastService),
    ) => ({
      login: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((username) =>
            authService.login(username).pipe(
              tap((user) => {
                patchState(store, { user, isLoading: false });
                localStorage.setItem('currentUser', JSON.stringify(user));
                console.log('SUCCESS', user);
              }),
              catchError((err) => {
                patchState(store, {
                  error: err.error?.message || 'Login failed',
                  isLoading: false,
                });
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
                patchState(store, { user: null, error: null });
                localStorage.removeItem('currentUser');
                console.log('LOGOUT', store.user);
              }),
            );
          }),
        ),
      ),

      setUser(user: User) {
        patchState(store, { user, error: null });
      },

      clearUser() {
        patchState(store, { user: null });
      },

      init() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          patchState(store, { user: JSON.parse(savedUser) });
        }
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
                tap(() => {
                  // Success: Persist to localStorage if needed
                  localStorage.setItem(
                    'currentUser',
                    JSON.stringify(updatedUser),
                  );
                }),
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
                localStorage.setItem(
                  'currentUser',
                  JSON.stringify(updatedUser),
                );
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
);
