
import { Injectable } from '@angular/core';

export interface RecentItem {
  id: string;
  type: 'Project' | 'Application' | 'ServiceItem' | 'Process';
  title: string;
  url: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private key = 'pt_recently_viewed';

  add(item: Omit<RecentItem, 'timestamp'>) {
     const history = this.get();
     const filtered = history.filter(i => i.id !== item.id);
     filtered.unshift({ ...item, timestamp: Date.now() });
     if (filtered.length > 20) filtered.pop();
     localStorage.setItem(this.key, JSON.stringify(filtered));
  }

  get(): RecentItem[] {
     try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch { return []; }
  }
}
