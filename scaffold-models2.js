const fs = require('fs');
const path = require('path');

const files = {
    "src/app/core/models/process-field.model.ts": `export interface ProcessField {
  id: string;
  processDefinitionId: string;
  fieldName: string;
  label: string;
  fieldType: number;
  isRequired: boolean;
  sortOrder: number;
  placeholder?: string;
  defaultValue?: string;
  optionsJson?: string;
  minLength?: number;
  maxLength?: number;
  isActive: boolean;
}`,

    "src/app/core/models/process-definition-project-mapping.model.ts": `export interface ProcessDefinitionProjectMapping {
  id: string;
  processDefinitionId: string;
  projectId: string;
}`,

    "src/app/core/models/process-record.model.ts": `export interface ProcessRecord {
  id: string;
  serviceItemId: string;
  processDefinitionId: string;
  dataJson: string;
  createdDate?: string;
  modifiedDate?: string;
  createdBy?: string;
  modifiedBy?: string;
}`,

    "src/app/core/services/process-field.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { ProcessField } from '../models/process-field.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class ProcessFieldService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/ProcessFields\`;\n\n  getProcessFields(processDefinitionId?: string): Observable<ProcessField[]> {\n    const url = processDefinitionId ? \`\${this.apiUrl}?processDefinitionId=\${processDefinitionId}\` : this.apiUrl;\n    return this.http.get<ProcessField[]>(url);\n  }\n}`,

    "src/app/core/services/process-record.service.ts": `import { Injectable, inject } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { ProcessRecord } from '../models/process-record.model';\nimport { environment } from '../../../environments/environment';\n\n@Injectable({ providedIn: 'root' })\nexport class ProcessRecordService {\n  private http = inject(HttpClient);\n  private apiUrl = \`\${environment.apiBaseUrl}/ProcessRecords\`;\n\n  getRecordByServiceItem(serviceItemId: string): Observable<ProcessRecord> {\n    return this.http.get<ProcessRecord>(\`\${this.apiUrl}/by-service-item/\${serviceItemId}\`);\n  }\n  createRecord(record: Partial<ProcessRecord>): Observable<ProcessRecord> {\n    return this.http.post<ProcessRecord>(this.apiUrl, record);\n  }\n}`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.resolve(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Advanced models generated.');
