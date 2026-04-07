import { Route } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { PageNotFound } from './pages/page-not-found/page-not-found';
import { Profile } from './pages/profile/profile';
import { Detail } from './pages/detail/detail';
import { Features } from './pages/features/features';
import { Administration } from './pages/administration/administration';

export const appRoutes: Route[] = [
  { path: '', component: Dashboard },
  { path: 'profile', component: Profile },
  { path: 'book/:id', component: Detail },
  { path: 'features', component: Features },
  { path: 'administration', component: Administration },
  { path: 'not-ready', component: PageNotFound },
  { path: '**', component: PageNotFound },
];
