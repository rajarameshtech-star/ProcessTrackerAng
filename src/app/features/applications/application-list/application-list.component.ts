
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, PageHeaderComponent, LoadingStateComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Applications" subtitle="Manage specific applications within your projects.">
      <button kendoButton themeColor="primary" routerLink="/applications/create">New Application</button>
    </app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <div class="app-grid" *ngIf="!loading && applications.length > 0">
      <div class="item-card clickable-card" *ngFor="let a of applications" (click)="viewServiceItems(a.id)">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
           <div>
              <h4>{{a.name}}</h4>
              <span class="muted-text">Project ID: {{a.projectId || 'None'}}</span>
           </div>
           <button kendoButton fillMode="flat" themeColor="primary" icon="folder-open">Open</button>
        </div>
        <p class="description-text">{{a.description || 'No description provided.'}}</p>
      </div>
    </div>
    <app-empty-state *ngIf="!loading && applications.length === 0" icon="grid" title="No applications found" actionLabel="Create Application"></app-empty-state>
  `,
  styles: [`
    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; background: var(--surface-color); transition: all 0.2s; }
    .clickable-card { cursor: pointer; }
    .clickable-card:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .description-text { margin-top: 16px; color: var(--muted-text-color); font-size: 0.875rem; }
  `]
})
export class ApplicationListComponent implements OnInit {
  private appService = inject(ApplicationService); private route = inject(ActivatedRoute); private router = inject(Router);
  applications: any[] = []; loading = true;
  ngOnInit() {
    this.route.queryParams.subscribe(p => { this.appService.getApplications(p['projectId'] || undefined).subscribe(d => { this.applications = d; this.loading = false; }); });
  }

  viewServiceItems(appId: string) {
    this.router.navigate(['/service-items'], { queryParams: { applicationId: appId } });
  }
}
