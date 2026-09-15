
const fs = require('fs');
let routes = fs.readFileSync('src/app/app.routes.ts', 'utf8');

// Ensure newly created components are added to routes array
if (!routes.includes('applications/:id')) {
   routes = routes.replace(
      "import { AppShellComponent } from './layout/app-shell/app-shell.component';",
      "import { AppShellComponent } from './layout/app-shell/app-shell.component';\nimport { ApplicationDetailComponent } from './features/applications/application-detail/application-detail.component';\nimport { RecentlyViewedComponent } from './features/recently-viewed/recently-viewed.component';\nimport { MyWorkComponent } from './features/my-work/my-work.component';\nimport { SettingsComponent } from './features/settings/settings.component';"
   );
   
   routes = routes.replace(
      "loadComponent: () => import('./features/applications/application-list/application-list.component').then(m => m.ApplicationListComponent) },",
      "loadComponent: () => import('./features/applications/application-list/application-list.component').then(m => m.ApplicationListComponent) },\n      { path: 'applications/:id', component: ApplicationDetailComponent },"
   );
   
   routes = routes.replace(
      "loadComponent: () => import('./features/processes/process-definition-detail/process-definition-detail.component').then(m => m.ProcessDefinitionDetailComponent) }",
      "loadComponent: () => import('./features/processes/process-definition-detail/process-definition-detail.component').then(m => m.ProcessDefinitionDetailComponent) },\n      { path: 'recently-viewed', component: RecentlyViewedComponent },\n      { path: 'my-work', component: MyWorkComponent },\n      { path: 'settings', component: SettingsComponent }"
   );
   fs.writeFileSync('src/app/app.routes.ts', routes);
   console.log('Routes amended.');
} else {
   console.log('Routes already present.');
}
