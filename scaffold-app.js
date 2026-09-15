const fs = require('fs');
const path = require('path');

const files = {
    "src/app/app.routes.ts": `
import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/applications/application-list/application-list.component').then(m => m.ApplicationListComponent)
      },
      {
        path: 'service-items',
        loadComponent: () => import('./features/service-items/service-item-list/service-item-list.component').then(m => m.ServiceItemListComponent)
      },
      {
        path: 'service-items/create',
        loadComponent: () => import('./features/service-items/service-item-create/service-item-create.component').then(m => m.ServiceItemCreateComponent)
      },
      {
        path: 'forms',
        loadComponent: () => import('./features/forms/form-list/form-list.component').then(m => m.FormListComponent)
      }
    ]
  }
];
`,

    "src/app/app.config.ts": `
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimationsAsync()
  ]
};
`,

    "src/app/app.component.ts": `
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: \`<router-outlet></router-outlet>\`
})
export class AppComponent {
  title = 'process-tracker-ui';
}
`,

    "src/styles.css": `
/* You can add global styles to this file, and also import other style files */
@import '@angular/material/prebuilt-themes/azure-blue.css';
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* ProcessTracker Design System Variables */
  --primary-color: #3b82f6;
  --primary-light: #eff6ff;
  --primary-dark: #2563eb;
  
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  
  --text-color: #0f172a;
  --muted-text-color: #64748b;
  --border-color: #e2e8f0;
  
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
}

html, body { 
  height: 100%; 
  margin: 0; 
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
}

* {
  box-sizing: border-box;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-color);
}

/* Base override for Material typography to use Inter */
.mat-typography {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* Material overrides for enterprise feel */
.mat-mdc-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02) !important;
  border-radius: 12px !important;
  border: 1px solid var(--border-color);
  background-color: var(--surface-color) !important;
}

.mdc-button.mat-unthemed, .mdc-button {
  border-radius: 8px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.mdc-button--raised, .mdc-button--unelevated {
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
}

.mat-mdc-icon-button {
  border-radius: 8px !important;
}

/* Material Tables override */
.table-responsive {
  overflow-x: auto;
  padding: 0 !important;
}
.custom-table {
  width: 100%;
}
.custom-table th.mat-mdc-header-cell {
  background-color: #f8fafc;
  color: var(--muted-text-color) !important;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
}
.custom-table td.mat-mdc-cell {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  font-size: 0.875rem;
}
.custom-table .interactive-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.custom-table .interactive-row:hover {
  background-color: #f1f5f9 !important;
}
.muted-text {
  color: var(--muted-text-color);
}

/* Forms */
.mat-mdc-form-field-flex {
  background-color: #f8fafc !important;
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading, 
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch, 
.mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
  border-color: var(--border-color) !important;
}
.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__leading, 
.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__notch, 
.mdc-text-field--outlined:not(.mdc-text-field--disabled):not(.mdc-text-field--focused):hover .mdc-notched-outline .mdc-notched-outline__trailing {
  border-color: #cbd5e1 !important;
}

/* Layout utilities */
.container-centered {
  max-width: 1200px;
  margin: 0 auto;
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('App Core files generated.');
