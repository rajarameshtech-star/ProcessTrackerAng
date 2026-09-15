import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessDefinition } from '../models/process-definition.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcessDefinitionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/ProcessDefinitions`;

  getProcessDefinitions(): Observable<ProcessDefinition[]> {
    return this.http.get<ProcessDefinition[]>(this.apiUrl);
  }
}