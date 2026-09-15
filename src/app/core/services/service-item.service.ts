import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceItem } from '../models/service-item.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiceItemService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/ServiceItems`;

  getServiceItems(applicationId?: string): Observable<ServiceItem[]> {
    const url = applicationId ? `${this.apiUrl}?applicationId=${applicationId}` : this.apiUrl;
    return this.http.get<ServiceItem[]>(url);
  }
  getServiceItem(id: string): Observable<ServiceItem> {
    return this.http.get<ServiceItem>(`${this.apiUrl}/${id}`);
  }
  createServiceItem(item: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(this.apiUrl, item);
  }
  updateServiceItem(id: string, item: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.put<ServiceItem>(`${this.apiUrl}/${id}`, item);
  }
  deleteServiceItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}