const fs = require('fs');
const path = require('path');

const applyReplacements = (filePath, replacements) => {
    const fullPath = path.resolve(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(fullPath, content);
};

// 1. My Work Component - remove ListModule
applyReplacements('src/app/features/my-work/my-work.component.ts', [
    {
        search: "import { ListModule } from '@progress/kendo-angular-listview';",
        replace: ""
    }
]);

// 2. Sidebar Component - add Input
applyReplacements('src/app/layout/sidebar/sidebar.component.ts', [
    {
        search: "export class SidebarComponent {}",
        replace: "import { Input } from '@angular/core';\\nexport class SidebarComponent { @Input() collapsed = false; }"
    }
]);

// 3. Topbar Component - fix clearButton binding
applyReplacements('src/app/layout/topbar/topbar.component.ts', [
    {
        search: 'clearButton="true"',
        replace: '[clearButton]="true"'
    }
]);

// 4. Project Service - add updateProject
const projectSvcExt = `
  updateProject(id: string, project: any): Observable<any> {
    return this.http.put(\`\${this.apiUrl}/\${id}\`, project);
  }
`;
applyReplacements('src/app/core/services/project.service.ts', [
    {
        search: "deleteProject(id: string): Observable<void> {",
        replace: projectSvcExt + "\\n  deleteProject(id: string): Observable<void> {"
    }
]);

// 5. Application Service - add getApplication and updateApplication
const appSvcExt = `
  getApplication(id: string): Observable<Application> {
    return this.http.get<Application>(\`\${this.apiUrl}/\${id}\`);
  }
  updateApplication(id: string, app: any): Observable<Application> {
    return this.http.put<Application>(\`\${this.apiUrl}/\${id}\`, app);
  }
`;
applyReplacements('src/app/core/services/application.service.ts', [
    {
        search: "deleteApplication(id: string): Observable<void> {",
        replace: appSvcExt + "\\n  deleteApplication(id: string): Observable<void> {"
    }
]);

// Remove DatePipes that cause warnings?
applyReplacements('src/app/features/applications/application-detail/application-detail.component.ts', [
    { search: " DatePipe],", replace: "]," }
]);
applyReplacements('src/app/features/processes/process-definition-detail/process-definition-detail.component.ts', [
    { search: " EmptyStateComponent, DatePipe]", replace: " EmptyStateComponent]" }
]);
applyReplacements('src/app/features/processes/process-definition-list/process-definition-list.component.ts', [
    { search: " EmptyStateComponent, DatePipe]", replace: " EmptyStateComponent]" }
]);
applyReplacements('src/app/features/dashboard/dashboard.component.ts', [
    { search: " LoadingStateComponent, DatePipe, IconsModule]", replace: " LoadingStateComponent, IconsModule]" }
]);

console.log('Fixed build issues.');
