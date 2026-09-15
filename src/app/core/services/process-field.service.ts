import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessField } from '../models/process-field.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcessFieldService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/ProcessFields`;

  getProcessFields(processDefinitionId?: string): Observable<ProcessField[]> {
    const url = processDefinitionId ? `${this.apiUrl}?processDefinitionId=${processDefinitionId}` : this.apiUrl;
    return this.http.get<ProcessField[]>(url);
  }
}