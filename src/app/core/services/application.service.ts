import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application } from '../models/application.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Applications`;

  getApplications(projectId?: string): Observable<Application[]> {
    const url = projectId ? `${this.apiUrl}?projectId=${projectId}` : this.apiUrl;
    return this.http.get<Application[]>(url);
  }

  getApplication(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  createApplication(app: any): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, app);
  }

  updateApplication(id: string, app: any): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}`, app);
  }
}