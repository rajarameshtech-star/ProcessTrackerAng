const fs = require('fs');
const path = require('path');

const files = {
    "src/app/core/services/process-definition.service.ts": `
import { Injectable, inject } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { ProcessDefinition } from '../models/process-definition.model'; 
import { environment } from '../../../environments/environment'; 

@Injectable({ providedIn: 'root' }) 
export class ProcessDefinitionService { 
  private http = inject(HttpClient); 
  private apiUrl = \`\${environment.apiBaseUrl}/ProcessDefinitions\`; 

  getProcessDefinitions(): Observable<ProcessDefinition[]> { return this.http.get<ProcessDefinition[]>(this.apiUrl); } 
  getProcessDefinition(id: string): Observable<ProcessDefinition> { return this.http.get<ProcessDefinition>(\`\${this.apiUrl}/\${id}\`); } 
  createProcessDefinition(pd: Partial<ProcessDefinition>): Observable<ProcessDefinition> { return this.http.post<ProcessDefinition>(this.apiUrl, pd); } 
  updateProcessDefinition(id: string, pd: Partial<ProcessDefinition>): Observable<ProcessDefinition> { return this.http.put<ProcessDefinition>(\`\${this.apiUrl}/\${id}\`, pd); } 
  deleteProcessDefinition(id: string): Observable<void> { return this.http.delete<void>(\`\${this.apiUrl}/\${id}\`); } 
}
`,

    "src/app/core/services/process-field.service.ts": `
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessField } from '../models/process-field.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcessFieldService {
  private http = inject(HttpClient);
  private apiUrl = \`\${environment.apiBaseUrl}/ProcessFields\`;

  getProcessFields(processDefinitionId?: string): Observable<ProcessField[]> {
    const url = processDefinitionId ? \`\${this.apiUrl}?processDefinitionId=\${processDefinitionId}\` : this.apiUrl;
    return this.http.get<ProcessField[]>(url);
  }
  createProcessField(field: Partial<ProcessField>): Observable<ProcessField> { return this.http.post<ProcessField>(this.apiUrl, field); }
  updateProcessField(id: string, field: Partial<ProcessField>): Observable<ProcessField> { return this.http.put<ProcessField>(\`\${this.apiUrl}/\${id}\`, field); }
  deleteProcessField(id: string): Observable<void> { return this.http.delete<void>(\`\${this.apiUrl}/\${id}\`); }
}
`,

    "src/app/core/services/process-definition-project-mapping.service.ts": `
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessDefinitionProjectMapping } from '../models/process-definition-project-mapping.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcessDefinitionProjectMappingService {
  private http = inject(HttpClient);
  private apiUrl = \`\${environment.apiBaseUrl}/ProcessDefinitionProjectMappings\`;

  getByProject(projectId: string): Observable<ProcessDefinitionProjectMapping[]> {
    return this.http.get<ProcessDefinitionProjectMapping[]>(\`\${this.apiUrl}/by-project/\${projectId}\`);
  }
  getByProcessDefinition(processDefinitionId: string): Observable<ProcessDefinitionProjectMapping[]> {
    return this.http.get<ProcessDefinitionProjectMapping[]>(\`\${this.apiUrl}/by-process-definition/\${processDefinitionId}\`);
  }
  createMapping(mapping: Partial<ProcessDefinitionProjectMapping>): Observable<ProcessDefinitionProjectMapping> {
    return this.http.post<ProcessDefinitionProjectMapping>(this.apiUrl, mapping);
  }
  deleteMapping(processDefinitionId: string, projectId: string): Observable<void> {
    return this.http.delete<void>(\`\${this.apiUrl}/\${processDefinitionId}/\${projectId}\`);
  }
}
`,

    "src/app/core/services/process-record.service.ts": `
import { Injectable, inject } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { ProcessRecord } from '../models/process-record.model'; 
import { environment } from '../../../environments/environment'; 

@Injectable({ providedIn: 'root' }) 
export class ProcessRecordService { 
  private http = inject(HttpClient); 
  private apiUrl = \`\${environment.apiBaseUrl}/ProcessRecords\`; 

  getRecordByServiceItem(serviceItemId: string): Observable<ProcessRecord> { return this.http.get<ProcessRecord>(\`\${this.apiUrl}/by-service-item/\${serviceItemId}\`); } 
  createRecord(record: Partial<ProcessRecord>): Observable<ProcessRecord> { return this.http.post<ProcessRecord>(this.apiUrl, record); } 
  updateRecord(id: string, record: Partial<ProcessRecord>): Observable<ProcessRecord> { return this.http.put<ProcessRecord>(\`\${this.apiUrl}/\${id}\`, record); } 
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Services mapped successfully.');
