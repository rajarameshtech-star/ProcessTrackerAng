
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessDefinitionProjectMapping } from '../models/process-definition-project-mapping.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcessDefinitionProjectMappingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/ProcessDefinitionProjectMappings`;

  getByProject(projectId: string): Observable<ProcessDefinitionProjectMapping[]> {
    return this.http.get<ProcessDefinitionProjectMapping[]>(`${this.apiUrl}/by-project/${projectId}`);
  }
  getByProcessDefinition(processDefinitionId: string): Observable<ProcessDefinitionProjectMapping[]> {
    return this.http.get<ProcessDefinitionProjectMapping[]>(`${this.apiUrl}/by-process-definition/${processDefinitionId}`);
  }
  createMapping(mapping: Partial<ProcessDefinitionProjectMapping>): Observable<ProcessDefinitionProjectMapping> {
    return this.http.post<ProcessDefinitionProjectMapping>(this.apiUrl, mapping);
  }
  deleteMapping(processDefinitionId: string, projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${processDefinitionId}/${projectId}`);
  }
}
