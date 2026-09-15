import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string) { alert('Success: ' + message); }
  error(message: string) { alert('Error: ' + message); }
}