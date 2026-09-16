import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProcessDefinition } from '../models/process-definition.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcessDefinitionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/ProcessDefinitions`;

  getProcessDefinitions(): Observable<ProcessDefinition[]> {
    return this.http.get<ProcessDefinition[]>(this.apiUrl);
  }
  getProcessDefinition(id: string): Observable<ProcessDefinition> {
    return this.http.get<ProcessDefinition>(`${this.apiUrl}/${id}`);
  }
  createProcessDefinition(pd: Partial<ProcessDefinition>): Observable<ProcessDefinition> { return this.http.post<ProcessDefinition>(this.apiUrl, pd); }
  updateProcessDefinition(id: string, pd: Partial<ProcessDefinition>): Observable<ProcessDefinition> { return this.http.put<ProcessDefinition>(`${this.apiUrl}/${id}`, pd); }
  deleteProcessDefinition(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
