import { Route } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { PageNotFound } from './pages/page-not-found/page-not-found';
import { Profile } from './pages/profile/profile';
import { Detail } from './pages/detail/detail';
import { Features } from './pages/features/features';
import { Administration } from './pages/administration/administration';
import { Shopping } from './pages/shopping/shopping';
import { Success } from './pages/success/success';
import { Comparison } from './pages/comparison/comparison';
// ======================================================================
import { authGuard } from './core/auth.guard';
import { premiumGuard } from './core/premium.guard';
import { adminGuard } from './core/admin.guard';

export const appRoutes: Route[] = [
  { path: '', component: Dashboard },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  { path: 'book/:id', component: Detail },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'features', component: Features, canActivate: [authGuard] },
  { path: 'compare', component: Comparison },
  {
    path: 'administration',
    component: Administration,
    canActivate: [adminGuard],
  },
  { path: 'shopping', component: Shopping },
  { path: 'success/:id', component: Success },
  { path: 'wip', component: PageNotFound },
  { path: '**', component: PageNotFound },
];
