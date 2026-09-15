const fs = require('fs');
const path = require('path');

const files = {
  "src/environments/environment.ts": `export const environment = { production: false, apiBaseUrl: '/api' };`,
  "src/app/core/models/project.model.ts": `export interface Project { id: string; name: string; description?: string; }`,
  "src/app/core/models/application.model.ts": `export interface Application { id: string; projectId: string; name: string; description?: string; }`,
  "src/app/core/models/service-item.model.ts": `export interface ServiceItem { id: string; applicationId: string; formId?: string; referenceNumber: string; title: string; status: string; priority: string; assignedTo?: string; createdAt?: string; updatedAt?: string; }`,
  "src/app/core/models/form.model.ts": `export interface Form { id: string; name: string; description?: string; active: boolean; createdDate: string; formCode: string; }`,
  
  "src/app/core/services/project.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { Project } from '../models/project.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class ProjectService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/Projects\`;\n\n  getProjects(): Observable<Project[]> {\n    return this.http.get<Project[]>(this.apiUrl);\n  }\n  getProject(id: string): Observable<Project> {\n    return this.http.get<Project>(\`\${this.apiUrl}/\${id}\`);\n  }\n  createProject(project: Partial<Project>): Observable<Project> {\n    return this.http.post<Project>(this.apiUrl, project);\n  }\n}`,

  "src/app/core/services/application.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { Application } from '../models/application.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class ApplicationService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/Applications\`;\n\n  getApplications(projectId?: string): Observable<Application[]> {\n    const url = projectId ? \`\${this.apiUrl}?projectId=\${projectId}\` : this.apiUrl;\n    return this.http.get<Application[]>(url);\n  }\n}`,

  "src/app/core/services/service-item.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { ServiceItem } from '../models/service-item.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class ServiceItemService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/ServiceItems\`;\n\n  getServiceItems(applicationId?: string): Observable<ServiceItem[]> {\n    const url = applicationId ? \`\${this.apiUrl}?applicationId=\${applicationId}\` : this.apiUrl;\n    return this.http.get<ServiceItem[]>(url);\n  }\n  createServiceItem(item: Partial<ServiceItem>): Observable<ServiceItem> {\n    return this.http.post<ServiceItem>(this.apiUrl, item);\n  }\n}`,

  "src/app/core/services/form.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { Form } from '../models/form.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class FormService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/Forms\`;\n\n  getForms(): Observable<Form[]> {\n    return this.http.get<Form[]>(this.apiUrl);\n  }\n}`,

  "src/app/core/services/notification.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { MatSnackBar } from '@angular/material/snack-bar';\n\n@Injectable({ providedIn: 'root' })\nexport class NotificationService {\n  private snackBar = inject(MatSnackBar);\n\n  success(message: string) {\n    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });\n  }\n  error(message: string) {\n    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });\n  }\n}`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.resolve(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Core files generated.');
