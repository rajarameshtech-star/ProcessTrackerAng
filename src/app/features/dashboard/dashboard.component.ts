
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { IconsModule } from '@progress/kendo-angular-icons';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/status-chip/status-chip.component';
import { PriorityChipComponent } from '../../shared/priority-chip/priority-chip.component';
import { LoadingStateComponent } from '../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ProjectService } from '../../core/services/project.service';
import { ApplicationService } from '../../core/services/application.service';
import { ServiceItemService } from '../../core/services/service-item.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GridModule, IconsModule, RouterModule, PageHeaderComponent, StatusChipComponent, PriorityChipComponent, LoadingStateComponent, EmptyStateComponent, DatePipe],
  template: `
    <app-page-header title="Good morning" subtitle="Process Tracking Workspace"></app-page-header>
    <app-loading-state *ngIf="loading"></app-loading-state>
    <div *ngIf="!loading && !error" class="dashboard-content">
      <div class="kpi-grid">
        <div class="kpi-card" routerLink="/projects"><div class="kpi-icon-wrapper project-kpi"><kendo-icon name="folder"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">Projects</span><span class="kpi-value">{{projectCount}}</span></div></div>
        <div class="kpi-card" routerLink="/applications"><div class="kpi-icon-wrapper app-kpi"><kendo-icon name="grid"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">Applications</span><span class="kpi-value">{{appCount}}</span></div></div>
        <div class="kpi-card" routerLink="/service-items"><div class="kpi-icon-wrapper service-kpi"><kendo-icon name="form"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">Service Items</span><span class="kpi-value">{{serviceItemCount}}</span></div></div>
        <div class="kpi-card" routerLink="/processes"><div class="kpi-icon-wrapper process-kpi"><kendo-icon name="list-unordered"></kendo-icon></div><div class="kpi-details"><span class="kpi-label">ProcessDefinitions</span><span class="kpi-value">--</span></div></div>
      </div>
      <h2 class="section-title">Recent Service Items</h2>
      <div *ngIf="recentItems.length > 0">
        <kendo-grid [data]="recentItems">
          <kendo-grid-column field="referenceNumber" title="Reference"></kendo-grid-column>
          <kendo-grid-column field="title" title="Title"></kendo-grid-column>
          <kendo-grid-column title="Status">
            <ng-template kendoGridCellTemplate let-dataItem><app-status-chip [status]="dataItem.status"></app-status-chip></ng-template>
          </kendo-grid-column>
          <kendo-grid-column title="Priority">
             <ng-template kendoGridCellTemplate let-dataItem><app-priority-chip [priority]="dataItem.priority"></app-priority-chip></ng-template>
          </kendo-grid-column>
          <kendo-grid-column field="assignedTo" title="Assigned"></kendo-grid-column>
        </kendo-grid>
      </div>
      <app-empty-state *ngIf="recentItems.length === 0" icon="file" title="No service items yet" description="Create a service item to start tracking process work." actionLabel="Create Service Item"></app-empty-state>
    </div>
  `,
  styles: [`
    .kpi-card { background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; align-items: center; cursor: pointer; }
    .kpi-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: white; }
    .project-kpi { background: #3b82f6; } .app-kpi { background: #8b5cf6; } .service-kpi { background: #10b981; } .process-kpi { background: #f59e0b; }
    .kpi-details { display: flex; flex-direction: column; }
    .kpi-label { font-size: 0.875rem; color: var(--muted-text-color); font-weight: 500; }
    .kpi-value { font-size: 1.5rem; font-weight: 600; color: var(--text-color); margin-top: 4px; }
  `]
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private appService = inject(ApplicationService);
  private svcItemService = inject(ServiceItemService);

  loading = true; error = false; projectCount = 0; appCount = 0; serviceItemCount = 0; recentItems: any[] = [];
  ngOnInit() {
    this.loading = true; this.error = false;
    forkJoin({
      projects: this.projectService.getProjects().pipe(catchError(() => of([]))),
      apps: this.appService.getApplications().pipe(catchError(() => of([]))),
      items: this.svcItemService.getServiceItems().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => { this.projectCount = data.projects.length; this.appCount = data.apps.length; this.serviceItemCount = data.items.length; this.recentItems = data.items.slice(0, 5); this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }
}
