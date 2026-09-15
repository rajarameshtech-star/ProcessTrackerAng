
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { ActivatedRoute } from '@angular/router';
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
      <button kendoButton themeColor="primary">New Application</button>
    </app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <div class="app-grid" *ngIf="!loading && applications.length > 0">
      <div class="item-card" *ngFor="let a of applications">
        <h4>{{a.name}}</h4><span class="muted-text">Project: {{a.projectId | slice:0:8}}</span>
        <p class="description-text">{{a.description || 'No description provided.'}}</p>
      </div>
    </div>
    <app-empty-state *ngIf="!loading && applications.length === 0" icon="grid" title="No applications found" actionLabel="Create Application"></app-empty-state>
  `,
  styles: [`
    .app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .item-card { border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; background: var(--surface-color); }
    .description-text { margin-top: 16px; color: var(--muted-text-color); font-size: 0.875rem; }
  `]
})
export class ApplicationListComponent implements OnInit {
  private appService = inject(ApplicationService); private route = inject(ActivatedRoute);
  applications: any[] = []; loading = true;
  ngOnInit() {
    this.route.queryParams.subscribe(p => { this.appService.getApplications(p['projectId'] || undefined).subscribe(d => { this.applications = d; this.loading = false; }); });
  }
}
