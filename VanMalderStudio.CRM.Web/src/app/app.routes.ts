import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Leads } from './pages/leads/leads';
import { LeadDetail } from './pages/lead-detail/lead-detail';
import { Tasks } from './pages/tasks/tasks';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard
  },
  {
    path: 'leads',
    component: Leads
  },
  {
    path: 'leads/:id',
    component: LeadDetail
  },
  {
    path: 'tasks',
    component: Tasks
  }
];