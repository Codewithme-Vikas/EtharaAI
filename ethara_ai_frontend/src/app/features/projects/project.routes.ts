import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/project-list/project-list.component').then((m) => m.ProjectListComponent)
  },
  {
    path: ':id/tasks',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../tasks/task.routes').then((m) => m.TASK_ROUTES)
  }
];
