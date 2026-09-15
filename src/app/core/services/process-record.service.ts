
import { Injectable, inject } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { ProcessRecord } from '../models/process-record.model'; 
import { environment } from '../../../environments/environment'; 

@Injectable({ providedIn: 'root' }) 
export class ProcessRecordService { 
  private http = inject(HttpClient); 
  private apiUrl = `${environment.apiBaseUrl}/ProcessRecords`; 

  getRecordByServiceItem(serviceItemId: string): Observable<ProcessRecord> { return this.http.get<ProcessRecord>(`${this.apiUrl}/by-service-item/${serviceItemId}`); } 
  createRecord(record: Partial<ProcessRecord>): Observable<ProcessRecord> { return this.http.post<ProcessRecord>(this.apiUrl, record); } 
  updateRecord(id: string, record: Partial<ProcessRecord>): Observable<ProcessRecord> { return this.http.put<ProcessRecord>(`${this.apiUrl}/${id}`, record); } 
}
