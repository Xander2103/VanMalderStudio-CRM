import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Leads } from './pages/leads/leads';
import { LeadDetail } from './pages/lead-detail/lead-detail';
import { Tasks } from './pages/tasks/tasks';
import { Clients } from './pages/clients/clients';
import { Payments } from './pages/payments/payments';
import { ClientDetail } from './pages/client-detail/client-detail';
import { Login } from './pages/login/login';
import { Account } from './pages/account/account';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: Dashboard, canActivate: [authGuard] },
  { path: 'leads', component: Leads, canActivate: [authGuard] },
  { path: 'leads/:id', component: LeadDetail, canActivate: [authGuard] },
  { path: 'tasks', component: Tasks, canActivate: [authGuard] },
  { path: 'clients', component: Clients, canActivate: [authGuard] },
  { path: 'clients/:id', component: ClientDetail, canActivate: [authGuard] },
  { path: 'payments', component: Payments, canActivate: [authGuard] },
  { path: 'account', component: Account, canActivate: [authGuard] }
];
