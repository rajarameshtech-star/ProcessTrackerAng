
import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'projects', loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent) },
      { path: 'projects/:id', loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent) },
      { path: 'applications', loadComponent: () => import('./features/applications/application-list/application-list.component').then(m => m.ApplicationListComponent) },
      { path: 'service-items', loadComponent: () => import('./features/service-items/service-item-list/service-item-list.component').then(m => m.ServiceItemListComponent) },
      { path: 'service-items/create', loadComponent: () => import('./features/service-items/service-item-create/service-item-create.component').then(m => m.ServiceItemCreateComponent) },
      { path: 'service-items/:id', loadComponent: () => import('./features/service-items/service-item-detail/service-item-detail.component').then(m => m.ServiceItemDetailComponent) },
      { path: 'processes', loadComponent: () => import('./features/processes/process-definition-list/process-definition-list.component').then(m => m.ProcessDefinitionListComponent) }
    ]
  }
];
