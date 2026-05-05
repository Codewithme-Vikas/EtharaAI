import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/task-list/task-list.component').then((m) => m.TaskListComponent)
  }
];
