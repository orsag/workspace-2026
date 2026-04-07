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
  withMethods((store, authService = inject(AuthService)) => ({
    /**
     * Observable-based login method
     */
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

    /**
     * Observable-based logout method
     */
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

    // Manual state updates if needed
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
  })),
);
